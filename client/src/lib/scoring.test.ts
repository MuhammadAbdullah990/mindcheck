import { describe, it, expect } from "vitest";
import {
  scorePHQ9,
  scoreGAD7,
  scorePSS10,
  scoreDASS21,
  calculateScore,
  type ResponseItem,
} from "./scoring";

/** Build a ResponseItem[] from a flat array of answer values (1-based question numbers). */
function items(values: number[]): ResponseItem[] {
  return values.map((v, i) => ({ questionNum: i + 1, answerValue: v }));
}

function subscale(result: ReturnType<typeof scoreDASS21>, name: string) {
  const s = result.subscaleScores?.find((x) => x.name === name);
  if (!s) throw new Error(`missing subscale ${name}`);
  return s;
}

describe("PHQ-9", () => {
  it("scores all zeros as minimal", () => {
    const r = scorePHQ9(items([0, 0, 0, 0, 0, 0, 0, 0, 0]));
    expect(r.totalScore).toBe(0);
    expect(r.severityLevel).toBe("minimal");
    expect(r.criticalFlag).toBe(false);
  });

  it("scores all ones as 9 / mild", () => {
    const r = scorePHQ9(items([1, 1, 1, 1, 1, 1, 1, 1, 1]));
    expect(r.totalScore).toBe(9);
    expect(r.severityLevel).toBe("mild");
  });

  it("scores a mixed set as 12 / moderate", () => {
    const r = scorePHQ9(items([2, 2, 1, 2, 1, 2, 1, 1, 0]));
    expect(r.totalScore).toBe(12);
    expect(r.severityLevel).toBe("moderate");
  });

  it("scores a high set as 20 / severe", () => {
    const r = scorePHQ9(items([3, 2, 3, 2, 3, 2, 2, 2, 1]));
    expect(r.totalScore).toBe(20);
    expect(r.severityLevel).toBe("severe");
  });

  it("flags a critical result when Q9 is 1 even with a minimal total", () => {
    const r = scorePHQ9(items([0, 0, 0, 0, 0, 0, 0, 0, 1]));
    expect(r.totalScore).toBe(1);
    expect(r.severityLevel).toBe("minimal");
    expect(r.criticalFlag).toBe(true);
    expect(r.flaggedItems).toEqual([9]);
    expect(r.recommendations[0].type).toBe("crisis");
  });

  it("does not flag when Q9 is 0", () => {
    const r = scorePHQ9(items([2, 2, 2, 2, 2, 2, 2, 2, 0]));
    expect(r.criticalFlag).toBe(false);
  });
});

describe("GAD-7", () => {
  it("scores all zeros as minimal", () => {
    const r = scoreGAD7(items([0, 0, 0, 0, 0, 0, 0]));
    expect(r.totalScore).toBe(0);
    expect(r.severityLevel).toBe("minimal");
  });

  it("scores all ones as 7 / mild", () => {
    const r = scoreGAD7(items([1, 1, 1, 1, 1, 1, 1]));
    expect(r.totalScore).toBe(7);
    expect(r.severityLevel).toBe("mild");
  });

  it("scores a mixed set as 11 / moderate", () => {
    const r = scoreGAD7(items([2, 2, 2, 2, 1, 1, 1]));
    expect(r.totalScore).toBe(11);
    expect(r.severityLevel).toBe("moderate");
  });

  it("scores all threes as 21 / severe", () => {
    const r = scoreGAD7(items([3, 3, 3, 3, 3, 3, 3]));
    expect(r.totalScore).toBe(21);
    expect(r.severityLevel).toBe("severe");
  });
});

describe("PSS-10", () => {
  it("reverse-scores items 4, 5, 7 and 8", () => {
    // all 0s -> reverse items become 4 -> 4*4 = 16
    const r = scorePSS10(items([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    expect(r.totalScore).toBe(16);
    expect(r.severityLevel).toBe("moderate stress");
  });

  it("reverse-scores all fours down to 24", () => {
    const r = scorePSS10(items([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]));
    // non-reverse items stay 4 (6 items = 24), reverse items become 0
    expect(r.totalScore).toBe(24);
    expect(r.severityLevel).toBe("moderate stress");
  });

  it("scores the documented max-40 vector as high", () => {
    // [4,4,4,0,0,4,0,0,4,4] reverses to all 4s
    const r = scorePSS10(items([4, 4, 4, 0, 0, 4, 0, 0, 4, 4]));
    expect(r.totalScore).toBe(40);
    expect(r.severityLevel).toBe("high perceived stress");
  });

  it("scores the documented min-0 vector as low", () => {
    // [0,0,0,4,4,0,4,4,0,0] reverses to all 0s
    const r = scorePSS10(items([0, 0, 0, 4, 4, 0, 4, 4, 0, 0]));
    expect(r.totalScore).toBe(0);
    expect(r.severityLevel).toBe("low stress");
  });

  it("never raises a crisis flag", () => {
    const r = scorePSS10(items([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]));
    expect(r.criticalFlag).toBe(false);
  });
});

describe("DASS-21", () => {
  // Full 21-item answer sets where only one subscale is elevated.
  const DEPRESSION_ITEMS = [3, 5, 10, 13, 16, 17, 21];
  const ANXIETY_ITEMS = [2, 4, 7, 9, 15, 19, 20];
  const STRESS_ITEMS = [1, 6, 8, 11, 12, 14, 18];

  function setFor(value: number, elevated: number[]): ResponseItem[] {
    return Array.from({ length: 21 }, (_, i) => ({
      questionNum: i + 1,
      answerValue: elevated.includes(i + 1) ? value : 0,
    }));
  }

  it("scores depression all-2s as 28 / extremely severe", () => {
    const r = scoreDASS21(setFor(2, DEPRESSION_ITEMS));
    const d = subscale(r, "depression");
    expect(d.rawScore).toBe(14);
    expect(d.scaledScore).toBe(28);
    expect(d.severityLevel).toBe("extremely severe");
  });

  it("scores anxiety all-1s as 14 / moderate", () => {
    const r = scoreDASS21(setFor(1, ANXIETY_ITEMS));
    const a = subscale(r, "anxiety");
    expect(a.scaledScore).toBe(14);
    expect(a.severityLevel).toBe("moderate");
  });

  it("scores stress all-1s as 14 / normal", () => {
    const r = scoreDASS21(setFor(1, STRESS_ITEMS));
    const s = subscale(r, "stress");
    expect(s.scaledScore).toBe(14);
    expect(s.severityLevel).toBe("normal");
  });

  it("scores stress all-2s as 28 / severe", () => {
    const r = scoreDASS21(setFor(2, STRESS_ITEMS));
    const s = subscale(r, "stress");
    expect(s.scaledScore).toBe(28);
    expect(s.severityLevel).toBe("severe");
  });

  it("takes the worst subscale as the overall severity", () => {
    const r = scoreDASS21(setFor(2, DEPRESSION_ITEMS));
    expect(r.severityLevel).toBe("extremely severe");
    expect(subscale(r, "anxiety").severityLevel).toBe("normal");
  });

  it("flags critical items 10, 17 and 21 at value 2 or above", () => {
    const r = scoreDASS21(setFor(2, DEPRESSION_ITEMS));
    expect(r.criticalFlag).toBe(true);
    expect(r.flaggedItems).toEqual([10, 17, 21]);
    expect(r.recommendations[0].type).toBe("crisis");
  });

  it("does not flag critical items at value 1", () => {
    const r = scoreDASS21(setFor(1, DEPRESSION_ITEMS));
    expect(r.criticalFlag).toBe(false);
    expect(r.flaggedItems).toEqual([]);
  });

  it("multiplies the total by 2 and reports max 126", () => {
    const r = scoreDASS21(setFor(1, [1]));
    expect(r.totalScore).toBe(2);
    expect(r.maxPossible).toBe(126);
  });
});

describe("calculateScore", () => {
  it("dispatches to the right instrument", () => {
    expect(calculateScore("phq9", items([0, 0, 0, 0, 0, 0, 0, 0, 0])).maxPossible).toBe(27);
    expect(calculateScore("gad7", items([0, 0, 0, 0, 0, 0, 0])).maxPossible).toBe(21);
    expect(calculateScore("pss10", items([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).maxPossible).toBe(40);
    expect(calculateScore("dass21", items(new Array(21).fill(0))).maxPossible).toBe(126);
  });

  it("throws on an unknown assessment", () => {
    expect(() => calculateScore("nope", items([0]))).toThrow(/Unknown assessment/);
  });
});
