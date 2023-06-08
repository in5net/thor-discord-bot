import { AABB } from "../body";
import type Body from "../body";

export default class Naive extends AABB {
	bodies: Body[] = [];

	add(body: Body): boolean {
		if (!this.intersects(body.aabb)) return false;
		this.bodies.push(body);
		return true;
	}

	query(bounds: AABB, found = new Set<Body>()): Set<Body> {
		if (bounds.intersects(this)) {
			for (const body of this.bodies) found.add(body);
		}

		return found;
	}

	reset(): void {
		this.bodies = [];
	}
}
