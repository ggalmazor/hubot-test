import fetch from 'node-fetch';
import {Helper, Room} from '../src/index';
import {Robot} from "hubot";
import {Request, Response} from "express";
import * as http from "node:http";

const helper = new Helper(
  (robot: Robot): void => {
    robot.router.get("/hello/world", (_req: Request, res: Response) => res.status(200).send("Hello World!"));
  }
);

process.env.EXPRESS_PORT = "12345";

describe('bye', function () {
  let room: Room;

  beforeEach(async function () {
    room = await helper.createRoom("Test Room", true);
  });

  afterEach(function() {
    room.destroy();
  });

  describe('GET /hello/world', function () {
    it('responds with status 200', async function () {
      const response = await fetch('http://localhost:12345/hello/world');

      expect(response.status).toEqual(200);
    });
  });
});