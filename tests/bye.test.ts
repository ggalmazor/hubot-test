import {Helper, Room} from '../src/index';
import {Robot} from "hubot";

const helper = new Helper(
  (robot: Robot) => robot.respond(/bye$/i, message => message.reply('bye'))
);

describe('bye', function () {
  let room: Room;

  beforeEach(async function () {
    room = await helper.createRoom("Test Room");
  });

  describe('user says bye', function () {
    it('hubot replies bye', async function () {
      await room.receiveMessage("user", "@hubot bye")
      expect(room.messages).toEqual([
        ['user', '@hubot bye'],
        ['hubot', '@user bye']
      ]);
    });
  });
});