import command from "$lib/discord/commands/text";

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
    examples: ["can you believe it"],
  },
  async ({ args: { message } }) => {
    const converted = [...message]
      .map(char => {
        const index = chars.indexOf(char);
        return superscript[index] || char;
      })
      .join("");
    return converted;
  },
);
