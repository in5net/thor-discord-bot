import { Model } from "./shared";

export const model = new Model(
	"ba8b1f407cd6418fa589ca73e5c623c081600ecff19f7fc3249fa536d762bb29",
	{
		width: 512,
		height: 512,
		steps: 20,
		guidance_scale: 10,
		hires: true,
	}
);

export const generate = (
	prompt: string,
	{ neg_prompt }: { neg_prompt?: string }
) => model.generate({ prompt, neg_prompt });
