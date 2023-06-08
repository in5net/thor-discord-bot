export interface Activation {
	f: (x: number) => number;
	df: (y: number) => number;
}
const activations = {
	sigmoid: {
		f: (x: number) => 1 / (1 + Math.exp(-x)),
		df: (y: number) => y * (1 - y),
	},
	tanh: {
		f: Math.tanh,
		df: (y: number) => 1 - y * y,
	},
	relu: {
		f: (x: number) => (x > 0 ? x : 0),
		df: (y: number) => (y > 0 ? 1 : 0),
	},
	leakyRelu: {
		f: (x: number) => (x > 0 ? x : 0.01 * x),
		df: (y: number) => (y > 0 ? 1 : 0.01),
	},
};
export default activations;
