import { png } from './deps.ts';

import { copyToBuffer, createCapture, createPng, Dimensions } from './utils.ts';

const dimensions: Dimensions = {
  width: 200,
  height: 200
};

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();
if (!device) {
  console.error('no suitable adapter found');
  Deno.exit(0);
}
const encoder = device.createCommandEncoder({ label: 'command encoder' });

const vertices = new Float32Array([
  // x, y, u, v
  1, 1, 1, 0, 1, -1, 1, 1, -1, -1, 0, 1, 1, 1, 1, 0, -1, -1, 0, 1, -1, 1, 0, 0
]);
const vertexBuffer = device.createBuffer({
  label: 'vertex buffer',
  usage: GPUBufferUsage.VERTEX,
  size: vertices.byteLength,
  mappedAtCreation: true
});
new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
vertexBuffer.unmap();

const shaderModule = device.createShaderModule({
  label: 'shader module',
  code: (await Deno.readTextFile(new URL('./shader.wgsl', import.meta.url)))
    .replaceAll('ITERATIONS', '100')
    .replaceAll('SIZE', '2.0')
});

const renderPipeline = device.createRenderPipeline({
  label: 'render pipeline',
  primitive: {
    topology: 'triangle-list'
  },
  vertex: {
    module: shaderModule,
    entryPoint: 'vs_main',
    buffers: [
      {
        arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x2'
          },
          {
            shaderLocation: 1,
            offset: 2 * Float32Array.BYTES_PER_ELEMENT,
            format: 'float32x2'
          }
        ]
      }
    ]
  },
  fragment: {
    module: shaderModule,
    entryPoint: 'fs_main',
    targets: [
      {
        format: 'rgba8unorm-srgb'
      }
    ]
  }
});

const sampler = device.createSampler({
  label: 'sampler',
  minFilter: 'linear',
  magFilter: 'linear',
  addressModeU: 'repeat',
  addressModeV: 'repeat'
});
const texture = await imageToTexture(
  device,
  new URL('./input.png', import.meta.url)
);

const bindGroupLayout = device.createBindGroupLayout({
  label: 'bind group layout',
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {
        type: 'filtering'
      }
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {
        sampleType: 'float'
      }
    }
  ]
});
const bindGroup = device.createBindGroup({
  label: 'bind group',
  layout: bindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: sampler
    },
    {
      binding: 1,
      resource: texture.createView({
        label: 'texture view',
        format: 'rgba8unorm-srgb'
      })
    }
  ]
});

const { texture: captureTexture, outputBuffer } = createCapture(
  device,
  dimensions
);

const renderPass = encoder.beginRenderPass({
  label: 'render pass',
  colorAttachments: [
    {
      view: captureTexture.createView(),
      storeOp: 'store',
      loadValue: [0, 0, 0, 0]
    }
  ]
});
renderPass.setPipeline(renderPipeline);
renderPass.setBindGroup(0, bindGroup);
renderPass.setVertexBuffer(0, vertexBuffer);
renderPass.draw(6);
renderPass.endPass();

copyToBuffer(encoder, captureTexture, outputBuffer, dimensions);

device.queue.submit([encoder.finish()]);

await createPng(outputBuffer, dimensions);

async function imageToTexture(
  device: GPUDevice,
  imagePath: string | URL
): Promise<GPUTexture> {
  const file = await Deno.readFile(imagePath);
  const { width, height, image } = await png.decode(file);

  const texture = device.createTexture({
    label: 'texture',
    size: [width, height],
    format: 'rgba8unorm-srgb',
    usage: GPUTextureUsage.COPY_DST
  });

  device.queue.writeTexture({ texture }, image, { bytesPerRow: width * 4 }, [
    width,
    height
  ]);

  return texture;
}
