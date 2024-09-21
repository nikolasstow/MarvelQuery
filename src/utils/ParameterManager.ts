import { Params } from "../models/types/param-types";
import { ValidateParams } from "../models/schemas/param-schemas";
import logger, { CustomLogger } from "./Logger";
import { EndpointBuilder } from "./EndpointBuilder";
import { Config } from "../models/types/config-types";
import {
  Endpoint,
  EndpointDescriptor,
  EndpointType,
} from "../models/types/endpoint-types";
import { AnyParams } from "../models/types/param-types";

/**
 * Class responsible for managing and validating query parameters, including global
 * configuration and specific parameters for different endpoints.
 */
export class ParameterManager {
  /** Configuration object for managing global and specific query settings */
  static config: Partial<Config<boolean>>;

  /**
   * Sets the global configuration for parameter management.
   * Validates global parameters if provided.
   * @param config - A partial configuration object.
   */
  static setConfig<A extends boolean>(config: Partial<Config<A>>) {
    ParameterManager.config = config;

    if (config.globalParams) {
      logger.verbose("Validating global parameters");
      const globalParams = config.globalParams;
      const types = Object.keys(globalParams); // Get the keys of the globalParams object

      for (const type of types) {
        if (
          !EndpointBuilder.isEndpointType(type) &&
          type !== ("all" as EndpointType)
        ) {
          logger.warn(`Invalid endpoint type in global parameters: ${type}`);
          continue;
        }

        // Validate the parameters of the query for the endpoint type
        ParameterManager.validate(type, globalParams[type]);
      }
    }
  }

  /** Custom logger instance for logging actions */
  logger: CustomLogger;

  /**
   * Constructor to initialize the ParameterManager with a custom logger.
   * @param customLogger - A logger instance for logging.
   */
  constructor(customLogger: CustomLogger) {
    this.logger = customLogger;
  }

  /**
   * Validates query parameters for a given endpoint type.
   * Uses a validation schema based on the endpoint type.
   * @param type - The endpoint type to validate parameters for.
   * @param params - The parameters to validate.
   * @param customLogger - Optional custom logger instance for logging. Defaults to the global logger.
   */
  static validate(
    type: EndpointType,
    params: AnyParams,
    customLogger = logger
  ) {
    if (
      ParameterManager.config?.validation?.disableAll === true || 
      ParameterManager.config?.validation?.parameters === false
    ) {
      console.log("Validation is disabled for params"); // remove this
      return;
    }

    customLogger.verbose(`Validating parameters for '${type}'`);
    try {
      // Confirm there's a validation function for the endpoint type
      if (!ValidateParams[type]) {
        throw new Error(`Could not find validation schema for type '${type}'`);
      }
      // Validate the parameters for the endpoint type
      ValidateParams[type].parse(params);
    } catch (error) {
      customLogger.error(
        `Parameter validation error for type '${type}': ${error.message}`
      );
      throw new Error("Invalid parameters");
    }
  }

  /**
   * Prepares the final query parameters by cleaning up undefined values and applying
   * global and default parameters.
   * @param endpoint - The descriptor of the endpoint for which the query is being prepared.
   * @param params - The specific parameters for the query.
   * @returns The final cleaned and validated parameters object.
   */
  query<E extends Endpoint>(
    endpoint: EndpointDescriptor<E>,
    params: Params<E>
  ) {
    // Remove undefined parameters unless 'omitUndefined' is false.
    const cleanParams = ParameterManager.config.omitUndefined
      ? this.omitUndefined(params)
      : params;

    const numberOfParamsRemoved =
      Object.keys(params).length - Object.keys(cleanParams).length;

    // Log how many parameters were removed
    if (numberOfParamsRemoved > 0) {
      this.logger.verbose(
        `Removed ${numberOfParamsRemoved} undefined parameters from query`
      );
    }

    // Validate the cleaned parameters
    ParameterManager.validate(endpoint.type, cleanParams, this.logger);

    // Construct the final parameters object by merging global, default, and specific parameters
    const finalParams = {
      // Default parameters
      offset: 0,
      limit: 50,
      // Global parameters
      ...ParameterManager.config.globalParams?.all,
      ...ParameterManager.config.globalParams?.[endpoint.type],
      // Specific parameters
      ...params,
    };

    return finalParams;
  }

  /**
   * Filters out undefined values from the query parameters object.
   * @param params - The parameters to be cleaned.
   * @returns A new object with undefined values removed.
   */
  private omitUndefined<E extends Endpoint>(
    params: Params<E>
  ): Params<E> {
    // Create a new object by filtering out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    // Log how many undefined parameters were omitted
    const omissions =
      Object.keys(params).length - Object.keys(filteredParams).length;
    this.logger.verbose(`Omitted ${omissions} undefined parameters.`);

    return filteredParams;
  }
}
