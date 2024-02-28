import { replicate } from "$lib/ai/replicate";
import { getBits, subtractBits } from "$lib/ai/shared";
import db, { eq } from "database/drizzle";
import { users } from "database/drizzle/schema";
import command from "discord/commands/slash";
import { z } from "zod";

const NAME = "Stable Video Diffusion";
const BITS_PRICE = 7;

export default command(
	{
		desc: `Animate an image with ${NAME} (costs ${BITS_PRICE}).`,
		options: {
            input_image: {
                type:'attachment',
                desc: 'The image to animate'
            },
            frames: {
                type:'choice',
                desc:'Number of frames to generate',
                choices:[
                    14,
                    25
                ],
                default:14
            },
            fps:{
                type:'int',
                desc:'Frames per second',
                min:5,
                max:30,
                default:6
            }
		},
	},
	async (i, { input_image, frames, fps }) => {
		if (i.user.bot) return i.reply(`Bots cannot use ${NAME}`);

		const user = await db.query.users.findFirst({
			columns: {
				admin: true,
			},
			where: eq(users.id, i.user.id),
		});
		if (!user?.admin) {
			const bits = await getBits(i.user.id);
			if (bits < BITS_PRICE)
				return i.reply(
					`You need ${BITS_PRICE - bits} more bits to use ${NAME}`,
				);
		}

		await i.reply(`Running ${NAME}...`);

        const outputs = await replicate.run(
          "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
          {
            input: {
              input_image: input_image.url,
              video_length: frames===14?"14_frames_with_svd":"25_frames_with_svd_xt",
              frames_per_second: fps,
            }
          }
        );
		const url = z.string().parse(outputs);

		await i.editReply({
			content: `${input_image.url} ${url}`,
		});

		return subtractBits(i.user.id, BITS_PRICE);
	},
);
