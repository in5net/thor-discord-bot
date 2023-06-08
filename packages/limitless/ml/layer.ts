import Matrix from "../math/matrix";
import activations, { type Activation } from "./activations";

export default class Layer {
	weights: Matrix;
	biases: Matrix;

	activation: Activation;

	inputArray: number[] = [];
	outputs: number[] = [];

	constructor(
		readonly nodes: number,
		readonly inputNodes: number,
		activation: keyof typeof activations = "sigmoid"
	) {
		this.weights = Matrix.random(nodes, inputNodes);
		this.biases = Matrix.random(nodes, 1);
		this.activation = activations[activation];
	}

	predict(inputArray: number[]): number[] {
		const {
			weights,
			biases,
			activation: { f },
		} = this;
		const inputs = Matrix.fromArray(inputArray);
		const outputs = Matrix.mult(weights, inputs);
		outputs.add(biases);
		outputs.map(f);

		this.outputs = outputs.toArray();
		this.inputArray = inputArray;
		return this.outputs;
	}

	train(
		targets: number[],
		learningRate: number,
		errorArray?: number[]
	): number[] {
		const {
			weights,
			biases,
			activation: { df },
			inputArray,
			outputs,
		} = this;
		const outputsMat = Matrix.fromArray(outputs);
		const errors = errorArray
			? Matrix.fromArray(errorArray)
			: Matrix.sub(Matrix.fromArray(targets), outputsMat);

		const gradients = Matrix.map(outputsMat, df)
			.mult(errors)
			.mult(learningRate);

		const inputs = Matrix.transpose(Matrix.fromArray(inputArray));
		const deltas = Matrix.mult(gradients, inputs);

		weights.add(deltas);
		biases.add(gradients);

		return errors.toArray();
	}
}
