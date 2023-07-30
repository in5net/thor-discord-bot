import { AABB } from "../body";
import type Body from "../body";
import { toFloor } from "../../util/number";

export default class SpatialHashGrid extends AABB {
	bodies: Body[] = [];
	grid: Body[][][] = [];

	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		readonly divisionSize = 100,
	) {
		super(x, y, width, height);
		this.reset();
	}

	private getIntersectingIndices(
		aabb: AABB,
	): [min: [i: number, j: number], max: [i: number, j: number]] {
		const { divisionSize } = this;

		const x1 = aabb.x - this.x;
		const y1 = aabb.y - this.y;
		const mini = toFloor(x1, divisionSize) / divisionSize;
		const minj = toFloor(y1, divisionSize) / divisionSize;

		const x2 = x1 + aabb.width;
		const y2 = y1 + aabb.height;
		const maxi = toFloor(x2, divisionSize) / divisionSize;
		const maxj = toFloor(y2, divisionSize) / divisionSize;

		return [
			[Math.max(mini, 0), Math.max(minj, 0)],
			[
				Math.min(maxi, this.grid.length - 1),
				Math.min(maxj, this.grid[0]!.length - 1),
			],
		];
	}

	add(body: Body): boolean {
		if (!this.intersects(body.aabb)) return false;

		const [[mini, minj], [maxi, maxj]] = this.getIntersectingIndices(body.aabb);
		for (let i = mini; i <= maxi; i++) {
			for (let j = minj; j <= maxj; j++) {
				const cell = this.grid[i]![j]!;
				cell.push(body);
			}
		}

		return true;
	}

	query(bounds: AABB, found = new Set<Body>()): Set<Body> {
		if (bounds.intersects(this)) {
			const [[mini, minj], [maxi, maxj]] = this.getIntersectingIndices(bounds);
			for (let i = mini; i <= maxi; i++) {
				for (let j = minj; j <= maxj; j++) {
					const cell = this.grid[i]![j]!;
					for (const body of cell) found.add(body);
				}
			}
		}

		return found;
	}

	reset(): void {
		this.bodies = [];
		for (let i = 0; i < this.width / this.divisionSize; i++) {
			this.grid[i] = [];
			for (let j = 0; j < this.height / this.divisionSize; j++) {
				this.grid[i]![j] = [];
			}
		}
	}
}
