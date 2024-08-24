import { Endpoint, EndpointType, Parameters, Config, EndpointDescriptor, DataType,  } from "../models/types";
import { validateEndpoint, validateParams } from "./validate";

/** Validate the endpoint and set the data type of the query. */
export function initializeEndpoint<E extends Endpoint>(endpoint: E): EndpointDescriptor<E> {
  /** Validate the endpoint. */
  const path: E = validateEndpoint(endpoint);
  /** Determine the data type of the query from the endpoint. */
  const type: DataType<E> = (
    endpoint.length === 3 ? endpoint[2] : endpoint[0]
  ) as DataType<E>;

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

  /** Validate the parameters. */
  validateParams(endpoint.type, cleanParams);

  return {
    // Default parameters
    offset: 0,
    limit: 50,
    // Global parameters
    ...config.globalParams?.all,
    ...config.globalParams?.[endpoint.type],
    // Specific parameters
    ...params,
  };
}

/** Remove undefined parameters. */
function omitUndefined<E extends Endpoint>(params: Parameters<E>): Parameters<E> {
	return Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== undefined)
	) as Parameters<E>;
}