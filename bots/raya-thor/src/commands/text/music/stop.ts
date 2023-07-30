import musicCommand from "./command";

export default musicCommand(
	{
		aliases: ["clear", "leave"],
		desc: "Leaves the voice channel and clears the queue",
		args: {},
		permissions: ["vc"],
	},
	async ({ voice }) => voice.stop(),
);
