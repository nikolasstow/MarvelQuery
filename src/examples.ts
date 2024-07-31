import MarvelQuery, {
  DateDescriptor,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelSeries,
} from ".";

/**
 * Initialize the Marvel API with your public and private keys.
 * Optionally, you can add functions for logging requests and saving results.
 */
const createQuery = MarvelQuery.init(
  {
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  },
  {
    /**
     * An optional function that will be called before the request is sent,
     * you can use it to log the request or do something else.
     */
    onRequest: (url) => {
      checkAndUpdateCounters();
    },
    /**
     * You can pass in a map of functions (all of them are optional) for saving results to your database.
     * This way, you don't have to implement it yourself.
     */
    onResult: {
      comics: (items) => {
        items.map((comic) => {
          // Type safety means you know what properties are available during development
          console.log("Saving comic:", comic.title);

          return {
            issn: comic.issn,
            isbn: comic.isbn,
            upc: comic.upc,
            ean: comic.ean,
          };
        });
      },
      characters: (items) => {
        items.forEach((character) =>
          console.log("Saving character:", character.name)
        );
      },
      // ...and so on
    },
    // fetchFunction: (url) => fetch(url),
  }
);
/**
 * Fetches information about Spider-Man.
 * Calls the API to get data about the character "Peter Parker" and handles pagination automatically.
 */
async function spiderMan() {
  const spiderMan = await createQuery(["characters"], {
    name: "Peter Parker",
  }).fetch();
  // Need more results? Just call fetch again
  spiderMan.fetch();
  // The library automatically handles pagination for you, updating the offset parameter to get the next batch
  // You can continue to do this until there are no more results.
}

// First we need to find his id using his name.
const peterParker = await createQuery(["characters"], {
  name: "Peter Parker",
})
  .fetchSingle()
  .then((query) => query.result?.id); // Returns '1009491'
// The we can use that id to create a new query to get the latest comics he appears in.
const spiderComics = await createQuery(["characters", peterParker, "comics"], {
  format: "comic", // We only want the latest comic issues, so lets exclude everything else.
  noVariants: true, // Exclude variants, because we only want unique issues.
  dateDescriptor: "nextWeek", // Get the next week's issues.
}).fetch().then;

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
): Promise<MarvelSeries[]> {
  return await createQuery(["series"], {
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
): Promise<MarvelComic[]> {
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

  return await createQuery(["comics"], params)
    .fetch()
    .then((api) => api.results);
}

/**
 * Fetches events based on the name.
 *
 * @param name - The name of the event.
 * @returns A promise that resolves to an array of MarvelEvent objects.
 */
export async function events(name: string): Promise<MarvelEvent[]> {
  return createQuery(["events"], {
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
): Promise<MarvelCreator[]> {
  return await createQuery(["creators"], {
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
export async function characters(name: string): Promise<MarvelCharacter[]> {
  return createQuery(["characters"], {
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
): Promise<MarvelComic[]> {
  const catalog = await createQuery(["comics"], {
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
export async function latest(): Promise<MarvelComic[]> {
  console.log("Fetching latest comics");

  const formattedDate = (date: Date) => date.toISOString().slice(0, 10);

  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setMonth(currentDate.getMonth());
  const futureDate = new Date();
  futureDate.setMonth(currentDate.getMonth() + 5);

  return createQuery(["comics"], {
    dateRange: [formattedDate(pastDate), formattedDate(futureDate)],
    orderBy: "-modified",
    format: "comic",
    formatType: "comic",
  })
    .fetch()
    .then((api) => api.results);
}

/**
 * Function to check and update counters before making a request.
 * Customize this function as needed.
 */
function checkAndUpdateCounters() {
  // Do something here
}
