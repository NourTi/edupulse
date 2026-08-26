# MCP and Search-Service Evaluation

## Initial findings

The user-provided [MailFlat SDK/MCP listing](https://glama.ai/mcp/servers/MailFlat/mailflat-sdks) is an email-inbox automation service for agents. The listing describes disposable or agent-managed inboxes, message reading, OTP and confirmation-link extraction, replies, and inbox management. It requires a MailFlat account key and the hosted service is closed-source even though client SDKs are open-source. Its useful scope is test automation, verification-email handling, and agent email workflows—not school knowledge retrieval, approved web ingestion, or parent support.

For EduPulse, MailFlat should **not** be integrated into the public assistant. It would add a third-party email-data processor and potentially expose school email content without helping the core visitor-answer problem. It could be considered later only for isolated CI testing of invitation and password-reset flows, never for real school mailboxes or production student communication.

The [Glama Python + Search catalog](https://glama.ai/mcp/servers?attributes=language%3Apython%2Ccategory%3Asearch) is a large registry rather than one service. At the time of review it listed thousands of Python/search entries and separate filters for remote hosting, RAG systems, web scraping, documentation access, and open data. The first visible examples included Vascue Public Knowledge Search, OctoTrip Rental Cars, and rsi-search-pro-mcp. These are not directly suitable for EduPulse: Vascue is healthcare documentation, OctoTrip is travel pricing, and rsi-search-pro-mcp is a broader browser/agent search platform whose school-data authorization and evidence controls would need separate verification.

## Decision boundary

Google OAuth credentials cannot perform Google web search. A real Google search integration needs separate Programmable Search credentials, and the result pages must be treated as untrusted evidence. EduPulse should not allow arbitrary search output to answer institution-policy questions. The safe design is: search only for discovery, restrict or allowlist domains, store the retrieved page as a pending source, require administrator approval, then index it through the existing grounded RAG path with citations.

The existing EduPulse Crawl4AI-compatible gateway is a better fit than MailFlat or a random Glama search server because it is already scoped to safe public URLs and administrator approval. The lightweight importer can handle one public page now; a separate Crawl4AI worker can later supply normalized text. No external service should be enabled solely because it appears in a directory.

## References

[1]: https://glama.ai/mcp/servers/MailFlat/mailflat-sdks "MailFlat SDKs / MCP listing on Glama"
[2]: https://glama.ai/mcp/servers?attributes=language%3Apython%2Ccategory%3Asearch "Glama Python Search MCP catalog"

## User-provided Brave MCP entry

The user-provided [mcp-brave-search tool page](https://glama.ai/mcp/servers/Llamatron2112/mcp-brave-search/tools/brave_web_search) is a third-party TypeScript remote-capable server by `Llamatron2112`, not the official Brave repository. Its `brave_web_search` tool accepts a query plus optional count, pagination offset, country, freshness, safe-search, and language parameters, and returns titles, URLs, and descriptions. Glama reports a tool-definition quality score of 3.8/5 and specifically notes that the page does not disclose rate limits or error behavior. The page does not establish the remote endpoint or the security of its proxy implementation.

Decision: do not connect this third-party Glama server directly to the production EduPulse assistant. The official Brave Search API/MCP is preferable because its endpoint and authentication are documented by Brave. If EduPulse enables web discovery, the server should call the official Brave API with a server-side key, use localized Algerian/Arabic search parameters, label results as external and untrusted, cite URLs, and optionally turn selected pages into pending administrator-review sources. The Glama server can be used as a personal MCP experiment, but it should not receive school or visitor data.

## Public APIs catalog review

The [Public APIs authentication section](https://github.com/public-apis/public-apis#authentication--authorization) is a directory of APIs and does not itself provide a search backend. Its authentication table is useful for classifying services, but the listed authentication providers are unrelated to public knowledge retrieval. The repository’s open-data area includes Wikipedia as a no-auth HTTPS API entry, making it a more appropriate free fallback for general factual questions than a random third-party search wrapper.

EduPulse now uses a constrained Wikipedia lookup for clearly general questions such as “What is …?”, “Who is …?”, and Arabic equivalents. It searches the language-appropriate Wikipedia API, returns a page summary and URL citation, and is attempted only after approved school sources fail. Institution-specific policy questions, private student questions, and unrestricted arbitrary prompts continue to use the approved-source fallback. This provides useful keyless general knowledge without pretending to be unrestricted Google search.

[3]: https://github.com/public-apis/public-apis#authentication--authorization "Public APIs authentication and authorization catalog"

The no-auth fallback is bounded with a per-process six-requests-per-minute bucket keyed by a truncated SHA-256 of the request IP, plus five-second timeouts for both the search and summary requests. This is an abuse-control layer, not a replacement for a distributed production rate limiter; a future always-on deployment should move the limit to the edge or shared store.
