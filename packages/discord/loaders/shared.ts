import fg from "fast-glob";

export const noTestGlob = async (pattern: string) =>
	fg.async(pattern, {
		ignore: ["**/*.test.ts"],
	});
