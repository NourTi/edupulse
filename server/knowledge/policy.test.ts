import { describe, expect, it } from "vitest";
import { assertSafePublicUrl, chunkText, containsProtectedRecordIntent, conversationReply, detectConversationIntent, detectEnrollmentIntent, detectPlatformIntent, enrollmentReply, extractTextFromHtml, isLikelyTruncatedAnswer, platformReply, retrieveRelevantChunks, toSourceReferences, validateGroundedAnswer } from "./policy";

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
    expect(detectConversationIntent("than lyou very much")).toBe("thanks");
    expect(detectConversationIntent("thankyou")).toBe("thanks");
    expect(detectConversationIntent("شكرا جزيلا")).toBe("thanks");
    expect(detectConversationIntent("مرحبا")).toBe("greeting");
    expect(detectConversationIntent("bye")).toBe("farewell");
    expect(detectConversationIntent("What are the opening hours?")).toBeNull();
    expect(conversationReply("thanks", false)).toContain("welcome");
    expect(conversationReply("thanks", true)).toContain("الرحب");
  });

  it("rejects uncited and out-of-range model answers", () => {
    expect(validateGroundedAnswer("An answer without evidence", 2)).toBe(false);
    expect(validateGroundedAnswer("A grounded answer [S1]", 2)).toBe(true);
    expect(validateGroundedAnswer("A bad citation [S3]", 2)).toBe(false);
  });

  it("does not retrieve a chunk from generic question words alone", () => {
    expect(retrieveRelevantChunks("what is this", [{ id: "1", sourceId: "s1", title: "Sexual harassment policy in America", sourceUrl: null, content: "This is a policy." }])).toEqual([]);
  });

  it("routes public enrolment requests to useful guidance without exposing student data", () => {
    expect(detectEnrollmentIntent("I want to sign my son")).toBe("enrollment");
    expect(detectEnrollmentIntent("أريد تسجيل ابني")).toBe("enrollment");
    expect(enrollmentReply(false)).toContain("enrolment");
    expect(enrollmentReply(true)).toContain("تسجيل");
  });

  it("recognizes platform and creator questions as approved profile intents", () => {
    expect(detectPlatformIntent("What is EduPulse?")).toBe("about");
    expect(detectPlatformIntent("Tell me about the platform and its benefits")).toBe("about");
    expect(detectPlatformIntent("كيف تعمل المنصة؟")).toBe("about");
    expect(detectPlatformIntent("من مؤسس EduPulse؟")).toBe("creator");
    expect(detectPlatformIntent("Who built EduPulse?")).toBe("creator");
    expect(platformReply("creator", false, "Alex")).toContain("Alex");
    expect(platformReply("creator", false, "Alex")).toContain("English teacher");
    expect(platformReply("about", true, "Alex")).toContain("منصة");
  });

  it("rejects incomplete model output before it is shown to visitors", () => {
    expect(isLikelyTruncatedAnswer("EduPulse helps schools and", "length")).toBe(true);
    expect(isLikelyTruncatedAnswer("EduPulse helps schools and", null)).toBe(true);
    expect(isLikelyTruncatedAnswer("EduPulse helps schools. [S1]", "stop")).toBe(false);
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
