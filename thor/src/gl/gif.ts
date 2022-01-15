import decodeGif from 'decode-gif';
import axios from 'axios';

export default class GIF {
  textures: WebGLTexture[] = [];

  static async fromURL(url: string, gl: WebGLRenderingContext): Promise<GIF> {
    const response = await axios(url, { responseType: 'arraybuffer' });
    const buffer = response.data;
    const { width, height, frames } = decodeGif(buffer);
    const gif = new GIF();
    gif.textures = frames.map(frame =>
      createTexture(gl, frame.data, width, height)
    );
    return gif;
  }

  setFrame(gl: WebGLRenderingContext, index: number, unit = 0): void {
    const { textures } = this;
    const texture = textures[index % textures.length];
    if (!texture) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0 + unit);
  }
}

function createTexture(
  gl: WebGLRenderingContext,
  data: Uint8ClampedArray,
  width: number,
  height: number
): WebGLTexture {
  // Create the texture
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const texture = gl.createTexture()!;
  // Bind and config the texture
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data
  );

  return texture;
}
