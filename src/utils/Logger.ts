import { format } from "date-fns";
import { performance } from "perf_hooks";
import { ConfigOptions } from "../models/types/config-types";
import * as winston from "winston";
import "winston-daily-rotate-file";
import { stringify as flattedStringify } from 'flatted';

/**
 * Interface for the custom logger that extends Winston's Logger.
 * Adds custom methods for performance timing, verbosity control, and file-only logging.
 */
export interface CustomLogger extends winston.Logger {
  setConfig: any;
  /** Path to the log file used by the logger. */
  logFilePath: string;

  /**
   * Starts a performance timer and returns a timer object.
   * @param message Optional message to log when the timer starts.
   * @param logger Optional custom logger instance to use for logging.
   * @returns The performance timer object.
   */
  performance: (message?: string, logger?: CustomLogger) => PerformanceTimer;

  /**
   * Decorator function to measure the performance of a class method.
   * @param target The class the method belongs to.
   * @param key The name of the method.
   * @param descriptor Method descriptor object.
   */
  measurePerformance: (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => void;

  /**
   * Enables or disables verbose logging.
   * @param verbose Boolean indicating whether verbose logging should be enabled.
   */
  setVerbose: (verbose: boolean) => void;

  /** Whether verbose logging is currently enabled. */
  verboseStatus: boolean;

  /**
   * Logs a message only to the log file, bypassing the console.
   * @param message The message to log.
   */
  fileOnly: (message: string) => void;

  /**
   * Creates a child logger instance identified by the provided ID.
   * @param id A unique identifier to distinguish the logger.
   * @returns A new logger instance with the provided ID attached.
   */
  identify: (id: string) => CustomLogger;
}


/**
 * Interface for the performance timer object.
 * This object holds the start time and a stop function to calculate the duration.
 */

export interface PerformanceTimer {
  /** The start time of the performance measurement, in milliseconds. */
  startTime: number;

  /**
   * Stops the performance timer and logs the duration.
   * @param message Optional message to include when logging the stop time.
   * @returns The duration between the start and stop time, in milliseconds.
   */
  stop: (message?: string) => number;
}

/**
 * Logger class that provides custom logging features, including performance measurement,
 * verbose mode control, and log message deduplication.
 */
export class Logger {
  private static instance: Logger;
  private static verboseStatus: boolean = false;
  private static maxLines: number = 23;
  private static maxLineLength: number = 500;
  private static isTestEnv: boolean = false;
  private static maxSize: string = "20m";
  private static maxFiles: string = "14d";
  /** Set to store recent logs to prevent duplicate messages */
  recentLogs: Set<string> = new Set<string>();
  /** The custom Winston logger instance */
  logger: CustomLogger;

  /**
   * Creates a new instance of the Logger class.
   * If a query ID is provided, it's used to create unique log messages.
   * @param id - Optional identifier for the logger (e.g., query ID).
   */
  constructor(id?: string) {
    const DATE_PATTERN = "yyyy-MM-dd"; // Date format for log files.

    const logFilePath = `logs/marvelquery-${format(
      new Date(),
      DATE_PATTERN
    )}.log`;

    // Transport for logging to rotating daily log files
    const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
      filename: "logs/marvelquery-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: Logger.maxSize,
      maxFiles: Logger.maxFiles,
      level: "verbose", // Log level for file output
    });

    // Transport for logging to the console
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize the log output
        winston.format.timestamp(), // Add timestamp to the log
        winston.format.printf(({ timestamp, level, message, queryId, ...meta }) => {
          const time = new Date().toLocaleTimeString();
          const metaString = Object.keys(meta).length
            ? flattedStringify(meta, undefined, 2)
            : "";

          // Create identifier string with a unique background color based on query ID
          const identifier = queryId ? this.getColorFromId(queryId) : "-";

          // Remove ANSI escape codes from the level (for cleaner output)
          const levelString = level.replace(/\x1B\[([0-9;]*[A-Za-z])/g, "");
          // Show level in logs unless it's verbose
          const levelId = levelString === "verbose" ? "" : `[${level}]`;

          // Format log message and truncate if it exceeds the line/length limits
          let logMessage = `${time} ${levelId}${identifier} ${message} ${metaString}`;
          const lines = logMessage.split("\n");
          const truncatedLines: string[] = [];

          let currentLineCount = 0;
          for (const line of lines) {
            const wrappedLineCount = Math.ceil(line.length / Logger.maxLineLength);
            if (currentLineCount + wrappedLineCount > Logger.maxLines) {
              truncatedLines.push(line.slice(0, Logger.maxLineLength) + "...");
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

    // Create the logger with both file and console transports
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, queryId, ...meta }) => {
          const { timestamp: _, level: __, message: ___, ...cleanMeta } = meta;

          const metaString = Object.keys(cleanMeta).length
            ? flattedStringify(cleanMeta, undefined, 2)
            : "";

          const identifier = queryId ? ` (Q${queryId})` : "";

          // Format log message with timestamp, level, message, and metadata
          let logMessage = `${timestamp} [${level.toUpperCase()}]${identifier} - ${message}\n${metaString}`;

          // Deduplicate logs by storing the unique key in recentLogs set
          const deduplicationKey = `${level}:${message}:${metaString}`;
          if (this.recentLogs.has(deduplicationKey)) {
            return ""; // Return empty if the message is a duplicate
          }

          this.recentLogs.add(deduplicationKey);
          if (!Logger.isTestEnv) setTimeout(() => this.recentLogs.delete(deduplicationKey), 60000); // Remove after 1 minute

          return logMessage;
        })
      ),
      transports: [consoleTransport, dailyRotateFileTransport],
    }) as CustomLogger;

    // Bind additional methods to the winston logger
    this.logger.logFilePath = logFilePath;
    this.logger.performance = this.performance.bind(this);
    this.logger.measurePerformance = this.measurePerformance.bind(this);
    this.logger.setConfig = Logger.setConfig.bind(this);
    this.logger.setVerbose = Logger.setVerbose.bind(this);
    this.logger.verboseStatus = Logger.verboseStatus;
    this.logger.identify = this.createLoggerWithId.bind(this);

    // Method for logging directly to file only
    this.logger.fileOnly = (message: string) => {
      this.logger.log({
        level: "verbose",
        message: message,
      });
    };
  }

  /**
   * Generates a background color based on the ID and returns the ID with the color applied.
   * @param id - The unique ID to generate a color for.
   * @returns A string with ANSI escape codes for background color.
   */
  private getColorFromId(id: string): string {
    const standardBackgroundColors = [
      40, 41, 42, 43, 44, 45, 46, 47, // Standard colors
      100, 101, 102, 103, 104, 105, 106, 107, // Bright colors
    ];

    // Convert ID to an integer and map it to one of the colors
    const numericId = parseInt(id, 10);
    const colorCode = standardBackgroundColors[numericId % standardBackgroundColors.length];

    // Return the ID string with the background color applied
    return `\x1b[${colorCode}m Q${id} \x1b[0m`;
  }

  /**
   * Creates a new logger instance with a query ID for tracking.
   * @param queryId - The ID to associate with this logger.
   * @returns A new logger instance with the query ID included.
   */
  public createLoggerWithId(queryId: string) {
    return this.logger.child({ queryId });
  }

  /**
   * Retrieves the singleton instance of the Logger class.
   * @returns The singleton Logger instance.
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Enables or disables verbose logging.
   * @param verbose - A boolean to toggle verbose logging.
   */
  static setVerbose(verbose: boolean) {
    Logger.verboseStatus = verbose;
    Logger.instance.logger.level = verbose ? "verbose" : "info";
  }

  static setConfig<AQ extends boolean, HP extends boolean>(config: ConfigOptions<AQ, HP>) {
    Logger.maxLines = config.logOptions?.maxLines ?? 23;
    Logger.maxLineLength = config.logOptions?.maxLineLength ?? 500;
    Logger.setVerbose(config.logOptions?.verbose ?? false);
    Logger.isTestEnv = config.isTestEnv ?? false;
    Logger.maxSize = config.logOptions?.maxFileSize ?? "20m";
    Logger.maxFiles = config.logOptions?.maxFiles ?? "14d";
  }

  /**
   * Custom performance timer method to measure the duration of tasks.
   * Logs the duration when the `stop` method is called.
   * @param message - Optional message to log when starting the timer.
   * @param customLogger - Optional custom logger to use for logging.
   * @returns An object with `startTime` and a `stop` method.
   */
  private performance(message?: string, customLogger?: CustomLogger): PerformanceTimer {
    const logger = customLogger ?? this.logger;
    const startTime = performance.now();
    if (message) {
      logger.verbose(message);
    }
    return {
      startTime,
      stop: (stopMessage?: string): number => {
        const duration = performance.now() - startTime;
        const formattedMessage = stopMessage ? `${stopMessage}. ` : "";

        // Log the duration of the task
        logger.verbose(`${formattedMessage}Duration: ${this.formatDuration(duration)}`);

        return duration;
      },
    };
  }

  /**
   * A method decorator to measure the performance of an asynchronous function.
   * @param target - The target object.
   * @param key - The method name.
   * @param descriptor - The property descriptor of the method.
   */
  private measurePerformance(
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ): void {
    if (descriptor === undefined || typeof descriptor.value !== "function") {
      throw new Error(`measurePerformance can only be used on methods, not on: ${key}`);
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

  /**
   * Formats the duration into a human-readable string (ms or s).
   * @param duration - The duration in milliseconds.
   * @returns A formatted string representing the duration.
   */
  private formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration.toFixed(2)}ms`;
    } else {
      return `${(duration / 1000).toFixed(2)}s`;
    }
  }
}

// Singleton instance of the Logger class
const instance = Logger.getInstance();

export default instance.logger;