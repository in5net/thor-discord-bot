import Player from './media/player';

const players = new Map<string, Player>();
export default players;

export function getPlayer(guildId: string): Player {
  let player = players.get(guildId);
  if (!player) {
    player = new Player(() => players.delete(guildId));
    players.set(guildId, player);
  }
  return player;
}
