import type { Response } from "supertest";
import { expect } from "vitest";
import { SESSION_COOKIE_NAME } from "../../util/sessionName";

export const checkSessionLoginExists = (response: Response) => {
  expect(response.header["set-cookie"]).toBeDefined();
  const cookies = response.headers["set-cookie"];

  if (!Array.isArray(cookies)) {
    expect.fail("Set-Cookie header was not returned as an array or missing");
  }

  const sessionExists: boolean = cookies.some((cookie) =>
    cookie.startsWith("user-session"),
  );
  expect(sessionExists).toBe(true);
};

export const checkSessionIsDeleted = async (response: Response) => {
  const cookies = response.header["set-cookie"];

  if (!Array.isArray(cookies)) {
    expect.fail("Set-Cookie header was not returned as an array or missing");
  }

  const userSessionCookie = cookies.find((cookie) =>
    cookie.startsWith(SESSION_COOKIE_NAME),
  );
  expect(userSessionCookie.startsWith(`${SESSION_COOKIE_NAME}=;`)).toBe(true);
};
