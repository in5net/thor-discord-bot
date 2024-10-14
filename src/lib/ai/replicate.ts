import { env } from "node:process";
import Replicate from "replicate";

export const replicate = new Replicate({
  auth: env.REPLICATE_TOKEN,
});
