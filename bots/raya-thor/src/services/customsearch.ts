import { customsearch } from '@googleapis/customsearch';

export const api = customsearch({
  version: 'v1',
  auth: process.env.GOOGLE_APIS_KEY
});

export default class ImageSearch {
  private urls: string[] = [];
  private start = 0;

  constructor(readonly query?: string) {}

  next(): Promise<string> {
    this.start++;
    return this.search();
  }
  hasPrev(): boolean {
    return this.start > 1;
  }

  prev(): Promise<string> {
    this.start--;
    return this.search();
  }

  private async search(): Promise<string> {
    const { query, urls, start } = this;
    const url = urls[start - 1];
    if (url) return url;

    const result = await api.cse.list({
      q: query,
      cx: process.env.CUSTOM_SEARCH_ID,
      searchType: 'image',
      imgSize: 'medium',
      num: 1,
      start
    });
    const item = result.data.items?.[0];
    if (!item?.link) throw new Error('No results');
    return (urls[start - 1] = item.link);
  }
}
