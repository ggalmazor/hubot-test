import {Helper, MockUser, Room} from '../src/index';
import {Robot} from "hubot";

const helper = new Helper(
  (robot: Robot) => robot.respond(/announce otherRoom: (.+)$/i, msg => {
    robot.messageRoom('otherRoom', '@' + msg.envelope.user.name + ' says: ' + msg.match[1]);
  })
);

describe('bye', function () {
  let room: Room;
  let alice: MockUser;

  beforeEach(async function () {
    room = await helper.createRoom("Test Room");
    alice = helper.createUser("alice");
    await alice.enter(room);
  });

  describe('user says bye', function () {
    it("hubot doesn't write on the room", async function () {
      await alice.say('@hubot announce otherRoom: I love hubot!');

      expect(room.messages).toEqual([
        ['alice', '@hubot announce otherRoom: I love hubot!']
      ]);
    });

    it("hubot writes in the other channel", async function () {
      await alice.say('@hubot announce otherRoom: I love hubot!');

      expect(helper.messagesTo('otherRoom')).toEqual([
        ['hubot', '@alice says: I love hubot!']
      ]);
    });
  });
});