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
    default:
      stdout.write(`Invalid input\n${fm.showCurrDir()}`);
      break;
  }
};

const checkInput = function (cmdArr) {
  const simpleCmds = ["up", "ls", ".exit"];
  const complexCmds = ["cd"];
  if (simpleCmds.includes(cmdArr[0]) && cmdArr.length > 1) return cmdOverloaded;
  if (complexCmds.includes(cmdArr[0]) && cmdArr.length === 1) return lackOfArgs;
  return null;
};
