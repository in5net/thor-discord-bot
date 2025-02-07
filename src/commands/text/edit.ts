import command from "$lib/discord/commands/text";
import GL from "$lib/gl";
import { renderProgressBar } from "$lib/progress";
import { easeOutElastic, easeOutQuart, linear } from "@in5net/std/easing";
import { pipe } from "@in5net/std/fn";
import { map, pick } from "@in5net/std/iter";
import * as math from "@in5net/std/math";
import { sum } from "@in5net/std/stats";
import { type Message, AttachmentBuilder } from "discord.js";
import { mat4 } from "gl-matrix";
import { nanoid } from "nanoid";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { env } from "node:process";
import { pipeline } from "node:stream/promises";

const fps = 24;

export default command(
  {
    desc: "Makes a goofy edit",
    args: {
      image: {
        type: "image",
        desc: "The cube texture",
        optional: true,
      },
    },
  },
  async ({ message, args: { image } }) => {
    const url =
      image?.url ||
      message.author.displayAvatarURL({ extension: "png", size: 64 });

    const gl = new GL(180, 180, true);
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

    await gl.createTexture(url, { isGif: url.endsWith(".gif") });

    const projectionMatrix = mat4.perspective(
      mat4.create(),
      Math.PI / 2,
      1,
      0.1,
      1000,
    );
    gl.uniform("projectionMatrix", "mat4", projectionMatrix);
    const modelViewMatrix = mat4.create();

    const animations: Array<{
      time: number;
      ease?: (t: number) => number;
      render?: (t: number) => Promise<void>;
    }> = [
      {
        time: 0.6,
        ease: easeOutQuart,
        render: async t => {
          const a = math.map(t, 0, 1, Math.PI / 2, 0);
          mat4.rotateY(modelViewMatrix, modelViewMatrix, a);
          mat4.rotateX(modelViewMatrix, modelViewMatrix, a / 2);
        },
      },
      { time: 0.3 },
      {
        time: 0.6,
        ease: easeOutElastic,
        render: async t => {
          const z = math.map(t, 0, 1, -3, 0);
          mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, z]);
        },
      },
      { time: 0.3 },
      {
        time: 0.6,
        ease: easeOutQuart,
        render: async t => {
          const a = math.map(t, 0, 1, Math.PI / 2, 0);
          mat4.rotateX(modelViewMatrix, modelViewMatrix, a);
          mat4.rotateZ(modelViewMatrix, modelViewMatrix, a / 2);
        },
      },
      { time: 0.3 },
      {
        time: 0.6,
        ease: easeOutQuart,
        render: async t => {
          const a = math.map(t, 0, 1, Math.PI / 2, 0);
          mat4.rotateZ(modelViewMatrix, modelViewMatrix, a);
          mat4.rotateX(modelViewMatrix, modelViewMatrix, a / 2);
        },
      },
      { time: 0.3 },
      {
        time: 0.6,
        ease: easeOutElastic,
        render: async t => {
          const x = math.map(t, 0, 1, -2, 0);
          const y = math.map(t, 0, 1, 1, 0);
          mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
        },
      },
      { time: 0.3 },
      {
        time: 0.6,
        ease: easeOutQuart,
        render: async t => {
          const a = math.map(t, 0, 1, Math.PI / 2, 0);
          mat4.rotateX(modelViewMatrix, modelViewMatrix, a);
          mat4.rotateY(modelViewMatrix, modelViewMatrix, a / 2);
        },
      },
      { time: 0.3 },
    ];

    const renderStart = performance.now();
    const frames = pipe(
      animations,
      pick("time"),
      map(t => Math.ceil(t * fps)),
      sum,
    );
    let frame = 0;
    let editPromise: Promise<Message<boolean>> | undefined;
    const progressHandle = setInterval(updateProgress, 1500);
    const reply = await message.channel.send("Rendering...");
    function updateProgress() {
      editPromise = reply.edit(
        `Rendering: \`${renderProgressBar({
          current: frame,
          total: frames,
        })}\``,
      );
    }

    const animationsIter = animations.values();
    let animation = animationsIter.next();
    let animStart = 0;
    const stream = await gl.gifStream(frames, {
      fps,
      async render(t) {
        gl.background(0, 0, 0, 1);

        mat4.identity(modelViewMatrix);
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -2]);
        if (!animation.done) {
          const { time, ease = linear, render } = animation.value;
          const s = ease((t - animStart) / time);
          await render?.(s);
          if (t > animStart + time + 1 / fps) {
            animStart += Math.ceil(time * fps) / fps;
            animation = animationsIter.next();
          }
        }
        gl.uniform("modelViewMatrix", "mat4", modelViewMatrix);
        frame++;
      },
    });
    const streamStart = performance.now();
    clearInterval(progressHandle);
    await editPromise;

    const extension = "gif";
    const subPath = `edits/${nanoid()}.${extension}`;
    const filePath = path.join(env.FILES_PATH, subPath);
    await pipeline(stream, createWriteStream(filePath));

    const fileURL = `https://${env.FILES_DOMAIN}/${subPath}`;
    console.log(`Uploaded ${fileURL}`);
    const end = performance.now();

    return reply.edit({
      content: `Render time: ${Math.round(streamStart - renderStart)}ms
Upload time: ${Math.round(end - streamStart)}ms`,
      files: [new AttachmentBuilder(fileURL, { name: `cube.${extension}` })],
    });
  },
);
