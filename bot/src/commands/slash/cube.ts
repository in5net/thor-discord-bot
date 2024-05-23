import GL from "$lib/gl";
import { sleep } from "@in5net/std/async";
import { AttachmentBuilder, Message } from "discord.js";
import command from "discord/commands/slash";
import { mat4 } from "gl-matrix";
import { nanoid } from "nanoid";
import { env } from "node:process";
import { filesBucket } from "storage";

const size = 512;

export default command(
	{
		desc: "Makes your profile or attachment spin on a cube",
		options: {
			image: {
				type: "attachment",
				desc: "The image to pixel sort",
				optional: true,
			},
			fps: {
				type: "int",
				desc: "The frames per second to render the cube",
				min: 1,
				max: 120,
				default: 60,
			},
			speed: {
				type: "float",
				desc: "The speed of the cube (rotations per second)",
				min: 0.25,
				max: 4,
				default: 0.5,
			},
			gif: {
				type: "bool",
				desc: "Whether to make a gif",
				default: false,
			},
		},
	},
	async (i, { image, fps, speed, gif }) => {
		await i.deferReply();
		const url =
			image?.url || i.user.displayAvatarURL({ extension: "png", size: 512 });

		const gl = new GL(size, size, true);
		await gl.createProgramFromPaths(
			new URL("../../../assets/cube/shader.vert", import.meta.url).pathname,
			new URL("../../../assets/cube/shader.frag", import.meta.url).pathname,
		);

		gl.createVertexBuffer(GL.unitCubeTextured.vertexData);
		gl.createIndexBuffer(GL.unitCubeTextured.indexData);
		gl.attributes([
			{ name: "position", type: "vec3" },
			{ name: "uv", type: "vec2" },
		]);

		await gl.createTexture(url, { isGif: image?.contentType === "image/gif" });

		const projectionMatrix = mat4.perspective(
			mat4.create(),
			Math.PI / 3,
			1,
			0.1,
			1000,
		);
		gl.uniform("projectionMatrix", "mat4", projectionMatrix);
		const modelViewMatrix = mat4.create();

		let angle = 0;

		async function render() {
			gl.background(0, 0, 0, 1);

			mat4.identity(modelViewMatrix);
			mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
			mat4.rotateX(modelViewMatrix, modelViewMatrix, angle);
			mat4.rotateY(modelViewMatrix, modelViewMatrix, angle);
			mat4.rotateZ(modelViewMatrix, modelViewMatrix, angle);
			gl.uniform("modelViewMatrix", "mat4", modelViewMatrix);
			frame++;
			await sleep();
		}

		const renderStart = performance.now();
		const frames = fps / speed;
		let frame = 0;
		const bars = 20;
		let editPromise: Promise<Message<boolean>> | undefined;
		const progressHandle = setInterval(updateProgress, 1500);
		function updateProgress() {
			const progress = frame / frames;
			const filledBars = Math.floor(progress * bars);
			const barString = "=".repeat(filledBars) + " ".repeat(bars - filledBars);
			editPromise = i.editReply(
				`Rendering cube: [${barString}] ${frame.toString().padStart(2, " ")}/${frames.toString().padStart(2, " ")} ${Math.round(
					progress * 100,
				)
					.toString()
					.padStart(3, " ")}%`,
			);
		}

		const stream =
			gif ?
				await gl.gifStream(frames, {
					fps,
					render(t) {
						angle = Math.PI * 2 * t * speed;
						return render();
					},
				})
			:	await gl.mp4Stream(
					frames,
					new URL("../../../assets/cube/cube.ogg", import.meta.url).pathname,
					{
						fps,
						render(t) {
							angle = Math.PI * 2 * t * speed;
							return render();
						},
					},
				);
		const streamStart = performance.now();
		clearInterval(progressHandle);
		await editPromise;

		const extension = gif ? "gif" : "mp4";
		const path = `cubes/${nanoid()}.${extension}`;
		const uploadStream = filesBucket.file(path).createWriteStream({
			gzip: true,
			metadata: {
				metadata: {
					uid: i.user.id,
				},
			},
		});
		stream.pipe(uploadStream);
		uploadStream.once("close", async () => {
			const fileURL = `https://${env.FILES_DOMAIN}/${path}`;
			console.log(`Uploaded ${fileURL}`);
			const end = performance.now();

			return i.editReply({
				content: `Render time: ${Math.round(streamStart - renderStart)}ms
Upload time: ${Math.round(end - streamStart)}ms`,
				files: [new AttachmentBuilder(fileURL, { name: `cube.${extension}` })],
			});
		});
	},
);
