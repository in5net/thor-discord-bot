import command from "discord/commands/text";

const chars = "abcdefghijklmnoprstuvwxyzABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
const superscript =
	"ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹";

export default command(
	{
		desc: "Converts a message to superscript",
		args: {
			message: {
				type: "text",
				desc: "The message to convert",
			},
		},
	},
	async ({ args: { message } }) => {
		const converted = message
			.split("")
			.map(char => {
				const index = chars.indexOf(char);
				return superscript[index] || char;
			})
			.join("");
		return converted;
	},
);
