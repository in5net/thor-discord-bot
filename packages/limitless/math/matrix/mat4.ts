import { mat3 } from "./mat3";

type Vec4 = [number, number, number, number];
type Mat4 = [...Vec4, ...Vec4, ...Vec4, ...Vec4];

export default class Matrix4 {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
	7: number;
	8: number;
	9: number;
	10: number;
	11: number;
	12: number;
	13: number;
	14: number;
	15: number;
	[i: number]: number;

	constructor(matrix?: Matrix4 | Mat4) {
		if (matrix) this.set(matrix);
		else this.identity();
	}

	toString(): string {
		const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = this;
		return `mat4 [
  ${a} ${b} ${c} ${d}
  ${e} ${f} ${g} ${h}
  ${i} ${j} ${k} ${l}
  ${m} ${n} ${o} ${p}
]`;
	}

	log(): this {
		console.log(this.toString());
		return this;
	}

	*[Symbol.iterator](): Iterator<number> {
		for (let i = 0; i < 16; i++) {
			yield this[i]!;
		}
	}

	copy(): Matrix4 {
		return mat4([...this] as Mat4);
	}

	set(m: Matrix4 | Mat4): this {
		for (let i = 0; i < 16; i++) {
			this[i] = m[i]!;
		}

		return this;
	}

	identity(): this {
		return this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	}

	equals(m: Matrix4 | Mat4): boolean {
		for (let i = 0; i < 16; i++) {
			const a = this[i]!;
			const b = m[i]!;
			if (Math.abs(a - b) > Number.EPSILON) return false;
		}

		return true;
	}

	add(m: Matrix4 | Mat4): this {
		for (let i = 0; i < 16; i++) {
			this[i] += m[i]!;
		}

		return this;
	}

	static add(m1: Matrix4, m2: Matrix4 | Mat4): Matrix4 {
		return m1.copy().add(m2);
	}

	sub(m: Matrix4 | Mat4): this {
		for (let i = 0; i < 16; i++) {
			this[i] -= m[i]!;
		}

		return this;
	}

	static sub(m1: Matrix4, m2: Matrix4 | Mat4): Matrix4 {
		return m1.copy().sub(m2);
	}

	mult(m: Matrix4 | Mat4 | number): this {
		return this.set(Matrix4.mult(this, m));
	}

	static mult(m1: Matrix4 | Mat4, m2: Matrix4 | Mat4 | number): Matrix4 {
		if (typeof m2 === "number") {
			const ans = mat4();
			for (let i = 0; i < 16; i++) {
				ans[i] *= m2;
			}

			return ans;
		}

		const [
			a0,
			a1,
			a2,
			a3,
			a4,
			a5,
			a6,
			a7,
			a8,
			a9,
			a10,
			a11,
			a12,
			a13,
			a14,
			a15,
		] = m1;
		const [
			b0,
			b1,
			b2,
			b3,
			b4,
			b5,
			b6,
			b7,
			b8,
			b9,
			b10,
			b11,
			b12,
			b13,
			b14,
			b15,
		] = m2;
		return mat4([
			a0 * b0 + a1 * b4 + a2 * b8 + a3 * b12,
			a0 * b1 + a1 * b5 + a2 * b9 + a3 * b13,
			a0 * b2 + a1 * b6 + a2 * b10 + a3 * b14,
			a0 * b3 + a1 * b7 + a2 * b11 + a3 * b15,

			a4 * b0 + a5 * b4 + a6 * b8 + a7 * b12,
			a4 * b1 + a5 * b5 + a6 * b9 + a7 * b13,
			a4 * b2 + a5 * b6 + a6 * b10 + a7 * b14,
			a4 * b3 + a5 * b7 + a6 * b11 + a7 * b15,

			a8 * b0 + a9 * b4 + a10 * b8 + a11 * b12,
			a8 * b1 + a9 * b5 + a10 * b9 + a11 * b13,
			a8 * b2 + a9 * b6 + a10 * b10 + a11 * b14,
			a8 * b3 + a9 * b7 + a10 * b11 + a11 * b15,

			a12 * b0 + a13 * b4 + a14 * b8 + a15 * b12,
			a12 * b1 + a13 * b5 + a14 * b9 + a15 * b13,
			a12 * b2 + a13 * b6 + a14 * b10 + a15 * b14,
			a12 * b3 + a13 * b7 + a14 * b11 + a15 * b15,
		]);
	}

	div(m: number): this {
		return this.mult(1 / m);
	}

	transpose(): this {
		const [, b, c, d, e, , g, h, i, j, , l, m, n, o] = this;
		[this[4], this[1]] = [b, e];
		[this[8], this[2]] = [c, i];
		[this[12], this[3]] = [d, m];
		[this[9], this[6]] = [g, j];
		[this[13], this[7]] = [h, n];
		[this[14], this[11]] = [l, o];
		return this;
	}

	det(): number {
		const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = this;
		return (
			a * mat3([f, g, h, j, k, l, n, o, p]).det() -
			b * mat3([e, g, h, i, k, l, m, o, p]).det() +
			c * mat3([e, f, h, i, j, l, m, n, p]).det() -
			d * mat3([e, f, g, i, j, k, m, n, o]).det()
		);
	}

	adj(): Matrix4 {
		const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = this;
		return mat4([
			mat3([f, g, h, j, k, l, n, o, p]).det(),
			-mat3([e, g, h, i, k, l, m, o, p]).det(),
			mat3([e, f, h, i, j, l, m, n, p]).det(),
			-mat3([e, f, g, i, j, k, m, n, o]).det(),
			-mat3([b, c, d, j, k, l, n, o, p]).det(),
			mat3([a, c, d, i, k, l, m, o, p]).det(),
			-mat3([a, b, d, i, j, l, m, n, p]).det(),
			mat3([a, b, c, i, j, k, m, n, o]).det(),
			mat3([b, c, d, f, g, h, n, o, p]).det(),
			-mat3([a, c, d, e, g, h, m, o, p]).det(),
			mat3([a, b, d, e, f, h, m, n, p]).det(),
			-mat3([a, b, c, e, f, g, m, n, o]).det(),
			-mat3([b, c, d, f, g, h, j, k, l]).det(),
			mat3([a, c, d, e, g, h, i, k, l]).det(),
			-mat3([a, b, d, e, f, h, i, j, l]).det(),
			mat3([a, b, c, e, f, g, i, j, k]).det(),
		]).transpose();
	}

	inv(): Matrix4 {
		return this.adj().div(this.det());
	}
}

export function mat4(matrix?: Matrix4 | Mat4): Matrix4 {
	return new Matrix4(matrix);
}
