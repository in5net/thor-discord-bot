/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCanvas } from '@napi-rs/canvas';
import ffmpeg from 'fluent-ffmpeg';
import GIFEncoder from 'gif-encoder';
import createContext from 'gl';
import type { ReadonlyMat2, ReadonlyMat3, ReadonlyMat4 } from 'gl-matrix';
import { nanoid } from 'nanoid';
import { ReadStream, createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';

import GIF from './gif';
import Texture from './texture';

interface GLShader {
  shader: WebGLShader;
  source: string;
}

interface GLBuffer {
  buffer: WebGLBuffer;
  data: number[][][];
  flatData: number[];
}

type GLAttributeType =
  | 'float'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'mat2'
  | 'mat3'
  | 'mat4';
const inputSizes: Record<GLAttributeType, number> = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  mat2: 4,
  mat3: 9,
  mat4: 16
};
type Vec2 = readonly [x: number, y: number];
type Vec3 = readonly [x: number, y: number, z: number];
type Vec4 = readonly [x: number, y: number, z: number, w: number];
interface UniformData {
  int: number;
  'int[]': number[];
  float: number;
  'float[]': number[];
  ivec2: Vec2;
  'ivec2[]': Vec2[];
  vec2: Vec2;
  'vec2[]': Vec2[];
  ivec3: Vec3;
  'ivec3[]': Vec3[];
  vec3: Vec3;
  'vec3[]': Vec3[];
  ivec4: Vec4;
  'ivec4[]': Vec4[];
  vec4: Vec4;
  'vec4[]': Vec4[];
  mat2: ReadonlyMat2;
  mat3: ReadonlyMat3;
  mat4: ReadonlyMat4;
}

export default class GL {
  gl: WebGLRenderingContext;

  program!: WebGLProgram;

  vertexShader!: GLShader;
  fragmentShader!: GLShader;

  vertexBuffer!: GLBuffer;
  indexBuffer!: GLBuffer;

  attributeLocations: Record<string, GLint> = {};
  uniformLocations: Record<string, WebGLUniformLocation> = {};
  textures: (Texture | GIF)[] = [];

  constructor(
    readonly width: number,
    readonly height = width,
    depth = false,
    cull = false
  ) {
    // Set up the WebGL rendering context
    const gl = createContext(width, height, {
      preserveDrawingBuffer: true
    });
    if (depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    }
    if (cull) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.frontFace(gl.CCW);
    }
    this.gl = gl;
  }

  static async screen(
    width: number,
    height: number,
    fragmentSource: string,
    vertexSource?: string
  ): Promise<GL> {
    const gl = new GL(width, height);
    gl.createProgramFromSource(
      vertexSource ||
        (await GL.loadFile(
          new URL('../../assets/screen.vert', import.meta.url).pathname
        )),
      fragmentSource
    );
    gl.screen();
    gl.attributes([
      {
        name: 'position',
        type: 'vec2'
      },
      {
        name: 'uv',
        type: 'vec2'
      }
    ]);
    return gl;
  }

  /**
   * Gets the text of a file
   * @param path path to the file
   */
  static async loadFile(path: string): Promise<string> {
    const file = await readFile(path);
    return file.toString();
  }

  /**
   * Creates a vertex shader from its source text
   * @param source the source of the vertex shader
   */
  createVertexShader(source: string): WebGLShader {
    const { gl } = this;
    // Create the vertex shader and bind the source
    const shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(shader, source);

    // Check for shader errors
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.error(
        'Error compiling vertex shader:',
        gl.getShaderInfoLog(shader)
      );

    this.vertexShader = { shader, source };
    return shader;
  }

  /**
   * Creates a fragment shader from its source text
   * @param source the source of the fragment shader
   */
  createFragmentShader(source: string): WebGLShader {
    const { gl } = this;
    // Create the fragment shader and bind the source
    const shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(shader, source);

    // Check for shader errors
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.error(
        'Error compiling fragment shader:',
        gl.getShaderInfoLog(shader)
      );

    this.fragmentShader = { shader, source };
    return shader;
  }

  /**
   * Creates a program to run in WebGL
   * @param vertexShader
   * @param fragmentShader
   */
  createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const { gl } = this;
    // Create the program and bind the vertex and fragment shaders
    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Check for program errors
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      console.error('Error linking program:', gl.getProgramInfoLog(program));

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
      console.error('Error validating program:', gl.getProgramInfoLog(program));

    this.program = program;
    gl.useProgram(program);
    return program;
  }

  createProgramFromSource(
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram {
    return this.createProgram(
      this.createVertexShader(vertexSource),
      this.createFragmentShader(fragmentSource)
    );
  }

  async createProgramFromPaths(
    vertexShaderPath: string,
    fragmentShaderPath: string
  ): Promise<WebGLProgram> {
    return this.createProgramFromSource(
      await GL.loadFile(vertexShaderPath),
      await GL.loadFile(fragmentShaderPath)
    );
  }

  screen(): void {
    this.createVertexBuffer(GL.screenData.vertexData);
    this.createIndexBuffer(GL.screenData.indexData);
  }

  /**
   * Creates a vertex buffer
   * @param data the data for the buffer
   */
  createVertexBuffer(data: number[][][]): WebGLBuffer {
    const { gl } = this;
    // Create the vertex buffer
    const buffer = gl.createBuffer()!;
    // Bind the data to the buffer
    const flatData = data.flat(2);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatData), gl.STATIC_DRAW);

    this.vertexBuffer = { buffer, data, flatData };
    return buffer;
  }

  /**
   * Creates an index buffer
   * @param data the data for the buffer
   */
  createIndexBuffer(data: number[][][]): WebGLBuffer {
    const { gl } = this;
    // Create the index buffer
    const buffer = gl.createBuffer()!;
    // Bind the data to the buffer
    const flatData = data.flat(2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(flatData),
      gl.STATIC_DRAW
    );

    this.indexBuffer = { buffer, data, flatData };
    return buffer;
  }

  /**
   * Gets the location of a attribute
   * @param name the name of the attribute
   */
  getAttributeLocation(name: string): GLint {
    // Attribute location is already cached
    if (Object.prototype.hasOwnProperty.call(this.attributeLocations, name))
      return this.attributeLocations[name]!;

    // Need to find the attribute location
    const attributeLocation = this.gl.getAttribLocation(this.program, name);
    if (attributeLocation !== -1)
      this.attributeLocations[name] = attributeLocation;
    return attributeLocation;
  }

  /**
   * Gets the location of a uniform
   * @param name the name of the uniform
   */
  getUniformLocation(name: string): WebGLUniformLocation | null {
    // Uniform location is already cached
    if (Object.prototype.hasOwnProperty.call(this.uniformLocations, name))
      return this.uniformLocations[name]!;

    // Need to find the uniform location
    const uniformLocation = this.gl.getUniformLocation(this.program, name);
    if (uniformLocation !== null) this.uniformLocations[name] = uniformLocation;
    return uniformLocation;
  }

  attributes(inputs: { name: string; type: GLAttributeType }[]): void {
    const { gl } = this;
    let offset = 0;
    const stride = inputs.reduce(
      (acc, { type }) =>
        acc + inputSizes[type] * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    inputs.forEach(({ name, type }) => {
      const size = inputSizes[type];
      this.createAttribute(name, [size, gl.FLOAT, false, stride, offset]);
      offset += size * Float32Array.BYTES_PER_ELEMENT;
    });
  }

  uniform<T extends keyof Readonly<UniformData>>(
    name: string,
    type: T,
    data: UniformData[T]
  ): void {
    const { gl } = this;
    const location = this.getUniformLocation(name);
    switch (type) {
      case 'int':
        gl.uniform1i(location, data as UniformData['int']);
        break;
      case 'int[]':
        (data as UniformData['int[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'int', value)
        );
        break;
      case 'float':
        gl.uniform1f(location, data as UniformData['float']);
        break;
      case 'float[]':
        (data as UniformData['float[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'float', value)
        );
        break;
      case 'ivec2':
        gl.uniform2i(location, ...(data as UniformData['ivec2']));
        break;
      case 'ivec2[]':
        (data as UniformData['ivec2[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'ivec2', value)
        );
        break;
      case 'vec2':
        gl.uniform2f(location, ...(data as UniformData['vec2']));
        break;
      case 'vec2[]':
        (data as UniformData['vec2[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'vec2', value)
        );
        break;
      case 'ivec3':
        gl.uniform3i(location, ...(data as UniformData['ivec3']));
        break;
      case 'ivec3[]':
        (data as UniformData['ivec3[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'ivec3', value)
        );
        break;
      case 'vec3':
        gl.uniform3f(location, ...(data as UniformData['vec3']));
        break;
      case 'vec3[]':
        (data as UniformData['vec3[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'vec3', value)
        );
        break;
      case 'ivec4':
        gl.uniform4i(location, ...(data as UniformData['ivec4']));
        break;
      case 'ivec4[]':
        (data as UniformData['ivec4[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'ivec4', value)
        );
        break;
      case 'vec4':
        gl.uniform4f(location, ...(data as UniformData['vec4']));
        break;
      case 'vec4[]':
        (data as UniformData['vec4[]']).forEach((value, i) =>
          this.uniform(`${name}[${i}]`, 'vec4', value)
        );
        break;
      case 'mat2':
        gl.uniformMatrix2fv(
          location,
          false,
          new Float32Array(data as UniformData['mat2'])
        );
        break;
      case 'mat3':
        gl.uniformMatrix3fv(
          location,
          false,
          new Float32Array(data as UniformData['mat3'])
        );
        break;
      case 'mat4':
        gl.uniformMatrix4fv(
          location,
          false,
          new Float32Array(data as UniformData['mat4'])
        );
        break;
      default:
        console.error(`Uniform ${name} has unknown type ${type}`);
    }
  }

  /**
   *
   * @param name the name of the attribute
   * @param config
   * Number of elements per attribute,
   * Type of elements,
   * Is it normalized?,
   * Size of an individual vertex,
   * Offset from the beginning of a single vertex to this attribute
   * @returns the attribute location
   */
  createAttribute(
    name: string,
    config: [
      size: GLint,
      type: GLenum,
      normalized: GLboolean,
      stride: GLsizei,
      offset: GLintptr
    ]
  ): GLint {
    const { gl } = this;
    // Find the attribute location
    const attributeLocation = this.getAttributeLocation(name);
    // Enable the attribute and config
    gl.vertexAttribPointer(
      attributeLocation, // Attribute location
      ...config
      // Number of elements per attribute
      // Type of elements
      // Is it normalized?
      // Size of an individual vertex
      // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(attributeLocation);

    return attributeLocation;
  }

  /**
   * Creates a texture from an image
   * @param url a file url to the image
   */
  async createTexture(
    url: string,
    {
      param,
      isGif = false,
      mipmap
    }: { param?: GLenum; isGif?: boolean; mipmap?: boolean } = {}
  ): Promise<Texture | GIF> {
    const { gl, textures } = this;
    const texture = await (isGif
      ? GIF.fromURL(url, gl)
      : Texture.fromURL(url, gl, { param, mipmap }));
    textures.push(texture);
    return texture;
  }

  /**
   * Fills the canvas with a background color
   * @param r red value
   * @param g green value
   * @param b blue value
   * @param a alpha value
   */
  background(r: number, g: number, b: number, a = 1): this {
    const { gl } = this;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return this;
  }

  bindTextures(gifIndex: number): void {
    const { gl, textures } = this;
    textures.forEach((texture, i) => {
      if (texture instanceof Texture) texture.activate(gl, i);
      else texture.setFrame(gl, gifIndex, i);
    });
  }

  /**
   * Draws triangles based on the index buffer
   */
  render(): this {
    const { gl } = this;
    gl.drawElements(
      gl.TRIANGLES, // Type of shape
      this.indexBuffer.flatData.length, // Number of vertices
      gl.UNSIGNED_SHORT, // Type of the indices
      0 // Where to start
    );
    return this;
  }

  buffer(): Buffer {
    const { gl, width, height } = this;
    const buffer = Buffer.alloc(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
    return buffer;
  }

  pngBuffer(): Buffer {
    const { width, height } = this;
    const png = new PNG({ width, height });
    png.data = this.buffer();
    return PNG.sync.write(png);
  }

  async gifStream(
    frames: number,
    {
      fps = 24,
      noRepeat = false,
      quality,
      render
    }: {
      fps?: number;
      noRepeat?: boolean;
      quality?: number;
      render?: (t: number) => void;
    } = {}
  ): Promise<ReadStream> {
    const { width, height } = this;

    const tmpDir = join(tmpdir(), nanoid());
    await mkdir(tmpDir);
    const path = join(tmpDir, `cube.gif`);

    const writeStream = createWriteStream(path);

    const encoder = new GIFEncoder(width, height);
    encoder.writeHeader();
    if (!noRepeat) encoder.setRepeat(0);
    if (quality !== undefined) encoder.setQuality(quality);
    encoder.setFrameRate(fps);

    for (let i = 0; i < frames; i++) {
      render?.(i / fps);
      this.bindTextures(i);
      this.render();

      encoder.addFrame(this.buffer());
      writeStream.write(encoder.read());

      await new Promise(resolve => setImmediate(resolve));
    }
    encoder.finish();
    writeStream.end(encoder.read());

    const stream = createReadStream(path);
    stream.once('close', () => rm(tmpDir, { recursive: true }));
    return stream;
  }

  async mp4Stream(
    frames: number,
    audioPath: string,
    {
      fps = 24,
      render
    }: {
      fps?: number;
      render?: (t: number) => void;
    } = {}
  ): Promise<ReadStream> {
    const { width, height } = this;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    const tmpDir = join(tmpdir(), nanoid());
    await mkdir(tmpDir);

    for (let i = 0; i < frames; i++) {
      render?.(i / fps);
      this.bindTextures(i);
      this.render();

      imageData.data.set(this.buffer());
      ctx.putImageData(imageData, 0, 0);

      const path = join(tmpDir, `frame${i.toString().padStart(4, '0')}.png`);
      await writeFile(path, canvas.toBuffer('image/png'));

      await new Promise(resolve => setImmediate(resolve));
    }

    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: tmpDir })
        .input('frame%04d.png')
        .fps(fps)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt yuv420p'])
        .save('output.mp4')
        .once('end', resolve)
        .once('error', reject)
    );
    console.log(tmpDir);

    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: tmpDir })
        .addOptions([
          '-stream_loop -1',
          '-i output.mp4',
          `-i ${audioPath}`,
          '-shortest'
        ])
        .save('full.mp4')
        .once('end', resolve)
        .once('error', reject)
    );
    const outputPath = join(tmpDir, 'full.mp4');
    const stream = createReadStream(outputPath);
    stream.once('close', () => rm(tmpDir, { recursive: true }));
    return stream;
  }

  static unitCubeTextured = {
    vertexData: [
      // x, y, z -- u, v
      // Top
      [
        [-1, 1, -1, 0, 0],
        [-1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 1, -1, 1, 0]
      ],

      // Left
      [
        [-1, 1, 1, 0, 0],
        [-1, -1, 1, 1, 0],
        [-1, -1, -1, 1, 1],
        [-1, 1, -1, 0, 1]
      ],

      // Right
      [
        [1, 1, 1, 1, 1],
        [1, -1, 1, 0, 1],
        [1, -1, -1, 0, 0],
        [1, 1, -1, 1, 0]
      ],

      // Front
      [
        [1, 1, 1, 1, 1],
        [1, -1, 1, 1, 0],
        [-1, -1, 1, 0, 0],
        [-1, 1, 1, 0, 1]
      ],

      // Back
      [
        [1, 1, -1, 0, 0],
        [1, -1, -1, 0, 1],
        [-1, -1, -1, 1, 1],
        [-1, 1, -1, 1, 0]
      ],

      // Bottom
      [
        [-1, -1, -1, 1, 1],
        [-1, -1, 1, 1, 0],
        [1, -1, 1, 0, 0],
        [1, -1, -1, 0, 1]
      ]
    ],
    indexData: [
      // Top
      [
        [0, 1, 2],
        [0, 2, 3]
      ],

      // Left
      [
        [5, 4, 6],
        [6, 4, 7]
      ],

      // Right
      [
        [8, 9, 10],
        [8, 10, 11]
      ],

      // Front
      [
        [13, 12, 14],
        [15, 14, 12]
      ],

      // Back
      [
        [16, 17, 18],
        [16, 18, 19]
      ],

      // Bottom
      [
        [21, 20, 22],
        [22, 20, 23]
      ]
    ]
  };

  static screenData = {
    vertexData: [
      // x, y -- u, v
      [
        [-1, 1, 0, 1],
        [1, 1, 1, 1],
        [-1, -1, 0, 0],
        [1, -1, 1, 0]
      ]
    ],
    indexData: [
      [
        [0, 2, 3],
        [3, 1, 0]
      ]
    ]
  };
}
