const isPowerOf2 = (x: number) => (x & (x - 1)) === 0;
function nextHighestPowerOfTwo(x: number) {
	--x;
	for (let i = 1; i < 32; i <<= 1) {
		x |= x >> i;
	}

	return x + 1;
}

export default class Texture {
	constructor(public texture: WebGLTexture) {}

	static async fromURL(
		url: string,
		gl: WebGLRenderingContext,
		{ param, mipmap = false }: { param?: GLenum; mipmap?: boolean } = {},
	): Promise<Texture> {
		// Create the texture

		const texture = gl.createTexture()!;
		// Bind and config the texture
		gl.bindTexture(gl.TEXTURE_2D, texture);

		const { loadImage, createCanvas } = await import("@napi-rs/canvas");
		const image = await loadImage(url);
		const { width, height } = image;

		let canvasWidth = width;
		let canvasHeight = height;
		if (mipmap && (!isPowerOf2(width) || !isPowerOf2(height))) {
			canvasWidth = nextHighestPowerOfTwo(width);
			canvasHeight = nextHighestPowerOfTwo(height);
		}

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
		const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			canvasWidth,
			canvasHeight,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			imageData.data,
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			param || gl.CLAMP_TO_EDGE,
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			param || gl.CLAMP_TO_EDGE,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.generateMipmap(gl.TEXTURE_2D);

		return new Texture(texture);
	}

	activate(gl: WebGLRenderingContext, unit = 0): void {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.activeTexture(gl.TEXTURE0 + unit);
	}
}
