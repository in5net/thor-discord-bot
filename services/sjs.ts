/* eslint-disable no-underscore-dangle */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { DATABASE_PATH } from './path';

export default class SimpleJSONStorage<T extends Record<string, any>> {
  private path: string;
  private _data = {} as T;

  constructor(readonly name: string) {
    const path = join(DATABASE_PATH, `${name}.json`);
    try {
      const str = readFileSync(path, 'utf8');
      this._data = JSON.parse(str);
    } catch {
      //
    }
    this.path = path;
  }

  get data(): T {
    return this._data;
  }

  save() {
    const str = JSON.stringify(this.data);
    return writeFile(this.path, str, 'utf8');
  }

  update(updater: (data: T) => T) {
    this._data = updater(this._data);
    this.save();
  }
}
