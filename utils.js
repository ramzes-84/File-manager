import { cmdOverloaded, lackOfArgs } from "./constants.js";

export const checkInput = function (cmdArr) {
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
