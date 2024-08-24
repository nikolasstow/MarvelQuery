import {
  Endpoint,
  EndpointType,
  KeyEndpointMap,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelSeries,
  MarvelStory,

} from "./types";

/** Endpoint types that can be queried */
export const VALID_ENDPOINTS: Set<EndpointType> = new Set([
	"comics",
	"characters",
	"creators",
	"events",
	"series",
	"stories",
]);

// Utility function to help TypeScript infer exact types
function createEndpointMap<T extends Record<string, EndpointType>>(map: T): T {
	return map;
}

// Define your object with the exact types inferred
const comics = createEndpointMap({
	series: "series",
	variants: "comics",
	collections: "comics",
	collectedIssues: "comics",
	creators: "creators",
	characters: "characters",
	stories: "stories",
	events: "events",
});

const events = createEndpointMap({
	comics: "comics",
	stories: "stories",
	series: "series",
	characters: "characters",
	creators: "creators",
	next: "events",
	previous: "events",
});

const series = createEndpointMap({
	comics: "comics",
	stories: "stories",
	events: "events",
	characters: "characters",
	creators: "creators",
	next: "series",
	previous: "series",
});

const creators = createEndpointMap({
	series: "series",
	stories: "stories",
	comics: "comics",
	events: "events",
});

const characters = createEndpointMap({
	comics: "comics",
	stories: "stories",
	events: "events",
	series: "series",
});

const stories = createEndpointMap({
	comics: "comics",
	series: "series",
	events: "events",
	characters: "characters",
	creators: "creators",
	originalissue: "comics",
});

export const ENDPOINT_MAP = {
	comics,
	events,
	series,
	creators,
	characters,
	stories,
}