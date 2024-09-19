import {Helper} from "../src/index";

const helper = new Helper(
    (robot) => robot.respond(/bye$/i, response => response.reply("bye"))
);

describe("bye", function () {
  let alice;

  beforeEach(async function () {
    await helper.init();
    alice = helper.user("Alice")
  });

  describe("user says bye", function () {
    it("hubot replies bye", async function () {
      await helper.sendMessage(alice, "room", "@hubot bye")

      expect(helper.messagesAt("room")).toEqual([
        [alice.name, "@hubot bye"],
        ["Hubot", "@Alice: bye"]
      ]);
    });
  });
});