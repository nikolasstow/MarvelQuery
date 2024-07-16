import { z } from 'zod';
import { EndpointMap, EndpointType } from '../types/api-interface';

const IDList = /^(\d+,)*\d+$/;
const IDListSchema = z.string().regex(IDList);
const ModifiedSince = z.string().date();
const DateRange = /^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/;
const DateRangeSchema = z.string().regex(DateRange);

// Get the current year
const currentYear = new Date().getFullYear();

// Define the range for a valid year
const minYear = 1900; // Earliest valid year
const maxYear = currentYear + 5; // No more than 5 years from now

// Create a Zod schema for the year
const YearSchema = z
  .number()
  .int() // Ensure the number is an integer
  .positive() // Ensure the number is positive
  .max(maxYear, { message: `Year must not be more than ${maxYear}` }) // Ensure the year is not more than 5 years from now
  .min(minYear, { message: `Year must be at least ${minYear}` }); // Ensure the year is positive

const FormatSchema = z.enum([
  'comic',
  'magazine',
  'trade paperback',
  'hardcover',
  'digest',
  'graphic novel',
  'digital comic',
  'infinite comic',
]);
const FormatTypeSchema = z.enum(['comic', 'collection']);
export const DateDescriptorSchema = z.enum([
  'lastWeek',
  'thisWeek',
  'nextWeek',
  'thisMonth',
]);

export const APISchema = z.object({
  orderBy: z.enum([
		'name', 
		'modified', 
		'-name', 
		'-modified'])
		.optional(),
  modifiedSince: ModifiedSince.optional(),
  limit: z.number()
		.positive()
		.default(100)
		.optional(),
  offset: z.number()
	.nonnegative()
	.default(0)
	.optional(),
});

export const CharactersSchema = APISchema.extend({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  creators: IDListSchema.optional(),
});

export const ComicsSchema = APISchema.extend({
  format: FormatSchema.optional(),
  formatType: FormatTypeSchema.optional(),
  noVariants: z.boolean().optional(),
  dateDescriptor: DateDescriptorSchema.optional(),
  dateRange: DateRangeSchema.optional(),
  title: z.string().optional(),
  titleStartsWith: z.string().optional(),
  startYear: YearSchema.optional(),
  issueNumber: z.number().nonnegative().optional(),
  diamondCode: z.string().optional(),
  digitalId: z.number().optional(),
  upc: z.string().optional(),
  isbn: z.string().optional(),
  ean: z.string().optional(),
  issn: z.string().optional(),
  hasDigitalIssue: z.boolean().optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  sharedAppearances: IDListSchema.optional(),
  collaborators: IDListSchema.optional(),
  orderBy: z
    .enum([
      'focDate',
      'onsaleDate',
      'title',
      'issueNumber',
      'modified',
      '-focDate',
      '-onsaleDate',
      '-title',
      '-issueNumber',
      '-modified',
    ])
    .optional(),
});

export const CreatorsSchema = APISchema.extend({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  suffix: z.string().optional(),
  nameStartsWith: z.string().optional(),
  firstNameStartsWith: z.string().optional(),
  middleNameStartsWith: z.string().optional(),
  lastNameStartsWith: z.string().optional(),
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  orderBy: z
    .enum([
      'lastName',
      'firstName',
      'middleName',
      'suffix',
      'modified',
      '-lastName',
      '-firstName',
      '-middleName',
      '-suffix',
      '-modified',
    ])
    .optional(),
});

export const EventsSchema = APISchema.extend({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  series: IDListSchema.optional(),
  comics: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  orderBy: z
    .enum(['name', 'startDate', 'modified', '-name', '-startDate', '-modified'])
    .optional(),
});

export const SeriesSchema = APISchema.extend({
  title: z.string().optional(),
  titleStartsWith: z.string().optional(),
  startYear: YearSchema.optional(),
  comics: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  events: IDListSchema.optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  seriesType: z
    .enum(['collection', 'one shot', 'limited', 'ongoing'])
    .optional(),
  contains: FormatSchema.optional(),
  orderBy: z
    .enum([
      'title',
      'modified',
      'startYear',
      '-title',
      '-modified',
      '-startYear',
    ])
    .optional(),
});

export const StoriesSchema = APISchema.extend({
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  orderBy: z.enum(['id', 'modified', '-id', '-modified']).optional(),
});

const dataTypes = z.enum([
  'comics',
  'characters',
  'creators',
  'events',
  'stories',
  'series',
]);

export const EndpointSchema = z.tuple([
  dataTypes,
  z.number().optional(),
  dataTypes.optional(),
]);

export const ParameterSchema = z.union([
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
]);

export const ValidateParams: EndpointMap<z.ZodType> = {
  characters: CharactersSchema,
  comics: ComicsSchema,
  creators: CreatorsSchema,
  events: EventsSchema,
  series: SeriesSchema,
  stories: StoriesSchema,
};