// Sample onResult functions for each endpoint
const onResult = {
	comics: (items) => console.log(items.map((comic) => comic.title)),
	characters: (items) =>
		console.log(items.map((character) => character.name)),
	creators: (items) => console.log(items.map((creator) => creator.fullName)),
	events: (items) => console.log(items.map((event) => event.title)),
	series: (items) => console.log(items.map((series) => series.title)),
	stories: (items) => console.log(items.map((story) => story.title)),
}

export {
	onResult,
}