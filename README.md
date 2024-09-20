# `hubot-test`

![CI](https://github.com/ggalmazor/hubot-test/actions/workflows/ci.yml/badge.svg)

<a href="https://www.buymeacoffee.com/ggalmazor" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

This is a library to help you test your [Hubot](https://github.com/hubotio/hubot) scripts, based
on [mtsmfm/hubot-test-helper](https://github.com/mtsmfm/hubot-test-helper).

## Install

This package is published at [npmjs.org](https://www.npmjs.com/package/hubot-test). Install it with:

```shell
npm install --save-dev hubot-test
```

## Usage

Provided you have a bot like this one:

```javascript
export default (robot) =>
  robot.respond(/hi$/i, msg => msg.reply('hi'));
```

You can test it like this:

```javascript
import Helper from 'hubot-test';
import bot from '../scripts/bot.js';

const helper = new Helper(bot);

describe('hello-world', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user("Alice");
  });

  describe('Alice says hi to hubot', function () {
    it('replies to Alice', async function () {
      await helper.sendMessage(alice, "room", "@hubot Hi")

      expect(helper.messagesAt("room")).toContainEqual(
        ["Hubot", "@Alice: hi"]
      );
    });
  });
});
```

### HTTPD

You can start an HTTP server for your tests with:

```javascript
beforeEach(async function () {
  await helper.init(true);
})
```

See [test/httpd.test.js](test/httpd.test.js) for an example.

### Testing messages sent to other rooms

You can also test messages sent by your script to other rooms through Hubot's `robot.messageRoom` method. The
`Helper` instance provides a `.messagesAt` method to retrieve the messages sent to any room.

See [tests/message-to-other-room.test.js](tests/message-to-other-room.test.js) for an example.

### Testing events

You can also test events emitted by your script. For example, Slack users may want to test the creation of a
[message attachment](https://api.slack.com/docs/attachments). The `Helper` instance provides `.emit` and `.on` methods
to send and listen to events.

See [tests/events.test.js](tests/events.test.js) for an example.

## Development

- This project uses [ASDF](https://asdf-vm.com) to manage Node.js versions.
  - If you're not using ASDF, check the [.tool-versions](.tool-versions) contents to know which Node.js version you
    should use to work on this project.
- Fork & clone this repo
- Install dependencies with Run `npm install`
- Test the code with `npm test`
- This project uses Prettier. Run the format check with `npm run format-check` and automatically format the code with
  `npm run format-fix`
- This project uses ESLint. Run the linter with `npm run linter` and automatically fix lint issues with
  `npm run linter-fix`
