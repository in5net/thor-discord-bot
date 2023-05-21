export interface Item {
  name: string;
  emoji: string;
  desc: string;
}

const items: Item[] = [
  {
    name: 'gem',
    emoji: '💎',
    desc: 'You lost the glowy purple gem of doom and need to get it back! Hurry! The world (And your paycheck) depends upon it!'
  },
  {
    name: 'potato bar wrapper',
    emoji: '🥔',
    desc: 'You were eating a potato bar when suddenly a huge gust of wind blew it right out of your hand. No big deal… WAIT! There’s still some potato bar left in the wrapper! After it!'
  },
  {
    name: 'celestial ooze',
    emoji: '☄️',
    desc: 'You were casually floating around in space, when suddenly a jelly plorps out some good lookin ooze that would make your hair FANTASTIC! You need that sparkly goop, and pronto!'
  },
  {
    name: 'blueprint of cuisine',
    emoji: '📝',
    desc: 'In the darkest reaches of the greenspire jungle you finally find what you’ve been looking for- The Legendary Blueprint of cuisine! As you reach out for it a trap springs, and the blueprint zips into the sky. Quick! After it!'
  },
  {
    name: '3 liter hat',
    emoji: '🎩',
    desc: 'You’ve been on the lookout for the perfect soup for a while, when suddenly, you see a hat that looks like the perfect container to hold your future soup in! Unfortunately it grows legs and walks away! What a smart hat! GET IT!'
  },
  {
    name: 'magicka potion',
    emoji: '🍾',
    desc: 'You were grinding one day when suddenly you realize you are out of magicka! Quickly! After that one that’s rapidly retreating!'
  },
  {
    name: 'jellium chip',
    emoji: '🍪',
    desc: 'Here it is… The jellium chip with the source code to yyyyyyy.info on it! You just need to remove it very carefully… OH NO! You dropped it due to lack of oxygen! Chase it down!'
  }
];
export default items;
