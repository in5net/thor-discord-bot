import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { config, parse } from 'dotenv';

config({ path: join(__dirname, '../.env') });

const localEnvPath = join(__dirname, '../.env.local');
if (existsSync(localEnvPath)) {
  const env = parse(readFileSync(localEnvPath));
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
}
