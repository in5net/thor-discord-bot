import type Complex from ".";

export default function mandelbrot(
	c: Complex,
	iterations = 100,
	escapeRadius = 2
): number {
	const z = c.copy();
	let i = 1;
	while (i <= iterations && z.magSq() < escapeRadius ** 2) {
		z.sq().add(c);
		i++;
	}

	return i;
}
