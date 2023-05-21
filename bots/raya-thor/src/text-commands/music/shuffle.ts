import musicCommand from './command';

export default musicCommand(
  {
    desc: 'Shuffles the queue',
    args: {},
    permissions: ['vc']
  },
  ({ voice }) => {
    voice.queue?.shuffle();
    return voice.send('🔀 Shuffled queue');
  }
);
