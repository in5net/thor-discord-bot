export default class AABB {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height = width
	) {}

	intersects(o: AABB): boolean {
		const { x, y, width, height } = this;
		const { x: ox, y: oy, width: owidth, height: oheight } = o;
		if (x + width <= ox || x >= ox + owidth) return false;
		if (y + height <= oy || y >= oy + oheight) return false;
		return true;
	}
}
