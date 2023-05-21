import command from '$commands/slash';

export default command(
  {
    desc: 'Generates a random number between min and max, 1 to a max, or from 1 to 10',
    options: {
      min: {
        type: 'int',
        desc: 'The minimum or maximum (no 2nd number passed) number to generate',
        optional: true
      },
      max: {
        type: 'int',
        desc: 'The maximum number to generate',
        optional: true
      }
    }
  },
  (i, { min, max }) => {
    let n: number;
    if (min === undefined) n = Math.floor(Math.random() * 10) + 1;
    else if (max === undefined) n = Math.floor(Math.random() * min) + 1;
    else n = Math.floor(Math.random() * (max - min + 1)) + min;
    return i.reply(n.toString());
  }
);
