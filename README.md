# discord-bots

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![license](https://img.shields.io/github/license/limitlesspc/discord-bots.svg)](LICENSE)

A collection of Discord bots I created for fun

## Table of Contents

- [discord-bots](#discord-bots)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Install

First you will need to install the following:

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/) comes with Node.js
- [PNPM](https://pnpm.io/)

```
pnpm run setup
```

## Usage

Run Thor:

```
pnpm run thor
```

Run Thor Music:

```
pnpm run thor-music
```

Running Thor and Thor Music in parallel will require [tmuxinator](https://github.com/tmuxinator/tmuxinator):

```
pnpm start
```

Since Irohoshi is built to be a serverless bot hosted on [Deno Deploy](https://deno.com/deploy), it doesn't have a dev script. However, to deploy Irohoshi, you will first need [Deno](https://deno.land/), Then run:

```
deno run --allow-env --allow-read=./ --allow-net=discord.com irohoshi/deploy.ts
```

Linting:

```
pnpm run lint
```

## Contributing

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT © 2022 limitlesspc](./LICENSE)
