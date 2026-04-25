const express = require("express");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const ROOT = __dirname;
const WIKI_ROOT = path.join(ROOT, "wiki");
const PROJECTS_FILE = path.join(ROOT, "scripts", "projects.json");
const PORT = Number(process.env.PORT || 3199);

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use("/static", express.static(path.join(ROOT, "public")));
app.use("/vendor/d3", express.static(path.join(ROOT, "node_modules", "d3", "dist")));
app.use("/vault", express.static(ROOT));

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.get("/api/projects", (_req, res) => {
  const projects = loadProjects().map((project) => {
    const index = buildProjectIndex(project);
    const categories = getEffectiveCategories(project, index.categories);
    return {
      ...publicProject(project, categories),
      pageCount: index.pages.length,
      projectsMtimeMs: getProjectsFileMtimeMs(),
    };
  });
  res.json({ projects, projectsMtimeMs: getProjectsFileMtimeMs() });
});

app.get("/api/projects/:project/pages", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const index = buildProjectIndex(project);
  const categories = getEffectiveCategories(project, index.categories);
  res.json({
    project: publicProject(project, categories),
    pages: index.pages.map(pageListItem),
    sections: buildSections(index.pages),
  });
});

app.get("/api/projects/:project/home-context", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const index = buildProjectIndex(project);
  const matchedSpeakers = collectOfficialSpeakerMatches(index);
  res.json({
    project: {
      name: project.name,
      description: project.description,
      genre: project.genre || "",
      obsidianVaultUrl: "",
    },
    landingPage: pageListItem(findHomePage(index) || index.pages[0]),
    sourceContext: {
      accent: "conference",
      title: "AI Engineer Miami 2026",
      summary: project.primarySummary || project.description || "",
      url: project.primaryUrl || "",
      dateLabel: "2026-04-20 to 2026-04-21",
      locationLabel: "Miami, Florida",
      speakerCount: matchedSpeakers.length,
      matchedSpeakers,
      unmatchedSpeakers: [],
    },
    diary: null,
  });
});

app.get("/api/projects/:project/page", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const index = buildProjectIndex(project);
  const page = index.byId.get(String(req.query.id || ""));
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json({
    project: publicProject(project, getEffectiveCategories(project, index.categories)),
    page: {
      ...pageDetailItem(page),
      html: renderPage(page, project, index),
      rawContent: fs.readFileSync(page.filePath, "utf8"),
      backlinks: (index.backlinks.get(page.id) || []).map((id) => linkedPageItem(index.byId.get(id))).filter(Boolean),
      outgoing: page.links.map((id) => linkedPageItem(index.byId.get(id))).filter(Boolean),
      semanticPeers: collectSemanticPeers(page, index),
      matchedPerson: null,
      researchLinks: collectResearchLinks(page),
      sourceRefs: collectPageSourceReferences(page),
      source: collectPageSourceBundle(page),
      image: null,
      chapterInfo: null,
      personEvidence: null,
      autoSummaryStale: false,
      obsidianPageUrl: "",
    },
  });
});

app.get("/api/projects/:project/quotes", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ quotes: collectProjectQuotes(project), rootQuoteBookUrl: "" });
});

app.get("/api/projects/:project/graph", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const index = buildProjectIndex(project);
  res.json({
    nodes: index.pages.map((page) => ({
      id: page.id,
      title: page.title,
      label: page.title,
      category: page.category,
      entityType: humanizeCategory(page.category),
      excerpt: page.excerpt,
      outlinkCount: page.links.length,
      backlinkCount: (index.backlinks.get(page.id) || []).length,
      degree: page.links.length + (index.backlinks.get(page.id) || []).length,
    })),
    links: index.pages.flatMap((page) => page.links.map((target) => ({ source: page.id, target }))),
  });
});

app.get("/api/projects/:project/chapters", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ chapters: [], locations: [], featuredPeople: [], featuredPlaces: [], stats: {} });
});

app.get("/api/projects/:project/claude", (req, res) => {
  const project = getProject(req.params.project);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const filename = project.instructionsFile || "AGENT.md";
  res.json({
    filename,
    content: fs.readFileSync(path.join(ROOT, filename), "utf8"),
    readOnly: true,
  });
});

app.get("/api/calendar", (_req, res) => {
  res.status(404).json({ error: "Calendar is disabled for this standalone public wiki" });
});

app.get("/api/quotes", (_req, res) => {
  res.status(404).json({ error: "Global quotes are disabled for this standalone public wiki" });
});

app.get("/api/ai-create-jobs", (_req, res) => {
  res.json({ jobs: [] });
});

app.get("/api/youtube-imports", (_req, res) => {
  res.json({ runs: [] });
});

const mutatingProjectRoutes = [
  "/api/projects",
  "/api/projects/import-spec",
  "/api/projects/:project/config",
  "/api/projects/:project/config/sync-discovered-categories",
  "/api/projects/:project/config/ai-fill",
  "/api/projects/:project/categories",
  "/api/projects/:project/fork",
  "/api/projects/:project/delete",
  "/api/projects/:project/watcher-ingest-apply",
  "/api/projects/:project/auto-reorganize/apply",
  "/api/projects/:project/claude",
  "/api/projects/:project/page",
  "/api/projects/:project/page-delete",
  "/api/projects/:project/person-profile",
  "/api/projects/:project/person-profile/fetch-website",
  "/api/projects/:project/page-aliases",
  "/api/projects/:project/page-link",
  "/api/projects/:project/ai-edit",
  "/api/projects/:project/auto-summarize-page",
  "/api/projects/:project/materialize-question-pages",
  "/api/projects/:project/create",
  "/api/projects/:project/create-from-image",
  "/api/projects/:project/create-with-ai",
  "/api/projects/:project/create-with-ai/category-preview",
  "/api/projects/:project/rename",
];

for (const route of mutatingProjectRoutes) {
  app.post(route, (_req, res) => {
    res.status(403).json({ error: "AIE Wiki is read-only" });
  });
}

app.listen(PORT, () => {
  console.log(`AIE Wiki listening on http://localhost:${PORT}`);
});

function loadProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf8"));
}

function getProjectsFileMtimeMs() {
  return fs.statSync(PROJECTS_FILE).mtimeMs;
}

function getProject(name) {
  return loadProjects().find((project) => project.name === name);
}

function publicProject(project, categories) {
  return {
    name: project.name,
    displayName: project.displayName || project.name,
    description: project.description || "",
    brandSubtitle: project.brandSubtitle || project.description || "",
    genre: project.genre || "",
    pageCount: buildProjectIndex(project).pages.length,
    categories,
    configuredCategories: project.categories || [],
    categoryMeta: getCategoryMeta(categories),
    wikiPath: path.join(project.path, "wiki"),
    obsidianVaultUrl: "",
    claudePath: path.join(project.path, project.instructionsFile || "AGENT.md"),
    instructionsFilename: project.instructionsFile || "AGENT.md",
    primaryUrl: project.primaryUrl || "",
    primaryLabel: project.primaryLabel || "",
    primarySummary: project.primarySummary || "",
    sourceBoundary: project.sourceBoundary || "",
    filingGuidance: project.filingGuidance || "",
    knowledgePriority: project.knowledgePriority || "",
    resourceRecencyBias: "neutral",
    resourceRecencyWindowDays: 0,
    categoryConsistency: {
      configuredCategories: project.categories || [],
      discoveredCategories: categories,
      missingFromConfig: categories.filter((category) => !(project.categories || []).includes(category)),
      configuredOnly: (project.categories || []).filter((category) => !categories.includes(category)),
      syncableCategories: categories,
    },
    path: project.path,
    readOnly: true,
    publicShare: true,
    hideCalendar: true,
  };
}

function buildProjectIndex(project) {
  const files = walkMarkdownFiles(path.join(project.path, "wiki"));
  const pages = files.map((filePath) => parsePage(project, filePath)).filter(Boolean);
  const byId = new Map(pages.map((page) => [page.id, page]));
  const slugToIds = new Map();
  const aliasToIds = new Map();
  for (const page of pages) {
    pushMap(slugToIds, page.slug, page.id);
    pushMap(aliasToIds, page.title, page.id);
    for (const alias of page.aliases) {
      pushMap(aliasToIds, alias, page.id);
    }
  }
  for (const page of pages) {
    page.links = Array.from(new Set(extractWikiTargets(page.body).map(({ target, preferredCategory }) => {
      return resolveLinkTarget(target, byId, slugToIds, aliasToIds, preferredCategory);
    }).filter(Boolean)));
  }
  const backlinks = new Map();
  for (const page of pages) {
    for (const target of page.links) {
      pushMap(backlinks, target, page.id, false);
    }
  }
  const categories = Array.from(new Set([...pages.map((page) => page.category), ...discoverCategories(project)])).sort();
  return { pages, byId, backlinks, categories, slugToIds, aliasToIds };
}

function walkMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  const results = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(entryPath);
    }
  }
  return results.sort();
}

function parsePage(project, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const stats = fs.statSync(filePath);
  const parsed = matter(raw);
  const wikiRoot = path.join(project.path, "wiki");
  const wikiPath = slashify(path.relative(wikiRoot, filePath));
  const id = wikiPath.replace(/\.md$/i, "");
  const segments = id.split("/");
  const slug = segments[segments.length - 1];
  const heading = parsed.content.match(/^#\s+(.+)$/m);
  const title = heading ? heading[1].trim() : humanizeSlug(slug);
  const category = segments.length > 1 ? segments[0] : "root";
  const aliases = normalizeAliases(parsed.data.aliases).filter((alias) => normalizeKey(alias) !== normalizeKey(title));
  const page = {
    id,
    slug,
    title,
    aliases,
    category,
    filePath,
    wikiPath,
    frontmatter: parsed.data || {},
    body: parsed.content.trim(),
    excerpt: "",
    projectName: project.name,
    mtimeMs: stats.mtimeMs,
    createdAt: new Date(stats.birthtimeMs || stats.mtimeMs).toISOString(),
    links: [],
  };
  page.excerpt = buildPageExcerpt(page);
  return page;
}

function discoverCategories(project) {
  const wikiRoot = path.join(project.path, "wiki");
  return fs.readdirSync(wikiRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "assets")
    .map((entry) => entry.name)
    .sort();
}

function renderPage(page, project, index) {
  const unresolvedLinks = [];
  const content = page.body.replace(/\[\[([^[\]]+)\]\]/g, (match, inner, offset, source) => {
    const [targetPart, aliasPart] = inner.split("|");
    const target = targetPart.split("#")[0].trim();
    const alias = aliasPart ? aliasPart.trim() : target.split("/").pop().trim();
    const preferredCategory = inferPreferredCategory(source, offset);
    const resolvedId = resolveLinkTarget(target, index.byId, index.slugToIds, index.aliasToIds, preferredCategory);
    if (!resolvedId) {
      const token = `UNRESOLVED_WIKILINK_${unresolvedLinks.length}`;
      unresolvedLinks.push({ token, alias, target });
      return token;
    }
    const href = `#/project/${encodeURIComponent(project.name)}/page/${encodeURIComponent(resolvedId)}`;
    return `[${escapeMarkdownLabel(alias)}](${href})`;
  });
  let html = markdown.render(content);
  for (const link of unresolvedLinks) {
    const pattern = new RegExp(link.token, "g");
    html = html.replace(pattern, `<span class="wikilink unresolved" title="Unavailable reference in this public read-only wiki" data-wikilink-target="${escapeHtml(link.target)}">${escapeHtml(link.alias)}</span>`);
  }
  return html;
}

function buildSections(pages) {
  const byCategory = new Map();
  for (const page of pages) {
    const current = byCategory.get(page.category) || [];
    current.push(pageListItem(page));
    byCategory.set(page.category, current);
  }
  return Array.from(byCategory.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, sectionPages]) => ({ name, pages: sectionPages.sort((a, b) => a.title.localeCompare(b.title)) }));
}

function pageListItem(page) {
  if (!page) {
    return null;
  }
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    aliases: page.aliases || [],
    category: page.category,
    entityType: humanizeCategory(page.category),
    byline: page.frontmatter?.date || "",
    excerpt: page.excerpt,
    wikiPath: page.wikiPath,
    createdAt: page.createdAt || "",
  };
}

function pageDetailItem(page) {
  return {
    ...pageListItem(page),
    frontmatter: page.frontmatter,
    mtimeMs: page.mtimeMs,
    renamable: false,
    renameBase: page.title,
  };
}

function linkedPageItem(page) {
  return page ? { ...pageListItem(page), image: null } : null;
}

function findHomePage(index) {
  return index.byId.get("overview") || index.byId.get("index") || null;
}

function collectSemanticPeers(page, index) {
  const linked = new Set([...(index.backlinks.get(page.id) || []), ...page.links]);
  return Array.from(linked).map((id) => linkedPageItem(index.byId.get(id))).filter(Boolean).slice(0, 24);
}

function collectOfficialSpeakerMatches(index) {
  return index.pages
    .filter((page) => page.category === "people")
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((person) => {
      const supportingIds = new Set([
        ...person.links,
        ...(index.backlinks.get(person.id) || []),
      ]);
      const supportingPages = Array.from(supportingIds)
        .map((id) => index.byId.get(id))
        .filter((page) => page && page.id !== person.id && page.category === "talks")
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(linkedPageItem);
      return {
        speaker: person.title,
        localPeople: [linkedPageItem(person)],
        supportingPages,
        autoCreateReady: false,
      };
    });
}

function collectResearchLinks(page) {
  return Array.from(page.body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)).map((match) => ({
    label: match[1],
    url: match[2],
  }));
}

function collectPageSourceReferences(page) {
  return Array.from(new Set(Array.from(page.body.matchAll(/https?:\/\/[^\s)]+/g)).map((match) => match[0]))).map((url) => ({ label: url, url }));
}

function collectPageSourceBundle(page) {
  const transcriptPaths = detectTranscriptPaths(page);
  if (!transcriptPaths.length) {
    return null;
  }
  return {
    sourceRef: transcriptPaths.join(", "),
    transcriptFound: true,
    transcriptPaths,
    transcriptPath: transcriptPaths.join(", "),
    transcriptBody: "",
    transcriptFrontmatter: {
      source: "Transcript-derived",
    },
    audioFound: false,
    audioUrl: "",
    audioName: "",
  };
}

function detectTranscriptPaths(page) {
  const refs = new Set();
  const body = page.body || "";
  const labels = Array.isArray(page.frontmatter?.sourceLabels) ? page.frontmatter.sourceLabels : [];
  if (body.includes("/tmp/aie-miami-transcript.txt")) {
    refs.add("/tmp/aie-miami-transcript.txt");
  }
  if (body.includes("/tmp/aie-miami-part2-transcript.txt")) {
    refs.add("/tmp/aie-miami-part2-transcript.txt");
  }
  if (!refs.size && labels.some((label) => normalizeKey(label) === "transcript-derived")) {
    const id = page.id || "";
    if (id.includes("2026-04-20")) {
      refs.add("/tmp/aie-miami-transcript.txt");
    } else if (id.includes("2026-04-21")) {
      refs.add("/tmp/aie-miami-part2-transcript.txt");
    } else {
      refs.add("/tmp/aie-miami-transcript.txt");
      refs.add("/tmp/aie-miami-part2-transcript.txt");
    }
  }
  return Array.from(refs).filter((filePath) => fs.existsSync(filePath));
}

function collectProjectQuotes(project) {
  const quotesPath = path.join(project.path, "wiki", "quotes.md");
  if (!fs.existsSync(quotesPath)) {
    return [];
  }
  const text = fs.readFileSync(quotesPath, "utf8");
  const chunks = text.split(/\n---\n/g).slice(1);
  return chunks.map((chunk) => {
    const quote = (chunk.match(/>\s+"?([^"\n][\s\S]*?)"?\n/) || [])[1] || "";
    const source = chunk.match(/Source:\s+\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
    const speaker = (chunk.match(/\*\*([^*]+)\*\*/) || [])[1] || "";
    return {
      text: quote.trim().replace(/^"|"$/g, ""),
      speaker,
      project: project.name,
      pageId: source ? source[1] : "quotes",
      pageTitle: source ? (source[2] || source[1]) : "Quotes",
      meta: source ? `Source: ${source[2] || source[1]}` : "",
      sourcePath: "quotes.md",
      tags: ["Transcript-derived"],
    };
  }).filter((quote) => quote.text);
}

function getEffectiveCategories(project, indexedCategories) {
  return Array.from(new Set([...(project.categories || []), ...indexedCategories])).filter((category) => category !== "root").sort();
}

function getCategoryMeta(categories) {
  return Object.fromEntries(categories.map((category) => [category, {
    key: category,
    label: humanizeCategory(category),
    icon: getCategoryIconName(category),
  }]));
}

function getCategoryIconName(category) {
  const icons = {
    companies: "building",
    events: "calendar",
    people: "user",
    quotes: "quote",
    resources: "book",
    talks: "presentation",
    tools: "gear",
    topics: "tag",
  };
  return icons[category] || "file";
}

function extractWikiTargets(content) {
  return Array.from(content.matchAll(/\[\[([^[\]]+)\]\]/g), (match) => {
    const [target] = match[1].split("|");
    return {
      target: target.split("#")[0].trim(),
      preferredCategory: inferPreferredCategory(content, match.index || 0),
    };
  }).filter((item) => item.target);
}

function resolveLinkTarget(target, byId, slugToIds, aliasToIds, preferredCategory = "") {
  if (byId.has(target)) {
    return target;
  }
  const categoryMatch = preferredCategory && !target.includes("/")
    ? `${preferredCategory}/${target}`
    : "";
  if (categoryMatch && byId.has(categoryMatch)) {
    return categoryMatch;
  }
  const slug = target.split("/").pop();
  const slugMatch = slugToIds.get(normalizeKey(slug));
  if (slugMatch?.length === 1) {
    return slugMatch[0];
  }
  const aliasMatch = aliasToIds.get(normalizeKey(target));
  if (aliasMatch?.length === 1) {
    return aliasMatch[0];
  }
  return "";
}

function inferPreferredCategory(content, offset) {
  const lineStart = content.lastIndexOf("\n", offset) + 1;
  const prefix = content.slice(lineStart, offset).toLowerCase();
  if (/\b(companies|company):\s*$/.test(prefix)) return "companies";
  if (/\b(topics|topic):\s*$/.test(prefix)) return "topics";
  if (/\b(people|person|speakers|speaker):\s*$/.test(prefix)) return "people";
  if (/\b(events|event):\s*$/.test(prefix)) return "events";
  if (/\b(tools|tool):\s*$/.test(prefix)) return "tools";
  if (/\b(resources|resource|sources|source):\s*$/.test(prefix)) return "resources";
  return "";
}

function pushMap(map, key, value, normalize = true) {
  const mapKey = normalize ? normalizeKey(key) : key;
  const current = map.get(mapKey) || [];
  if (!current.includes(value)) {
    current.push(value);
    map.set(mapKey, current);
  }
}

function buildPageExcerpt(page) {
  if (page.id === "index") return "See the complete AIE Wiki index.";
  if (page.id === "overview") return "Start with the public AI Engineer Miami 2026 synthesis.";
  if (page.id === "quotes") return "Project-local transcript-derived quotes.";
  return page.body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/^#.*$/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[\[([^[\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, alias) => alias || target)
    .replace(/[*_`>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^Summary\s+/i, "")
    .split(/(?<=[.!?])\s+/)[0]
    .slice(0, 120)
    .replace(/\s+\S*$/, "")
    .replace(/[.,;:!?-]+$/, "")
    .trim();
}

function normalizeAliases(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (!value) {
    return [];
  }
  return [String(value).trim()].filter(Boolean);
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function humanizeSlug(value) {
  return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeCategory(value) {
  return humanizeSlug(value).replace(/\bAi\b/g, "AI").replace(/\bMcp\b/g, "MCP");
}

function slashify(value) {
  return String(value || "").replace(/\\/g, "/");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeMarkdownLabel(value) {
  return String(value || "").replace(/([\\\]])/g, "\\$1");
}
