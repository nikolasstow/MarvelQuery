import { logger } from "../utils/Logger";
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

/** Validate the global parameters. */
export function validateGlobalParams(globalParams: GlobalParams): void {
  logger.verboseLog("Validating global parameters");
  const types = Object.keys(globalParams) as EndpointType[]; // get the keys of the globalParams object
  for (const type of types) {
    if (VALID_ENDPOINTS.has(type)) {
      // check if the endpoint type is valid
      validateParams(type as EndpointType, globalParams[type]); // validate the parameters of the query for the endpoint type
    }
  }
}

/** Validate the parameters of the query. */
export function validateParams(type: EndpointType, params: AnyParams): void {
  logger.verboseLog(`Validating parameters for endpoint type: ${type}`);
  try {
    // Confirm there's a validation function for the endpoint type
    if (!ValidateParams[type]) {
      throw new Error(`Could not find validation schema for Endpoint: ${type}`);
    }
    // Validate the parameters for the endpoint type
    logger.verboseLog("Parsing parameters using validation schema");
    ValidateParams[type].parse(params);
  } catch (error) {
    console.error("Parameter validation error:", error);
    throw new Error("Invalid parameters");
  }
}

/** Validate the endpoint */
export function validateEndpoint<E extends Endpoint>(endpoint: E): E {
  logger.verboseLog("Validating endpoint");
  /** Validate the endpoint. */
  if (!endpoint) {
    throw new Error("Endpoint is required");
  }

  // Validation methods for endpoint parts
  const validate = {
    type: (element?: EndpointType) => {
      if (element && !VALID_ENDPOINTS.has(element)) {
        throw new Error(`Unknown endpoint type: ${element}`);
      }
    },
    id: (element?: number) => {
      if (element && typeof element !== "number") {
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
    throw new Error(
      `Invalid endpoint: ${endpoint[0]} and ${endpoint[2]} cannot be the same type`
    );
  }

  logger.verboseLog("Endpoint validation successful");
  return endpoint;
}
/** Verify that the condition is true, and if not, throw a warning. */

export function verify(logic: boolean, message: string): boolean {
  if (logic) {
    logger.warn(message);
  }

  return logic;
}

/** Validate the results of the query. */
export function validateResults<E extends Endpoint>(results: Result<E>[], endpoint: EndpointDescriptor<E>) {
  logger.verboseLog("Validating query results");
  /** Determine expected result schema */
  const resultSchema = ResultSchemaMap[endpoint.type];
  if (!resultSchema) {
    logger.warn(`Invalid result schema, ${endpoint.type}`);
  }

  /** Validate the response data with the result schema. */
  const result = resultSchema.safeParse(results);
  if (!result.success) {
    logger.warn(
      "Error validating results:" + 
      JSON.stringify(result.error, null, 2)
    );
  }
}
