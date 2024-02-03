import { resolve, parse } from "node:path";
import { createReadStream, createWriteStream, rm } from "node:fs";
import { stdout } from "node:process";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream";
import { FileManager } from "./File-manager.js";

export class ZipOperations extends FileManager {
  constructor(userName, userDir) {
    super(userName, userDir);
  }
  compress(source, target, isCompress) {
    const sourcePath = resolve(this.getCurrDir(), source);
    const targetPath = resolve(this.getCurrDir(), target);
    const reading = createReadStream(sourcePath);
    const writing = createWriteStream(targetPath);
    const zipping = isCompress
      ? createBrotliCompress()
      : createBrotliDecompress();
    pipeline(reading, zipping, writing, (err) => {
      if (err) {
        rm(targetPath, (err) => {
          if (err) this.showError(err);
        });
        this.showError(err);
      } else {
        stdout.write(
          `File ${parse(sourcePath).base} ${
            isCompress ? "compressed" : "decompressed"
          }.\n`
        );
        stdout.write(this.showCurrDir());
      }
    });
  }
}
