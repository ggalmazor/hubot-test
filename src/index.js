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

export default class Helper {
  constructor(...scripts) {
    this.scripts = scripts;
  }

  async init(httpd = false) {
    this.robot = new Robot('TestAdapter', httpd, 'Hubot', 'hubot');
    this.robot.adapter = TestAdapter;
    await this.robot.loadAdapter();

    if (httpd) await this.robot.run();

    this.scripts.forEach((script) => script(this.robot));
    this.robot.brain.emit('loaded');
  }

  async destroy() {
    if (this.robot.server) return new Promise((resolve) => this.robot.server.close(() => resolve(null)));
    else return Promise.resolve(null);
  }

  user(name, alias = null) {
    return this.robot.brain.userForId(alias || name.toLowerCase(), { name: name });
  }

  async sendMessage(user, room, message) {
    await this.robot.adapter.say(user, room, message);
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

  messagesAt(room, username) {
    if (username === undefined) return this.robot.adapter.messagesAt(room);

    return this.robot.adapter
      .messagesAt(room)
      .filter(([u]) => u === username)
      .map(([, message]) => message);
  }

  on(event, listener) {
    this.robot.on(event, listener);
  }
}
