import { Endpoint, EndpointDescriptor, Result } from "src/models/types";

export class ResultValidator<E extends Endpoint> {
	constructor(
		results: Result<E>[], 
		endpoint: EndpointDescriptor<E>
	) {
		
	}
}