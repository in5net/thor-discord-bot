import { objectKeys } from '@in5net/limitless';
import { IssueReason } from '@prisma/client';

import command from '$commands/slash';
import { createEmbed } from '$services/embed';
import prisma from '$services/prisma';

export default command(
  {
    desc: 'Update an issue',
    options: {
      issue: {
        type: 'int',
        desc: 'The name off the issue search for',
        autocomplete: async search => {
          const issues = await prisma.issue.findMany({
            select: {
              id: true,
              name: true
            },
            where: {
              name: {
                contains: search
              },
              closedAt: null
            },
            orderBy: {
              name: 'asc'
            },
            take: 5
          });
          return Object.fromEntries(issues.map(({ id, name }) => [name, id]));
        }
      },
      reason: {
        type: 'choice',
        desc: 'Reason for closing',
        choices: objectKeys(IssueReason)
      }
    }
  },
  async (i, { issue, reason }) => {
    if (i.user.id !== process.env.OWNER_ID)
      return i.reply('Only my owner can update issues');

    const { name } = await prisma.issue.update({
      select: {
        name: true
      },
      data: {
        closedAt: new Date(),
        reason
      },
      where: {
        id: issue
      }
    });
    return i.reply({
      embeds: [
        createEmbed()
          .setTitle('Issue closed')
          .setDescription(`#${issue}: ${name}`)
      ]
    });
  }
);
