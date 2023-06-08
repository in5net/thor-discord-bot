type Vec3 = [number, number, number];
type Mat3 = [...Vec3, ...Vec3, ...Vec3];

export default class Matrix3 {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
	7: number;
	8: number;
	[i: number]: number;

	constructor(matrix?: Matrix3 | Mat3) {
		if (matrix) this.set(matrix);
		else this.identity();
	}

	toString(): string {
		const [a, b, c, d, e, f, g, h, i] = this;
		return `mat3 [
  ${a} ${b} ${c}
  ${d} ${e} ${f}
  ${g} ${h} ${i}
]`;
	}

	log(): this {
		console.log(this.toString());
		return this;
	}

	*[Symbol.iterator](): Iterator<number> {
		for (let i = 0; i < 9; i++) {
			yield this[i]!;
		}
	}

	copy(): Matrix3 {
		return mat3([...this] as Mat3);
	}

	set(m: Matrix3 | Mat3): this {
		for (let i = 0; i < 9; i++) {
			this[i] = m[i]!;
		}

		return this;
	}

	identity(): this {
		return this.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
	}

	equals(m: Matrix3 | Mat3): boolean {
		for (let i = 0; i < 9; i++) {
			const a = this[i]!;
			const b = m[i]!;
			if (Math.abs(a - b) > Number.EPSILON) return false;
		}

		return true;
	}

	add(m: Matrix3 | Mat3): this {
		for (let i = 0; i < 9; i++) {
			this[i] += m[i]!;
		}

		return this;
	}

	static add(m1: Matrix3, m2: Matrix3 | Mat3): Matrix3 {
		return m1.copy().add(m2);
	}

	sub(m: Matrix3 | Mat3): this {
		for (let i = 0; i < 9; i++) {
			this[i] -= m[i]!;
		}

		return this;
	}

	static sub(m1: Matrix3, m2: Matrix3 | Mat3): Matrix3 {
		return m1.copy().sub(m2);
	}

	mult(m: Matrix3 | Mat3 | number): this {
		return this.set(Matrix3.mult(this, m));
	}

	static mult(m1: Matrix3 | Mat3, m2: Matrix3 | Mat3 | number): Matrix3 {
		if (typeof m2 === "number") {
			const ans = mat3(m1);
			console.log({ ans });
			for (let i = 0; i < 9; i++) {
				ans[i] *= m2;
			}

			console.log({ ans });
			return ans;
		}

		const [a0, a1, a2, a3, a4, a5, a6, a7, a8] = m1;
		const [b0, b1, b2, b3, b4, b5, b6, b7, b8] = m2;
		return mat3([
			a0 * b0 + a1 * b3 + a2 * b6,
			a0 * b1 + a1 * b4 + a2 * b7,
			a0 * b2 + a1 * b5 + a2 * b8,

			a3 * b0 + a4 * b3 + a5 * b6,
			a3 * b1 + a4 * b4 + a5 * b7,
			a3 * b2 + a4 * b5 + a5 * b8,

			a6 * b0 + a7 * b3 + a8 * b6,
			a6 * b1 + a7 * b4 + a8 * b7,
			a6 * b2 + a7 * b5 + a8 * b8,
		]);
	}

	div(m: number): this {
		return this.mult(1 / m);
	}

	transpose(): this {
		const [, b, c, d, , f, g, h] = this;
		[this[3], this[1]] = [b, d];
		[this[6], this[2]] = [c, g];
		[this[7], this[5]] = [f, h];
		return this;
	}

	det(): number {
		const [a, b, c, d, e, f, g, h, i] = this;
		return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
	}

	adj(): Matrix3 {
		const [a, b, c, d, e, f, g, h, i] = this;
		return mat3([
			e * i - f * h,
			-(d * i - f * g),
			d * h - e * g,

			-(b * i - c * h),
			a * i - c * g,
			-(a * h - b * g),

			b * f - c * e,
			-(a * f - c * d),
			a * e - b * d,
		]).transpose();
	}

	inv(): Matrix3 {
		console.log(this.adj());
		console.log(this.det());
		return this.adj().div(this.det());
	}
}

export function mat3(matrix?: Matrix3 | Mat3): Matrix3 {
	return new Matrix3(matrix);
}
