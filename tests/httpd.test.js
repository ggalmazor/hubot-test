import fetch from "node-fetch";
import {Helper} from "../src/index";

const helper = new Helper(
    (robot) => robot.router.get("/hello/world", (_req, res) => res.status(200).send("Hello World!"))
);

process.env.EXPRESS_PORT = "12345";

describe("bye", function () {
  beforeEach(async function () {
    await helper.init(true);
  });

  afterEach(async function () {
    await helper.destroy();
  });

  describe("GET /hello/world", function () {
    it("responds with status 200", async function () {
      const response = await fetch("http://localhost:12345/hello/world");

      expect(response.status).toEqual(200);
    });
  });
});