import MarvelQuery, {
  Comic,
  Character,
  Creator,
  Event,
  Series,
  DateDescriptor,
} from ".";

/**
 * Initialize the Marvel API with your public and private keys.
 * Optionally, you can add functions for logging requests and saving results.
 */
const query = MarvelQuery.init(
  {
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  },
  {
    autoQuery: true,
  }
);

async function regularExamples() {
  // Find comics that feature Spider-Man and Dock Ock
  const spidey = await query("characters", {
    name: "Peter Parker",
  })
    .fetchSingle()
    .then((character) => character.id);

  const ock = await query("characters", {
    name: "Doctor Octopus",
  })
    .fetchSingle()
    .then((character) => character.id);

  const comics = await query("comics", {
    characters: [spidey, ock],
  }).fetch();
}

async function autoQueryExamples() {
  // Let's find the most recent comics that feature Sorceror Supreme Doctor Doom.
  const doom = await query("characters", {
    name: "Victor Von Doom",
  }).fetchSingle();
  // Once retrieved, we can create a new query from the collection in the 'comics' property.
  const doomComics = await doom.comics
    .query({
      orderBy: "focDate",
    })
    .fetch();

  // We can streamline this process by chaining queries together using .then()
  // In this example we can fetch the most recent comic featuring Morlun
  query("characters", {
    name: "Morlun",
  })
    .fetchSingle()
    .then(({ comics }) => comics.query({ orderBy: "onsaleDate" }).fetchSingle())
    .then((mostRecentComic) => {
      // Do something with the most recent comic
      console.log(mostRecentComic);
    });

  // Let's find new series being released this month

  // First, we query the comics released this month.
  // Step 1: Query all comics with issue number 1 released this month.
  const comics = await query("comics", {
    dateDescriptor: "thisMonth",
    issueNumber: 1,
  }).fetch();

  // Step 2: Fetch series details for each comic, one at a time to avoid API rate limiting.
  const seriesDetails: Series[] = [];
  for (const comic of comics.results) {
    const seriesDetail = await comic.series.fetchSingle(); // Sequentially fetch each series
    seriesDetails.push(seriesDetail);
  }

  // find similar comics
  // find
  // step 1: find comic (stan #30, jrs #13272)
}

/**
 * Fetches series information based on the title and start year.
 *
 * @param title - The title of the series.
 * @param startYear - The start year of the series.
 * @returns A promise that resolves to an array of MarvelSeries objects.
 */
export async function series(
  title: string,
  startYear: number
): Promise<Series[]> {
  return await query("series", {
    title,
    startYear,
  })
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches comics based on the title and optional release date.
 *
 * @param title - The title of the comic.
 * @param releaseDate - The release date of the comic (optional).
 * @returns A promise that resolves to an array of MarvelComic objects.
 */
export async function comics(
  title: string,
  releaseDate?: Date | string
): Promise<Comic[]> {
  // Create Date Range
  const createRange = (date: Date) => {
    const formattedDate = date.toISOString().slice(0, 10);
    return [formattedDate, formattedDate];
  };

  // Helper function to parse the releaseDate
  const parseReleaseDate = (date: Date | string): Date => {
    return typeof date === "string" ? new Date(date) : date;
  };

  // Conditionally create params
  const params: { title: string; dateRange?: string[] } = { title };

  if (releaseDate) {
    const parsedDate = parseReleaseDate(releaseDate);
    params.dateRange = createRange(parsedDate);
  }

  return await query("comics", params)
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches events based on the name.
 *
 * @param name - The name of the event.
 * @returns A promise that resolves to an array of MarvelEvent objects.
 */
export async function events(name: string): Promise<Event[]> {
  return query("events", {
    name,
  })
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches creators based on last name and optional first name, middle name, and suffix.
 *
 * @param lastName - The last name of the creator.
 * @param firstName - The first name of the creator (optional).
 * @param middleName - The middle name of the creator (optional).
 * @param suffix - The suffix of the creator (optional).
 * @returns A promise that resolves to an array of MarvelCreator objects.
 */
export async function creators(
  lastName: string,
  firstName?: string,
  middleName?: string,
  suffix?: string
): Promise<Creator[]> {
  return await query("creators", {
    lastName,
    firstName,
    middleName,
    suffix,
  })
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches characters based on the name.
 *
 * @param name - The name of the character.
 * @returns A promise that resolves to an array of MarvelCharacter objects.
 */
export async function characters(name: string): Promise<Character[]> {
  return query("characters", {
    name,
  })
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches comics based on a date descriptor and optional additional parameters.
 *
 * @param dateDescriptor - The date descriptor (e.g., "lastWeek", "thisWeek", "nextWeek", "thisMonth").
 * @param params - Additional query parameters (optional).
 * @returns A promise that resolves to an array of MarvelComic objects.
 */
export async function catalog(
  dateDescriptor: DateDescriptor, // options: "lastWeek" | "thisWeek" | "nextWeek" | "thisMonth"
  params?: Record<string, unknown>
): Promise<Comic[]> {
  const catalog = await query("comics", {
    ...params,
    format: "comic",
    formatType: "comic",
    dateDescriptor,
  }).fetch();

  return catalog.results;
}

/**
 * Fetches the latest comics.
 *
 * @returns A promise that resolves to an array of MarvelComic objects or false if there are no results.
 */
export async function latest(): Promise<Comic[]> {
  console.log("Fetching latest comics");

  const formattedDate = (date: Date) => date.toISOString().slice(0, 10);

  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setMonth(currentDate.getMonth());
  const futureDate = new Date();
  futureDate.setMonth(currentDate.getMonth() + 5);

  return query("comics", {
    dateRange: [formattedDate(pastDate), formattedDate(futureDate)],
    orderBy: "-modified",
    format: "comic",
    formatType: "comic",
  })
    .fetch()
    .then((api) => api.results);
}

export async function comicsWithCharacter(name: string): Promise<Comic[]> {
  return query("characters", { name })
    .fetchSingle()
    .then((character) => character.comics.query({ format: "comic" }).fetch())
    .then((comics) => comics.results);
}

/**
 * Function to check and update counters before making a request.
 * Customize this function as needed.
 */
function checkAndUpdateCounters() {
  // Do something here
}
