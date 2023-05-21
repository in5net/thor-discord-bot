import musicCommand from './command';

export default musicCommand(
  {
    desc: 'Loops the queue',
    args: {},
    permissions: ['vc']
  },
  ({ voice }) => {
    voice.queue?.toggleLoop();
    return voice.send(`🔁 Loop ${voice.queue?.loop ? 'enabled' : 'disabled'}`);
  }
);
