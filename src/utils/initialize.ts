import { Endpoint, EndpointType, Parameters, Config, EndpointDescriptor, DataType } from "../models/types";
import { omitUndefined } from "./functions";
import { validateEndpoint, validateParams } from "./validate";
import logger from "../utils/Logger";

/** Validate the endpoint and set the data type of the query. */
export function initializeEndpoint<E extends Endpoint>(endpoint: E): EndpointDescriptor<E> {
  

  /** Validate the endpoint. */
  const path: E = validateEndpoint(endpoint);

  /** Determine the data type of the query from the endpoint. */
  const type: DataType<E> = (
    endpoint.length === 3 ? endpoint[2] : endpoint[0]
  ) as DataType<E>;

  logger.verbose(`Initializing endpoint: ${endpoint.join("/")} with data type: ${type}`);
  return { path, type };
}

/** Clean, validate, and set the parameters. */
export function initializeParams<E extends Endpoint>(
  params: Parameters<E>,
  config: Config,
  endpoint: EndpointDescriptor<E>,
): Parameters<E> {

  /** Remove undefined parameters unless 'omitUndefined' is false. */
  const cleanParams = config.omitUndefined
    ? omitUndefined(params)
    : params;

  const numberOfParamsRemoved = Object.keys(params).length - Object.keys(cleanParams).length;

    // Log amount of parameters removed
  if (numberOfParamsRemoved > 0) {
    logger.verbose(`Removed ${numberOfParamsRemoved} undefined parameters from query`);
  }

  /** Validate the parameters. */
  validateParams(endpoint.type, cleanParams);

  const finalParams = {
    // Default parameters
    offset: 0,
    limit: 50,
    // Global parameters
    ...config.globalParams?.all,
    ...config.globalParams?.[endpoint.type],
    // Specific parameters
    ...params,
  };

  return finalParams;
}