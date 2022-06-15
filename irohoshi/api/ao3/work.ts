import { parseFromString } from '../parser.ts';
import ORIGIN from './origin.ts';

const query = `${ORIGIN}/works/`;
const ao3Regex = new RegExp(`${query}(\\d+)`);

export function getWorkId(url: string): string {
  if (!url.match(ao3Regex)) return '';
  return url.replace(query, '').split(/\/|\?|#/)[0] || '';
}

export const ratings = {
  general: 'General Audiences',
  teen: 'Teen And Up Audiences',
  mature: 'Mature',
  explicit: 'Explicit'
};
export type Rating = keyof typeof ratings;

export const contentWarnings = {
  violence: 'Graphic Depictions of Violence',
  death: 'Major Character Death',
  rape: 'Rape/Non-Con',
  underage: 'Underage Sex'
};
export type Warning = keyof typeof contentWarnings;

export const relationshipOrientations = {
  lesbian: 'F/F',
  straight: 'F/M',
  gen: 'Gen',
  gay: 'M/M',
  multi: 'Multi',
  other: 'Other'
};
export type RelationshipOrientation = keyof typeof relationshipOrientations;

export const symbolsOrigin =
  'https://archiveofourown.org/images/skins/iconsets/default/';
export const symbols = {
  rating: {
    general: 'rating-general-audience',
    teen: 'rating-teen',
    mature: 'rating-mature',
    explicit: 'rating-explicit',
    none: 'rating-notrated'
  },
  orientation: {
    lesbian: 'category-femslash',
    straight: 'category-het',
    gen: 'category-gen',
    gay: 'category-slash',
    multi: 'category-multi',
    other: 'category-other',
    none: 'category-none'
  },
  warning: {
    undefined: 'warning-choosenotto',
    yes: 'warning-yes',
    no: 'warning-no',
    external: 'warning-external-work'
  },
  complete: {
    yes: 'complete-yes',
    no: 'complete-no',
    unknown: 'category-none'
  }
};

type ObjectValues<T> = T[keyof T];

export interface Work {
  id: string;
  url: string;
  title: string;
  author: string;
  rating?: Rating;
  warnings?: Warning[];
  categories: RelationshipOrientation[];
  fandoms: string[];
  relationships: string[];
  characters: string[];
  tags: string[];
  language: string;
  series?: {
    id: string;
    title: string;
  };
  stats: {
    published: Date;
    updated?: Date;
    words: number;
    chapters: [current: number, total: number];
    kudos: number;
    bookmarks: number;
    hits: number;
  };
  symbols: {
    rating: ObjectValues<typeof symbols.rating>;
    orientation: ObjectValues<typeof symbols.orientation>;
    warning: ObjectValues<typeof symbols.warning>;
    complete: ObjectValues<typeof symbols.complete>;
  };
}
export async function getWork(id: string): Promise<Work> {
  const response = await fetch(`${query}${id}?view_adult=true`);
  const html = await response.text();
  const $ = parseFromString(html)!;

  const rating = $.querySelector(
    '#main > div.wrapper > dl > dd.rating.tags > ul > li > a'
  )?.textContent;
  const warnings = [
    ...$.querySelectorAll('#main > div.wrapper > dl > dd.warning.tags a')
  ].map(el => el.textContent);
  const categories = [
    ...$.querySelectorAll('#main > div.wrapper > dl > dd.category.tags > ul a')
  ].map(el => el.textContent);
  const series = $.querySelector(
    '#main div.wrapper > dl > dd.series > span > span.position > a'
  );
  const stats = $.querySelector('#main div.wrapper > dl > dd.stats > dl')!;
  const status = stats.querySelector('dd.status')?.textContent;

  const work = {
    id,
    url: `${query}${id}`,
    title: $.querySelector('h2.title')!.textContent,
    author: $.querySelector('#workskin > div.preface.group > h3 > a')!
      .textContent,
    rating: Object.entries(ratings).find(([, x]) => rating === x)?.[0] as
      | Rating
      | undefined,
    warnings:
      warnings[0] === 'No Archive Warnings Apply'
        ? []
        : warnings[0] === 'Creator Chose Not To Use Archive Warnings'
        ? undefined
        : (warnings.map(
            warning =>
              Object.entries(contentWarnings).find(
                ([, x]) => warning === x
              )?.[0]
          ) as Warning[]),
    categories: categories.map(
      category =>
        Object.entries(relationshipOrientations).find(
          ([, x]) => category === x
        )?.[0] || 'other'
    ) as RelationshipOrientation[],
    fandoms: [
      ...$.querySelectorAll(
        '#main > div.wrapper > dl > dd.fandom.tags > ul > li > a'
      )
    ].map(el => el.textContent),
    relationships: [
      ...$.querySelectorAll(
        '#main > div.wrapper > dl > dd.relationship.tags > ul a'
      )
    ].map(el => el.textContent as RelationshipOrientation),
    characters: [
      ...$.querySelectorAll(
        '#main > div.wrapper > dl > dd.character.tags > ul a'
      )
    ].map(el => el.textContent),
    tags: [
      ...$.querySelectorAll(
        '#main > div.wrapper > dl > dd.freeform.tags > ul a'
      )
    ].map(el => el.textContent),
    language: $.querySelector(
      '#main > div.wrapper > dl > dd.language'
    )!.textContent.trim(),
    series: series
      ? {
          id: series.getAttribute('href')?.replace('/series/', '') || '',
          title: series.textContent
        }
      : undefined,
    stats: {
      published: new Date(
        `${stats.querySelector('dd.published')?.textContent} `
      ),
      updated: status ? new Date(`${status} `) : undefined,
      words: parseInt(stats.querySelector('dd.words')!.textContent),
      chapters: stats
        .querySelector('dd.chapters')!
        .textContent.split('/')
        .map(x => parseInt(x)) as [number, number],
      kudos: parseInt(stats.querySelector('dd.kudos')!.textContent),
      bookmarks: parseInt(stats.querySelector('dd.bookmarks a')!.textContent),
      hits: parseInt(stats.querySelector('dd.hits')!.textContent)
    }
  };
  return {
    ...work,
    symbols: {
      rating: symbols.rating[work.rating || 'none'],
      orientation:
        work.categories.length > 1
          ? symbols.orientation.multi
          : symbols.orientation[work.categories[0] || 'none'],
      warning:
        symbols.warning[
          work.warnings ? (work.warnings.length ? 'yes' : 'no') : 'undefined'
        ],
      complete:
        symbols.complete[
          work.stats.chapters[0] >= work.stats.chapters[1] ? 'yes' : 'no'
        ]
    }
  };
}
export async function getWorks(ids: string[]): Promise<Work[]> {
  const works: Work[] = [];
  for (const id of ids) {
    works.push(await getWork(id));
  }
  return works;
}
