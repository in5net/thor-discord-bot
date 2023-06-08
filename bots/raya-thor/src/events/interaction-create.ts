import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
} from "discord.js";
import * as messageCommands from "../commands/messages";
import * as rawCommands from "../commands/mod";
import textCommands from "../text-commands/mod";
import "./env";
import {
	type SlashCommand,
	type CommandGroups,
	type Commands,
	type OptionValue,
} from "$services/commands/slash";
import event from "$services/event";
import prisma from "$services/prisma";
import woof from "$services/woof";

const { default: oddNameCommands = {}, ...normalCommands } = rawCommands;
const commands = Object.fromEntries(
	Object.entries({
		...normalCommands,
		...oddNameCommands,
	} as unknown as Commands | CommandGroups).map(([name, command]) => [
		name,
		normalize(command),
	])
);
function normalize(
	command: SlashCommand | Commands | CommandGroups
): SlashCommand | Commands | CommandGroups {
	if (typeof command.desc === "string") return command as SlashCommand;

	const { default: oddNameCommands = {}, ...normalCommands } =
		command as unknown as Commands | CommandGroups;
	return Object.fromEntries(
		Object.entries({ ...oddNameCommands, ...normalCommands }).map(
			([subName, subCommand]) => [
				subName,
				normalize(subCommand as SlashCommand | Commands) as SlashCommand,
			]
		)
	);
}

function getCommand(
	i: ChatInputCommandInteraction | AutocompleteInteraction
): SlashCommand | void {
	const command = commands[i.commandName];
	if (!command) return;

	const subGroupName = i.options.getSubcommandGroup(false);
	if (subGroupName) {
		const subGroup = (command as CommandGroups)[subGroupName];
		if (!subGroup) return;

		const subName = i.options.getSubcommand();
		const subCommand = subGroup[subName];
		return subCommand;
	}

	const subName = i.options.getSubcommand(false);
	if (subName) {
		const subCommand = (command as Commands)[subName];
		return subCommand;
	}

	return command as SlashCommand;
}

const optionalPrefixCommands = Object.entries(textCommands)
	.filter(([, command]) => command.optionalPrefix)
	.map(([name]) => name);
console.log("Optional prefix commands:", optionalPrefixCommands);

export default event({ name: "interactionCreate" }, async ({ args: [i] }) => {
	if (i.isChatInputCommand()) {
		const command = getCommand(i);
		if (!command) return;

		const { options, permissions, handler } = command;
		const name = [
			i.commandName,
			i.options.getSubcommandGroup(false),
			i.options.getSubcommand(false),
		]
			.filter(Boolean)
			.join(" ");
		try {
			const { member } = i;
			if (
				permissions?.includes("vc") &&
				(!(member instanceof GuildMember) || !member?.voice.channel)
			)
				await i.reply(`${woof()}, you are not in a voice channel`);
			else
				await handler(
					i,
					Object.fromEntries(
						Object.entries(options).map(([name, { type, default: d }]) => {
							let value: OptionValue | undefined;
							switch (type) {
								case "string": {
									value = i.options.getString(name);
									break;
								}

								case "int": {
									value = i.options.getInteger(name);
									break;
								}

								case "float": {
									value = i.options.getNumber(name);
									break;
								}

								case "bool": {
									value = i.options.getBoolean(name);
									break;
								}

								case "choice": {
									value = i.options.getString(name);
									break;
								}

								case "user": {
									value = i.options.getUser(name);
									break;
								}

								case "channel": {
									value = i.options.getChannel(name);
									break;
								}

								case "attachment": {
									value = i.options.getAttachment(name);
								}
							}

							return [name, (value ?? d)!];
						})
					)
				);
			await prisma.commandExecution.create({
				data: {
					name,
					type: "Slash",
					userId: BigInt(i.user.id),
					channelId: BigInt(i.channelId),
					guildId: i.guildId ? BigInt(i.guildId) : undefined,
				},
			});
		} catch (error) {
			console.error(`Error while running command '${name}':`, error);
			if (error instanceof Error) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setTitle("Error")
					.setDescription(error.message)
					.setTimestamp();
				if (i.replied)
					await i
						.followUp({ embeds: [embed], ephemeral: true })
						.catch(console.error);
				else if (i.deferred)
					await i.editReply({ embeds: [embed] }).catch(console.error);
				else
					await i
						.reply({ embeds: [embed], ephemeral: true })
						.catch(console.error);
			}
		}
	} else if (i.isAutocomplete()) {
		const command = getCommand(i);
		if (!command) return;

		const option = i.options.getFocused(true);
		const handleAutocomplete = command.options[option.name]?.autocomplete;
		if (!handleAutocomplete) return;

		const options = await handleAutocomplete(option.value, i);
		return i
			.respond(
				Array.isArray(options)
					? options.map(o => ({
							name: o.toString(),
							value: o,
					  }))
					: Object.entries(options).map(([name, value]) => ({
							name,
							value,
					  }))
			)
			.catch(console.error);
	} else if (i.isMessageContextMenuCommand()) {
		const command = Object.values(messageCommands).find(
			({ name }) => name === i.commandName
		);
		if (!command) return;

		const { handler } = command;
		const name = i.commandName;
		try {
			await handler(i);
			await prisma.commandExecution.create({
				data: {
					name,
					type: "Message",
					userId: BigInt(i.user.id),
					messageId: BigInt(i.targetId),
					channelId: BigInt(i.channelId),
					guildId: i.guildId ? BigInt(i.guildId) : undefined,
				},
			});
		} catch (error) {
			console.error(`Error while running command '${name}':`, error);
			if (error instanceof Error) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setTitle("Error")
					.setDescription(error.message)
					.setTimestamp();
				if (i.replied)
					await i
						.followUp({ embeds: [embed], ephemeral: true })
						.catch(console.error);
				else if (i.deferred)
					await i.editReply({ embeds: [embed] }).catch(console.error);
				else
					await i
						.reply({ embeds: [embed], ephemeral: true })
						.catch(console.error);
			}
		}
	}
});
