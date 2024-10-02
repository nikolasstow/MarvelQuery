import { z } from "zod";
import MarvelQuery, {
  EndpointType,
  ParameterMap,
} from "../src";
import { IDListSchema } from "../src/models/schemas/schema-utilities";

const query = MarvelQuery.init(
  {
    publicKey: "mockPublicKey",
    privateKey: "mockPrivateKey",
  },
  {
    isTestEnv: true,
		validation: {
			parameters: true,
		}
  }
);

const idList: [z.input<typeof IDListSchema>, any] = [
  [6922, 127, 1234, 7139],
  "6922,127,1234,7139",
];

type GoodBadParameters<M = ParameterMap> = {
  [P in keyof M]: {
    [K in keyof M[P]]: [M[P][K], any];
  };
};


const parameterMap: GoodBadParameters = {
	characters: {
		name: ["Spider", { name: "Spider" }],
		nameStartsWith: ["Spider", { nameStartsWith: "Spider" }],
		comics: idList,
		series: idList,
		events: idList,
		stories: idList,
		orderBy: ["name", "title"],
	},
  comics: {
    format: ["comic", 1285],
    formatType: ["comic", "correction"],
    dateDescriptor: ["lastWeek", "onTuesday"],
    dateRange: [["2021-01-01", "2021-12-31"], "Rhaegar"],
    title: ["People", { title: "People" }],
    titleStartsWith: ["People", { titleStartsWith: "People" }],
    startYear: [2021, "2021"],
    issueNumber: [1, "1"],
    diamondCode: ["123456", 123456],
    digitalId: [123456, "123456"],
    upc: ["123456", 123456],
    isbn: ["123456", 123456],
    ean: ["lousid ;ladio", () => {}],
    issn: ["123", 123],
    hasDigitalIssue: [true, "true"],
    creators: idList,
    characters: idList,
    series: idList,
    events: idList,
    stories: idList,
    sharedAppearances: idList,
    collaborators: idList,
    orderBy: ["title", "artist"],
  },
  creators: {
    firstName: ["Stan", jest.fn()],
    middleName: ["The Man", jest.fn()],
    lastName: ["Leiber", jest.fn()],
    suffix: ["jr", 2],
    nameStartsWith: ["Stan", { nameStartsWith: "Stan" }],
    firstNameStartsWith: ["Stan", { firstNameStartsWith: "Stan" }],
    middleNameStartsWith: ["beiber", { middleNameStartsWith: "beiber" }],
    comics: idList,
    series: idList,
    events: idList,
    stories: idList,
    orderBy: ["lastName", "Curt Conners"],
  },
  events: {
    name: ["Secret Wars", { name: "Secret Wars" }],
    nameStartsWith: ["Secret", { nameStartsWith: "halls" }],
    creators: idList,
    characters: idList,
    series: idList,
    comics: idList,
    stories: idList,
    orderBy: ["name", "title"],
  },
  series: {
    title: ["The Amazing Poop Eater", ["Sir Poopsalot"]],
    titleStartsWith: ["The Amazing", { titleStartsWith: "The Amazing" }],
    startYear: [2021, "2021"],
    comics: idList,
    stories: idList,
    events: idList,
    creators: idList,
    characters: idList,
    seriesType: ["collection", "comic"],
    contains: [
      ["Digest", "Graphic Novel"],
      ["Hardcorners", "Brambleberry"],
    ],
    orderBy: ["title", "artist"],
  },
  stories: {
    comics: idList,
    series: idList,
    events: idList,
    creators: idList,
    characters: idList,
    orderBy: ["id", "title"],
  },
};

describe("Testing Parameters, each with a valid and invalid input to expect pass and fail respectively", () => {
	for (const [endpoint, params] of Object.entries(parameterMap)) {
		describe(`Endpoint: ${endpoint}`, () => {
			for (const [param, [good, bad]] of Object.entries(params)) {
				test(`Parameter: ${param}`, () => {
					const valid = query(endpoint as EndpointType, { [param]: good });
					const invalid = query(endpoint as EndpointType, { [param]: bad });

					expect(valid.validated.parameters).toBe(true);
					expect(invalid.validated.parameters).toBe(false);
				});
			}
		});
	}
});
