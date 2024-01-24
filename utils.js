import { ReadStream } from "node:fs";
import { cmdOverloaded, lackOfArgs } from "./constants.js";
import { stdout } from "node:process";

export const handleCmd = async function (data, fm) {
  const command = data
    .toString()
    .slice(0, data.length - 2)
    .split(" ");
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
          if (err.errno === -4058) {
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

    default:
      stdout.write(`Invalid input\n${fm.showCurrDir()}`);
      break;
  }
};

const checkInput = function (cmdArr) {
  const oneArgCmds = ["up", "ls", ".exit"];
  const twoArgsCmds = ["cd", "cat", "add", "rm", "os", "hash"];
  const threeArgsCmds = ["rn", "cp", "mv", "compress", "decompress"];
  if (oneArgCmds.includes(cmdArr[0]) && cmdArr.length > 1) return cmdOverloaded;
  if (twoArgsCmds.includes(cmdArr[0])) {
    if (cmdArr.length < 2) return lackOfArgs;
    if (cmdArr.length >= 3) return cmdOverloaded;
  }
  if (threeArgsCmds.includes(cmdArr[0])) {
    if (cmdArr.length < 3) return lackOfArgs;
    if (cmdArr.length >= 4) return cmdOverloaded;
  }
  return null;
};

export const sortTabularData = function (tabularData) {
  const clearedStat = tabularData
    .map((item) => {
      if (item.status === "fulfilled" && item.value) return item.value;
    })
    .filter((item) => item);
  const foldersDataArr = clearedStat
    .filter((item) => item.Type === "folder")
    .sort((a, b) => a.Name > b.Name);
  const filesDataArr = clearedStat
    .filter((item) => item.Type === "file")
    .sort((a, b) => a.Name > b.Name);
  return [...foldersDataArr, ...filesDataArr];
};
