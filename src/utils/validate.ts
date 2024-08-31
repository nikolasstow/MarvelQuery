import logger from "../utils/Logger";
import {
  GlobalParams,
  EndpointType,
  AnyParams,
  Endpoint,
  Result,
  EndpointDescriptor,
} from "../models/types";
import { VALID_ENDPOINTS } from "../models/endpoints";
import { ValidateParams } from "../models/schemas/param-schemas";
import { ResultSchemaMap } from "../models/schemas/data-schemas";
import { ZodError } from "zod";

/** Validate the global parameters. */
export function validateGlobalParams(globalParams: GlobalParams): void {
  logger.verbose("Validating global parameters");
  const types = Object.keys(globalParams) as EndpointType[]; // Get the keys of the globalParams object

  for (const type of types) {
    if (!VALID_ENDPOINTS.has(type) && type !== ("all" as EndpointType)) {
      logger.warn(`Invalid endpoint type in global parameters: ${type}`);
      continue;
    }

    logger.verbose(`Validating global parameters for endpoint: ${type}`);
    validateParams(type as EndpointType, globalParams[type]); // Validate the parameters of the query for the endpoint type
  }
}

/** Validate the parameters of the query. */
export function validateParams(type: EndpointType, params: AnyParams): void {
  logger.verbose(`Validating parameters for endpoint type: ${type}`);
  try {
    // Confirm there's a validation function for the endpoint type
    if (!ValidateParams[type]) {
      throw new Error(`Could not find validation schema for Endpoint: ${type}`);
    }
    // Validate the parameters for the endpoint type
    logger.verbose("Parsing parameters using validation schema");
    ValidateParams[type].parse(params);
    logger.verbose("Parameter validation successful");
  } catch (error) {
    logger.error(
      `Parameter validation error for endpoint ${type}: ${error.message}`
    );
    throw new Error("Invalid parameters");
  }
}

/** Validate the endpoint */
export function validateEndpoint<E extends Endpoint>(endpoint: E): E {
  logger.verbose("Validating endpoint");
  /** Validate the endpoint. */
  if (!endpoint) {
    logger.error("Endpoint validation failed: Endpoint is required");
    throw new Error("Endpoint is required");
  }

  // Validation methods for endpoint parts
  const validate = {
    type: (element?: EndpointType) => {
      if (element && !VALID_ENDPOINTS.has(element)) {
        logger.error(`Unknown endpoint type: ${element}`);
        throw new Error(`Unknown endpoint type: ${element}`);
      }
    },
    id: (element?: number) => {
      if (element && typeof element !== "number") {
        logger.error(`Invalid endpoint id: ${element}`);
        throw new Error(`Invalid endpoint id: ${element}`);
      }
    },
  };

  const [first, second, third] = endpoint;

  validate.type(first);
  validate.id(second);
  validate.type(third);

  /** Validate that the first and third elements of the endpoint are not the same. */
  if (first && third && first === third) {
    logger.error(
      `Invalid endpoint: ${first} and ${third} cannot be the same type`
    );
    throw new Error(
      `Invalid endpoint: ${endpoint[0]} and ${endpoint[2]} cannot be the same type`
    );
  }

  logger.verbose("Endpoint validation successful");
  return endpoint;
}

/** Verify that the condition is true, and if not, throw a warning. */
export function verify(logic: boolean, action: () => void): boolean {
  if (logic) {
    action();
  }
  return logic;
}

function groupConsecutiveIndices(indices: number[]): string[] {
  if (indices.length === 0) return [];

  const groups: string[] = [];
  
  // TypeScript now knows indices has at least one element, so indices[0] is not undefined
  let start: number = indices[0]!;
  let end: number = indices[0]!;

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

  if (start === end) {
    groups.push(`${start}`);
  } else {
    groups.push(`${start}-${end}`);
  }

  return groups;
}

function logValidationErrors(errorMap: Map<string, number[]>, totalResults: number) {
  if (errorMap.size === 0) {
    logger.verbose("All results validated successfully");
    return;
  }

  let allFailed = true;

  errorMap.forEach((indices, error) => {
    if (indices.length !== totalResults) {
      allFailed = false;
    }

    const groupedIndices = groupConsecutiveIndices(indices);

    if (groupedIndices.length > 1) {
      logger.verbose(
        `Validation failed for results at indices ${groupedIndices.join(', ')}:`,
        JSON.parse(error)
      );
    } else {
      logger.verbose(
        `Validation failed for result at index ${groupedIndices[0]}:`,
        JSON.parse(error)
      );
    }
  });

  if (allFailed) {
    logger.warn("All results failed validation.");
  } else if (!logger.verboseStatus) {
    logger.warn(
      `Some results failed validation. See log for details: ${logger.logFilePath}`
    );
  }
}

export function validateResults<E extends Endpoint>(
  results: Result<E>[], 
  endpoint: EndpointDescriptor<E>
) {
  logger.verbose("Validating query results");

  try {
    const resultSchema = ResultSchemaMap[endpoint.type];

    if (!resultSchema) {
      throw new Error(
        `Could not find validation schema for endpoint type: ${endpoint.type}`
      );
    }

    const errorMap = new Map<string, number[]>();
    let allValid = true;

    // Array to collect log messages for failed result items
    const failedItemsLogs: string[] = [];

    results.forEach((item, index) => {
      const result = resultSchema.safeParse(item);

      if (!result.success) {
        allValid = false;
        const currentError = JSON.stringify(result.error.format());

        if (errorMap.has(currentError)) {
          errorMap.get(currentError)!.push(index);
        } else {
          errorMap.set(currentError, [index]);
        }

        // Collect the failed result item log message
        const formattedItem = JSON.stringify(item, null, 2); // Pretty-print JSON with 2-space indentation
        const separatorLine = `\n----- Failed Result at Index ${index} -----\n`;
        failedItemsLogs.push(`${separatorLine}${formattedItem}`);
      }
    });

    // Log the validation summary before logging the individual failed items
    logValidationErrors(errorMap, results.length);

    // Now log each failed result item to the file
    failedItemsLogs.forEach(logMessage => {
      logger.fileOnly(logMessage);
    });

  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation Error:", error.errors);
    } else {
      logger.error("Unexpected Error:", error);
    }
  }
}