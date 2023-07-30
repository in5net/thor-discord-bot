import command from "discord/commands/slash";

const codes: Record<string, string> = {
	a: ".-",
	b: "-.-.",
	c: "-...",
	d: "-..",
	e: ".",
	f: "..-.",
	g: "--.",
	h: "....",
	i: "..",
	j: ".---",
	k: "-.-",
	l: ".-..",
	m: "--",
	n: "-.",
	o: "---",
	p: ".--.",
	q: "--.-",
	r: ".-.",
	s: "...",
	t: "-",
	u: "..-",
	v: "...-",
	w: ".--",
	x: "-..-",
	y: "-.--",
	z: "--..",
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
		options: {
			message: {
				type: "string",
				desc: "The message to encode",
			},
		},
	},
	async (i, { message }) => {
		await i.deferReply();
		await i.deleteReply();
		const morse = message
			.toLowerCase()
			.split(" ")
			.map(word =>
				word
					.split("")
					.map(c => codes[c] || "")
					.join(" "),
			)
			.join(" / ");
		return i.channel?.send(morse);
	},
);
