import winston from "winston";

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
 * Interface for the custom logger that extends Winston's Logger.
 * Adds custom methods for performance timing, verbosity control, and file-only logging.
 */
export interface CustomLogger extends winston.Logger {
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