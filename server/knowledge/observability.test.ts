import { afterEach, describe, expect, it, vi } from "vitest";
import { recordAgentEvent } from "./observability";

describe("agent observability", () => {
  afterEach(() => vi.restoreAllMocks());

  it("records bounded operational metadata without a raw question", () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    recordAgentEvent({ intent: "platform", outcome: "answered", sourceCount: 1, durationMs: 12.7 });
    expect(log).toHaveBeenCalledWith("[Agent]", JSON.stringify({ intent: "platform", outcome: "answered", sourceCount: 1, durationMs: 13 }));
    expect(String(log.mock.calls[0])).not.toContain("What is EduPulse?");
  });
});
