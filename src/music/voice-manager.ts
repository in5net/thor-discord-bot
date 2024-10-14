import Voice from "./voice";
import { Collection, type Snowflake } from "discord.js";

const voices = new Collection<Snowflake, Voice>();
export default voices;

export const getVoice = (guildId: Snowflake) =>
  voices.ensure(guildId, () =>
    new Voice(guildId).once("stop", () => voices.delete(guildId)),
  );
