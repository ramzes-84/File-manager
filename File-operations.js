import { resolve, parse } from "node:path";
import {
  readdir,
  rm,
  stat,
  writeFile,
  rename,
  readFile as readFileProm,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { sortTabularData } from "./utils.js";
import { FileManager } from "./File-manager.js";

export class FileOperations extends FileManager {
  constructor(userName, userDir) {
    super(userName, userDir);
  }

  goUp() {
    const upLevel = resolve(this.getCurrDir(), "../");
    this.setCurrDir(upLevel);
  }
  async changeDir(path) {
    const resolvedPath = resolve(this.getCurrDir(), path);
    if (parse(resolvedPath).root !== this.currDir.root)
      return new Error("The path is beyond the root folder");
    try {
      await readdir(resolvedPath);
    } catch (err) {
      // if (err.errno === -4058 || err.errno === -2 || err.errno === -4048)
      return err;
      // throw err;
    }
    this.setCurrDir(resolvedPath);
  }
  async ls() {
    const currPath = this.getCurrDir();
    const dirContent = await readdir(currPath);
    const tabularData = dirContent.map(async (item) => {
      const itemStat = await stat(resolve(currPath, item));
      if (itemStat.isFile()) return { Name: item, Type: "file" };
      if (itemStat.isDirectory()) return { Name: item, Type: "folder" };
    });
    const result = await Promise.allSettled(tabularData);
    return sortTabularData(result);
  }
  read(path) {
    if (!path) return new Error("Lack of arguments");
    const resolvedPath = resolve(this.getCurrDir(), path);
    const content = createReadStream(resolvedPath);
    return content;
  }
  async add(fileName) {
    const path = resolve(this.getCurrDir(), fileName);
    try {
      await writeFile(path, "");
    } catch (err) {
      return err;
    }
  }
  async renameFile(oldName, newName) {
    const oldPath = resolve(this.getCurrDir(), oldName);
    const newPath = resolve(this.getCurrDir(), newName);
    try {
      await rename(oldPath, newPath);
    } catch (err) {
      return err;
    }
  }
  async copyFile(source, target, remove) {
    const currPath = this.getCurrDir();
    const sourcePath = resolve(currPath, source);
    const targetPath = resolve(currPath, target);
    const targetFile = resolve(targetPath, parse(sourcePath).base);
    try {
      await readFileProm(sourcePath);
      await readdir(targetPath);
      await writeFile(targetFile, "");
    } catch (err) {
      return err;
    }
    const reading = createReadStream(sourcePath);
    const writing = createWriteStream(targetFile);
    writing.on("finish", async () => {
      if (remove) await rm(sourcePath);
    });
    reading.pipe(writing);
  }
  async deleteFile(path) {
    const filePath = resolve(this.getCurrDir(), path);
    try {
      await rm(filePath);
    } catch (err) {
      return err;
    }
  }
}
