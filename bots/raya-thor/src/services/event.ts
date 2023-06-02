import type { Client, ClientEvents } from 'discord.js';

type MaybePromise<T> = PromiseLike<T> | T;

const event = <T extends keyof ClientEvents>(
  options: { name: T; once?: boolean },
  listener: (data: {
    client: Client;
    args: ClientEvents[T];
  }) => MaybePromise<any>
) => ({
  ...options,
  listener,
});
export default event;

export type Event = ReturnType<typeof event>;
