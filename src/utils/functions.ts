import * as CryptoJS from "crypto-js";
import { APIKeys, Endpoint, EndpointDescriptor, EndpointType, Parameters } from "../models/types";
import logger from "../utils/Logger";

export function createEndpointFromURI(url: string): Endpoint {
  logger.verbose(`Creating endpoint from URI: ${url}`);
  
  // Remove everything from 'http' to '/public/'
  const cleanedUrl = url.replace(/^.*\/public\//, "");
  logger.verbose(`Cleaned URL: ${cleanedUrl}`);

  // Split the remaining part of the URL by '/'
  const [baseType, id, type] = cleanedUrl.split("/");

  const endpoint = [
    baseType,
    id ? Number(id) : undefined,
    type ? type : undefined,
  ] as Endpoint;

  logger.verbose("Created endpoint:", endpoint);
  return endpoint;
}

export function extractIdFromURI(url: string): number {
  logger.verbose(`Extracting ID from URI: ${url}`);
  
  // Remove everything from 'http' to '/public/'
  const cleanedUrl = url.replace(/^.*\/public\//, "");
  logger.verbose(`Cleaned URL: ${cleanedUrl}`);

  // Split the remaining part of the URL by '/'
  const [type, id] = cleanedUrl.split("/");

  const numericId = Number(id);
  logger.verbose(`Extracted ID: ${numericId}`);
  return numericId;
}

export function hasResourceURI<T>(obj: T): obj is T & { resourceURI: string } {
  const hasURI = obj && (obj as any).resourceURI && typeof (obj as any).resourceURI === "string";
  logger.verbose(`Checking for resourceURI: ${hasURI}`, obj);
  return hasURI;
}

export function hasCollectionURI<T>(obj: T): obj is T & { collectionURI: string } {
  const hasURI = obj && (obj as any).collectionURI && typeof (obj as any).collectionURI === "string";
  logger.verbose(`Checking for collectionURI: ${hasURI}`, obj);
  return hasURI;
}

export function typeFromEndpoint(endpoint: Endpoint): EndpointType {
  logger.verbose(`Extracting type from endpoint: ${endpoint}`);
  const type = endpoint[2] ? endpoint[2] : endpoint[0];
  logger.verbose(`Extracted type: ${type}`);
  return type;
}

/** Build the URL of the query with the parameters, timestamp and hash. */
export function buildURL<E extends Endpoint>(apiKeys: APIKeys, endpoint: EndpointDescriptor<E>, params: Parameters<E>): string {
  logger.verbose(`Building URL for endpoint: /${endpoint.path.join("/")} with parameters:`, params);

  const baseURL = "https://gateway.marvel.com/v1/public";
  const endpointPath = endpoint.path.join("/");
  const timestamp = Number(new Date());
  
  /** Extract the public and private keys from the library initialization. */
  const { privateKey, publicKey } = apiKeys;
  
  /** Create an MD5 hash with the timestamp, private key and public key. */
  const hash = privateKey
    ? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
    : "";

  logger.verbose(`Generated hash: ${hash}`);

  /** Build the URL of the query with the parameters, keys, timestamp and hash. */
  const queryParams = new URLSearchParams({
    apikey: publicKey,
    ts: timestamp.toString(),
    hash,
    ...(params as Record<string, unknown>),
  });

  const finalURL = `${baseURL}/${endpointPath}?${queryParams.toString()}`;
  logger.verbose(`Built URL: ${finalURL}`);
  
  return finalURL;
}
/** Remove undefined parameters. */
export function omitUndefined<E extends Endpoint>(params: Parameters<E>): Parameters<E> {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Parameters<E>;

	const omitions = Object.keys(params).length - Object.keys(filteredParams).length;
	logger.verbose(`Omitted ${omitions} undefined parameters.`);

	return filteredParams;
}

export function logPerformance(target: any, key: string, descriptor: TypedPropertyDescriptor<any>): void {
  if (descriptor === undefined || typeof descriptor.value !== 'function') {
    throw new Error(`logPerformance can only be used on methods, not on: ${key}`);
  }

  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const timer = logger.performance(`Executing ${key}`);
    try {
      const result = await originalMethod.apply(this, args);
      timer.stop(`Finished executing ${key}`);
      return result;
    } catch (error) {
      timer.stop(`Error in ${key}`);
      throw error;
    }
  };
}	