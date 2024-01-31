import { ReadStream } from "node:fs";
import { stdout } from "node:process";
import { inputCorrectnessChecker, cmdParser } from "./utils.js";

export const cmdController = async function (data, fm) {
  const cmdArr = cmdParser(data);
  const warning = inputCorrectnessChecker(cmdArr);
  if (warning) stdout.write(warning);
  switch (cmdArr[0]) {
    case ".exit": {
      stdout.write(fm.bye());
      process.exit(0);
    }
    case "up": {
      fm.goUp();
      stdout.write(fm.showCurrDir());
      break;
    }
    case "cd": {
      if (cmdArr[1]) {
        const error = await fm.changeDir(cmdArr[1]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "ls": {
      const folderContent = await fm.ls();
      console.table(folderContent);
      stdout.write(fm.showCurrDir());
      break;
    }
    case "cat": {
      const folderContent = fm.read(cmdArr[1]);
      if (folderContent instanceof ReadStream) {
        folderContent.pipe(stdout);
        folderContent.on("end", () => stdout.write("\n"));
        folderContent.on("error", (err) => {
          // if (err.errno === -4058 || err.errno === -2 || err.errno === -4048) {
          stdout.write(`Operation failed: ${err.message}.\n`);
          stdout.write(fm.showCurrDir());
          // } else throw err;
        });
      }
      if (folderContent instanceof Error) {
        stdout.write(`Operation failed: ${folderContent.message}.\n`);
        stdout.write(fm.showCurrDir());
      }
      break;
    }
    case "add": {
      if (cmdArr[1]) {
        const error = await fm.add(cmdArr[1]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File "${cmdArr[1]}" created.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "rn": {
      if (cmdArr[1] && cmdArr[2]) {
        const error = await fm.renameFile(cmdArr[1], cmdArr[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File renamed.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "cp": {
      if (cmdArr[1] && cmdArr[2]) {
        const error = await fm.copyFile(cmdArr[1], cmdArr[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File copied.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "mv": {
      if (cmdArr[1] && cmdArr[2]) {
        const error = await fm.copyFile(cmdArr[1], cmdArr[2], true);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File moved.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "rm": {
      if (cmdArr[1]) {
        const error = await fm.deleteFile(cmdArr[1]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File deleted.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "os": {
      if (cmdArr[1]) {
        const info = fm.getOSInfo(cmdArr[1]);
        console.log(info);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "hash": {
      if (cmdArr[1]) {
        fm.calcHash(cmdArr[1]);
      }
      break;
    }
    case "compress": {
      if (cmdArr[1] && cmdArr[2]) {
        const error = await fm.compress(cmdArr[1], cmdArr[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
      }
      break;
    }
    case "decompress": {
      if (cmdArr[1] && cmdArr[2]) {
        const error = await fm.decompress(cmdArr[1], cmdArr[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
      }
      break;
    }
    default:
      stdout.write(`Invalid input\n${fm.showCurrDir()}`);
      break;
  }
};
