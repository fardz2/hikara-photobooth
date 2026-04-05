import { describe, it, expect } from "vitest";
import { isValidWhatsApp, normalizePhoneNumber } from "@/lib/utils/validation";

describe("isValidWhatsApp", () => {
  it("returns true for valid Indonesian numbers starting with 62", () => {
    expect(isValidWhatsApp("628123456789")).toBe(true);
    expect(isValidWhatsApp("62812345678")).toBe(true);
  });

  it("returns false for numbers not starting with 62", () => {
    expect(isValidWhatsApp("08123456789")).toBe(false);
    expect(isValidWhatsApp("8123456789")).toBe(false);
  });

  it("returns false for numbers with 0 after 62", () => {
    expect(isValidWhatsApp("620812345678")).toBe(false);
  });

  it("returns false for numbers that are too short", () => {
    expect(isValidWhatsApp("62812")).toBe(false);
  });

  it("returns false for strings containing non-digit characters", () => {
    expect(isValidWhatsApp("62812-3456-789")).toBe(false);
    expect(isValidWhatsApp("62812abc")).toBe(false);
  });
});

describe("normalizePhoneNumber", () => {
  it("normalizes numbers starting with 08", () => {
    expect(normalizePhoneNumber("08123456789")).toBe("628123456789");
  });

  it("normalizes numbers starting with 8", () => {
    expect(normalizePhoneNumber("8123456789")).toBe("628123456789");
  });

  it("normalizes numbers starting with 6208", () => {
    expect(normalizePhoneNumber("6208123456789")).toBe("628123456789");
  });

  it("keeps correct 628 numbers as is", () => {
    expect(normalizePhoneNumber("628123456789")).toBe("628123456789");
  });

  it("removes non-digit characters during normalization", () => {
    expect(normalizePhoneNumber("+62 812-3456-7890")).toBe("6281234567890");
    expect(normalizePhoneNumber("0812 3456 7890")).toBe("6281234567890");
  });
});
