/* eslint-disable no-underscore-dangle */
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

import { DATABASE_PATH } from './path';

export default class SimpleJSONStorage<T extends Record<string, any>> {
  private path: string;
  private _data = {} as T;

  constructor(readonly name: string) {
    this.path = join(DATABASE_PATH, `${name}.json`);
    try {
      const str = readFileSync(this.path, 'utf8');
      this._data = JSON.parse(str);
    } catch (error) {
      console.error(error);
    }
  }

  get data(): T {
    return this._data;
  }

  save() {
    const str = JSON.stringify(this.data);
    writeFileSync(this.path, str, 'utf8');
  }

  update(updater: (data: T) => T) {
    this._data = updater(this._data);
    this.save();
  }
}
