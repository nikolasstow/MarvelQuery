import { EndpointDescriptor, EndpointType } from "lib";
import { VALID_ENDPOINTS } from "src/models/endpoints";
import { DataType, Endpoint } from "src/models/types";
import logger, { CustomLogger, Logger } from "./Logger";

export class EndpointBuilder<E extends Endpoint> implements EndpointDescriptor<E> {
	path: E;
	type: DataType<E>
	constructor(endpoint: E, customLogger: CustomLogger) {
		// logger = customLogger;
		this.path = this.validatePath(endpoint);
		 /** Determine the data type of the query from the endpoint. */
		 this.type = (
			endpoint.length === 3 ? endpoint[2] : endpoint[0]
		) as DataType<E>;
	
		logger.verbose(`Data type: ${this.type}`);
	}

	private validatePath(endpoint: E): E {
		if (!endpoint) {
			logger.error("Endpoint validation failed: Endpoint is required");
			throw new Error("Endpoint is required");
		}

		const [first, second, third] = endpoint;

		this.validateType(first);
		this.validateId(second);
		this.validateType(third);

		/** Validate that the first and third elements of the endpoint are not the same. */
		if (first && third && first === third) {
			logger.error(
				`Invalid endpoint: ${first} and ${third} cannot be the same type`
			);
			throw new Error(
				`Invalid endpoint: ${endpoint[0]} and ${endpoint[2]} cannot be the same type`
			);
		}
	
		return endpoint;
	}

	private validateType(element?: EndpointType) {
		if (element && !VALID_ENDPOINTS.has(element)) {
			logger.error(`Unknown endpoint type: ${element}`);
			throw new Error(`Unknown endpoint type: ${element}`);
		}
	}

	private validateId(element?: number) {
		if (element && typeof element !== "number") {
			logger.error(`Invalid endpoint id: ${element}`);
			throw new Error(`Invalid endpoint id: ${element}`);
		}
	}
}