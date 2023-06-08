import {
	type Awaitable,
	type MessageContextMenuCommandInteraction,
} from "discord.js";

type Handler = (i: MessageContextMenuCommandInteraction) => Awaitable<any>;

export interface MessageCommand {
	name: string;
	handler: Handler;
}

const command = (name: string, handler: Handler): MessageCommand => ({
	name,
	handler,
});
export default command;
