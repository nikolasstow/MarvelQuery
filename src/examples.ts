import MarvelQuery, {
  DateDescriptor,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelSeries,
} from ".";

// Setup dotenv
import * as dotenv from 'dotenv';
dotenv.config();

// First initialize the API with you public and private keys
const createQuery = MarvelQuery.init({
  publicKey: process.env.MARVEL_PUBLIC_KEY || '',
  privateKey: process.env.MARVEL_PRIVATE_KEY || '',
  /** An optional function that will be called before the request is sent,
   * you can use it to log the request or do something else */
  onRequest: (url) => {
    checkAndUpdateCounters();
  },
  // And you can pass in a map of functions (all of them are optional)
  // saveFunctions where added so that you can save every result to your database if you want to
  // That way you don't have to implement it yourself
  /** With onResult you can optionally pass in a map of functions,
   * a separate function for each data type that will be called when the request is complete */
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
});

async function spiderMan() {
  const spiderMan = await createQuery(["characters"], {
    name: "Peter Parker",
  }).fetch();
  // Need more results? Just call fetch again
  spiderMan.fetch();
  // The library automatically handles pagination for you, updating the offset parameter to get the next batch
  // You can continue to do this until there are no more results.
}

// Here are some basic examples of how you can use the API

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

export async function comics(
  title: string,
  releaseDate?: Date | string
): Promise<MarvelComic[]> {
  // Create Date Range
  const createRange = (date: Date) => {
    const formattedDate = date.toISOString().slice(0, 10);
    return `${formattedDate},${formattedDate}`;
  };

  // Helper function to parse the releaseDate
  const parseReleaseDate = (date: Date | string): Date => {
    return typeof date === "string" ? new Date(date) : date;
  };

  // Conditionally create params
  const params: { title: string; dateRange?: string } = { title };

  if (releaseDate) {
    const parsedDate = parseReleaseDate(releaseDate);
    const dateRange = createRange(parsedDate);
    params.dateRange = dateRange;
  }

  return await createQuery(["comics"], params)
    .fetch()
    .then((api) => api.results);
}
export async function events(name: string): Promise<MarvelEvent[]> {
  return createQuery(["events"], {
    name,
  })
    .fetch()
    .then((api) => api.results);
}

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

export async function characters(name: string): Promise<MarvelCharacter[]> {
  return createQuery(["characters"], {
    name,
  })
    .fetch()
    .then((api) => api.results);
}

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

export async function latest(): Promise<MarvelComic[] | false> {
  console.log("Fetching latest comics");

  const formattedDate = (date: Date) => date.toISOString().slice(0, 10);

  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setMonth(currentDate.getMonth());
  const futureDate = new Date();
  futureDate.setMonth(currentDate.getMonth() + 5);

  return createQuery(["comics"], {
    dateRange: `${formattedDate(pastDate)},${formattedDate(futureDate)}`,
    orderBy: "-modified",
    format: "comic",
    formatType: "comic",
  })
    .fetch()
    .then((api) => api.results);
}

function checkAndUpdateCounters() {
  // Do something here
}