import { cmdController } from "./controller.js";
import { stdin, stdout, argv } from "node:process";
import { homedir } from "os";
import { FileOperations } from "./File-operations.js";
import { OsOperations } from "./Os-operations.js";
import { ZipOperations } from "./Zip-operations.js";
import { HashOperations } from "./Hash-operations.js";

const userDir = homedir();
const userArg = argv.slice(2).find((arg) => arg.startsWith("--username="));
const userName = userArg
  ? userArg.replace("--username=", "")
  : "Anonymous user";

const runFileManager = async () => {
  const fm = new FileOperations(userName, userDir);
  const os = new OsOperations(userName, userDir);
  const zip = new ZipOperations(userName, userDir);
  const hash = new HashOperations(userName, userDir);

  stdout.write(fm.greet());
  stdout.write(fm.showCurrDir());
  stdin.resume();
  process.on("SIGINT", () => {
    stdout.write(fm.bye());
    process.exit(0);
  });

  stdin.on("data", async (data) => cmdController(data, { fm, os, zip, hash }));
};

runFileManager();
