import musicCommand from "./command";

export default musicCommand(
	{
		desc: "Plays the song previously in the queue",
		args: {},
		permissions: ["vc"],
	},
	async ({ voice }) => voice.prev(),
);
