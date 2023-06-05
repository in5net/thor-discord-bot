import process from "node:process";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const url = "https://labs.openai.com/api/labs/tasks";

type TaskType = "text2im" | "variations";
interface Task<T extends TaskType = TaskType> {
	object: "task";
	id: `task-${string}`;
	created: number;
	task_type: T;
	status: "pending" | "succeeded" | "rejected";
	status_information: {
		type?: "error";
		code?: "task_failed_text_safety_system";
		message?: string;
	};
	prompt_id: `prompt-${string}`;
	prompt: {
		id: `prompt-${string}`;
		object: "prompt";
		created: number;
		prompt_type: T extends "text2img"
			? "CaptionPrompt"
			: "CaptionlessImagePrompt";
		prompt: T extends "text2img"
			? {
					caption: string;
			  }
			: {
					image_path: string;
			  };
		parent_generation_id: undefined;
	};
	generations?: {
		object: "list";
		data: Array<{
			id: `generation-${string}`;
			object: "generation";
			created: number;
			generation_type: "ImageGeneration";
			generation: {
				image_path: string; // Image URL
			};
			task_id: `task-${string}`;
			prompt_id: `prompt-${string}`;
			is_public: boolean;
		}>;
	};
}

export async function generate(prompt: string) {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.DALLE2_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			task_type: "text2im",
			prompt: {
				caption: prompt,
				batch_size: 4,
			},
		}),
	});
	const task = (await response.json()) as Task;
	return startTask(task);
}

export async function variations(url: string) {
	const image = await loadImage(url);
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);
	const dataURL = await canvas.toDataURLAsync();
	const parts = dataURL.split(",");
	const base64 = parts.pop();

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.DALLE2_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			task_type: "variations",
			prompt: {
				image: base64,
				batch_size: 3,
			},
		}),
	});
	const task = (await response.json()) as Task;
	return startTask(task);
}

export async function startTask(task: Task) {
	console.log("task:", task);
	const finishedTask = await new Promise<Task>(resolve => {
		const interval = setInterval(async () => {
			const nextTask = await getTask(task.id);
			console.log("nextTask:", nextTask);
			if (nextTask.status !== "pending") {
				clearInterval(interval);
				resolve(nextTask);
			}
		}, 3000);
	});
	return {
		files: (finishedTask.generations?.data || []).map(({ id, generation }) => ({
			id: id.replace("generation-", ""),
			url: generation.image_path,
		})),
		error: finishedTask.status_information.code,
	};
}

async function getTask(id: string): Promise<Task> {
	const response = await fetch(`${url}/${id}`, {
		headers: {
			Authorization: `Bearer ${process.env.DALLE2_TOKEN}`,
		},
	});
	const task = (await response.json()) as Task;
	return task;
}
