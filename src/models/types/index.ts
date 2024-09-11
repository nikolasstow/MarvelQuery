import { ReturnType } from "./endpoint";

export type Comic = ReturnType<"comics">;
export type Character = ReturnType<"characters">;
export type Creator = ReturnType<"creators">;
export type Event = ReturnType<"events">;
export type Series = ReturnType<"series">;
export type Story = ReturnType<"stories">;

export * from "./data-types";
export * from "./param-types";
export * from "./utility-types";
export * from "./endpoint";
export * from "./extended-types";
export * from "./interface";
export * from "./config";