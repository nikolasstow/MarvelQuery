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
interface CustomLogger extends winston.Logger {
  performance: (message?: string) => PerformanceTimer;
}

class Logger {
  private static instance: Logger;
  private static verboseStatus: boolean = false;

  logger: CustomLogger;

  private constructor() {
    const MAX_LINES = 15; // Set your desired max number of lines here
    const MAX_CONSOLE_LENGTH = 500; // Optional: max length to avoid very long lines wrapping
    const DATE_PATTERN = "yyyy-MM-dd"; // Same date pattern as used in DailyRotateFile

    const logFilePath = `logs/marvelquery-${format(
      new Date(),
      DATE_PATTERN
    )}.log`;

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
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2) // Pretty-print JSON with 2 spaces indentation
            : "";

          let logMessage = `${time} [ ${level} ] ${message} ${metaString}`;

          // Truncate lines
          const lines = logMessage.split("\n");
          const truncatedLines: string[] = [];

          let currentLineCount = 0;
          for (const line of lines) {
            const wrappedLineCount = Math.ceil(
              line.length / MAX_CONSOLE_LENGTH
            ); // Estimate wrapped lines
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
      level: "info", // Default level
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Clean up metadata to exclude unwanted fields like timestamp
          const { timestamp: _, level: __, message: ___, ...cleanMeta } = meta;
          const metaString = Object.keys(cleanMeta).length
            ? JSON.stringify(cleanMeta, null, 2) // Pretty-print JSON with 2 spaces indentation
            : "";

          let logMessage = `${timestamp} [${level.toUpperCase()}] - ${message}\n${metaString}`;

          // Deduplication logic
          const deduplicationKey = `${level}:${message}:${metaString}`;
          if (this.recentLogs.has(deduplicationKey)) {
            return ""; // Skip logging duplicate messages
          }

          // Add to recent logs and set timeout to remove after 1 minute
          this.recentLogs.add(deduplicationKey);
          setTimeout(() => this.recentLogs.delete(deduplicationKey), 60000); // Clear after 1 minute

          return logMessage;
        })
      ),
      transports: [consoleTransport, dailyRotateFileTransport],
    }) as CustomLogger;

    // Attach additional methods and properties to the logger for measuring performance and checking verbosity
    this.logger.logFilePath = logFilePath;
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
          this.logger.info(
            `Timer stopped: ${stopMessage}. Duration: ${this.formatDuration(
              duration
            )}`
          );
        }
        return duration;
      },
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

const setVerbose = Logger.setVerbose;

export default instance.logger;
export { setVerbose };
