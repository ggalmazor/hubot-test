import Helper from '../src/index';

const helper = new Helper((robot) => robot.respond(/repeat (.+)$/i, (response) => response.reply(response.match[1])));

describe('bye', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user('Alice');
  });

  describe('.messageAt', function () {
    it('returns all the messages in the provided room, in order', async function () {
      await helper.sendMessage(alice, 'room', '@hubot repeat foo');
      await helper.sendMessage(alice, 'room', '@hubot repeat bar');

      expect(helper.messagesAt('room')).toEqual([
        [alice.name, '@hubot repeat foo'],
        ['Hubot', '@Alice: foo'],
        [alice.name, '@hubot repeat bar'],
        ['Hubot', '@Alice: bar'],
      ]);
    });

    it('returns all the messages in the provided room, by the provided user, in order', async function () {
      await helper.sendMessage(alice, 'room', '@hubot repeat foo');
      await helper.sendMessage(alice, 'room', '@hubot repeat bar');

      expect(helper.messagesAt('room', alice.name)).toEqual(['@hubot repeat foo', '@hubot repeat bar']);

      expect(helper.messagesAt('room', 'Hubot')).toEqual(['@Alice: foo', '@Alice: bar']);
    });
  });
});
