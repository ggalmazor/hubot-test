import {Helper, Room} from '../src/index';
import {Robot} from "hubot";

const helper = new Helper(
  (robot: Robot): void => {
    robot.on('some-event', (...args: unknown[]) => {
      const [roomName, ...data] = args[0] as unknown[];
      robot.messageRoom(roomName as string, `got event with ${JSON.stringify(data)}`);
    });
    robot.respond(/send event$/i, msg => robot.emit('response-event', {content: 'hello'}));
  }
);

describe('events', function () {
  let room: Room;

  beforeEach(async function () {
    room = await helper.createRoom("Test Room");
  });

  describe('should post on an event', function () {
    it('should reply to user', async function () {
      room.robotEvent('some-event', room.name, {a: 1, b: "two"});

      expect(room.messages).toEqual([
        ['hubot', 'got event with [{"a":1,"b":"two"}]']
      ]);
    });
  });

  describe('should hear events emitted by responses', () =>
    it('should trigger an event', async function () {
      let response: unknown;
      helper.on('response-event', event => response = event);

      await room.receiveMessage("user", '@hubot send event')

      expect(response).toEqual({content: 'hello'});
    })
  );
});