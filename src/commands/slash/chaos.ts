import { Vec2, vec2 } from "@in5net/std/math";
import { choice } from "@in5net/std/random";
import { AttachmentBuilder } from "discord.js";
import command from "$lib/discord/commands/slash";

const size = 1024;
const r = size / 2;
const itersPerFrame = 1000;
const frames = 1000;

export default command(
  {
    desc: "Creates chaos",
    options: {
      num_points: {
        type: "int",
        desc: "How many points to run with",
        min: 2,
        max: 16,
        default: 3,
      },
      stride: {
        type: "float",
        desc: "How far to move towards a point",
        min: 0,
        max: 1,
        default: 0.5,
      },
    },
  },
  async (i, { num_points, stride }) => {
    await i.deferReply();
    const { createCanvas } = await import("@napi-rs/canvas");
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    const points: Vec2[] = [];
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / num_points) {
      const point = vec2(r, 0);
      point.setAngle(a);
      point.add(r);
      points.push(point);
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    const current = Vec2.random(size);
    for (let i = 0; i < frames; i++) {
      for (let index = 0; index < itersPerFrame; index++) {
        const pt = choice(points)!;

        current.lerp(pt, stride);

        ctx.fillStyle = `hsl(${index * (360 / points.length)},100%,50%)`;
        ctx.fillRect(current.x, current.y, 1, 1);
      }

      await new Promise(resolve => setImmediate(resolve));
    }

    return i.editReply({
      files: [new AttachmentBuilder(canvas.toBuffer("image/png"))],
    });
  },
);
