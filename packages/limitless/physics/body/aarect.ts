import { vec2, type Vector2 } from "../../math";
import AABB from "./aabb";
import Body from "./body";
import ConvexPolygon from "./convex-polygon";
import Rect from "./rect";

export default class AARect extends Body {
	size: Vector2;
	normals = [vec2(1, 0), vec2(0, 1)];
	rotationalInertia = Number.POSITIVE_INFINITY;

	constructor(
		x: number,
		y: number,
		width: number,
		height = width,
		mass?: number,
	) {
		super(x, y, mass);
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

	get aabb(): AABB {
		const { x, y, width, height } = this;
		return new AABB(x - width / 2, y - height / 2, width, height);
	}

	collides(body: Body, resolve = false): boolean {
		if (body instanceof AARect) return this.aabb.intersects(body.aabb);
		if (body instanceof ConvexPolygon) {
			const rect = new Rect(this.x, this.y, this.width, this.height);
			return body.collides(rect, resolve);
		}

		return body.collides(this, resolve);
	}
}
