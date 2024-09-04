import { Endpoint, EndpointDescriptor, Result } from "src/models/types";
import { CustomLogger } from "./Logger";
import { ResultSchemaMap } from "src/models/schemas/data-schemas";
import { ZodError } from "zod";

export class ResultValidator<E extends Endpoint> {
	logger: CustomLogger;
  constructor(
    results: Result<E>[],
    endpoint: EndpointDescriptor<E>,
    logger: CustomLogger
  ) {
		this.logger = logger;
    logger.verbose("Validating query results");

    try {
      const resultSchema = ResultSchemaMap[endpoint.type];

      if (!resultSchema) {
        throw new Error(
          `Could not find validation schema for endpoint type: ${endpoint.type}`
        );
      }

      const errorMap = new Map<string, number[]>();
      let allValid = true;

      // Array to collect log messages for failed result items
      const failedItemsLogs: string[] = [];

      results.forEach((item, index) => {
        const result = resultSchema.safeParse(item);

        if (!result.success) {
          allValid = false;
          const currentError = JSON.stringify(result.error.format());

          if (errorMap.has(currentError)) {
            errorMap.get(currentError)!.push(index);
          } else {
            errorMap.set(currentError, [index]);
          }

          // Collect the failed result item log message
          const formattedItem = JSON.stringify(item, null, 2); // Pretty-print JSON with 2-space indentation
          const separatorLine = `\n----- Failed Result at Index ${index} -----\n`;
          failedItemsLogs.push(`${separatorLine}${formattedItem}`);
        }
      });

      // Log the validation summary before logging the individual failed items
      this.logValidationErrors(errorMap, results.length);

      // Now log each failed result item to the file
      failedItemsLogs.forEach((logMessage) => {
        logger.fileOnly(logMessage);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error("Validation Error:", error.errors);
      } else {
        logger.error("Unexpected Error:", error);
      }
    }
  }

	private logValidationErrors(errorMap: Map<string, number[]>, totalResults: number) {
		if (errorMap.size === 0) {
			this.logger.verbose("All results validated successfully");
			return;
		}
	
		let allFailed = true;
	
		errorMap.forEach((indices, error) => {
			if (indices.length !== totalResults) {
				allFailed = false;
			}
	
			const groupedIndices = this.groupConsecutiveIndices(indices);
	
			if (groupedIndices.length > 1) {
				this.logger.verbose(
					`Validation failed for results at indices ${groupedIndices.join(', ')}:`,
					JSON.parse(error)
				);
			} else {
				this.logger.verbose(
					`Validation failed for result at index ${groupedIndices[0]}:`,
					JSON.parse(error)
				);
			}
		});
	
		if (allFailed) {
			this.logger.warn("All results failed validation.");
		} else if (!this.logger.verboseStatus) {
			this.logger.warn(
				`Some results failed validation. See log for details: ${this.logger.logFilePath}`
			);
		}
	}

	private groupConsecutiveIndices(indices: number[]): string[] {
		if (indices.length === 0) return [];
	
		const groups: string[] = [];
		
		// TypeScript now knows indices has at least one element, so indices[0] is not undefined
		let start: number = indices[0]!;
		let end: number = indices[0]!;
	
		for (let i = 1; i < indices.length; i++) {
			if (indices[i] === end + 1) {
				end = indices[i]!;
			} else {
				if (start === end) {
					groups.push(`${start}`);
				} else {
					groups.push(`${start}-${end}`);
				}
				start = indices[i]!;
				end = indices[i]!;
			}
		}
	
		if (start === end) {
			groups.push(`${start}`);
		} else {
			groups.push(`${start}-${end}`);
		}
	
		return groups;
	}
	
}
