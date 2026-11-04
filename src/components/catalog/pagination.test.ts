import { describe, expect, it } from "vitest";
import { pageWindow } from "./pagination";

describe("pageWindow", () => {
  it("con pocas páginas muestra todas", () => {
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
  });
  it("marca los saltos y mantiene primera, última y vecinas", () => {
    expect(pageWindow(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(pageWindow(1, 10)).toEqual([1, 2, "gap", 10]);
    expect(pageWindow(10, 10)).toEqual([1, "gap", 9, 10]);
  });
});
