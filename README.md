# raya-discord-bot

This is a multi-purpose Discord bot I created for fun

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![license](https://img.shields.io/github/license/in5net/raya-discord-bot.svg)](LICENSE)

## Table of Contents

- [raya-discord-bot](#raya-discord-bot)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
  - [Contributing](#contributing)
    - [Random Responses](#random-responses)
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

Run the bot:

```
pnpm start
```

Linting:

```
pnpm run lint
```

## Contributing

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

### Random Responses

In [responses.txt](./responses.txt), you'll find the random responses that the bot sends when a message sent in a channel contains certain words.

Each line in the file is in the format `words: responses`

- `words` is a comma (`,`) separated list of words, ex: `this,that`
- `responses` is a tilde (`~`) separated list of responses, ex: `hi there ~ okay then`

## License

[MIT © 2022 in5net](./LICENSE)
