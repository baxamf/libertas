import { z } from "zod";
import { Temporal } from "temporal-polyfill";

export const zInstant = z.custom<Temporal.Instant>(
  (val) => Object.prototype.toString.call(val) === "[object Temporal.Instant]",
  { message: "Expected a Temporal.Instant" },
);

export const stringToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

export const stringToInstant = z.codec(z.iso.datetime(), zInstant, {
  decode: (isoString) => Temporal.Instant.from(isoString),
  encode: (instant) => instant.toString(),
});

export const instantToString = z.invertCodec(stringToInstant);
