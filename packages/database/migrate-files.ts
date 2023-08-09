import { PrismaClient } from "./generated/main";

const prisma = new PrismaClient();

let { count } = await prisma.files.deleteMany();
console.log(`Deleted ${count} files...`);

count = await prisma.file.count();
let startId: bigint | undefined;
let foundFiles = 0;
do {
	const files = await prisma.file.findMany({
		take: 1000,
		cursor: startId
			? {
					id: startId,
			  }
			: undefined,
		skip: startId ? 1 : undefined,
	});
	if (!files.length) break;
	foundFiles += files.length;
	console.log(`Migrating ${foundFiles}/${count} files`);
	await prisma.files.createMany({
		data: files.map(
			({
				createdAt,
				authorId,
				messageId,
				channelId,
				guildId,
				proxyURL,
				...x
			}) => ({
				...x,
				created_at: createdAt,
				author_id: authorId,
				message_id: messageId,
				channel_id: channelId,
				guild_id: guildId,
				proxy_url: proxyURL,
			}),
		),
	});
	startId = files.at(-1)?.id;
} while (startId);
