import { vec2, Vector2 } from "../../math";
import type AABB from "./aabb";

export interface Collision {
	normal: Vector2;
	dist: number;
}

export interface DynamicCollision {
	body: Body;
	normal: Vector2;
}

export default abstract class Body {
	position: Vector2;
	velocity = vec2();
	acceleration = vec2();

	angle = 0;
	angularVelocity = 0;
	angularAcceleration = 0;

	collision?: DynamicCollision;

	abstract rotationalInertia: number;

	abstract aabb: AABB;

	constructor(
		x: number,
		y: number,
		public mass = 1,
	) {
		this.position = vec2(x, y);
	}

	/**
	 * Changes the body's acceleration
	 * @param force a vector
	 */
	force(force: Vector2): this {
		this.acceleration.add(Vector2.div(force, this.mass));
		return this;
	}

	/**
	 * Changes the body's angular acceleration
	 * @param force a vector
	 * @param location where the force was applied
	 */
	torque(force: Vector2, location: Vector2): this {
		const r = Vector2.sub(location, this.position);
		const angle = force.angle() - r.angle();
		const torque = force.mag() * r.mag() * Math.sin(angle);
		this.angularAcceleration += torque / this.rotationalInertia;
		return this;
	}

	/**
	 * Rotates the body by a given angle
	 * @param angle the angle (rad)
	 */
	rotate(angle: number): this {
		this.angle += angle;
		return this;
	}

	/**
	 * Calculates the new state of the body
	 * @param dt change in time
	 */
	update(dt: number): this {
		const { position, velocity, acceleration, collision } = this;

		if (collision) {
			this.resolveDynamicCollision(collision);
			this.collision = undefined;
		}

		velocity.add(Vector2.mult(acceleration, dt));
		position.add(Vector2.mult(velocity, dt));
		acceleration.mult(0);

		this.angularVelocity += this.angularAcceleration * dt;
		this.rotate(this.angularVelocity * dt);
		this.angularAcceleration = 0;

		return this;
	}

	abstract collides(other: Body, resolve?: boolean): boolean;

	protected resolveCollision(o: Body, { normal, dist }: Collision): void {
		const { position } = this;

		// Static
		const dpos = Vector2.mult(normal, dist / 2);
		position.sub(dpos);
		o.position.add(dpos);

		this.collision = {
			body: o,
			normal,
		};
	}

	protected resolveDynamicCollision({
		body: o,
		normal,
	}: DynamicCollision): void {
		const { velocity, mass } = this;

		// Dynamic
		const tangent = normal.perp();

		const dpTan1 = velocity.dot(tangent);
		const dpTan2 = o.velocity.dot(tangent);

		const dpNorm1 = velocity.dot(normal);
		const dpNorm2 = o.velocity.dot(normal);

		const m = mass + o.mass;
		const m1 = (dpNorm1 * (mass - o.mass) + 2 * o.mass * dpNorm2) / m;
		const m2 = (dpNorm2 * (o.mass - mass) + 2 * mass * dpNorm1) / m;

		velocity.set(
			Vector2.add(Vector2.mult(tangent, dpTan1), Vector2.mult(normal, m1)),
		);
		o.velocity.set(
			Vector2.add(Vector2.mult(tangent, dpTan2), Vector2.mult(normal, m2)),
		);
	}

	// Position
	get x(): number {
		return this.position.x;
	}

	set x(x: number) {
		this.position.x = x;
	}

	get y(): number {
		return this.position.y;
	}

	set y(y: number) {
		this.position.y = y;
	}

	// Velocity
	get vx(): number {
		return this.velocity.x;
	}

	set vx(x: number) {
		this.velocity.x = x;
	}

	get vy(): number {
		return this.velocity.y;
	}

	set vy(y: number) {
		this.velocity.y = y;
	}

	// Acceleration
	get ax(): number {
		return this.acceleration.x;
	}

	set ax(x: number) {
		this.acceleration.x = x;
	}

	get ay(): number {
		return this.acceleration.y;
	}

	set ay(y: number) {
		this.acceleration.y = y;
	}

	// Angular position
	get θ(): number {
		return this.angle;
	}

	set θ(angle: number) {
		this.angle = angle;
	}

	// Angular velocity
	get ω(): number {
		return this.angularVelocity;
	}

	set ω(angularVelocity: number) {
		this.angularVelocity = angularVelocity;
	}

	// Angular acceleration
	get α(): number {
		return this.angularVelocity;
	}

	set α(angularVelocity: number) {
		this.angularVelocity = angularVelocity;
	}
}
