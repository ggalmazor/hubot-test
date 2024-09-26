import { Adapter, EnterMessage, LeaveMessage, Robot, TextMessage, User } from 'hubot';

function userAt(user, room) {
  const options = Object.assign({}, user);
  delete options.id;
  delete options._getRobot;
  options.room = room;
  return new User(user.id, options);
}

class TestAdapter extends Adapter {
  constructor(robot) {
    super(robot);
    this.name = 'TestAdapter';
    this.messages = {};
  }

  messagesAt(room) {
    return this.messages[room] || [];
  }

  async send(envelope, ...messages) {
    await this.store(this.robot.name, envelope.room, ...messages);
  }

  async reply(envelope, ...messages) {
    await this.store(this.robot.name, envelope.room, ...messages.map((string) => `@${envelope.user.name}: ${string}`));
  }

  run() {
    this.emit('connected');
  }

  close() {
    this.emit('closed');
  }

  async say(user, room, ...messages) {
    this.messages[room] = (this.messages[room] ||= []).concat(messages.map((message) => [user.name, message]));
    user.room = room;
    await Promise.all(
      messages.map((message) => {
        return this.robot.receive(new TextMessage(user, message));
      }),
    );
  }

  async store(userName, room, ...messages) {
    this.messages[room] = (this.messages[room] ||= []).concat(messages.map((message) => [userName, message]));
  }

  static async use(robot) {
    return new TestAdapter(robot);
  }
}

/**
 * @callback botScript
 * @async
 * @param {Robot} robot
 */

/**
 * Hubot Test Helper class
 */
class Helper {
  /**
   * Creates a Helper instance
   *
   * @param {...botScript} scripts - the script modules to load into the Bot
   */
  constructor(...scripts) {
    this.scripts = scripts;
  }

  /**
   * Initializes the Bot and prepares everything needed to receive messages
   *
   * When providing `true` in `httpd`, {@link #destroy} must be called after the tests have completed.
   *
   * @async
   * @param {boolean} [httpd=false] - Option to start an HTTP server for the Bot
   * @returns {Promise<void>}
   */
  async init(httpd = false) {
    this.robot = new Robot('TestAdapter', httpd, 'Hubot', 'hubot');
    this.robot.adapter = TestAdapter;
    await this.robot.loadAdapter();

    if (httpd) await this.robot.run();

    this.scripts.forEach((script) => script(this.robot));
    this.robot.brain.emit('loaded');
  }

  /**
   * Destroys the Bot.
   *
   * Must be called when providing `true` in the `httpd` parameter when calling {@link #init}
   *
   * @async
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this.robot.server) return new Promise((resolve) => this.robot.server.close(() => resolve(null)));
    else return Promise.resolve(null);
  }

  /**
   * Returns a new user that can interact with the Bot
   *
   * @param {string} name
   * @param {string=} alias - defaults to the provided name in low case
   * @returns {User}
   */
  user(name, alias = null) {
    return this.robot.brain.userForId(alias || name.toLowerCase(), { name: name });
  }

  /**
   * Sends a `message` by a `user` in a `room`
   *
   * @async
   * @param {User} user
   * @param {string} room
   * @param {string} message
   * @returns {Promise<void>}
   */
  async sendMessage(user, room, message) {
    await this.robot.adapter.say(user, room, message);
  }

  /**
   * Triggers an {@link EnterMessage} at the provided `room` by the provided `user`
   *
   * @async
   * @param {User} user
   * @param {string} room
   * @returns {Promise<void>}
   */
  async enter(user, room) {
    return this.robot.receive(new EnterMessage(userAt(user, room), false));
  }

  /**
   * Triggers a {@link LeaveMessage} at the provided `room` by the provided `user`
   *
   * @async
   * @param {User} user
   * @param {string} room
   * @returns {Promise<void>}
   */
  async leave(user, room) {
    return this.robot.receive(new LeaveMessage(userAt(user, room), false));
  }

  /**
   * Emits the provided `event` in the Bot
   *
   * @param {string} event
   * @param {...string} args
   * @returns null
   */
  emit(event, ...args) {
    this.robot.emit(event, ...args);
  }

  /**
   * Sets up a listener that will be called whenever the provided `event` is emitted by the Bot
   *
   * @param {string} event
   * @param {function} listener
   * @returns null
   */
  on(event, listener) {
    this.robot.on(event, listener);
  }

  /**
   * Returns an array of arrays with:
   * 0. The author's username
   * 1. The message
   *
   * @param {string} room
   * @param {string=} username - filter returned messages by author's username
   * @returns {string[][]}
   */
  messagesAt(room, username) {
    if (username === undefined) return this.robot.adapter.messagesAt(room);

    return this.robot.adapter.messagesAt(room).filter(([u]) => u === username);
  }
}

export default Helper;
