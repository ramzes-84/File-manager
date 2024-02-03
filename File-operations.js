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
import { stdout } from "node:process";

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
    try {
      await readdir(resolvedPath);
    } catch (err) {
      return err;
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
  copyFile(source, target, remove) {
    const currPath = this.getCurrDir();
    const sourcePath = resolve(currPath, source);
    const targetPath = resolve(currPath, target);
    const targetFile = resolve(targetPath, parse(sourcePath).base);
    const reading = createReadStream(sourcePath);
    const writing = createWriteStream(targetFile);
    reading.on("error", (err) => this.showError(err));
    writing.on("error", (err) => this.showError(err));
    writing.on("finish", async () => {
      if (remove) {
        try {
          await rm(sourcePath);
        } catch (err) {
          this.showError(err);
        }
      }
      stdout.write(remove ? `File moved.\n` : `File copied.\n`);
      stdout.write(this.showCurrDir());
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
