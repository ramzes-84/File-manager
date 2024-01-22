import { sep, normalize, resolve } from "node:path";
import { readdir, stat } from "node:fs/promises";

export class FileManager {
  constructor(userName, userDir) {
    this.user = userName;
    this.userDir = userDir;
    this.currDir = userDir.split(sep);
  }

  greet() {
    return `Welcome to the File Manager, ${this.user}!\n`;
  }
  bye() {
    return `Thank you for using File Manager, ${this.user}, goodbye!\n`;
  }
  showCurrDir() {
    return `You are currently in ${this.currDir.join(sep)}\n`;
  }
  goUp() {
    if (this.currDir.length > 1) {
      this.currDir.pop();
    }
  }
  async changeDir(path) {
    const normdPath = normalize(resolve(this.currDir.join(sep), path));
    if (!normdPath.toUpperCase().startsWith(this.currDir[0]))
      return new Error("The path is beyond the root folder");
    try {
      await readdir(normdPath);
    } catch (err) {
      if (err.errno === -4058) return err;
      throw err;
    }
    this.currDir = normdPath.split(sep);
  }
  async ls() {
    const path = resolve(this.currDir.join(sep));
    const dirContent = await readdir(path);
    const tabularData = dirContent.map(async (item) => {
      const itemStat = await stat(resolve(path, item));
      if (itemStat.isFile()) return { Name: item, Type: "file" };
      if (itemStat.isDirectory()) return { Name: item, Type: "folder" };
    });
    console.log(tabularData);
    return tabularData;
  }
}
