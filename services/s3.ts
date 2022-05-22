import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';

import { DATABASE_PATH } from './path';

// SimpleStringStorage
export default class S3 {
  private path: string;
  private lines: string[] = [];

  constructor(readonly name: string) {
    const path = join(DATABASE_PATH, `${name}.txt`);
    try {
      const str = readFileSync(path, 'utf8');
      this.lines = str.split('\n');
    } catch {
      //
    }
    this.path = path;
  }

  get data(): readonly string[] {
    return this.lines;
  }

  add(...items: string[]) {
    this.lines.push(...items);
    return appendFile(this.path, `${items.join('\n')}\n`, 'utf8');
  }
}
