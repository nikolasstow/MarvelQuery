import { performance } from "perf_hooks";
import * as winston from "winston";
import "winston-daily-rotate-file";

// Define an interface for the performance object
interface PerformanceTimer {
  startTime: number;
  stop: (message?: string) => number;
}

// Extend the Winston Logger to include the performance method
interface CustomLogger extends winston.Logger {
  performance: (message?: string) => PerformanceTimer;
}

class Logger {
  private static instance: Logger;
  private static verboseStatus: boolean = false;
  private lastLoggedDate: string | null = null;

  private accumulator: { [key: string]: any } = {};
  private duration: { [key: string]: number } = {};

  logger: CustomLogger;

  private constructor() {

    console.log("Creating logger...");

    const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
      filename: "logs/marvelquery-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d", // Keep logs for 14 days
    });

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize the output
        winston.format.timestamp(),
        winston.format.printf(({ level, message }) => {
          const time = new Date().toLocaleTimeString(); // Only time (HH:MM:SS)
          return `${time} [${level}] ${message}`;
        })
      ),
    });

    this.logger = winston.createLogger({
      level: "info", // Default level
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}] - ${message}`;
        })
      ),
      transports: [
        consoleTransport,
        dailyRotateFileTransport,
      ],
    }) as CustomLogger;

    // Attach the performance method to the logger instance
    this.logger.performance = this.performance.bind(this);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  static setVerbose(verbose: boolean) {
    Logger.verboseStatus = verbose;
    Logger.instance.logger.level = verbose ? "verbose" : "info";
  }

  // Custom performance method
  private performance(message?: string): PerformanceTimer {
    const startTime = performance.now();
    if (message) {
      this.logger.info(`Timer started: ${message}`);
    }
    return {
      startTime,
      stop: (stopMessage?: string): number => {
        const duration = performance.now() - startTime;
        if (stopMessage) {
          this.logger.info(`Timer stopped: ${stopMessage}. Duration: ${this.formatDuration(duration)}`);
        }
        return duration;
      }
    };
  }

  // Format duration into a readable string
  private formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration.toFixed(2)}ms`;
    } else {
      return `${(duration / 1000).toFixed(2)}s`;
    }
  }
}

const instance = Logger.getInstance();

const setVerbose = Logger.setVerbose

export default instance.logger;
export { setVerbose };
