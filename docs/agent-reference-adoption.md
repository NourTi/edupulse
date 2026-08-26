# EduPulse Agent Reference Adoption

The supplied API and MCP repositories are used as implementation references for EduPulse, not as automatic runtime dependencies and not as workspace connectors.

## Adopted patterns

EduPulse uses a single public assistant surface with a persistent launcher, expandable conversation panel, suggested prompts, loading and error states, citations, and clear privacy boundaries. The server separates conversational intent from knowledge retrieval, routes platform information through an approved profile response, keeps school-specific retrieval institution-scoped, and uses a bounded no-auth public-data fallback only for clearly general questions. Public webpage ingestion remains administrator-approved and is prepared for an isolated Crawl4AI worker rather than unchecked browsing inside the web request.

These patterns reflect the useful capabilities visible across public API and MCP ecosystems: small composable actions, explicit request boundaries, structured results, source attribution, and a separation between discovery and execution.

## Intentionally excluded

MailFlat and the third-party Brave MCP are not runtime dependencies. MailFlat is unrelated to the visitor knowledge workflow, while the Brave entry still requires a paid Brave API key and its remote endpoint is not an appropriate unverified production dependency. Google sign-in credentials are not used as web-search credentials. EduPulse instead uses administrator-approved school sources and a constrained Wikipedia fallback for general factual questions.

Future connectors may be implemented inside EduPulse when their use case, licensing, authentication, rate limits, data handling, and deployment path are understood. They will not be enabled merely because they appear in a catalog.

## Current fix covered by this reference

The landing page now has one visitor assistant: the full-page public chat was removed from the background section, while the dedicated authenticated knowledge route can retain its workspace chat. The corner assistant sends the visitor question to `knowledge.askPublic`. English, Arabic, mixed-language, and common misspelled thanks are handled before retrieval, producing a natural response such as “You’re very welcome. I’m here if you need anything else—feel free to ask.”

## Approved creator profile

The public profile may state only that the creator is the configured EduPulse owner, an English teacher and PhD educator who teaches at university and secondary-school levels. These facts come from the project owner’s own instructions. The agent must not infer or invent a personal name, biography, institution, contact details, or credentials beyond the configured owner name and these approved facts.
