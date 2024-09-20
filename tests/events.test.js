import Helper from '../src/index';

const helper = new Helper((robot) => {
  robot.on('some-event', async (...args) => {
    const [roomName, ...data] = args;
    await robot.messageRoom(roomName, `got event with ${JSON.stringify(data)}`);
  });
  robot.respond(/send event$/i, () => robot.emit('response-event', { content: 'hello' }));
});

describe('events', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user('Alice');
  });

  describe('should post on an event', function () {
    it('should reply to user', async function () {
      helper.emit('some-event', 'room', { a: 1, b: 'two' });

      expect(helper.messagesAt('room')).toEqual([['Hubot', 'got event with [{"a":1,"b":"two"}]']]);
    });
  });

  describe('should hear events emitted by responses', function () {
    it('should trigger an event', async function () {
      let response;
      helper.on('response-event', (event) => (response = event));

      await helper.sendMessage(alice, 'room', '@hubot send event');

      expect(response).toEqual({ content: 'hello' });
    });
  });
});
