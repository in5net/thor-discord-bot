import process from "node:process";

export const API_URL = "https://api.replicate.com/v1/predictions";

export interface Prediction {
	id: string;
	status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
	output: string[] | undefined;
	error: string | undefined;
}

export const wait = async (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms));

export class Model {
	constructor(
		readonly version: string,
		readonly input?: Record<string, number | string | boolean>
	) {}

	async *generate(
		input: Record<string, number | string | boolean | undefined>
	) {
		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				Authorization: `Token ${process.env.REPLICATE_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				version: this.version,
				input: {
					...this.input,
					...input,
				},
			}),
		});
		let prediction = (await response.json()) as Prediction;
		console.log("prediction:", prediction);
		await wait(1000);

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

			await wait(1000);
		}

		yield {
			output: prediction.output?.[i],
			outputs: prediction.output || [],
			status: prediction.status,
			error: prediction.error,
		};
	}
}

export async function getPrediction(id: string): Promise<Prediction> {
	const response = await fetch(`${API_URL}/${id}`, {
		headers: {
			Authorization: `Token ${process.env.REPLICATE_TOKEN}`,
		},
	});
	const prediction = (await response.json()) as Prediction;
	return prediction;
}
