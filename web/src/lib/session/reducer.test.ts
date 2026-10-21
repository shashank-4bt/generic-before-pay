import { describe, expect, it } from "vitest";
import { initialSession, sessionReducer } from "@/lib/session/reducer";

describe("sessionReducer", () => {
  it("starts empty and holds no fields beyond the started flag", () => {
    expect(initialSession).toEqual({ started: false });
    expect(Object.keys(initialSession)).toEqual(["started"]);
  });

  it("start marks the session active and reset clears it", () => {
    const started = sessionReducer(initialSession, { type: "start" });
    expect(started).toEqual({ started: true });
    expect(sessionReducer(started, { type: "reset" })).toEqual(initialSession);
  });
});
