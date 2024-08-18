import {
  Endpoint,
  KeyEndpointMap,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelSeries,
  MarvelStory,
	ExtendedResultEndpointMap,
} from "./types";

const comics: KeyEndpointMap<MarvelComic> = {
	series: "series",
	variants: "comics",
	collections: "comics",
	collectedIssues: "comics",
	creators: "creators",
	characters: "characters",
	stories: "stories",
	events: "events",
}

const events: KeyEndpointMap<MarvelEvent> = {
	comics: "comics",
	stories: "stories",
	series: "series",
	characters: "characters",
	creators: "creators",
	next: "events",
	previous: "events",
}

const series: KeyEndpointMap<MarvelSeries> = {
	comics: "comics",
	stories: "stories",
	events: "events",
	characters: "characters",
	creators: "creators",
	next: "series",
	previous: "series",
}

const creators: KeyEndpointMap<MarvelCreator> = {
	series: "series",
	stories: "stories",
	comics: "comics",
	events: "events",
}

const characters: KeyEndpointMap<MarvelCharacter> = {
	comics: "comics",
	stories: "stories",
	events: "events",
	series: "series",
}

const stories: KeyEndpointMap<MarvelStory> = {
	comics: "comics",
	series: "series",
	events: "events",
	characters: "characters",
	creators: "creators",
	originalissue: "comics",
}

export const endpointMap: ExtendedResultEndpointMap = {
	comics,
	events,
	series,
	creators,
	characters,
	stories,
}