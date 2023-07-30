/* eslint-disable @typescript-eslint/unified-signatures */
export default class Vector {
	components!: Float64Array;

	constructor(v: number[] | Float64Array | Vector) {
		this.set(v);
	}

	toString(): string {
		return `⟨${this.components.join(",")}⟩`;
	}

	log(): this {
		console.log(this.toString());
		return this;
	}

	/**
	 * Creates a copy of the vector
	 * @returns the copy
	 */
	copy(): Vector {
		return vec(this);
	}

	/**
	 * Sets the components of the vector to the values in the array or vector
	 * @param v a vector or an array of numbers
	 * @chainable
	 */
	set(v: number[] | Float64Array | Vector): this {
		if (v instanceof Float64Array) this.components = v;
		else if (v instanceof Vector) this.components = v.components.slice(0);
		else this.components = new Float64Array(v);
		return this;
	}

	/**
	 * Checks if the components of the vectors are equal to another vector's components or an array of numbers
	 * @param v the vector or list of numbers to compare to
	 * @returns true if the vectors are equal
	 */
	equals(v: number[] | Float64Array | Vector): boolean {
		return this.components.every((x, i) => {
			if (v instanceof Vector) return x === v.components[i];
			return x === v[i];
		});
	}

	/**
	 * Adds the components of another vector to the vector's components
	 * @param v a vector
	 * @chainable
	 */
	add(v: Vector): this;
	/**
	 * Adds an array of numbers to the vector's components
	 * @param v a vector
	 * @chainable
	 */
	add(v: number[]): this;
	/**
	 * Adds a number to each of the vector's components
	 * @param v a vector
	 * @chainable
	 */
	add(v: number): this;
	add(v: Vector | number[] | number): this {
		const { components } = this;
		if (v instanceof Vector)
			for (const [i, x] of v.components.entries()) {
				if (components[i]) {
					components[i] += x;
				} else {
					components[i] = x;
				}
			}
		else if (Array.isArray(v))
			for (const [i, x] of v.entries()) {
				if (components[i]) {
					components[i] += x;
				} else {
					components[i] = x;
				}
			}
		else {
			for (let i = 0; i < components.length; i++) {
				components[i] += v;
			}
		}

		return this;
	}

	static add(v1: Vector, v2: Vector | number[] | number): Vector {
		return v1.copy().add(v2);
	}

	/**
	 * Subtracts the components of another vector from the vector's components
	 * @param v a vector
	 * @chainable
	 */
	sub(v: Vector): this;
	/**
	 * Subtracts an array of numbers from the vector's components
	 * @param v an array of numbers
	 * @chainable
	 */
	sub(v: number[]): this;
	/**
	 * Subtracts a number from each of the vector's components
	 * @param v a number
	 * @chainable
	 */
	sub(v: number): this;
	sub(v: Vector | number[] | number): this {
		const { components } = this;
		if (v instanceof Vector)
			for (const [i, x] of v.components.entries()) {
				if (components[i]) {
					components[i] -= x;
				} else {
					components[i] = -x;
				}
			}
		else if (Array.isArray(v))
			for (const [i, x] of v.entries()) {
				if (components[i]) {
					components[i] -= x;
				} else {
					components[i] = -x;
				}
			}
		else {
			for (let i = 0; i < components.length; i++) {
				components[i] -= v;
			}
		}

		return this;
	}

	static sub(v1: Vector, v2: Vector | number[] | number): Vector {
		return v1.copy().sub(v2);
	}

	/**
	 * Multiplies the vector's components by another vector's components
	 * @param v a vector
	 * @chainable
	 */
	mult(v: Vector): this;
	/**
	 * Multiplies the vector's components by an array of numbers
	 * @param v an array of numbers
	 * @chainable
	 */
	mult(v: number[]): this;
	/**
	 * Multiplies each of the vector's components by a number
	 * @param v a number
	 * @chainable
	 */
	mult(v: number): this;
	mult(v: Vector | number[] | number): this {
		const { components } = this;
		if (v instanceof Vector)
			for (const [i, x] of v.components.entries()) {
				if (components[i]) {
					components[i] *= x;
				} else {
					components[i] = 0;
				}
			}
		else if (Array.isArray(v))
			for (const [i, x] of v.entries()) {
				if (components[i]) {
					components[i] *= x;
				} else {
					components[i] = 0;
				}
			}
		else {
			for (let i = 0; i < components.length; i++) {
				components[i] *= v;
			}
		}

		return this;
	}

	static mult(v1: Vector, v2: Vector): Vector;
	static mult(v1: Vector, v2: number[]): Vector;
	static mult(v1: Vector, v2: number): Vector;
	static mult(v1: Vector, v2: Vector | number[] | number): Vector {
		return v1.copy().mult(v2 as any);
	}

	/**
	 * Divides the vector's components by another vector's components
	 * @param v a vector
	 * @chainable
	 */
	div(v: Vector): this;
	/**
	 * Divides the vector's components by an array of numbers
	 * @param v an array of numbers
	 * @chainable
	 */
	div(v: number[]): this;
	/**
	 * Divides each of the vector's components by a number
	 * @param v a number
	 * @chainable
	 */
	div(v: number): this;
	div(v: Vector | number[] | number): this {
		const { components } = this;
		if (v instanceof Vector)
			for (const [i, x] of v.components.entries()) {
				if (components[i]) {
					components[i] /= x;
				} else {
					components[i] = 0;
				}
			}
		else if (Array.isArray(v))
			for (const [i, x] of v.entries()) {
				if (components[i]) {
					components[i] /= x;
				} else {
					components[i] = 0;
				}
			}
		else {
			for (let i = 0; i < components.length; i++) {
				components[i] /= v;
			}
		}

		return this;
	}

	static div(v1: Vector, v2: Vector): Vector;
	static div(v1: Vector, v2: number[]): Vector;
	static div(v1: Vector, v2: number): Vector;
	static div(v1: Vector, v2: Vector | number[] | number): Vector {
		return v1.copy().div(v2 as any);
	}

	/**
	 * The euclidean magnitude of the vector
	 * @returns the magnitude
	 */
	mag(): number {
		return Math.sqrt(this.magSq());
	}

	/**
	 * Adjusts the vector's magnitude to a given value
	 * @param n the new magnitude
	 * @chainable
	 */
	setMag(x: number): this {
		return this.normalize().mult(x);
	}

	/**
	 * The squared euclidean magnitude of the vector
	 * @returns the magnitude squared
	 */
	magSq(): number {
		return this.components.reduce((sum, x) => sum + x * x, 0);
	}

	/**
	 * Limits the vector's maximum magnitude to a given value
	 * @param max the maximum magnitude
	 * @chainable
	 */
	limit(max: number): this {
		const maxSq = max * max;
		const magSq = this.magSq();
		if (magSq > maxSq) this.setMag(max);
		return this;
	}

	/**
	 * Sets the vector's magnitude to 1
	 * @chainable
	 */
	normalize(): this {
		const mag = this.mag();
		if (mag !== 0) this.div(mag);
		return this;
	}

	/**
	 * The euclidean distance between the vector and another vector
	 * @param v a vector
	 * @returns the distance
	 */
	dist(v: Vector): number {
		return Math.sqrt(this.distSq(v));
	}

	/**
	 * The euclidean distance squared between the vector and another vector
	 * @param v a vector
	 * @returns the distance squared
	 */
	distSq(v: Vector): number {
		return Vector.sub(v, this).magSq();
	}

	/**
	 * The dot product of the vector and another vector, or in other words, the sum of the products of the vector's components with the other vector's components
	 * @param v a vector
	 * @returns the dot product
	 */
	dot(v: Vector): number {
		return this.components.reduce(
			(sum, x, i) => sum + x * (v.components[i] || 0),
			0,
		);
	}

	/**
	 * Adds all of the vector's components together
	 * @returns the sum
	 */
	sum(): number {
		return this.components.reduce((sum, x) => sum + x, 0);
	}

	/**
	 * The mean of average of the vector's components
	 * @returns the mean
	 */
	mean(): number {
		return this.sum() / this.components.length;
	}

	/**
	 * The variance of the vector's components
	 * @returns the variance
	 */
	variance(): number {
		return this.components.reduce((sum, x) => sum + (x - this.mean()) ** 2, 0);
	}

	/**
	 * The standard deviation of the vector's components
	 * @returns the standard deviation
	 */
	stddev(): number {
		return Math.sqrt(this.variance());
	}
}

export function vec(v: number[] | Float64Array | Vector): Vector {
	return new Vector(v);
}
