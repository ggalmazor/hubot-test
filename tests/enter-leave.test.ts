import {Helper, MockUser, Room} from '../src/index';
import {Robot} from "hubot";

const helper = new Helper(
  (robot: Robot): void => {
    robot.enter(res => res.send(`Hi ${res.message.user.name}!`));
    robot.leave(res => res.send(`Bye ${res.message.user.name}!`));
  }
);

describe('enter-leave', function () {
  let room: Room;
  let user: MockUser;

  beforeEach(async function () {
    room = await helper.createRoom("Test Room");
    user = helper.createUser("user");
  });

  describe('user enters and leaves the room', function () {
    it('hubot says hi and bye', async function () {
      await user.enter(room)
      await user.leave()
      expect(room.messages).toEqual([
        ['hubot', 'Hi user!'],
        ['hubot', 'Bye user!']
      ]);
    });
  });
});