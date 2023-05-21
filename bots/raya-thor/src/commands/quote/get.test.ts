import type { SpeechBubble } from '@prisma/client';
import test from 'node:test';

import prisma from '$services/prisma';

test('quote', async () => {
  const [quote] = await prisma.$queryRaw<[SpeechBubble]>`SELECT *
    FROM SpeechBubble
    ORDER BY RAND()
    LIMIT 1;`;
  console.log(quote);
});
