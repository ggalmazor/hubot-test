import Helper from '../src/index';

const helper = new Helper((robot) => robot.respond(/hi$/i, (msg) => msg.reply('hi')));

describe('hello-world', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user('Alice');
  });

  describe('Alice says hi to hubot', function () {
    it('replies to Alice', async function () {
      await helper.sendMessage(alice, 'room', '@hubot Hi');

      expect(helper.messagesAt('room')).toContainEqual(['Hubot', '@Alice: hi']);
    });
  });
});
