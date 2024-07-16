import { z } from 'zod';
import { EndpointType } from './api-interface';
import {
  APISchema,
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  DateDescriptorSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
} from '../schemas/param-schemas';

export type APIBase = z.infer<typeof APISchema>;
export type Characters = z.infer<typeof CharactersSchema>;
export type Comics = z.infer<typeof ComicsSchema>;
export type Creators = z.infer<typeof CreatorsSchema>;
export type Events = z.infer<typeof EventsSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type Stories = z.infer<typeof StoriesSchema>;

export type DateDescriptor = z.infer<typeof DateDescriptorSchema>;