import { env } from "node:process";
import { sleep } from "@in5net/limitless";
import got from "got";

export interface Prediction {
	id: string;
	status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
	output: string[] | undefined;
	error: string | undefined;
}

const api = got.extend({
	prefixUrl: "https://api.replicate.com/v1/predictions",
	headers: {
		Authorization: `Token ${env.REPLICATE_TOKEN}`,
	},
});

export class Model {
	constructor(
		readonly version: string,
		readonly input?: Record<string, number | string | boolean>
	) {}

	async *generate(
		input: Record<string, number | string | boolean | undefined>
	) {
		let prediction = await api
			.post({
				json: {
					version: this.version,
					input: {
						...this.input,
						...input,
					},
				},
			})
			.json<Prediction>();
		console.log("prediction:", prediction);
		await sleep(1000);

		let i = 0;
		while (["starting", "processing"].includes(prediction.status)) {
			prediction = await getPrediction(prediction.id);
			console.log("prediction:", prediction);
			if (prediction.error) {
				yield { status: prediction.status, error: prediction.error };
				return;
			}

			const outputs = prediction.output || [];
			const output = outputs[i];
			if (output) {
				i++;
				yield {
					output,
					outputs,
					status: prediction.status,
					error: prediction.error,
				};
			}

			await sleep(1000);
		}

		yield {
			output: prediction.output?.[i],
			outputs: prediction.output || [],
			status: prediction.status,
			error: prediction.error,
		};
	}
}

export async function getPrediction(id: string) {
	const prediction = await api(id).json<Prediction>();
	return prediction;
}
