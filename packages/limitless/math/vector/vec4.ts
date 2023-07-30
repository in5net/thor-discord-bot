import { clamp, lerp } from "../funcs";

type First = number | [x: number, y: number, z: number, w: number] | Vector4;

export default class Vector4 {
	x!: number;
	y!: number;
	z!: number;
	w!: number;

	constructor(x: First = 0, y?: number, z?: number, w?: number) {
		this.set(x, y, z, w);
	}

	toString(): string {
		const { x, y, z, w } = this;
		return `vec4 <${x}, ${y}, ${z}, ${w}>`;
	}

	log(): this {
		console.log(this.toString());
		return this;
	}

	toArray(): [x: number, y: number, z: number, w: number] {
		return [this.x, this.y, this.z, this.w];
	}

	copy(): Vector4 {
		return vec4(+this.x, +this.y, +this.z, +this.w);
	}

	set(x: First, y?: number, z?: number, w?: number): this {
		if (x instanceof Vector4) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			this.w = x.w;
		} else if (Array.isArray(x)) {
			[this.x, this.y, this.z, this.w] = x;
		} else if (y === undefined) {
			this.x = x;
			this.y = x;
			this.z = x;
			this.w = x;
		} else {
			this.x = x;
			this.y = y || 0;
			this.z = z || 0;
			this.w = w || 0;
		}

		return this;
	}

	equals(x: First, y = 0, z = 0, w = 0): boolean {
		if (x instanceof Vector4)
			return (
				this.x === x.x && this.y === x.y && this.z === x.z && this.w === x.w
			);
		if (Array.isArray(x))
			return (
				this.x === x[0] && this.y === x[1] && this.z === x[2] && this.w === x[3]
			);

		return this.x === x && this.y === y && this.z === z && this.w === w;
	}

	add(x: First, y?: number, z?: number, w?: number): this {
		if (x instanceof Vector4) {
			this.x += x.x;
			this.y += x.y;
			this.z += x.z;
			this.w += x.w;
		} else if (Array.isArray(x)) {
			this.x += x[0];
			this.y += x[1];
			this.z += x[2];
			this.w += x[3];
		} else if (y === undefined) {
			this.x += x;
			this.y += x;
			this.z += x;
			this.w += x;
		} else {
			this.x += x;
			this.y += y || 0;
			this.z += z || 0;
			this.w += w || 0;
		}

		return this;
	}

	static add(
		v1: Vector4,
		x: First,
		y?: number,
		z?: number,
		w?: number,
	): Vector4 {
		return v1.copy().add(x, y, z, w);
	}

	sub(x: First, y?: number, z?: number, w?: number): this {
		if (x instanceof Vector4) {
			this.x -= x.x;
			this.y -= x.y;
			this.z -= x.z;
			this.w -= x.w;
		} else if (Array.isArray(x)) {
			this.x -= x[0];
			this.y -= x[1];
			this.z -= x[2];
			this.w -= x[3];
		} else if (y === undefined) {
			this.x -= x;
			this.y -= x;
			this.z -= x;
			this.w -= x;
		} else {
			this.x -= x;
			this.y -= y || 0;
			this.z -= z || 0;
			this.w -= w || 0;
		}

		return this;
	}

	static sub(
		v1: Vector4,
		x: First,
		y?: number,
		z?: number,
		w?: number,
	): Vector4 {
		return v1.copy().sub(x, y, z, w);
	}

	mult(x: First, y?: number, z?: number, w?: number): this {
		if (x instanceof Vector4) {
			this.x *= x.x;
			this.y *= x.y;
			this.z *= x.z;
			this.w *= x.w;
		} else if (Array.isArray(x)) {
			this.x *= x[0];
			this.y *= x[1];
			this.z *= x[2];
			this.w *= x[3];
		} else if (y === undefined) {
			this.x *= x;
			this.y *= x;
			this.z *= x;
			this.w *= x;
		} else {
			this.x *= x;
			this.y *= y ?? 1;
			this.z *= z ?? 1;
			this.w *= w ?? 1;
		}

		return this;
	}

	static mult(
		v1: Vector4,
		x: First,
		y?: number,
		z?: number,
		w?: number,
	): Vector4 {
		return v1.copy().mult(x, y, z, w);
	}

	div(x: First, y?: number, z?: number, w?: number): this {
		if (x instanceof Vector4) {
			this.x /= x.x;
			this.y /= x.y;
			this.z /= x.z;
			this.w /= x.w;
		} else if (Array.isArray(x)) {
			this.x /= x[0];
			this.y /= x[1];
			this.z /= x[2];
			this.w /= x[3];
		} else if (y === undefined) {
			this.x /= x;
			this.y /= x;
			this.z /= x;
			this.w /= x;
		} else {
			this.x /= x;
			this.y /= y ?? 1;
			this.z /= z ?? 1;
			this.w /= w ?? 1;
		}

		return this;
	}

	static div(
		v1: Vector4,
		x: First,
		y?: number,
		z?: number,
		w?: number,
	): Vector4 {
		return v1.copy().div(x, y, z, w);
	}

	limit(max: number): this {
		const maxSq = max * max;
		const magSq = this.magSq();
		if (magSq > maxSq) this.setMag(max);
		return this;
	}

	normalize(): this {
		const mag = this.mag();
		if (mag !== 0) this.div(mag);
		return this;
	}

	static normalize(v: Vector4): Vector4 {
		return v.copy().normalize();
	}

	mag(): number {
		return Math.sqrt(this.magSq());
	}

	setMag(n: number): this {
		return this.normalize().mult(n);
	}

	magSq(): number {
		const { x, y, z, w } = this;
		return x ** 2 + y ** 2 + z ** 2 + w ** 2;
	}

	dist(v: this): number {
		return Math.sqrt(this.distSq(v));
	}

	distSq(v: Vector4): number {
		return Vector4.sub(v, this).magSq();
	}

	dot(v: Vector4): number {
		const { x, y, z, w } = this;
		return x * v.x + y * v.y + z * v.z + w * v.w;
	}

	lerp(v: Vector4, norm: number): this {
		const { x, y, z, w } = this;
		this.x = lerp(x, v.x, norm);
		this.y = lerp(y, v.y, norm);
		this.z = lerp(z, v.z, norm);
		this.w = lerp(w, v.w, norm);
		return this;
	}

	static lerp(v1: Vector4, v2: Vector4, norm: number): Vector4 {
		return v1.copy().lerp(v2, norm);
	}

	clamp(min: Vector4, max: Vector4): this {
		const { x, y, z, w } = this;
		this.x = clamp(x, min.x, max.x);
		this.y = clamp(y, min.y, max.y);
		this.z = clamp(z, min.z, max.z);
		this.w = clamp(w, min.w, max.w);
		return this;
	}

	static clamp(v: Vector4, min: Vector4, max: Vector4): Vector4 {
		return v.copy().clamp(min, max);
	}

	reflect(normal: Vector4): this {
		return this.sub(Vector4.mult(normal, 2 * this.dot(normal)));
	}
}

export function vec4(x?: First, y?: number, z?: number, w?: number): Vector4 {
	return new Vector4(x, y, z, w);
}
