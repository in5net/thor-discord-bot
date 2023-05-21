import { Model } from './shared';

export const model = new Model(
  'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
  {
    width: 512,
    height: 512,
    prompt_strength: 0.8,
    num_inference_steps: 50,
    guidance_scale: 7.5
  }
);

export const generate = (
  prompt: string,
  {
    num_outputs,
    negative_prompt
  }: { num_outputs: number; negative_prompt?: string }
) => model.generate({ prompt, negative_prompt, num_outputs });
