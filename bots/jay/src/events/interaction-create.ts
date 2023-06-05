import { EmbedBuilder } from "discord.js";
import { type OptionValue } from "$services/commands/slash";
import event from "$services/event";
import prisma from "$services/prisma";

export default event(
	{ name: "interactionCreate" },
	async ({ client, args: [i] }) => {
		if (!i.isChatInputCommand() && !i.isAutocomplete()) return;
		const commandName = [
			i.options.getSubcommandGroup(false),
			i.options.getSubcommand(false),
			i.commandName,
		]
			.filter(Boolean)
			.join(" ");

		const command = client.slashCommands.get(commandName);
		if (!command) return;

		if (i.isChatInputCommand()) {
			const { options, handler } = command;
			const name = [
				i.commandName,
				i.options.getSubcommandGroup(false),
				i.options.getSubcommand(false),
			]
				.filter(Boolean)
				.join(" ");
			try {
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
		}
	}
);
