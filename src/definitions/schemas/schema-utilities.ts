import { z } from "zod";
import { EndpointType } from "../types/endpoint-types";

// Define the schema for an array of numbers
const MultipleIDSchema = z.array(z.number()).transform((arr) => arr.join(",")); // Convert the array to a comma-separated string

// Combine the single number schema and array schema
export const IDListSchema = z
  .union([z.number(), MultipleIDSchema])
  .transform((value) => {
    // If the value is an array, join it; otherwise, convert the single number to a string
    if (Array.isArray(value)) {
      return value.join(",");
    } else {
      return value.toString();
    }
  })
  .describe("Comma separated list of IDs or a single ID");

// Utility function to transform date strings or Date objects to ISO 8601 format
const transformToISO8601 = (value: unknown): string | undefined => {
  if (value instanceof Date) {
    // If it's already a Date object, convert to ISO string
    return value.toISOString();
  }
  if (typeof value === 'string') {
    // Regular expression to match the allowed date formats
    const iso8601Regex =
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2})?)?$/;

    // If the string matches one of the allowed formats
    if (iso8601Regex.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }
  return undefined;
};

// ModifiedSince schema
export const ModifiedSince = z
  .preprocess(transformToISO8601, z.string().refine((val) => val !== undefined, {
    message: 'Invalid date format.',
  })).describe("Date in ISO 8601 format, YYYY-MM-DD, or a Date object");

const DateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Define the schema to validate an array of exactly two dates
export const DateRangeSchema = z
  .array(z.string().regex(DateRegex, "Invalid date format"))
  .length(2) // Ensure exactly two dates
  // .transform((arr) => arr.join(",")) // Convert the array to a comma-separated string
  .describe(
    "An array of two dates (start and end) in ISO 8601 format (YYYY-MM-DD)"
  );

/** Create a date range to validate a year. Not likely you'll find any comics released in the future or before the year 1939 */
const currentYear = new Date().getFullYear(); // Get the current year (it's 2024 currently, but that may no longer be the case when you read this.)
const minYear = 1939; // The oldest comic in the database is ' Marvel Comics (1939) #1 ' which released in 1939 and featured the Sub-Mariner and the Human Torch (not to be confused with Johnny Storm, the Human Torch of the Fantastic Four).
const maxYear = currentYear + 5; // Comics in the future do appear in the database, but only a few months at most.

// Create a Zod schema for the year
export const YearSchema = z
  .number()
  .int() // Ensure the number is an integer
  .positive() // Ensure the number is positive
  .max(maxYear, { message: `Year must not be more than ${maxYear}` }) // Ensure the year is no more than 5 years from now...
  .min(minYear, { message: `Year must be at least ${minYear}` }) // ... and no earlier than 1939
  .describe(`Year must be between ${minYear} and ${maxYear}`);

/** Select one or multiple values from a list of valid values.
 * Values can be a single string or an array of strings.
 */
export const SelectMultiple = (validValues: readonly string[]) => {
  // Schema for a single string with valid values
  const SingleValueSchema = z
    .string()
    .refine((value) => validValues.includes(value), {
      message: "Invalid value provided",
    });

  // Schema for an array of strings with valid values
  const ArrayValueSchema = z
    .array(
      z.string().refine((value) => validValues.includes(value), {
        message: "Invalid value(s) provided",
      })
    )
    .transform((arr) => arr.join(",")); // Convert the array to a comma-separated string

  // Combine the single value schema and array schema
  return z
    .union([SingleValueSchema, ArrayValueSchema])
    .transform((value) => {
      // If the value is an array, join it; otherwise, use the single string directly
      if (Array.isArray(value)) {
        return value.join(",");
      } else {
        return value;
      }
    })
    .describe(
      `Comma-separated list of allowed values: ${validValues.join(", ")}`
    );
};

// Array of valid format values
export const Formats = [
  "comic",
  "magazine",
  "trade paperback",
  "hardcover",
  "digest",
  "graphic novel",
  "digital comic",
  "infinite comic",
  "Comic",
  "Magazine",
  "Trade Paperback",
  "Hardcover",
  "Digest",
  "Graphic Novel",
  "Digital Comic",
  "Infinite Comic",
  "Digital Vertical Comic",
  "",
] as const;

export const FormatSchema = z.enum(Formats); // Schema for a single format
export const FormatsSchema = SelectMultiple(Formats); // Schema for an array of formats

export const OrderByValues = {
  comics: ["focDate", "onsaleDate", "title", "issueNumber", "modified"],
  characters: ["name", "modified"],
  creators: ["lastName", "firstName", "middleName", "suffix", "modified"],
  events: ["name", "startDate", "modified"],
  series: ["title", "modified", "startYear"],
  stories: ["id", "modified"],
} as const;

export const OrderBy = (type: keyof typeof OrderByValues) => {
  const options = OrderByValues[type];
  // Flatten the valid values to include those with an optional '-' prefix
  const extendedValues = options.flatMap((value) => [value, `-${value}`]);

  // Schema for a single string with valid values and optional '-' prefix
  const SingleValueSchema = z
    .string()
    .refine((value) => extendedValues.includes(value), {
      message: "Invalid value provided",
    });

  // Schema for an array of strings with valid values and optional '-' prefix
  const ArrayValueSchema = z
    .array(
      z.string().refine((value) => extendedValues.includes(value), {
        message: "Invalid value(s) provided",
      })
    )
    .transform((arr) => arr.join(",")); // Convert the array to a comma-separated string

  // Combine the single value schema and array schema
  return z
    .union([SingleValueSchema, ArrayValueSchema])
    .describe(
      `Array of allowed values with optional '-' prefix: ${extendedValues.join(
        ", "
      )}`
    );
};
