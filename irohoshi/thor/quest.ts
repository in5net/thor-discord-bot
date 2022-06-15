/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageEmbed } from 'discord.js';
import { random } from '@limitlesspc/limitless';
import type { Message } from 'discord.js';

import { items, part, questions } from '../epiquest';
import { getText } from '../yyyyyyy.info';
import { command } from '$shared/command';
import type { Part } from '../epiquest/labyrinth';

const color = 0xfcc203;

export default command(
  {
    name: 'quest',
    desc: 'Epiquest!',
    args: []
  },
  async ({ channel, author }) => {
    const titles = ['Under', 'Re', 'Over', 'De', 'Underdere'];
    const title = random(titles);
    await channel.send(`Welcome to the ${title}titled Epiquest!`);

    let questionMsg: Message | undefined;
    let responseMsg: Message | undefined;

    const item = random(items)!;
    const inventory: string[] = [];
    let good = 0;
    let bad = 0;

    const strReplace = (str: string): string =>
      str.replaceAll('{title}', title).replaceAll('{item}', item.name);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]!;
      const { text, answers } = question;

      const embed = new MessageEmbed()
        .setTitle(strReplace(typeof text === 'string' ? text : text(inventory)))
        .setDescription(`${author}'s epiquest`)
        .setColor(color)
        .addField(
          'Answers',
          answers
            .map(
              ({ text, emoji }) =>
                `${emoji} - ${strReplace(
                  typeof text === 'string' ? text : text()
                )}`
            )
            .join('\n')
        );
      if (inventory.length) embed.addField('Inventory', inventory.join('\n'));

      if (!questionMsg)
        questionMsg = await channel.send({
          embeds: [embed]
        });
      else {
        await questionMsg.edit({
          embeds: [embed]
        });
        await questionMsg.reactions.removeAll();
      }

      for (const { emoji } of answers) {
        await questionMsg.react(emoji);
      }

      const collected = await questionMsg.awaitReactions({
        filter: ({ emoji }, { id, bot }) =>
          id === author.id &&
          !bot &&
          answers.some(answer => answer.emoji === emoji.name),
        max: 1,
        time: 60_000
      });
      const answerReaction = collected.first();
      if (answerReaction) {
        const answer =
          answers.find(answer => answer.emoji === answerReaction.emoji.name) ||
          answers[0];
        if (answer) {
          const { text, response, effect, end } = answer;
          console.log(`${answerReaction.emoji.name} - ${text}`);
          if (end) return channel.send(`${author}'s epiquest is over!`);

          switch (effect) {
            case 'good':
              good++;
              break;
            case 'bad':
              bad++;
          }
          if (response) {
            let text: string;
            if (typeof response === 'string') text = response;
            else {
              const result = response(inventory, item);
              if (typeof result === 'string') text = result;
              else {
                text = result.text;
                switch (result.effect) {
                  case 'good':
                    good++;
                    break;
                  case 'bad':
                    bad++;
                }
              }
            }
            let res = strReplace(text);
            if (res.includes('{random}')) {
              const text = await getText();
              const word = text.split(' ')[0] || '';
              res = res.replaceAll('{random}', word);
            }
            if (!responseMsg) responseMsg = await channel.send(`**> ${res}**`);
            else await responseMsg.edit(`**> ${res}**`);
            console.log(`Effect: +${good} -${bad}`);
          }
        }
      }
    }

    // Labyrinth
    let currentPart: Part = part;
    let wrong = 0;
    const timesMap = new WeakMap<Part, Record<string, number>>();
    console.log('labby time!');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { text, choices } = currentPart;

      const embed = new MessageEmbed()
        .setTitle(strReplace(text))
        .setDescription(`${author}'s epiquest`)
        .setColor(color)
        .addField(
          'Answers',
          choices
            .map(({ text, emoji }) => `${emoji} - ${strReplace(text)}`)
            .join('\n')
        );
      if (inventory.length) embed.addField('Inventory', inventory.join('\n'));

      if (!questionMsg)
        questionMsg = await channel.send({
          embeds: [embed]
        });
      else {
        await questionMsg.edit({
          embeds: [embed]
        });
        await questionMsg.reactions.removeAll();
      }

      for (const { emoji } of choices) {
        await questionMsg.react(emoji);
      }

      const collected = await questionMsg.awaitReactions({
        filter: ({ emoji }, { id, bot }) =>
          id === author.id &&
          !bot &&
          choices.some(choice => choice.emoji === emoji.name),
        max: 1,
        time: 60_000
      });
      const answerReaction = collected.first();
      if (answerReaction) {
        const choice =
          choices.find(choice => choice.emoji === answerReaction.emoji.name) ||
          choices[0];
        if (choice) {
          const { text, emoji, response, effect } = choice;
          console.log(`${answerReaction.emoji.name} - ${text}`);

          let times = timesMap.get(currentPart);
          if (!times) {
            times = {};
            timesMap.set(currentPart, times);
          }
          const t = times[emoji] || 0;
          times[emoji] = t + 1;

          switch (effect) {
            case 'good':
              good++;
              break;
            case 'bad':
              bad++;
              break;
            case 'wrong':
              wrong++;
              if (wrong >= 3) bad++;
          }

          if (response) {
            let text: string;
            if (typeof response === 'string') text = response;
            else {
              const result = response(t, wrong >= 3);
              if (typeof result === 'string') text = result;
              else {
                text = result.text;
                switch (result.effect) {
                  case 'good':
                    good++;
                    break;
                  case 'bad':
                    bad++;
                    break;
                  case 'wrong':
                    wrong++;
                    if (wrong >= 3) bad++;
                }
              }
            }
            let res = strReplace(text);
            if (res.includes('{random}')) {
              const text = await getText();
              const word = text.split(' ')[0] || '';
              res = res.replaceAll('{random}', word);
            }
            if (!responseMsg) responseMsg = await channel.send(`**> ${res}**`);
            else await responseMsg.edit(`**> ${res}**`);
            console.log(`Effect: +${good} -${bad}`);
          }

          const nextPart = choice.next?.(t);
          if (nextPart) currentPart = nextPart;
          else break;
        }
      }
    }

    return channel.send(`${author}'s epiquest is over!`);
  }
);
