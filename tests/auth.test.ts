import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  validateEmail,
  sanitizeInput,
} from "../lib/auth";

describe("Authentication & Security Controls", () => {
  it("should securely hash passwords and verify correctly", async () => {
    const raw = "LexoraSecurePass2026!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(raw, hashed);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("WrongPassword123!", hashed);
    expect(isWrong).toBe(false);
  });

  it("should sign and verify JWT session tokens", () => {
    const payload = {
      userId: "usr_test_12345",
      email: "counsel@test.com",
      name: "Counsel Test",
    };

    const token = signSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
  });

  it("should reject tampered or invalid session tokens", () => {
    const fakeToken = "eyFakeToken.InvalidPayload.Signature";
    const result = verifySessionToken(fakeToken);
    expect(result).toBeNull();
  });

  it("should accurately validate emails", () => {
    expect(validateEmail("lawyer@company.com")).toBe(true);
    expect(validateEmail("user.name+tag@sub.domain.org")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("@missinguser.com")).toBe(false);
    expect(validateEmail("missingdomain@")).toBe(false);
  });

  it("should sanitize dangerous input to prevent script injection", () => {
    const dangerous = "<script>alert('hack')</script>Normal legal text";
    const cleaned = sanitizeInput(dangerous);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("</script>");
    expect(cleaned).toContain("Normal legal text");
  });
});
