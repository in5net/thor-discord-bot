import { pluralize } from "@in5net/limitless";
import command from "$services/commands/text";

const RTX_4090_PRICE = 1600;

export default command(
	{
		desc: "Calculates the number of RTX 4090s you can buy with a given price",
		args: {
			price: {
				type: "float",
				desc: "The amount of money you have to spend on RTX 4090s",
			},
		},
	},
	async ({ message, args: { price } }) => {
		const count = price / RTX_4090_PRICE;
		await message.channel.send(
			`You can buy ${count.toLocaleString("en-US", {
				maximumFractionDigits: 2,
			})} ${pluralize("RTX 4090", count)} with $${price}`
		);
	}
);
