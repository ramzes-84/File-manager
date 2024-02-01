import { resolve } from "node:path";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "crypto";
import { stdout } from "node:process";
import { FileManager } from "./File-manager.js";

export class HashOperations extends FileManager {
  constructor(userName, userDir) {
    super(userName, userDir);
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
}
