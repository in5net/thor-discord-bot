import { env } from "node:process";
import { AttachmentBuilder } from "discord.js";
import { mat4 } from "gl-matrix";
import { nanoid } from "nanoid";
import { filesBucket } from "storage";
import command from "discord/commands/slash";
import GL from "$services/gl";

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

		function render() {
			gl.background(0, 0, 0, 1);

			mat4.identity(modelViewMatrix);
			mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
			mat4.rotateX(modelViewMatrix, modelViewMatrix, angle);
			mat4.rotateY(modelViewMatrix, modelViewMatrix, angle);
			mat4.rotateZ(modelViewMatrix, modelViewMatrix, angle);
			gl.uniform("modelViewMatrix", "mat4", modelViewMatrix);
		}

		const stream = gif
			? await gl.gifStream(fps / speed, {
					fps,
					render(t) {
						angle = Math.PI * 2 * t * speed;
						render();
					},
			  })
			: await gl.mp4Stream(
					fps / speed,
					new URL("../../../assets/cube/cube.ogg", import.meta.url).pathname,
					{
						fps,
						render(t) {
							angle = Math.PI * 2 * t * speed;
							render();
						},
					},
			  );

		await i.editReply("Uploading cube...");

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

			return i.editReply({
				files: [new AttachmentBuilder(fileURL, { name: `cube.${extension}` })],
			});
		});
	},
);
