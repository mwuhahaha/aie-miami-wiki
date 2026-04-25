const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const WIKI_ROOT = path.join(ROOT, "wiki");
const PLACEHOLDER = "<complete updated body markdown, no YAML frontmatter, no code fences>";

const registries = {
  people: readRegistry("people"),
  talks: readRegistry("talks"),
  companies: readRegistry("companies"),
  tools: readRegistry("tools"),
  topics: readRegistry("topics"),
};

const peopleById = new Map(registries.people.map((item) => [item.id, item]));
const talksById = new Map(registries.talks.map((item) => [item.id, item]));
const companiesById = new Map(registries.companies.map((item) => [item.id, item]));
const toolsById = new Map(registries.tools.map((item) => [item.id, item]));
const topicsById = new Map(registries.topics.map((item) => [item.id, item]));

const curated = {
  companies: {
    akamai: { topics: ["edge-ai", "agent-infrastructure"], tools: [], talks: ["2026-04-21-sarah-chieng-latency-debt-and-fast-coding-models"] },
    cloudflare: { topics: ["agent-runtime", "sandboxed-compute", "edge-ai"], tools: ["cloudflare-workers"], talks: ["2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi"] },
    g2i: { topics: ["ai-adoption", "developer-experience"], tools: [], talks: ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents"] },
    "google-deepmind": { topics: ["generative-media", "multimodal-ai"], tools: ["google-ai-studio", "lyria", "veo"], talks: ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models"] },
    humanlayer: { topics: ["governed-agents", "agent-workflows"], tools: ["humanlayer"], talks: ["2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"] },
    independent: { topics: ["developer-experience", "ai-adoption"], tools: [], talks: ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents"] },
    "kent-c-dodds-tech-llc": { topics: ["personal-agents", "agent-workflows"], tools: [], talks: ["2026-04-20-kent-c-dodds-build-a-free-agent"] },
    "latent-patterns": { topics: ["ai-adoption", "developer-experience"], tools: ["coding-agents"], talks: ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents"] },
    modem: { topics: ["agent-ready-interfaces", "developer-experience"], tools: ["modem"], talks: ["2026-04-21-dave-kiss-agent-ready-interfaces"] },
    opencode: { topics: ["open-source-ai-devtools", "coding-agents", "terminal-workflows"], tools: ["opencode", "opencode-sdk"], talks: ["2026-04-21-tejas-bhakta-sub-agents-and-specialized-models"] },
    outrival: { topics: ["agent-memory", "dynamic-context", "enterprise-agents"], tools: ["agent-memory"], talks: ["2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents"] },
    pinterest: { topics: ["ai-adoption", "developer-experience"], tools: [], talks: ["2026-04-20-dax-raad-you-don-t-have-any-good-ideas"] },
    qodo: { topics: ["code-quality-gates", "software-delivery"], tools: ["qodo", "kody"], talks: ["2026-04-20-nnenna-ndukwe-how-to-embed-ai-code-quality-gates-in-your-sdlc"] },
  },
  tools: {
    "agent-memory": { topics: ["agent-memory", "dynamic-context"], talks: ["2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents"] },
    "cloudflare-workers": { topics: ["agent-runtime", "sandboxed-compute", "edge-ai"], talks: ["2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi"], companies: ["cloudflare"] },
    "coding-agents": { topics: ["coding-agents", "ai-adoption", "developer-experience"], talks: ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents", "2026-04-21-rick-blalock-coding-agents-are-eating-software"] },
    github: { topics: ["software-delivery", "governed-agents"], talks: ["2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp"] },
    "google-ai-studio": { topics: ["generative-media", "multimodal-ai"], talks: ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models"], companies: ["google-deepmind"] },
    humanlayer: { topics: ["agent-workflows", "governed-agents"], talks: ["2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"], companies: ["humanlayer"] },
    kody: { topics: ["code-quality-gates", "software-delivery"], talks: ["2026-04-20-nnenna-ndukwe-how-to-embed-ai-code-quality-gates-in-your-sdlc"], companies: ["qodo"] },
    langgraph: { topics: ["governed-agents", "agent-workflows"], talks: ["2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp"] },
    lyria: { topics: ["generative-media", "multimodal-ai"], talks: ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models"], companies: ["google-deepmind"] },
    mcp: { topics: ["mcp-agent-runtime", "mcp-vs-skills", "agent-runtime"], talks: ["2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"] },
    "openai-realtime": { topics: ["voice-agents", "agent-runtime"], talks: ["2026-04-20-dax-raad-you-don-t-have-any-good-ideas"] },
    opencode: { topics: ["open-source-ai-devtools", "coding-agents", "terminal-workflows"], talks: ["2026-04-21-tejas-bhakta-sub-agents-and-specialized-models"], companies: ["opencode"] },
    qodo: { topics: ["code-quality-gates", "software-delivery"], talks: ["2026-04-20-nnenna-ndukwe-how-to-embed-ai-code-quality-gates-in-your-sdlc"], companies: ["qodo"] },
    "reachy-mini": { topics: ["robotics", "multimodal-ai"], talks: ["2026-04-21-lena-hall-my-robot-thinks-you-re-a-10"] },
    snowflake: { topics: ["governed-agents", "enterprise-agents"], talks: ["2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp"] },
    ssh: { topics: ["remote-coding-agents", "terminal-workflows"], talks: ["2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh"] },
    tmux: { topics: ["terminal-workflows", "coding-agents"], talks: ["2026-04-20-ben-vinegar-from-local-to-remote-working-with-coding-agents-over-ssh"] },
    veo: { topics: ["generative-media", "multimodal-ai"], talks: ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models"], companies: ["google-deepmind"] },
  },
  topics: {
    "agent-auditability": ["2026-04-21-nyah-macklin-context-graphs-for-auditable-agents"],
    "agent-infrastructure": ["2026-04-20-rita-kozlov-building-infrastructure-that-scales-to-a-billion-agents"],
    "agent-runtime": ["2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi", "2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"],
    "agent-workflows": ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents", "2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp"],
    "ai-adoption": ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents", "2026-04-21-david-house-transforming-programming-mindsets-case-studies-in-agentic-coding-adoption"],
    "context-engineering": ["2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents"],
    "context-graphs": ["2026-04-21-nyah-macklin-context-graphs-for-auditable-agents"],
    "developer-experience": ["2026-04-20-max-stoiber-what-does-good-taste-in-dx-look-like-in-the-age-of-agents", "2026-04-21-david-gomes-ides-are-dead-long-live-ides"],
    "dynamic-context": ["2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents"],
    "enterprise-agents": ["2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp", "2026-04-21-alvin-pane-memory-and-dynamic-discovery-for-agents"],
    "future-of-ides": ["2026-04-21-david-gomes-ides-are-dead-long-live-ides"],
    "generative-media": ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models"],
    "governed-agents": ["2026-04-20-anna-juchnicki-from-tickets-to-prs-shipping-a-governed-snowflake-ops-agent-with-langgraph-and-mcp"],
    "knowledge-graphs": ["2026-04-21-nyah-macklin-context-graphs-for-auditable-agents"],
    "mcp-agent-runtime": ["2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"],
    "mcp-vs-skills": ["2026-04-21-laurie-voss-mcp-vs-skills-evaluating-tool-interfaces-for-agents"],
    "model-flexibility": ["2026-04-21-tejas-bhakta-sub-agents-and-specialized-models"],
    "multimodal-ai": ["2026-04-20-alisa-fortin-from-prompt-to-production-maximizing-value-with-google-s-genmedia-models", "2026-04-21-stefan-avram-the-multimodal-future-is-open-source"],
    "personal-agents": ["2026-04-20-kent-c-dodds-build-a-free-agent"],
    "research-plan-implement": ["2026-04-21-diane-macklin-building-ai-apps-with-everyday-coding-agents"],
    robotics: ["2026-04-21-lena-hall-my-robot-thinks-you-re-a-10"],
    "sandboxed-compute": ["2026-04-20-dexter-horthy-everything-we-got-wrong-about-rpi"],
    "software-3": ["2026-04-20-geoffrey-huntley-software-development-now-costs-less-than-minimum-wage"],
    "voice-agents": ["2026-04-20-dax-raad-you-don-t-have-any-good-ideas"],
  },
};

const pagesNeedingPublicCopy = walk(WIKI_ROOT)
  .filter((file) => file.endsWith(".md"))
  .filter((file) => {
    const raw = fs.readFileSync(file, "utf8");
    return raw.includes(PLACEHOLDER)
      || raw.includes("The session summary uses")
      || raw.includes("Claims here stay bounded")
      || raw.includes("The biographical framing stays conservative")
      || raw.includes("appears in the AI Engineer Miami 2026 wiki as a company or organization")
      || raw.includes("is represented in this wiki as a tool, product, or technical concept");
  });

for (const file of pagesNeedingPublicCopy) {
  const rel = path.relative(WIKI_ROOT, file).replace(/\\/g, "/");
  const id = rel.replace(/\.md$/, "");
  const slug = path.basename(id);
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const category = parsed.data.category || id.split("/")[0];
  const title = parsed.data.title || titleFromSlug(path.basename(id));
  const body = renderBody({ id, slug, rel, category, title });
  const next = matter.stringify(`${body}\n`, parsed.data);
  fs.writeFileSync(file, next);
}

console.log(`Updated ${pagesNeedingPublicCopy.length} public wiki pages.`);

function readRegistry(category) {
  return JSON.parse(fs.readFileSync(path.join(WIKI_ROOT, category, "registry.json"), "utf8"));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function renderBody(page) {
  if (page.category === "talks") return renderTalk(page);
  if (page.category === "people") return renderPerson(page);
  if (page.category === "companies") return renderCompany(page);
  if (page.category === "tools") return renderTool(page);
  if (page.category === "topics") return renderTopic(page);
  if (page.category === "events") return renderEvent(page);
  return renderGeneric(page);
}

function renderTalk({ slug, title }) {
  const speaker = speakerForTalk(slug);
  const date = talkDate(slug);
  const themes = themesForTalk(slug, title);
  const day = date === "2026-04-20" ? "Day 1" : "Day 2";
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} was an AI Engineer Miami 2026 ${day} session${speaker ? ` by ${wikilink(`people/${speaker.id}`, speaker.title)}` : ""}. The session summary uses the transcript corpus, conference website context, and related wiki pages.`,
    "",
    "## Conference Context",
    "",
    `The session belongs to the conference's practical AI engineering thread: how builders move from model capability to systems that can be shipped, inspected, operated, and improved. Related themes include ${linkList(themes.topics, "topics")}, which describe the implementation pressures that the title and transcript evidence point toward.`,
    "",
    "## Related Pages",
    "",
    speaker ? `- Speaker: ${wikilink(`people/${speaker.id}`, speaker.title)}` : "- Speaker: not confidently linked",
    themes.topics.length ? `- Topics: ${inlineLinkList(themes.topics, "topics")}` : "- Topics: conference implementation patterns",
    themes.tools.length ? `- Tools/products: ${inlineLinkList(themes.tools, "tools")}` : "",
    themes.companies.length ? `- Companies: ${inlineLinkList(themes.companies, "companies")}` : "",
    "",
    sources(date),
  ].filter((line) => line !== "").join("\n");
}

function renderPerson({ slug, title }) {
  const talks = registries.talks.filter((talk) => talk.id.includes(slug));
  const talkList = talks.length ? talks.map((talk) => `- ${wikilink(`talks/${talk.id}`, talk.title)} (${talkDate(talk.id)})`).join("\n") : "- No talk is confidently linked on this page.";
  const topicIds = unique(talks.flatMap((talk) => themesForTalk(talk.id, talk.title).topics));
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} is represented in this public AI Engineer Miami 2026 wiki as a conference participant with links to the public event context and the transcript corpus. The profile stays conservative: it records linked session information and themes visible in the local conference map without adding private biographical material.`,
    "",
    "## Contribution at AI Engineer Miami",
    "",
    talks.length
      ? `${title}'s linked session was ${talks.map((talk) => wikilink(`talks/${talk.id}`, talk.title)).join(", ")}. The talk page carries the session-level context and source labels.`
      : `This remains a lightweight person landing page until fuller public evidence is added from the public conference website or transcripts.`,
    "",
    "## Talks",
    "",
    talkList,
    "",
    "## Related Themes",
    "",
    topicIds.length ? `- ${inlineLinkList(topicIds, "topics")}` : "- Conference speaker and participant context.",
    "",
    sourcesForGeneral(),
  ].join("\n");
}

function renderCompany({ slug, title }) {
  const info = curated.companies[slug] || { topics: [], tools: [], talks: [] };
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} appears in the AI Engineer Miami 2026 wiki as a company or organization connected to the conference's public knowledge graph. The company note stays with the talks, tools, and themes where the organization is relevant in the allowed conference corpus.`,
    "",
    "## Why It Matters Here",
    "",
    info.talks.length
      ? `${title} is connected here through ${inlineTalkList(info.talks)}. Use those talk pages and the transcript sources to evaluate the specific conference context.`
      : `${title} functions as a navigation node in the conference map until a fuller public-source summary is added.`,
    "",
    "## Related Pages",
    "",
    info.talks.length ? `- Talks: ${inlineTalkList(info.talks)}` : "- Talks: no high-confidence talk link is listed",
    info.tools.length ? `- Tools/products: ${inlineLinkList(info.tools, "tools")}` : "",
    info.topics.length ? `- Topics: ${inlineLinkList(info.topics, "topics")}` : "",
    "",
    sourcesForGeneral(),
  ].filter((line) => line !== "").join("\n");
}

function renderTool({ slug, title }) {
  const info = curated.tools[slug] || { topics: [], talks: [], companies: [] };
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} is represented in this wiki as a tool, product, or technical concept relevant to AI Engineer Miami 2026. Its conference role is described through talk titles, transcripts, and public event context rather than private source material.`,
    "",
    "## Conference Reading",
    "",
    info.talks.length
      ? `${title} is tied to ${inlineTalkList(info.talks)}, which provides the source-bound conference context.`
      : `${title} remains a supporting tool entry that should be expanded only with transcript-derived or public-web evidence.`,
    "",
    "## Related Pages",
    "",
    info.talks.length ? `- Talks: ${inlineTalkList(info.talks)}` : "- Talks: no high-confidence talk link is listed",
    info.companies?.length ? `- Companies: ${inlineLinkList(info.companies, "companies")}` : "",
    info.topics.length ? `- Topics: ${inlineLinkList(info.topics, "topics")}` : "",
    "",
    sourcesForGeneral(),
  ].filter((line) => line !== "").join("\n");
}

function renderTopic({ slug, title }) {
  const talkIds = curated.topics[slug] || inferTalksForTopic(slug, title);
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} is a conference theme page for the public AI Engineer Miami 2026 wiki. Claims here stay bounded to the local conference corpus: the two transcripts, the public conference website, and clearly labeled public-web context where available.`,
    "",
    "## Why It Matters",
    "",
    talkIds.length
      ? `The theme is most directly connected here to ${inlineTalkList(talkIds)}. Those linked sessions show how the topic surfaced as an implementation concern for AI engineers.`
      : `The theme tracks how the conference connected model capability to engineering practice.`,
    "",
    "## Conference Pattern",
    "",
    `${title} works as a lens rather than a standalone claim. It helps group pages that discuss agent design, developer workflows, production constraints, model/tool choices, and the practical work of turning AI systems into reliable software.`,
    "",
    "## Talks That Mention or Center It",
    "",
    talkIds.length ? talkIds.map((talkId) => `- ${wikilink(`talks/${talkId}`, talkTitle(talkId))}`).join("\n") : "- No high-confidence talk link is listed.",
    "",
    sourcesForGeneral(),
  ].join("\n");
}

function renderEvent({ id, title }) {
  const date = id.includes("2026-04-20") ? "2026-04-20" : "2026-04-21";
  const talks = registries.talks.filter((talk) => talk.id.startsWith(date));
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} is a day-level landing page for AI Engineer Miami 2026. It groups the public wiki's talk pages for ${date} and links back to the allowed source corpus rather than private event notes.`,
    "",
    "## Talks",
    "",
    talks.map((talk) => `- ${wikilink(`talks/${talk.id}`, talk.title)}`).join("\n"),
    "",
    "## Source Boundary",
    "",
    "The event context comes from the allowed conference transcripts and public conference-site schedule context, without private recordings, notes, queue state, or mixed-vault material.",
    "",
    sources(date),
  ].join("\n");
}

function renderGeneric({ title }) {
  return [
    `# ${title}`,
    "",
    "## Summary",
    "",
    `${title} is a public wiki page for AI Engineer Miami 2026, written as a concise orientation to the conference material.`,
    "",
    sourcesForGeneral(),
  ].join("\n");
}

function sources(date) {
  const transcript = date === "2026-04-20" ? "/tmp/aie-miami-transcript.txt" : date === "2026-04-21" ? "/tmp/aie-miami-part2-transcript.txt" : "/tmp/aie-miami-transcript.txt and /tmp/aie-miami-part2-transcript.txt";
  return [
    "## Sources",
    "",
    `- **Transcript-derived:** \`${transcript}\`.`,
    "- **Conference website reference:** https://www.ai.engineer/miami",
    "- **Public-web supporting context:** no additional public-web supporting context is cited on this page.",
  ].join("\n");
}

function sourcesForGeneral() {
  return sources("");
}

function speakerForTalk(talkId) {
  const candidates = [...peopleById.values()].sort((a, b) => b.id.length - a.id.length);
  return candidates.find((person) => talkId.includes(`-${person.id}-`) || talkId.includes(`${person.id}-`));
}

function talkDate(talkId) {
  const match = talkId.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function talkTitle(talkId) {
  return talksById.get(talkId)?.title || titleFromSlug(talkId.replace(/^\d{4}-\d{2}-\d{2}-/, ""));
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (["ai", "api", "sdk", "mcp", "rpi", "ide", "ides", "pr"].includes(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function themesForTalk(talkId, title) {
  const text = `${talkId} ${title}`.toLowerCase();
  const topics = [];
  const tools = [];
  const companies = [];
  addIf(text, topics, ["memory", "discovery"], ["agent-memory", "dynamic-context", "context-engineering"], tools, ["agent-memory"], companies, ["outrival"]);
  addIf(text, topics, ["genmedia", "generative", "production"], ["generative-media", "multimodal-ai"], tools, ["google-ai-studio", "lyria", "veo"], companies, ["google-deepmind"]);
  addIf(text, topics, ["snowflake", "langgraph", "mcp"], ["governed-agents", "agent-workflows", "mcp-agent-runtime"], tools, ["snowflake", "langgraph", "mcp"], companies, []);
  addIf(text, topics, ["ssh", "remote"], ["remote-coding-agents", "terminal-workflows"], tools, ["ssh", "tmux"], companies, []);
  addIf(text, topics, ["rpi", "runtime"], ["agent-runtime", "sandboxed-compute"], tools, ["cloudflare-workers"], companies, ["cloudflare"]);
  addIf(text, topics, ["quality", "sdlc"], ["code-quality-gates", "software-delivery"], tools, ["qodo", "kody"], companies, ["qodo"]);
  addIf(text, topics, ["infrastructure", "billion"], ["agent-infrastructure", "production-agents"], tools, [], companies, []);
  addIf(text, topics, ["ides", "ide"], ["future-of-ides", "developer-experience", "coding-agents"], tools, ["coding-agents"], companies, ["cursor"]);
  addIf(text, topics, ["everyday", "coding-agents", "coding agents"], ["ai-adoption", "coding-agents", "developer-experience"], tools, ["coding-agents"], companies, ["g2i", "latent-patterns"]);
  addIf(text, topics, ["robot"], ["robotics", "multimodal-ai"], tools, ["reachy-mini"], companies, []);
  addIf(text, topics, ["context graphs", "auditable"], ["context-graphs", "agent-auditability", "knowledge-graphs"], tools, [], companies, []);
  addIf(text, topics, ["wrong ai sdk", "sdk"], ["ai-sdk-selection", "typed-ai-interfaces"], tools, [], companies, []);
  addIf(text, topics, ["free agent"], ["personal-agents", "agent-workflows"], tools, [], companies, ["kent-c-dodds-tech-llc"]);
  addIf(text, topics, ["good ideas"], ["voice-agents", "ai-adoption"], tools, ["openai-realtime"], companies, ["pinterest"]);
  addIf(text, topics, ["minimum wage"], ["software-3", "software-economics", "coding-agents"], tools, ["coding-agents"], companies, []);
  addIf(text, topics, ["adoption"], ["ai-adoption", "agentic-coding-adoption"], tools, ["coding-agents"], companies, []);
  addIf(text, topics, ["eating software"], ["coding-agents", "software-delivery"], tools, ["coding-agents"], companies, []);
  if (!topics.length) topics.push("ai-adoption", "developer-experience");
  return { topics: unique(topics).filter((id) => topicsById.has(id)), tools: unique(tools).filter((id) => toolsById.has(id)), companies: unique(companies).filter((id) => companiesById.has(id)) };
}

function addIf(text, topics, needles, topicIds, tools, toolIds, companies, companyIds) {
  if (needles.some((needle) => text.includes(needle))) {
    topics.push(...topicIds);
    tools.push(...toolIds);
    companies.push(...companyIds);
  }
}

function inferTalksForTopic(id, title) {
  const tokens = new Set(String(`${id} ${title}`).toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3));
  return registries.talks
    .filter((talk) => String(`${talk.id} ${talk.title}`).toLowerCase().split(/[^a-z0-9]+/).some((token) => tokens.has(token)))
    .slice(0, 4)
    .map((talk) => talk.id);
}

function wikilink(target, label) {
  return `[[${target}|${label}]]`;
}

function inlineLinkList(ids, category) {
  return ids.map((id) => {
    const registry = category === "topics" ? topicsById : category === "tools" ? toolsById : companiesById;
    return wikilink(`${category}/${id}`, registry.get(id)?.title || titleFromSlug(id));
  }).join(", ");
}

function linkList(ids, category) {
  return ids.length ? inlineLinkList(ids, category) : "the related topic pages";
}

function inlineTalkList(ids) {
  return ids.filter((id) => talksById.has(id)).map((id) => wikilink(`talks/${id}`, talkTitle(id))).join(", ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
