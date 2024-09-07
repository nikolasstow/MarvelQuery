import {
  AsEndpoint,
  DataType,
  Endpoint,
  EndpointDescriptor,
  EndpointType,
} from "src/models/types";
import logger, { CustomLogger } from "./Logger";

/**
 * Class to build and validate an API endpoint.
 * It checks the structure and types of the endpoint path to ensure validity.
 * @template E - The specific endpoint type being validated.
 */
export class EndpointBuilder<E extends Endpoint>
  implements EndpointDescriptor<E>
{
  /** The custom logger instance used for logging actions in the query */
  logger: CustomLogger;
  /** The validated path of the endpoint */
  path: E;
  /** The data type inferred from the endpoint */
  type: DataType<E>;

  /**
   * Constructor to initialize the EndpointBuilder with a given endpoint and logger.
   * Validates the endpoint path and infers the data type based on its structure.
   * @param endpoint - The endpoint path to be validated.
   * @param customLogger - The custom logger instance used for logging actions.
   */
  constructor(endpoint: E, customLogger: CustomLogger = logger) {
    // Initialize the logger for the class.
    this.logger = customLogger;
    // Validate the endpoint path and determine the data type.
    this.assertsEndpoint(endpoint);
    this.path = endpoint;

    /** Determine the data type of the query from the endpoint.
     * If the endpoint has three elements, use the third one; otherwise, use the first.
     */
    this.type = (
      endpoint.length === 3 ? endpoint[2] : endpoint[0]
    ) as DataType<E>;

    // Log the data type that was determined.
    this.logger.verbose(`Data type: ${this.type}`);
  }

  /**
   * Validates the structure of the endpoint path and ensures that it follows
   * the correct format with valid types and IDs.
   * @param endpoint - The endpoint path to be validated.
   * @returns The validated endpoint path.
   * @throws Will throw an error if the endpoint is invalid or missing.
   */
  private assertsEndpoint(endpoint: E): asserts endpoint is E {
    if (!endpoint) {
      // Log and throw an error if the endpoint is missing.
      this.logger.error("Endpoint validation failed: Endpoint is required");
      throw new Error("Endpoint is required");
    }

    const [first, second, third] = endpoint;

    // Validate the type of the first and third elements in the path.
    this.assertsType(first);
    this.assertsId(second);
    this.assertsType(third);

    /** Ensure that the first and third elements of the endpoint are not identical. */
    if (first && third && first === third) {
      // Log and throw an error if the types are the same.
      this.logger.error(
        `Invalid endpoint: ${first} and ${third} cannot be the same type`
      );
      throw new Error(
        `Invalid endpoint: ${endpoint[0]} and ${endpoint[2]} cannot be the same type`
      );
    }
  }

  /**
   * Validates that the given element is a valid endpoint type.
   * @param element - The endpoint type to be validated.
   * @throws Will throw an error if the element is not a valid endpoint type.
   */
  private assertsType(element?: EndpointType): asserts element is EndpointType {
    if (element && !EndpointBuilder.isEndpointType(element)) {
      // Log and throw an error if the type is invalid.
      this.logger.error(`Unknown endpoint type: ${element}`);
      throw new Error(`Unknown endpoint type: ${element}`);
    }
  }

  /**
   * Validates that the input is a valid endpoint type.
   * @param type - The endpoint type to be validated.
   * @returns True if the type is valid, false otherwise.
   */
  static isEndpointType(type: unknown): type is EndpointType {
    return (
      typeof type === "string" &&
      (type === "comics" ||
        type === "characters" ||
        type === "creators" ||
        type === "events" ||
        type === "series" ||
        type === "stories")
    );
  }

  /**
   * Validates that the given element is a valid numeric ID.
   * @param element - The ID to be validated.
   * @throws Will throw an error if the element is not a valid number.
   */
  private assertsId(element?: number): asserts element is number {
    if (element && typeof element !== "number") {
      // Log and throw an error if the ID is not a number.
      this.logger.error(`Invalid endpoint id: ${element}`);
      throw new Error(`Invalid endpoint id: ${element}`);
    }
  }

  /**
   * Validates that value is an endpoint.
   * @param value - The value to be validated.
   * @returns True if the value is an endpoint, false otherwise.
   */
  static isEndpoint(value: unknown): value is Endpoint {
    if (!Array.isArray(value)) return false;
    if (
      typeof value[0] !== "string" ||
      !EndpointBuilder.isEndpointType(value[0])
    )
      return false;
    if (
      value.length > 1 &&
      value[1] !== undefined &&
      typeof value[1] !== "number"
    )
      return false;
    if (
      value.length > 2 &&
      value[2] !== undefined &&
      !EndpointBuilder.isEndpointType(value[2])
    )
      return false;

    return true;
  }

  static asEndpoint<T extends (Endpoint | EndpointType)>(input: T): AsEndpoint<T> {
    let output;
    if (EndpointBuilder.isEndpointType(input)) {
      output = [input];
    }
    if (EndpointBuilder.isEndpoint(input)) {
      output =  input;
    }
  
    function assertAsEndpoint<T extends (Endpoint | EndpointType)>(endpoint: unknown): asserts endpoint is AsEndpoint<T> {
      if (!EndpointBuilder.isEndpoint(endpoint) && !EndpointBuilder.isEndpointType(endpoint)) {
        throw new Error(`Invalid endpoint: ${endpoint}`);
      }
    }
    
    assertAsEndpoint<T>(output);
  
    return output;
  }


}
