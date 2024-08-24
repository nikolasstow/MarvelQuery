import { performance } from 'perf_hooks';

class Logger {
  private static instance: Logger;
  private verbose: boolean = false;
  private lastLoggedDate: string | null = null;

  private accumulator: { [key: string]: any } = {};
  private duration: { [key: string]: number } = {};

  private constructor() {} // Private constructor to prevent direct instantiation

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  log(message: string): void {
    this.checkDateChange();
    console.log(`[LOG] ${this.getCurrentTime()} - ${message}`);
  }

  verboseLog(message: string): void {
    this.checkDateChange();
    if (this.verbose) {
      console.log(`[VERBOSE] ${this.getCurrentTime()} - ${message}`);
    }
  }

  verboseObject(message: string, object: any): void {
    this.checkDateChange();
    if (this.verbose) {
      console.log(`[VERBOSE] ${this.getCurrentTime()} - ${message}`);
      console.log(object);
    }
  }

  warn(message: string): void {
    this.checkDateChange();
    console.log(`[WARNING] ${this.getCurrentTime()} - ${message}`);
  }

  error(message: string): void {
    this.checkDateChange();
    console.log(`[ERROR] ${this.getCurrentTime()} - ${message}`);
  }

  durationStart(type: string) {
    this.duration[type] = performance.now();
  }

  durationEnd(type: string) {
    const startTime = this.duration[type];
    if (startTime) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const formattedDuration = this.formatDuration(duration);
      this.log(`${type} completed in ${formattedDuration}`);
      delete this.duration[type];
    } else {
      this.warn(`No start time found for ${type}`);
    }
  }

  accumulate(type: string, message: any) {
    this.accumulator[type] = message;
  }

  aggregateData(type: string) {
    const data = this.accumulator[type];
    this.accumulator[type] = null;
    return data;
  }

  private checkDateChange() {
    const currentDate = this.getCurrentDate();
    if (this.lastLoggedDate !== currentDate) {
      if (this.lastLoggedDate !== null) {
        console.log(`\n[DATE CHANGE] ${currentDate}\n`);
      }
      this.lastLoggedDate = currentDate;
    }
  }

  private getCurrentDate(): string {
    const now = new Date();
    return now.toDateString(); // Format: 'Wed Aug 24 2024'
  }

  private getCurrentTime(): string {
    const now = new Date();
    const timeString = now.toTimeString();
    const timePart = timeString.split(' ')[0]; // Extract only the time part (HH:MM:SS)
  
    if (timePart) {
      return timePart;
    } else {
      throw new Error("Failed to parse time from Date object.");
    }
  }

  private formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration.toFixed(2)} ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)} s`;
    } else if (duration < 3600000) {
      return `${(duration / 60000).toFixed(2)} min`;
    } else {
      return `${(duration / 3600000).toFixed(2)} h`;
    }
  }
}

export const logger = Logger.getInstance();