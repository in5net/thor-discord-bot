import { join } from 'node:path';
import { appendFileSync, readFileSync } from 'node:fs';

import { DATABASE_PATH } from './path';

// SimpleStringStorage
export default class S3 {
  private path: string;
  private lines: string[];

  constructor(readonly name: string) {
    this.path = join(DATABASE_PATH, `${name}.txt`);
    const str = readFileSync(this.path, 'utf8');
    this.lines = str.split('\n');
  }

  get data(): readonly string[] {
    return this.lines;
  }

  add(...items: string[]) {
    this.lines.push(...items);
    appendFileSync(this.path, `${items.join('\n')}\n`, 'utf8');
  }
}
