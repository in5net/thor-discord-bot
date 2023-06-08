import { Point } from "../body";

export default class Particle extends Point {
	constructor(x: number, y: number, public life = 4) {
		super(x, y);
	}

	override update(dt: number): this {
		this.life -= dt;
		return super.update(dt);
	}
}
