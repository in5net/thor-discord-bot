import { type Awaitable, type Client, type ClientEvents } from "discord.js";

export type EventListener<T extends keyof ClientEvents> = (data: {
  client: Client;
  args: ClientEvents[T];
}) => Awaitable<any>;

const event = <T extends keyof ClientEvents>(
  options: { name: T; once?: boolean },
  listener: EventListener<T>,
) => ({
  ...options,
  listener,
});
export default event;

export type Event = ReturnType<typeof event>;
