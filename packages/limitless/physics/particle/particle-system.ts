import { vec2, type Vector2 } from "../../math/vector";
import { unorderedRemove } from "../../util/array";
import type Particle from "./particle";

export default class ParticleSystem<T extends Particle = Particle> {
	constructor(public particles: T[] = []) {}

	get velocity() {
		const { particles } = this;
		const sum = particles.reduce((sum, p) => sum.add(p.velocity), vec2());
		return sum.div(particles.length);
	}

	set velocity(v: Vector2) {
		for (const p of this.particles) p.velocity.add(v);
	}

	add(p: T | ParticleSystem<T>): void {
		if (p instanceof ParticleSystem)
			for (const particle of p.particles) {
				this.add(particle);
			}
		else this.particles.push(p);
	}

	[Symbol.iterator]() {
		return this.particles.values();
	}

	entries() {
		return this.particles.entries();
	}

	update(dt: number): void {
		const { particles } = this;
		for (let i = 0; i < particles.length; i++) {
			const p = particles[i]!;
			p.update(dt);
			if (p.life <= 0) unorderedRemove(particles, i--);
		}
	}
}
