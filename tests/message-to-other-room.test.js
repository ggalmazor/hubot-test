import Helper from '../src/index';

const helper = new Helper((robot) =>
  robot.respond(/announce otherRoom: (.+)$/i, (response) => {
    robot.messageRoom('otherRoom', '@' + response.envelope.user.name + ' says: ' + response.match[1]);
  }),
);

describe('bye', function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user('Alice');
  });

  describe('user says bye', function () {
    it("hubot doesn't write on the room", async function () {
      await helper.sendMessage(alice, 'room', '@hubot announce otherRoom: I love hubot!');

      expect(helper.messagesAt('room')).toEqual([['Alice', '@hubot announce otherRoom: I love hubot!']]);
    });

    it('hubot writes in the other channel', async function () {
      await helper.sendMessage(alice, 'room', '@hubot announce otherRoom: I love hubot!');

      expect(helper.messagesAt('otherRoom')).toEqual([['Hubot', '@Alice says: I love hubot!']]);
    });
  });
});
