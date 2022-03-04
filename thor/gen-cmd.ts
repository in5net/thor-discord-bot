import { createInterface } from 'node:readline';
import { join } from 'node:path';
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync
} from 'node:fs';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('New command name: ', name => {
  const commandPath = join(__dirname, `./src/commands/${name}.ts`);
  const exists = existsSync(commandPath);
  if (exists) {
    console.log(`Command ${name} already exists`);
    process.exit(0);
  }

  const commandSrc = `import type Command from './command';

const cmd: Command = async ({ channel }, args) => {
  console.log('Hello, world!');
  return channel.send(\`Args: \${args.join(' ')}\`);
};
export default cmd;`;
  writeFileSync(commandPath, commandSrc, 'utf8');

  const cmdIndexPath = join(__dirname, './src/commands/index.ts');
  appendFileSync(
    cmdIndexPath,
    `export { default as ${name} } from './${name}';\n`,
    'utf8'
  );

  const mainPath = join(__dirname, './src/main.ts');
  const mainSrc = readFileSync(mainPath, 'utf8');
  const mainSrcNew = mainSrc
    .replace(
      "\n} from './commands';",
      `,
  ${name}
} from './commands';`
    )
    .replace(
      'default:',
      `case '${name}':
        await ${name}(message, params);
        break;
      default:`
    );
  writeFileSync(mainPath, mainSrcNew, 'utf8');

  console.log(`Command ${name} created!`);
  process.exit(0);
});
