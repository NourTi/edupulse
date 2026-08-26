import { describe, expect, it } from "vitest";
import { assertSafePublicUrl, chunkText, containsProtectedRecordIntent, conversationReply, detectConversationIntent, detectPlatformIntent, extractTextFromHtml, platformReply, retrieveRelevantChunks, toSourceReferences } from "./policy";

describe("knowledge policy", () => {
  it("detects individual-record questions before retrieval", () => {
    expect(containsProtectedRecordIntent("Can I see my child's attendance?")).toBe(true);
    expect(containsProtectedRecordIntent("ما هي رسوم ابني؟")).toBe(true);
    expect(containsProtectedRecordIntent("What are the school opening hours?")).toBe(false);
  });

  it("recognizes conversational closings and does not classify them as policy questions", () => {
    expect(detectConversationIntent("thank you")).toBe("thanks");
    expect(detectConversationIntent("thank you very much")).toBe("thanks");
    expect(detectConversationIntent("than you very much")).toBe("thanks");
    expect(detectConversationIntent("thankyou")).toBe("thanks");
    expect(detectConversationIntent("شكرا جزيلا")).toBe("thanks");
    expect(detectConversationIntent("مرحبا")).toBe("greeting");
    expect(detectConversationIntent("bye")).toBe("farewell");
    expect(detectConversationIntent("What are the opening hours?")).toBeNull();
    expect(conversationReply("thanks", false)).toContain("welcome");
    expect(conversationReply("thanks", true)).toContain("الرحب");
  });

  it("recognizes platform and creator questions as approved profile intents", () => {
    expect(detectPlatformIntent("What is EduPulse?")).toBe("about");
    expect(detectPlatformIntent("من مؤسس EduPulse؟")).toBe("creator");
    expect(platformReply("creator", false, "Alex")).toContain("Alex");
    expect(platformReply("about", true, "Alex")).toContain("منصة");
  });

  it("keeps source chunks and ranks relevant text", () => {
    const chunks = chunkText("The English B2 course runs on Saturday. Families receive a progress report at the end of each term.");
    expect(chunks).toHaveLength(1);
    const result = retrieveRelevantChunks("When is English B2?", [{ id: "c1", sourceId: "s1", title: "Programme", sourceUrl: null, content: chunks[0] }]);
    expect(result[0]?.sourceId).toBe("s1");
    expect(toSourceReferences([{ id: "c1", sourceId: "s1", title: "Programme", sourceUrl: "https://school.example/programmes", content: chunks[0] }, { id: "c2", sourceId: "s1", title: "Programme", sourceUrl: "https://school.example/programmes", content: chunks[0] }])).toEqual([{ id: "s1", title: "Programme", url: "https://school.example/programmes" }]);
  });

  it("removes web page chrome and rejects private targets", () => {
    expect(extractTextFromHtml("<style>x</style><h1>School handbook</h1><script>alert(1)</script>")).toBe("School handbook");
    expect(() => assertSafePublicUrl("http://127.0.0.1/private")).toThrow();
  });
});
