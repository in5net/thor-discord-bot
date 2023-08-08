import Vector2 from "../../math/vector/vec2";
import AABB from "./aabb";
import Body from "./body";
import type ConvexPolygon from "./convex-polygon";

export default class Circle extends Body {
	constructor(
		x: number,
		y: number,
		public radius: number,
		mass?: number,
	) {
		super(x, y, mass);
	}

	get rotationalInertia(): number {
		return (this.mass * this.radius ** 2) / 2;
	}

	get aabb(): AABB {
		const { x, y, radius } = this;
		return new AABB(x - radius, y - radius, radius * 2);
	}

	collides(o: Circle | ConvexPolygon, resolve = false): boolean {
		const { position, radius } = this;
		if (o instanceof Circle) {
			const r = radius + o.radius;
			const colliding = position.distSq(o.position) < r ** 2;
			if (colliding) {
				const d = Vector2.sub(o.position, position);
				if (resolve)
					this.resolveCollision(o, {
						normal: Vector2.normalize(d),
						dist: r - d.mag(),
					});
				return true;
			}

			return false;
		}

		return o.collides(this);
	}

	project(_axis: Vector2): [min: number, max: number] {
		const { radius } = this;
		return [-radius, radius];
	}
}
