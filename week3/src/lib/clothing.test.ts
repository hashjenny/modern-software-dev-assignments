/**
 * Clothing advice tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getClothingAdvice } from "./clothing.js";

describe("getClothingAdvice", () => {
  describe("Temperature boundaries", () => {
    it("extreme heat 50°C", () => {
      const result = getClothingAdvice(50);
      expect(result.diff).toBe(24);
      expect(result.suggestion).toContain("短袖");
    });

    it("extreme cold -20°C", () => {
      const result = getClothingAdvice(-20);
      expect(result.diff).toBe(-46);
      expect(result.suggestion).toContain("羽绒服");
    });

    it("comfortable 26°C", () => {
      const result = getClothingAdvice(26);
      expect(result.diff).toBe(0);
      expect(result.suggestion).toContain("体感舒适");
    });

    it("slightly hot 28°C (diff = 2)", () => {
      const result = getClothingAdvice(28);
      expect(result.diff).toBe(2);
      expect(result.suggestion).toContain("天气偏暖");
    });

    it("slightly cool 24°C (diff = -2)", () => {
      const result = getClothingAdvice(24);
      expect(result.diff).toBe(-2);
      expect(result.suggestion).toContain("体感舒适");
    });

    it("hot 31°C (diff = 5)", () => {
      const result = getClothingAdvice(31);
      expect(result.diff).toBe(5);
      expect(result.suggestion).toContain("天气较热");
    });

    it("cool 21°C (diff = -5)", () => {
      const result = getClothingAdvice(21);
      expect(result.diff).toBe(-5);
      expect(result.suggestion).toContain("稍微偏凉");
    });

    it("chilly 18°C (diff = -8)", () => {
      const result = getClothingAdvice(18);
      expect(result.diff).toBe(-8);
      expect(result.suggestion).toContain("天气较凉");
    });

    it("boundary 27°C (diff = 1)", () => {
      const result = getClothingAdvice(27);
      expect(result.diff).toBe(1);
      expect(result.suggestion).toContain("体感舒适");
    });

    it("boundary 23°C (diff = -3)", () => {
      const result = getClothingAdvice(23);
      expect(result.diff).toBe(-3);
      expect(result.suggestion).toContain("稍微偏凉");
    });

    it("boundary 29°C (diff = 3)", () => {
      const result = getClothingAdvice(29);
      expect(result.diff).toBe(3);
      expect(result.suggestion).toContain("天气偏暖");
    });

    it("boundary 19°C (diff = -7)", () => {
      const result = getClothingAdvice(19);
      expect(result.diff).toBe(-7);
      expect(result.suggestion).toContain("天气较凉");
    });

    it("zero degrees 0°C", () => {
      const result = getClothingAdvice(0);
      expect(result.diff).toBe(-26);
      expect(result.suggestion).toContain("羽绒服");
    });

    it("negative -10°C", () => {
      const result = getClothingAdvice(-10);
      expect(result.diff).toBe(-36);
      expect(result.suggestion).toContain("羽绒服");
    });

    it("float 25.5°C", () => {
      const result = getClothingAdvice(25.5);
      expect(result.diff).toBe(-0.5);
      expect(result.suggestion).toContain("体感舒适");
    });
  });

  describe("Return structure", () => {
    it("should have suggestion and diff properties", () => {
      const result = getClothingAdvice(25);
      expect(result).toHaveProperty("suggestion");
      expect(result).toHaveProperty("diff");
      expect(typeof result.suggestion).toBe("string");
      expect(typeof result.diff).toBe("number");
    });
  });
});
