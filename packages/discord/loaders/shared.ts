import { async } from "fast-glob";

export const noTestGlob = async (pattern: string) =>
	async(pattern, {
		ignore: ["**/*.test.ts"],
	});
