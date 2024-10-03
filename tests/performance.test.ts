import { performance } from "perf_hooks";
import MarvelQuery, { Comic } from "../src";
import { InitQuery } from "../src/models/types/autoquery-types";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const defaultConfig = {
  isTestEnv: true,
  globalParams: {
    all: {
      limit: 100,
    },
  },
};

const iterations = 100;

const baseQuery = MarvelQuery.init(mockKeys, defaultConfig);

const Q: Parameters<typeof baseQuery> = [
  ["characters", 101, "comics"],
  {
    orderBy: "title",
    titleStartsWith: "Spider",
    characters: [1009610, 122],
    events: 1111,
    issueNumber: 1,
  },
];

async function fetchAllResources(results: Comic[]) {
  for (const comic of results) {
    await comic.series.fetchSingle();
    for (const character of comic.characters.items) {
      await character.fetchSingle();
    }
    for (const creator of comic.creators.items) {
      await creator.fetchSingle();
    }
    for (const event of comic.events.items) {
      await event.fetchSingle();
    }
    for (const story of comic.stories.items) {
      await story.fetchSingle();
    }
  }
}

describe("Performance Testing", () => {
  const testCases = [
    {
      name: "AutoQuery and all validation disabled",
      config: {
        autoQuery: false,
        validation: {
          disableAll: true,
        },
      },
      expectedTime: 8,
    },
    {
      name: "AutoQuery and all validation enabled",
      config: {
        autoQuery: true,
        validation: {
          parameters: true,
          apiResponse: true,
          autoQuery: true,
        },
      },
      expectedTime: 30,
    },
    {
      name: "AutoQuery with no validation",
      config: {
        autoQuery: true,
        validation: {
          disableAll: true,
        },
      },
      expectedTime: 9,
    },
    {
      name: "Only validate parameters",
      config: {
        autoQuery: true,
        validation: {
          parameters: true,
        },
      },
      expectedTime: 28,
    },
    {
      name: "Only validate API response",
      config: {
        autoQuery: true,
        validation: {
          apiResponse: true,
        },
      },
      expectedTime: 27,
    },
    {
      name: "Only validate AutoQuery",
      config: {
        autoQuery: true,
        validation: {
          autoQuery: true,
        },
      },
      expectedTime: 31,
    },
  ];

  testCases.forEach(({ name, config, expectedTime }) => {
    test(name, async () => {
      const query = MarvelQuery.init(mockKeys, { ...defaultConfig, ...config });

      let totalTime = 0;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();

        await query(...Q).fetch();

        const end = performance.now();
        totalTime += end - start;
      }

      const averageTime = totalTime / iterations;
      expect(averageTime).toBeLessThan(expectedTime);
    });
  });

  test("AutoQuery without validation, fetching all resources", async () => {
    const query = MarvelQuery.init(mockKeys, {
      ...defaultConfig,
      autoQuery: true,
      validation: {
        disableAll: true,
      },
    });

    const start = performance.now();
    const results = (await query(...Q).fetch()).results as Comic[];
    await fetchAllResources(results);
    const end = performance.now();

    const totalTime = end - start;
    expect(totalTime).toBeLessThan(2000);
  });
});
