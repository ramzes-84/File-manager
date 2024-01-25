import { ReadStream } from "node:fs";
import { stdout } from "node:process";
import { EOL } from "os";
import { checkInput } from "./utils.js";

export const cmdController = async function (data, fm) {
  const command = data.toString().replace(EOL, "").split(" ");
  const advise = checkInput(command);
  if (advise) stdout.write(advise);
  switch (command[0]) {
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
      if (command[1]) {
        const error = await fm.changeDir(command[1]);
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
      const folderContent = fm.read(command[1]);
      if (folderContent instanceof ReadStream) {
        folderContent.pipe(stdout);
        folderContent.on("end", () => stdout.write("\n"));
        folderContent.on("error", (err) => {
          if (err.errno === -4058 || err.errno === -2) {
            stdout.write(`Operation failed: ${err.message}.\n`);
            stdout.write(fm.showCurrDir());
          } else throw err;
        });
      }
      if (folderContent instanceof Error) {
        stdout.write(`Operation failed: ${folderContent.message}.\n`);
        stdout.write(fm.showCurrDir());
      }
      break;
    }
    case "add": {
      if (command[1]) {
        const error = await fm.add(command[1]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File "${command[1]}" created.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "rn": {
      if (command[1] && command[2]) {
        const error = await fm.renameFile(command[1], command[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File renamed.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "cp": {
      if (command[1] && command[2]) {
        const error = await fm.copyFile(command[1], command[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File copied.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "mv": {
      if (command[1] && command[2]) {
        const error = await fm.copyFile(command[1], command[2], true);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File moved.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "rm": {
      if (command[1]) {
        const error = await fm.deleteFile(command[1]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
        else stdout.write(`File deleted.\n`);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "os": {
      if (command[1]) {
        const info = fm.getOSInfo(command[1]);
        console.log(info);
      }
      stdout.write(fm.showCurrDir());
      break;
    }
    case "hash": {
      if (command[1]) {
        fm.calcHash(command[1]);
      }
      break;
    }
    case "compress": {
      if (command[1] && command[2]) {
        const error = await fm.compress(command[1], command[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
      }
      break;
    }
    case "decompress": {
      if (command[1] && command[2]) {
        const error = await fm.decompress(command[1], command[2]);
        if (error) stdout.write(`Operation failed: ${error.message}.\n`);
      }
      break;
    }

    default:
      stdout.write(`Invalid input\n${fm.showCurrDir()}`);
      break;
  }
};
