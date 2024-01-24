import { FileManager } from "./class-file-manager.js";
import { cmdController } from "./controller.js";
import { stdin, stdout, argv } from "node:process";
import { homedir } from "os";

const userDir = homedir();
const userArg = argv.slice(2).find((arg) => arg.startsWith("--username="));
const userName = userArg
  ? userArg.replace("--username=", "")
  : "Anonymous user";

const runFileManager = async () => {
  const fm = new FileManager(userName, userDir);

  stdout.write(fm.greet());
  stdout.write(fm.showCurrDir());
  stdin.resume();
  process.on("SIGINT", () => {
    stdout.write(fm.bye());
    process.exit(0);
  });

  stdin.on("data", async (data) => cmdController(data, fm));
};

runFileManager();
