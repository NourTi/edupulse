# EduPulse Agent MCP Integration Decision

## Decision

EduPulse will use the **Agent Scraper MCP repository’s hosted REST interface as an optional, server-side web retrieval adapter**, not as an unrestricted replacement for the institution knowledge base. It is the only one of the two candidates that exposes a remote HTTP interface suitable for a Render-hosted Node application.

## Comparison

| Candidate | Useful capability | Deployment fit | Cost/auth caveat | Decision |
|---|---|---|---|---|
| `bch1212/agentfetch-mcp` | Token-budgeted fetch, local Trafilatura, optional Jina/Firecrawl, PDF extraction, caching | MCP stdio/Python process; not directly deployable inside the current Node/Render service without a separate Python worker | Jina and Firecrawl are optional external providers; Redis is optional; the hosted product is separate | Keep as a future desktop/local-worker option |
| `aparajithn/agent-scraper-mcp` | Remote REST/MCP surface for clean page extraction, Google search, links, metadata, screenshots | Hosted HTTP endpoint can be called by the current Node backend | Public advertised endpoint; free tier is stated as 50 requests/IP/day, but availability is not guaranteed and the endpoint timed out during one probe | Use only as a bounded optional fallback |

Both repositories are MIT-licensed according to their repository license files. AgentFetch advertises stdio transport and depends on optional Jina/Firecrawl services for broader coverage. Agent Scraper exposes a hosted Render REST endpoint, but its own implementation disables DNS-rebinding protection for its MCP server and advertises a payment path after the free quota; therefore EduPulse must never send private school data, credentials, or student identifiers to it.

## Safety boundary

Approved institution sources remain first priority. The MCP fallback will run only for clearly general-knowledge questions after approved retrieval finds no answer. It will accept only HTTPS public URLs, cap result count and content length, apply a timeout, and convert retrieved pages into citation-bearing evidence before any model response. Protected-record questions, institution policy questions, admissions decisions, grades, attendance, fees, and private contacts will not use the MCP fallback. If the MCP is unavailable, EduPulse will use the existing safe response or the no-auth Wikipedia fallback.

## Sources

[1]: https://github.com/bch1212/agentfetch-mcp "AgentFetch MCP repository"
[2]: https://github.com/aparajithn/agent-scraper-mcp "Agent Scraper MCP repository"
