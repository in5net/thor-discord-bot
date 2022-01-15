import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const localEnvPath = join(__dirname, '../.env.local');
if (existsSync(localEnvPath)) {
  const env = dotenv.parse(readFileSync(localEnvPath));
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
}
