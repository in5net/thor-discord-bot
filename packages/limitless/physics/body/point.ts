import AABB from "./aabb";
import Body from "./body";
import type Circle from "./circle";

export default class Point extends Body {
	rotationalInertia = Number.POSITIVE_INFINITY;

	get aabb(): AABB {
		return new AABB(this.x, this.y, 0, 0);
	}

	collides(o: Point | Circle): boolean {
		if (o instanceof Point) return false;
		const { position } = this;
		return position.distSq(o.position) < o.radius;
	}
}
