import { PrismaClient, type Prisma } from "./generated/main";

const prisma = new PrismaClient();

{
	console.log("Migrating users...");
	const users = await prisma.user.findMany();
	await prisma.users.createMany({
		data: users.map(({ createdAt, updatedAt, counts, creditAt, ...x }) => ({
			...x,
			created_at: createdAt,
			updated_at: updatedAt,
			counts: counts as Prisma.InputJsonValue,
			credit_at: creditAt,
		})),
	});
}

{
	console.log("Migrating ratios...");
	const ratios = await prisma.ratio.findMany();
	await prisma.ratios.createMany({
		data: ratios.map(({ createdAt, ...x }) => ({
			...x,
			created_at: createdAt,
		})),
	});
}

{
	console.log("Migrating y7...");
	const y7Files = await prisma.y7File.findMany();
	await prisma.y7_files.createMany({
		data: y7Files,
	});
}

{
	console.log("Migrating chickens...");
	const chickens = await prisma.chicken.findMany();
	await prisma.chickens.createMany({
		data: chickens.map(({ sentAt, ...x }) => ({
			...x,
			sent_at: sentAt,
		})),
	});
}

{
	console.log("Migrating hop ons...");
	const hopOns = await prisma.hopOn.findMany();
	await prisma.hop_ons.createMany({
		data: hopOns.map(({ sentAt, ...x }) => ({
			...x,
			sent_at: sentAt,
		})),
	});
}

{
	console.log("Migrating kraccbacc...");
	const kraccBaccs = await prisma.kraccBacc.findMany();
	await prisma.kracc_bacc_videos.createMany({
		data: kraccBaccs.map(({ sentAt, ...x }) => ({
			...x,
			sent_at: sentAt,
		})),
	});
}

{
	console.log("Migrating boss...");
	const bossFiles = await prisma.bossFile.findMany();
	await prisma.boss_files.createMany({
		data: bossFiles.map(({ sentAt, ...x }) => ({
			...x,
			sent_at: sentAt,
		})),
	});
}

{
	console.log("Migrating issues...");
	const issues = await prisma.issue.findMany();
	await prisma.issues.createMany({
		data: issues.map(
			({ createdAt, updatedAt, userId, type, closedAt, reason, ...x }) => ({
				...x,
				created_at: createdAt,
				updated_at: updatedAt,
				user_id: userId,
				type:
					type === "Bug"
						? "bug"
						: type === "Enhancement"
						? "enhancement"
						: "feature",
				closed_at: closedAt,
				reason:
					reason === "Completed"
						? "completed"
						: reason === "Duplicate"
						? "duplicate"
						: reason === "Invalid"
						? "invalid"
						: "wont_fix",
			}),
		),
	});
}

{
	console.log("Migrating food...");
	const food = await prisma.rotatingFood.findMany();
	await prisma.rotating_food.createMany({
		data: food,
	});
}

{
	console.log("Migrating audio...");
	const filters = await prisma.audioFilter.findMany();
	await prisma.audio_filters.createMany({
		data: filters,
	});
}

{
	console.log("Migrating execs...");
	const execs = await prisma.commandExecution.findMany();
	await prisma.command_executions.createMany({
		data: execs.map(
			({ createdAt, type, userId, messageId, channelId, guildId, ...x }) => ({
				...x,
				created_at: createdAt,
				type:
					type === "Message" ? "message" : type === "Slash" ? "slash" : "text",
				user_id: userId,
				message_id: messageId,
				channel_id: channelId,
				guild_id: guildId,
			}),
		),
	});
}
