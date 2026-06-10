import { describe, expect, test } from "bun:test";
import { runSingleFlight } from "../utils/singleflight";

describe("runSingleFlight", () => {
  test("shares one in-flight operation for matching keys", async () => {
    const inFlight = new Map<string, Promise<string>>();
    let calls = 0;

    const first = runSingleFlight(inFlight, "same-key", async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "rendered";
    });
    const second = runSingleFlight(inFlight, "same-key", async () => {
      calls += 1;
      return "duplicate";
    });

    await expect(Promise.all([first, second])).resolves.toEqual(["rendered", "rendered"]);
    expect(calls).toBe(1);
    expect(inFlight.size).toBe(0);
  });

  test("clears failed operations so a later call can retry", async () => {
    const inFlight = new Map<string, Promise<string>>();
    let calls = 0;

    await expect(
      runSingleFlight(inFlight, "retry-key", async () => {
        calls += 1;
        throw new Error("temporary failure");
      })
    ).rejects.toThrow("temporary failure");

    await expect(
      runSingleFlight(inFlight, "retry-key", async () => {
        calls += 1;
        return "recovered";
      })
    ).resolves.toBe("recovered");

    expect(calls).toBe(2);
    expect(inFlight.size).toBe(0);
  });
});
