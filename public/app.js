import {
  buildPersonComposePrefillFromSource,
  renderProjectHome as renderProjectHomeMarkup,
} from "/static/modules/home-view.mjs";
import {
  getRecentHomeItems,
  renderHomeCategoryStrip,
  renderHomeRecentPanel,
  buildTodoTaskSummaryFromPage,
  renderTodoTaskHomePanel,
  updateTodoTaskMarkdownContent,
} from "/static/modules/home-panels.mjs";
import {
  describeActivityThreadStatus,
  formatActivityElapsed,
  resolveActivityThreadSelection,
  renderActivityThreadList,
  renderActivityThreadDetail,
} from "/static/modules/activity-center.mjs";
import {
  buildActivityCenterRetryOutput,
} from "/static/modules/activity-center-retry.mjs";
import {
  renderComposeCategoryPreviewHtml,
} from "/static/modules/compose-category-preview.mjs";
import {
  renderComposePrefillBannerHtml,
} from "/static/modules/compose-prefill-banner.mjs";
import {
  buildComposeCategoryPreviewRoutingSignature,
} from "/static/modules/compose-category-preview-routing.mjs";
import {
  renderProjectCategoryInputs,
} from "/static/modules/project-category-inputs.mjs";
import {
  renderProjectManageListItem,
  renderRecencyBiasOptions,
} from "/static/modules/project-admin.mjs";
import {
  initializeProjectAdminTabs,
  renderProjectAdminCard,
} from "/static/modules/project-admin-card.mjs";
import {
  renderProjectManagePage,
} from "/static/modules/project-admin-page.mjs";
import {
  renderProjectCreatePage,
} from "/static/modules/project-create-page.mjs";
import {
  applyAutoReorganizeMoveFocus,
  buildAutoReorganizeApprovalDriftSummary,
  captureAutoReorganizeReviewState,
  restoreAutoReorganizeReviewState,
  renderAutoReorganizeProposalReview,
  syncAutoReorganizeCategoryChangeSummary,
  syncAutoReorganizeLandingActionSummary,
} from "/static/modules/auto-reorganize-proposal.mjs";
import {
  parseHash,
  buildProjectsHash as buildProjectsHashFromRouteNavigation,
  buildCountryPlacesHash as buildCountryPlacesHashFromRouteNavigation,
  buildProjectViewHash as buildProjectViewHashFromRouteNavigation,
} from "/static/modules/route-navigation.mjs";

const state = {
  projects: [],
  projectsMtimeMs: null,
  currentProject: null,
  pages: [],
  sections: [],
  currentPageId: null,
  currentPageMtimeMs: null,
  currentView: "page",
  currentCategoryView: "",
  graphLoadedFor: null,
  graphCategoryFilter: "",
  graphSearchQuery: "",
  quotes: [],
  categoryFilter: "",
  aiEditPollingId: null,
  aiCreatePollingId: null,
  aiCreateThreads: [],
  dismissedAiCreateJobIds: new Set(),
  activeAiCreateThreadId: null,
  activityModalOpen: false,
  locationMapInstance: null,
  homeMapRenderToken: 0,
  geocodeCache: new Map(),
  mapStatsCache: new Map(),
  graphDataCache: new Map(),
  todoTaskPages: new Map(),
  pageHeroActions: "",
  activeViewRequestId: 0,
  activeProjectLoadId: 0,
  activeRouteRequestId: 0,
  voiceDiaryHomePerf: null,
  relationshipModalOpen: false,
  relationshipDraft: null,
  projectAiFillReviewOpen: false,
  projectAiFillReview: null,
  projectAiFillReviewPreviousFocus: null,
  activeProjectConfigForm: null,
  activeProjectConfigInitialSignature: null,
  lastAcceptedHash: window.location.hash || "",
  suppressNextProjectConfigHashGuard: false,
  projectTemplates: [],
};

const PUBLIC_WIKI_TITLE = "AI Engineer Miami 2026 Wiki";
const PUBLIC_WIKI_SUBTITLE = "Read-only transcript and research wiki for the AI Engineer Miami 2026 conference.";

const projectSelect = document.querySelector("#project-select");
const pageFilter = document.querySelector("#page-filter");
const pageFilterStatus = document.querySelector("#page-filter-status");
const sectionsEl = document.querySelector("#sections");
const articleView = document.querySelector("#article-view");
const graphView = document.querySelector("#graph-view");
const graphCanvas = document.querySelector("#graph-canvas");
const graphControls = document.querySelector("#graph-controls");
const graphLegend = document.querySelector("#graph-legend");
const heroTitle = document.querySelector("#hero-title");
const heroKicker = document.querySelector("#hero-kicker");
const heroDescription = document.querySelector("#hero-description");
const heroMeta = document.querySelector("#hero-meta");
const overviewButton = document.querySelector("#overview-button");
const indexButton = document.querySelector("#index-button");
const graphButton = document.querySelector("#graph-button");
const quotesButton = document.querySelector("#quotes-button");
const chaptersButton = document.querySelector("#chapters-button");
const composeButton = document.querySelector("#compose-button");
const claudeButton = document.querySelector("#claude-button");
const openVaultButton = document.querySelector("#open-vault-button");
const addProjectButton = document.querySelector("#add-project-button");
const manageProjectsButton = document.querySelector("#manage-projects-button");
const categoryFilters = document.querySelector("#category-filters");
const toastEl = document.querySelector("#toast");
const rootQuotesButton = document.querySelector("#root-quotes-button");
const calendarButton = document.querySelector("#calendar-button");
const workspaceSidebarGroup = document.querySelector("#workspace-sidebar-group");
const siteSidebar = document.querySelector("#site-sidebar");
const mobileMenuButton = document.querySelector("#mobile-menu-button");
const mobileMenuBackdrop = document.querySelector("#mobile-menu-backdrop");
const activityLauncher = document.querySelector("#activity-launcher");
const activityModal = document.querySelector("#activity-modal");
const activityModalBackdrop = document.querySelector("#activity-modal-backdrop");
const activityModalClose = document.querySelector("#activity-modal-close");
const activityThreadList = document.querySelector("#activity-thread-list");
const activityThreadDetail = document.querySelector("#activity-thread-detail");
const appShell = document.querySelector(".shell");
const relationshipModal = document.querySelector("#relationship-modal");
const relationshipModalBackdrop = document.querySelector("#relationship-modal-backdrop");
const relationshipModalClose = document.querySelector("#relationship-modal-close");
const relationshipModalBody = document.querySelector("#relationship-modal-body");
const projectAiFillModal = document.querySelector("#project-ai-fill-modal");
const projectAiFillModalBackdrop = document.querySelector("#project-ai-fill-modal-backdrop");
const projectAiFillModalClose = document.querySelector("#project-ai-fill-modal-close");
const projectAiFillModalBody = document.querySelector("#project-ai-fill-modal-body");

const SECTION_CONNECTION_CONFIG = {
  visits: {
    title: "Visits",
    allowedCategories: ["apartments", "entries", "events"],
    helper: "Select a visit, apartment, or related event already in the vault.",
    placeholder: "Type a visit, apartment, or event",
  },
  experiences: {
    title: "Experiences",
    allowedCategories: ["entries", "events", "resources"],
    helper: "Pick an entry, event, or resource that belongs in this section.",
    placeholder: "Type an entry or event, like three apartments",
  },
  chapters: {
    title: "Chapters",
    allowedCategories: ["chapters"],
    helper: "Pick the chapter page that should connect here.",
    placeholder: "Type a chapter, like Seven Month Journey",
  },
  people: {
    title: "People",
    allowedCategories: ["people"],
    helper: "Pick a person page from this project.",
    placeholder: "Type a person, like Brice",
  },
  "people mentioned": {
    title: "People Mentioned",
    allowedCategories: ["people"],
    helper: "Pick a person page from this project.",
    placeholder: "Type a person, like Michelle Bakels",
  },
  places: {
    title: "Places",
    allowedCategories: ["places"],
    helper: "Pick a place page from this project.",
    placeholder: "Type a place, like Portobelo",
  },
  "places threads": {
    title: "Places & Threads",
    allowedCategories: ["places", "topics"],
    helper: "Pick a place or topic page connected to this note.",
    placeholder: "Type a place or topic, like Panama Canal",
  },
  food: {
    title: "Food",
    allowedCategories: ["entries", "events", "resources"],
    helper: "Pick a food-related entry, event, or resource.",
    placeholder: "Type a food note or event",
  },
  notes: {
    title: "Notes",
    allowedCategories: ["entries", "events", "resources", "topics"],
    helper: "Pick a note, event, resource, or topic page to attach here.",
    placeholder: "Type a note or topic, like Wonder And Awe",
  },
  appearances: {
    title: "Appearances",
    allowedCategories: ["entries", "events", "talks", "resources", "topics", "places"],
    helper: "Pick an appearance, note, event, topic, or place linked to this page.",
    placeholder: "Type an appearance, event, or place",
  },
  entries: {
    title: "Entries",
    allowedCategories: ["entries"],
    helper: "Pick an entry page from this project.",
    placeholder: "Type an entry title",
  },
  "linked entries": {
    title: "Linked Entries",
    allowedCategories: ["entries"],
    helper: "Pick an entry page from this project.",
    placeholder: "Type an entry title",
  },
  events: {
    title: "Events",
    allowedCategories: ["events"],
    helper: "Pick an event page from this project.",
    placeholder: "Type an event, like Tania Matus concert",
  },
  topics: {
    title: "Topics",
    allowedCategories: ["topics"],
    helper: "Pick a topic page from this project.",
    placeholder: "Type a topic, like Panama Canal",
  },
  talks: {
    title: "Talks",
    allowedCategories: ["talks"],
    helper: "Pick a talk page from this project.",
    placeholder: "Type a talk title",
  },
  resources: {
    title: "Resources",
    allowedCategories: ["resources"],
    helper: "Pick a resource page from this project.",
    placeholder: "Type a resource title",
  },
  "related talks": {
    title: "Related Talks",
    allowedCategories: ["talks"],
    helper: "Pick a talk page from this project.",
    placeholder: "Type a talk title",
  },
  "follow up": {
    title: "Follow Up",
    allowedCategories: ["topics", "entries", "events", "people", "places"],
    helper: "Pick a follow-up page connected to this note.",
    placeholder: "Type a follow-up page, like Panama Canal",
  },
};

let fullCalendarLoadPromise = null;
let calendarInstance = null;
let activityModalController = null;
let relationshipModalController = null;
let projectAiFillModalController = null;

init().catch((error) => {
  console.error(error);
  articleView.innerHTML = `<div class="empty-state"><h3>App failed to load</h3><p>${escapeHtml(error.message)}</p></div>`;
});

async function init() {
  loadClientCaches();
  const data = await fetchJson("/api/projects");
  state.projects = data.projects;
  state.projectsMtimeMs = Number(data.projectsMtimeMs || 0) || null;

  projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${escapeHtml(project.name)}">${escapeHtml(displayProjectName(project))}</option>`)
    .join("");

  overviewButton.innerHTML = `${icon("house")} Home`;
  indexButton.innerHTML = `${icon("file")} Index`;
  graphButton.innerHTML = `${icon("links")} Graph`;
  quotesButton.innerHTML = `${icon("quotes")} Quotes`;
  chaptersButton.innerHTML = `${icon("chapters")} Chapters`;
  composeButton.innerHTML = `${icon("plus")} New Entry`;
  claudeButton.innerHTML = `${icon("save")} CLAUDE.md`;
  openVaultButton.innerHTML = `${icon("obsidian")} Open Vault`;
  addProjectButton.innerHTML = `${icon("plus")} Add Project`;
  manageProjectsButton.innerHTML = `${icon("gear")} Manage Projects`;
  if (rootQuotesButton) {
    rootQuotesButton.innerHTML = `${icon("quotes")} Quotes`;
  }
  if (calendarButton) {
    calendarButton.innerHTML = `${icon("calendar")} Calendar`;
  }
  if (mobileMenuButton) {
    mobileMenuButton.innerHTML = `${icon("categories")} Menu`;
    mobileMenuButton.addEventListener("click", () => setMobileMenuOpen(!document.body.classList.contains("mobile-menu-open")));
  }
  setMobileMenuOpen(false);
  mobileMenuBackdrop?.addEventListener("click", () => setMobileMenuOpen(false));
  siteSidebar?.addEventListener("click", (event) => {
    const action = event.target.closest("a, button");
    if (!action || event.target.closest("label, input, select, textarea")) {
      return;
    }
    if (
      action.matches(".page-link, .category-filter-open") ||
      ["overview-button", "index-button", "graph-button", "quotes-button", "chapters-button", "compose-button", "claude-button"].includes(action.id)
    ) {
      setMobileMenuOpen(false);
    }
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 641px)").matches) {
      setMobileMenuOpen(false);
    }
  });
  if (activityLauncher) {
    activityLauncher.innerHTML = `${icon("gear")}<span class="activity-launcher-count">0</span>`;
    activityLauncher.addEventListener("click", openActivityCenter);
  }
  activityModalController = createModalController({
    modal: activityModal,
    backdrop: activityModalBackdrop,
    closeButton: activityModalClose,
    getIsOpen: () => state.activityModalOpen,
    setIsOpen: (open) => {
      state.activityModalOpen = open;
    },
    onRender: renderActivityCenter,
    inertElements: [appShell],
  });
  relationshipModalController = createModalController({
    modal: relationshipModal,
    backdrop: relationshipModalBackdrop,
    closeButton: relationshipModalClose,
    getIsOpen: () => state.relationshipModalOpen,
    setIsOpen: (open) => {
      state.relationshipModalOpen = open;
    },
    onBeforeClose: () => {
      state.relationshipDraft = null;
    },
    onRender: renderRelationshipModal,
    inertElements: [appShell],
  });
  projectAiFillModalController = createModalController({
    modal: projectAiFillModal,
    backdrop: projectAiFillModalBackdrop,
    closeButton: projectAiFillModalClose,
    getIsOpen: () => state.projectAiFillReviewOpen,
    setIsOpen: (open) => {
      state.projectAiFillReviewOpen = open;
    },
    onBeforeClose: () => {
      setProjectAiFillButtonsDisabled(state.projectAiFillReview?.form, false);
      state.projectAiFillReview = null;
    },
    onRender: renderProjectAiFillReviewModal,
    inertElements: [appShell],
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (document.body.classList.contains("mobile-menu-open")) {
        setMobileMenuOpen(false);
        return;
      }
      const openAutoReorganizePanel = articleView?.querySelector?.("[data-auto-reorganize-modal]:not(.hidden)")?.closest?.("[data-auto-reorganize-panel]");
      if (openAutoReorganizePanel) {
        setAutoReorganizeModalOpen(openAutoReorganizePanel, false);
      }
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (!hasUnsavedProjectConfigChanges()) {
      return;
    }
    event.preventDefault?.();
    event.returnValue = "You have unsaved project config changes.";
  });

  projectSelect.addEventListener("change", () => {
    const didNavigate = setHash(`/project/${encodeURIComponent(projectSelect.value)}/home`);
    if (!didNavigate && state.currentProject?.name) {
      projectSelect.value = state.currentProject.name;
    }
  });

  pageFilter.addEventListener("input", () => {
    renderCategoryFilters();
    renderSections();
  });
  overviewButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
  });
  indexButton.addEventListener("click", (event) => {
    event.preventDefault();
    const indexPage = findIndexPage();
    setHash(indexPage
      ? `/project/${encodeURIComponent(state.currentProject.name)}/page/${encodeURIComponent(indexPage.id)}`
      : `/project/${encodeURIComponent(state.currentProject.name)}/home`);
  });
  graphButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/graph`);
  });
  quotesButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/quotes`);
  });
  chaptersButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/chapters`);
  });
  composeButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/compose`);
  });
  claudeButton.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/claude`);
  });
  addProjectButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setHash("/projects/new");
  });
  manageProjectsButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setHash(buildManageProjectsButtonHash());
  });
  openVaultButton.addEventListener("click", (event) => {
    event.preventDefault();
    openVaultInObsidian();
  });
  rootQuotesButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await showAllQuotes();
  });
  calendarButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await showCalendar();
  });
  window.addEventListener("hashchange", () => {
    if (!confirmProjectConfigNavigation(window.location.hash || "")) {
      return;
    }
    handleHashChange().catch(renderRouteError);
  });

  const initialProject = parseHash(window.location.hash).project || state.projects[0]?.name;
  const initialRoute = parseHash(window.location.hash);
  if (!initialProject && initialRoute.view !== "projects") {
    articleView.innerHTML = `<div class="empty-state"><h3>No projects configured</h3><p>Add entries to <code>scripts/projects.json</code> to populate the browser wiki.</p></div>`;
    return;
  }

  if (initialProject) {
    await loadProject(initialProject);
  }
  await hydrateAiCreateThreads();
  await hydrateYoutubeImportThreads();
  await handleHashChange();
  state.lastAcceptedHash = window.location.hash || state.lastAcceptedHash;
  renderActivityCenter();
}

async function loadProject(projectName) {
  const loadId = ++state.activeProjectLoadId;
  const data = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/pages`);
  if (loadId !== state.activeProjectLoadId) {
    return false;
  }
  state.currentProject = data.project;
  state.pages = data.pages;
  state.sections = data.sections;
  state.todoTaskPages = new Map();
  state.graphLoadedFor = null;
  state.categoryFilter = "";
  state.currentPageId = null;
  state.currentPageMtimeMs = null;
  state.currentCategoryView = "";
  projectSelect.value = projectName;
  refreshProjectChrome();
  overviewButton.href = `#${buildProjectViewHash(projectName, "home")}`;
  graphButton.href = `#${buildProjectViewHash(projectName, "graph")}`;
  chaptersButton.href = `#${buildProjectViewHash(projectName, "chapters")}`;
  composeButton.href = `#${buildProjectViewHash(projectName, "compose")}`;
  claudeButton.href = `#${buildProjectViewHash(projectName, "claude")}`;
  quotesButton.href = `#${buildProjectViewHash(projectName, "quotes")}`;
  if (manageProjectsButton) {
    manageProjectsButton.href = `#${buildManageProjectsButtonHash(window.location.hash)}`;
  }
  const indexPage = data.pages.find((candidate) => candidate.id === "index");
  indexButton.href = indexPage
    ? `#${buildProjectViewHash(projectName, "page", indexPage.id)}`
    : `#${buildProjectViewHash(projectName, "home")}`;
  renderCategoryFilters();
  renderSections();
  return true;
}

async function handleHashChange() {
  const routeRequestId = ++state.activeRouteRequestId;
  const route = parseHash(window.location.hash);
  if (manageProjectsButton) {
    manageProjectsButton.href = `#${buildManageProjectsButtonHash(window.location.hash)}`;
  }
  if (route.view === "projects") {
    if (isReadOnlyProject()) {
      setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
      return;
    }
    await showProjectsAdmin(false);
    return;
  }
  const projectName = route.project || state.currentProject?.name;
  if (!projectName) {
    return;
  }

  if (projectName !== state.currentProject?.name) {
    const didLoad = await loadProject(projectName);
    if (!didLoad) {
      return;
    }
  }

  if (routeRequestId !== state.activeRouteRequestId) {
    return;
  }

  if (route.view === "graph") {
    await showGraph(false);
    return;
  }

  if (route.view === "quotes") {
    await showQuotes(false);
    return;
  }

  if (route.view === "all-quotes") {
    if (isReadOnlyProject()) {
      setHash(`/project/${encodeURIComponent(state.currentProject.name)}/quotes`);
      return;
    }
    await showAllQuotes(false);
    return;
  }

  if (route.view === "calendar") {
    if (isReadOnlyProject() || state.currentProject?.hideCalendar) {
      setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
      return;
    }
    await showCalendar(false);
    return;
  }

  if (route.view === "compose") {
    showComposer(false);
    return;
  }

  if (route.view === "chapters") {
    await showChapters(false);
    return;
  }

  if (route.view === "claude") {
    if (isReadOnlyProject()) {
      setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
      return;
    }
    await showClaudeEditor(false);
    return;
  }

  if (route.view === "home") {
    await showHome(false);
    return;
  }

  if (route.view === "places-by-country") {
    await showPlacesByCountry(route.country, false);
    return;
  }

  if (route.view === "category") {
    await showCategoryLanding(route.category, false);
    return;
  }

  if (!route.page && !route.view) {
    await showHome(false);
    return;
  }

  const pageId = route.page || findDefaultPageId();
  if (pageId) {
    if (
      pageId === state.currentPageId &&
      state.currentView === "page" &&
      state.currentProject?.name === projectName
    ) {
      return;
    }
    await openPage(pageId, false);
  }
}

async function openPage(pageId, updateHash = true) {
  const requestId = beginViewRequest();
  const projectName = state.currentProject.name;
  const data = await fetchJson(
    `/api/projects/${encodeURIComponent(projectName)}/page?id=${encodeURIComponent(pageId)}`
  );
  if (!isActiveViewRequest(requestId, projectName)) {
    return;
  }

  state.currentView = "page";
  state.currentCategoryView = "";
  state.currentPageId = pageId;
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const { page } = data;
  state.currentPageMtimeMs = Number(page.mtimeMs || 0) || null;
  const showResummarize = page.category === "topics" && Boolean(page.autoSummaryStale);
  state.pageHeroActions = `
    <div class="page-toolbar hero-toolbar">
      <button id="toggle-mini-graph" class="ghost-button inline-action icon-button" type="button" aria-expanded="false" aria-controls="mini-graph-surface">
        ${icon("links")} Graph
      </button>
      ${showResummarize && !isReadOnlyProject() ? `
        <button id="force-resummarize-topic" class="ghost-button inline-action icon-button" type="button" data-page-id="${escapeHtml(page.id)}">
          ${icon("reload")} Resummarize
        </button>
      ` : ""}
      ${!isReadOnlyProject() ? `
      <button id="toggle-edit-surface" class="ghost-button inline-action icon-button" type="button" aria-expanded="false" aria-controls="edit-surface">
        ${icon("pen")} Edit
      </button>
      ` : ""}
    </div>
  `;
  renderHero({
    kicker: page.category,
    title: page.title,
    description: page.excerpt,
    meta: [
      metaPill("file", page.wikiPath),
      ...(page.source?.audioFound ? [metaPill("audio", "recording attached")] : []),
      ...(page.source?.transcriptFound ? [metaPill("transcript", "transcript attached")] : []),
      ...(!isReadOnlyProject() ? [metaLink("Open page", page.obsidianPageUrl, icon("obsidian"))] : []),
    ],
  });

  articleView.innerHTML = renderArticle(page);
  resetViewportTop();
  wireDynamicUi();
  enhanceRelationshipSections(page);
  populateArticleContents();
  highlightActivePage();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/page/${encodeURIComponent(pageId)}`);
  }
}

async function showGraph(updateHash = true) {
  const requestId = beginViewRequest();
  const projectName = state.currentProject.name;
  state.currentView = "graph";
  state.currentCategoryView = "";
  state.pageHeroActions = "";
  graphView.classList.remove("hidden");
  articleView.classList.add("hidden");
  renderHero({
    kicker: "Graph",
    title: `${displayProjectName(state.currentProject)} mind map`,
    description: state.currentProject.description,
    meta: [
      metaPill("links", "wikilinks"),
      metaPill("scan", "live filesystem scan"),
      ...(!isReadOnlyProject() ? [metaLink("Open vault", state.currentProject.obsidianVaultUrl, icon("obsidian"))] : []),
    ],
  });

  if (state.graphLoadedFor !== projectName) {
    const data = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/graph`);
    if (!isActiveViewRequest(requestId, projectName)) {
      return;
    }
    renderGraph(data.nodes, data.links);
    state.graphLoadedFor = projectName;
  }

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/graph`);
  }
}

async function showQuotes(updateHash = true) {
  state.currentView = "quotes";
  state.currentCategoryView = "";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson(`/api/projects/${encodeURIComponent(state.currentProject.name)}/quotes`);
  state.quotes = data.quotes;

  renderHero({
    kicker: "Quotes",
    title: `${displayProjectName(state.currentProject)} quotes`,
    description: isReadOnlyProject()
      ? "Project-specific AIE Wiki quotes from the public transcript wiki."
      : "Project-local quotes only. The root quote book remains available as a separate hub link.",
    meta: [metaPill("quotes", `${state.quotes.length} captured`)],
  });

  const filtered = state.quotes.filter((quote) => {
    const query = pageFilter.value.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return `${quote.text} ${quote.speaker} ${quote.project} ${quote.tags.join(" ")}`.toLowerCase().includes(query);
  });

  articleView.innerHTML = `
    <section class="quotes-grid">
      ${filtered.map(renderQuoteCard).join("") || `<div class="empty-state"><p>No quotes matched that filter.</p></div>`}
    </section>
  `;
  resetViewportTop();
  wireDynamicUi();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/quotes`);
  }
}

async function showAllQuotes(updateHash = true) {
  state.currentView = "all-quotes";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson("/api/quotes");
  state.quotes = data.quotes;

  renderHero({
    kicker: "Quotes",
    title: "Quotes",
    description: "The root quote book only. Project-level quote pages stay separate.",
    meta: [metaPill("quotes", `${state.quotes.length} captured`)],
  });

  renderRootQuotesPage("");

  if (updateHash) {
    setHash("/quotes");
  }
}

async function showCalendar(updateHash = true) {
  state.currentView = "calendar";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson("/api/calendar");
  const calendar = data.calendar;

  renderHero({
    kicker: "Calendar",
    title: "Calendar",
    description: calendar.intro || "Timeline across projects.",
    meta: [
      ...(calendar.updated ? [metaPill("calendar", calendar.updated)] : []),
      metaPill("months", `${calendar.months.length} month groups`),
    ],
  });

  articleView.innerHTML = `
    <section class="calendar-shell">
      <div class="calendar-toolbar">
        <div class="calendar-meta">
          <span class="calendar-meta-pill">${icon("file")} ${escapeHtml(String(flattenCalendarEntries(calendar).length))} dated notes</span>
          <span class="calendar-meta-pill">${icon("folder")} ${escapeHtml(String(countCalendarProjects(calendar)))} projects</span>
        </div>
        <p class="calendar-note">Built directly from <code>calendar.md</code>. Click an event to open its source page.</p>
      </div>
      <div id="calendar-widget" class="calendar-frame"></div>
    </section>
  `;
  await renderCalendarWidget(calendar);

  if (updateHash) {
    setHash("/calendar");
  }
}

async function showProjectsAdmin(updateHash = true) {
  state.currentView = "projects";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const [projectsData, templatesData] = await Promise.all([
    fetchJson("/api/projects"),
    fetchJson("/api/project-templates"),
  ]);
  state.projects = projectsData.projects || [];
  state.projectTemplates = templatesData.templates || [];
  projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${escapeHtml(project.name)}">${escapeHtml(displayProjectName(project))}</option>`)
    .join("");
  if (state.currentProject?.name && state.projects.some((project) => project.name === state.currentProject.name)) {
    projectSelect.value = state.currentProject.name;
  }

  renderHero({
    kicker: "Workspace",
    title: "Projects",
    description: "Create new vault-backed projects, tune filing guidance, and review or remove existing projects.",
    meta: [
      metaPill("projects", String(state.projects.length)),
      metaPill("templates", String(state.projectTemplates.length)),
    ],
  });

  articleView.innerHTML = renderProjectsAdmin();
  resetViewportTop();
  wireDynamicUi();

  if (updateHash) {
    setHash("/projects");
  }
}

async function renderCalendarWidget(calendar) {
  const mount = articleView.querySelector("#calendar-widget");
  if (!mount) {
    return;
  }

  const events = flattenCalendarEntries(calendar);
  if (!events.length) {
    mount.innerHTML = `<div class="empty-state"><p>No calendar data found.</p></div>`;
    return;
  }

  try {
    await ensureFullCalendar();
  } catch (error) {
    mount.innerHTML = `<div class="empty-state"><h3>Calendar failed to load</h3><p>${escapeHtml(error.message)}</p></div>`;
    return;
  }

  if (calendarInstance) {
    calendarInstance.destroy();
    calendarInstance = null;
  }

  const initialDate = findCalendarInitialDate(events);
  const Calendar = window.FullCalendar?.Calendar;
  if (!Calendar) {
    mount.innerHTML = `<div class="empty-state"><h3>Calendar unavailable</h3><p>FullCalendar did not initialize in the browser.</p></div>`;
    return;
  }

  calendarInstance = new Calendar(mount, {
    initialView: "dayGridMonth",
    initialDate,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,listMonth",
    },
    height: "auto",
    fixedWeekCount: false,
    dayMaxEvents: 4,
    navLinks: true,
    events,
    eventClick(info) {
      info.jsEvent.preventDefault();
      const { project, pageId } = info.event.extendedProps || {};
      if (!project || !pageId) {
        return;
      }
      openCalendarEvent(project, pageId);
    },
    eventContent(arg) {
      const kind = String(arg.event.extendedProps.kind || "");
      const title = kind === "birthday" ? `Birthday: ${arg.event.title}` : arg.event.title;
      return {
        html: `
          <div class="fc-event-card">
            <span class="fc-event-title">${escapeHtml(title)}</span>
            ${arg.event.extendedProps.project ? `<span class="fc-event-project">${escapeHtml(formatProjectName(arg.event.extendedProps.project || ""))}</span>` : ""}
          </div>
        `,
      };
    },
  });
  calendarInstance.render();
}

function flattenCalendarEntries(calendar) {
  return (calendar.months || []).flatMap((month) =>
    (month.days || []).flatMap((day) =>
      (day.entries || []).map((entry, index) => ({
        id: `${day.date}-${entry.project}-${entry.pageId}-${index}`,
        title: entry.title,
        start: day.date,
        allDay: true,
        classNames: [`calendar-project-${slugify(entry.project || "project")}`],
        backgroundColor: projectAccent(entry.project),
        borderColor: projectAccent(entry.project),
        textColor: "#ffffff",
        extendedProps: {
          project: entry.project,
          pageId: entry.pageId,
          kind: entry.kind,
        },
      }))
    )
  );
}

function countCalendarProjects(calendar) {
  return new Set(flattenCalendarEntries(calendar).map((entry) => entry.extendedProps.project).filter(Boolean)).size;
}

function findCalendarInitialDate(events) {
  const sorted = [...events].sort((left, right) => String(right.start).localeCompare(String(left.start)));
  return sorted[0]?.start || new Date().toISOString().slice(0, 10);
}

async function ensureFullCalendar() {
  if (window.FullCalendar?.Calendar) {
    return;
  }

  if (!fullCalendarLoadPromise) {
    fullCalendarLoadPromise = loadScriptOnce(
      "fullcalendar-js",
      "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js"
    );
  }

  await fullCalendarLoadPromise;
}

function loadScriptOnce(id, src) {
  const existing = document.getElementById(id);
  if (existing) {
    if (window.FullCalendar?.Calendar) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load calendar script.")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load calendar script.")), { once: true });
    document.head.append(script);
  });
}

async function openCalendarEvent(projectName, pageId) {
  if (projectName !== state.currentProject?.name) {
    await loadProject(projectName);
  }
  await openPage(pageId);
}

function renderRootQuotesPage(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const filtered = state.quotes.filter((quote) => {
    if (!normalizedQuery) {
      return true;
    }

    return `${quote.text} ${quote.speaker} ${quote.project} ${quote.tags.join(" ")}`.toLowerCase().includes(normalizedQuery);
  });

  articleView.innerHTML = `
    <section class="editor-panel">
      <label class="field">
        <span>Search the root quote book</span>
        <input id="root-quotes-filter" type="search" value="${escapeHtml(query)}" placeholder="Search text, speaker, tags" />
      </label>
    </section>
    <section class="quotes-grid">
      ${filtered.map(renderQuoteCard).join("") || `<div class="empty-state"><p>No quotes matched that filter.</p></div>`}
    </section>
  `;
  resetViewportTop();
  wireDynamicUi();

  const filterInput = articleView.querySelector("#root-quotes-filter");
  if (filterInput) {
    filterInput.addEventListener("input", () => {
      renderRootQuotesPage(filterInput.value);
    });
  }
}

async function showChapters(updateHash = true) {
  const requestId = beginViewRequest();
  const projectName = state.currentProject.name;
  state.currentView = "chapters";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/chapters`);
  if (!isActiveViewRequest(requestId, projectName)) {
    return;
  }
  const chapters = data.chapters?.chapters || [];
  const locations = data.chapters?.locations || [];

  renderHero({
    kicker: "Chapters",
    title: displayProjectName(state.currentProject),
    description: chapters.length
      ? "Built from chapters.json, chapter pages, and entry assignments."
      : "This vault does not define chapters yet.",
    meta: [
      metaPill("chapters", `${chapters.length} chapters`),
      ...(!isReadOnlyProject() ? [metaLink("Open vault", state.currentProject.obsidianVaultUrl, icon("obsidian"))] : []),
    ],
  });

  articleView.innerHTML = chapters.length
    ? `
      <section class="timeline-strip">
        ${chapters.map(renderChapterTimelineItem).join("")}
      </section>
      <section class="chapters-grid">${chapters.map(renderChapterCard).join("")}</section>
    `
    : `<div class="empty-state"><p>No chapter registry found for this project.</p></div>`;

  resetViewportTop();
  wireDynamicUi();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/chapters`);
  }
}

async function showHome(updateHash = true) {
  const requestId = beginViewRequest();
  const projectName = state.currentProject.name;
  const homePerf = projectName === "voice-diary" ? createVoiceDiaryHomePerf(requestId) : null;
  state.voiceDiaryHomePerf = homePerf;
  state.currentView = "home";
  state.currentCategoryView = "";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");
  articleView.innerHTML = `<div class="empty-state compact"><p>Loading home…</p></div>`;

  const homeContextStartedAt = performance.now();
  const homeContext = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/home-context`);
  if (homePerf) {
    homePerf.sample.homeContextMs = Number((performance.now() - homeContextStartedAt).toFixed(1));
  }
  if (!isActiveViewRequest(requestId, projectName)) {
    return;
  }

  if (String(state.currentProject?.genre || "").trim().toLowerCase() === "to-do-list") {
    await loadTodoTaskHomePages(requestId);
    if (!isActiveViewRequest(requestId, projectName)) {
      return;
    }
  } else {
    state.todoTaskPages = new Map();
  }

  renderHero({
    kicker: "Home",
    title: displayProjectName(state.currentProject),
    description: projectName === "voice-diary"
      ? buildVoiceDiaryHeroDescription(homeContext?.diary?.stats || null)
      : state.currentProject.description || "",
    meta: [
      ...(projectName === "voice-diary"
        ? buildVoiceDiaryHeroMeta(homeContext?.diary?.stats || null)
        : [
            metaPill("file", `${state.pages.length} pages`),
            metaPill("categories", `${getManagedProjectCategories().length} categories`),
          ]),
      ...(state.currentProject.primaryUrl
        ? [metaLink(state.currentProject.primaryLabel || "Conference website reference", state.currentProject.primaryUrl, icon("links"))]
        : []),
      ...(!isReadOnlyProject() ? [metaLink("Open vault", state.currentProject.obsidianVaultUrl, icon("obsidian"))] : []),
    ],
  });

  if (projectName === "voice-diary") {
    articleView.innerHTML = renderVoiceDiaryHome(
      homeContext?.landingPage,
      homeContext?.diary?.chapters || [],
      homeContext?.diary?.locations || [],
      homeContext?.diary || {}
    );
  } else {
    articleView.innerHTML = renderProjectHome(homeContext?.landingPage, homeContext?.sourceContext || null);
  }
  if (homePerf) {
    markVoiceDiaryHomePerf(homePerf, "homeShellReadyMs");
    window.requestAnimationFrame(() => {
      if (!isActiveViewRequest(requestId, projectName)) {
        return;
      }
      markVoiceDiaryHomePerf(homePerf, "homeShellPaintMs");
    });
  }
  resetViewportTop();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
  }

  wireDynamicUi();
  if (projectName === "voice-diary" && (homeContext?.diary?.locations || []).length) {
    scheduleVoiceDiaryHomeMapRender(
      homeContext.diary.locations,
      { requestId, projectName, chapterStats: homeContext.diary.stats || null, perf: homePerf }
    );
  }
}

function renderRouteError(error) {
  console.error(error);
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");
  articleView.innerHTML = `<div class="empty-state"><h3>View failed to load</h3><p>${escapeHtml(error.message)}</p></div>`;
}

function showComposer(updateHash = true) {
  if (isReadOnlyProject()) {
    showToast(`${displayProjectName(state.currentProject)} is read-only`);
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/home`);
    return;
  }
  state.currentView = "compose";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");
  const prefill = readComposePrefill();
  const isPersonDraft = prefill?.category === "people" && prefill?.personName;

  renderHero({
    kicker: "Create",
    title: isPersonDraft
      ? `Create a people page for ${prefill.personName}`
      : `Add content to ${displayProjectName(state.currentProject)}`,
    description: isPersonDraft
      ? "The draft is preloaded with conference source context and local evidence so you can create a proper person page instead of a generic new entry."
      : "Create a page manually or drop in an image and let AI draft the title and page content for you.",
    meta: [
      metaPill("categories", `${getManagedProjectCategories().length} categories`),
      ...(isPersonDraft ? [metaPill("prefill", "people draft")] : []),
      metaLink("Open vault", state.currentProject.obsidianVaultUrl, icon("obsidian")),
    ],
  });

  articleView.innerHTML = renderComposer(prefill);
  resetViewportTop();
  wireDynamicUi();
  applyComposePrefill();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/compose`);
  }
}

async function showClaudeEditor(updateHash = true) {
  state.currentView = "claude";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson(`/api/projects/${encodeURIComponent(state.currentProject.name)}/claude`);
  const instructionsFilename = data.filename || state.currentProject.instructionsFilename || "CLAUDE.md";
  state.currentPageMtimeMs = Number(data.mtimeMs || 0) || null;
  renderHero({
    kicker: "Config",
    title: `${displayProjectName(state.currentProject)} ${instructionsFilename}`,
    description: isReadOnlyProject()
      ? "Read-only project guidance for the public transcript wiki."
      : "Edit the live vault instructions directly from the browser.",
    meta: [
      metaPill("file", instructionsFilename),
      ...(!isReadOnlyProject() ? [metaLink("Open in app", data.obsidianUrl, icon("obsidian"))] : []),
    ],
  });

  articleView.innerHTML = `
    <section class="editor-panel">
      <div class="card-header">
        <p class="eyebrow">Instructions</p>
        <h3>${escapeHtml(data.path)}</h3>
      </div>
      <form id="claude-form" class="editor-form">
        <textarea name="content" class="code-editor" ${isReadOnlyProject() ? "readonly" : ""}>${escapeHtml(data.content)}</textarea>
        <div class="rename-actions">
          ${!isReadOnlyProject() ? `<button type="submit" class="primary-button">${icon("save")} Save ${escapeHtml(instructionsFilename)}</button>` : ""}
          ${!isReadOnlyProject() ? `<a class="ghost-button inline-action" href="${data.obsidianUrl}">${icon("obsidian")} Open in app</a>` : ""}
        </div>
      </form>
      ${renderAiEditPanel({ targetType: "claude", heading: "AI Edit", description: "Describe the change and Codex will update this vault's CLAUDE.md for you." })}
    </section>
  `;
  resetViewportTop();
  wireDynamicUi();

  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/claude`);
  }
}

async function showCategoryLanding(category, updateHash = true) {
  const normalized = String(category || "").trim().toLowerCase();
  if (normalized === "quotes" && !state.pages.some((page) => page.category === "quotes")) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/quotes`);
    return;
  }
  const pages = state.pages
    .filter((page) => page.category === normalized)
    .sort((a, b) => a.title.localeCompare(b.title));
  const emptyStateCopy = buildCategoryEmptyStateCopy(normalized);
  const isTodoTaskCategory = String(state.currentProject?.genre || "").trim().toLowerCase() === "to-do-list" && normalized === "tasks";
  const readOnly = isReadOnlyProject();

  state.currentView = "category";
  state.currentCategoryView = normalized;
  state.categoryFilter = normalized;
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");
  renderCategoryFilters();
  renderSections();

  renderHero({
    kicker: "Category",
    title: formatProjectName(normalized),
    description: `${pages.length} ${pages.length === 1 ? "page" : "pages"} in ${displayProjectName(state.currentProject)}.`,
    meta: [
      metaPill(getCategoryIconName(normalized), normalized),
      metaPill("pages", String(pages.length)),
      metaLink("Back home", `#/project/${encodeURIComponent(state.currentProject.name)}/home`, icon("house")),
    ],
  });

  articleView.innerHTML = pages.length
    ? isTodoTaskCategory
      ? renderTodoTaskCategoryLanding(pages, normalized)
      : normalized === "talks"
        ? renderTalkCategoryLanding(pages)
      : `
        <section class="home-panel">
          <div class="card-header card-header-with-action">
            <div>
              <p class="eyebrow">${icon(getCategoryIconName(normalized))} ${escapeHtml(normalized)}</p>
              <h3>${escapeHtml(formatProjectName(normalized))}</h3>
            </div>
            ${!readOnly ? `<button class="ghost-button inline-action subtle-link home-open-view" data-view="compose" data-category="${escapeHtml(normalized)}">${icon("plus")} New ${escapeHtml(singularizeCategoryLabel(normalized))}</button>` : ""}
          </div>
          <div class="related-grid">
            ${pages.map((page) => `
              <button class="link-card home-open-page" data-page-id="${escapeHtml(page.id)}">
                <strong>${escapeHtml(page.title)}</strong>
                <span>${escapeHtml(page.byline || page.excerpt || page.wikiPath)}</span>
              </button>
            `).join("")}
          </div>
        </section>
      `
    : `
      <div class="empty-state">
        <p>${escapeHtml(emptyStateCopy.emptyMessage)}</p>
        ${!readOnly ? `<p><button class="primary-button inline-action home-open-view" data-view="compose" data-category="${escapeHtml(normalized)}">${icon("plus")} ${escapeHtml(emptyStateCopy.createLabel)}</button></p>` : ""}
      </div>
    `;

  resetViewportTop();
  wireDynamicUi();
  if (updateHash) {
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/category/${encodeURIComponent(normalized)}`);
  }
}

function renderTalkCategoryLanding(pages) {
  const grouped = groupTalkPagesByDate(pages);
  return `
    <section class="category-day-list">
      ${grouped.map((group) => `
        <section class="home-panel category-day-group">
          <div class="card-header">
            <p class="eyebrow">${escapeHtml(group.dateLabel)}</p>
            <h3>${escapeHtml(group.title)}</h3>
            <p class="muted">${group.pages.length} ${group.pages.length === 1 ? "talk" : "talks"}</p>
          </div>
          <div class="related-grid">
            ${group.pages.map((page) => `
              <button class="link-card home-open-page" data-page-id="${escapeHtml(page.id)}">
                <strong>${escapeHtml(page.title)}</strong>
                <span>${escapeHtml(page.excerpt || page.wikiPath)}</span>
              </button>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </section>
  `;
}

function groupTalkPagesByDate(pages) {
  const groups = new Map();
  for (const page of pages) {
    const date = String(page.id || page.wikiPath || "").match(/\b(2026-04-20|2026-04-21)\b/)?.[1] || "";
    const key = date || "unscheduled";
    const current = groups.get(key) || [];
    current.push(page);
    groups.set(key, current);
  }
  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupPages]) => ({
      title: date === "2026-04-20" ? "Day 1" : date === "2026-04-21" ? "Day 2" : "Schedule date unavailable",
      dateLabel: date === "unscheduled" ? "Talks" : formatDateLabel(date),
      pages: groupPages.sort((left, right) => left.title.localeCompare(right.title)),
    }));
}

function renderTodoTaskCategoryLanding(pages, category) {
  return `
    <section class="home-panel task-list-panel">
      <div class="card-header card-header-with-action">
        <div>
          <p class="eyebrow">${icon(getCategoryIconName(category))} Task list</p>
          <h3>${escapeHtml(formatProjectName(category))}</h3>
        </div>
        ${!isReadOnlyProject() ? `<button class="primary-button inline-action home-open-view" data-view="compose" data-category="${escapeHtml(category)}">${icon("plus")} New task</button>` : ""}
      </div>
      <div class="task-list task-list-expanded">
        ${pages.map((page) => `
          <button class="task-list-item home-open-page" data-page-id="${escapeHtml(page.id)}">
            <div class="task-list-item-top">
              <span class="task-list-item-check">${icon("check-circle")}</span>
              <strong>${escapeHtml(page.title)}</strong>
              ${page.byline ? `<small>${escapeHtml(page.byline)}</small>` : ""}
            </div>
            <span>${escapeHtml(page.excerpt || page.wikiPath || "")}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function buildCategoryEmptyStateCopy(category) {
  const normalized = String(category || "").trim().toLowerCase();
  const displayName = normalized || "pages";
  const singularName = singularizeCategoryLabel(displayName);
  return {
    emptyMessage: `No ${displayName} found yet.`,
    createLabel: `Create first ${singularName}`,
  };
}

function singularizeCategoryLabel(category) {
  const normalized = String(category || "").trim().toLowerCase();
  if (!normalized) {
    return "page";
  }
  const irregular = {
    people: "person",
    entries: "entry",
    categories: "category",
  };
  if (irregular[normalized]) {
    return irregular[normalized];
  }
  if (normalized.endsWith("ies") && normalized.length > 3) {
    return `${normalized.slice(0, -3)}y`;
  }
  if (normalized.endsWith("s") && !normalized.endsWith("ss")) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

async function showPlacesByCountry(country, updateHash = true) {
  const requestId = beginViewRequest();
  const projectName = state.currentProject.name;
  const normalizedCountry = String(country || "").trim();
  if (!normalizedCountry) {
    articleView.innerHTML = `<div class="empty-state"><p>No country was provided.</p></div>`;
    return;
  }

  state.currentView = "places-by-country";
  state.pageHeroActions = "";
  graphView.classList.add("hidden");
  articleView.classList.remove("hidden");

  const data = await fetchJson(
    `/api/projects/${encodeURIComponent(state.currentProject.name)}/places-by-country?country=${encodeURIComponent(normalizedCountry)}`
  );
  if (!isActiveViewRequest(requestId, projectName)) {
    return;
  }

  renderHero({
    kicker: "Places",
    title: `Places in ${normalizedCountry}`,
    description: "Country-level fallback for map markers when the vault has city/place pages but not a dedicated country page.",
    meta: [metaPill("places", `${data.places.length} place pages`)],
  });

  articleView.innerHTML = `
    <section class="card-stack">
      <div class="card-header">
        <p class="eyebrow">Country</p>
        <h3>${escapeHtml(normalizedCountry)}</h3>
      </div>
      <div class="related-grid">
        ${data.places.length ? data.places.map((place) => linkCard(place)).join("") : `<div class="empty-card">No place pages in this vault are tagged with <strong>${escapeHtml(normalizedCountry)}</strong> yet.</div>`}
      </div>
    </section>
  `;
  resetViewportTop();
  wireDynamicUi();

  if (updateHash) {
    setHash(buildCountryPlacesHash(state.currentProject.name, normalizedCountry));
  }
}

function renderSections() {
  const query = pageFilter.value.trim().toLowerCase();
  let visiblePageCount = 0;
  let visibleSectionCount = 0;
  const markup = state.sections
    .map((section) => {
      if (state.categoryFilter && section.name !== state.categoryFilter) {
        return "";
      }

      const pages = section.pages.filter((page) => matchesPage(page, query));
      if (!pages.length) {
        return "";
      }
      visiblePageCount += pages.length;
      visibleSectionCount += 1;

      return `
        <section class="section-group category-accent" data-category="${escapeHtml(section.name)}">
          <h3>${escapeHtml(section.name)} <span class="section-count">${pages.length}</span></h3>
          <ul>
            ${pages
              .map(
                (page) => `
                  <li>
                    <button class="page-link category-accent" data-page-id="${escapeHtml(page.id)}" data-category="${escapeHtml(page.category || section.name)}">
                      <strong>${escapeHtml(page.title)}</strong>
                      <span>${escapeHtml(page.excerpt || page.wikiPath)}</span>
                    </button>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>
      `;
    })
    .join("");

  sectionsEl.innerHTML = markup || `<div class="empty-state compact"><p>No pages matched that filter.</p></div>`;
  if (pageFilterStatus) {
    const pageLabel = visiblePageCount === 1 ? "page" : "pages";
    const sectionLabel = visibleSectionCount === 1 ? "section" : "sections";
    pageFilterStatus.textContent = `${visiblePageCount} ${pageLabel} in ${visibleSectionCount} ${sectionLabel}`;
  }

  sectionsEl.querySelectorAll("[data-page-id]").forEach((button) => {
    button.addEventListener("click", () => openPage(button.dataset.pageId));
  });

  highlightActivePage();
}

function renderCategoryFilters() {
  const categories = ["all", ...getSidebarFilterCategories()];
  const counts = getSidebarFilterCategoryCounts();
  categoryFilters.innerHTML = categories
    .map((category) => {
      const active = (state.categoryFilter || "all") === category;
      const isCurrentCategoryView = state.currentView === "category" && state.currentCategoryView === category;
      const count = counts.get(category) || 0;
      if (category === "all") {
        return `
          <span class="category-filter-item">
            <button class="filter-chip ${active ? "active" : ""}" data-category="${escapeHtml(category)}" title="Show all pages in the sidebar" ${active ? 'aria-current="page"' : ""}>
              All <span class="filter-chip-count">${count}</span>
            </button>
          </span>
        `;
      }
      return `
        <span class="category-filter-item category-filter-split category-accent ${active || isCurrentCategoryView ? "active" : ""}" data-category="${escapeHtml(category)}">
          <button class="filter-chip category-filter-main ${active || isCurrentCategoryView ? "active" : ""}" data-category="${escapeHtml(category)}" aria-label="Filter sidebar to ${escapeHtml(category)} pages" title="Filter sidebar to ${escapeHtml(category)} pages" ${isCurrentCategoryView ? 'aria-current="page"' : ""}>
            ${icon(getCategoryIconName(category))} ${escapeHtml(category)} <span class="filter-chip-count">${count}</span>
          </button>
          <button class="category-filter-open ${isCurrentCategoryView ? "active" : ""}" type="button" aria-label="Open ${escapeHtml(category)} in main view" title="Open ${escapeHtml(category)}" data-open-category="${escapeHtml(category)}" ${isCurrentCategoryView ? 'aria-current="page"' : ""}>
            ${icon("arrow-out")}
          </button>
        </span>
      `;
    })
    .join("");

  categoryFilters.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.categoryFilter = button.dataset.category === "all" ? "" : button.dataset.category;
      renderCategoryFilters();
      renderSections();
    });
  });

  categoryFilters.querySelectorAll("[data-open-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = String(button.dataset.openCategory || "").trim();
      if (category) {
        showCategoryLanding(category);
      }
    });
  });

  updateNavigationActiveState();
}

function getSidebarFilterCategories() {
  const pageCategories = new Set(state.pages.map((page) => page.category));
  return getManagedProjectCategories()
    .filter((category) => category !== "quotes" || pageCategories.has("quotes"));
}

function getSidebarFilterCategoryCounts() {
  const query = pageFilter.value.trim().toLowerCase();
  const sidebarCategories = new Set(getSidebarFilterCategories());
  const counts = new Map([["all", 0]]);
  for (const category of sidebarCategories) {
    counts.set(category, 0);
  }
  for (const section of state.sections) {
    for (const page of section.pages) {
      if (!matchesPage(page, query)) {
        continue;
      }
      counts.set("all", (counts.get("all") || 0) + 1);
      if (sidebarCategories.has(page.category)) {
        counts.set(page.category, (counts.get(page.category) || 0) + 1);
      }
    }
  }
  return counts;
}

function renderArticle(page) {
  const metaChips = renderIntroMetaChips(page);
  const articleHtml = stripDuplicateArticleTitle(page.html || "", page.title || "");

  const imageBlock = page.image && !page.html.includes("<img")
    ? `
      <figure class="cover-media">
        <img src="${page.image.url}" alt="${escapeHtml(page.title)}" />
      </figure>
    `
    : "";

  const connectedPages = buildConnectedPages(page);

  const chapterPlaces = page.chapterInfo?.locationDetails?.length
    ? `
      <section class="card-stack">
        <div class="card-header">
          <p class="eyebrow">Places Mentioned</p>
          <h3>Locations in this chapter</h3>
        </div>
        <div class="location-grid">
          ${page.chapterInfo.locationDetails.map(renderLocationCard).join("")}
        </div>
      </section>
    `
    : "";

  const pageEditor = page.category === "people"
    ? renderPersonEditWorkspace(page)
    : renderEntityEditWorkspace(page);

  return `
    <div class="article-shell">
      <section class="intro-card">
        <div class="intro-card-topline">
          <div class="meta-row">
            ${metaChips}
          </div>
        </div>
      </section>
      <section id="mini-graph-surface" class="mini-graph-surface hidden">
        <div class="card-header">
          <p class="eyebrow">Graph</p>
          <h3>Nearby connections around this page</h3>
        </div>
        <p class="muted">Center node plus direct neighbors and their immediate neighbors only.</p>
        <div id="mini-graph-canvas" class="mini-graph-canvas">
          <div class="empty-state compact"><p>Open graph to load connections.</p></div>
        </div>
        <div id="mini-graph-list" class="mini-graph-list"></div>
      </section>
      <section id="edit-surface" class="edit-surface hidden">
        ${renderRenamePanel(page)}
        ${pageEditor}
      </section>
      ${imageBlock}
      <nav id="article-contents" class="article-contents hidden" aria-label="Article sections"></nav>
      <article class="prose">${articleHtml}</article>
      ${renderPersonEvidencePanel(page)}
      ${renderConnectedPages(connectedPages)}
      ${renderResearchPanel(page)}
      ${chapterPlaces}
      ${renderSourcePanel(page.source)}
    </div>
  `;
}

function stripDuplicateArticleTitle(html = "", title = "") {
  const expected = normalizeTextForComparison(title);
  if (!expected || !String(html || "").trim().startsWith("<h1")) {
    return html;
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const firstElement = template.content.firstElementChild;
  if (firstElement?.tagName !== "H1") {
    return html;
  }
  if (normalizeTextForComparison(firstElement.textContent) !== expected) {
    return html;
  }
  firstElement.remove();
  return template.innerHTML;
}

function normalizeTextForComparison(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function populateArticleContents() {
  const container = articleView.querySelector("#article-contents");
  const headings = Array.from(articleView.querySelectorAll(".prose h2, .prose h3"))
    .filter((heading) => String(heading.textContent || "").trim());
  if (!container || headings.length < 3) {
    container?.classList.add("hidden");
    return;
  }

  const usedIds = new Set();
  const links = headings.map((heading, index) => {
    const label = String(heading.textContent || "").trim();
    const baseId = heading.id || `section-${slugify(label) || index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    heading.id = id;
    return `
      <a class="article-contents-link ${heading.tagName === "H3" ? "nested" : ""}" href="#${escapeHtml(id)}">
        ${escapeHtml(label)}
      </a>
    `;
  }).join("");

  container.innerHTML = `
    <p class="eyebrow">On This Page</p>
    <div class="article-contents-list">${links}</div>
  `;
  container.classList.remove("hidden");
}

function renderIntroMetaChips(page) {
  const aliases = Array.isArray(page.aliases) ? page.aliases : [];
  if (page.category === "people") {
    return renderPersonIntroMetaChips(page);
  }

  const frontmatterLines = Object.entries(page.frontmatter || {})
    .filter(([key]) => key !== "aliases" && key !== "type")
    .map(
      ([key, value]) => `
        <div class="meta-chip">
          <span>${escapeHtml(humanizeMetaKey(key))}</span>
          ${renderFrontmatterValue(value)}
        </div>
      `
    )
    .join("");

  return `
    <div class="meta-chip"><span>Category</span><strong>${escapeHtml(page.category)}</strong></div>
    ${page.entityType && page.entityType !== page.category ? `<div class="meta-chip"><span>Entity Type</span><strong>${escapeHtml(page.entityType)}</strong></div>` : ""}
    ${page.byline ? `<div class="meta-chip"><span>Context</span><strong>${escapeHtml(page.byline)}</strong></div>` : ""}
    ${aliases.length ? `<div class="meta-chip"><span>Aliases</span><strong>${escapeHtml(aliases.join(", "))}</strong></div>` : ""}
    ${frontmatterLines || `<div class="meta-chip"><span>Path</span><strong>${escapeHtml(page.wikiPath)}</strong></div>`}
  `;
}

function renderPersonIntroMetaChips(page) {
  const frontmatter = page.frontmatter || {};
  const chips = [];
  const normalizePlaceholderValue = (value) => {
    const text = String(value || "").trim();
    return text || "";
  };
  const isUnknownPlaceholder = (value) => {
    return normalizePlaceholderValue(value).toLowerCase() === "unknown";
  };
  const nationalityFlag = (value) => {
    const normalized = normalizePlaceholderValue(value).toLowerCase();
    const flags = {
      american: "🇺🇸",
      argentinian: "🇦🇷",
      argentine: "🇦🇷",
      australian: "🇦🇺",
      austrian: "🇦🇹",
      belgian: "🇧🇪",
      brazilian: "🇧🇷",
      british: "🇬🇧",
      canadian: "🇨🇦",
      chinese: "🇨🇳",
      colombian: "🇨🇴",
      croatian: "🇭🇷",
      czech: "🇨🇿",
      danish: "🇩🇰",
      dutch: "🇳🇱",
      english: "🇬🇧",
      estonian: "🇪🇪",
      finnish: "🇫🇮",
      french: "🇫🇷",
      georgian: "🇬🇪",
      german: "🇩🇪",
      greek: "🇬🇷",
      hungarian: "🇭🇺",
      indian: "🇮🇳",
      irish: "🇮🇪",
      israeli: "🇮🇱",
      italian: "🇮🇹",
      japanese: "🇯🇵",
      korean: "🇰🇷",
      mexican: "🇲🇽",
      norwegian: "🇳🇴",
      polish: "🇵🇱",
      portuguese: "🇵🇹",
      romanian: "🇷🇴",
      russian: "🇷🇺",
      scottish: "🏴",
      slovak: "🇸🇰",
      slovenian: "🇸🇮",
      spanish: "🇪🇸",
      swedish: "🇸🇪",
      swiss: "🇨🇭",
      thai: "🇹🇭",
      turkish: "🇹🇷",
      ukrainian: "🇺🇦",
      welsh: "🏴",
    };
    return flags[normalized] || "";
  };
  chips.push(metaChipHtml("Type", page.entityType || page.category));
  if (Array.isArray(page.aliases) && page.aliases.length) {
    chips.push(metaChipHtml("Aliases", page.aliases.join(", "), "person-chip subtle"));
  }
  if (frontmatter.relationship) {
    chips.push(metaChipHtml("Relationship", frontmatter.relationship, "person-chip"));
  }
  if (frontmatter.status) {
    chips.push(metaChipHtml("Status", frontmatter.status, "person-chip"));
  }
  const metParts = [frontmatter.first_met, frontmatter.where_met]
    .map((value) => normalizePlaceholderValue(value))
    .filter(Boolean);
  const met = Array.from(new Set(metParts)).join(", ");
  if (met) {
    chips.push(metaChipHtml("Met", met, "person-chip"));
  }
  if (frontmatter.nationality) {
    const nationality = normalizePlaceholderValue(frontmatter.nationality);
    const flag = nationalityFlag(nationality);
    chips.push(metaChipHtml("Nationality", flag ? `${nationality} ${flag}` : nationality, "person-chip"));
  }
  if (frontmatter.languages) {
    chips.push(metaChipHtml("Languages", formatValue(frontmatter.languages), "person-chip"));
  }
  if (frontmatter.birthday) {
    chips.push(metaChipHtml("Birthday", formatPersonBirthdayDisplay(frontmatter.birthday), "person-chip"));
  }
  if (frontmatter.profession) {
    chips.push(metaChipHtml("Profession", frontmatter.profession, "person-chip"));
  }
  if (frontmatter.website) {
    const website = normalizePlaceholderValue(frontmatter.website);
    if (website) {
      if (isUnknownPlaceholder(website) || !/^https?:\/\//i.test(website)) {
        chips.push(metaChipHtml("Website", website, "person-chip"));
      } else {
        chips.push(`
          <div class="meta-chip person-chip">
            <span>Website</span>
            <strong><a href="${escapeHtml(website)}" target="_blank" rel="noreferrer">${escapeHtml(prettyUrl(website))}</a></strong>
          </div>
        `);
      }
    }
  }
  if (frontmatter.data_source) {
    chips.push(metaChipHtml("Source", frontmatter.data_source, "person-chip subtle"));
  }
  return chips.join("");
}

function metaChipHtml(label, value, extraClass = "") {
  return `
    <div class="meta-chip ${extraClass}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value || ""))}</strong>
    </div>
  `;
}

function renderPersonProfileEditor(page) {
  const frontmatter = page.frontmatter || {};
  return `
    <section class="editor-panel person-edit-panel">
      <div class="card-header">
        <p class="eyebrow">Profile Metadata</p>
        <h3>Top profile chips</h3>
      </div>
      <p class="muted">Everything here is optional. Saving updates frontmatter and rewrites the page’s <code>## Background</code> section to match.</p>
      <form id="person-profile-form" class="editor-form person-profile-form" novalidate>
        <div class="rename-grid">
          <label class="field">
            <span>Relationship</span>
            <input name="relationship" type="text" value="${escapeHtml(String(frontmatter.relationship || ""))}" placeholder="girlfriend, mother, friend" />
          </label>
          <label class="field">
            <span>Status</span>
            <input name="status" type="text" value="${escapeHtml(String(frontmatter.status || ""))}" placeholder="met" />
          </label>
        </div>
        <div class="rename-grid">
          <label class="field">
            <span>First Heard</span>
            <input name="first_heard" type="text" value="${escapeHtml(String(frontmatter.first_heard || ""))}" placeholder="2026-03 (estimate)" />
          </label>
          <label class="field">
            <span>How Heard</span>
            <input name="how_heard" type="text" value="${escapeHtml(String(frontmatter.how_heard || ""))}" placeholder="how this person entered the story" />
          </label>
        </div>
        <div class="rename-grid">
          <label class="field">
            <span>First Met</span>
            <input name="first_met" type="text" value="${escapeHtml(String(frontmatter.first_met || ""))}" placeholder="2026-03 (estimate)" />
          </label>
          <label class="field">
            <span>Where Met</span>
            <input name="where_met" type="text" value="${escapeHtml(String(frontmatter.where_met || ""))}" placeholder="Mexico (Oaxaca area, estimate)" />
          </label>
        </div>
        <div class="rename-grid">
          <label class="field">
            <span>Nationality</span>
            <input name="nationality" type="text" value="${escapeHtml(String(frontmatter.nationality || ""))}" placeholder="Ukrainian" />
          </label>
          <label class="field">
            <span>Birthday</span>
            <input name="birthday" type="text" value="${escapeHtml(String(frontmatter.birthday || ""))}" placeholder="1979-10-07" />
          </label>
        </div>
        <div class="rename-grid">
          <label class="field">
            <span>Profession</span>
            <input name="profession" type="text" value="${escapeHtml(String(frontmatter.profession || ""))}" placeholder="Career Coach" />
          </label>
          <label class="field">
            <span>Languages</span>
            <input name="languages" type="text" value="${escapeHtml(formatFrontmatterInput(frontmatter.languages))}" placeholder="English, French, Italian" />
          </label>
        </div>
        <div class="rename-grid">
          <label class="field">
            <span>Website</span>
            <input name="website" type="text" inputmode="url" value="${escapeHtml(String(frontmatter.website || ""))}" placeholder="https://example.com" />
          </label>
          <label class="field">
            <span>Data Source</span>
            <input name="data_source" type="text" value="${escapeHtml(String(frontmatter.data_source || ""))}" placeholder="personal website" />
          </label>
        </div>
        <div class="rename-actions">
          <button type="submit" class="primary-button">${icon("save")} Save Profile</button>
          <span class="muted">No field is required.</span>
        </div>
      </form>
      <section class="person-enrichment-panel">
        <div class="card-header compact">
          <p class="eyebrow">Website Enrichment</p>
          <h3>Optional import from website</h3>
        </div>
        <p class="muted">Use a website only when you want to pull structured facts into this profile. It is separate from the normal save flow.</p>
        <div class="rename-actions">
          <button type="button" class="ghost-button inline-action" id="fetch-person-website">${icon("links")} Fetch From Website</button>
        </div>
      </section>
    </section>
  `;
}

function renderAliasEditor(page) {
  return `
    <section class="editor-panel person-edit-panel">
      <div class="card-header">
        <p class="eyebrow">Aliases</p>
        <h3>Alternate names and references</h3>
      </div>
      <p class="muted">These are saved into frontmatter as <code>aliases</code>. Search, typeahead, person matching, and wikilink resolution will use them automatically.</p>
      <form id="page-aliases-form" class="editor-form">
        <label class="field">
          <span>Aliases</span>
          <input name="aliases" type="text" value="${escapeHtml(formatFrontmatterInput(page.frontmatter?.aliases))}" placeholder="${escapeHtml(aliasPlaceholderForPage(page))}" />
        </label>
        <p class="muted">Use commas or separate lines. Example: <code>${escapeHtml(aliasExamplesForPage(page).join(", "))}</code></p>
        <div class="rename-actions">
          <button type="submit" class="primary-button">${icon("save")} Save Aliases</button>
        </div>
      </form>
    </section>
  `;
}

function renderEditWorkspace({ eyebrow = "Edit", title = "", description = "", ariaLabel = "Edit sections", tabs = [] } = {}) {
  const visibleTabs = tabs.filter((tab) => String(tab?.content || "").trim());
  if (!visibleTabs.length) {
    return "";
  }

  return `
    <section class="editor-panel person-edit-workspace">
      <div class="card-header">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h3>${escapeHtml(title)}</h3>
      </div>
      ${description ? `<p class="muted">${escapeHtml(description)}</p>` : ""}
      <div class="edit-tab-strip" role="tablist" aria-label="${escapeHtml(ariaLabel)}">
        ${visibleTabs.map((tab, index) => `
          <button class="edit-tab-button ${index === 0 ? "active" : ""}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-edit-tab-trigger="${escapeHtml(tab.key)}">
            ${escapeHtml(tab.label)}
          </button>
        `).join("")}
      </div>
      <div class="edit-tab-panels">
        ${visibleTabs.map((tab, index) => `
          <div class="edit-tab-panel ${index === 0 ? "" : "hidden"}" data-edit-tab-panel="${escapeHtml(tab.key)}">
            ${tab.content}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderEntityEditWorkspace(page) {
  return renderEditWorkspace({
    eyebrow: "Edit",
    title: "Choose the kind of change you want to make",
    description: "Move, aliases, markdown, and AI edits now live in one workspace instead of separate stacked forms.",
    ariaLabel: "Page edit sections",
    tabs: [
      {
        key: "rename-move",
        label: "Rename or Move",
        content: renderRenamePanel(page),
      },
      {
        key: "aliases",
        label: "Aliases",
        content: renderAliasEditor(page),
      },
      {
        key: "markdown",
        label: "Markdown",
        content: `
          <section class="editor-panel person-edit-panel">
            <div class="card-header">
              <p class="eyebrow">Edit Page</p>
              <h3>Manual markdown editor for this page</h3>
            </div>
            <p class="muted">Edit rich details here directly, including summary sections, lists, links, and markdown structure.</p>
            <form id="page-editor-form" class="editor-form">
              <textarea name="content" class="code-editor">${escapeHtml(page.rawContent || "")}</textarea>
              <div class="rename-actions">
                <button type="submit" class="primary-button">${icon("save")} Save Page</button>
              </div>
            </form>
          </section>
        `,
      },
      {
        key: "ai",
        label: "AI Edit",
        content: renderAiEditPanel({ targetType: "page", pageId: page.id, heading: "AI Edit", description: "Explain the change you want in plain English and Codex will edit this page." }),
      },
    ],
  });
}

function renderPersonEditWorkspace(page) {
  return renderEditWorkspace({
    eyebrow: "Edit Person",
    title: "Choose the kind of change you want to make",
    description: "Rename or move, profile chips, aliases, markdown, and AI edits live in one workspace instead of separate stacked forms.",
    ariaLabel: "Person edit sections",
    tabs: [
      {
        key: "rename-move",
        label: "Rename or Move",
        content: renderRenamePanel(page),
      },
      {
        key: "profile",
        label: "Profile",
        content: renderPersonProfileEditor(page),
      },
      {
        key: "aliases",
        label: "Aliases",
        content: renderAliasEditor(page),
      },
      {
        key: "markdown",
        label: "Markdown",
        content: `
          <section class="editor-panel person-edit-panel">
            <div class="card-header">
              <p class="eyebrow">Markdown</p>
              <h3>Manual page editor</h3>
            </div>
            <p class="muted">Use this when you want direct control over sections, links, and formatting.</p>
            <form id="page-editor-form" class="editor-form">
              <textarea name="content" class="code-editor">${escapeHtml(page.rawContent || "")}</textarea>
              <div class="rename-actions">
                <button type="submit" class="primary-button">${icon("save")} Save Page</button>
              </div>
            </form>
          </section>
        `,
      },
      {
        key: "ai",
        label: "AI Edit",
        content: renderAiEditPanel({ targetType: "page", pageId: page.id, heading: "AI Edit", description: "Explain the change you want in plain English and Codex will edit this page." }),
      },
    ],
  });
}

function buildConnectedPages(page) {
  const connected = new Map();

  for (const item of page.outgoing) {
    const current = connected.get(item.id) || { ...item, direction: new Set() };
    current.direction.add("out");
    connected.set(item.id, current);
  }

  for (const item of page.backlinks) {
    const current = connected.get(item.id) || { ...item, direction: new Set() };
    current.direction.add("in");
    if (!current.image && item.image) {
      current.image = item.image;
    }
    connected.set(item.id, current);
  }

  for (const item of page.semanticPeers || []) {
    const current = connected.get(item.id) || { ...item, direction: new Set(), relationReasons: [] };
    current.relationReasons = Array.from(new Set([...(current.relationReasons || []), ...(item.relationReasons || [])]));
    connected.set(item.id, current);
  }

  if (page.matchedPerson?.id) {
    const current = connected.get(page.matchedPerson.id) || { ...page.matchedPerson, direction: new Set(), relationReasons: [] };
    current.relationReasons = Array.from(new Set([...(current.relationReasons || []), "Person"]));
    connected.set(page.matchedPerson.id, current);
  }

  const items = Array.from(connected.values()).sort((a, b) => a.title.localeCompare(b.title));
  const meaningful = items.filter((item) => !shouldHideStructuralConnection(item));
  return meaningful.length ? meaningful : items;
}

function shouldHideStructuralConnection(item) {
  const directions = item.direction || new Set();
  if (directions.has("out") || directions.has("both")) {
    return false;
  }
  return directions.has("in") && isStructuralPageReference(item);
}

function isStructuralPageReference(item) {
  const id = String(item?.id || "").toLowerCase();
  const title = String(item?.title || "").toLowerCase().trim();
  const basename = id.split("/").pop();
  return (
    basename === "index" ||
    basename === "overview" ||
    title === "index" ||
    title === "overview" ||
    title.endsWith(" index") ||
    title.endsWith(" overview")
  );
}

function renderConnectedPages(items) {
  if (!items.length) {
    return `
      <section class="card-stack">
        <div class="card-header">
          <p class="eyebrow">Related Pages</p>
          <h3>No related pages yet</h3>
        </div>
        <div class="empty-card">This page does not currently connect to other wiki pages through direct links, backlinks, or computed matches.</div>
      </section>
    `;
  }

  const groups = [
    {
      key: "outgoing",
      eyebrow: "Links From This Page",
      title: "Pages this article references",
      items: items.filter((item) => item.direction?.has?.("out")),
    },
    {
      key: "backlinks",
      eyebrow: "Backlinks",
      title: "Pages that reference this article",
      items: items.filter((item) => !item.direction?.has?.("out") && item.direction?.has?.("in")),
    },
    {
      key: "computed",
      eyebrow: "Other Matches",
      title: "Computed page matches",
      items: items.filter((item) => !item.direction?.has?.("out") && !item.direction?.has?.("in")),
    },
  ].filter((group) => group.items.length);

  return `
    <section class="card-stack">
      <div class="card-header">
        <p class="eyebrow">Related Pages</p>
        <h3>Grouped by link direction or computed match</h3>
      </div>
      ${groups.map((group) => `
        <section class="related-group">
          <div class="related-group-header">
            <p class="eyebrow">${escapeHtml(group.eyebrow)}</p>
            <h4>${escapeHtml(group.title)}</h4>
          </div>
          <div class="related-grid">
            ${group.items.map((item) => linkCard(item)).join("")}
          </div>
        </section>
      `).join("")}
    </section>
  `;
}

function renderPersonEvidencePanel(page) {
  const evidence = page.personEvidence;
  if (!evidence || page.category !== "people") {
    return "";
  }

  const counts = evidence.counts || {};
  const sourceGroups = evidence.sourceGroups || [];
  const recordings = evidence.recordings || [];
  const resources = evidence.resources || [];
  const notes = evidence.notes || [];

  if (!sourceGroups.length && !recordings.length && !resources.length && !notes.length) {
    return `
      <section class="card-stack person-evidence-panel">
        <div class="card-header">
          <p class="eyebrow">Evidence</p>
          <h3>No source-backed pages for this person yet</h3>
        </div>
        <div class="empty-card">Import a video, transcript, or recording and link it to this person to build a clear evidence trail here.</div>
      </section>
    `;
  }

  return `
    <section class="card-stack person-evidence-panel">
      <div class="card-header">
        <p class="eyebrow">Evidence</p>
        <h3>Recordings, videos, and notes tied to this person</h3>
      </div>
      <div class="person-evidence-summary">
        <span class="calendar-meta-pill">${icon("file")} ${escapeHtml(String(counts.totalEvidencePages || 0))} related pages</span>
        <span class="calendar-meta-pill">${icon("links")} ${escapeHtml(String(counts.sourceGroups || 0))} underlying sources</span>
        <span class="calendar-meta-pill">${icon("file")} ${escapeHtml(String(counts.resources || 0))} resource or talk pages</span>
        <span class="calendar-meta-pill">${icon("save")} ${escapeHtml(String(counts.recordings || 0))} transcript-backed notes</span>
      </div>
      ${sourceGroups.length ? `
        <div class="person-evidence-groups">
          ${sourceGroups.map(renderPersonSourceGroup).join("")}
        </div>
      ` : ""}
      ${resources.length ? `
        <div class="person-evidence-section">
          <div class="card-header">
            <p class="eyebrow">Media</p>
            <h3>Source-backed resource and talk pages</h3>
          </div>
          <div class="related-grid">
            ${resources.map((item) => linkCard({ ...item, extraBadges: evidenceBadgesForItem(item) })).join("")}
          </div>
        </div>
      ` : ""}
      ${recordings.length ? `
        <div class="person-evidence-section">
          <div class="card-header">
            <p class="eyebrow">Recordings</p>
            <h3>Transcript-backed pages and firsthand notes</h3>
          </div>
          <div class="related-grid">
            ${recordings.map((item) => linkCard({ ...item, extraBadges: evidenceBadgesForItem(item) })).join("")}
          </div>
        </div>
      ` : ""}
      ${notes.length ? `
        <div class="person-evidence-section">
          <div class="card-header">
            <p class="eyebrow">Notes</p>
            <h3>Related pages without direct source bundles</h3>
          </div>
          <div class="related-grid">
            ${notes.map((item) => linkCard({ ...item, extraBadges: evidenceBadgesForItem(item) })).join("")}
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderPersonSourceGroup(group) {
  const sourceLabel = group.url
    ? prettyUrl(group.url)
    : group.sourceRef || "Local source";
  const groupBadge = group.kind === "transcript"
    ? "Local recording"
    : group.domain || "External source";

  return `
    <article class="person-source-group">
      <div class="link-card-badges">
        <span class="type-badge">${escapeHtml(groupBadge)}</span>
        <span class="type-badge subtle">${escapeHtml(group.label || "Source")}</span>
        <span class="type-badge subtle">${escapeHtml(`${group.pages.length} page${group.pages.length === 1 ? "" : "s"}`)}</span>
      </div>
      <h4>${escapeHtml(sourceLabel)}</h4>
      ${group.url ? `<a class="ghost-button inline-action subtle-link" href="${escapeHtml(group.url)}" target="_blank" rel="noreferrer">${icon("links")} Open source</a>` : ""}
      ${!group.url && group.sourceRef ? `<p class="small-note"><code>${linkTranscriptDownloadRefs(group.sourceRef)}</code></p>` : ""}
      <div class="person-source-pages">
        ${group.pages.map((item) => `
          <button class="person-source-page" type="button" data-page-id="${escapeHtml(item.id)}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.byline || item.excerpt || item.wikiPath)}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function evidenceBadgesForItem(item) {
  const badges = [];
  if (item.evidenceType === "recording") {
    badges.push("Transcript-backed");
  } else if (item.evidenceType === "external") {
    badges.push("Source-backed");
  }
  const refs = item.sourceRefs || [];
  if (refs.some((ref) => (ref.domain || "") === "YouTube")) {
    badges.push("YouTube");
  }
  return badges;
}

function renderResearchPanel(page) {
  const links = page.researchLinks || [];
  if (!links.length) {
    return "";
  }

  return `
    <section class="card-stack">
      <div class="card-header">
        <p class="eyebrow">Research</p>
        <h3>Open the external sources behind this page</h3>
      </div>
      <div class="research-links">
        ${links.map((item) => `<a class="ghost-button inline-action" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${icon("links")} ${escapeHtml(item.label)}</a>`).join("")}
      </div>
    </section>
  `;
}

function renderRenamePanel(page) {
  if (page.category === "root") {
    return "";
  }

  const plainTextBase = page.renameBase || page.title;
  const categoryOptions = getManagedProjectCategories()
    .map((category) => `<option value="${escapeHtml(category)}" ${category === page.category ? "selected" : ""}>${escapeHtml(formatProjectName(category))}</option>`)
    .join("");
  const canRenameIdentity = Boolean(page.renamable);
  return `
    <section class="rename-panel">
      <div class="card-header">
        <p class="eyebrow">Rename Or Move</p>
        <h3>Change the canonical page identity or move this page into a different category</h3>
      </div>
      <form id="rename-form" class="rename-form">
        <label class="field">
          <span>Category</span>
          <select name="category">
            ${categoryOptions}
          </select>
          <p class="muted">Moving categories updates the page id and file path together.</p>
        </label>
        <label class="field">
          <span>Page title</span>
          <input name="title" type="text" value="${escapeHtml(page.title)}" ${canRenameIdentity ? "" : "disabled"} />
          <p class="muted">${canRenameIdentity ? "This is the visible page name at the top of the note." : "Title rename is currently limited for this page type, but category moves are allowed."}</p>
        </label>
        <label class="field">
          <span>Slug / wikilink id</span>
          <input name="slug" type="text" value="${escapeHtml(page.slug)}" ${canRenameIdentity ? "" : "disabled"} />
          <p class="muted">${canRenameIdentity ? "This changes the file name and the canonical <code>[[wikilink]]</code> target used across the project." : "Slug rename is currently limited for this page type, but category moves are allowed."}</p>
        </label>
        <div class="empty-state compact">
          <p><strong>Always updated:</strong> the page file, its canonical wikilinks, and linked page references that point to this entity or category path.</p>
          <p><strong>Optional below:</strong> plain-text cleanup for nicknames or prose mentions like "Moo" becoming "Mom" inside sentences.</p>
        </div>
        <label class="checkbox-row">
          <input name="replacePlainText" type="checkbox" checked ${canRenameIdentity ? "" : "disabled"} />
          <span>Also clean up plain-text prose references across this project</span>
        </label>
        <div class="rename-grid">
          <label class="field">
            <span>Find plain text</span>
            <input name="replaceTextFrom" type="text" value="${escapeHtml(plainTextBase)}" ${canRenameIdentity ? "" : "disabled"} />
            <p class="muted">Only used for plain text in sentences, not canonical wikilinks.</p>
          </label>
          <label class="field">
            <span>Replace with</span>
            <input name="replaceTextTo" type="text" value="${escapeHtml(plainTextBase)}" ${canRenameIdentity ? "" : "disabled"} />
            <p class="muted">Example: rename page title to <code>Nancy</code> but replace plain text <code>Moo</code> with <code>Mom</code>.</p>
          </label>
        </div>
        <div class="rename-actions">
          <button type="submit" class="primary-button">${icon("save")} Save Move Changes</button>
          <a class="ghost-button inline-action" href="${page.obsidianPageUrl}">${icon("obsidian")} Open page in app</a>
        </div>
      </form>
    </section>
  `;
}

function renderSourcePanel(source) {
  if (!source?.transcriptFound) {
    return "";
  }

  const transcriptMeta = Object.entries(source.transcriptFrontmatter || {})
    .map(
      ([key, value]) => `
        <div class="meta-chip">
          <span>${escapeHtml(key)}</span>
          <strong>${escapeHtml(formatValue(value))}</strong>
        </div>
      `
    )
    .join("");

  const transcriptPaths = Array.isArray(source.transcriptPaths) && source.transcriptPaths.length
    ? source.transcriptPaths
    : [source.transcriptPath].filter(Boolean);

  return `
    <section class="source-panel">
      <div class="card-header">
        <p class="eyebrow">Source Boundary</p>
        <h3>Transcript-derived evidence</h3>
      </div>
      <p class="muted">This page is grounded in the public AI Engineer Miami 2026 wiki corpus. Transcript-derived material is separated from official conference-site facts and public-web supporting context.</p>
      <div class="meta-row">
        ${state.currentProject?.sourceBoundary ? `
          <div class="meta-chip">
            <span>allowed corpus</span>
            <strong>${escapeHtml(state.currentProject.sourceBoundary)}</strong>
          </div>
        ` : ""}
        ${transcriptMeta}
        ${transcriptPaths.map((transcriptPath) => `
          <div class="meta-chip">
            <span>transcript reference</span>
            <strong>${linkTranscriptDownloadRefs(transcriptPath)}</strong>
          </div>
        `).join("")}
      </div>
      ${
        source.audioUrl
          ? `
            <div class="audio-block">
              <p class="muted">Recording: <code>${escapeHtml(source.audioName)}</code></p>
              <audio controls preload="none" src="${source.audioUrl}"></audio>
            </div>
          `
          : ""
      }
      ${source.transcriptBody ? `<div class="transcript-body">
        <h4>Transcript</h4>
        <pre>${escapeHtml(source.transcriptBody)}</pre>
      </div>` : ""}
    </section>
  `;
}

function linkTranscriptDownloadRefs(value) {
  const transcriptDownloads = new Map([
    ["/tmp/aie-miami-transcript.txt", "/downloads/transcripts/day-1-transcript.txt"],
    ["/tmp/aie-miami-part2-transcript.txt", "/downloads/transcripts/day-2-transcript.txt"],
  ]);
  let html = escapeHtml(value);
  for (const [transcriptPath, downloadPath] of transcriptDownloads) {
    const escapedPath = escapeHtml(transcriptPath);
    html = html.replaceAll(
      escapedPath,
      `<a href="${escapeHtml(downloadPath)}" download>${escapedPath}</a>`
    );
  }
  return html;
}

function renderComposer(prefill = null) {
  const categoryOptions = ["root", ...getManagedProjectCategories()]
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  const submitLabel = prefill?.category === "people" && prefill?.personName ? "Create Person Page" : "Create Page";
  const aiHeading = prefill?.category === "people" && prefill?.personName
    ? `Create a people page for ${prefill.personName}`
    : "One intake box for notes, files, URLs, screenshots, and pasted content";

  return `
    <section class="editor-panel">
      <div class="card-header">
        <p class="eyebrow">Compose</p>
        <h3>Give AI whatever you have, or write the page yourself</h3>
      </div>
      <form id="compose-form" class="compose-form">
        <div id="compose-prefill-banner" class="compose-prefill-banner hidden"></div>
        <label class="field">
          <span>Mode</span>
          <select name="mode">
            <option value="ai">AI draft</option>
            <option value="manual">Manual page</option>
          </select>
        </label>
        <div class="rename-grid">
          <label class="field">
            <span>Category</span>
            <select name="category">${categoryOptions}</select>
          </label>
          <label class="field manual-only">
            <span>Title</span>
            <input name="title" type="text" placeholder="New page title" />
          </label>
        </div>
        <label class="field manual-only">
          <span>Slug</span>
          <input name="slug" type="text" placeholder="new-page-slug" />
        </label>
        <label class="field manual-only">
          <span>Write content</span>
          <textarea name="content" rows="8" placeholder="Write markdown or notes here"></textarea>
        </label>
        <label class="field manual-only">
          <span>Source URL or YouTube link</span>
          <input name="url" type="url" placeholder="https://example.com/article or https://www.youtube.com/watch?v=..." />
        </label>
        <div class="rename-grid manual-only">
          <label class="field">
            <span>Upload a supporting file</span>
            <input name="manualImportFile" type="file" accept=".txt,.md,.markdown,.html,.json,.csv,.pdf" />
          </label>
          <label class="field">
            <span>Optional image</span>
            <input name="manualImageFile" type="file" accept="image/*" />
          </label>
        </div>
        <section class="image-ai-panel ai-only">
          <div class="card-header">
            <p class="eyebrow">AI Draft</p>
            <h3>${escapeHtml(aiHeading)}</h3>
          </div>
          <input class="hidden" name="aiTitleHint" type="hidden" value="${escapeHtml(prefill?.titleHint || "")}" />
          <label class="field">
            <span>What should AI create?</span>
            <textarea name="imageInstructions" rows="5" placeholder="Describe what this should become: title ideas, what category it belongs to, key facts, relationships, anything you know already"></textarea>
          </label>
          <div id="compose-routing-panel" class="compose-routing-panel" aria-live="polite">
            <div><span>Predicted title</span><strong data-compose-route="title">AI decides</strong></div>
            <div><span>Source</span><strong data-compose-route="source">No source yet</strong></div>
            <div><span>Selected category</span><strong data-compose-route="selected-category">root</strong></div>
            <div><span>Suggested category</span><strong data-compose-route="suggested-category">Run preview</strong></div>
            <div><span>Final submit category</span><strong data-compose-route="final-category">root</strong></div>
          </div>
          <div id="compose-category-preview" class="empty-state compact hidden"></div>
        <label class="field">
          <span>Source URL or YouTube link</span>
          <input name="aiUrl" type="url" placeholder="https://example.com/article or https://www.youtube.com/watch?v=..." />
        </label>
        <label class="field hidden" data-youtube-import-options>
          <span>YouTube import target</span>
          <select name="youtubeImportProjectMode">
            <option value="current">Use current project</option>
            <option value="smart">Use smart routing</option>
          </select>
          <span class="muted">Used only for YouTube URLs. Smart routing reuses the existing librarian-style project selection.</span>
        </label>
          <input class="hidden" name="aiImportFile" type="file" accept=".txt,.md,.markdown,.html,.json,.csv,.pdf" />
          <input class="hidden" name="aiImageFile" type="file" accept="image/*" />
          <div id="image-dropzone" class="dropzone" tabindex="0">
            <p><strong>Unified intake:</strong> drop a PDF, markdown file, screenshot, copied image, or pasted text here.</p>
            <div class="dropzone-actions">
              <button type="button" class="ghost-button inline-action" id="choose-supporting-file">${icon("file")} Choose file</button>
              <button type="button" class="ghost-button inline-action" id="choose-supporting-image">${icon("image")} Choose image</button>
            </div>
            <div id="compose-ingest-preview" class="compose-ingest-preview muted">
              <p>No supporting file or image selected yet.</p>
            </div>
          </div>
        </section>
        <div class="rename-actions">
          <button type="submit" class="primary-button">${icon("plus")} ${escapeHtml(submitLabel)}</button>
          <p class="muted">AI draft is the default and can work from text alone, a URL, a file, an image, or any combination. Manual mode is there when you want exact control.</p>
        </div>
        <div id="compose-status" class="compose-status hidden">
          <div class="compose-status-label">Status: idle</div>
          <pre class="compose-status-output"></pre>
        </div>
      </form>
    </section>
  `;
}

function buildPersonComposePrefill(button, autoRun = false) {
  return buildPersonComposePrefillFromSource(
    {
      speaker: button.dataset.speaker || "",
      evidence: button.dataset.evidence || "",
      url: button.dataset.url || "",
    },
    {
      autoRun,
      fallbackUrl: state.currentProject?.primaryUrl || "",
    }
  );
}

function renderProjectHome(indexPage, sourceContext = null) {
  return renderProjectHomeMarkup(
    {
      currentProject: state.currentProject,
      pages: state.pages,
      indexPage,
      sourceContext,
      recentPanelHtml: renderHomeRecentPanel(getRecentHomeItems(state.pages), indexPage, {
        escapeHtml,
        icon,
        formatDateLabel,
      }),
      conferenceSourcePanelHtml: sourceContext ? renderConferenceSourcePanel(sourceContext) : "",
      speakerMatchPanelHtml: sourceContext ? renderSpeakerMatchPanel(sourceContext) : "",
      taskHomePanelHtml: String(state.currentProject?.genre || "").trim().toLowerCase() === "to-do-list" && state.todoTaskPages.size
        ? renderTodoTaskHomePanel(Array.from(state.todoTaskPages.values()).map((entry) => entry.summary), {
            escapeHtml,
            icon,
            formatDateLabel,
          })
        : "",
    },
    {
      escapeHtml,
      icon,
      renderHomeCategoryStrip,
      getCategoryIconName,
    }
  );
}

async function loadTodoTaskHomePages(requestId) {
  const projectName = state.currentProject?.name;
  const taskPages = state.pages.filter((page) => page.category === "tasks");
  const nextTaskPages = new Map();
  if (!taskPages.length) {
    state.todoTaskPages = nextTaskPages;
    return nextTaskPages;
  }

  const results = await Promise.allSettled(taskPages.map(async (page) => {
    const response = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/page?id=${encodeURIComponent(page.id)}`);
    if (!isActiveViewRequest(requestId, projectName)) {
      return null;
    }
    const summary = buildTodoTaskSummaryFromPage(response.page, { today: new Date() });
    return {
      pageId: page.id,
      page: response.page,
      summary,
    };
  }));

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      nextTaskPages.set(result.value.pageId, result.value);
    }
  }

  if (!isActiveViewRequest(requestId, projectName)) {
    return state.todoTaskPages;
  }
  state.todoTaskPages = nextTaskPages;
  return nextTaskPages;
}

function renderConferenceSourcePanel(sourceContext) {
  const summary = sourceContext.summary || state.currentProject.primarySummary || "";
  const conferenceLinkLabel = state.currentProject.primaryLabel || "Conference website reference";
  return `
    <section class="home-panel conference-source-panel">
      <div class="card-header">
        <p class="eyebrow">Wiki Description</p>
        <h3>About this public wiki</h3>
      </div>
      <p class="conference-source-title">${escapeHtml(sourceContext.title || "AI Engineer Miami")}</p>
      <p class="muted">${escapeHtml(summary)}</p>
      <div class="conference-facts">
        ${sourceContext.dateLabel ? `<div class="conference-fact"><span>Date</span><strong>${escapeHtml(formatDateLabel(sourceContext.dateLabel))}</strong></div>` : ""}
        ${sourceContext.locationLabel ? `<div class="conference-fact"><span>Location</span><strong>${escapeHtml(sourceContext.locationLabel)}</strong></div>` : ""}
        ${sourceContext.venueName ? `<div class="conference-fact"><span>Venue</span><strong>${escapeHtml(sourceContext.venueName)}</strong></div>` : ""}
        ${sourceContext.speakerCount ? `<div class="conference-fact"><span>Speakers</span><strong>${escapeHtml(String(sourceContext.speakerCount))}</strong></div>` : ""}
        ${state.currentProject.sourceBoundary ? `<div class="conference-fact"><span>Source boundary</span><strong>${escapeHtml(state.currentProject.sourceBoundary)}</strong></div>` : ""}
      </div>
      <div class="rename-actions conference-source-actions">
        <a class="ghost-button inline-action" href="${escapeHtml(sourceContext.url)}" target="_blank" rel="noreferrer">${icon("links")} ${escapeHtml(conferenceLinkLabel)}</a>
        <a class="ghost-button inline-action" href="/downloads/transcripts/day-1-transcript.txt" download>${icon("transcript")} Day 1 transcript</a>
        <a class="ghost-button inline-action" href="/downloads/transcripts/day-2-transcript.txt" download>${icon("transcript")} Day 2 transcript</a>
        ${sourceContext.venueUrl ? `<a class="ghost-button inline-action" href="${escapeHtml(sourceContext.venueUrl)}" target="_blank" rel="noreferrer">${icon("links")} Venue</a>` : ""}
        ${sourceContext.mapUrl ? `<a class="ghost-button inline-action" href="${escapeHtml(sourceContext.mapUrl)}" target="_blank" rel="noreferrer">${icon("links")} Map</a>` : ""}
      </div>
    </section>
  `;
}

function renderSpeakerMatchPanel(sourceContext) {
  const matches = (sourceContext.matchedSpeakers || []).slice(0, 6);
  const unmatched = sourceContext.unmatchedSpeakers || [];

  return `
    <section class="home-panel">
      <div class="card-header">
        <p class="eyebrow">People Match</p>
        <h3>Official speakers with local people or supporting evidence</h3>
      </div>
      ${matches.length
        ? `<div class="related-grid">${matches.map((match) => renderSpeakerMatchCard(match, true)).join("")}</div>`
        : `<div class="empty-card">No official speakers currently map to local people or supporting evidence yet.</div>`}
      ${unmatched.length
        ? `
          <details class="speaker-disclosure">
            <summary>${unmatched.length} additional official speakers are not yet in the vault</summary>
            <div class="related-grid">
              ${unmatched.slice(0, 18).map((match) => renderSpeakerMatchCard(match, false)).join("")}
            </div>
          </details>
        `
        : ""}
    </section>
  `;
}

function renderSpeakerMatchCard(match, isMatched) {
  const localPerson = match.localPeople?.[0] || null;
  const evidencePages = (match.supportingPages || []).filter((page) => page.id !== localPerson?.id).slice(0, 3);
  const representedByEvidence = !localPerson && evidencePages.length;
  const readOnly = isReadOnlyProject();
  const canDraftPerson = !readOnly && !localPerson;
  const canAutoCreate = canDraftPerson && Boolean(match.autoCreateReady);
  const localPersonTitle = String(localPerson?.title || "").trim();
  const speakerName = String(match.speaker || "").trim();
  const localPersonLooksEquivalent =
    localPersonTitle &&
    speakerName &&
    localPersonTitle.localeCompare(speakerName, undefined, { sensitivity: "accent" }) === 0;
  const supportingText = localPerson
    ? (localPersonLooksEquivalent
        ? "Matched local person page."
        : localPersonTitle)
    : (representedByEvidence
        ? (readOnly
            ? "Supporting pages already mention this speaker in the public wiki."
            : "Supporting pages already represent this speaker locally. A dedicated person page should still be created.")
        : (readOnly
            ? "No local person page is available in the public wiki."
            : "No local person page yet. Create one from the canonical roster and supporting local evidence."));
  return `
    <article class="speaker-match-card ${isMatched ? "matched" : "unmatched"}">
      <div class="link-card-badges">
        <span class="type-badge">${localPerson ? "Person In Vault" : representedByEvidence ? "Evidence In Vault" : "Person Missing"}</span>
        <span class="type-badge subtle">Speaker</span>
        ${canAutoCreate ? `<span class="type-badge subtle">Ready To Create</span>` : ""}
      </div>
      <strong>${escapeHtml(match.speaker)}</strong>
      <span>${escapeHtml(supportingText)}</span>
      ${!isMatched ? `<small class="link-card-label">Source: ${escapeHtml(state.currentProject.primaryUrl || "")}</small>` : ""}
      ${evidencePages.length
        ? `<small class="link-card-label">Supporting pages: ${escapeHtml(evidencePages.map((page) => page.title).join(", "))}</small>`
        : ""}
      <div class="rename-actions">
        ${localPerson ? `<button class="ghost-button inline-action home-open-page" data-page-id="${escapeHtml(localPerson.id)}">${icon("file")} Open person</button>` : ""}
        ${canDraftPerson ? `<button class="ghost-button inline-action compose-person-from-source" data-speaker="${escapeHtml(match.speaker)}" data-url="${escapeHtml(state.currentProject.primaryUrl || "")}" data-evidence="${escapeHtml(evidencePages.map((page) => page.title).join(", "))}">${icon("file")} Open draft</button>` : ""}
        ${canAutoCreate ? `<button class="primary-button inline-action auto-create-person-from-source" data-speaker="${escapeHtml(match.speaker)}" data-url="${escapeHtml(state.currentProject.primaryUrl || "")}" data-evidence="${escapeHtml(evidencePages.map((page) => page.title).join(", "))}">${icon("robot")} Auto-create</button>` : ""}
      </div>
    </article>
  `;
}

function renderVoiceDiaryHome(indexPage, chapters, locations, chapterBundle = {}) {
  const places = chapterBundle.featuredPlaces?.length ? chapterBundle.featuredPlaces : state.pages.filter((page) => page.category === "places").slice(0, 6);
  const people = chapterBundle.featuredPeople?.length ? chapterBundle.featuredPeople : state.pages.filter((page) => page.category === "people").slice(0, 6);
  const stats = chapterBundle.stats || null;
  return `
    <div class="article-shell">
      <section class="home-grid">
        <section class="home-panel">
          <div class="card-header">
            <p class="eyebrow">Narrative</p>
            <h3>All Chapters</h3>
          </div>
          <ol class="chapter-numbered-list">
            ${chapters.map((chapter, index) => `
              <li>
                <button class="text-link chapter-open" data-page-id="${escapeHtml(chapter.pageId || "")}">
                  <strong>${index + 1}. ${escapeHtml(chapter.title)}</strong>
                </button>
                <span>${escapeHtml(chapter.description || "")}</span>
              </li>
            `).join("")}
          </ol>
          <div class="rename-actions">
            <button class="ghost-button inline-action home-open-view" data-view="chapters">${icon("chapters")} Open all chapters</button>
          </div>
        </section>
        ${
          indexPage
            ? `
              <section class="home-panel compact-panel">
                <div class="card-header">
                  <p class="eyebrow">Index</p>
                  <h3>Wiki Breakdown</h3>
                </div>
                <p class="muted">See a full breakdown of all resources in the wiki, including people, places, chapters, topics, and travel notes.</p>
                ${stats ? `<div class="diary-index-facts">
                  <span>${escapeHtml(String(stats.entryCount || 0))} entries</span>
                  <span>${escapeHtml(String(stats.peopleCount || 0))} people</span>
                  <span>${escapeHtml(String(stats.placesCount || 0))} places</span>
                </div>` : ""}
                <div class="rename-actions">
                  <button class="ghost-button inline-action subtle-link home-open-page" data-page-id="${escapeHtml(indexPage.id)}">${icon("file")} Open index source</button>
                </div>
              </section>
            `
            : ""
        }
      </section>
      ${renderHomeRecentPanel(getRecentHomeItems(state.pages), indexPage, {
        escapeHtml,
        icon,
        formatDateLabel,
      })}
      <section class="home-panel">
        <div class="card-header">
          <p class="eyebrow">Map</p>
          <h3>Places across the diary</h3>
        </div>
        <div id="location-map" class="location-map">
          <div class="empty-state compact"><p>${locations.length ? "Loading map…" : "No mapped places yet."}</p></div>
        </div>
        <div id="location-map-stats" class="diary-map-stats">
          ${renderVoiceDiaryMapStats(null, stats)}
        </div>
      </section>
      ${renderHomeCategoryStrip({ name: "people", pages: people }, {
        escapeHtml,
        icon,
        getCategoryIconName,
      })}
      ${renderHomeCategoryStrip({ name: "places", pages: places }, {
        escapeHtml,
        icon,
        getCategoryIconName,
      })}
    </div>
  `;
}

function renderQuoteCard(quote) {
  const meta = quote.meta || quote.pageTitle || "";
  const projectLabel = quote.contextProject || quote.project || "";
  const tags = Array.isArray(quote.tags) ? quote.tags : [];
  return `
    <article class="quote-card">
      <p class="quote-mark">“</p>
      <blockquote>${escapeHtml(quote.text)}</blockquote>
      <div class="quote-meta">
        <strong>${escapeHtml(quote.speaker || "Unknown")}</strong>
        ${projectLabel ? `<span>${escapeHtml(projectLabel)}</span>` : ""}
      </div>
      ${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}
      <div class="tag-row">
        ${tags.map((tag) => `<span class="filter-chip static">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="rename-actions">
        <button class="ghost-button inline-action quote-open" data-project="${escapeHtml(projectLabel)}" data-page-id="${escapeHtml(quote.pageId)}">
          ${icon("quote")} Open source page
        </button>
      </div>
    </article>
  `;
}

function renderProjectsAdmin() {
  const route = parseHash(window.location.hash);
  if (route.mode === "new") {
    return renderProjectCreatePage({
      projectTemplates: state.projectTemplates,
      renderProjectCategoryInputs,
      renderRecencyBiasOptions,
      icon,
      defaultProjectPath,
    });
  }
  return renderProjectManagePage({
    projects: state.projects,
    selectedProjectName: route.selectedProject || state.projects[0]?.name || "",
    projectTemplates: state.projectTemplates,
    renderProjectManageListItem,
    renderProjectAdminCard,
    renderProjectCategoryInputs,
    renderRecencyBiasOptions,
    icon,
    defaultProjectPath,
  });
}

function renderAutoReorganizeProposalLoading() {
  return `<div class="empty-state compact"><p>Loading proposal...</p></div>`;
}

function scrollEditWorkspaceIntoView(editSurface) {
  const tabStrip = editSurface?.querySelector?.(".edit-tab-strip");
  const target = tabStrip || editSurface;
  if (!target?.scrollIntoView) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAutoReorganizeProposalError(message = "") {
  return `<div class="empty-state compact"><p>${escapeHtml(message || "Auto reorganize proposal failed to load.")}</p></div>`;
}

function getAutoReorganizeModal(panel) {
  return panel?.querySelector?.("[data-auto-reorganize-modal]") || null;
}

function getAutoReorganizeModalBody(panel) {
  return panel?.querySelector?.("[data-auto-reorganize-modal-body]")
    || panel?.querySelector?.("[data-auto-reorganize-content]")
    || null;
}

function getAutoReorganizeModalFocusableElements(panel) {
  const modal = getAutoReorganizeModal(panel);
  return Array.from(modal?.querySelectorAll?.(
    'button:not([disabled]), textarea:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ) || []).filter((element) => {
    if (element?.hidden || element?.classList?.contains?.("hidden")) {
      return false;
    }
    const hiddenAncestor = element?.closest?.("[hidden], .hidden");
    return !hiddenAncestor || hiddenAncestor === element;
  });
}

function focusAutoReorganizeActiveStep(panel) {
  const activeStep = Array.from(panel?.querySelectorAll?.("[data-auto-reorganize-step-panel]") || [])
    .find((stepPanel) => !stepPanel.hidden);
  if (!activeStep?.focus) {
    return;
  }
  try {
    activeStep.focus({ preventScroll: true });
  } catch (_error) {
    activeStep.focus();
  }
}

function scrollAutoReorganizeActiveStepIntoView(panel, options = {}) {
  const { behavior = "smooth" } = options;
  const modalBody = getAutoReorganizeModalBody(panel);
  const activeStep = Array.from(panel?.querySelectorAll?.("[data-auto-reorganize-step-panel]") || [])
    .find((stepPanel) => !stepPanel.hidden);
  if (!activeStep) {
    return;
  }
  if (modalBody && typeof activeStep.offsetTop === "number") {
    const nextTop = Math.max(activeStep.offsetTop - 12, 0);
    if (typeof modalBody.scrollTo === "function") {
      modalBody.scrollTo({ top: nextTop, behavior });
      return;
    }
    if (typeof modalBody.scrollTop === "number") {
      modalBody.scrollTop = nextTop;
      return;
    }
  }
  if (typeof activeStep.scrollIntoView === "function") {
    activeStep.scrollIntoView({ behavior, block: "start" });
    return;
  }
  resetAutoReorganizeModalScroll(panel);
}

function resetAutoReorganizeModalScroll(panel) {
  const modalBody = getAutoReorganizeModalBody(panel);
  if (!modalBody) {
    return;
  }
  if (typeof modalBody.scrollTo === "function") {
    modalBody.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  if (typeof modalBody.scrollTop === "number") {
    modalBody.scrollTop = 0;
  }
}

function isAutoReorganizeTextEditableElement(element) {
  const tagName = String(element?.tagName || "").trim().toLowerCase();
  if (element?.isContentEditable) {
    return true;
  }
  return ["input", "textarea", "select"].includes(tagName);
}

function handleAutoReorganizeModalScrollKey(panel, event) {
  const modalBody = getAutoReorganizeModalBody(panel);
  if (!modalBody || isAutoReorganizeTextEditableElement(document.activeElement)) {
    return false;
  }

  const pageStep = Math.max(Number(modalBody.clientHeight || 0) * 0.9, 120);
  let nextScrollTop = null;

  switch (event.key) {
    case "ArrowDown":
      nextScrollTop = Number(modalBody.scrollTop || 0) + 40;
      break;
    case "ArrowUp":
      nextScrollTop = Number(modalBody.scrollTop || 0) - 40;
      break;
    case "PageDown":
      nextScrollTop = Number(modalBody.scrollTop || 0) + pageStep;
      break;
    case "PageUp":
      nextScrollTop = Number(modalBody.scrollTop || 0) - pageStep;
      break;
    case "Home":
      nextScrollTop = 0;
      break;
    case "End":
      nextScrollTop = Number(modalBody.scrollHeight || modalBody.scrollTop || 0);
      break;
    default:
      return false;
  }

  event.preventDefault?.();
  if (typeof modalBody.scrollTo === "function") {
    modalBody.scrollTo({ top: nextScrollTop, behavior: "auto" });
    return true;
  }
  if (typeof modalBody.scrollBy === "function" && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "PageDown" || event.key === "PageUp")) {
    const currentTop = Number(modalBody.scrollTop || 0);
    modalBody.scrollBy({ top: nextScrollTop - currentTop, behavior: "auto" });
    return true;
  }
  if (typeof modalBody.scrollTop === "number") {
    modalBody.scrollTop = nextScrollTop;
    return true;
  }
  return true;
}

function trapAutoReorganizeModalFocus(panel, event) {
  if (getAutoReorganizeModal(panel)?.classList?.contains?.("hidden")) {
    return;
  }

  if (handleAutoReorganizeModalScrollKey(panel, event)) {
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = getAutoReorganizeModalFocusableElements(panel);
  if (!focusable.length) {
    return;
  }

  const activeIndex = focusable.indexOf(document.activeElement);
  const lastIndex = focusable.length - 1;
  if (event.shiftKey) {
    if (activeIndex <= 0) {
      event.preventDefault?.();
      focusable[lastIndex]?.focus?.();
    }
    return;
  }
  if (activeIndex === -1 || activeIndex === lastIndex) {
    event.preventDefault?.();
    focusable[0]?.focus?.();
  }
}

function handleAutoReorganizeDocumentKeydown(panel, event) {
  if (getAutoReorganizeModal(panel)?.classList?.contains?.("hidden")) {
    return;
  }

  const target = event?.target || document.activeElement;
  const modal = getAutoReorganizeModal(panel);
  const targetInsideModal = target === modal || target?.closest?.("[data-auto-reorganize-modal]") === modal;

  if (event.key === "Tab" && !targetInsideModal) {
    event.preventDefault?.();
    const focusable = getAutoReorganizeModalFocusableElements(panel);
    if (!focusable.length) {
      return;
    }
    const targetIndex = event.shiftKey ? focusable.length - 1 : 0;
    focusable[targetIndex]?.focus?.();
    return;
  }

  const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"]);
  if (scrollKeys.has(event.key) && !isAutoReorganizeTextEditableElement(target)) {
    handleAutoReorganizeModalScrollKey(panel, event);
  }
}

function setAutoReorganizeBackgroundInert(panel, open) {
  const modal = getAutoReorganizeModal(panel);
  if (!modal) {
    return;
  }

  if (!open) {
    (panel._autoReorganizeInertElements || []).forEach((element) => {
      element.inert = false;
    });
    panel._autoReorganizeInertElements = [];
    return;
  }

  const inertElements = [];
  let childOnModalPath = modal;
  let parent = modal.parentElement;
  while (parent && parent !== document.body) {
    Array.from(parent.children).forEach((child) => {
      if (child !== childOnModalPath && !child.inert) {
        child.inert = true;
        inertElements.push(child);
      }
    });
    childOnModalPath = parent;
    parent = parent.parentElement;
  }
  panel._autoReorganizeInertElements = inertElements;
}

function setAutoReorganizeModalOpen(panel, open, options = {}) {
  const modal = getAutoReorganizeModal(panel);
  if (!modal) {
    return;
  }

  const preservePreviousFocus = Boolean(options.preservePreviousFocus);
  if (open && !preservePreviousFocus) {
    panel._autoReorganizePreviousFocus = options.triggerButton || document.activeElement || null;
  }

  modal.classList.toggle("hidden", !open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
  modal.onkeydown = open ? (event) => trapAutoReorganizeModalFocus(panel, event) : null;
  setAutoReorganizeBackgroundInert(panel, open);

  if (open) {
    if (!panel._autoReorganizeDocumentKeydownHandler) {
      panel._autoReorganizeDocumentKeydownHandler = (event) => handleAutoReorganizeDocumentKeydown(panel, event);
    }
    document.addEventListener("keydown", panel._autoReorganizeDocumentKeydownHandler, true);
    getAutoReorganizeModalFocusableElements(panel)[0]?.focus?.();
    return;
  }

  if (panel._autoReorganizeDocumentKeydownHandler) {
    document.removeEventListener("keydown", panel._autoReorganizeDocumentKeydownHandler, true);
  }
  const previousFocus = panel._autoReorganizePreviousFocus;
  panel._autoReorganizePreviousFocus = null;
  previousFocus?.focus?.();
}

function listAutoReorganizeWizardSteps(panel) {
  return Array.from(panel?.querySelectorAll?.("[data-auto-reorganize-step-panel]") || [])
    .map((stepPanel) => String(stepPanel?.dataset?.autoReorganizeStepPanel || "").trim())
    .filter(Boolean);
}

function canNavigateToAutoReorganizeStep(panel, requestedStep) {
  return listAutoReorganizeWizardSteps(panel).includes(String(requestedStep || "").trim());
}

function setAutoReorganizeWizardStep(panel, requestedStep, options = {}) {
  closeAutoReorganizeStatHelp(panel);
  const reviewState = captureAutoReorganizeReviewState(panel) || {
    hasSnapshot: true,
    openSectionKeys: [],
    approvedPageIds: [],
    moveCandidateFocus: "all",
    categoryChangeDispositions: {},
    stepDecisions: {},
  };
  reviewState.currentWizardStep = requestedStep;
  restoreAutoReorganizeReviewState(panel, reviewState);
  updateAutoReorganizeApplyButton(panel);
  if (options.resetScroll !== false) {
    resetAutoReorganizeModalScroll(panel);
  }
  if (options.scrollIntoView !== false) {
    scrollAutoReorganizeActiveStepIntoView(panel, { behavior: options.scrollBehavior || "smooth" });
  }
  if (options.focusActiveStep) {
    focusAutoReorganizeActiveStep(panel);
  }
}

function openAutoReorganizeStatHelp(panel, statKey) {
  const dialog = panel?.querySelector?.("[data-auto-reorganize-stat-help-dialog]");
  if (!dialog) {
    return;
  }
  const triggers = Array.from(panel?.querySelectorAll?.("[data-auto-reorganize-stat-help-trigger]") || []);
  const trigger = triggers.find((item) => String(item?.dataset?.autoReorganizeStatHelpTrigger || "").trim() === String(statKey || "").trim());
  triggers.forEach((item) => {
    item?.setAttribute?.("aria-expanded", item === trigger ? "true" : "false");
  });
  const title = trigger?.dataset?.autoReorganizeStatHelpTitle
    || trigger?.querySelector?.("span")?.textContent?.trim()
    || "Proposal stat";
  const body = trigger?.dataset?.autoReorganizeStatHelpBody || trigger?.getAttribute?.("aria-label") || "";
  const titleEl = dialog.querySelector?.("[data-auto-reorganize-stat-help-title]");
  const bodyEl = dialog.querySelector?.("[data-auto-reorganize-stat-help-body]");
  if (titleEl) {
    titleEl.textContent = title;
  }
  if (bodyEl) {
    bodyEl.textContent = body;
  }
  dialog.classList.remove("hidden");
  dialog.setAttribute("aria-hidden", "false");
}

function closeAutoReorganizeStatHelp(panel) {
  const dialog = panel?.querySelector?.("[data-auto-reorganize-stat-help-dialog]");
  if (!dialog) {
    return;
  }
  Array.from(panel?.querySelectorAll?.("[data-auto-reorganize-stat-help-trigger]") || []).forEach((item) => {
    item?.setAttribute?.("aria-expanded", "false");
  });
  dialog.classList.add("hidden");
  dialog.setAttribute("aria-hidden", "true");
}

function handleAutoReorganizeStepDecision(panel, stepKey, decision) {
  const reviewState = captureAutoReorganizeReviewState(panel) || {
    hasSnapshot: true,
    openSectionKeys: [],
    approvedPageIds: [],
    moveCandidateFocus: "all",
    categoryChangeDispositions: {},
    stepDecisions: {},
  };
  reviewState.stepDecisions = {
    ...(reviewState.stepDecisions || {}),
    [stepKey]: decision,
  };
  const stepOrder = Array.from(
    panel.querySelectorAll("[data-auto-reorganize-step-panel]")
  ).map((stepPanel) => String(stepPanel?.dataset?.autoReorganizeStepPanel || "").trim()).filter(Boolean);
  const currentIndex = stepOrder.indexOf(stepKey);
  if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
    reviewState.currentWizardStep = stepOrder[currentIndex + 1];
  } else {
    reviewState.currentWizardStep = stepKey;
  }
  restoreAutoReorganizeReviewState(panel, reviewState);
  updateAutoReorganizeApplyButton(panel);
  scrollAutoReorganizeActiveStepIntoView(panel, { behavior: "smooth" });
  focusAutoReorganizeActiveStep(panel);
}

function updateAutoReorganizeApplyButton(panel) {
  const applyButton = panel?.querySelector("[data-auto-reorganize-apply-button]");
  if (!applyButton) {
    return;
  }

  const selectedCount = panel.querySelectorAll("[data-auto-reorganize-approve]:checked").length;
  applyButton.disabled = selectedCount === 0;
}

function updateAutoReorganizeBatchApproveButton(panel) {
  const batchButton = panel?.querySelector?.("[data-auto-reorganize-approve-visible]");
  if (!batchButton) {
    return;
  }

  const visibleUncheckedReadyCount = Array.from(panel.querySelectorAll("[data-auto-reorganize-approve]")).filter((input) => {
    if (input?.checked) {
      return false;
    }
    const candidate = input.closest?.("[data-auto-reorganize-move-candidate]");
    return !candidate?.hidden;
  }).length;
  batchButton.disabled = visibleUncheckedReadyCount === 0;
}

function bindAutoReorganizePanel(panel) {
  if (!panel) {
    return;
  }

  if (!panel.dataset.autoReorganizePanelBound) {
    panel.dataset.autoReorganizePanelBound = "true";
    panel.addEventListener("change", () => {
      applyAutoReorganizeMoveFocus(panel);
      syncAutoReorganizeCategoryChangeSummary(panel);
      syncAutoReorganizeLandingActionSummary(panel);
      updateAutoReorganizeApplyButton(panel);
      updateAutoReorganizeBatchApproveButton(panel);
    });
    panel.addEventListener("click", (event) => {
      const closeButton = event.target.closest?.("[data-auto-reorganize-close]");
      if (closeButton) {
        setAutoReorganizeModalOpen(panel, false);
        return;
      }

      const statHelpClose = event.target.closest?.("[data-auto-reorganize-stat-help-close]");
      if (statHelpClose) {
        closeAutoReorganizeStatHelp(panel);
        return;
      }

      const statHelpTrigger = event.target.closest?.("[data-auto-reorganize-stat-help-trigger]");
      if (statHelpTrigger) {
        const dialog = panel.querySelector?.("[data-auto-reorganize-stat-help-dialog]");
        const alreadyOpen = dialog && !dialog.classList?.contains?.("hidden");
        if (alreadyOpen && statHelpTrigger.getAttribute?.("aria-expanded") === "true") {
          closeAutoReorganizeStatHelp(panel);
          return;
        }
        openAutoReorganizeStatHelp(panel, String(statHelpTrigger.dataset.autoReorganizeStatHelpTrigger || "").trim());
        return;
      }

      const stepChoiceButton = event.target.closest?.("[data-auto-reorganize-step-choice]");
      if (stepChoiceButton) {
        handleAutoReorganizeStepDecision(
          panel,
          String(stepChoiceButton.dataset.autoReorganizeStepKey || "").trim(),
          String(stepChoiceButton.dataset.autoReorganizeStepChoice || "").trim()
        );
        return;
      }

      const batchApproveButton = event.target.closest?.("[data-auto-reorganize-approve-visible]");
      if (batchApproveButton && !batchApproveButton.disabled) {
        Array.from(panel.querySelectorAll("[data-auto-reorganize-approve]")).forEach((input) => {
          const candidate = input.closest?.("[data-auto-reorganize-move-candidate]");
          if (!candidate?.hidden) {
            input.checked = true;
          }
        });
        updateAutoReorganizeApplyButton(panel);
        updateAutoReorganizeBatchApproveButton(panel);
        return;
      }

      const prevButton = event.target.closest?.("[data-auto-reorganize-prev]");
      if (prevButton) {
        const stepOrder = Array.from(
          panel.querySelectorAll("[data-auto-reorganize-step-panel]")
        ).map((stepPanel) => String(stepPanel?.dataset?.autoReorganizeStepPanel || "").trim()).filter(Boolean);
        const currentIndex = stepOrder.indexOf(String(prevButton.dataset.autoReorganizePrev || "").trim());
        if (currentIndex > 0) {
          setAutoReorganizeWizardStep(panel, stepOrder[currentIndex - 1], { focusActiveStep: true });
        }
        return;
      }

      const nextButton = event.target.closest?.("[data-auto-reorganize-next]");
      if (nextButton && !nextButton.disabled) {
        const stepOrder = Array.from(
          panel.querySelectorAll("[data-auto-reorganize-step-panel]")
        ).map((stepPanel) => String(stepPanel?.dataset?.autoReorganizeStepPanel || "").trim()).filter(Boolean);
        const currentIndex = stepOrder.indexOf(String(nextButton.dataset.autoReorganizeNext || "").trim());
        if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
          setAutoReorganizeWizardStep(panel, stepOrder[currentIndex + 1], { focusActiveStep: true });
        }
        return;
      }

      const stepLink = event.target.closest?.("[data-auto-reorganize-step-link]");
      if (stepLink) {
        const requestedStep = String(stepLink.dataset.autoReorganizeStepLink || "").trim();
        if (!canNavigateToAutoReorganizeStep(panel, requestedStep)) {
          showToast("Choose an option on each earlier step before jumping ahead");
          return;
        }
        setAutoReorganizeWizardStep(panel, requestedStep, { focusActiveStep: true });
      }
    });
  }

  const form = panel.querySelector("[data-auto-reorganize-apply-form]");
  if (form && !form.dataset.autoReorganizeBound) {
    form.dataset.autoReorganizeBound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitAutoReorganizeApply(form);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Auto reorganize apply failed");
      }
    });
    updateAutoReorganizeApplyButton(panel);
    updateAutoReorganizeBatchApproveButton(panel);
  }
}

async function loadAutoReorganizeProposal(button, options = {}) {
  const projectName = String(button?.dataset?.autoReorganizeLoad || "").trim();
  const panel = button?.closest("[data-auto-reorganize-panel]");
  const content = panel?.querySelector?.("[data-auto-reorganize-modal-body]")
    || panel?.querySelector?.("[data-auto-reorganize-content]");
  if (!projectName || !content) {
    return;
  }

  const priorReviewState = options.preserveReviewState === false
    ? null
    : captureAutoReorganizeReviewState(panel);
  const applyResult = options.applyResult || panel._autoReorganizeLastApplyResult || null;
  if (options.applyResult) {
    panel._autoReorganizeLastApplyResult = options.applyResult;
  }

  const originalMarkup = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `${icon("sparkles")} Loading...`;
  content.innerHTML = renderAutoReorganizeProposalLoading();
  if (typeof setAutoReorganizeModalOpen === "function") {
    const modalAlreadyOpen = !getAutoReorganizeModal(panel)?.classList?.contains?.("hidden");
    setAutoReorganizeModalOpen(panel, true, { triggerButton: button, preservePreviousFocus: modalAlreadyOpen });
  }

  try {
    const data = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/auto-reorganize/proposal`);
    const proposal = data.proposal || {};
    const approvalDriftSummary = buildAutoReorganizeApprovalDriftSummary(proposal, priorReviewState, applyResult);
    content.innerHTML = renderAutoReorganizeProposalReview(data.proposal || {}, {
      applyResult,
      approvalDriftSummary,
      moveCandidateFocus: priorReviewState?.moveCandidateFocus,
      currentWizardStep: priorReviewState?.currentWizardStep,
      stepDecisions: priorReviewState?.stepDecisions,
      categoryChangeDispositions: priorReviewState?.categoryChangeDispositions,
      landingActionSelections: priorReviewState?.landingActionSelections,
    });
    bindAutoReorganizePanel(panel);
    restoreAutoReorganizeReviewState(panel, priorReviewState);
    applyAutoReorganizeMoveFocus(panel, priorReviewState?.moveCandidateFocus);
    updateAutoReorganizeApplyButton(panel);
    button.innerHTML = `${icon("sparkles")} Refresh Wizard`;
  } catch (error) {
    console.error(error);
    content.innerHTML = renderAutoReorganizeProposalError(error.message || "Auto reorganize proposal failed to load.");
    button.innerHTML = originalMarkup;
    showToast(error.message || "Auto reorganize proposal failed to load");
  } finally {
    button.disabled = false;
  }
}

async function submitAutoReorganizeApply(form) {
  const panel = form?.closest("[data-auto-reorganize-panel]");
  const projectName = String(panel?.dataset?.autoReorganizePanel || "").trim();
  const refreshButton = panel?.querySelector("[data-auto-reorganize-load]");
  if (!projectName || !panel || !refreshButton) {
    throw new Error("Auto reorganize panel is unavailable");
  }

  const approvedPageIds = Array.from(panel.querySelectorAll("[data-auto-reorganize-approve]:checked"))
    .map((input) => String(input.value || "").trim())
    .filter(Boolean);
  if (!approvedPageIds.length) {
    throw new Error("Select at least one move candidate to apply");
  }

  const applyButton = form.querySelector("[data-auto-reorganize-apply-button]");
  const originalLabel = applyButton?.textContent || "Apply approved page moves";
  if (applyButton) {
    applyButton.disabled = true;
    applyButton.textContent = "Applying...";
  }

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/auto-reorganize/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedPageIds }),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "Auto reorganize apply failed");
    }

    const applyResult = data.apply || {};
    const applySummaryParts = [`Applied ${applyResult.appliedCount || 0} move(s)`];
    if (applyResult.blockedCount) {
      applySummaryParts.push(`${applyResult.blockedCount} blocked`);
    }
    if (applyResult.skippedCount) {
      applySummaryParts.push(`${applyResult.skippedCount} skipped`);
    }
    showToast(applySummaryParts.join(" • "));
    await loadAutoReorganizeProposal(refreshButton, { applyResult });
  } finally {
    if (applyButton) {
      applyButton.textContent = originalLabel;
    }
    updateAutoReorganizeApplyButton(panel);
  }
}

function renderChapterCard(chapter) {
  return `
    <article class="chapter-card">
      <div class="chapter-topline">
        <p class="eyebrow">Chapter</p>
        <span class="filter-chip static">${escapeHtml(formatChapterRange(chapter.date_range))}</span>
      </div>
      <h3>${escapeHtml(chapter.title)}</h3>
      <p class="muted">${escapeHtml(chapter.description || "")}</p>
      <p>${escapeHtml(chapter.narrative || "")}</p>
      <div class="location-grid compact">
        ${(chapter.locationDetails || []).map(renderLocationCard).join("")}
      </div>
      <div class="chapter-entries">
        <h4>Entries</h4>
        <ul>
          ${chapter.entries.map((entry) => `<li><button class="chapter-open text-link" data-page-id="${escapeHtml(entry.id)}">${escapeHtml(entry.title)}</button></li>`).join("")}
        </ul>
      </div>
      ${chapter.pageId ? `<div class="rename-actions"><button class="ghost-button inline-action chapter-open" data-page-id="${escapeHtml(chapter.pageId)}">${icon("file")} Open chapter page</button></div>` : ""}
    </article>
  `;
}

function renderAiEditPanel({ targetType, pageId = "", heading, description }) {
  return `
    <section class="ai-edit-panel">
      <div class="card-header">
        <p class="eyebrow">${icon("robot")} ${escapeHtml(heading)}</p>
        <h3>${escapeHtml(description)}</h3>
      </div>
      <form class="ai-edit-form" data-target-type="${escapeHtml(targetType)}" data-page-id="${escapeHtml(pageId)}">
        <label class="field">
          <span>What should change?</span>
          <textarea name="instructions" rows="6" placeholder="Describe the edits you want Codex to make"></textarea>
        </label>
        <div class="rename-actions">
          <button type="submit" class="primary-button">${icon("robot")} AI Edit</button>
        </div>
      </form>
      <div class="ai-edit-console hidden">
        <div class="ai-edit-status">Idle</div>
        <pre class="ai-edit-output"></pre>
      </div>
    </section>
  `;
}

function renderChapterTimelineItem(chapter) {
  return `
    <button class="timeline-card chapter-open" data-page-id="${escapeHtml(chapter.pageId || "")}">
      <span class="eyebrow">${escapeHtml(formatChapterRange(chapter.date_range))}</span>
      <strong>${escapeHtml(chapter.title)}</strong>
      <span>${escapeHtml(chapter.description || "")}</span>
    </button>
  `;
}

function renderLocationChip(location) {
  const pageId =
    location.placePageId ||
    location.apartmentPageId ||
    location.pageId ||
    "";
  const countryHash = location.fallbackCountry
    ? buildCountryPlacesHash(state.currentProject?.name, location.fallbackCountry)
    : "";
  const actionAttrs = pageId
    ? `class="location-card location-open" data-page-id="${escapeHtml(pageId)}"`
    : countryHash
      ? `class="location-card country-places-open" data-country="${escapeHtml(location.fallbackCountry)}"`
      : `class="location-card"`;
  const tagName = pageId || countryHash ? "button" : "div";
  return `
    <${tagName} ${actionAttrs}>
      ${location.image ? `<img class="location-card-image" src="${escapeHtml(location.image.url)}" alt="${escapeHtml(location.name)}" />` : ""}
      <strong>${escapeHtml(location.name)}</strong>
      <span class="location-count">${location.mentions.length} mention${location.mentions.length === 1 ? "" : "s"}</span>
      ${
        location.image?.label
          ? `<small class="location-card-label">${escapeHtml(location.image.label)}</small>`
          : location.fallbackCountry
            ? `<small class="location-card-label">${escapeHtml(location.fallbackPlacesCount)} place${location.fallbackPlacesCount === 1 ? "" : "s"} in ${escapeHtml(location.fallbackCountry)}</small>`
            : ""
      }
    </${tagName}>
  `;
}

function renderLocationCard(location) {
  const pageId =
    location.placePageId ||
    location.apartmentPageId ||
    location.pageId ||
    "";
  const countryFallback = location.fallbackCountry || "";
  const Tag = pageId || countryFallback ? "button" : "div";
  const interactive = pageId
    ? ` class="location-card location-open" data-page-id="${escapeHtml(pageId)}"`
    : countryFallback
      ? ` class="location-card country-places-open" data-country="${escapeHtml(countryFallback)}"`
      : ` class="location-card"`;
  const sublabel = location.apartmentTitle || location.pageTitle || `${location.mentions?.length || 0} mentions`;
  return `
    <${Tag}${interactive}>
      ${location.image ? `<img class="location-card-image" src="${escapeHtml(location.image.url)}" alt="${escapeHtml(location.name)}" />` : ""}
      <strong>${escapeHtml(location.name)}</strong>
      <span class="location-count">${escapeHtml(sublabel)}</span>
      ${
        location.image?.label
          ? `<small class="location-card-label">${escapeHtml(location.image.label)}</small>`
          : countryFallback
            ? `<small class="location-card-label">${escapeHtml(location.fallbackPlacesCount)} place${location.fallbackPlacesCount === 1 ? "" : "s"} in ${escapeHtml(countryFallback)}</small>`
            : ""
      }
    </${Tag}>
  `;
}

function renderGraph(nodes, links) {
  graphCanvas.innerHTML = "";
  renderGraphControls(nodes, links);
  const graphQuery = state.graphSearchQuery.trim().toLowerCase();
  const visibleNodeIds = new Set(nodes
    .filter((node) => !state.graphCategoryFilter || node.category === state.graphCategoryFilter)
    .filter((node) => {
      if (!graphQuery) {
        return true;
      }
      return `${node.title || ""} ${node.label || ""} ${node.category || ""} ${node.excerpt || ""}`.toLowerCase().includes(graphQuery);
    })
    .map((node) => node.id));
  const visibleNodes = nodes
    .filter((node) => visibleNodeIds.has(node.id))
    .map((node) => ({ ...node }));
  const visibleLinks = links
    .map((link) => ({
      source: typeof link.source === "object" ? link.source.id : link.source,
      target: typeof link.target === "object" ? link.target.id : link.target,
    }))
    .filter((link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target));
  const width = graphCanvas.clientWidth || 900;
  const compactGraph = width < 640 || window.matchMedia?.("(max-width: 640px)")?.matches;
  const height = compactGraph
    ? Math.max(window.innerHeight - 360, 380)
    : Math.max(window.innerHeight - 240, 540);
  const svg = d3.select(graphCanvas).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("class", "graph-svg");
  addGraphArrowMarker(svg);
  const color = d3.scaleOrdinal()
    .domain(nodes.map((node) => node.category))
    .range(["#0f766e", "#1d4ed8", "#b45309", "#7c3aed", "#be123c", "#065f46", "#334155", "#4f46e5"]);
  renderGraphLegend(nodes, color);

  const simulation = d3.forceSimulation(visibleNodes)
    .force("link", d3.forceLink(visibleLinks).id((d) => d.id).distance(88).strength(0.5))
    .force("charge", d3.forceManyBody().strength(-280))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(28));

  const link = svg.append("g").attr("stroke", "rgba(71, 85, 105, 0.4)").selectAll("line").data(visibleLinks).join("line").attr("stroke-width", 1.2).attr("marker-end", "url(#graph-arrow)");
  const node = svg.append("g").selectAll("g").data(visibleNodes).join("g").attr("class", "graph-node").style("cursor", "pointer").on("click", (_event, datum) => openPage(datum.id));

  node.append("circle").attr("r", 10).attr("fill", (datum) => color(datum.category)).attr("stroke", "#f8fafc").attr("stroke-width", 1.5);
  node.append("text").text(graphNodeLabel).attr("x", 14).attr("y", 4).attr("fill", "#0f172a").attr("font-size", 12);
  node.call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));

  simulation.on("tick", () => {
    link.attr("x1", (datum) => datum.source.x).attr("y1", (datum) => datum.source.y).attr("x2", (datum) => datum.target.x).attr("y2", (datum) => datum.target.y);
    node.attr("transform", (datum) => `translate(${datum.x},${datum.y})`);
  });

  function dragStarted(event) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

function renderGraphControls(nodes, links) {
  if (!graphControls) {
    return;
  }
  const categories = Array.from(new Set(nodes.map((node) => node.category).filter(Boolean))).sort();
  const graphQuery = state.graphSearchQuery.trim().toLowerCase();
  const visibleCount = nodes
    .filter((node) => !state.graphCategoryFilter || node.category === state.graphCategoryFilter)
    .filter((node) => {
      if (!graphQuery) {
        return true;
      }
      return `${node.title || ""} ${node.label || ""} ${node.category || ""} ${node.excerpt || ""}`.toLowerCase().includes(graphQuery);
    }).length;
  graphControls.innerHTML = `
    <label class="field graph-filter-field">
      <span>Category filter</span>
      <select id="graph-category-filter">
        <option value="">All categories (${escapeHtml(String(nodes.length))})</option>
        ${categories.map((category) => `
          <option value="${escapeHtml(category)}" ${category === state.graphCategoryFilter ? "selected" : ""}>
            ${escapeHtml(formatProjectName(category))} (${escapeHtml(String(nodes.filter((node) => node.category === category).length))})
          </option>
        `).join("")}
      </select>
    </label>
    <label class="field graph-filter-field">
      <span>Search graph</span>
      <input id="graph-search" type="search" value="${escapeHtml(state.graphSearchQuery)}" placeholder="Find nodes by title or category" />
    </label>
    <p class="filter-status muted">${escapeHtml(String(visibleCount))} visible ${visibleCount === 1 ? "node" : "nodes"} · ${escapeHtml(String(links.length))} total links</p>
  `;
  graphControls.querySelector("#graph-category-filter")?.addEventListener("change", (event) => {
    state.graphCategoryFilter = event.target.value;
    renderGraph(nodes, links);
  });
  graphControls.querySelector("#graph-search")?.addEventListener("input", (event) => {
    state.graphSearchQuery = event.target.value;
    renderGraph(nodes, links);
    graphControls.querySelector("#graph-search")?.focus();
  });
}

function renderGraphLegend(nodes, color) {
  if (!graphLegend) {
    return;
  }
  const counts = new Map();
  for (const node of nodes) {
    const category = node.category || "uncategorized";
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  graphLegend.innerHTML = Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, count]) => `
      <span class="graph-legend-item">
        <span class="graph-legend-swatch" style="background:${escapeHtml(color(category))}"></span>
        ${escapeHtml(formatProjectName(category))}
        <small>${escapeHtml(String(count))}</small>
      </span>
    `)
    .join("");
}

async function fetchProjectGraphData(projectName) {
  const cached = state.graphDataCache.get(projectName);
  if (cached) {
    return cached;
  }
  const data = await fetchJson(`/api/projects/${encodeURIComponent(projectName)}/graph`);
  state.graphDataCache.set(projectName, data);
  return data;
}

function renderFocusedGraph(mount, nodes, links, centerId, maxDepth = 2) {
  const focused = buildFocusedGraph(nodes, links, centerId, maxDepth);
  if (!focused.nodes.length) {
    mount.innerHTML = `<div class="empty-state compact"><p>No nearby graph connections found for this page.</p></div>`;
    return focused;
  }

  mount.innerHTML = "";
  const width = mount.clientWidth || 720;
  const height = 320;
  const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("class", "graph-svg mini");
  addGraphArrowMarker(svg);
  const color = d3.scaleOrdinal()
    .domain(focused.nodes.map((node) => node.category))
    .range(["#0f766e", "#1d4ed8", "#b45309", "#7c3aed", "#be123c", "#065f46", "#334155", "#4f46e5"]);
  const centerNode = focused.nodes.find((node) => node.id === centerId);
  if (centerNode) {
    centerNode.fx = width / 2;
    centerNode.fy = height / 2;
    centerNode.x = width / 2;
    centerNode.y = height / 2;
  }

  const simulation = d3.forceSimulation(focused.nodes)
    .force("link", d3.forceLink(focused.links).id((d) => d.id).distance(74).strength(0.75))
    .force("charge", d3.forceManyBody().strength(-250))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius((node) => node.id === centerId ? 24 : 18));

  const link = svg.append("g").attr("stroke", "rgba(71, 85, 105, 0.34)").selectAll("line").data(focused.links).join("line").attr("stroke-width", 1.2).attr("marker-end", "url(#graph-arrow)");
  const node = svg.append("g").selectAll("g").data(focused.nodes).join("g").attr("class", "graph-node").style("cursor", "pointer").on("click", (_event, datum) => openPage(datum.id));

  node.append("circle")
    .attr("r", (datum) => datum.id === centerId ? 13 : datum.depth === 1 ? 10 : 8)
    .attr("fill", (datum) => datum.id === centerId ? "#111827" : color(datum.category))
    .attr("stroke", "#f8fafc")
    .attr("stroke-width", 1.5);
  node.append("text")
    .text(graphNodeLabel)
    .attr("x", (datum) => datum.id === centerId ? 18 : 14)
    .attr("y", 4)
    .attr("fill", "#0f172a")
    .attr("font-size", (datum) => datum.id === centerId ? 13 : 11)
    .attr("font-weight", (datum) => datum.id === centerId ? 700 : 500);
  node.call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));

  simulation.on("tick", () => {
    link
      .attr("x1", (datum) => datum.source.x)
      .attr("y1", (datum) => datum.source.y)
      .attr("x2", (datum) => datum.target.x)
      .attr("y2", (datum) => datum.target.y);
    node.attr("transform", (datum) => `translate(${datum.x},${datum.y})`);
  });

  function dragStarted(event) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    if (event.subject.id === centerId) {
      event.subject.fx = width / 2;
      event.subject.fy = height / 2;
      return;
    }
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return focused;
}

function renderFocusedGraphList(mount, focused, centerId) {
  if (!mount) {
    return;
  }

  const nearbyNodes = (focused?.nodes || [])
    .filter((node) => node.id && node.id !== centerId)
    .sort((left, right) => {
      const depthDiff = (left.depth || 0) - (right.depth || 0);
      if (depthDiff) {
        return depthDiff;
      }
      return graphNodeLabel(left).localeCompare(graphNodeLabel(right));
    })
    .slice(0, 12);

  if (!nearbyNodes.length) {
    mount.innerHTML = `<div class="empty-state compact"><p>No nearby pages found.</p></div>`;
    return;
  }

  mount.innerHTML = `
    <div class="card-header compact">
      <p class="eyebrow">Nearby Pages</p>
      <h3>Text navigation from this graph</h3>
    </div>
    <div class="related-grid mini-graph-page-list">
      ${nearbyNodes.map((node) => {
        const category = node.category || "page";
        const distance = node.depth === 1 ? "Direct" : "Second degree";
        return `
          <button class="link-card" data-page-id="${escapeHtml(node.id)}">
            <div class="link-card-badges">
              <span class="type-badge">${escapeHtml(formatProjectName(category))}</span>
              <span class="type-badge subtle">${escapeHtml(distance)}</span>
            </div>
            <strong>${escapeHtml(graphNodeLabel(node))}</strong>
            <span>${escapeHtml(node.excerpt || node.id)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function graphNodeLabel(datum) {
  return datum?.label || datum?.title || datum?.id || "";
}

function addGraphArrowMarker(svg) {
  svg.append("defs")
    .append("marker")
    .attr("id", "graph-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 18)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "rgba(71, 85, 105, 0.62)");
}

function buildFocusedGraph(nodes, links, centerId, maxDepth = 2) {
  const byId = new Map(nodes.map((node) => [node.id, { ...node }]));
  const adjacency = new Map();
  for (const link of links) {
    const source = typeof link.source === "object" ? link.source.id : link.source;
    const target = typeof link.target === "object" ? link.target.id : link.target;
    if (!adjacency.has(source)) adjacency.set(source, new Set());
    if (!adjacency.has(target)) adjacency.set(target, new Set());
    adjacency.get(source).add(target);
    adjacency.get(target).add(source);
  }

  const queue = [{ id: centerId, depth: 0 }];
  const depths = new Map([[centerId, 0]]);
  while (queue.length) {
    const current = queue.shift();
    const neighbors = Array.from(adjacency.get(current.id) || []);
    for (const neighbor of neighbors) {
      const nextDepth = current.depth + 1;
      if (nextDepth > maxDepth || depths.has(neighbor)) {
        continue;
      }
      depths.set(neighbor, nextDepth);
      queue.push({ id: neighbor, depth: nextDepth });
    }
  }

  const focusedNodes = Array.from(depths.entries())
    .map(([id, depth]) => ({ ...byId.get(id), depth }))
    .filter(Boolean);
  const focusedIds = new Set(focusedNodes.map((node) => node.id));
  const focusedLinks = links
    .map((link) => ({
      source: typeof link.source === "object" ? link.source.id : link.source,
      target: typeof link.target === "object" ? link.target.id : link.target,
    }))
    .filter((link) => focusedIds.has(link.source) && focusedIds.has(link.target));

  return {
    nodes: focusedNodes,
    links: focusedLinks,
  };
}

function wireDynamicUi() {
  if (!articleView.querySelector(".project-config-form")) {
    state.activeProjectConfigForm = null;
    state.activeProjectConfigInitialSignature = null;
    if (state.projectAiFillReviewOpen) {
      closeProjectAiFillReviewModal();
    }
  }
  articleView.querySelectorAll("a[href^='#/project/']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setHash(link.getAttribute("href").slice(1));
    });
  });

  const renameForm = articleView.querySelector("#rename-form");
  if (renameForm) {
    const syncRenamePlainTextState = () => {
      const enabled = renameForm.elements.replacePlainText.checked;
      renameForm.elements.replaceTextFrom.disabled = !enabled;
      renameForm.elements.replaceTextTo.disabled = !enabled;
    };

    renameForm.elements.title.addEventListener("input", () => {
      renameForm.elements.slug.value = slugify(renameForm.elements.title.value);
      renameForm.elements.replaceTextTo.value = inferRenameBase(renameForm.elements.title.value);
    });
    renameForm.elements.replacePlainText.addEventListener("change", syncRenamePlainTextState);
    syncRenamePlainTextState();

    renameForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitRename(renameForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Rename failed");
      }
    });
  }

  const composeForm = articleView.querySelector("#compose-form");
  if (composeForm) {
    composeForm.elements.title.addEventListener("input", () => {
      composeForm.elements.slug.value = slugify(composeForm.elements.title.value);
    });

    composeForm.elements.mode.addEventListener("change", () => {
      updateComposeMode(composeForm);
    });
    setupComposeImageInput(composeForm);
    setupComposeRoutingPanel(composeForm);
    setupComposeCategoryPreview(composeForm);
    updateComposeMode(composeForm);

    composeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitCreate(composeForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Create failed");
      }
    });
  }

  const projectCreateForm = articleView.querySelector("#project-create-form");
  if (projectCreateForm) {
    initializeProjectCreateForm(projectCreateForm);
    projectCreateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitProjectCreate(projectCreateForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project create failed");
      }
    });
  }

  const projectImportForm = articleView.querySelector("#project-import-form");
  if (projectImportForm) {
    projectImportForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitProjectImport(projectImportForm, projectCreateForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project import failed");
      }
    });
  }

  articleView.querySelectorAll(".project-config-form").forEach((form) => {
    initializeProjectConfigForm(form);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitProjectConfig(form);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project update failed");
      }
    });
  });

  articleView.querySelectorAll(".project-fork-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitProjectFork(form);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project fork failed");
      }
    });
  });

  articleView.querySelectorAll(".project-delete-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitProjectDelete(form);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project delete failed");
      }
    });
  });

  articleView.querySelectorAll("[data-project-manage-select]").forEach((button) => {
    button.addEventListener("click", () => {
      setHash(`/projects/edit/${encodeURIComponent(button.dataset.projectManageSelect || "")}`);
    });
  });
  articleView.querySelectorAll("[data-auto-reorganize-load]").forEach((button) => {
    button.addEventListener("click", async () => {
      await loadAutoReorganizeProposal(button);
    });
  });
  const projectAdminTabActivators = new Map();
  articleView.querySelectorAll(".project-admin-card").forEach((card) => {
    projectAdminTabActivators.set(card, initializeProjectAdminTabs(card));
  });

  const claudeForm = articleView.querySelector("#claude-form");
  if (claudeForm) {
    claudeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitClaude(claudeForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Save failed");
      }
    });
  }

  const pageEditorForm = articleView.querySelector("#page-editor-form");
  if (pageEditorForm) {
    pageEditorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitPageEdit(pageEditorForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Save failed");
      }
    });
  }

  const pageAliasesForm = articleView.querySelector("#page-aliases-form");
  if (pageAliasesForm) {
    pageAliasesForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitPageAliases(pageAliasesForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Alias save failed");
      }
    });
  }

  const personProfileForm = articleView.querySelector("#person-profile-form");
  if (personProfileForm) {
    personProfileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitPersonProfile(personProfileForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Profile save failed");
      }
    });
    personProfileForm.querySelector("#fetch-person-website")?.addEventListener("click", async () => {
      try {
        await submitPersonWebsiteFetch(personProfileForm);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Website fetch failed");
      }
    });
  }

  const editTabTriggers = articleView.querySelectorAll("[data-edit-tab-trigger]");
  if (editTabTriggers.length) {
    const editTabPanels = articleView.querySelectorAll("[data-edit-tab-panel]");
    const defaultEditTab = editTabTriggers[0]?.dataset?.editTabTrigger || "profile";
    const activateEditTab = (tabName) => {
      editTabTriggers.forEach((button) => {
        const active = button.dataset.editTabTrigger === tabName;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      editTabPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.editTabPanel !== tabName);
      });
    };

    editTabTriggers.forEach((button) => {
      button.addEventListener("click", () => activateEditTab(button.dataset.editTabTrigger || defaultEditTab));
    });
    activateEditTab(defaultEditTab);
  }

  const toggleEditSurface = document.querySelector("#toggle-edit-surface");
  const editSurface = articleView.querySelector("#edit-surface");
  if (toggleEditSurface && editSurface) {
    toggleEditSurface.addEventListener("click", () => {
      const isOpen = !editSurface.classList.contains("hidden");
      editSurface.classList.toggle("hidden", isOpen);
      toggleEditSurface.setAttribute("aria-expanded", String(!isOpen));
      toggleEditSurface.innerHTML = `${icon("pen")} ${isOpen ? "Edit" : "Close Edit"}`;
      if (!isOpen) {
        window.setTimeout(() => {
          scrollEditWorkspaceIntoView(editSurface);
        }, 20);
      }
    });
  }

  const forceResummarizeButton = document.querySelector("#force-resummarize-topic");
  if (forceResummarizeButton?.dataset.pageId) {
    forceResummarizeButton.addEventListener("click", async () => {
      const pageId = forceResummarizeButton.dataset.pageId;
      const originalLabel = forceResummarizeButton.innerHTML;
      forceResummarizeButton.disabled = true;
      forceResummarizeButton.innerHTML = `${icon("reload")} Running...`;
      showToast("Resummarizing topic...");
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/auto-summarize-page`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId,
            expectedMtimeMs: state.currentPageMtimeMs,
          }),
        });
        const data = await parseApiResponse(response);
        if (!response.ok) {
          throw new Error(data.error || "Resummarize failed");
        }
        invalidateProjectCaches(state.currentProject.name);
        await loadProject(state.currentProject.name);
        await openPage(data.pageId || pageId, false);
        showToast("Topic resummarized");
      } catch (error) {
        forceResummarizeButton.disabled = false;
        forceResummarizeButton.innerHTML = originalLabel;
        showToast(error.message || "Resummarize failed");
      }
    });
  }

  const toggleMiniGraph = document.querySelector("#toggle-mini-graph");
  const miniGraphSurface = articleView.querySelector("#mini-graph-surface");
  const miniGraphCanvas = articleView.querySelector("#mini-graph-canvas");
  const miniGraphList = articleView.querySelector("#mini-graph-list");
  if (toggleMiniGraph && miniGraphSurface && miniGraphCanvas && state.currentPageId) {
    toggleMiniGraph.addEventListener("click", async () => {
      const isOpen = !miniGraphSurface.classList.contains("hidden");
      miniGraphSurface.classList.toggle("hidden", isOpen);
      toggleMiniGraph.setAttribute("aria-expanded", String(!isOpen));
      toggleMiniGraph.innerHTML = `${icon("links")} ${isOpen ? "Graph" : "Close Graph"}`;
      if (isOpen) {
        return;
      }
      try {
        miniGraphCanvas.innerHTML = `<div class="empty-state compact"><p>Loading nearby graph…</p></div>`;
        if (miniGraphList) {
          miniGraphList.innerHTML = "";
        }
        const graphData = await fetchProjectGraphData(state.currentProject.name);
        if (state.currentView !== "page" || !document.body.contains(miniGraphCanvas)) {
          return;
        }
        const focused = renderFocusedGraph(miniGraphCanvas, graphData.nodes, graphData.links, state.currentPageId, 2);
        renderFocusedGraphList(miniGraphList, focused, state.currentPageId);
      } catch (error) {
        miniGraphCanvas.innerHTML = `<div class="empty-state compact"><p>${escapeHtml(error.message || "Graph failed to load.")}</p></div>`;
        if (miniGraphList) {
          miniGraphList.innerHTML = "";
        }
      }
    });
  }

  articleView.querySelectorAll(".ai-edit-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitAiEdit(form);
      } catch (error) {
        console.error(error);
        showToast(error.message || "AI Edit failed");
      }
    });
  });

  articleView.querySelectorAll(".quote-open").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.project && button.dataset.project !== "all-projects") {
        if (button.dataset.project !== state.currentProject.name) {
          await loadProject(button.dataset.project);
        }
        openPage(button.dataset.pageId);
      } else {
        await loadProject(state.projects[0].name);
        openPage(findDefaultPageId());
      }
    });
  });

  articleView.querySelectorAll(".chapter-open").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.pageId) {
        openPage(button.dataset.pageId);
      }
    });
  });

  articleView.querySelectorAll(".location-open").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.pageId) {
        openPage(button.dataset.pageId);
      }
    });
  });

  articleView.querySelectorAll(".country-places-open").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.country) {
        showPlacesByCountry(button.dataset.country);
      }
    });
  });

  articleView.querySelectorAll(".home-open-page").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.pageId) {
        openPage(button.dataset.pageId);
      }
    });
  });

  articleView.querySelectorAll(".home-task-mark-done").forEach(bindHomeTaskMarkDoneButton);
  articleView.querySelectorAll(".home-task-save-due").forEach(bindHomeTaskSaveDueButton);
  articleView.querySelectorAll(".home-task-clear-due").forEach(bindHomeTaskClearDueButton);
  articleView.querySelectorAll(".home-task-delete").forEach(bindHomeTaskDeleteButton);

  articleView.querySelectorAll(".home-open-view").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.category) {
        window.sessionStorage.setItem("compose-prefill", JSON.stringify({
          category: String(button.dataset.category || "").trim(),
        }));
      }
      if (button.dataset.view === "graph") {
        showGraph();
      }
      if (button.dataset.view === "compose") {
        showComposer();
      }
      if (button.dataset.view === "chapters") {
        showChapters();
      }
    });
  });

  articleView.querySelectorAll(".compose-person-from-source").forEach((button) => {
    button.addEventListener("click", () => {
      window.sessionStorage.setItem("compose-prefill", JSON.stringify(buildPersonComposePrefill(button, false)));
      showComposer();
    });
  });

  articleView.querySelectorAll(".auto-create-person-from-source").forEach((button) => {
    button.addEventListener("click", () => {
      window.sessionStorage.setItem("compose-prefill", JSON.stringify(buildPersonComposePrefill(button, true)));
      showComposer();
    });
  });

  articleView.querySelectorAll(".home-open-category").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category || "";
      if (category) {
        setHash(`/project/${encodeURIComponent(state.currentProject.name)}/category/${encodeURIComponent(category)}`);
      }
    });
  });

  articleView.querySelectorAll(".home-toggle-category-form").forEach((button) => {
    button.addEventListener("click", () => {
      const form = articleView.querySelector("#home-category-create-form");
      if (!form) {
        return;
      }
      form.classList.toggle("hidden");
      if (!form.classList.contains("hidden")) {
        form.elements.categoryName?.focus();
      }
    });
  });

  articleView.querySelectorAll(".home-cancel-category-form").forEach((button) => {
    button.addEventListener("click", () => {
      const form = articleView.querySelector("#home-category-create-form");
      if (!form) {
        return;
      }
      form.reset();
      form.classList.add("hidden");
    });
  });

  const homeCategoryCreateForm = articleView.querySelector("#home-category-create-form");
  if (homeCategoryCreateForm) {
    homeCategoryCreateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await submitHomeCategoryCreate(homeCategoryCreateForm);
    });
  }

}

async function submitHomeCategoryCreate(form) {
  const categoryName = form.elements.categoryName.value.trim();
  if (!categoryName) {
    showToast("Category name is required");
    form.elements.categoryName.focus();
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  const originalLabel = submitButton?.innerHTML || "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `${icon("plus")} Adding...`;
  }

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: categoryName,
        expectedProjectsMtimeMs: state.projectsMtimeMs,
      }),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "Category create failed");
    }

    const projectsData = await fetchJson("/api/projects");
    state.projects = projectsData.projects || [];
    state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
    await loadProject(state.currentProject.name);
    form.reset();
    form.classList.add("hidden");
    showToast(data.created ? `Added ${formatProjectName(data.category)}` : `${formatProjectName(data.category)} already exists`);
    setHash(`/project/${encodeURIComponent(state.currentProject.name)}/category/${encodeURIComponent(data.category)}`);
  } catch (error) {
    showToast(error.message || "Category create failed");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
  }
}

async function submitRename(form) {
  const payload = {
    id: state.currentPageId,
    category: form.elements.category.value,
    title: form.elements.title.value.trim(),
    slug: form.elements.slug.value.trim(),
    expectedMtimeMs: state.currentPageMtimeMs,
    replacePlainText: form.elements.replacePlainText.checked,
    replaceTextFrom: form.elements.replaceTextFrom.value.trim(),
    replaceTextTo: form.elements.replaceTextTo.value.trim(),
  };

  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Rename failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  await loadProject(state.currentProject.name);
  showToast(`Renamed to ${data.title}`);
  await openPage(data.pageId);
}

async function submitCreate(form) {
  const mode = form.elements.mode.value;

  if (mode === "ai") {
    promoteBareAiUrlInput(form.elements.imageInstructions, form.elements.aiUrl);
    const imageFile = form.elements.aiImageFile.files[0];
    const importFile = form.elements.aiImportFile.files[0];
    const instructions = form.elements.imageInstructions.value.trim();
    const aiUrl = form.elements.aiUrl?.value.trim() || "";
    const titleHint = form.elements.aiTitleHint?.value.trim() || "";
    const youtubeImportProjectMode = form.elements.youtubeImportProjectMode?.value || "current";
    if (!imageFile && !instructions) {
      if (!aiUrl && !importFile) {
        throw new Error("Add notes for AI, a URL, a file, an image, or some combination of those");
      }
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const statusEl = form.querySelector("#compose-status");
    const statusLabel = statusEl?.querySelector(".compose-status-label");
    const statusOutput = statusEl?.querySelector(".compose-status-output");
    const originalLabel = submitButton?.innerHTML || "";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `${icon("robot")} Running...`;
    }
    if (statusEl && statusLabel && statusOutput) {
      statusEl.classList.remove("hidden");
      statusLabel.textContent = isYouTubeUrl(aiUrl) ? "Status: YouTube import moved to activity center" : "Status: moved to activity center";
      statusOutput.textContent = [
        isYouTubeUrl(aiUrl) ? "Launching YouTube import..." : "Launching AI draft job...",
        "",
        `Category: ${form.elements.category.value}`,
        titleHint ? `Target title: ${titleHint}` : "Target title: AI decides",
        aiUrl ? `URL: ${aiUrl}` : "URL: none",
        isYouTubeUrl(aiUrl)
          ? `Project target: ${youtubeImportProjectMode === "smart" ? "smart routing" : state.currentProject.name}`
          : null,
        importFile ? `Supporting file: ${importFile.name}` : "Supporting file: none",
        imageFile ? `Image: ${imageFile.name}` : "Image: none",
        instructions ? "Notes: provided" : "Notes: none",
        "",
        "The live console will appear in the activity modal.",
      ].filter(Boolean).join("\n");
    }
    showToast(isYouTubeUrl(aiUrl) ? "YouTube import starting..." : "AI draft starting...");

    try {
      if (isYouTubeUrl(aiUrl)) {
        const importPayload = {
          url: aiUrl,
          project: youtubeImportProjectMode === "smart" ? "" : state.currentProject.name,
          category: youtubeImportProjectMode === "smart" ? "" : form.elements.category.value,
          titleHint,
          instructions,
        };
        const data = await startYoutubeImportJobRequest(importPayload);
        await watchYoutubeImportJob(data.runId, {
          statusEl,
          outputEl: statusOutput,
          submitButton,
          originalLabel,
          startedAt: Date.now(),
          threadTitle: titleHint || "YouTube import",
          category: importPayload.category,
          projectName: importPayload.project,
          url: aiUrl,
          source: "compose-youtube",
        });
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalLabel;
        }
        if (statusEl) {
          statusEl.classList.add("hidden");
        }
        return;
      }

      const retryPayload = {
        category: form.elements.category.value,
        titleHint,
        instructions,
        url: aiUrl,
        imageName: imageFile ? imageFile.name : "",
        imageData: imageFile ? await readFileAsDataUrl(imageFile) : "",
        importFileName: importFile ? importFile.name : "",
        importFileData: importFile ? await readFileAsDataUrl(importFile) : "",
        importFileContent: importFile && isTextLikeFile(importFile.name) ? await readFileAsText(importFile) : "",
      };
      const data = await startAiCreateJobRequest(state.currentProject.name, retryPayload);

      await watchAiCreateJob(data.jobId, {
        statusEl,
        outputEl: statusOutput,
        submitButton,
        originalLabel,
        startedAt: Date.now(),
        titleHint,
        threadTitle: titleHint || "AI draft",
        category: form.elements.category.value,
        url: aiUrl,
        source: "compose",
        retryPayload,
      });
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel;
      }
      if (statusEl) {
        statusEl.classList.add("hidden");
      }
      return;
    } catch (error) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel;
      }
      throw error;
    }
  }

  const imageFile = form.elements.manualImageFile.files[0];
  const importFile = form.elements.manualImportFile.files[0];
  const payload = {
    category: form.elements.category.value,
    title: form.elements.title.value.trim(),
    slug: form.elements.slug.value.trim(),
    content: form.elements.content.value,
    url: form.elements.url.value.trim(),
    imageName: imageFile ? imageFile.name : "",
    imageData: imageFile ? await readFileAsDataUrl(imageFile) : "",
    importFileName: importFile ? importFile.name : "",
    importFileData: importFile ? await readFileAsDataUrl(importFile) : "",
    importFileContent: importFile
      ? isTextLikeFile(importFile.name)
        ? await readFileAsText(importFile)
        : `Uploaded file provided: ${importFile.name}`
      : "",
  };

  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Create failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  await loadProject(state.currentProject.name);
  showToast(`Created ${payload.title}`);
  await openPage(data.pageId);
}

async function submitClaude(form) {
  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: form.elements.content.value,
      expectedMtimeMs: state.currentPageMtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Save failed");
  }
  showToast("CLAUDE.md saved");
}

async function submitPageEdit(form) {
  const pageId = state.currentPageId;
  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: pageId,
      content: form.elements.content.value,
      expectedMtimeMs: state.currentPageMtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Save failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  await loadProject(state.currentProject.name);
  showToast("Page saved");
  await openPage(data.pageId || pageId, false);
}

async function submitTodoTaskUpdate(taskId, { markDone = false, dueDate = undefined } = {}) {
  const taskEntry = state.todoTaskPages.get(taskId);
  let taskPage = taskEntry?.page || null;
  if (!taskPage) {
    const response = await fetchJson(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page?id=${encodeURIComponent(taskId)}`);
    taskPage = response.page;
  }

  const nextContent = updateTodoTaskMarkdownContent(taskPage.rawContent || "", {
    markDone,
    dueDate,
  });

  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: taskId,
      content: nextContent,
      expectedMtimeMs: taskPage.mtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Save failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  if (state.currentView === "home") {
    const nextFrontmatter = { ...(taskPage.frontmatter || {}) };
    if (typeof dueDate !== "undefined") {
      if (String(dueDate || "").trim()) {
        nextFrontmatter.due = String(dueDate || "").trim();
      } else {
        delete nextFrontmatter.due;
      }
    }
    if (markDone && !/\[[ xX]\]/.test(String(taskPage.rawContent || ""))) {
      nextFrontmatter.status = "done";
    }
    const updatedMtimeMs = Date.now();
    const updatedPage = {
      ...taskPage,
      rawContent: nextContent,
      mtimeMs: updatedMtimeMs,
      frontmatter: nextFrontmatter,
    };
    const updatedSummary = buildTodoTaskSummaryFromPage(updatedPage, { today: new Date() });
    state.todoTaskPages.set(taskId, {
      pageId: taskId,
      page: updatedPage,
      summary: updatedSummary,
    });
    updateHomeTaskRowAfterSave(taskId, {
      markDone,
      dueDate,
      summary: updatedSummary,
    });
    showToast(markDone ? "Task marked done" : (String(dueDate || "").trim() ? "Task due date saved" : "Task due date removed"));
    return;
  }

  await loadProject(state.currentProject.name);
  showToast(markDone ? "Task marked done" : (String(dueDate || "").trim() ? "Task due date saved" : "Task due date removed"));
  await openPage(data.pageId || taskId, false);
}

function updateHomeTaskRowAfterSave(taskId, {
  markDone = false,
  dueDate = undefined,
  summary = null,
} = {}) {
  const safeTaskId = typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(taskId)
    : String(taskId).replace(/["\\]/g, "\\$&");
  const row = articleView.querySelector(`.task-dashboard-row[data-task-id="${safeTaskId}"]`);
  if (!row) {
    return;
  }

  if (markDone) {
    markHomeTaskRowDone(row, summary);
    return;
  }

  if (typeof dueDate !== "undefined") {
    updateHomeTaskRowDue(row, String(dueDate || "").trim(), summary);
  }
}

function markHomeTaskRowDone(row, summary = null) {
  row.classList.add("task-dashboard-row-complete-feedback");
  row.querySelectorAll("button, input").forEach((control) => {
    control.disabled = true;
  });

  const actions = row.querySelector(".task-dashboard-actions");
  if (actions) {
    actions.innerHTML = `
      <span class="task-dashboard-feedback">${icon("check-circle")} Done. Removing from the open list…</span>
    `;
  }

  const title = row.querySelector(".task-dashboard-open strong");
  if (title && summary?.title) {
    title.textContent = summary.title;
  }

  window.setTimeout(() => {
    row.classList.add("task-dashboard-row-disappearing");
  }, 240);

  window.setTimeout(() => {
    const group = row.closest(".task-dashboard-group");
    row.remove();
    refreshHomeTaskDashboardAfterRowRemoval(group);
  }, 620);
}

function markHomeTaskRowDeleted(row) {
  row.classList.add("task-dashboard-row-delete-feedback");
  row.querySelectorAll("button, input").forEach((control) => {
    control.disabled = true;
  });

  const actions = row.querySelector(".task-dashboard-actions");
  if (actions) {
    actions.innerHTML = `
      <span class="task-dashboard-feedback">${icon("trash")} Deleted. Removing from the list…</span>
    `;
  }

  window.setTimeout(() => {
    row.classList.add("task-dashboard-row-disappearing");
  }, 220);

  window.setTimeout(() => {
    const group = row.closest(".task-dashboard-group");
    row.remove();
    refreshHomeTaskDashboardAfterRowRemoval(group);
  }, 600);
}

function updateHomeTaskRowDue(row, dueDate, summary = null) {
  const normalizedDue = String(dueDate || "").trim();
  const badge = row.querySelector(".task-dashboard-open-top .type-badge");
  if (badge) {
    badge.textContent = normalizedDue ? formatDateLabel(normalizedDue) : "No due date";
  }

  const input = row.querySelector(".task-dashboard-due-input");
  if (input) {
    input.value = normalizedDue;
  }

  const actions = row.querySelector(".task-dashboard-actions");
  if (!actions) {
    return;
  }
  const existingClear = actions.querySelector(".home-task-clear-due");
  if (normalizedDue) {
    if (!existingClear) {
      const saveButton = actions.querySelector(".home-task-save-due");
      if (saveButton) {
        saveButton.insertAdjacentHTML("afterend", `
          <button class="ghost-button inline-action home-task-clear-due" type="button" data-task-id="${escapeHtml(summary?.pageId || row.dataset.taskId || "")}">${icon("trash")} Remove due</button>
        `);
        const clearButton = actions.querySelector(".home-task-clear-due");
        bindHomeTaskClearDueButton(clearButton);
      }
    }
  } else if (existingClear) {
    existingClear.remove();
  }

  showHomeTaskDueFeedback(actions, normalizedDue);

  const nextDueState = String(summary?.dueState || "").trim();
  if (nextDueState) {
    moveHomeTaskRowToDueGroup(row, nextDueState);
  }
}

function showHomeTaskDueFeedback(actions, dueDate) {
  if (!actions) {
    return;
  }

  actions.querySelector(".task-dashboard-feedback-info")?.remove();
  const label = dueDate ? `Due saved for ${formatDateLabel(dueDate)}` : "Due date removed";
  actions.insertAdjacentHTML("beforeend", `
    <span class="task-dashboard-feedback task-dashboard-feedback-info">${icon("calendar")} ${escapeHtml(label)}</span>
  `);
  const feedback = actions.querySelector(".task-dashboard-feedback-info:last-child");
  if (feedback) {
    window.setTimeout(() => {
      feedback.remove();
    }, 2200);
  }
}

function refreshHomeTaskDashboardAfterRowRemoval(group) {
  if (group && !group.querySelector(".task-dashboard-row")) {
    group.remove();
  }

  const dashboard = articleView.querySelector(".task-dashboard");
  const panel = articleView.querySelector(".task-dashboard-panel");
  if (!dashboard || !panel) {
    return;
  }

  dashboard.querySelectorAll(".task-dashboard-group").forEach((section) => {
    const countBadge = section.querySelector(".task-dashboard-group-header .type-badge");
    if (countBadge) {
      countBadge.textContent = String(section.querySelectorAll(".task-dashboard-row").length);
    }
  });

  if (!dashboard.querySelector(".task-dashboard-group")) {
    dashboard.innerHTML = `
      <div class="empty-state compact">
        <p>No open tasks yet.</p>
      </div>
    `;
  }
}

function moveHomeTaskRowToDueGroup(row, dueState) {
  const currentGroup = row.closest(".task-dashboard-group");
  const currentKey = String(currentGroup?.dataset.groupKey || "").trim();
  if (!currentGroup || !dueState || currentKey === dueState) {
    return;
  }

  const dashboard = articleView.querySelector(".task-dashboard");
  if (!dashboard) {
    return;
  }

  const targetGroup = ensureHomeTaskDueGroup(dashboard, dueState);
  const targetList = targetGroup?.querySelector(".task-dashboard-list");
  if (!targetList) {
    return;
  }

  row.classList.add("task-dashboard-row-moving");
  window.setTimeout(() => {
    row.classList.remove("task-dashboard-row-moving");
    targetList.prepend(row);
    row.classList.add("task-dashboard-row-arriving");
    window.setTimeout(() => {
      row.classList.remove("task-dashboard-row-arriving");
    }, 320);
    refreshHomeTaskDashboardAfterRowRemoval(currentGroup);
    refreshHomeTaskGroupCounts();
  }, 220);
}

function ensureHomeTaskDueGroup(dashboard, dueState) {
  const existingGroup = dashboard.querySelector(`.task-dashboard-group[data-group-key="${dueState}"]`);
  if (existingGroup) {
    return existingGroup;
  }

  const groupMeta = {
    overdue: { label: "Overdue", description: "Tasks past their due date." },
    today: { label: "Today", description: "Tasks due today." },
    upcoming: { label: "Upcoming", description: "Tasks due later." },
    "no-date": { label: "No date", description: "Tasks without a due date." },
  };
  const meta = groupMeta[dueState];
  if (!meta) {
    return null;
  }

  const section = document.createElement("section");
  section.className = `task-dashboard-group task-dashboard-group-${dueState}`;
  section.dataset.groupKey = dueState;
  section.innerHTML = `
    <div class="task-dashboard-group-header">
      <div>
        <h4>${escapeHtml(meta.label)}</h4>
        <p class="muted">${escapeHtml(meta.description)}</p>
      </div>
      <span class="type-badge subtle">0</span>
    </div>
    <div class="task-dashboard-list"></div>
  `;

  const order = ["overdue", "today", "upcoming", "no-date"];
  const targetIndex = order.indexOf(dueState);
  const groups = Array.from(dashboard.querySelectorAll(".task-dashboard-group"));
  const insertBefore = groups.find((group) => {
    const groupIndex = order.indexOf(String(group.dataset.groupKey || "").trim());
    return groupIndex > targetIndex;
  });
  if (insertBefore) {
    dashboard.insertBefore(section, insertBefore);
  } else {
    dashboard.appendChild(section);
  }
  return section;
}

function refreshHomeTaskGroupCounts() {
  articleView.querySelectorAll(".task-dashboard-group").forEach((section) => {
    const countBadge = section.querySelector(".task-dashboard-group-header .type-badge");
    if (countBadge) {
      countBadge.textContent = String(section.querySelectorAll(".task-dashboard-row").length);
    }
  });
}

function bindHomeTaskMarkDoneButton(button) {
  if (!button || button.dataset.boundClick === "true") {
    return;
  }
  button.dataset.boundClick = "true";
  button.addEventListener("click", async () => {
    const taskId = String(button.dataset.taskId || "").trim();
    if (!taskId) {
      return;
    }
    try {
      button.disabled = true;
      await submitTodoTaskUpdate(taskId, { markDone: true });
    } catch (error) {
      console.error(error);
      showToast(error.message || "Task save failed");
      button.disabled = false;
    }
  });
}

function bindHomeTaskSaveDueButton(button) {
  if (!button || button.dataset.boundClick === "true") {
    return;
  }
  button.dataset.boundClick = "true";
  button.addEventListener("click", async () => {
    const taskId = String(button.dataset.taskId || "").trim();
    const row = button.closest(".task-dashboard-row");
    const input = row?.querySelector(".task-dashboard-due-input");
    const dueDate = String(input?.value || "").trim();
    if (!taskId) {
      return;
    }
    try {
      button.disabled = true;
      await submitTodoTaskUpdate(taskId, { dueDate });
    } catch (error) {
      console.error(error);
      showToast(error.message || "Task save failed");
    } finally {
      button.disabled = false;
    }
  });
}

function bindHomeTaskClearDueButton(button) {
  if (!button || button.dataset.boundClick === "true") {
    return;
  }
  button.dataset.boundClick = "true";
  button.addEventListener("click", async () => {
    const taskId = String(button.dataset.taskId || "").trim();
    if (!taskId) {
      return;
    }
    try {
      button.disabled = true;
      await submitTodoTaskUpdate(taskId, { dueDate: "" });
    } catch (error) {
      console.error(error);
      showToast(error.message || "Task save failed");
      button.disabled = false;
    }
  });
}

function bindHomeTaskDeleteButton(button) {
  if (!button || button.dataset.boundClick === "true") {
    return;
  }
  button.dataset.boundClick = "true";
  button.addEventListener("click", async () => {
    const taskId = String(button.dataset.taskId || "").trim();
    if (!taskId) {
      return;
    }
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) {
      return;
    }
    try {
      button.disabled = true;
      await submitTodoTaskDelete(taskId);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Task delete failed");
      button.disabled = false;
    }
  });
}

async function submitTodoTaskDelete(taskId) {
  const taskEntry = state.todoTaskPages.get(taskId);
  const taskPage = taskEntry?.page || await fetchJson(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page?id=${encodeURIComponent(taskId)}`).then((response) => response.page);
  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: taskId,
      expectedMtimeMs: taskPage.mtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Delete failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  if (state.currentView === "home") {
    state.todoTaskPages.delete(taskId);
    const row = articleView.querySelector(`.task-dashboard-row[data-task-id="${typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(taskId) : String(taskId).replace(/["\\]/g, "\\$&")}"]`);
    if (row) {
      markHomeTaskRowDeleted(row);
    }
    showToast("Task deleted");
    return;
  }

  await loadProject(state.currentProject.name);
  showToast("Task deleted");
  await showHome(false);
}

async function submitPageAliases(form) {
  const pageId = state.currentPageId;
  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page-aliases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: pageId,
      aliases: form.elements.aliases.value,
      expectedMtimeMs: state.currentPageMtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Alias save failed");
  }

  invalidateProjectCaches(state.currentProject.name);
  await loadProject(state.currentProject.name);
  showToast("Aliases saved");
  await openPage(data.pageId || pageId, false);
}

async function submitAiEdit(form) {
  const payload = {
    targetType: form.dataset.targetType,
    pageId: form.dataset.pageId || "",
    instructions: form.elements.instructions.value.trim(),
    expectedMtimeMs: state.currentPageMtimeMs,
  };

  if (!payload.instructions) {
    showToast("Enter a change request first");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const consoleEl = form.parentElement.querySelector(".ai-edit-console");
  const statusEl = consoleEl?.querySelector(".ai-edit-status");
  const outputEl = consoleEl?.querySelector(".ai-edit-output");
  const originalLabel = submitButton ? submitButton.innerHTML : "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `${icon("robot")} Running...`;
  }
  if (consoleEl && statusEl && outputEl) {
    consoleEl.classList.remove("hidden");
    statusEl.textContent = "Status: starting";
    outputEl.textContent = "Preparing AI Edit job...\n";
  }
  showToast("AI Edit running...");

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/ai-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "AI Edit failed");
    }
    if (outputEl && data.targetPath) {
      outputEl.textContent += `Target: ${data.targetPath}\n`;
    }
    await watchAiEditJob(data.jobId, payload, {
      statusEl,
      outputEl,
      consoleEl,
      submitButton,
      originalLabel,
    });
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
    throw error;
  }
}

async function watchAiEditJob(jobId, payload, elements) {
  if (state.aiEditPollingId) {
    window.clearInterval(state.aiEditPollingId);
    state.aiEditPollingId = null;
  }

  await pollAiEditJob(jobId, payload, elements);
  state.aiEditPollingId = window.setInterval(() => {
    pollAiEditJob(jobId, payload, elements).catch((error) => {
      console.error(error);
      if (elements.statusEl) {
        elements.statusEl.textContent = "Status: failed";
      }
      if (elements.submitButton) {
        elements.submitButton.disabled = false;
        elements.submitButton.innerHTML = elements.originalLabel;
      }
      showToast(error.message || "AI Edit polling failed");
      window.clearInterval(state.aiEditPollingId);
      state.aiEditPollingId = null;
    });
  }, 1200);
}

async function watchAiCreateJob(jobId, elements) {
  const thread = ensureAiCreateThread(jobId, {
    kind: "ai-create",
    projectName: state.currentProject.name,
    title: elements.threadTitle || elements.titleHint || "AI draft",
    category: elements.category || "",
    submittedCategory: elements.submittedCategory || elements.category || "",
    effectiveCategory: elements.effectiveCategory || "",
    routingEvidence: elements.routingEvidence || "",
    routingReason: elements.routingReason || "",
    url: elements.url || "",
    startedAt: elements.startedAt || Date.now(),
    status: "running",
    output: elements.outputEl?.textContent || "",
    source: elements.source || "compose",
    retryPayload: elements.retryPayload || null,
  });
  if (!thread) {
    return;
  }
  thread.submitButton = elements.submitButton || null;
  thread.originalLabel = elements.originalLabel || "";
  thread.statusEl = elements.statusEl || null;
  thread.outputEl = elements.outputEl || null;
  thread.keepModalOpen = true;
  state.activeAiCreateThreadId = jobId;
  state.activityModalOpen = true;
  renderActivityCenter();
  await pollAiCreateThreads();
  ensureAiCreatePolling();
}

async function watchYoutubeImportJob(runId, elements) {
  const thread = ensureAiCreateThread(runId, {
    kind: "youtube-import",
    projectName: elements.projectName || "",
    selectedProject: elements.projectName || "",
    title: elements.threadTitle || "YouTube import",
    category: elements.category || "",
    url: elements.url || "",
    startedAt: elements.startedAt || Date.now(),
    status: "running",
    currentStep: "starting",
    output: elements.outputEl?.textContent || "",
    source: elements.source || "compose-youtube",
    retryPayload: null,
  });
  if (!thread) {
    return;
  }
  thread.submitButton = elements.submitButton || null;
  thread.originalLabel = elements.originalLabel || "";
  thread.statusEl = elements.statusEl || null;
  thread.outputEl = elements.outputEl || null;
  thread.keepModalOpen = true;
  state.activeAiCreateThreadId = runId;
  state.activityModalOpen = true;
  renderActivityCenter();
  await pollAiCreateThreads();
  ensureAiCreatePolling();
}

async function pollAiEditJob(jobId, payload, { statusEl, outputEl, submitButton, originalLabel }) {
  const data = await fetchJson(`/api/projects/${encodeURIComponent(state.currentProject.name)}/ai-edit/${encodeURIComponent(jobId)}`);
  if (statusEl) {
    statusEl.textContent = `Status: ${data.status}`;
  }
  if (outputEl) {
    outputEl.textContent = data.output || "";
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  if (data.status === "completed" || data.status === "failed") {
    window.clearInterval(state.aiEditPollingId);
    state.aiEditPollingId = null;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }

    if (data.status === "failed") {
      showToast(data.error || "AI Edit failed");
      return;
    }

    showToast("AI Edit applied");
    if (payload.targetType === "claude") {
      await showClaudeEditor(false);
    } else if (payload.targetType === "page" && payload.pageId) {
      invalidateProjectCaches(state.currentProject.name);
      await loadProject(state.currentProject.name);
      await openPage(payload.pageId, false);
    }
  }
}

function ensureAiCreatePolling() {
  if (state.aiCreatePollingId) {
    return;
  }
  state.aiCreatePollingId = window.setInterval(() => {
    pollAiCreateThreads().catch((error) => {
      console.error(error);
      showToast(error.message || "AI draft polling failed");
    });
  }, 1200);
}

function stopAiCreatePollingIfIdle() {
  const hasRunning = state.aiCreateThreads.some((thread) => thread.status === "running");
  if (!hasRunning && state.aiCreatePollingId) {
    window.clearInterval(state.aiCreatePollingId);
    state.aiCreatePollingId = null;
  }
}

function summarizeAiCreateFailure(message) {
  const normalized = String(message || "").trim();
  if (!normalized) {
    return "AI draft create failed.";
  }
  if (normalized.toLowerCase().includes("malformed page output")) {
    return normalized;
  }
  return normalized;
}

function isYouTubeUrl(value) {
  const text = String(value || "").trim();
  return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(text);
}

async function startAiCreateJobRequest(projectName, payload) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/create-with-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "AI draft create failed");
  }
  return data;
}

async function startYoutubeImportJobRequest(payload) {
  const response = await fetch("/api/youtube-imports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "YouTube import start failed");
  }
  return data;
}

async function pollAiCreateThreads() {
  const runningThreads = state.aiCreateThreads.filter((thread) => thread.status === "running");
  if (!runningThreads.length) {
    stopAiCreatePollingIfIdle();
    renderActivityCenter();
    return;
  }

  await Promise.all(runningThreads.map(async (thread) => {
    try {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - (thread.startedAt || Date.now())) / 1000));
      thread.elapsedSeconds = elapsedSeconds;

      if (thread.kind === "youtube-import") {
        const data = await fetchJson(`/api/youtube-imports/${encodeURIComponent(thread.id)}`);
        const runState = data.state || {};
        const receipt = data.receipt || {};
        const currentStep = String(runState.currentStep || "").trim();
        const terminalStatus = currentStep === "finalized"
          ? "completed"
          : currentStep === "failed"
            ? "failed"
            : "running";
        const errorMessage = Array.isArray(runState.errors) && runState.errors.length
          ? String(runState.errors[runState.errors.length - 1]?.message || "").trim()
          : "";
        thread.status = terminalStatus;
        thread.currentStep = currentStep || thread.currentStep || "";
        thread.error = errorMessage || thread.error || "";
        thread.pageId = receipt.wikiIngest?.pageId || runState.wikiIngest?.pageId || thread.pageId || "";
        thread.title = runState.metadata?.title || thread.title || "YouTube import";
        thread.projectName = runState.selectedProject || thread.projectName || "";
        thread.selectedProject = runState.selectedProject || thread.selectedProject || "";
        thread.category = thread.category || "";
        thread.startedAt = Date.parse(runState.startedAt || "") || thread.startedAt || Date.now();
        thread.updatedAt = Date.parse(runState.lastUpdatedAt || "") || thread.updatedAt || thread.startedAt || Date.now();
        thread.lastServerOutput = data.progressTail || "";
        thread.output = data.progressTail || "";
        if (thread.status === "running" && thread.output === (thread.lastRenderedOutput || "")) {
          thread.output = `${thread.output}${thread.output ? "\n" : ""}[client] ${thread.currentStep || "running"} · ${formatActivityElapsed(elapsedSeconds)} elapsed. It is safe to navigate away; use the gear button to reopen this import.`;
        }
        thread.lastRenderedOutput = data.progressTail || "";
      } else {
        const data = await fetchJson(`/api/projects/${encodeURIComponent(thread.projectName)}/create-with-ai/${encodeURIComponent(thread.id)}`);
        thread.status = data.status || thread.status;
        thread.error = data.error || "";
        thread.pageId = data.pageId || thread.pageId || "";
        thread.title = data.title || thread.title || "";
        thread.projectName = thread.projectName || state.currentProject?.name || "";
        thread.submittedCategory = data.submittedCategory || thread.submittedCategory || thread.category || "";
        thread.effectiveCategory = data.effectiveCategory || thread.effectiveCategory || "";
        thread.routingEvidence = data.routingEvidence || thread.routingEvidence || "";
        thread.routingReason = data.routingReason || thread.routingReason || "";
        thread.category = thread.effectiveCategory || thread.submittedCategory || thread.category || "";
        thread.startedAt = Number(data.startedAt || thread.startedAt || Date.now());
        thread.updatedAt = Number(data.updatedAt || thread.updatedAt || thread.startedAt || Date.now());
        thread.lastServerOutput = data.output || "";
        thread.output = data.output || "";
        if (thread.status === "running" && thread.output === (thread.lastRenderedOutput || "")) {
          thread.output = `${thread.output}${thread.output ? "\n" : ""}[client] ${formatActivityElapsed(elapsedSeconds)} elapsed, still running. It is safe to navigate away; use the gear button to reopen this job.`;
        }
        thread.lastRenderedOutput = data.output || "";
      }

      if (thread.statusEl) {
        const statusSuffix = thread.kind === "youtube-import"
          ? `${thread.currentStep ? ` · ${thread.currentStep}` : ""}${thread.status === "running" ? ` · ${formatActivityElapsed(elapsedSeconds)}` : ""}`
          : (() => {
            const routingSuffix = thread.effectiveCategory && thread.submittedCategory && thread.effectiveCategory !== thread.submittedCategory
              ? ` · routing ${thread.submittedCategory} -> ${thread.effectiveCategory}`
              : thread.effectiveCategory
                ? ` · category ${thread.effectiveCategory}`
                : "";
            return `${thread.status === "running" ? ` · ${formatActivityElapsed(elapsedSeconds)}` : ""}${routingSuffix}`;
          })();
        thread.statusEl.textContent = `Status: ${thread.status}${statusSuffix}`;
      }
      if (thread.outputEl) {
        thread.outputEl.textContent = thread.output;
        thread.outputEl.scrollTop = thread.outputEl.scrollHeight;
      }

      if (thread.status === "completed" || thread.status === "failed") {
        if (thread.submitButton) {
          thread.submitButton.disabled = false;
          thread.submitButton.innerHTML = thread.originalLabel || thread.submitButton.innerHTML;
        }
        thread.statusEl = null;
        thread.outputEl = null;
        thread.submitButton = null;

        if (!thread.notified) {
          thread.notified = true;
          if (thread.status === "failed") {
            showToast(thread.kind === "youtube-import"
              ? (thread.error || "YouTube import failed")
              : (summarizeAiCreateFailure(thread.error) || "AI draft create failed"));
          } else {
            if (thread.projectName === state.currentProject?.name) {
              invalidateProjectCaches(thread.projectName);
              await loadProject(thread.projectName);
            }
            showToast(thread.kind === "youtube-import"
              ? `YouTube import finished${thread.pageId ? `: ${thread.pageId}` : ""}`
              : `Created ${thread.title || thread.pageId}`);
          }
        }
      }
    } catch (error) {
      thread.status = "failed";
      thread.error = error.message || "AI draft polling failed";
      thread.output = `${thread.output || ""}${thread.output ? "\n" : ""}[poll error] ${thread.error}`;
      if (!thread.notified) {
        thread.notified = true;
        showToast(thread.error);
      }
    }
  }));

  stopAiCreatePollingIfIdle();
  renderActivityCenter();
}

async function hydrateAiCreateThreads() {
  try {
    const data = await fetchJson("/api/ai-create-jobs");
    for (const job of data.jobs || []) {
      if (state.dismissedAiCreateJobIds.has(String(job.id || ""))) {
        continue;
      }
      ensureAiCreateThread(job.id, {
        projectName: job.project,
        title: job.title || job.pageId || "AI draft",
        category: job.effectiveCategory || job.submittedCategory || "",
        submittedCategory: job.submittedCategory || "",
        effectiveCategory: job.effectiveCategory || "",
        routingEvidence: job.routingEvidence || "",
        routingReason: job.routingReason || "",
        status: job.status,
        output: job.output || "",
        error: job.error || "",
        pageId: job.pageId || "",
        startedAt: Number(job.startedAt || Date.now()),
        updatedAt: Number(job.updatedAt || job.startedAt || Date.now()),
      });
    }
    if (state.aiCreateThreads.some((thread) => thread.status === "running")) {
      ensureAiCreatePolling();
    }
    renderActivityCenter();
  } catch (_error) {
    // Non-fatal: activity center can still work for jobs started in this session.
  }
}

async function hydrateYoutubeImportThreads() {
  try {
    const data = await fetchJson("/api/youtube-imports");
    for (const run of data.runs || []) {
      if (state.dismissedAiCreateJobIds.has(String(run.runId || ""))) {
        continue;
      }
      const runState = run.state || {};
      const receipt = run.receipt || {};
      const currentStep = String(runState.currentStep || "").trim();
      const terminalStatus = currentStep === "finalized"
        ? "completed"
        : currentStep === "failed"
          ? "failed"
          : "running";
      const errorMessage = Array.isArray(runState.errors) && runState.errors.length
        ? String(runState.errors[runState.errors.length - 1]?.message || "").trim()
        : "";
      ensureAiCreateThread(run.runId, {
        kind: "youtube-import",
        projectName: runState.selectedProject || "",
        selectedProject: runState.selectedProject || "",
        title: runState.metadata?.title || "YouTube import",
        category: runState.category || "",
        status: terminalStatus,
        currentStep,
        output: run.progressTail || "",
        error: errorMessage,
        pageId: receipt.wikiIngest?.pageId || runState.wikiIngest?.pageId || "",
        url: runState.sourceUrl || "",
        startedAt: Date.parse(runState.startedAt || "") || Date.now(),
        updatedAt: Date.parse(runState.lastUpdatedAt || "") || Date.now(),
        source: "youtube-import-hydrate",
      });
    }
    if (state.aiCreateThreads.some((thread) => thread.status === "running")) {
      ensureAiCreatePolling();
    }
    renderActivityCenter();
  } catch (_error) {
    // Non-fatal: activity center can still work for runs started in this session.
  }
}

function ensureAiCreateThread(jobId, attrs = {}) {
  const normalizedJobId = String(jobId || "").trim();
  if (!normalizedJobId || state.dismissedAiCreateJobIds.has(normalizedJobId)) {
    return null;
  }

  let thread = state.aiCreateThreads.find((candidate) => candidate.id === normalizedJobId);
  if (!thread) {
    thread = {
      id: normalizedJobId,
      kind: attrs.kind || "ai-create",
      projectName: attrs.projectName || state.currentProject?.name || "",
      selectedProject: attrs.selectedProject || "",
      title: attrs.title || "AI draft",
      category: attrs.category || "",
      submittedCategory: attrs.submittedCategory || attrs.category || "",
      effectiveCategory: attrs.effectiveCategory || "",
      routingEvidence: attrs.routingEvidence || "",
      routingReason: attrs.routingReason || "",
      url: attrs.url || "",
      source: attrs.source || "compose",
      status: attrs.status || "running",
      startedAt: attrs.startedAt || Date.now(),
      updatedAt: attrs.updatedAt || attrs.startedAt || Date.now(),
      elapsedSeconds: 0,
      currentStep: attrs.currentStep || "",
      output: attrs.output || "",
      lastRenderedOutput: "",
      lastServerOutput: "",
      error: "",
      pageId: "",
      notified: false,
      retryPayload: attrs.retryPayload || null,
    };
    state.aiCreateThreads.unshift(thread);
  } else {
    Object.assign(thread, attrs);
    if (!thread.kind) {
      thread.kind = "ai-create";
    }
  }
  return thread;
}

const MODAL_FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function createModalController({
  modal,
  backdrop = null,
  closeButton = null,
  getIsOpen,
  setIsOpen,
  onBeforeClose,
  onRender,
  inertElements = [],
} = {}) {
  let previousFocus = null;

  const getFocusableElements = () => Array.from(modal?.querySelectorAll?.(MODAL_FOCUSABLE_SELECTOR) || [])
    .filter((element) => !element.classList?.contains?.("hidden") && element.offsetParent !== null);

  const sync = () => {
    if (!modal) {
      return;
    }
    const open = Boolean(getIsOpen?.());
    modal.classList.toggle("hidden", !open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    modal.onkeydown = open ? handleKeydown : null;
    inertElements.forEach((element) => {
      if (element) {
        element.inert = open;
      }
    });
    if (open && !modal.contains(document.activeElement)) {
      window.requestAnimationFrame(() => {
        const focusTarget = getFocusableElements()[0] || closeButton;
        focusTarget?.focus?.();
      });
    }
  };

  const open = () => {
    if (!getIsOpen?.()) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsOpen?.(true);
    onRender?.();
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!getIsOpen?.()) {
      return;
    }
    onBeforeClose?.();
    setIsOpen?.(false);
    onRender?.();
    inertElements.forEach((element) => {
      if (element) {
        element.inert = false;
      }
    });
    if (restoreFocus) {
      previousFocus?.focus?.();
    }
    previousFocus = null;
  };

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault?.();
      close();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusable = getFocusableElements();
    if (!focusable.length) {
      event.preventDefault?.();
      return;
    }
    const activeIndex = focusable.indexOf(document.activeElement);
    const lastIndex = focusable.length - 1;
    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault?.();
        focusable[lastIndex]?.focus?.();
      }
      return;
    }
    if (activeIndex === -1 || activeIndex === lastIndex) {
      event.preventDefault?.();
      focusable[0]?.focus?.();
    }
  }

  backdrop?.addEventListener?.("click", () => close());
  closeButton?.addEventListener?.("click", () => close());

  return { open, close, sync };
}

function openActivityCenter() {
  if (activityModalController) {
    activityModalController.open();
    return;
  }
  state.activityModalOpen = true;
  renderActivityCenter();
}

function renderActivityCenter() {
  const runningCount = state.aiCreateThreads.filter((thread) => thread.status === "running").length;
  if (activityLauncher) {
    activityLauncher.classList.toggle("hidden", isReadOnlyProject() || !hasVisibleActivityJobs());
    activityLauncher.classList.toggle("is-running", runningCount > 0);
    const countEl = activityLauncher.querySelector(".activity-launcher-count");
    if (countEl) {
      countEl.textContent = String(runningCount || state.aiCreateThreads.length);
    }
  }

  if (activityModal) {
    if (activityModalController) {
      activityModalController.sync();
    } else {
      activityModal.classList.toggle("hidden", !state.activityModalOpen);
      activityModal.setAttribute("aria-hidden", state.activityModalOpen ? "false" : "true");
    }
  }

  if (!activityThreadList || !activityThreadDetail) {
    return;
  }

  if (!state.aiCreateThreads.length) {
    activityThreadList.innerHTML = `<div class="empty-state compact"><p>No active or recent background jobs.</p></div>`;
    activityThreadDetail.innerHTML = `<div class="empty-state compact"><p>Launch an AI draft or YouTube import to see live job output here.</p></div>`;
    return;
  }

  const selection = resolveActivityThreadSelection(state.aiCreateThreads, state.activeAiCreateThreadId);
  state.activeAiCreateThreadId = selection.activeThreadId;
  activityThreadList.innerHTML = renderActivityThreadList(state.aiCreateThreads, state.activeAiCreateThreadId, {
    escapeHtml,
    formatProjectName,
    describeThreadStatus: describeActivityThreadStatus,
  });

  const activeThread = selection.activeThread;
  activityThreadDetail.innerHTML = renderActivityThreadDetail(activeThread, {
    escapeHtml,
    icon,
    formatProjectName,
    summarizeAiCreateFailure,
  });
  activityThreadList.querySelectorAll("[data-job-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeAiCreateThreadId = button.dataset.jobId || null;
      renderActivityCenter();
    });
  });
  activityThreadDetail.querySelector("[data-action='close-activity']")?.addEventListener("click", closeActivityCenter);
  activityThreadDetail.querySelector("[data-action='open-created-page']")?.addEventListener("click", async () => {
    if (!activeThread?.pageId || !activeThread?.projectName) {
      return;
    }
    closeActivityCenter();
    if (activeThread.projectName !== state.currentProject?.name) {
      await loadProject(activeThread.projectName);
    }
    await openPage(activeThread.pageId);
  });
  activityThreadDetail.querySelector("[data-action='retry-thread']")?.addEventListener("click", async () => {
    if (!activeThread?.retryPayload || activeThread.status === "running") {
      return;
    }
    try {
      const previousThreadId = activeThread.id;
      activeThread.status = "running";
      activeThread.error = "";
      activeThread.output = `${activeThread.output || ""}${activeThread.output ? "\n" : ""}[retry] Relaunching AI draft from saved inputs...\n`;
      activeThread.startedAt = Date.now();
      activeThread.elapsedSeconds = 0;
      activeThread.notified = false;
      renderActivityCenter();

      const data = await startAiCreateJobRequest(activeThread.projectName, activeThread.retryPayload);
      state.aiCreateThreads = state.aiCreateThreads.filter((thread) => thread.id !== previousThreadId);
      const nextThread = ensureAiCreateThread(data.jobId, {
        projectName: activeThread.projectName,
        title: activeThread.title || activeThread.retryPayload.titleHint || "AI draft",
        category: activeThread.category || activeThread.retryPayload.category || "",
        url: activeThread.url || activeThread.retryPayload.url || "",
        source: "activity-retry",
        startedAt: Date.now(),
        status: "running",
        output: buildActivityCenterRetryOutput(activeThread),
        retryPayload: activeThread.retryPayload,
      });
      state.activeAiCreateThreadId = nextThread?.id || null;
      ensureAiCreatePolling();
      renderActivityCenter();
      showToast("AI draft retry started...");
    } catch (error) {
      activeThread.status = "failed";
      activeThread.error = error.message || "AI draft retry failed";
      activeThread.output = `${activeThread.output || ""}${activeThread.output ? "\n" : ""}[retry error] ${activeThread.error}\n`;
      renderActivityCenter();
      showToast(activeThread.error);
    }
  });
  activityThreadDetail.querySelector("[data-action='dismiss-thread']")?.addEventListener("click", () => {
    state.dismissedAiCreateJobIds.add(activeThread.id);
    persistClientCaches();
    state.aiCreateThreads = state.aiCreateThreads.filter((thread) => thread.id !== activeThread.id);
    if (state.activeAiCreateThreadId === activeThread.id) {
      state.activeAiCreateThreadId = state.aiCreateThreads[0]?.id || null;
    }
    renderActivityCenter();
  });
}

function hasVisibleActivityJobs() {
  return Boolean(state.aiCreateThreads.length);
}

function closeActivityCenter() {
  if (activityModalController) {
    activityModalController.close();
    return;
  }
  state.activityModalOpen = false;
  renderActivityCenter();
}

function enhanceRelationshipSections(page) {
  if (isReadOnlyProject()) {
    return;
  }

  const prose = articleView.querySelector(".prose");
  if (!prose || !page?.id) {
    return;
  }

  prose.querySelectorAll("h2").forEach((heading) => {
    const config = findSectionConnectionConfig(heading.textContent);
    if (!config) {
      return;
    }

    const options = getConnectionOptions(config.allowedCategories, page.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-add-button";
    button.innerHTML = `${icon("plus")}`;
    button.setAttribute("aria-label", `Add to ${config.title}`);
    button.title = `Add to ${config.title}`;
    if (!options.length) {
      button.disabled = true;
      button.title = `No ${config.allowedCategories.join(", ")} pages available`;
    }
    button.addEventListener("click", () => openRelationshipModal(page, config));
    heading.classList.add("section-heading-with-action");
    heading.appendChild(button);
  });
}

function findSectionConnectionConfig(value) {
  const key = normalizeSectionKey(value);
  return SECTION_CONNECTION_CONFIG[key] || null;
}

function normalizeSectionKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getConnectionOptions(allowedCategories, excludePageId = "") {
  return state.pages
    .filter((page) => page.id !== excludePageId)
    .filter((page) => !allowedCategories?.length || allowedCategories.includes(page.category))
    .sort((left, right) => left.title.localeCompare(right.title));
}

function openRelationshipModal(page, config) {
  state.relationshipDraft = {
    pageId: page.id,
    pageTitle: page.title,
    section: config.title,
    allowedCategories: config.allowedCategories,
    helper: config.helper,
    placeholder: config.placeholder || "Type a page title",
    query: "",
    selectedPageId: "",
    note: "",
    submitting: false,
  };
  if (relationshipModalController) {
    relationshipModalController.open();
  } else {
    state.relationshipModalOpen = true;
    renderRelationshipModal();
  }
}

function closeRelationshipModal() {
  if (relationshipModalController) {
    relationshipModalController.close();
    return;
  }
  state.relationshipDraft = null;
  state.relationshipModalOpen = false;
  renderRelationshipModal();
}

function renderRelationshipModal() {
  if (!relationshipModal || !relationshipModalBody) {
    return;
  }

  if (relationshipModalController) {
    relationshipModalController.sync();
  } else {
    relationshipModal.classList.toggle("hidden", !state.relationshipModalOpen);
    relationshipModal.setAttribute("aria-hidden", state.relationshipModalOpen ? "false" : "true");
  }

  const draft = state.relationshipDraft;
  if (!draft) {
    relationshipModalBody.innerHTML = "";
    return;
  }

  const query = String(draft.query || "").trim().toLowerCase();
  const options = getConnectionOptions(draft.allowedCategories, draft.pageId);
  const selectedOption = options.find((option) => option.id === draft.selectedPageId) || null;
  const filtered = options.filter((option) => {
    if (!query) {
      return true;
    }
    return `${option.title} ${(option.aliases || []).join(" ")} ${option.category} ${option.byline} ${option.excerpt} ${option.wikiPath}`.toLowerCase().includes(query);
  }).slice(0, 12);

  relationshipModalBody.innerHTML = `
    <form id="relationship-form" class="relationship-form">
      <p class="muted">Add a manual connection to <strong>${escapeHtml(draft.section)}</strong> on <strong>${escapeHtml(draft.pageTitle)}</strong>.</p>
      <label class="field">
        <span>Find a page</span>
        <input id="relationship-search" name="query" type="search" value="${escapeHtml(draft.query)}" placeholder="${escapeHtml(draft.placeholder || "Type a page title")}" autocomplete="off" />
      </label>
      <p class="relationship-helper muted">${escapeHtml(draft.helper || "")}</p>
      <div class="relationship-results">
        ${filtered.length
          ? filtered.map((option) => `
            <button class="relationship-option ${option.id === draft.selectedPageId ? "active" : ""}" type="button" data-target-id="${escapeHtml(option.id)}">
              <strong>${escapeHtml(option.title)}</strong>
              <span>${escapeHtml(formatProjectName(option.category))}</span>
              ${option.aliases?.length ? `<small>Aliases: ${escapeHtml(option.aliases.join(", "))}</small>` : ""}
              <small>${escapeHtml(option.byline || option.excerpt || option.wikiPath)}</small>
            </button>
          `).join("")
          : `<div class="empty-state compact"><p>No matching pages in ${escapeHtml(draft.allowedCategories.join(", "))}.</p></div>`}
      </div>
      <label class="field">
        <span>Optional note</span>
        <input name="note" type="text" value="${escapeHtml(draft.note || "")}" placeholder="Add context after the link" />
      </label>
      <div class="relationship-selection ${selectedOption ? "has-selection" : ""}">
        ${selectedOption
          ? `<span>Selected: <strong>${escapeHtml(selectedOption.title)}</strong> in ${escapeHtml(formatProjectName(selectedOption.category))}</span>`
          : `<span>Select one result to save the connection.</span>`}
      </div>
      <div class="rename-actions">
        <button type="submit" class="primary-button" ${draft.selectedPageId ? "" : "disabled"}>${icon("plus")} Save connection</button>
        <button type="button" class="ghost-button inline-action" data-action="close-relationship">Cancel</button>
      </div>
    </form>
  `;

  const form = relationshipModalBody.querySelector("#relationship-form");
  const searchInput = relationshipModalBody.querySelector("#relationship-search");
  const noteInput = form?.elements?.note;

  searchInput?.focus();
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
  searchInput?.addEventListener("input", () => {
    if (!state.relationshipDraft) {
      return;
    }
    state.relationshipDraft.query = searchInput.value;
    const availableOptions = getConnectionOptions(state.relationshipDraft.allowedCategories, state.relationshipDraft.pageId);
    const selectedStillVisible = availableOptions.some((option) => option.id === state.relationshipDraft.selectedPageId);
    if (!selectedStillVisible) {
      state.relationshipDraft.selectedPageId = "";
    }
    renderRelationshipModal();
  });
  noteInput?.addEventListener("input", () => {
    if (state.relationshipDraft) {
      state.relationshipDraft.note = noteInput.value;
    }
  });
  relationshipModalBody.querySelectorAll("[data-target-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.relationshipDraft) {
        return;
      }
      state.relationshipDraft.selectedPageId = button.dataset.targetId || "";
      renderRelationshipModal();
    });
  });
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await submitRelationshipLink();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Connection save failed");
    }
  });
  relationshipModalBody.querySelector("[data-action='close-relationship']")?.addEventListener("click", closeRelationshipModal);
}

async function submitRelationshipLink() {
  if (isReadOnlyProject()) {
    throw new Error("This public wiki is read-only");
  }

  const draft = state.relationshipDraft;
  if (!draft?.pageId || !draft.selectedPageId) {
    throw new Error("Pick a page first");
  }

  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/page-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: draft.pageId,
      section: draft.section,
      targetId: draft.selectedPageId,
      note: draft.note || "",
      expectedMtimeMs: state.currentPageMtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Connection save failed");
  }

  const pageId = draft.pageId;
  invalidateProjectCaches(state.currentProject.name);
  closeRelationshipModal();
  await loadProject(state.currentProject.name);
  showToast(data.alreadyExists ? "Connection already exists" : `Added to ${data.section}`);
  await openPage(pageId, false);
}

function invalidateProjectCaches(projectName) {
  if (!projectName) {
    return;
  }
  state.graphDataCache.delete(projectName);
}

async function submitPersonProfile(form) {
  const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/person-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: state.currentPageId,
      expectedMtimeMs: state.currentPageMtimeMs,
      relationship: form.elements.relationship.value,
      status: form.elements.status.value,
      first_heard: form.elements.first_heard.value,
      how_heard: form.elements.how_heard.value,
      first_met: form.elements.first_met.value,
      where_met: form.elements.where_met.value,
      nationality: form.elements.nationality.value,
      birthday: form.elements.birthday.value,
      profession: form.elements.profession.value,
      languages: form.elements.languages.value,
      website: form.elements.website.value,
      data_source: form.elements.data_source.value,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Profile save failed");
  }

  const pageId = state.currentPageId;
  invalidateProjectCaches(state.currentProject.name);
  await loadProject(state.currentProject.name);
  showToast("Profile metadata saved");
  await openPage(data.pageId || pageId, false);
}

async function submitPersonWebsiteFetch(form) {
  const button = form.querySelector("#fetch-person-website");
  const originalLabel = button?.innerHTML || "";
  const website = form.elements.website.value.trim();
  if (!website) {
    throw new Error("Enter a website first");
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = `${icon("links")} Fetching...`;
  }
  showToast("Fetching website profile...");

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/person-profile/fetch-website`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: state.currentPageId,
        website,
        expectedMtimeMs: state.currentPageMtimeMs,
      }),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "Website fetch failed");
    }

    const pageId = state.currentPageId;
    invalidateProjectCaches(state.currentProject.name);
    await loadProject(state.currentProject.name);
    showToast("Profile updated from website");
    await openPage(data.pageId || pageId, false);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalLabel;
    }
  }
}

function initializeProjectCreateForm(form) {
  const nameInput = form.elements.name;
  const pathInput = form.elements.path;
  const genreSelect = form.elements.genre;
  const descriptionInput = form.elements.description;
  const filingInput = form.elements.filingGuidance;
  const knowledgeInput = form.elements.knowledgePriority;
  const recencyBiasInput = form.elements.resourceRecencyBias;
  const recencyWindowInput = form.elements.resourceRecencyWindowDays;

  const applyTemplate = (forceText = false) => {
    const template = findProjectTemplate(genreSelect.value);
    if (!template) {
      return;
    }
    syncProjectCategorySelection(form, template.categories || []);
    if (forceText || !descriptionInput.value.trim()) {
      descriptionInput.value = template.description || "";
    }
    if (forceText || !filingInput.value.trim()) {
      filingInput.value = template.filingGuidance || "";
    }
    if (forceText || !knowledgeInput.value.trim()) {
      knowledgeInput.value = template.knowledgePriority || "";
    }
    if (forceText || !recencyBiasInput.value) {
      recencyBiasInput.value = template.resourceRecencyBias || "neutral";
    }
    if (forceText || !String(recencyWindowInput.value || "").trim()) {
      recencyWindowInput.value = String(template.resourceRecencyWindowDays ?? 30);
    }
  };

  nameInput?.addEventListener("input", () => {
    pathInput.value = defaultProjectPath(nameInput.value);
  });
  genreSelect?.addEventListener("change", () => applyTemplate(true));
  form.querySelectorAll('input[name="categories"]').forEach((input) => {
    input.addEventListener("change", () => {
      input.closest(".project-category-chip")?.classList.toggle("active", input.checked);
    });
  });
  applyTemplate(true);
}

function initializeProjectConfigForm(form) {
  trackProjectConfigFormState(form);
  const genreSelect = form.elements.genre;
  genreSelect?.addEventListener("change", () => {
    const template = findProjectTemplate(genreSelect.value);
    if (!template) {
      return;
    }
    syncProjectCategorySelection(form, template.categories || []);
    if (!form.elements.filingGuidance.value.trim()) {
      form.elements.filingGuidance.value = template.filingGuidance || "";
    }
    if (!form.elements.knowledgePriority.value.trim()) {
      form.elements.knowledgePriority.value = template.knowledgePriority || "";
    }
    if (!form.elements.resourceRecencyBias.value) {
      form.elements.resourceRecencyBias.value = template.resourceRecencyBias || "neutral";
    }
    if (!String(form.elements.resourceRecencyWindowDays.value || "").trim()) {
      form.elements.resourceRecencyWindowDays.value = String(template.resourceRecencyWindowDays ?? 30);
    }
  });
  form.querySelectorAll('input[name="categories"]').forEach((input) => {
    input.addEventListener("change", () => {
      input.closest(".project-category-chip")?.classList.toggle("active", input.checked);
    });
  });
  form.querySelectorAll("[data-project-ai-fill]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await fillProjectConfigFieldWithAi(button);
      } catch (error) {
        console.error(error);
        showToast(error.message || "AI fill failed");
      }
    });
  });
  form.querySelectorAll('[data-action="sync-project-categories"]').forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await submitProjectCategorySync(button);
      } catch (error) {
        console.error(error);
        showToast(error.message || "Project category sync failed");
      }
    });
  });
}

function setProjectAiFillButtonsDisabled(form, disabled) {
  form?.querySelectorAll?.("[data-project-ai-fill]").forEach((button) => {
    button.disabled = Boolean(disabled);
  });
}

function trackProjectConfigFormState(form) {
  if (!form) {
    return;
  }
  state.activeProjectConfigForm = form;
  state.activeProjectConfigInitialSignature = getProjectConfigFormSignature(form);
  form.addEventListener?.("input", () => syncTrackedProjectConfigForm(form));
  form.addEventListener?.("change", () => syncTrackedProjectConfigForm(form));
  syncTrackedProjectConfigForm(form);
}

function syncTrackedProjectConfigForm(form) {
  if (!form || state.activeProjectConfigForm !== form) {
    return;
  }
  form.dataset.projectConfigDirty = String(hasUnsavedProjectConfigChanges(form));
}

function getProjectConfigFormSignature(form) {
  return JSON.stringify(collectProjectConfigPayload(form));
}

function hasUnsavedProjectConfigChanges(form = state.activeProjectConfigForm) {
  if (!form || state.activeProjectConfigForm !== form) {
    return false;
  }
  return getProjectConfigFormSignature(form) !== state.activeProjectConfigInitialSignature;
}

function markProjectConfigSaved(form) {
  if (!form || state.activeProjectConfigForm !== form) {
    return;
  }
  state.activeProjectConfigInitialSignature = getProjectConfigFormSignature(form);
  syncTrackedProjectConfigForm(form);
}

function getProjectConfigUnsavedChangesMessage() {
  return "You have unsaved changes in Main Config. Leave without saving?";
}

function confirmProjectConfigNavigation(nextHash = "") {
  if (state.suppressNextProjectConfigHashGuard) {
    state.suppressNextProjectConfigHashGuard = false;
    state.lastAcceptedHash = window.location.hash || state.lastAcceptedHash;
    return true;
  }

  const requestedHash = String(nextHash || "");
  if (!hasUnsavedProjectConfigChanges()) {
    state.lastAcceptedHash = requestedHash || state.lastAcceptedHash;
    return true;
  }

  const currentHash = window.location.hash || "";
  const previousHash = state.lastAcceptedHash || currentHash;
  if (!requestedHash || requestedHash === previousHash) {
    return true;
  }

  const confirmed = window.confirm(getProjectConfigUnsavedChangesMessage());
  if (confirmed) {
    state.lastAcceptedHash = requestedHash;
    return true;
  }

  if (requestedHash === currentHash) {
    state.suppressNextProjectConfigHashGuard = true;
    window.location.hash = previousHash;
  }
  return false;
}

function collectProjectConfigPayload(form, options = {}) {
  return {
    genre: form.elements.genre.value,
    description: form.elements.description.value.trim(),
    filingGuidance: form.elements.filingGuidance.value.trim(),
    knowledgePriority: form.elements.knowledgePriority.value.trim(),
    resourceRecencyBias: form.elements.resourceRecencyBias.value,
    resourceRecencyWindowDays: form.elements.resourceRecencyWindowDays.value,
    categories: getSelectedProjectCategories(form),
    primaryUrl: form.elements.primaryUrl.value.trim(),
    primaryLabel: form.elements.primaryLabel.value.trim(),
    primarySummary: form.elements.primarySummary.value.trim(),
    ...(options.includeExpectedProjectsMtimeMs ? { expectedProjectsMtimeMs: state.projectsMtimeMs } : {}),
  };
}

function getProjectConfigAiFillLabel(fieldName) {
  const labels = {
    description: "project description",
    filingGuidance: "AI filing guidance",
    knowledgePriority: "knowledge priority rules",
    primarySummary: "primary summary",
  };
  return labels[String(fieldName || "").trim()] || "field";
}

function openProjectAiFillReview(review) {
  state.projectAiFillReview = review;
  if (projectAiFillModalController) {
    projectAiFillModalController.open();
  } else {
    state.projectAiFillReviewPreviousFocus = review?.triggerButton || document.activeElement || null;
    state.projectAiFillReviewOpen = true;
    renderProjectAiFillReviewModal();
  }
  setProjectAiFillButtonsDisabled(review?.form, true);
}

function closeProjectAiFillReviewModal() {
  if (projectAiFillModalController) {
    projectAiFillModalController.close();
  } else {
    setProjectAiFillButtonsDisabled(state.projectAiFillReview?.form, false);
    state.projectAiFillReview = null;
    state.projectAiFillReviewOpen = false;
    renderProjectAiFillReviewModal();
    state.projectAiFillReviewPreviousFocus?.focus?.();
    state.projectAiFillReviewPreviousFocus = null;
  }
}

function getProjectAiFillModalFocusableElements() {
  return Array.from(projectAiFillModal?.querySelectorAll?.(
    'button:not([disabled]), textarea:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ) || []).filter((element) => !element.classList?.contains?.("hidden"));
}

function trapProjectAiFillModalFocus(event) {
  if (!state.projectAiFillReviewOpen || event.key !== "Tab") {
    return;
  }
  const focusable = getProjectAiFillModalFocusableElements();
  if (!focusable.length) {
    return;
  }
  const activeIndex = focusable.indexOf(document.activeElement);
  const lastIndex = focusable.length - 1;
  if (event.shiftKey) {
    if (activeIndex <= 0) {
      event.preventDefault?.();
      focusable[lastIndex]?.focus?.();
    }
    return;
  }
  if (activeIndex === -1 || activeIndex === lastIndex) {
    event.preventDefault?.();
    focusable[0]?.focus?.();
  }
}

function renderProjectAiFillReviewModal() {
  if (!projectAiFillModal || !projectAiFillModalBody) {
    return;
  }

  if (projectAiFillModalController) {
    projectAiFillModalController.sync();
  } else {
    projectAiFillModal.classList.toggle("hidden", !state.projectAiFillReviewOpen);
    projectAiFillModal.setAttribute("aria-hidden", state.projectAiFillReviewOpen ? "false" : "true");
    projectAiFillModal.onkeydown = state.projectAiFillReviewOpen ? trapProjectAiFillModalFocus : null;
  }

  const review = state.projectAiFillReview;
  if (!review) {
    projectAiFillModalBody.innerHTML = "";
    return;
  }

  const currentValue = String(review.currentValue || "");
  const suggestedValue = String(review.suggestedValue || "");
  const contextRows = [
    review.reason ? ["Reason", review.reason] : null,
    review.source ? ["Source", review.source] : null,
    review.sourceUrl ? ["Source URL", review.sourceUrl] : null,
  ].filter(Boolean);
  projectAiFillModalBody.innerHTML = `
    <div class="project-ai-fill-review-grid">
      <p class="project-ai-fill-review-copy muted">Review the suggested override for <strong>${escapeHtml(review.label)}</strong>. Accept to replace the current field value, or decline to keep what you have.</p>
      ${contextRows.length ? `
        <section class="project-ai-fill-review-context">
          ${contextRows.map(([label, value]) => `
            <div>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </div>
          `).join("")}
        </section>
      ` : ""}
      <div class="project-ai-fill-review-panels">
        <section class="project-ai-fill-review-panel">
          <h4>Current value</h4>
          <textarea readonly>${escapeHtml(currentValue)}</textarea>
        </section>
        <section class="project-ai-fill-review-panel suggested">
          <h4>Suggested override</h4>
          <textarea readonly>${escapeHtml(suggestedValue)}</textarea>
        </section>
      </div>
      <div class="project-ai-fill-review-actions">
        <button type="button" class="ghost-button inline-action" data-action="decline-project-ai-fill">Decline</button>
        <button type="button" class="primary-button" data-action="accept-project-ai-fill">${icon("save")} Accept</button>
      </div>
    </div>
  `;

  projectAiFillModalBody.querySelector("[data-action='decline-project-ai-fill']")?.addEventListener("click", closeProjectAiFillReviewModal);
  projectAiFillModalBody.querySelector("[data-action='accept-project-ai-fill']")?.addEventListener("click", acceptProjectAiFillReview);
  window.setTimeout(() => {
    projectAiFillModalBody.querySelector("[data-action='accept-project-ai-fill']")?.focus?.();
  }, 0);
}

function acceptProjectAiFillReview() {
  const review = state.projectAiFillReview;
  if (!review?.targetField) {
    closeProjectAiFillReviewModal();
    return;
  }

  review.targetField.value = String(review.suggestedValue || "");
  review.targetField.focus?.();
  review.targetField.dispatchEvent?.(new Event("input", { bubbles: true }));
  showToast(`Updated ${review.label} from AI suggestion`);
  closeProjectAiFillReviewModal();
}

async function fillProjectConfigFieldWithAi(button) {
  const form = button?.closest(".project-config-form");
  const projectName = String(form?.dataset?.projectName || "").trim();
  const field = String(button?.dataset?.projectAiFill || "").trim();
  const targetField = form?.elements?.[field];
  if (!projectName || !field || !targetField) {
    throw new Error("AI fill is unavailable for this field");
  }
  if (state.projectAiFillReviewOpen) {
    throw new Error("Finish reviewing the current AI fill suggestion first");
  }

  const originalMarkup = button.innerHTML;
  setProjectAiFillButtonsDisabled(form, true);
  button.innerHTML = `${icon("robot")} Filling...`;

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/config/ai-fill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field,
        ...collectProjectConfigPayload(form),
      }),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "AI fill failed");
    }
    if (!String(data.value || "").trim()) {
      throw new Error(`AI fill returned an empty ${getProjectConfigAiFillLabel(field)}`);
    }
    openProjectAiFillReview({
      form,
      field,
      label: getProjectConfigAiFillLabel(field),
      currentValue: targetField.value,
      suggestedValue: String(data.value || ""),
      reason: String(data.reason || data.routingReason || data.explanation || ""),
      source: String(data.source || data.sourceLabel || ""),
      sourceUrl: String(data.sourceUrl || ""),
      targetField,
      triggerButton: button,
    });
  } finally {
    if (!state.projectAiFillReviewOpen) {
      setProjectAiFillButtonsDisabled(form, false);
    }
    button.innerHTML = originalMarkup;
  }
}

async function submitProjectCategorySync(button) {
  const form = button?.closest(".project-config-form");
  const projectName = String(button?.dataset?.projectName || form?.dataset?.projectName || "").trim();
  if (!projectName) {
    throw new Error("Project category sync is unavailable");
  }
  if (form && hasUnsavedProjectConfigChanges(form)) {
    throw new Error("Save or discard Main Config changes before syncing discovered categories");
  }

  const originalMarkup = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `${icon("save")} Syncing...`;

  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/config/sync-discovered-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedProjectsMtimeMs: state.projectsMtimeMs,
      }),
    });
    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(data.error || "Project category sync failed");
    }

    const projectsData = await fetchJson("/api/projects");
    state.projects = projectsData.projects || [];
    state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
    if (state.currentProject?.name === projectName) {
      await loadProject(projectName);
    }
    await showProjectsAdmin(false);

    const addedCategories = Array.isArray(data.addedCategories) ? data.addedCategories : [];
    showToast(
      addedCategories.length
        ? `Synced ${addedCategories.length} discovered ${addedCategories.length === 1 ? "category" : "categories"} into ${formatProjectName(projectName)}`
        : `No new on-disk categories to sync for ${formatProjectName(projectName)}`
    );
  } finally {
    button.disabled = false;
    button.innerHTML = originalMarkup;
  }
}

async function submitProjectCreate(form) {
  const payload = {
    name: form.elements.name.value.trim(),
    genre: form.elements.genre.value,
    path: form.elements.path.value.trim(),
    description: form.elements.description.value.trim(),
    filingGuidance: form.elements.filingGuidance.value.trim(),
    knowledgePriority: form.elements.knowledgePriority.value.trim(),
    resourceRecencyBias: form.elements.resourceRecencyBias.value,
    resourceRecencyWindowDays: form.elements.resourceRecencyWindowDays.value,
    categories: getSelectedProjectCategories(form),
    primaryUrl: form.elements.primaryUrl.value.trim(),
    primaryLabel: form.elements.primaryLabel.value.trim(),
    primarySummary: form.elements.primarySummary.value.trim(),
    expectedProjectsMtimeMs: state.projectsMtimeMs,
  };
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Project create failed");
  }

  const projectsData = await fetchJson("/api/projects");
  state.projects = projectsData.projects || [];
  state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
  projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${escapeHtml(project.name)}">${escapeHtml(displayProjectName(project))}</option>`)
    .join("");
  showToast(`Created ${formatProjectName(data.project?.name || payload.name)}`);
  await loadProject(data.project.name);
  setHash(`/project/${encodeURIComponent(data.project.name)}/home`);
}

async function submitProjectImport(form, createForm) {
  if (!createForm) {
    throw new Error("Project create form is unavailable");
  }

  const file = form.elements.importFile.files[0];
  const markdownText = form.elements.markdown.value.trim() || (file ? String(await readFileAsText(file)).trim() : "");
  if (!markdownText) {
    throw new Error("Paste markdown notes or upload a markdown file first");
  }

  const response = await fetch("/api/projects/import-spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: markdownText }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Project import failed");
  }

  const spec = data.spec || {};
  createForm.elements.name.value = spec.name || "";
  createForm.elements.genre.value = spec.genre || createForm.elements.genre.value;
  createForm.elements.path.value = defaultProjectPath(spec.name || "");
  createForm.elements.description.value = spec.description || "";
  createForm.elements.filingGuidance.value = spec.filingGuidance || "";
  createForm.elements.knowledgePriority.value = spec.knowledgePriority || "";
  createForm.elements.resourceRecencyBias.value = spec.resourceRecencyBias || "neutral";
  createForm.elements.resourceRecencyWindowDays.value = String(spec.resourceRecencyWindowDays ?? 30);
  createForm.elements.primaryUrl.value = spec.primaryUrl || "";
  createForm.elements.primaryLabel.value = spec.primaryLabel || "";
  createForm.elements.primarySummary.value = spec.primarySummary || "";
  syncProjectCategorySelection(createForm, spec.categories || []);
  showToast("Project form prefilled from AI import");
  document.querySelector("#project-create-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitProjectConfig(form) {
  const projectName = form.dataset.projectName || "";
  const payload = collectProjectConfigPayload(form, { includeExpectedProjectsMtimeMs: true });
  const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Project update failed");
  }

  const projectsData = await fetchJson("/api/projects");
  state.projects = projectsData.projects || [];
  state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
  markProjectConfigSaved(form);
  if (state.currentProject?.name === projectName) {
    await loadProject(projectName);
  }
  showToast(`Saved ${formatProjectName(data.project?.name || projectName)}`);
  setHash(`/projects/edit/${encodeURIComponent(projectName)}`);
}

async function submitProjectFork(form) {
  const projectName = form.dataset.projectName || "";
  const payload = {
    name: form.elements.name.value.trim(),
    path: form.elements.path.value.trim(),
    description: form.elements.description.value.trim(),
    keepCanonicalSource: form.elements.keepCanonicalSource.checked,
    expectedProjectsMtimeMs: state.projectsMtimeMs,
  };
  const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/fork`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Project fork failed");
  }

  const projectsData = await fetchJson("/api/projects");
  state.projects = projectsData.projects || [];
  state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
  projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${escapeHtml(project.name)}">${escapeHtml(displayProjectName(project))}</option>`)
    .join("");
  showToast(`Forked ${formatProjectName(projectName)} into ${formatProjectName(data.project?.name || payload.name)}`);
  setHash(`/projects/edit/${encodeURIComponent(data.project.name)}`);
}

async function submitProjectDelete(form) {
  const projectName = form.dataset.projectName || "";
  if (form.elements.confirmName.value.trim() !== projectName) {
    throw new Error("Type the exact project name to confirm delete");
  }
  const mode = form.elements.mode.value;
  const confirmed = window.confirm(
    mode === "soft"
      ? `Soft delete ${formatProjectName(projectName)}? The folder will be moved into .trash/projects.`
      : `Permanently delete ${formatProjectName(projectName)} and all contained data?`
  );
  if (!confirmed) {
    return;
  }
  const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      expectedProjectsMtimeMs: state.projectsMtimeMs,
    }),
  });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "Project delete failed");
  }

  const projectsData = await fetchJson("/api/projects");
  state.projects = projectsData.projects || [];
  state.projectsMtimeMs = Number(projectsData.projectsMtimeMs || 0) || null;
  projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${escapeHtml(project.name)}">${escapeHtml(displayProjectName(project))}</option>`)
    .join("");
  if (state.currentProject?.name === projectName) {
    state.currentProject = null;
    state.pages = [];
    state.sections = [];
    state.currentPageId = null;
  }
  showToast(data.mode === "soft" ? `Soft-deleted ${formatProjectName(projectName)}` : `Deleted ${formatProjectName(projectName)}`);
  setHash("/projects");
}

function getSelectedProjectCategories(form) {
  return Array.from(form.querySelectorAll('input[name="categories"]:checked')).map((input) => input.value);
}

function getManagedProjectCategories() {
  return Array.from(new Set([
    ...(Array.isArray(state.currentProject?.configuredCategories) ? state.currentProject.configuredCategories : []),
    ...(Array.isArray(state.currentProject?.categories) ? state.currentProject.categories : []),
    ...Object.keys(state.currentProject?.categoryMeta || {}),
  ]))
    .filter((category) => category !== "root" && category !== "assets")
    .sort((left, right) => left.localeCompare(right));
}

function findProjectTemplate(templateId) {
  return state.projectTemplates.find((template) => template.id === templateId) || null;
}

function syncProjectCategorySelection(form, categories) {
  const selected = new Set((categories || []).map((item) => String(item)));
  form.querySelectorAll('input[name="categories"]').forEach((input) => {
    input.checked = selected.has(input.value);
    input.closest(".project-category-chip")?.classList.toggle("active", input.checked);
  });
}

function defaultProjectPath(name) {
  const slug = slugify(name || "");
  return `/garage/projects/${slug || "my-new-project"}`;
}

function highlightActivePage() {
  sectionsEl.querySelectorAll("[data-page-id]").forEach((button) => {
    const active = button.dataset.pageId === state.currentPageId && state.currentView === "page";
    button.classList.toggle("active", active);
    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  updateNavigationActiveState();
}

function setMobileMenuOpen(open) {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const isOpen = Boolean(open);
  document.body.classList.toggle("mobile-menu-open", isOpen);
  mobileMenuButton?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (mobileMenuButton) {
    mobileMenuButton.innerHTML = `${icon(isOpen ? "arrow-in" : "categories")} ${isOpen ? "Close" : "Menu"}`;
  }
  mobileMenuBackdrop?.classList.toggle("hidden", !isOpen);
  if (siteSidebar) {
    if (isMobile) {
      siteSidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");
    } else {
      siteSidebar.removeAttribute("aria-hidden");
    }
  }
}

function setNavCurrent(element, active) {
  if (!element) {
    return;
  }
  element.classList.toggle("active", Boolean(active));
  if (active) {
    element.setAttribute("aria-current", "page");
  } else {
    element.removeAttribute("aria-current");
  }
}

function updateNavigationActiveState() {
  const indexPage = state.pages.find((candidate) => candidate.id === "index");
  const isIndexPage = state.currentView === "page" && state.currentPageId === indexPage?.id;
  setNavCurrent(overviewButton, state.currentView === "home");
  setNavCurrent(indexButton, isIndexPage);
  setNavCurrent(graphButton, state.currentView === "graph");
  setNavCurrent(quotesButton, state.currentView === "quotes");
  categoryFilters.querySelectorAll("[data-category], [data-open-category]").forEach((button) => {
    const category = String(button.dataset.category || button.dataset.openCategory || "").trim();
    const active = state.currentView === "category" && category && category === state.currentCategoryView;
    if (category === "all") {
      return;
    }
    button.classList.toggle("active", active);
    button.closest(".category-filter-split")?.classList.toggle("active", active);
    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function findDefaultPageId() {
  return findHomePage()?.id || null;
}

function navigateToDefaultPage() {
  showHome();
}

function beginViewRequest() {
  state.activeViewRequestId += 1;
  return state.activeViewRequestId;
}

function getCategoryIconName(category) {
  const key = String(category || "").trim().toLowerCase();
  return state.currentProject?.categoryMeta?.[key]?.icon || "file";
}

function isActiveViewRequest(requestId, projectName) {
  return requestId === state.activeViewRequestId && state.currentProject?.name === projectName;
}

function openOverview() {
  showHome();
}

function openIndexPage() {
  const indexPage = findIndexPage();
  if (indexPage) {
    openPage(indexPage.id);
  }
}

function findHomePage() {
  const preferredIds = ["overview", "index"];
  for (const id of preferredIds) {
    const page = state.pages.find((candidate) => candidate.id === id);
    if (page) {
      return page;
    }
  }

  const rootPage = state.pages.find((candidate) => candidate.category === "root");
  if (rootPage) {
    return rootPage;
  }

  return state.pages[0] || null;
}

function findIndexPage() {
  return state.pages.find((candidate) => candidate.id === "index") || findHomePage();
}

function openVaultInObsidian() {
  if (state.currentProject?.obsidianVaultUrl) {
    window.location.href = state.currentProject.obsidianVaultUrl;
  }
}

function linkCard(item) {
  const badges = renderConnectionBadges(item.direction);
  const extraBadges = (item.extraBadges || []).map((badge) => `<span class="type-badge subtle">${escapeHtml(badge)}</span>`).join("");
  const reasonBadges = (item.relationReasons || []).map((reason) => `<span class="type-badge subtle">${escapeHtml(reason)}</span>`).join("");
  return `
    <button class="link-card" data-page-id="${escapeHtml(item.id)}">
      ${item.image ? `<img class="link-card-image" src="${escapeHtml(item.image.url)}" alt="${escapeHtml(item.title)}" />` : ""}
      ${(badges || item.entityType || extraBadges || reasonBadges) ? `<div class="link-card-badges">${badges}${item.entityType ? `<span class="type-badge">${escapeHtml(item.entityType)}</span>` : ""}${extraBadges}${reasonBadges}</div>` : ""}
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.byline || item.excerpt || item.wikiPath)}</span>
      ${item.byline && item.excerpt ? `<span>${escapeHtml(item.excerpt)}</span>` : ""}
      ${item.image?.label ? `<small class="link-card-label">${escapeHtml(item.image.label)}</small>` : ""}
    </button>
  `;
}

function renderConnectionBadges(directionSet) {
  if (!directionSet || !directionSet.size) {
    return "";
  }

  const badges = [];
  if (directionSet.has("out") && directionSet.has("in")) {
    badges.push(connectionBadge("both", "Mutual link"));
  } else {
    if (directionSet.has("out")) {
      badges.push(connectionBadge("out", "This page links out to this note"));
    }
    if (directionSet.has("in")) {
      badges.push(connectionBadge("in", "This note links back to this page"));
    }
  }

  return badges.join("");
}

function connectionBadge(kind, title) {
  return `<span class="connection-badge ${escapeHtml(kind)}" title="${escapeHtml(title)}">${connectionIcon(kind)}</span>`;
}

function connectionIcon(kind) {
  if (kind === "out") {
    return icon("arrow-out");
  }
  if (kind === "in") {
    return icon("arrow-in");
  }
  return icon("arrow-both");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".link-card");
  if (button?.dataset.pageId) {
    openPage(button.dataset.pageId);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".person-source-page");
  if (button?.dataset.pageId) {
    openPage(button.dataset.pageId);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".map-popup-open");
  if (button?.dataset.pageId) {
    event.preventDefault();
    openProjectPage(button.dataset.project || state.currentProject?.name, button.dataset.pageId);
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest(".map-popup-link");
  if (link?.dataset.pageId || link?.dataset.country) {
    event.preventDefault();
    if (link.dataset.pageId) {
      openProjectPage(link.dataset.project || state.currentProject?.name, link.dataset.pageId);
      return;
    }
    if (link.dataset.country) {
      const projectName = link.dataset.project || state.currentProject?.name;
      if (projectName) {
        window.location.hash = buildCountryPlacesHash(projectName, link.dataset.country);
      }
    }
  }
});

function renderHero({ kicker, title, description, meta }) {
  heroKicker.textContent = kicker;
  heroTitle.textContent = title;
  heroDescription.textContent = description || "";
  heroMeta.innerHTML = `${(meta || []).join("")}${state.pageHeroActions || ""}`;
  updateDocumentTitle(title);
  updateNavigationActiveState();
}

function updateDocumentTitle(pageTitle = "") {
  const projectLabel = displayProjectName(state.currentProject);
  if (pageTitle && projectLabel) {
    if (pageTitle === projectLabel) {
      document.title = `${projectLabel} · ${PUBLIC_WIKI_TITLE}`;
      return;
    }
    document.title = `${pageTitle} · ${projectLabel} · ${PUBLIC_WIKI_TITLE}`;
    return;
  }
  if (projectLabel) {
    document.title = `${projectLabel} · ${PUBLIC_WIKI_TITLE}`;
    return;
  }
  document.title = PUBLIC_WIKI_TITLE;
}

function displayProjectName(projectOrName) {
  if (projectOrName && typeof projectOrName === "object") {
    return projectOrName.displayName || formatProjectName(projectOrName.name || "");
  }
  const project = state.projects.find((candidate) => candidate.name === projectOrName);
  return project?.displayName || formatProjectName(projectOrName || "");
}

function isReadOnlyProject(project = state.currentProject) {
  return Boolean(project?.readOnly || project?.publicShare);
}

function refreshProjectChrome() {
  const readOnly = isReadOnlyProject();
  document.body.classList.toggle("project-read-only", readOnly);
  document.body.classList.toggle("project-public-share", Boolean(state.currentProject?.publicShare));
  const brandTitle = document.querySelector(".brand-title");
  const brandEyebrow = document.querySelector(".brand .eyebrow");
  const brandSubtitle = document.querySelector(".brand .muted");
  if (brandEyebrow) {
    brandEyebrow.textContent = readOnly ? "Public Conference Wiki" : "Project Wiki";
  }
  if (brandTitle) {
    brandTitle.textContent = displayProjectName(state.currentProject) || PUBLIC_WIKI_TITLE;
  }
  if (brandSubtitle) {
    brandSubtitle.textContent = state.currentProject?.brandSubtitle || state.currentProject?.description || PUBLIC_WIKI_SUBTITLE;
  }
  openVaultButton?.classList.toggle("hidden", readOnly);
  workspaceSidebarGroup?.classList.toggle("hidden", readOnly || state.projects.length <= 1);
  addProjectButton?.classList.toggle("hidden", readOnly);
  manageProjectsButton?.classList.toggle("hidden", readOnly);
  composeButton?.classList.toggle("hidden", readOnly);
  claudeButton?.classList.toggle("hidden", readOnly);
  chaptersButton?.classList.toggle("hidden", readOnly);
  rootQuotesButton?.classList.toggle("hidden", readOnly);
  quotesButton?.classList.toggle("hidden", !state.currentProject);
  calendarButton?.classList.toggle("hidden", readOnly || Boolean(state.currentProject?.hideCalendar));
  activityLauncher?.classList.toggle("hidden", readOnly || !hasVisibleActivityJobs());
  if (claudeButton) {
    claudeButton.innerHTML = `${icon("save")} ${state.currentProject?.instructionsFilename || (readOnly ? "AGENT.md" : "CLAUDE.md")}`;
  }
}

async function openProjectPage(projectName, pageId) {
  if (!pageId) {
    return;
  }
  if (projectName && projectName !== state.currentProject?.name) {
    await loadProject(projectName);
  }
  await openPage(pageId);
}

function buildCountryPlacesHash(projectName, country) {
  if (typeof buildCountryPlacesHashFromRouteNavigation === "function") {
    return buildCountryPlacesHashFromRouteNavigation(projectName, country, state.currentProject?.name);
  }
  return `/project/${encodeURIComponent(projectName || state.currentProject?.name || "")}/places-by-country/${encodeURIComponent(country)}`;
}

function buildProjectsHash(selectedProjectName = "") {
  if (typeof buildProjectsHashFromRouteNavigation === "function") {
    return buildProjectsHashFromRouteNavigation(selectedProjectName || state.currentProject?.name || "");
  }
  return selectedProjectName
    ? `/projects/edit/${encodeURIComponent(selectedProjectName)}`
    : "/projects";
}

function buildManageProjectsButtonHash(rawHash = "") {
  const route = parseHash(rawHash || window.location.hash || "");
  const selectedProjectName = route?.project || "";
  if (typeof buildProjectsHashFromRouteNavigation === "function") {
    return buildProjectsHashFromRouteNavigation(selectedProjectName);
  }
  return selectedProjectName
    ? `/projects/edit/${encodeURIComponent(selectedProjectName)}`
    : "/projects";
}

function buildProjectViewHash(projectName, view, pageId = "") {
  if (typeof buildProjectViewHashFromRouteNavigation === "function") {
    return buildProjectViewHashFromRouteNavigation(projectName || state.currentProject?.name || "", view, pageId);
  }
  if (view === "page") {
    return `/project/${encodeURIComponent(projectName || state.currentProject?.name || "")}/page/${encodeURIComponent(pageId || "")}`;
  }
  return `/project/${encodeURIComponent(projectName || state.currentProject?.name || "")}/${encodeURIComponent(view || "home")}`;
}

function resetViewportTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  articleView.scrollTop = 0;
  graphView.scrollTop = 0;
}

function loadClientCaches() {
  try {
    const geocodeRaw = window.localStorage.getItem("wiki-geocode-cache");
    const mapStatsRaw = window.localStorage.getItem("wiki-map-stats-cache");
    const dismissedJobsRaw = window.localStorage.getItem("wiki-dismissed-ai-create-jobs");
    const geocodeEntries = JSON.parse(geocodeRaw || "[]");
    const mapStatsEntries = JSON.parse(mapStatsRaw || "[]");
    const dismissedJobs = JSON.parse(dismissedJobsRaw || "[]");
    state.geocodeCache = new Map(Array.isArray(geocodeEntries) ? geocodeEntries : []);
    state.mapStatsCache = new Map(Array.isArray(mapStatsEntries) ? mapStatsEntries : []);
    state.dismissedAiCreateJobIds = new Set(Array.isArray(dismissedJobs) ? dismissedJobs.map((item) => String(item || "").trim()).filter(Boolean) : []);
  } catch (_error) {
    state.geocodeCache = new Map();
    state.mapStatsCache = new Map();
    state.dismissedAiCreateJobIds = new Set();
  }
}

function persistClientCaches() {
  try {
    window.localStorage.setItem("wiki-geocode-cache", JSON.stringify(Array.from(state.geocodeCache.entries()).slice(-400)));
    window.localStorage.setItem("wiki-map-stats-cache", JSON.stringify(Array.from(state.mapStatsCache.entries()).slice(-80)));
    window.localStorage.setItem("wiki-dismissed-ai-create-jobs", JSON.stringify(Array.from(state.dismissedAiCreateJobIds).slice(-400)));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function createVoiceDiaryHomePerf(requestId) {
  return {
    requestId,
    startedAt: performance.now(),
    sample: {
      homeContextMs: null,
      homeShellReadyMs: null,
      homeShellPaintMs: null,
      mapHydrationStartMs: null,
      geocodeMs: null,
      statsMs: null,
      mapRenderMs: null,
      mapRenderMode: null,
      renderedLocations: 0,
    },
    emitted: false,
  };
}

function markVoiceDiaryHomePerf(perf, key) {
  if (!perf) {
    return;
  }
  perf.sample[key] = Number((performance.now() - perf.startedAt).toFixed(1));
}

function emitVoiceDiaryHomePerf(perf) {
  if (!perf || perf.emitted) {
    return;
  }
  perf.emitted = true;
  window.__voiceDiaryHomePerf = {
    requestId: perf.requestId,
    ...perf.sample,
    totalMs: Number((performance.now() - perf.startedAt).toFixed(1)),
  };
  console.table({
    home_context_ms: perf.sample.homeContextMs,
    home_shell_ready_ms: perf.sample.homeShellReadyMs,
    home_shell_paint_ms: perf.sample.homeShellPaintMs,
    map_hydration_start_ms: perf.sample.mapHydrationStartMs,
    geocode_ms: perf.sample.geocodeMs,
    stats_ms: perf.sample.statsMs,
    map_render_ms: perf.sample.mapRenderMs,
    map_render_mode: perf.sample.mapRenderMode,
    rendered_locations: perf.sample.renderedLocations,
    total_ms: window.__voiceDiaryHomePerf.totalMs,
  });
}

function projectAccent(projectName = "") {
  const palette = ["#0f766e", "#1d4ed8", "#b45309", "#7c3aed", "#be123c", "#047857", "#334155", "#2563eb"];
  const key = String(projectName || "");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return palette[hash % palette.length];
}

function matchesPage(page, query) {
  if (!query) {
    return true;
  }

  const haystack = `${page.title} ${(page.aliases || []).join(" ")} ${page.excerpt} ${page.wikiPath}`.toLowerCase();
  return haystack.includes(query);
}

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(data.error || `${response.status} ${response.statusText}`);
  }
  return data;
}

async function parseApiResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    const compact = text.replace(/\s+/g, " ").trim().slice(0, 220);
    return {
      error: compact || `Unexpected non-JSON response (${response.status})`,
      raw: text,
    };
  }
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

function formatFrontmatterInput(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value || "");
}

function renderFrontmatterValue(value) {
  const formatted = formatValue(value);
  if (/^https?:\/\/\S+$/i.test(formatted)) {
    return `<strong><a href="${escapeHtml(formatted)}" target="_blank" rel="noreferrer">${escapeHtml(formatted)}</a></strong>`;
  }
  return `<strong>${escapeHtml(formatted)}</strong>`;
}

function humanizeMetaKey(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function aliasExamplesForPage(page) {
  const examplesByCategory = {
    people: ["Dex", "Vika", "Mom"],
    places: ["Sakartvelo", "Republic of Georgia", "CDMX"],
    events: ["AI Engineer Summit", "Miami conference"],
    topics: ["voice notes", "memory system", "PKM"],
    companies: ["OpenAI", "OA"],
    chapters: ["Seven Months", "Road trip chapter"],
    entries: ["road note", "apartment entry"],
  };
  return examplesByCategory[page?.category] || ["alt name", "nickname", "local spelling"];
}

function aliasPlaceholderForPage(page) {
  return aliasExamplesForPage(page).join(", ");
}

function formatPersonBirthdayDisplay(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    }
  }
  return text;
}

function prettyUrl(value) {
  const url = String(value || "").trim();
  if (!url) {
    return "";
  }
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function escapeHtml(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatProjectName(value) {
  const acronyms = new Set(["ai", "api", "ml", "ui", "ux"]);
  return String(value || "")
    .split(/[-_/\s]+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (acronyms.has(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatDateLabel(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const parts = text.split(" to ");
  if (parts.length === 2) {
    const [start, end] = parts.map((part) => new Date(`${part}T12:00:00`));
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} to ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    }
  }

  const parsed = new Date(`${text}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? text
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function inferRenameBase(value) {
  return value.split(/\s+\(/)[0].trim();
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 2400);
}

function setHash(value) {
  const nextHash = `#${value}`;
  if (window.location.hash !== nextHash && confirmProjectConfigNavigation(nextHash)) {
    window.location.hash = value;
    return true;
  }
  return false;
}

function metaPill(label, value) {
  return `<span class="meta-pill">${icon(label)} ${escapeHtml(value)}</span>`;
}

function metaLink(label, href, svg) {
  return `<a class="meta-pill meta-link" href="${href}">${svg} ${escapeHtml(label)}</a>`;
}

function icon(name) {
  const icons = {
    obsidian: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.2 2.3 6.6 7.7l3.2 6.1-2.8 7.9 9.4-8.7L13.2 2.3Zm-1 .9 2.7 7-4.1 3.1-1.8-5.3 3.2-4.8Z"/></svg>`,
    save: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V7l-4-4Zm-5 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3-8H5V5h10v4Z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>`,
    quote: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 17h4l2-4V7H7v6h3l-3 4Zm10 0h4l2-4V7h-6v6h3l-3 4Z"/></svg>`,
    file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8l-4-6Zm0 1.5L17.5 8H14V3.5Z"/></svg>`,
    user: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/></svg>`,
    building: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 21V3h10v4h6v14h-6v-4h-4v4H4Zm3-14h2V5H7v2Zm4 0h2V5h-2v2ZM7 11h2V9H7v2Zm4 0h2V9h-2v2Zm4 0h2V9h-2v2ZM7 15h2v-2H7v2Zm4 0h2v-2h-2v2Zm4 0h2v-2h-2v2Z"/></svg>`,
    book: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h12a2 2 0 0 1 2 2v16H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Zm1 13.17A2.98 2.98 0 0 1 7 16h10V5H6v11.17ZM7 18a1 1 0 0 0 0 2h10v-2H7Z"/></svg>`,
    presentation: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 4h18v2h-1v10a2 2 0 0 1-2 2h-4.2l2.6 3H14l-2-2.31L10 21H7.6l2.6-3H6a2 2 0 0 1-2-2V6H3V4Zm3 2v10h12V6H6Zm3 3h6v2H9V9Zm0 4h4v2H9v-2Z"/></svg>`,
    tag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 4a1 1 0 0 1 1-1h7.6a2 2 0 0 1 1.42.59l7.39 7.39a2 2 0 0 1 0 2.83l-6.6 6.6a2 2 0 0 1-2.83 0L3.59 13.02A2 2 0 0 1 3 11.6V4Zm5 5.5A1.5 1.5 0 1 0 6.5 8 1.5 1.5 0 0 0 8 9.5Z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3.2 8.7 7H4v10h4.7L14 20.8V3.2Zm2 4.5v1.7a4 4 0 0 1 0 5.2v1.7a5.9 5.9 0 0 0 0-8.6Zm2.8-2.8v1.8a8 8 0 0 1 0 10.6v1.8a9.9 9.9 0 0 0 0-14.2Z"/></svg>`,
    transcript: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16v2H4V4Zm0 5h16v2H4V9Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>`,
    links: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.9 12a5 5 0 0 1 5-5h4v2h-4a3 3 0 0 0 0 6h4v2h-4a5 5 0 0 1-5-5Zm7.1 1h2v-2h-2v2Zm4-6h4a5 5 0 0 1 0 10h-4v-2h4a3 3 0 1 0 0-6h-4V7Z"/></svg>`,
    scan: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h4V2H2v6h2V4Zm12-2v2h4v4h2V2h-6ZM4 16H2v6h6v-2H4v-4Zm18 0h-2v4h-4v2h6v-6ZM7 11h10v2H7z"/></svg>`,
    categories: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h7v6H4V5Zm9 0h7v6h-7V5ZM4 13h7v6H4v-6Zm9 0h7v6h-7v-6Z"/></svg>`,
    quotes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 17h4l2-4V7H7v6h3l-3 4Zm10 0h4l2-4V7h-6v6h3l-3 4Z"/></svg>`,
    house: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 3 10.2V21h6v-6h6v6h6V10.2L12 3Zm0 2.44 7 5.44V19h-2v-6H7v6H5v-8.12l7-5.44Z"/></svg>`,
    chapters: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h6v14H4V5Zm10 0h6v14h-6V5Zm-8 2v10h2V7H6Zm10 0v10h2V7h-2Z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm13 8H4v10h16V10ZM6 12h4v4H6v-4Z"/></svg>`,
    map: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 4.5 9 2 3 4.5v15L9 22l6-2.5 6 2.5v-15L15 4.5ZM9 4.18l4 1.67v14L9 18.18v-14Zm-4 1.66 2-.83v14l-2 .83v-14Zm14 14-4-1.67v-14l4 1.67v14Z"/></svg>`,
    image: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18ZM5 5h14v8.17l-3.59-3.58a1 1 0 0 0-1.41 0L9 14.59l-1.59-1.58a1 1 0 0 0-1.41 0L5 14.01V5Zm0 11.84 1.71-1.71L9 17.41l5.29-5.3L19 16.84V19H5v-2.16ZM8.5 10A1.5 1.5 0 1 0 7 8.5 1.5 1.5 0 0 0 8.5 10Z"/></svg>`,
    robot: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v1h1.5A3.5 3.5 0 0 1 18 7.5V9h1a2 2 0 0 1 2 2v5a4 4 0 0 1-4 4h-1v2h-2v-2h-4v2H8v-2H7a4 4 0 0 1-4-4v-5a2 2 0 0 1 2-2h1V7.5A3.5 3.5 0 0 1 9.5 4H11V3a1 1 0 0 1 1-1Zm-3.5 4A1.5 1.5 0 0 0 7 7.5V9h10V7.5A1.5 1.5 0 0 0 15.5 6h-7ZM8.5 12A1.5 1.5 0 1 0 10 13.5 1.5 1.5 0 0 0 8.5 12Zm7 0a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5ZM8 17h8v-2H8v2Z"/></svg>`,
    "check-circle": `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.1 14.3-4.2-4.2 1.4-1.4 2.8 2.8 5-5 1.4 1.4-6.4 6.4Z"/></svg>`,
    lightbulb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-4.55 12.31c.58.5.93 1.23.97 2.01V17a2 2 0 0 0 2 2h3.16a2 2 0 0 0 2-2v-.68c.04-.78.39-1.51.97-2.01A7 7 0 0 0 12 2Zm1.58 14.5v.5h-3.16v-.5c-.06-1.38-.68-2.66-1.7-3.54A5 5 0 1 1 17 8a4.96 4.96 0 0 1-1.72 3.96c-1.02.88-1.64 2.16-1.7 3.54ZM10 20h4v2h-4v-2Z"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2Zm7 11 1 2.7L23 17l-3 1.3L19 21l-1-2.7L15 17l3-1.3 1-2.7ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.4 2h3.2l.46 2.26c.47.14.93.33 1.36.57l2.04-1.07 2.27 2.27-1.07 2.04c.24.43.43.89.57 1.36L22 10.4v3.2l-2.26.46c-.14.47-.33.93-.57 1.36l1.07 2.04-2.27 2.27-2.04-1.07c-.43.24-.89.43-1.36.57L13.6 22h-3.2l-.46-2.26a7.73 7.73 0 0 1-1.36-.57l-2.04 1.07-2.27-2.27 1.07-2.04a7.73 7.73 0 0 1-.57-1.36L2 13.6v-3.2l2.26-.46c.14-.47.33-.93.57-1.36L3.76 6.54l2.27-2.27 2.04 1.07c.43-.24.89-.43 1.36-.57L10.4 2Zm1.6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>`,
    reload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5a7 7 0 1 1-6.32 10H3.5A9 9 0 1 0 12 3c-2.2 0-4.22.8-5.78 2.12V3H4v6h6V6.75H7.3A6.96 6.96 0 0 1 12 5Z"/></svg>`,
    fork: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm10 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM7 9a3 3 0 0 1 3 3v1.2c0 1.55.98 2.95 2.43 3.48l1.74.63A3 3 0 0 1 17 13h-1.18l-1.08-.39A5.7 5.7 0 0 1 11 7.26V6h2v1.26c0 1.55.98 2.95 2.43 3.48l.39.14A3 3 0 1 1 17 9c-.35 0-.69.06-1 .17l-.39-.14A5.7 5.7 0 0 1 12 6.26V6H9a2 2 0 0 0-2 2v1Z"/></svg>`,
    pen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m3 17.25 9.88-9.88 3.75 3.75L6.75 21H3v-3.75ZM14 6.25l1.58-1.58a2 2 0 0 1 2.83 0l.92.92a2 2 0 0 1 0 2.83L17.75 10 14 6.25Z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"/></svg>`,
    "arrow-out": `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 5h5v5h-2V8.41l-6.29 6.3-1.42-1.42L15.59 7H14V5ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>`,
    "arrow-in": `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 19h-6v-2h4V7H7v4H5V5h14v14ZM10.71 14.71 9.29 16.1 4.2 11l5.09-5.1 1.42 1.42L8.03 10H16v2H8.03l2.68 2.71Z"/></svg>`,
    "arrow-both": `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m7.05 7.05 2.12 2.12-1.41 1.41L3.22 6.05 7.76 1.5l1.41 1.42-2.12 2.12H15a4 4 0 0 1 4 4v3h-2V9a2 2 0 0 0-2-2H7.05Zm9.9 9.9-2.12-2.12 1.41-1.41 4.54 4.53-4.54 4.55-1.41-1.42 2.12-2.12H9a4 4 0 0 1-4-4v-3h2v3a2 2 0 0 0 2 2h7.95Z"/></svg>`,
  };
  return `<span class="icon">${icons[name] || icons.file}</span>`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function isTextLikeFile(fileName = "") {
  return /\.(txt|md|markdown|html|json|csv)$/i.test(String(fileName));
}

function isPdfFile(fileName = "") {
  return /\.pdf$/i.test(String(fileName));
}

function normalizePromotableAiUrl(value = "") {
  const trimmed = String(value || "").trim();
  if (!/^https?:\/\/\S+$/i.test(trimmed)) {
    return "";
  }
  try {
    const parsed = new URL(trimmed);
    return /^https?:$/i.test(parsed.protocol) ? trimmed : "";
  } catch (_error) {
    return "";
  }
}

function promoteBareAiUrlInput(instructionsEl, aiUrlEl) {
  if (!instructionsEl || !aiUrlEl || String(aiUrlEl.value || "").trim()) {
    return "";
  }
  const promotedUrl = normalizePromotableAiUrl(instructionsEl.value);
  if (!promotedUrl) {
    return "";
  }
  aiUrlEl.value = promotedUrl;
  instructionsEl.value = "";
  return promotedUrl;
}

function updateComposeMode(form) {
  const mode = form.elements.mode.value;
  form.querySelectorAll(".manual-only").forEach((element) => {
    element.classList.toggle("hidden", mode === "ai");
  });
  form.querySelectorAll(".ai-only").forEach((element) => {
    element.classList.toggle("hidden", mode !== "ai");
  });
}

function setupComposeImageInput(form) {
  const dropzone = form.querySelector("#image-dropzone");
  const preview = form.querySelector("#compose-ingest-preview");
  const imageInput = form.elements.aiImageFile;
  const fileInput = form.elements.aiImportFile;
  const instructions = form.elements.imageInstructions;
  const aiUrl = form.elements.aiUrl;
  const chooseFileButton = form.querySelector("#choose-supporting-file");
  const chooseImageButton = form.querySelector("#choose-supporting-image");
  if (!dropzone || !preview || !imageInput || !fileInput) {
    return;
  }

  let previewImageUrl = "";

  const resetPreviewImage = () => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      previewImageUrl = "";
    }
  };

  const renderPreview = () => {
    resetPreviewImage();
    const parts = [];
    const file = fileInput.files[0];
    const image = imageInput.files[0];
    const noteValue = instructions?.value.trim() || "";
    const urlValue = aiUrl?.value.trim() || "";

    if (file) {
      parts.push(`<div class="ingest-pill">${icon("file")} File: ${escapeHtml(file.name)}</div>`);
    }
    if (urlValue) {
      parts.push(`<div class="ingest-pill">${icon("links")} URL: ${escapeHtml(urlValue)}</div>`);
    }
    if (noteValue) {
      parts.push(`<div class="ingest-pill">${icon("quote")} Notes: ${escapeHtml(noteValue.length > 120 ? `${noteValue.slice(0, 117)}...` : noteValue)}</div>`);
    }
    if (image) {
      previewImageUrl = URL.createObjectURL(image);
      parts.push(`<img src="${previewImageUrl}" alt="${escapeHtml(image.name)}" /><p>${escapeHtml(image.name)}</p>`);
    }
    if (!file && !image && !noteValue && !urlValue) {
      parts.push(`<span class="muted">No supporting file or image selected yet.</span>`);
    }
    preview.innerHTML = parts.join("");
  };

  imageInput.addEventListener("change", renderPreview);
  fileInput.addEventListener("change", renderPreview);
  instructions?.addEventListener("input", () => {
    promoteBareAiUrlInput(instructions, aiUrl);
    renderPreview();
  });
  aiUrl?.addEventListener("input", renderPreview);
  chooseFileButton?.addEventListener("click", () => fileInput.click());
  chooseImageButton?.addEventListener("click", () => imageInput.click());
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragging");
  });
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    const files = Array.from(event.dataTransfer?.files || []);
    const image = files.find((candidate) => candidate.type.startsWith("image/"));
    const file = files.find((candidate) => !candidate.type.startsWith("image/"));
    if (image) {
      const transfer = new DataTransfer();
      transfer.items.add(image);
      imageInput.files = transfer.files;
    }
    if (file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
    }
    const text = event.dataTransfer?.getData("text/plain")?.trim();
    if (text && instructions) {
      if (/^https?:\/\//i.test(text) && aiUrl && !aiUrl.value) {
        aiUrl.value = text;
      } else {
        instructions.value = [instructions.value.trim(), text].filter(Boolean).join("\n\n");
      }
    }
    if (!image && !file && !text) {
      return;
    }
    renderPreview();
  });
  dropzone.addEventListener("paste", (event) => {
    const files = Array.from(event.clipboardData?.files || []);
    const image = files.find((candidate) => candidate.type.startsWith("image/"));
    const text = event.clipboardData?.getData("text/plain")?.trim();
    if (image) {
      event.preventDefault();
      const transfer = new DataTransfer();
      transfer.items.add(image);
      imageInput.files = transfer.files;
      renderPreview();
      return;
    }
    if (text && instructions) {
      event.preventDefault();
      if (/^https?:\/\//i.test(text) && aiUrl && !aiUrl.value) {
        aiUrl.value = text;
      } else {
        instructions.value = [instructions.value.trim(), text].filter(Boolean).join("\n\n");
      }
      renderPreview();
    }
  });

  renderPreview();
}

function describeComposeSource(form) {
  const mode = form.elements.mode?.value || "ai";
  if (mode === "manual") {
    const url = form.elements.url?.value.trim() || "";
    if (url) {
      return isYouTubeUrl(url) ? "YouTube URL" : "Web URL";
    }
    if (form.elements.manualImportFile?.files?.[0]) {
      return `File: ${form.elements.manualImportFile.files[0].name}`;
    }
    if (form.elements.manualImageFile?.files?.[0]) {
      return `Image: ${form.elements.manualImageFile.files[0].name}`;
    }
    return form.elements.content?.value.trim() ? "Manual text" : "No source yet";
  }

  const aiUrl = form.elements.aiUrl?.value.trim() || "";
  if (aiUrl) {
    return isYouTubeUrl(aiUrl) ? "YouTube URL" : "Web URL";
  }
  if (form.elements.aiImportFile?.files?.[0]) {
    return `File: ${form.elements.aiImportFile.files[0].name}`;
  }
  if (form.elements.aiImageFile?.files?.[0]) {
    return `Image: ${form.elements.aiImageFile.files[0].name}`;
  }
  return form.elements.imageInstructions?.value.trim() ? "Notes only" : "No source yet";
}

function updateComposeRoutingPanel(form, previewData = null) {
  const panel = form.querySelector("#compose-routing-panel");
  if (!panel) {
    return;
  }

  const selectedCategory = form.elements.category?.value || "root";
  const manualTitle = form.elements.title?.value.trim() || "";
  const titleHint = form.elements.aiTitleHint?.value.trim() || "";
  const predictedTitle = form.elements.mode?.value === "manual"
    ? (manualTitle || "Enter title")
    : (titleHint || "AI decides");
  const suggestedCategory = previewData?.effectiveCategory || "";
  const finalCategory = suggestedCategory || selectedCategory;
  const values = {
    title: predictedTitle,
    source: describeComposeSource(form),
    "selected-category": selectedCategory,
    "suggested-category": suggestedCategory || "Run preview",
    "final-category": finalCategory,
  };

  Object.entries(values).forEach(([key, value]) => {
    const target = panel.querySelector(`[data-compose-route="${key}"]`);
    if (target) {
      target.textContent = value;
    }
  });

  form.querySelector("[data-youtube-import-options]")?.classList.toggle(
    "hidden",
    form.elements.mode?.value !== "ai" || !isYouTubeUrl(form.elements.aiUrl?.value || "")
  );
}

function setupComposeRoutingPanel(form) {
  const sync = () => updateComposeRoutingPanel(form);
  [
    form.elements.mode,
    form.elements.category,
    form.elements.title,
    form.elements.content,
    form.elements.url,
    form.elements.imageInstructions,
    form.elements.aiUrl,
    form.elements.aiImportFile,
    form.elements.aiImageFile,
    form.elements.manualImportFile,
    form.elements.manualImageFile,
  ].filter(Boolean).forEach((field) => {
    field.addEventListener("input", sync);
    field.addEventListener("change", sync);
  });
  sync();
}

function setupComposeCategoryPreview(form) {
  const previewEl = form.querySelector("#compose-category-preview");
  const modeEl = form.elements.mode;
  const categoryEl = form.elements.category;
  const instructionsEl = form.elements.imageInstructions;
  const aiUrl = form.elements.aiUrl;
  const fileInput = form.elements.aiImportFile;
  if (!previewEl || !modeEl || !categoryEl || !instructionsEl || !aiUrl || !fileInput) {
    return;
  }

  let previewTimer = null;
  let previewRequestId = 0;
  let isAutoSyncingCategory = false;
  let autoSyncState = {
    applied: false,
    originalCategory: "",
    effectiveCategory: "",
    reason: "",
    evidence: "",
    signature: "",
  };
  let suppressedSignature = "";
  const buildRoutingSignature = typeof buildComposeCategoryPreviewRoutingSignature === "function"
    ? buildComposeCategoryPreviewRoutingSignature
    : (data) => [
      String(data.effectiveCategory || "").trim().toLowerCase(),
      String(data.routingReason || "").trim().toLowerCase(),
      String(data.routingEvidence || "").trim(),
    ].join("::");
  const renderPreviewMarkup = typeof renderComposeCategoryPreviewHtml === "function"
    ? renderComposeCategoryPreviewHtml
    : (data, {
      selectedCategory = "",
      autoSyncState: localAutoSyncState = null,
      suppressedSignature: localSuppressedSignature = "",
      routingSignature = "",
      escapeHtml: escapeHtmlFn = escapeHtml,
    } = {}) => {
      const submitted = data.submittedCategory || selectedCategory || "unknown";
      const effective = data.effectiveCategory || submitted;
      const hasOverride = Boolean(data.hasOverride || (submitted && effective && submitted !== effective));
      const reason = String(data.routingReason || "").replace(/^explicit-category-instruction:/, "explicit user instruction: ");
      const suggestionNotice = hasOverride && (!localSuppressedSignature || localSuppressedSignature !== routingSignature)
        ? `
          <div class="compose-category-preview-notice">
            <p><strong>Suggested category:</strong> ${escapeHtmlFn(effective)}</p>
            <p class="muted">Preview found category evidence in the intake. Choose whether to apply it before submit.</p>
            <div class="compose-category-preview-actions">
              <button type="button" class="primary-button inline-action" data-compose-preview-action="apply-suggested">Apply suggested category</button>
              <button type="button" class="ghost-button inline-action" data-compose-preview-action="keep-selected">Keep selected category: ${escapeHtmlFn(selectedCategory || submitted)}</button>
            </div>
          </div>
        `
        : "";
      const suppressedNotice = localSuppressedSignature && localSuppressedSignature === routingSignature
        ? `
          <div class="compose-category-preview-notice">
            <p><strong>Keeping your selected category:</strong> ${escapeHtmlFn(selectedCategory || submitted)}</p>
            <p class="muted">The preview still detects ${escapeHtmlFn(effective)}, but auto-switch is paused because you chose to keep the original category for this evidence.</p>
          </div>
        `
        : "";
      return `${suggestionNotice}${suppressedNotice}${hasOverride
        ? `
          <p><strong>Routing override:</strong> ${escapeHtmlFn(submitted)} -> ${escapeHtmlFn(effective)}</p>
          <p class="muted">${escapeHtmlFn(reason || "explicit text instruction detected")}</p>
          ${data.routingEvidence ? `<p class="muted">Evidence: ${escapeHtmlFn(data.routingEvidence)}</p>` : ""}
        `
        : `
          <p><strong>Detected category:</strong> ${escapeHtmlFn(effective)}</p>
          <p class="muted">${data.routingEvidence
            ? `Evidence: ${escapeHtmlFn(data.routingEvidence)}`
            : "No explicit category override detected yet; submit will use the selected category unless stronger text evidence appears."}</p>
        `}`;
    };

  const clearPreview = () => {
    autoSyncState = {
      applied: false,
      originalCategory: "",
      effectiveCategory: "",
      reason: "",
      evidence: "",
      signature: "",
    };
    suppressedSignature = "";
    previewEl.classList.add("hidden");
    previewEl.innerHTML = "";
    updateComposeRoutingPanel(form);
  };

  const renderPreview = (data) => {
    previewEl.classList.remove("hidden");
      previewEl.innerHTML = renderPreviewMarkup(data, {
        selectedCategory: categoryEl.value,
        autoSyncState,
        suppressedSignature,
        routingSignature: buildRoutingSignature(data),
        escapeHtml,
      });
    updateComposeRoutingPanel(form, data);
    previewEl.querySelector('[data-compose-preview-action="apply-suggested"]')?.addEventListener("click", () => {
      if (!data.effectiveCategory) {
        return;
      }
      suppressedSignature = "";
      isAutoSyncingCategory = true;
      categoryEl.value = data.effectiveCategory;
      isAutoSyncingCategory = false;
      autoSyncState = {
        applied: false,
        originalCategory: "",
        effectiveCategory: "",
        reason: "",
        evidence: "",
        signature: "",
      };
      schedulePreview();
    });
    previewEl.querySelector('[data-compose-preview-action="keep-selected"]')?.addEventListener("click", () => {
      suppressedSignature = buildRoutingSignature(data);
      autoSyncState = {
        applied: false,
        originalCategory: "",
        effectiveCategory: "",
        reason: "",
        evidence: "",
        signature: "",
      };
      renderPreview(data);
    });
  };

  const updatePreview = async () => {
    if (modeEl.value !== "ai") {
      clearPreview();
      return;
    }
    promoteBareAiUrlInput(instructionsEl, aiUrl);
    const instructions = instructionsEl.value.trim();
    const urlValue = aiUrl?.value.trim() || "";
    const previewUrl = aiUrl?.checkValidity() ? urlValue : "";
    let importFileContent = "";
    let importFileData = "";
    let importFileName = "";
    const file = fileInput.files[0];
    if (file) {
      importFileName = file.name;
      if (isTextLikeFile(file.name)) {
        try {
          importFileContent = String(await readFileAsText(file)).trim().slice(0, 12000);
        } catch (_error) {
          importFileContent = "";
        }
      } else if (isPdfFile(file.name)) {
        try {
          importFileData = String(await readFileAsDataUrl(file));
        } catch (_error) {
          importFileData = "";
        }
      }
    }

    const requestId = ++previewRequestId;
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(state.currentProject.name)}/create-with-ai/category-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryEl.value,
          instructions,
          url: previewUrl,
          importFileContent,
          importFileName,
          importFileData,
        }),
      });
      const data = await parseApiResponse(response);
      if (requestId !== previewRequestId) {
        return;
      }
      if (!response.ok) {
        clearPreview();
        return;
      }
      const signature = buildRoutingSignature(data);
      const hasSuggestion = Boolean(
        data.routingReason
        && data.effectiveCategory
        && data.effectiveCategory !== categoryEl.value
        && signature
        && signature !== suppressedSignature
      );
      if (hasSuggestion) {
        autoSyncState = {
          applied: false,
          originalCategory: categoryEl.value,
          effectiveCategory: data.effectiveCategory,
          reason: data.routingReason || "",
          evidence: data.routingEvidence || "",
          signature,
        };
      } else if (!data.routingReason || signature !== suppressedSignature) {
        autoSyncState = {
          applied: false,
          originalCategory: "",
          effectiveCategory: "",
          reason: "",
          evidence: "",
          signature: "",
        };
      }
      renderPreview(data);
    } catch (_error) {
      if (requestId !== previewRequestId) {
        return;
      }
      clearPreview();
    }
  };

  const schedulePreview = () => {
    if (previewTimer) {
      window.clearTimeout(previewTimer);
    }
    previewTimer = window.setTimeout(() => {
      updatePreview().catch(() => clearPreview());
    }, 220);
  };

  modeEl.addEventListener("change", () => {
    if (modeEl.value !== "ai") {
      clearPreview();
      return;
    }
    schedulePreview();
  });
  categoryEl.addEventListener("change", () => {
    if (!isAutoSyncingCategory) {
      autoSyncState = {
        applied: false,
        originalCategory: "",
        effectiveCategory: "",
        reason: "",
        evidence: "",
        signature: "",
      };
    }
    schedulePreview();
  });
  instructionsEl.addEventListener("input", schedulePreview);
  aiUrl.addEventListener("input", schedulePreview);
  fileInput.addEventListener("change", schedulePreview);
  schedulePreview();
}

function applyComposePrefill() {
  const form = articleView.querySelector("#compose-form");
  const banner = articleView.querySelector("#compose-prefill-banner");
  if (!form) {
    return;
  }

  try {
    const prefill = readComposePrefill();
    if (!prefill) {
      return;
    }
    form.elements.mode.value = "ai";
    updateComposeMode(form);
    if (prefill.category && Array.from(form.elements.category.options).some((option) => option.value === prefill.category)) {
      form.elements.category.value = prefill.category;
    }
    if (prefill.titleHint && form.elements.aiTitleHint) {
      form.elements.aiTitleHint.value = prefill.titleHint;
    }
    if (prefill.url && form.elements.aiUrl) {
      form.elements.aiUrl.value = prefill.url;
    }
    if (prefill.instructions && form.elements.imageInstructions) {
      form.elements.imageInstructions.value = prefill.instructions;
    }
    if (banner && prefill.banner) {
      banner.classList.remove("hidden");
      banner.innerHTML = renderComposePrefillBannerHtml(prefill, { escapeHtml });
    }
    form.elements.imageInstructions?.dispatchEvent(new Event("input"));
    form.elements.aiUrl?.dispatchEvent(new Event("input"));
    if (prefill.autoRun) {
      window.setTimeout(() => {
        const submitEvent = typeof form.requestSubmit === "function"
          ? () => form.requestSubmit()
          : () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        submitEvent();
      }, 0);
    }
  } catch (_error) {
    // Ignore malformed prefill payloads.
  } finally {
    window.sessionStorage.removeItem("compose-prefill");
  }
}

function readComposePrefill() {
  const raw = window.sessionStorage.getItem("compose-prefill");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function formatChapterRange(range) {
  if (!range) {
    return "";
  }
  return `${range.start || "?"} – ${range.end || "present"}`;
}

function buildVoiceDiaryHeroDescription(stats) {
  if (!stats) {
    return state.currentProject.description || "";
  }
  const parts = [
    stats.spanLabel ? `Personal diary across ${stats.spanLabel}` : "Personal diary and journal",
    stats.countryCount ? `${stats.countryCount} countries` : "",
    stats.eventCount ? `${stats.eventCount} events captured` : "",
  ].filter(Boolean);
  return `${parts.join(" · ")}. Voice recordings about daily life, travel, relationships, and reflection.`;
}

function buildVoiceDiaryHeroMeta(stats) {
  if (!stats) {
    return [
      metaPill("file", `${state.pages.length} pages`),
      metaPill("categories", `${getManagedProjectCategories().length} categories`),
    ];
  }
  return [
    metaPill("time", stats.spanLabel || `${state.pages.length} pages`),
    metaPill("events", `${stats.eventCount || 0} events`),
    metaPill("countries", `${stats.countryCount || 0} countries`),
    metaPill("stays", `${stats.apartmentCount || 0} apartments`),
  ];
}

function renderVoiceDiaryMapStats(mapStats, chapterStats = null) {
  const cards = [
    {
      label: "Approximate distance traveled",
      value: mapStats?.distanceLabel || "Calculating…",
    },
    {
      label: "Mapped cities and places",
      value: mapStats?.placeCount ? String(mapStats.placeCount) : String(chapterStats?.mappedPlaceCount || 0),
    },
    {
      label: "Apartment locations",
      value: mapStats?.apartmentPlaceCount ? String(mapStats.apartmentPlaceCount) : String(chapterStats?.apartmentCount || 0),
    },
    {
      label: "Countries covered",
      value: mapStats?.countryCount ? String(mapStats.countryCount) : String(chapterStats?.countryCount || 0),
    },
  ];

  return cards.map((card) => `
    <div class="diary-map-stat">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
    </div>
  `).join("");
}

async function renderLocationMap(locations, guard = null) {
  const mount = document.querySelector("#location-map");
  const statsMount = document.querySelector("#location-map-stats");
  const perf = guard?.perf || state.voiceDiaryHomePerf || null;
  if (!mount) {
    return;
  }

  mount.innerHTML = `<div class="empty-state compact"><p>Resolving locations…</p></div>`;
  if (statsMount) {
    statsMount.innerHTML = renderVoiceDiaryMapStats(null, guard?.chapterStats || null);
  }
  const expanded = expandLocationsForMap(locations);
  const mapRenderStartedAt = performance.now();
  if (perf) {
    perf.sample.renderedLocations = expanded.length;
  }
  const geocodeStartedAt = performance.now();
  const geocoded = await geocodeLocations(expanded);
  if (perf) {
    perf.sample.geocodeMs = Number((performance.now() - geocodeStartedAt).toFixed(1));
  }
  if (guard && !isActiveViewRequest(guard.requestId, guard.projectName)) {
    return;
  }
  if (!document.body.contains(mount)) {
    return;
  }

  if (!geocoded.length) {
    mount.innerHTML = `<div class="empty-state compact"><p>Map unavailable here right now. The location chips below still open the relevant pages.</p></div>`;
    if (perf) {
      perf.sample.mapRenderMs = Number((performance.now() - mapRenderStartedAt).toFixed(1));
      perf.sample.mapRenderMode = "empty";
      emitVoiceDiaryHomePerf(perf);
    }
    return;
  }
  if (statsMount) {
    const statsStartedAt = performance.now();
    const statsKey = buildMapStatsCacheKey(geocoded);
    let mapStats = state.mapStatsCache.get(statsKey);
    if (!mapStats) {
      mapStats = buildVoiceDiaryMapFacts(geocoded);
      state.mapStatsCache.set(statsKey, mapStats);
      persistClientCaches();
    }
    statsMount.innerHTML = renderVoiceDiaryMapStats(mapStats, guard?.chapterStats || null);
    if (perf) {
      perf.sample.statsMs = Number((performance.now() - statsStartedAt).toFixed(1));
    }
  }

  try {
    await ensureLeaflet();
    await renderLeafletMap(mount, geocoded);
    if (perf) {
      perf.sample.mapRenderMs = Number((performance.now() - mapRenderStartedAt).toFixed(1));
      perf.sample.mapRenderMode = "leaflet";
      emitVoiceDiaryHomePerf(perf);
    }
    return;
  } catch (_error) {
    mount.innerHTML = "";
  }

  renderAtlasFallback(mount, geocoded);
  if (perf) {
    perf.sample.mapRenderMs = Number((performance.now() - mapRenderStartedAt).toFixed(1));
    perf.sample.mapRenderMode = "fallback";
    emitVoiceDiaryHomePerf(perf);
  }
}

function scheduleVoiceDiaryHomeMapRender(locations, guard = null) {
  const renderToken = ++state.homeMapRenderToken;
  const startRender = () => {
    if (renderToken !== state.homeMapRenderToken) {
      return;
    }
    if (guard && !isActiveViewRequest(guard.requestId, guard.projectName)) {
      return;
    }
    const mount = document.querySelector("#location-map");
    if (!mount || !document.body.contains(mount)) {
      return;
    }
    if (guard?.perf) {
      markVoiceDiaryHomePerf(guard.perf, "mapHydrationStartMs");
    }
    renderLocationMap(locations, guard);
  };

  window.requestAnimationFrame(() => {
    if (renderToken !== state.homeMapRenderToken) {
      return;
    }
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(startRender, { timeout: 1200 });
      return;
    }
    window.setTimeout(startRender, 180);
  });
}

function expandLocationsForMap(locations) {
  const expanded = [];
  const seen = new Set();

  for (const location of locations) {
    const fallbackPlaces = Array.isArray(location.fallbackPlaces) ? location.fallbackPlaces : [];
    const candidates = fallbackPlaces.length ? fallbackPlaces : [location];
    for (const candidate of candidates) {
      const key = `${candidate.placePageId || candidate.pageId || candidate.name}::${candidate.sourceCountry || ""}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      expanded.push(candidate);
    }
  }

  return expanded;
}

async function renderLeafletMap(mount, geocoded) {
  mount.innerHTML = "";
  if (state.locationMapInstance) {
    state.locationMapInstance.remove();
    state.locationMapInstance = null;
  }
  await new Promise((resolve) => window.requestAnimationFrame(resolve));
  const map = window.L.map(mount, {
    zoomControl: true,
    scrollWheelZoom: true,
  });
  state.locationMapInstance = map;

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  const bounds = [];
  for (const location of geocoded) {
    const projectName = state.currentProject?.name || "";
    const pageId =
      location.placePageId ||
      location.apartmentPageId ||
      location.pageId ||
      "";
    const fallbackCountry = !pageId && location.fallbackCountry ? location.fallbackCountry : "";
    const popupHref = pageId
      ? `#/project/${encodeURIComponent(projectName)}/page/${encodeURIComponent(pageId)}`
      : fallbackCountry
        ? `#${buildCountryPlacesHash(projectName, fallbackCountry)}`
        : "";
    const popupLabel = pageId
      ? "Open place page"
      : fallbackCountry
        ? `Open ${fallbackCountry} places`
        : "";
    const marker = window.L.marker([location.lat, location.lon], {
      icon: buildDiaryMarkerIcon(),
    }).addTo(map);
    marker.bindPopup(`
      <div class="map-popup">
        <strong>${escapeHtml(location.name)}</strong>
        <div>${escapeHtml(location.pageTitle || "")}</div>
        ${location.visitDates ? `<div class="muted">When: ${escapeHtml(location.visitDates)}</div>` : ""}
        ${location.apartmentTitle ? `<div class="muted">Stay: ${escapeHtml(location.apartmentTitle)}</div>` : ""}
        ${popupHref ? `<a class="map-popup-link" href="${popupHref}" data-project="${escapeHtml(projectName)}" data-page-id="${escapeHtml(pageId)}" data-country="${escapeHtml(fallbackCountry)}">${escapeHtml(popupLabel)}</a>` : ""}
      </div>
    `);
    bounds.push([location.lat, location.lon]);
  }

  if (bounds.length === 1) {
    map.setView(bounds[0], 5);
  } else {
    map.fitBounds(bounds, { padding: [28, 28] });
  }
  map.whenReady(() => {
    window.setTimeout(() => {
      map.invalidateSize();
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    }, 80);
  });
}

function buildDiaryMarkerIcon() {
  if (window.__voiceDiaryMarkerIcon) {
    return window.__voiceDiaryMarkerIcon;
  }
  window.__voiceDiaryMarkerIcon = window.L.divIcon({
    className: "diary-map-marker",
    html: `<span class="diary-map-marker-pin"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
  return window.__voiceDiaryMarkerIcon;
}

function buildVoiceDiaryMapFacts(geocoded) {
  const route = [...geocoded].sort((a, b) => estimateLocationOrder(a) - estimateLocationOrder(b));
  let totalKm = 0;
  for (let index = 1; index < route.length; index += 1) {
    totalKm += haversineKm(route[index - 1], route[index]);
  }
  const countries = new Set(
    geocoded
      .map((location) => inferCountryFromLocation(location))
      .filter(Boolean)
  );
  return {
    distanceKm: totalKm,
    distanceLabel: totalKm ? `${Math.round(totalKm).toLocaleString()} km` : "Not enough route data",
    placeCount: geocoded.length,
    apartmentPlaceCount: geocoded.filter((location) => location.apartmentPageId).length,
    countryCount: countries.size,
  };
}

function buildMapStatsCacheKey(geocoded) {
  return JSON.stringify(
    [...geocoded]
      .map((location) => ({
        id: location.placePageId || location.apartmentPageId || location.pageId || location.name || "",
        lat: Number(location.lat),
        lon: Number(location.lon),
      }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
  );
}

function estimateLocationOrder(location) {
  const candidates = [
    location.visitDates,
    ...((location.mentions || []).map((mention) => mention.chapterSlug || mention.entryId || "")),
  ]
    .map((value) => String(value || ""))
    .join(" ");
  const monthMatch = candidates.match(/(20\d{2})-(\d{2})/);
  if (!monthMatch) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Number(`${monthMatch[1]}${monthMatch[2]}`);
}

function inferCountryFromLocation(location) {
  const parts = String(location.geocodeLabel || location.geocodeQuery || location.name || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
}

function haversineKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLon = toRad(Number(b.lon) - Number(a.lon));
  const lat1 = toRad(Number(a.lat));
  const lat2 = toRad(Number(b.lat));
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  return 6371 * c;
}

function renderAtlasFallback(mount, geocoded) {
  const width = mount.clientWidth || 960;
  const height = 360;
  const padding = 28;
  const svg = d3
    .select(mount)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "atlas-svg");

  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 22)
    .attr("fill", "rgba(255, 253, 248, 0.98)");

  const longitudes = [-120, -60, 0, 60, 120];
  const latitudes = [-60, -30, 0, 30, 60];
  const xScale = d3.scaleLinear().domain([-180, 180]).range([padding, width - padding]);
  const yScale = d3.scaleLinear().domain([85, -85]).range([padding, height - padding]);

  svg.append("g")
    .selectAll("line.longitude")
    .data(longitudes)
    .join("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", padding)
    .attr("y2", height - padding)
    .attr("stroke", "rgba(148, 163, 184, 0.25)")
    .attr("stroke-dasharray", "4 6");

  svg.append("g")
    .selectAll("line.latitude")
    .data(latitudes)
    .join("line")
    .attr("x1", padding)
    .attr("x2", width - padding)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "rgba(148, 163, 184, 0.25)")
    .attr("stroke-dasharray", "4 6");

  const marker = svg.append("g")
    .selectAll("g.marker")
    .data(geocoded)
    .join("g")
    .attr("class", "atlas-marker")
    .attr("transform", (d) => `translate(${xScale(d.lon)},${yScale(d.lat)})`)
    .style("cursor", "pointer")
    .on("click", (_event, datum) => {
      const pageId =
        datum.placePageId ||
        datum.apartmentPageId ||
        datum.pageId ||
        "";
      if (pageId) {
        openPage(pageId);
        return;
      }
      if (datum.fallbackCountry) {
        showPlacesByCountry(datum.fallbackCountry);
      }
    });

  marker.append("circle")
    .attr("r", 7)
    .attr("fill", "#0f766e")
    .attr("stroke", "#fffdf8")
    .attr("stroke-width", 2);

  marker.append("text")
    .text((d) => d.name)
    .attr("x", 10)
    .attr("y", 4)
    .attr("fill", "#1c1917")
    .attr("font-size", 12);
}

async function ensureLeaflet() {
  if (window.L) {
    return;
  }

  if (!document.querySelector('link[data-leaflet]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "true";
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet]');
    if (existing) {
      if (window.L) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.leaflet = "true";
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.body.appendChild(script);
  });
}

async function geocodeLocations(locations) {
  const cacheUpdates = [];
  const inFlight = new Map();

  const resolveLocation = async (location) => {
    try {
      if (Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon))) {
        return {
          ...location,
          lat: Number(location.lat),
          lon: Number(location.lon),
          geocodeLabel: location.geocodeLabel || location.geocodeQuery || location.name,
        };
      }
      const query = location.geocodeQuery || location.name;
      const cacheKey = String(query || "").trim().toLowerCase();
      if (!cacheKey) {
        return null;
      }
      if (state.geocodeCache.has(cacheKey)) {
        const cached = state.geocodeCache.get(cacheKey);
        if (!cached) {
          return null;
        }
        return {
          ...location,
          lat: Number(cached.lat),
          lon: Number(cached.lon),
          geocodeLabel: cached.label || location.name,
        };
      }
      if (!inFlight.has(cacheKey)) {
        inFlight.set(cacheKey, (async () => {
          const response = await fetch(`/api/geocode?project=${encodeURIComponent(state.currentProject?.name || "")}&query=${encodeURIComponent(query)}`);
          if (!response.ok) {
            state.geocodeCache.set(cacheKey, null);
            cacheUpdates.push(true);
            return null;
          }
          const data = await response.json();
          if (!data.result) {
            state.geocodeCache.set(cacheKey, null);
            cacheUpdates.push(true);
            return null;
          }
          const cached = {
            lat: Number(data.result.lat),
            lon: Number(data.result.lon),
            label: data.result.label || location.name,
          };
          state.geocodeCache.set(cacheKey, cached);
          cacheUpdates.push(true);
          return cached;
        })().finally(() => {
          inFlight.delete(cacheKey);
        }));
      }
      const cached = await inFlight.get(cacheKey);
      if (!cached) {
        return null;
      }
      return {
        ...location,
        lat: Number(cached.lat),
        lon: Number(cached.lon),
        geocodeLabel: cached.label || location.name,
      };
    } catch (_error) {
      return null;
    }
  };

  const results = (await Promise.all(locations.map(resolveLocation))).filter(Boolean);
  if (cacheUpdates.length) {
    persistClientCaches();
  }
  return results;
}
