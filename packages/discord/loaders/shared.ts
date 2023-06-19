import { glob } from "glob";

export async function noTestGlob(pattern: string) {
	return glob(pattern, {
		ignore: {
			ignored: p => p.name.endsWith(".test.ts"),
		},
	});
}
