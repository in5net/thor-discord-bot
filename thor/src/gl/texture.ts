import { createCanvas, loadImage } from 'canvas';

export default class Texture {
  constructor(public texture: WebGLTexture) {}

  static async fromURL(
    url: string,
    gl: WebGLRenderingContext,
    param?: GLenum
  ): Promise<Texture> {
    // Create the texture
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const texture = gl.createTexture()!;
    // Bind and config the texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      param || gl.CLAMP_TO_EDGE
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      param || gl.CLAMP_TO_EDGE
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = await loadImage(url);
    const { width, height } = image;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data
    );

    return new Texture(texture);
  }

  activate(gl: WebGLRenderingContext, unit = 0): void {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.activeTexture(gl.TEXTURE0 + unit);
  }
}
