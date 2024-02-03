import { cmdOverloaded, lackOfArgs } from "./constants.js";
import { EOL } from "os";

export const inputCorrectnessChecker = function (cmdArr) {
  const oneArgCmds = ["up", "ls", ".exit"];
  const twoArgsCmds = ["cd", "cat", "add", "rm", "os", "hash"];
  const threeArgsCmds = ["rn", "cp", "mv", "compress", "decompress"];

  if (
    (oneArgCmds.includes(cmdArr[0]) && cmdArr.length > 1) ||
    (twoArgsCmds.includes(cmdArr[0]) && cmdArr.length >= 3) ||
    (threeArgsCmds.includes(cmdArr[0]) && cmdArr.length >= 4)
  ) {
    return cmdOverloaded;
  }
  if (
    (twoArgsCmds.includes(cmdArr[0]) && cmdArr.length < 2) ||
    (threeArgsCmds.includes(cmdArr[0]) && cmdArr.length < 3)
  ) {
    return lackOfArgs;
  }
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

export const cmdParser = function (data) {
  const str = data.toString().replace(EOL, "");

  if (!(str.includes('"') || str.includes("'") || str.includes("`"))) {
    return str.split(" ");
  } else {
    const cmdArr = [];
    const preliminaryArr = str.split(" ");
    let borningCmd = ``;
    preliminaryArr.forEach((item) => {
      if (
        item.startsWith('"') ||
        item.startsWith("'") ||
        item.startsWith("`") ||
        item.endsWith('"') ||
        item.endsWith("`") ||
        item.endsWith("'")
      ) {
        if (!borningCmd) {
          if (item.endsWith('"') || item.endsWith("`") || item.endsWith("'")) {
            borningCmd = item.slice(1, item.length - 1);
            cmdArr.push(borningCmd);
            borningCmd = ``;
          } else borningCmd += item.slice(1);
        } else {
          borningCmd = borningCmd + ` ` + item.slice(0, item.length - 1);
          cmdArr.push(borningCmd);
          borningCmd = ``;
        }
      } else {
        cmdArr.push(item);
      }
    });
    return cmdArr;
  }
};
