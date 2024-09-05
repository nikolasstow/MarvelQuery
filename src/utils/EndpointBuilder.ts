import { EndpointDescriptor, EndpointType } from "lib";
import { VALID_ENDPOINTS } from "src/models/endpoints";
import { DataType, Endpoint } from "src/models/types";
import { CustomLogger } from "./Logger";

/**
 * Class to build and validate an API endpoint. 
 * It checks the structure and types of the endpoint path to ensure validity.
 * @template E - The specific endpoint type being validated.
 */
export class EndpointBuilder<E extends Endpoint> implements EndpointDescriptor<E> {
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
  constructor(endpoint: E, customLogger: CustomLogger) {
    // Initialize the logger for the class.
		this.logger = customLogger;
		// Validate the endpoint path and determine the data type.
    this.path = this.validatePath(endpoint);

    /** Determine the data type of the query from the endpoint. 
     * If the endpoint has three elements, use the third one; otherwise, use the first.
     */
    this.type = (endpoint.length === 3 ? endpoint[2] : endpoint[0]) as DataType<E>;

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
  private validatePath(endpoint: E): E {
    if (!endpoint) {
      // Log and throw an error if the endpoint is missing.
      this.logger.error("Endpoint validation failed: Endpoint is required");
      throw new Error("Endpoint is required");
    }

    const [first, second, third] = endpoint;

    // Validate the type of the first and third elements in the path.
    this.validateType(first);
    this.validateId(second);
    this.validateType(third);

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

    // Return the validated endpoint path.
    return endpoint;
  }

  /**
   * Validates that the given element is a valid endpoint type.
   * @param element - The endpoint type to be validated.
   * @throws Will throw an error if the element is not a valid endpoint type.
   */
  private validateType(element?: EndpointType) {
    if (element && !VALID_ENDPOINTS.has(element)) {
      // Log and throw an error if the type is invalid.
      this.logger.error(`Unknown endpoint type: ${element}`);
      throw new Error(`Unknown endpoint type: ${element}`);
    }
  }

  /**
   * Validates that the given element is a valid numeric ID.
   * @param element - The ID to be validated.
   * @throws Will throw an error if the element is not a valid number.
   */
  private validateId(element?: number) {
    if (element && typeof element !== "number") {
      // Log and throw an error if the ID is not a number.
      this.logger.error(`Invalid endpoint id: ${element}`);
      throw new Error(`Invalid endpoint id: ${element}`);
    }
  }
}