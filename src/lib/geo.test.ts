import { describe, it, expect } from "vitest";
import { parseNominatim, validCoord } from "@/lib/geo";

describe("parseNominatim", () => {
  it("parses a valid Nominatim response", () => {
    expect(parseNominatim([{ lat: "35.6895", lon: "139.6917" }])).toEqual({
      lat: 35.6895,
      lng: 139.6917,
    });
  });

  it("returns null for an empty array", () => {
    expect(parseNominatim([])).toBeNull();
  });

  it("returns null for non-array input", () => {
    expect(parseNominatim({})).toBeNull();
    expect(parseNominatim(null)).toBeNull();
  });

  it("returns null when coordinates are not numeric", () => {
    expect(parseNominatim([{ lat: "abc", lon: "xyz" }])).toBeNull();
  });
});

describe("validCoord", () => {
  it("accepts in-range coordinates", () => {
    expect(validCoord(51.5, -0.12)).toEqual({ lat: 51.5, lng: -0.12 });
  });

  it("accepts numeric strings", () => {
    expect(validCoord("40.0", "-73.0")).toEqual({ lat: 40, lng: -73 });
  });

  it("rejects out-of-range latitude", () => {
    expect(validCoord(120, 10)).toBeNull();
  });

  it("rejects out-of-range longitude", () => {
    expect(validCoord(10, 200)).toBeNull();
  });

  it("rejects non-finite values", () => {
    expect(validCoord(NaN, 10)).toBeNull();
    expect(validCoord(undefined, null)).toBeNull();
  });
});
