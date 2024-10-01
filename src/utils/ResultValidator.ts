import { Endpoint, EndpointDescriptor } from "../models/types/endpoint-types";
import { APIResult, APIWrapper } from "../models/types/data-types";
import { CustomLogger } from "./Logger";
import { APIWrapperSchema, ResultSchemaMap } from "../models/schemas/data-schemas";
import { ZodError } from "zod";
import { MarvelResult } from "lib";

/**
 * Class responsible for validating the query results against predefined schemas.
 * If validation fails, it logs the errors for debugging and analysis.
 * @template E - The specific endpoint type being validated.
 */
export class ResultValidator<E extends Endpoint> {
  /** The custom logger instance used for logging actions */
  logger: CustomLogger;
  allValid: boolean = true;

  static assertAPIResponse<T extends MarvelResult>(response: unknown): asserts response is APIWrapper<T> {
    if (!APIWrapperSchema.safeParse(response).success) {
      throw new Error("Invalid API response");
    }
  }

  /**
   * Constructor to initialize the ResultValidator class.
   * It validates the results against a schema defined for the endpoint type.
   * @param results - The array of results to validate.
   * @param endpoint - The descriptor of the endpoint for which the results are being validated.
   * @param logger - The custom logger instance used for logging validation actions.
   */
  constructor(
    results: APIResult<E>[],
    endpoint: EndpointDescriptor<E>,
    logger: CustomLogger
  ) {
    this.logger = logger;
    logger.verbose("Validating query results");

    try {
      // Get the schema for the endpoint type
      const resultSchema = ResultSchemaMap[endpoint.type];

      if (!resultSchema) {
        throw new Error(
          `Could not find validation schema for endpoint type: ${endpoint.type}`
        );
      }

      const errorMap = new Map<string, number[]>();


      // Array to collect log messages for failed result items
      const failedItemsLogs: string[] = [];

      results.forEach((item, index) => {
        // Validate each result item against the schema
        const result = resultSchema.safeParse(item);

        if (!result.success) {
          this.allValid = false;
          const currentError = JSON.stringify(result.error.format());

          // Add the error and index to the error map
          if (errorMap.has(currentError)) {
            errorMap.get(currentError)!.push(index);
          } else {
            errorMap.set(currentError, [index]);
          }

          // Format and collect the failed result item for logging
          const formattedItem = JSON.stringify(item, null, 2); // Pretty-print JSON with 2-space indentation
          const separatorLine = `\n----- Failed Result at Index ${index} -----\n`;
          failedItemsLogs.push(`${separatorLine}${formattedItem}`);
        }
      });

      // Log validation errors summary
      this.logValidationErrors(errorMap, results.length);

      // Log each failed result item to the file
      failedItemsLogs.forEach((logMessage) => {
        logger.fileOnly(logMessage);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Log Zod validation errors
        logger.error("Validation Error:", error.errors);
      } else {
        // Log unexpected errors
        logger.error("Unexpected Error:", error);
      }
    }
  }

  /**
   * Logs validation errors by grouping the indices where validation failed and showing the error messages.
   * @param errorMap - A map of errors and the indices where they occurred.
   * @param totalResults - The total number of results processed.
   */
  private logValidationErrors(errorMap: Map<string, number[]>, totalResults: number) {
    if (errorMap.size === 0) {
      this.logger.verbose("All results validated successfully");
      return;
    }

    let allFailed = true;

    // Iterate over the error map and log the validation failures
    errorMap.forEach((indices, error) => {
      // Check if all results failed validation
      if (indices.length !== totalResults) {
        allFailed = false;
      }

      // Group consecutive indices for better readability in logs
      const groupedIndices = this.groupConsecutiveIndices(indices);

      // Log the grouped indices and error message
      if (groupedIndices.length > 1) {
        this.logger.verbose(
          `Validation failed for results at indices ${groupedIndices.join(', ')}:`,
          JSON.parse(error)
        );
      } else {
        this.logger.verbose(
          `Validation failed for result at index ${groupedIndices[0]}:`,
          JSON.parse(error)
        );
      }
    });

    // Log a warning if all results failed validation
    if (allFailed) {
      this.logger.warn("All results failed validation.");
    } else if (!this.logger.verboseStatus) {
      // Log a warning if only some results failed validation
      this.logger.warn(
        `Some results failed validation. See log for details: ${this.logger.logFilePath}`
      );
    }
  }

  /**
   * Groups consecutive indices into ranges for cleaner logging.
   * For example, [1, 2, 3, 5, 6] would be grouped into ["1-3", "5-6"].
   * @param indices - An array of indices to group.
   * @returns An array of strings representing grouped ranges of indices.
   */
  private groupConsecutiveIndices(indices: number[]): string[] {
    if (indices.length === 0) return [];

    const groups: string[] = [];

    // Start with the first index
    let start: number = indices[0]!;
    let end: number = indices[0]!;

    // Iterate through the indices and group consecutive ones
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === end + 1) {
        end = indices[i]!;
      } else {
        if (start === end) {
          groups.push(`${start}`);
        } else {
          groups.push(`${start}-${end}`);
        }
        start = indices[i]!;
        end = indices[i]!;
      }
    }

    // Add the final group
    if (start === end) {
      groups.push(`${start}`);
    } else {
      groups.push(`${start}-${end}`);
    }

    return groups;
  }
}