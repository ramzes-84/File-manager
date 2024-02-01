import { resolve, parse } from "node:path";
import { readdir, readFile as readFileProm } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { stdout } from "node:process";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream";
import { FileManager } from "./File-manager.js";

export class ZipOperations extends FileManager {
  constructor(userName, userDir) {
    super(userName, userDir);
  }
  async compress(source, target) {
    const sourcePath = resolve(this.getCurrDir(), source);
    const targetPath = resolve(this.getCurrDir(), target);
    try {
      await readFileProm(sourcePath);
      await readdir(targetPath);
    } catch (err) {
      return err;
    }
    const targetFile = resolve(targetPath, parse(sourcePath).base + ".BR");

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
