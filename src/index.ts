import {Adapter, EnterMessage, Envelope, LeaveMessage, Robot, TextMessage, User} from "hubot";

process.setMaxListeners(0);

class MockRobot extends Robot {
  messagesTo: Record<string, Array<[string, string]>> = {};

  constructor(room: Room, httpd: boolean = false) {
    super(room, httpd, 'hubot', 'hubot');
  }

  messageRoom(roomName: string, message: string) {
    if (roomName === this.adapter.name) {
      this.adapter.messages.push(['hubot', message]);
    } else {
      if (!(roomName in this.messagesTo)) {
        this.messagesTo[roomName] = [];
      }
      this.messagesTo[roomName].push(['hubot', message]);
    }
  }
}

export class MockUser extends User {
  room?: Room;

  constructor(name: string, options?: {}) {
    super(name, options);
  }

  async say(message: string): Promise<string[]> {
    return this.room!.receiveMessage(this.name, message);
  }

  async enter(room: Room): Promise<string[]> {
    this.room = room

    return room.enter(this.name, {});
  }

  async leave(): Promise<string[]> {
    const result = await this.room!.leave(this.name, {});
    this.room = undefined;
    return result
  }
}

export class Room extends Adapter {
  name: string;
  messages: Array<[string, string]>;
  mockRobot?: MockRobot;

  constructor(name: string, messages: Array<[string, string]> = []) {
    super();
    this.name = name;
    this.messages = messages;
  }

  async receiveMessage(userName: string, message: string): Promise<string[]> {
    const user = new MockUser(userName, {room: this.name});
    const textMessage = new TextMessage(user, message, "");

    this.messages.push([userName, textMessage.text]);
    return this.mockRobot!.receive(textMessage);
  }

  destroy() {
    if (this.mockRobot!.server) {
      this.mockRobot!.server.close();
    }
  }

  async reply(envelope: Envelope, ...strings: string[]): Promise<any> {
    strings.forEach((s) => this.messages.push(['hubot', `@${envelope.user.name} ${s}`]));

    return Promise.resolve();
  }

  send(envelope: Envelope, ...strings: string[]) {
    strings.forEach((s) => this.messages.push(['hubot', s]));

    return Promise.resolve();
  }

  async enter(userName: string, userParams: Record<string, any> = {}): Promise<string[]> {
    const user = new MockUser(userName, {room: this.name});
    return this.mockRobot!.receive(new EnterMessage(user));
  }

  async leave(userName: string, userParams: Record<string, any> = {}): Promise<string[]> {
    const user = new MockUser(userName, {room: this.name});
    return this.mockRobot!.receive(new LeaveMessage(user));
  }

  robotEvent(event: string, ...args: any[]) {
    this.mockRobot!.emit(event, args);
  }

  attach(robot: MockRobot): void {
    this.mockRobot = robot;
  }
}

export class Helper {
  room?: Room;
  user?: MockUser;
  robot?: MockRobot;

  private scripts: Array<(robot: Robot) => void>;

  constructor(...scripts: Array<(robot: Robot) => void>) {
    this.scripts = scripts;
  }

  async createRoom(name: string = "Room1", httpd: boolean = false): Promise<Room> {
    this.room = new Room(name)
    this.robot = new MockRobot(this.room, httpd);
    this.room.attach(this.robot);

    if (httpd)
      await this.robot.run();

    this.scripts.forEach((script) => script(this.robot!));
    this.robot.brain.emit('loaded');

    return this.room;
  }

  createUser(name: string): MockUser {
    return new MockUser(name);
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.robot!.on(event, listener);
  }

  messagesTo(roomName: string): Array<[string, string]> {
    return this.robot!.messagesTo[roomName];
  }
}