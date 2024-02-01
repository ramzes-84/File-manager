import { format, parse } from "node:path";

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
}
