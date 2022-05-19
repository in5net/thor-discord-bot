import type Command from './command';

const cmd: Command = {
  name: 'norway',
  desc: 'Norway',
  aliases: ['🇳🇴'],
  async exec({ channel }) {
    return channel.send(
      `Norway is a Scandinavian country encompassing mountains, glaciers and deep coastal fjords. Oslo, the capital, is a city of green spaces and museums. Preserved 9th-century Viking ships are displayed at Oslo’s Viking Ship Museum. Bergen, with colorful wooden houses, is the starting point for cruises to the dramatic Sognefjord. Norway is also known for fishing, hiking and skiing, notably at Lillehammer’s Olympic resort.`
    );
  }
};
export default cmd;
