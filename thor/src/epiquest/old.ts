import { MessageEmbed } from 'discord.js';
import { random } from '@limitlesspc/limitless';

import type Command from '../commands/command';

const questions: {
  text: string;
  img?: string;
  answers: {
    text: string;
    emoji: string;
  }[];
}[] = [
  {
    text: 'WHaT iZ Ur NaMe?',
    answers: [
      { text: 'Zampopulus', emoji: '🐼' },
      { text: 'IM A NUKE', emoji: '💥' },
      { text: "I'm That Guy/Person/cr3ature", emoji: '🤖' }
    ]
  },
  {
    text: "The gem is on a rhino's horn!",
    img: '1C40JMSLURMyq8hbopMccRue0-UHq-iIm',
    answers: [
      { text: 'Snatch it!', emoji: '🐘' },
      { text: 'GET OUTA THERE', emoji: '🚫' },
      { text: "Question why it's there", emoji: '🤔' },
      { text: 'Count your fingers', emoji: '🖐' },
      { text: 'Call the AIr force (One use)', emoji: '🛫' },
      { text: 'Look at your surroundings', emoji: '🔍' },
      { text: 'Use the teleporter (One use)', emoji: '🚡' }
    ]
  },
  {
    text: "The gem is on a zamboni that's falling off a cliff!",
    img: '1DvMlCVOme9Yqzhfxp1VGGhxJ8Wnp8_h_',
    answers: [
      { text: 'Chase it down!', emoji: '🐘' },
      {
        text: 'Think about your future, how you could have a good life without that gem',
        emoji: '🤔'
      },
      { text: 'Use the teleporter! (One use)', emoji: '🚡' },
      { text: 'Ummm... oh, poop', emoji: '💩' },
      { text: 'Use a unsturdy bridge to get to it', emoji: '🚧' },
      { text: 'SKYDIVING!!!', emoji: '🚀' },
      { text: 'Call the AIr force! (One use)', emoji: '🛫' }
    ]
  },
  {
    text: 'The gem is about to get delet!',
    img: '1ExUphXeluXJfFdwD-sQ9FbGzfJhvSKRM',
    answers: [
      { text: 'RUUUUUNNNNNN!!!!!', emoji: '🚀' },
      { text: 'Call it a suzy Q hoarder', emoji: '💩' },
      { text: 'I HATE THaT GEM!!!', emoji: '💥' },
      { text: 'Shoot it with a sniper rifle', emoji: '🔫' },
      { text: 'Call the AIr force (One use)', emoji: '🛫' },
      { text: 'Use the teleporter (One use)', emoji: '🚡' }
    ]
  },
  {
    text: 'Now do a good job and GET THAT GEM!!!',
    answers: [
      { text: "I'm trying! (Only do!)", emoji: '💪' },
      { text: "I have it! (You don't)", emoji: '💎' },
      { text: 'Taze your boss (You can)', emoji: '🎩' },
      { text: 'Use the zamboni (What a waste) (1)', emoji: '🍆' },
      { text: 'Use the discharge (What a waste) (1)', emoji: '🧯' }
    ]
  },
  {
    text: 'A derpy slime has the gem!!!',
    img: '1U-hNKXi9VAUkeeVHhfMxhVKAa8-l-NX5',
    answers: [
      { text: 'I am delet (if)', emoji: '💥' },
      { text: 'Jump on slime', emoji: '🐡' },
      { text: 'Enslave the slime', emoji: '🐙' },
      { text: 'I AM PYROMANIACAL', emoji: '🔥' },
      { text: 'Use the zamboni (if)', emoji: '🍆' },
      { text: 'Use the discharge (if)', emoji: '🧯' }
    ]
  },
  {
    text: 'The gem is going to be exploded',
    img: '1NgQofRljxqsMqiYRKoeT_m2giY4kNNoE',
    answers: [
      { text: 'I am delet (if)', emoji: '💥' },
      { text: 'huh, a chezburg', emoji: '🍔' },
      {
        text: 'lecture bill nye for letting this happen (THE SCIENCE GUY)',
        emoji: '🔬'
      },
      { text: 'Et the gem', emoji: '🥂' },
      { text: 'use a gettling gun on the gem', emoji: '🔫' },
      { text: 'Use the zamboni (If)', emoji: '🍆' },
      { text: 'Use the discharge (If)', emoji: '🧯' }
    ]
  },
  {
    text: 'The gem was gemnapped by the jellyfish gif',
    img: '1dwEyF3eBxSHbyfoL6XlyPQdt3abulVNU',
    answers: [
      { text: 'I am delet (gif)', emoji: '💥' },
      { text: 'PPPPPPPPHHHHHTTTTTT HHAAAAAAAAAAA', emoji: '💣' },
      { text: 'BAAHAHAHAHAHAHAHAHAHA', emoji: '😆' },
      { text: 'GAHHHHAHAHAAAAAAA', emoji: '😂' },
      { text: "That doesn't make any se9nse", emoji: '🤔' },
      { text: 'Use the zamBOnI (If)', emoji: '🍆' },
      { text: 'Use the discharge (If)', emoji: '🧯' }
    ]
  },
  {
    text: "(your boss don't look so good)",
    img: '1ONgH0UkSsBaHDcvGd_2boNd6kj2LGP6-',
    answers: [
      { text: 'R U DRAGON BRO?', emoji: '🐉' },
      { text: 'r u dragon bro?', emoji: '🐍' },
      { text: 'ARE YOU DRAGON BROOOOO!!!!!!!!!', emoji: '🦐' }
    ]
  }
];

const quest: Command = async ({ channel }) => {
  const titles = ['Under', 'Re', 'Over', 'De', 'Underdere'];
  await channel.send(`${random(titles)}titled Epiquest!`);

  for (let i = 0; i < questions.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const question = questions[i]!;
    const { text, img, answers } = question;
    const embed = new MessageEmbed()
      .setTitle(`Question #${i + 1}`)
      .setDescription(text)
      .setColor(0xfcc203)
      .addField(
        'Answers',
        answers.map(({ text, emoji }) => `${emoji} - ${text}`).join('\n')
      );

    if (img)
      embed.setImage(`https://drive.google.com/uc?id=${img}&export=download`);
    const message = await channel.send({
      embeds: [embed]
    });

    answers.map(({ emoji }) => message.react(emoji));

    const collected = await message.awaitReactions({
      filter: ({ emoji }, { bot }) =>
        !bot && answers.some(answer => answer.emoji === emoji.name),
      max: 1,
      time: 60_000
    });
    const answerReaction = collected.first();
    console.log(answerReaction?.emoji.name);
    if (answerReaction) {
      const answer = answers.find(
        answer => answer.emoji === answerReaction.emoji.name
      );
      await channel.send(`A: ${answer?.text}`);
    }
  }

  return channel.send('Epiquest is over!');
};
export default quest;
