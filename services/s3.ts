import { join } from 'node:path';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

import { DATABASE_PATH } from './path';

// SimpleStringStorage
export default class S3 {
  private path: string;
  private lines: string[] = [];

  constructor(readonly name: string) {
    const path = join(DATABASE_PATH, `${name}.txt`);
    if (existsSync(path)) {
      const str = readFileSync(path, 'utf8');
      this.lines = str.split('\n');
    }
    this.path = path;
  }

  get data(): readonly string[] {
    return this.lines;
  }

  add(...items: string[]) {
    this.lines.push(...items);
    appendFileSync(this.path, `${items.join('\n')}\n`, 'utf8');
  }
}
