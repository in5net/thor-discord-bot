import { Model } from "./shared";

export const model = new Model(
	"42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061"
);

export const generate = (
	prompt: string,
	{
		num_outputs,
		negative_prompt,
	}: { num_outputs: number; negative_prompt?: string }
) => model.generate({ prompt, negative_prompt, num_outputs });
