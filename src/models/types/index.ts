import { ReturnType } from "./endpoint-types";

export type Comic = ReturnType<"comics">;
export type Character = ReturnType<"characters">;
export type Creator = ReturnType<"creators">;
export type Event = ReturnType<"events">;
export type Series = ReturnType<"series">;
export type Story = ReturnType<"stories">;

export * from "./data-types";
export * from "./param-types";
export * from "./endpoint-types";
export * from "./autoquery-types";
export * from "./interface";
export * from "./config-types";