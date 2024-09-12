import {
  Endpoint,
  EndpointDescriptor,
  EndpointType,
  Extendpoint,
  EndpointFromType,
} from "src/models/types/endpoint-types";
import { DataType } from "src/models/types/data-types";
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
    EndpointBuilder.assertsEndpoint(endpoint);
    this.path = endpoint;

    /** Determine the data type of the query from the endpoint.
     * If the endpoint has three elements, use the third one; otherwise, use the first.
     */
    this.type = EndpointBuilder.typeFromEndpoint(endpoint);

    // Log the data type that was determined.
    this.logger.verbose(`Data type: ${this.type}`);
  }

  /**
   * Extracts the resource type from an endpoint.
   * @param endpoint - The endpoint to extract the type from.
   * @returns The extracted endpoint type.
   * @throws Will throw an error if the type is invalid.
   */
  static typeFromEndpoint<T extends Endpoint>(endpoint: T): DataType<T> {
    const type = endpoint[2] ? endpoint[2] : endpoint[0];
    EndpointBuilder.assertsType(type);

    return type as DataType<T>;
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

  /**
   * Validates the structure of the endpoint path and ensures that it follows
   * the correct format with valid types and IDs.
   * @param endpoint - The endpoint path to be validated.
   * @returns The validated endpoint path.
   * @throws Will throw an error if the endpoint is invalid or missing.
   */
  static assertsEndpoint(endpoint: unknown): asserts endpoint is Endpoint {
    if (!Array.isArray(endpoint)) {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    const [first, second, third] = endpoint;

    // Validate the type of the first and third elements in the path.
    EndpointBuilder.assertsType(first);
    EndpointBuilder.assertsId(Number(second));
    EndpointBuilder.assertsType(third);

    /** Ensure that the first and third elements of the endpoint are not identical. */
    if (first && third && first === third) {
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
  static assertsType(element: unknown): asserts element is EndpointType {
    if (element && !EndpointBuilder.isEndpointType(element)) {
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
  static assertsId(element: unknown): asserts element is number {
    if (element && typeof element !== "number") {
      throw new Error(`Invalid endpoint id: ${element}`);
    }
  }

  static asEndpoint<T extends Endpoint>(input: T): T;
  static asEndpoint<T extends EndpointType>(input: T): EndpointFromType<T>;
  static asEndpoint(input) {
    let output;
    if (EndpointBuilder.isEndpointType(input)) {
      output = [input];
    }
    if (EndpointBuilder.isEndpoint(input)) {
      output = input;
    }

    return output;
  }

  static extendEndpoint<TEndpoint extends Endpoint, TType extends EndpointType>(
    endpoint: TEndpoint,
    type: TType
  ): Extendpoint<TEndpoint, TType> {
    const extendedEndpoint = [endpoint[0], endpoint[1], type];
    EndpointBuilder.assertsEndpoint(extendedEndpoint);

    return extendedEndpoint as Extendpoint<TEndpoint, TType>;
  }
}
