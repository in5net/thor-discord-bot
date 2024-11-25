import command from "$lib/discord/commands/text";

const codes: Record<string, string> = {
  "a": ".-",
  "b": "-.-.",
  "c": "-...",
  "d": "-..",
  "e": ".",
  "f": "..-.",
  "g": "--.",
  "h": "....",
  "i": "..",
  "j": ".---",
  "k": "-.-",
  "l": ".-..",
  "m": "--",
  "n": "-.",
  "o": "---",
  "p": ".--.",
  "q": "--.-",
  "r": ".-.",
  "s": "...",
  "t": "-",
  "u": "..-",
  "v": "...-",
  "w": ".--",
  "x": "-..-",
  "y": "-.--",
  "z": "--..",
  " ": "/",
  ".": ".-.-.-",
  "!": "-.-.--",
  "?": "..--..",
  ",": "--..--",
  ":": "---...",
  "'": ".----",
  '"': ".-..-.",
  "&": ".-...",
  "@": ".--.-.",
  "(": "-.--.",
  ")": "-.--.-",
  "/": "-..-.",
  "\\": "",
  "+": ".-.-.",
  "-": "-....-",
  "=": "-...-",
};

export default command(
  {
    desc: "Encodes a message in Morse code",
    args: {
      message: {
        type: "text",
        desc: "The message to encode",
      },
    },
    examples: ["googas"],
  },
  async ({ args: { message } }) => {
    const morse = message
      .toLowerCase()
      .split(" ")
      .map(word => [...word].map(c => codes[c] || "").join(" "))
      .join(" / ");
    return morse;
  },
);
