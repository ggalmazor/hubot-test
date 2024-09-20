import Helper from '../src/index';

const helper = new Helper((robot) => {
  robot.enter(async (response) => response.reply(`Hi!`));
  robot.leave(async (response) => response.reply(`Bye!`));
});

describe('enter-leave', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user('Alice');
  });

  describe('user enters and leaves the room', function () {
    it('hubot says hi and bye', async function () {
      await helper.enter(alice, 'room');
      await helper.leave(alice, 'room');

      expect(helper.messagesAt('room')).toEqual([
        ['Hubot', '@Alice: Hi!'],
        ['Hubot', '@Alice: Bye!'],
      ]);
    });
  });
});
