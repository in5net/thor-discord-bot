import { png } from './deps.ts';

import {
  copyToBuffer,
  createBufferInit,
  createCapture,
  createPng
} from './utils.ts';

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();
if (!device) throw new Error('No GPU device available');

const vertices = [
  // x, y, u, v
  [-1, 1, 0, 0],
  [1, 1, 1, 0],
  [-1, -1, 0, 1],
  [1, -1, 1, 1]
];

const verticesArray = new Float32Array(vertices.flat());
const vertexBuffer = createBufferInit(device, {
  label: 'vertex buffer',
  usage: GPUBufferUsage.VERTEX,
  contents: verticesArray.buffer
});

const ITERATIONS = 100;
const SIZE = 2;
const uniforms = new Float32Array([ITERATIONS, SIZE]);
const uniformBuffer = createBufferInit(device, {
  label: 'uniform buffer',
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  contents: uniforms.buffer
});

const { width, height, image, lineSize } = await png.decode(
  await Deno.readFile(new URL('./texture.png', import.meta.url))
);
const size = {
  width,
  height
};
const texture = device.createTexture({
  size,
  format: 'rgba8unorm-srgb',
  usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
});
const textureView = texture.createView({
  label: 'texture view',
  format: 'rgba8unorm-srgb'
});
device.queue.writeTexture({ texture }, image, { bytesPerRow: lineSize }, size);

const sampler = device.createSampler({
  label: 'sampler',
  minFilter: 'linear',
  magFilter: 'linear',
  addressModeU: 'repeat',
  addressModeV: 'repeat'
});

const bindGroupLayoutEntries: Omit<GPUBindGroupLayoutEntry, 'binding'>[] = [
  {
    visibility: GPUShaderStage.FRAGMENT,
    buffer: {
      minBindingSize: uniforms.byteLength
    }
  },
  {
    visibility: GPUShaderStage.FRAGMENT,
    texture: {
      sampleType: 'float'
    }
  },
  {
    visibility: GPUShaderStage.FRAGMENT,
    sampler: {
      type: 'filtering'
    }
  }
];
const bindGroupLayout = device.createBindGroupLayout({
  entries: bindGroupLayoutEntries.map((entry, index) => ({
    binding: index,
    ...entry
  }))
});

const bindGroupEntryResources: GPUBindGroupEntry['resource'][] = [
  { buffer: uniformBuffer },
  textureView,
  sampler
];
const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: bindGroupEntryResources.map((resource, index) => ({
    binding: index,
    resource
  }))
});

const shader = device.createShaderModule({
  label: 'shader',
  code: await Deno.readTextFile(new URL('./shader.wgsl', import.meta.url))
});

const pipeline = device.createRenderPipeline({
  label: 'render pipeline',
  layout: device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout]
  }),
  primitive: {
    topology: 'triangle-strip'
  },
  vertex: {
    module: shader,
    entryPoint: 'vs_main',
    buffers: [
      {
        arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
        attributes: [
          {
            format: 'float32x2',
            offset: 0,
            shaderLocation: 0
          },
          {
            format: 'float32x2',
            offset: 2 * Float32Array.BYTES_PER_ELEMENT,
            shaderLocation: 1
          }
        ]
      }
    ]
  },
  fragment: {
    module: shader,
    entryPoint: 'fs_main',
    targets: [
      {
        format: 'rgba8unorm-srgb'
      }
    ]
  }
});

function render(encoder: GPUCommandEncoder, view: GPUTextureView) {
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: view,
        storeOp: 'store',
        loadValue: [0, 0, 0, 0]
      }
    ]
  });

  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(vertices.length);
  renderPass.endPass();
}

const { texture: captureTexture, outputBuffer } = createCapture(device, size);
const encoder = device.createCommandEncoder();
render(encoder, captureTexture.createView());
copyToBuffer(encoder, captureTexture, outputBuffer, size);
device.queue.submit([encoder.finish()]);
await createPng(outputBuffer, size);
