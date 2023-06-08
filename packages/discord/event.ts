import { type Client, type ClientEvents } from "discord.js";

type MaybePromise<T> = PromiseLike<T> | T;

export type EventListener<T extends keyof ClientEvents> = (data: {
	client: Client;
	args: ClientEvents[T];
}) => MaybePromise<any>;

const event = <T extends keyof ClientEvents>(
	options: { name: T; once?: boolean },
	listener: EventListener<T>
) => ({
	...options,
	listener,
});
export default event;

export type Event = ReturnType<typeof event>;
