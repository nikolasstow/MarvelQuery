import { format } from "date-fns";
import { performance } from "perf_hooks";
import * as winston from "winston";
import "winston-daily-rotate-file";

// Define an interface for the performance object
interface PerformanceTimer {
  startTime: number;
  stop: (message?: string) => number;
}

// Extend the Winston Logger to include the performance method
export interface CustomLogger extends winston.Logger {
  logFilePath: string;
  performance: (message?: string) => PerformanceTimer;
  measurePerformance: (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => void;
  setVerbose: (verbose: boolean) => void;
  verboseStatus: boolean;
  fileOnly: (message: string) => void;
  line: () => void;
  doubleLine: () => void;
}

class Logger {
  private static instance: Logger;
  private static verboseStatus: boolean = false;
  recentLogs: Set<string> = new Set<string>();
  logger: CustomLogger;

  private constructor() {
    const MAX_LINES = 15;
    const MAX_CONSOLE_LENGTH = 500;
    const DATE_PATTERN = "yyyy-MM-dd";

    const logFilePath = `logs/marvelquery-${format(
      new Date(),
      DATE_PATTERN
    )}.log`;

    const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
      filename: "logs/marvelquery-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      level: "verbose",
    });

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const time = new Date().toLocaleTimeString();
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";

          let logMessage = `${time} [ ${level} ] ${message} ${metaString}`;
          const lines = logMessage.split("\n");
          const truncatedLines: string[] = [];

          let currentLineCount = 0;
          for (const line of lines) {
            const wrappedLineCount = Math.ceil(
              line.length / MAX_CONSOLE_LENGTH
            );
            if (currentLineCount + wrappedLineCount > MAX_LINES) {
              truncatedLines.push(line.slice(0, MAX_CONSOLE_LENGTH) + "...");
              truncatedLines.push(
                `\n──────────────────────────────────────────────────────────────────────────\n`
              );
              truncatedLines.push(
                `Message truncated. Please see the full log in: ${logFilePath}`
              );
              break;
            } else {
              truncatedLines.push(line);
              currentLineCount += wrappedLineCount;
            }
          }

          logMessage = truncatedLines.join("\n") + "\n";

          return logMessage;
        })
      ),
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const { timestamp: _, level: __, message: ___, ...cleanMeta } = meta;
          const metaString = Object.keys(cleanMeta).length
            ? JSON.stringify(cleanMeta, null, 2)
            : "";

          let logMessage = `${timestamp} [${level.toUpperCase()}] - ${message}\n${metaString}`;

          const deduplicationKey = `${level}:${message}:${metaString}`;
          if (this.recentLogs.has(deduplicationKey)) {
            return "";
          }

          this.recentLogs.add(deduplicationKey);
          setTimeout(() => this.recentLogs.delete(deduplicationKey), 60000);

          return logMessage;
        })
      ),
      transports: [consoleTransport, dailyRotateFileTransport],
    }) as CustomLogger;

    this.logger.logFilePath = logFilePath;
    this.logger.performance = this.performance.bind(this);
    this.logger.measurePerformance = this.measurePerformance.bind(this);
    this.logger.setVerbose = Logger.setVerbose.bind(this);
    this.logger.verboseStatus = Logger.verboseStatus;
    this.logger.line = this.line.bind(this);
    this.logger.doubleLine = this.doubleLine.bind(this);

    // Add the new fileOnly method, always using "verbose" level
    this.logger.fileOnly = (message: string) => {
      this.logger.log({
        level: "verbose",
        message: message,
        // silent: true, // prevent the message from being logged to the console
      });
    };
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
    // Logger.instance = new Logger();
  }

  private line() {
    this.logger.verbose(`\n──────────────────────────────────────────────────────────────────────────\n`);
  }

  private doubleLine() {
    this.logger.verbose(`\n==========================================================================\n`);
  }

  // Custom performance method
  private performance(message?: string): PerformanceTimer {
    const startTime = performance.now();
    if (message) {
      this.logger.verbose(`Timer started: ${message}`);
    }
    return {
      startTime,
      stop: (stopMessage?: string): number => {
        const duration = performance.now() - startTime;
        if (stopMessage) {
          this.logger.verbose(
            `Timer stopped: ${stopMessage}. Duration: ${this.formatDuration(
              duration
            )}`
          );
        }
        return duration;
      },
    };
  }

  private measurePerformance(
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ): void {
    if (descriptor === undefined || typeof descriptor.value !== "function") {
      throw new Error(
        `measurePerformance can only be used on methods, not on: ${key}`
      );
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const instance = Logger.getInstance();
      const timer = instance.logger.performance(`Executing ${key}`);
      try {
        const result = await originalMethod.apply(this, args);
        timer.stop(`Finished executing ${key}`);
        return result;
      } catch (error) {
        timer.stop(`Error in ${key}`);
        throw error;
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

export default instance.logger;
