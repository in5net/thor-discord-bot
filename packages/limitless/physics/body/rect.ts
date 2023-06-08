import { vec2, type Vector2 } from "../../math/vector";
import ConvexPolygon from "./convex-polygon";

export default class Rect extends ConvexPolygon {
	size: Vector2;

	constructor(
		x: number,
		y: number,
		width: number,
		height = width,
		mass?: number
	) {
		const vertices = [
			vec2(-width / 2, +height / 2),
			vec2(-width / 2, -height / 2),
			vec2(+width / 2, -height / 2),
			vec2(+width / 2, +height / 2),
		];
		super(x, y, vertices, mass);
		this.size = vec2(width, height);
	}

	get width(): number {
		return this.size.x;
	}

	set width(width: number) {
		this.size.x = width;
	}

	get height(): number {
		return this.size.y;
	}

	set height(height: number) {
		this.size.y = height;
	}

	override get rotationalInertia(): number {
		return (this.mass * this.size.magSq()) / 12;
	}

	override get normals(): Vector2[] {
		return [vec2(1, 0), vec2(0, 1)].map(v => v.setAngle(this.angle));
	}
}
