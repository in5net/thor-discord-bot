import type Body from "../body";
import { AABB } from "../body";

export default class QuadTree extends AABB {
	bodies: Body[] = [];

	divided = false;
	nw?: QuadTree;
	ne?: QuadTree;
	sw?: QuadTree;
	se?: QuadTree;

	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		public capacity = 4
	) {
		super(x, y, width, height);
	}

	add(body: Body): boolean {
		if (!this.intersects(body.aabb)) return false;

		const { bodies, capacity } = this;
		if (bodies.length < capacity) bodies.push(body);
		else {
			if (!this.divided) this.subdivide();

			let added = false;
			if (this.nw?.add(body)) added = true;
			if (this.ne?.add(body)) added = true;
			if (this.sw?.add(body)) added = true;
			if (this.se?.add(body)) added = true;
			return added;
		}

		return false;
	}

	private subdivide() {
		const { x, y, width, height, capacity } = this;

		this.nw = new QuadTree(x, y, width / 2, height / 2, capacity);
		this.ne = new QuadTree(x + width / 2, y, width / 2, height / 2, capacity);
		this.sw = new QuadTree(x, y + height / 2, width / 2, height / 2, capacity);
		this.se = new QuadTree(
			x + width / 2,
			y + height / 2,
			width / 2,
			height / 2,
			capacity
		);

		this.divided = true;
	}

	query(bounds: AABB, found = new Set<Body>()): Set<Body> {
		if (bounds.intersects(this)) {
			for (const body of this.bodies) {
				if (bounds.intersects(body.aabb)) found.add(body);
			}

			if (this.divided) {
				this.nw?.query(bounds, found);
				this.ne?.query(bounds, found);
				this.sw?.query(bounds, found);
				this.se?.query(bounds, found);
			}
		}

		return found;
	}

	reset(): void {
		this.bodies = [];
		this.divided = false;
		this.nw = undefined;
		this.ne = undefined;
		this.sw = undefined;
		this.se = undefined;
	}
}
