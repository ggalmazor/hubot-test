import {Adapter, EnterMessage, LeaveMessage, Robot, TextMessage, User} from "hubot";
import {v4 as uuidv4} from 'uuid'

function userAt(user, room) {
  const options = Object.assign({}, user)
  delete options.id;
  delete options._getRobot;
  options.room = room;
  return new User(user.id, options);
}

class TestAdapter extends Adapter {
  constructor(robot) {
    super(robot);
    this.user = new User(robot.name);
    this.messages = {};
  }

  messagesAt(room) {
    return this.messages[room] || [];
  }

  async send(envelope, ...strings) {
    const newMessages = strings.map((string) => [this.user.name, string]);
    this.messages[envelope.room] = (this.messages[envelope.room] || []).concat(newMessages);
    return null;
  }

  async reply(envelope, ...strings) {
    const replies = strings.map((string) => `@${envelope.user.name}: ${string}`)
    return this.send({room: envelope.room}, ...replies)
  }

  async topic(envelope, ...strings) {
    // No implementation. Specific for Campfire
  }

  async play(envelope, ...strings) {
    // No implementation. Specific for Campfire
  }

  async run() {
    // Nothing to do here
  }

  injectMessage(user, room, message) {
    this.messages[room] = (this.messages[room] || []).concat([[user.name, message]]);
  }
}

export class Helper {
  constructor(...scripts) {
    this.scripts = scripts;
  }

  async init(httpd = false) {
    this.robot = new Robot("test", httpd, 'Hubot', 'hubot');
    this.adapter = new TestAdapter(this.robot);
    this.robot.adapter = this.adapter;

    if (httpd)
      await this.robot.run();

    this.scripts.forEach((script) => script(this.robot));
    this.robot.brain.emit('loaded');
  }

  async destroy() {
    if (this.robot.server)
      return new Promise((resolve, _reject) => this.robot.server.close(() => resolve(null)));
    else
      return Promise.resolve(null);
  }

  user(name, alias = null) {
    return new User(alias || name.toLowerCase(), {name})
  }

  async sendMessage(user, room, message) {
    await this.adapter.injectMessage(user, room, message);
    return await this.robot.receive(new TextMessage(userAt(user, room), message, uuidv4()));
  }

  async enter(user, room) {
    return this.robot.receive(new EnterMessage(userAt(user, room), false));
  }

  async leave(user, room) {
    return this.robot.receive(new LeaveMessage(userAt(user, room), false));
  }

  emit(eventName, ...args) {
    this.robot.emit(eventName, ...args);
  }

  messagesAt(room) {
    return this.adapter.messagesAt(room);
  }

  on(event, listener) {
    this.robot.on(event, listener);
  }
}

