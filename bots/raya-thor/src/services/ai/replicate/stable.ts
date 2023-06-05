import { Model } from "./shared";

export const model = new Model(
	"328bd9692d29d6781034e3acab8cf3fcb122161e6f5afb896a4ca9fd57090577"
);

export const generate = (
	prompt: string,
	{
		num_outputs,
		negative_prompt,
	}: { num_outputs: number; negative_prompt?: string }
) => model.generate({ prompt, negative_prompt, num_outputs });
