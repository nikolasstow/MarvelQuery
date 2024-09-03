import * as CryptoJS from "crypto-js";
import { APIKeys, Endpoint, EndpointDescriptor, EndpointType, Parameters } from "../models/types";
import logger from "../utils/Logger";
import { VALID_ENDPOINTS } from "src/models/endpoints";

export function createEndpointFromURI(url: string): Endpoint {
  // Remove everything from 'http' to '/public/'
  const cleanedUrl = url.replace(/^.*\/public\//, "");

  // Split the remaining part of the URL by '/'
  const parts = cleanedUrl.split("/");

  if (parts.length < 1) {
    logger.error(`Invalid URL: ${url}`);
    throw new Error(`Invalid URL: ${url}`);
  }

  const baseType = parts[0] as EndpointType;
  if (!VALID_ENDPOINTS.has(baseType)) {
    throw new Error(`Invalid endpoint: ${baseType}`);
  }

  const id = parts[1];
  if (!id) {
    throw new Error(`Missing ID in URL: ${url}`);
  }

  const type = parts[2];

  const endpoint = [
    baseType,
    Number(id),
    type ? type : undefined,
  ] as Endpoint;

  return endpoint;
}

export function extractIdFromURI(url: string): number {
  const cleanedUrl = url.replace(/^.*\/public\//, "");

  const parts = cleanedUrl.split("/");

  if (parts.length < 2) {
    logger.error(`Invalid URL: ${url}`);
    throw new Error(`Invalid URL: ${url}`);
  }

  const id = parts[1];

  if (id && !/^\d+$/.test(id)) {
    logger.error(`Invalid ID: ${id}`);
    throw new Error(`Invalid ID: ${id}`);
  }

  return Number(id);
}

export function hasResourceURI<T>(obj: T): obj is T & { resourceURI: string } {
  return obj && (obj as any).resourceURI && typeof (obj as any).resourceURI === "string";
}

export function hasCollectionURI<T>(obj: T): obj is T & { collectionURI: string } {
  return obj && (obj as any).collectionURI && typeof (obj as any).collectionURI === "string";
}

export function typeFromEndpoint(endpoint: Endpoint): EndpointType {
  const type = endpoint[2] ? endpoint[2] : endpoint[0];

  if (!VALID_ENDPOINTS.has(type)) {
    throw new Error(`Unable to determine type from endpoint: ${endpoint.join("/")}`);
  }

  return type;
}

/** Build the URL of the query with the parameters, timestamp and hash. */
export function buildURL<E extends Endpoint>(apiKeys: APIKeys, endpoint: EndpointDescriptor<E>, params: Parameters<E>): string {
  logger.verbose(`Building URL for ${printEndpoint(endpoint.path)} with parameters:`, params);

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

export function printEndpoint(endpoint: Endpoint): string {
  return `/${endpoint.join("/")}/`;
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}