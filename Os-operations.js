import { EOL, cpus, homedir, userInfo, arch } from "os";
import { FileManager } from "./File-manager.js";

export class OsOperations extends FileManager {
  constructor(userName, userDir) {
    super(userName, userDir);
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
}
