import { resolve, format, parse } from "node:path";
import {
  readdir,
  rm,
  stat,
  writeFile,
  rename,
  readFile as readFileProm,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { EOL, cpus, homedir, userInfo, arch } from "os";
import { createHash } from "crypto";
import { stdout } from "node:process";
import { sortTabularData } from "./utils.js";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream";

export class FileManager {
  constructor(userName, userDir) {
    this.user = userName;
    this.currDir = parse(userDir);
  }
  getCurrDir() {
    return format(this.currDir);
  }
  setCurrDir(newCurrDir) {
    this.currDir = parse(newCurrDir);
  }
  greet() {
    return `Welcome to the File Manager, ${this.user}!\n`;
  }
  bye() {
    return `Thank you for using File Manager, ${this.user}, goodbye!\n`;
  }
  showCurrDir() {
    return `You are currently in ${this.getCurrDir()}\n`;
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
      if (err.errno === -4058) return err;
      throw err;
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
  getOSInfo(command) {
    switch (command) {
      case "--EOL":
        return JSON.stringify(EOL);
      case "--cpus":
        const cpusInfo = cpus();
        return cpusInfo.map((cpu, index, arr) => {
          return `CPU ${index + 1} of ${arr.length}: Model ${
            cpu.model
          }, clock rate ${cpu.speed / 1000} GHz`;
        });
      case "--homedir":
        return homedir();
      case "--username":
        return userInfo().username;
      case "--architecture":
        return arch();
      default:
        return "Invalid argument";
    }
  }
  calcHash(path) {
    const readStream = createReadStream(resolve(this.getCurrDir(), path));
    const hash = createHash("sha256");
    readStream.on("readable", () => {
      const data = readStream.read();
      if (data) hash.update(data);
      else {
        stdout.write(`${hash.digest("hex")}\n`);
        stdout.write(this.showCurrDir());
      }
    });
  }
  async compress(source, target) {
    const currPath = this.getCurrDir();
    const sourcePath = resolve(currPath, source);
    const targetPath = resolve(currPath, target);
    const targetFile = resolve(targetPath, parse(sourcePath).base + ".BR");
    try {
      await readFileProm(sourcePath);
      await readdir(targetPath);
    } catch (err) {
      return err;
    }

    const reading = createReadStream(sourcePath);
    const writing = createWriteStream(targetFile);
    const zipping = createBrotliCompress();
    pipeline(reading, zipping, writing, (err) => {
      if (err) stdout.write(`Operation failed: ${err.message}.\n`);
      else {
        stdout.write(`File ${parse(sourcePath).base} compressed.\n`);
        stdout.write(this.showCurrDir());
      }
    });
  }
  async decompress(source, target) {
    const sourcePath = resolve(this.getCurrDir(), source);
    const targetPath = resolve(this.getCurrDir(), target);
    const sourceFileName = parse(sourcePath).base;
    const targetFileName = sourceFileName.endsWith(".BR")
      ? sourceFileName.slice(0, sourceFileName.length - 3)
      : sourceFileName;
    const targetFile = resolve(targetPath, targetFileName);
    try {
      await readFileProm(sourcePath);
      await readdir(targetPath);
    } catch (err) {
      return err;
    }

    const reading = createReadStream(sourcePath);
    const writing = createWriteStream(targetFile);
    const unzipping = createBrotliDecompress();
    pipeline(reading, unzipping, writing, (err) => {
      if (err) stdout.write(`Operation failed: ${err.message}.\n`);
      else {
        stdout.write(`File ${parse(sourcePath).base} decompressed.\n`);
        stdout.write(this.showCurrDir());
      }
    });
  }
}
