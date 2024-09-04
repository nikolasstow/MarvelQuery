import {
  AnyParams,
  Endpoint,
  EndpointType,
  Config,
  Parameters,
  GlobalParams,
  EndpointDescriptor,
} from "src/models/types";
import { VALID_ENDPOINTS } from "src/models/endpoints";
import { ValidateParams } from "src/models/schemas/param-schemas";
import logger, { CustomLogger, Logger } from "./Logger";

export class ParameterManager {
  static config: Partial<Config>;
  static setConfig(config: Partial<Config>) {
    ParameterManager.config = config;

    if (config.globalParams) {
      logger.verbose("Validating global parameters");
      const globalParams = config.globalParams;
      const types = Object.keys(globalParams) as EndpointType[]; // Get the keys of the globalParams object

      for (const type of types) {
        if (!VALID_ENDPOINTS.has(type) && type !== ("all" as EndpointType)) {
          logger.warn(`Invalid endpoint type in global parameters: ${type}`);
          continue;
        }

        ParameterManager.validate(type as EndpointType, globalParams[type]); // Validate the parameters of the query for the endpoint type
      }
    }
  }

  constructor(customLogger: CustomLogger) {

  }

  static validate(type: EndpointType, params: AnyParams) {
    logger.verbose(`Validating parameters for '${type}'`);
    try {
      // Confirm there's a validation function for the endpoint type
      if (!ValidateParams[type]) {
        throw new Error(`Could not find validation schema for type '${type}'`);
      }
      // Validate the parameters for the endpoint type
      ValidateParams[type].parse(params);
    } catch (error) {
      logger.error(
        `Parameter validation error for type '${type}': ${error.message}`
      );
      throw new Error("Invalid parameters");
    }
  }

  query<E extends Endpoint>(
    endpoint: EndpointDescriptor<E>,
    params: Parameters<E>
  ) {
    // Remove undefined parameters unless 'omitUndefined' is false.
    const cleanParams = ParameterManager.config.omitUndefined
      ? this.omitUndefined(params)
      : params;

    const numberOfParamsRemoved =
      Object.keys(params).length - Object.keys(cleanParams).length;

    // Log amount of parameters removed
    if (numberOfParamsRemoved > 0) {
      logger.verbose(
        `Removed ${numberOfParamsRemoved} undefined parameters from query`
      );
    }

    ParameterManager.validate(endpoint.type, cleanParams);

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

  private omitUndefined<E extends Endpoint>(
    params: Parameters<E>
  ): Parameters<E> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as Parameters<E>;

    const omitions =
      Object.keys(params).length - Object.keys(filteredParams).length;
    logger.verbose(`Omitted ${omitions} undefined parameters.`);

    return filteredParams;
  }
}
