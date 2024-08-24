import * as CryptoJS from "crypto-js";
import { APIKeys, Endpoint, EndpointDescriptor, EndpointType, Parameters } from "../models/types";

export function createEndpointFromURI(url: string): Endpoint {
  // Remove everything from 'http' to '/public/'
  const cleanedUrl = url.replace(/^.*\/public\//, "");

  // Split the remaining part of the URL by '/'
  const [baseType, id, type] = cleanedUrl.split("/");

  return [
    baseType,
    id ? Number(id) : undefined,
    type ? type : undefined,
  ] as Endpoint;
}

export function extractIdFromURI(url: string): number {
  // Remove everything from 'http' to '/public/'
  const cleanedUrl = url.replace(/^.*\/public\//, "");

  // Split the remaining part of the URL by '/'
  const [type, id] = cleanedUrl.split("/");
  return Number(id);
}

export function hasResourceURI<T>(obj: T): obj is T & { resourceURI: string } {
  return (
    obj &&
    (obj as any).resourceURI &&
    typeof (obj as any).resourceURI === "string"
  );
}

export function hasCollectionURI<T>(
  obj: T
): obj is T & { collectionURI: string } {
  return (
    obj &&
    (obj as any).collectionURI &&
    typeof (obj as any).collectionURI === "string"
  );
}

export function typeFromEndpoint(endpoint: Endpoint): EndpointType {
  return endpoint[2] ? endpoint[2] : endpoint[0];
}

/** Build the URL of the query with the parameters, timestamp and hash. */
export function buildURL<E extends Endpoint>(apiKeys: APIKeys, endpoint: EndpointDescriptor<E>, params: Parameters<E>): string {
	const baseURL = "https://gateway.marvel.com/v1/public";
	const endpointPath = endpoint.path.join("/");
	const timestamp = Number(new Date());
	/** Extract the public and private keys from the library initialization. */
	const { privateKey, publicKey } = apiKeys;
	/** Create an MD5 hash with the timestamp, private key and public key. */
	const hash = privateKey
		? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
		: "";

	/** Build the URL of the query with the parameters, keys, timestamp and hash. */
	const queryParams = new URLSearchParams({
		apikey: publicKey,
		ts: timestamp.toString(),
		hash,
		...(params as Record<string, unknown>),
	});

	return `${baseURL}/${endpointPath}?${queryParams.toString()}`;
}
