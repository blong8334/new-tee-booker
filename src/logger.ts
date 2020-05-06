type tStringArr = string[];

function helper(filename: string, level: string, ...args: tStringArr): void {
  console[level](new Date().toISOString(), '|', filename, '|', ...args);
}

export default class Logger {
  public filename: string;
  private helper: (...args: tStringArr) => void;
  constructor(filename: string) {
    this.filename = filename;
    this.helper = helper.bind(null, filename);
  }
  public info(...args: tStringArr): void {
    this.helper('info', ...args);
  }
  public error(...args: tStringArr): void {
    this.helper('error', ...args);
  }
  public warn(...args: tStringArr): void {
    this.helper('warn', ...args);
  }
}