type tAnyArray = any[];

function helper(filename: string, level: string, ...args: tAnyArray): void {
  console[level](new Date().toISOString(), '|', filename, '|', ...args);
}

export default class Logger {
  public filename: string;
  private helper: (...args: tAnyArray) => void;
  constructor(filename: string) {
    this.filename = filename;
    this.helper = helper.bind(null, filename);
  }
  public info(...args: tAnyArray): void {
    this.helper('info', ...args);
  }
  public error(...args: tAnyArray): void {
    this.helper('error', ...args);
  }
  public warn(...args: tAnyArray): void {
    this.helper('warn', ...args);
  }
}