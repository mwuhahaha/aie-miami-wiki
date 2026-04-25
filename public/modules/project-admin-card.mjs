function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

export const PROJECT_ADMIN_DEFAULT_TAB = "config";
const PROJECT_ADMIN_AI_FILL_FIELDS = new Set(["description", "filingGuidance", "knowledgePriority", "primarySummary"]);

function buildProjectAdminTabDomId(projectName = "", tabName = "", kind = "tab") {
  const slug = String(projectName || "project")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `project-admin-${kind}-${slug || "project"}-${tabName || PROJECT_ADMIN_DEFAULT_TAB}`;
}

function buildProjectAdminFieldDomId(projectName = "", fieldName = "") {
  const slug = String(projectName || "project")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const fieldSlug = String(fieldName || "field")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `project-admin-field-${slug || "project"}-${fieldSlug || "field"}`;
}

function renderProjectAdminTextareaField(projectName, fieldName, label, rows, value, icon = () => "") {
  const fieldId = buildProjectAdminFieldDomId(projectName, fieldName);
  const showAiFill = PROJECT_ADMIN_AI_FILL_FIELDS.has(fieldName);
  return `
    <div class="field project-admin-ai-field">
      <div class="project-admin-field-heading">
        <label for="${escapeHtml(fieldId)}">${escapeHtml(label)}</label>
        ${showAiFill ? `<button class="ghost-button inline-action assistant-action project-ai-fill-button" type="button" data-project-ai-fill="${escapeHtml(fieldName)}">${icon("robot")} AI Fill</button>` : ""}
      </div>
      <textarea id="${escapeHtml(fieldId)}" name="${escapeHtml(fieldName)}" rows="${escapeHtml(String(rows))}">${escapeHtml(value || "")}</textarea>
    </div>
  `;
}

function renderCategoryConsistencyGroup(title, categories = []) {
  if (!categories.length) {
    return "";
  }
  return `
    <section class="project-category-consistency-group">
      <h4>${escapeHtml(title)}</h4>
      <div class="project-category-consistency-chips">
        ${categories.map((category) => `<span class="project-category-consistency-chip">${escapeHtml(formatProjectName(category))}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderProjectCategoryConsistency(project, icon = () => "") {
  const consistency = project.categoryConsistency || {};
  const missingFromConfig = Array.isArray(consistency.missingFromConfig) ? consistency.missingFromConfig : [];
  const configuredOnly = Array.isArray(consistency.configuredOnly) ? consistency.configuredOnly : [];
  const discoveredCategories = Array.isArray(consistency.discoveredCategories) ? consistency.discoveredCategories : [];
  const hasDrift = Boolean(consistency.hasDrift);

  return `
    <section class="project-category-consistency">
      <div class="project-category-consistency-header">
        <div>
          <p class="eyebrow">Category Consistency</p>
          <h4>Configured categories vs live wiki folders</h4>
          <p class="muted">Configured categories drive templates and routing controls. Discovered categories come from the current <code>wiki/</code> folders and pages already on disk.</p>
        </div>
        ${missingFromConfig.length ? `
          <button class="ghost-button inline-action" type="button" data-action="sync-project-categories" data-project-name="${escapeHtml(project.name)}">
            ${icon("save")} Sync ${escapeHtml(String(missingFromConfig.length))} discovered ${missingFromConfig.length === 1 ? "category" : "categories"}
          </button>
        ` : ""}
      </div>
      <div class="project-category-consistency-summary">
        <span class="project-category-consistency-pill">${escapeHtml(String(discoveredCategories.length))} discovered on disk</span>
        <span class="project-category-consistency-pill">${escapeHtml(String(missingFromConfig.length))} missing from config</span>
        <span class="project-category-consistency-pill">${escapeHtml(String(configuredOnly.length))} config-only</span>
      </div>
      ${hasDrift ? `
        <div class="project-category-consistency-groups">
          ${renderCategoryConsistencyGroup("Discovered on disk, not yet in config", missingFromConfig)}
          ${renderCategoryConsistencyGroup("Configured, but not currently found on disk", configuredOnly)}
        </div>
      ` : `<p class="muted">Configured and discovered categories currently line up. No sync is needed.</p>`}
      ${configuredOnly.length ? `<p class="muted">Configured-only categories are surfaced for review here, but this repair path does not remove them automatically.</p>` : ""}
    </section>
  `;
}

export function initializeProjectAdminTabs(root, initialTab = PROJECT_ADMIN_DEFAULT_TAB) {
  const tabButtons = Array.from(root?.querySelectorAll?.("[data-project-admin-tab-trigger]") || []);
  if (!tabButtons.length) {
    return () => PROJECT_ADMIN_DEFAULT_TAB;
  }
  const tabPanels = Array.from(root.querySelectorAll("[data-project-admin-tab-panel]"));

  const activateProjectAdminTab = (requestedTab) => {
    const nextTab = tabButtons.some((button) => button.dataset.projectAdminTabTrigger === requestedTab)
      ? requestedTab
      : initialTab;

    tabButtons.forEach((button) => {
      const active = button.dataset.projectAdminTabTrigger === nextTab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("tabindex", active ? "0" : "-1");
    });

    tabPanels.forEach((panel) => {
      const active = panel.dataset.projectAdminTabPanel === nextTab;
      panel.classList.toggle("hidden", !active);
      panel.setAttribute("aria-hidden", String(!active));
      panel.toggleAttribute?.("hidden", !active);
      panel.setAttribute("tabindex", active ? "0" : "-1");
    });

    return nextTab;
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateProjectAdminTab(button.dataset.projectAdminTabTrigger || initialTab);
    });
    button.addEventListener("keydown", (event) => {
      const currentIndex = tabButtons.indexOf(button);
      if (currentIndex < 0) {
        return;
      }

      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % tabButtons.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabButtons.length - 1;
      }

      if (nextIndex === null) {
        return;
      }

      event.preventDefault?.();
      const nextButton = tabButtons[nextIndex];
      const nextTab = nextButton?.dataset?.projectAdminTabTrigger || initialTab;
      activateProjectAdminTab(nextTab);
      nextButton?.focus?.();
    });
  });

  activateProjectAdminTab(initialTab);
  return activateProjectAdminTab;
}

export function renderProjectAdminCard(project, {
  projectTemplates = [],
  renderProjectCategoryInputs = () => "",
  renderRecencyBiasOptions = () => "",
  icon = () => "",
  defaultProjectPath = () => "",
} = {}) {
  const configuredCategories = project.configuredCategories?.length ? project.configuredCategories : project.categories || [];
  const tabIds = {
    configTab: buildProjectAdminTabDomId(project.name, "config", "tab"),
    configPanel: buildProjectAdminTabDomId(project.name, "config", "panel"),
    autoReorganizeTab: buildProjectAdminTabDomId(project.name, "auto-reorganize", "tab"),
    autoReorganizePanel: buildProjectAdminTabDomId(project.name, "auto-reorganize", "panel"),
    forkTab: buildProjectAdminTabDomId(project.name, "fork", "tab"),
    forkPanel: buildProjectAdminTabDomId(project.name, "fork", "panel"),
    deleteTab: buildProjectAdminTabDomId(project.name, "delete", "tab"),
    deletePanel: buildProjectAdminTabDomId(project.name, "delete", "panel"),
  };
  return `
    <section class="editor-panel project-admin-card">
      <div class="card-header project-admin-card-header">
        <div>
          <p class="eyebrow">${escapeHtml(project.genre || "general")}</p>
          <h3>${escapeHtml(formatProjectName(project.name))}</h3>
        </div>
      </div>
      <div class="project-admin-tab-strip" role="tablist" aria-label="Project admin sections">
        <button id="${escapeHtml(tabIds.configTab)}" class="project-admin-tab-button active" type="button" role="tab" aria-selected="true" aria-controls="${escapeHtml(tabIds.configPanel)}" tabindex="0" data-project-admin-tab-trigger="config">
          Configuration
        </button>
        <button id="${escapeHtml(tabIds.autoReorganizeTab)}" class="project-admin-tab-button" type="button" role="tab" aria-selected="false" aria-controls="${escapeHtml(tabIds.autoReorganizePanel)}" tabindex="-1" data-project-admin-tab-trigger="auto-reorganize">
          Assistant Cleanup
        </button>
        <button id="${escapeHtml(tabIds.forkTab)}" class="project-admin-tab-button project-admin-tab-button-operation" type="button" role="tab" aria-selected="false" aria-controls="${escapeHtml(tabIds.forkPanel)}" tabindex="-1" data-project-admin-tab-trigger="fork">
          Fork Project
        </button>
        <button id="${escapeHtml(tabIds.deleteTab)}" class="project-admin-tab-button project-admin-tab-button-danger" type="button" role="tab" aria-selected="false" aria-controls="${escapeHtml(tabIds.deletePanel)}" tabindex="-1" data-project-admin-tab-trigger="delete">
          Delete Project
        </button>
      </div>
      <section id="${escapeHtml(tabIds.configPanel)}" class="project-admin-tab-panel" role="tabpanel" aria-labelledby="${escapeHtml(tabIds.configTab)}" data-project-admin-tab-panel="config" aria-hidden="false" tabindex="0">
        <form class="project-config-form editor-form" data-project-name="${escapeHtml(project.name)}">
          <div class="rename-grid">
            <label class="field">
              <span>Project Name</span>
              <input name="name" type="text" value="${escapeHtml(project.name)}" disabled />
            </label>
            <label class="field">
              <span>Genre</span>
              <select name="genre">
                ${projectTemplates.map((template) => `<option value="${escapeHtml(template.id)}" ${template.id === project.genre ? "selected" : ""}>${escapeHtml(template.label)}</option>`).join("")}
              </select>
            </label>
          </div>
          <label class="field">
            <span>Path</span>
            <input name="path" type="text" value="${escapeHtml(project.path || "")}" disabled />
          </label>
          ${renderProjectAdminTextareaField(project.name, "description", "Project Description", 3, project.description || "", icon)}
          ${renderProjectAdminTextareaField(project.name, "filingGuidance", "AI Filing Guidance", 4, project.filingGuidance || "", icon)}
          ${renderProjectAdminTextareaField(project.name, "knowledgePriority", "Knowledge Priority Rules", 4, project.knowledgePriority || "", icon)}
          <div class="rename-grid">
            <label class="field">
              <span>Resource Recency Bias</span>
              <select name="resourceRecencyBias">
                ${renderRecencyBiasOptions(project.resourceRecencyBias || "neutral")}
              </select>
            </label>
            <label class="field">
              <span>Freshness Window (days)</span>
              <input name="resourceRecencyWindowDays" type="number" min="0" step="1" value="${escapeHtml(String(project.resourceRecencyWindowDays ?? 30))}" />
            </label>
          </div>
          <p class="muted">This controls how aggressively newer dated resources should outrank older ones, especially for conference prep, supporting videos, and opinionated summaries.</p>
          ${renderProjectCategoryConsistency(project, icon)}
          <div class="field">
            <span>Categories</span>
            <div class="project-category-grid">
              ${renderProjectCategoryInputs(configuredCategories, false, project.name, projectTemplates)}
            </div>
          </div>
          <div class="rename-grid">
            <label class="field">
              <span>Primary URL</span>
              <input name="primaryUrl" type="url" value="${escapeHtml(project.primaryUrl || "")}" />
            </label>
            <label class="field">
              <span>Primary Label</span>
              <input name="primaryLabel" type="text" value="${escapeHtml(project.primaryLabel || "")}" />
            </label>
          </div>
          ${renderProjectAdminTextareaField(project.name, "primarySummary", "Primary Summary", 3, project.primarySummary || "", icon)}
          <div class="rename-actions">
            <button type="submit" class="primary-button">${icon("save")} Save Project</button>
            <a class="ghost-button inline-action" href="#/project/${encodeURIComponent(project.name)}/home">${icon("house")} Open Project</a>
          </div>
        </form>
      </section>
      <section id="${escapeHtml(tabIds.autoReorganizePanel)}" class="project-admin-tab-panel hidden" role="tabpanel" aria-labelledby="${escapeHtml(tabIds.autoReorganizeTab)}" data-project-admin-tab-panel="auto-reorganize" aria-hidden="true" hidden tabindex="-1">
        <section class="project-auto-reorganize-panel" data-auto-reorganize-panel="${escapeHtml(project.name)}">
          <div class="project-auto-reorganize-intro">
            <div>
              <p class="eyebrow">Auto Reorganize</p>
              <h3>Open a guided review for cleanup suggestions</h3>
              <p class="muted">The wizard builds a fresh proposal from the current project structure on disk, using quick local heuristics instead of a long-running background job, so load and refresh are usually fast.</p>
            </div>
          </div>
          <div class="project-auto-reorganize-actions">
            <button class="primary-button project-auto-reorganize-load-button" data-auto-reorganize-load="${escapeHtml(project.name)}" type="button">
              ${icon("sparkles")} Open Wizard
            </button>
          </div>
          <div class="auto-reorganize-proposal-body">
            <div class="empty-state compact">
              <p>Open the wizard to review the project summary, front-door pages, Home guidance, section balance, suggested page moves, and similar titles in one guided overlay.</p>
            </div>
          </div>
          <div class="auto-reorganize-modal hidden" data-auto-reorganize-modal aria-hidden="true">
            <div class="auto-reorganize-modal-backdrop" data-auto-reorganize-close></div>
            <section class="auto-reorganize-dialog" role="dialog" aria-modal="true" aria-labelledby="auto-reorganize-title-${escapeHtml(tabIds.autoReorganizePanel)}">
              <header class="auto-reorganize-dialog-header">
                <div>
                  <p class="eyebrow">Auto Reorganize</p>
                  <h3 id="auto-reorganize-title-${escapeHtml(tabIds.autoReorganizePanel)}">Guided review</h3>
                </div>
                <button class="ghost-button inline-action" type="button" data-auto-reorganize-close>Close</button>
              </header>
              <div class="auto-reorganize-dialog-body" data-auto-reorganize-modal-body data-auto-reorganize-content></div>
            </section>
          </div>
        </section>
      </section>
      <section id="${escapeHtml(tabIds.forkPanel)}" class="project-admin-tab-panel hidden" role="tabpanel" aria-labelledby="${escapeHtml(tabIds.forkTab)}" data-project-admin-tab-panel="fork" aria-hidden="true" hidden tabindex="-1">
        <section id="project-fork-panel" class="project-fork-panel">
          <div class="card-header">
            <p class="eyebrow">Fork</p>
            <h3>Create a new wiki-only fork without raw sources</h3>
          </div>
          <form class="project-fork-form editor-form" data-project-name="${escapeHtml(project.name)}">
            <div class="rename-grid">
              <label class="field">
                <span>Fork Name</span>
                <input name="name" type="text" value="${escapeHtml(`${project.name}-fork`)}" />
              </label>
              <label class="field">
                <span>Fork Path</span>
                <input name="path" type="text" value="${escapeHtml(defaultProjectPath(`${project.name}-fork`))}" />
              </label>
            </div>
            <label class="field">
              <span>Description</span>
              <textarea name="description" rows="3">${escapeHtml(project.description || "")}</textarea>
            </label>
            <label class="checkbox-row">
              <input name="keepCanonicalSource" type="checkbox" />
              <span>Keep canonical source fields in the fork: copy the project-level <code>primaryUrl</code>, <code>primaryLabel</code>, and <code>primarySummary</code> into the new fork.</span>
            </label>
            <p class="muted">Example: if you fork <strong>${escapeHtml(formatProjectName(project.name))}</strong> from an event wiki and leave this checked, the fork keeps the same official source such as <code>${escapeHtml(project.primaryUrl || "https://example.com/event")}</code>. If you leave it unchecked, the fork starts with those canonical source fields blank, which is usually better when the fork is becoming its own independent wiki.</p>
            <div class="rename-actions">
              <button type="submit" class="ghost-button inline-action">${icon("file")} Fork Project</button>
            </div>
          </form>
        </section>
      </section>
      <section id="${escapeHtml(tabIds.deletePanel)}" class="project-admin-tab-panel hidden" role="tabpanel" aria-labelledby="${escapeHtml(tabIds.deleteTab)}" data-project-admin-tab-panel="delete" aria-hidden="true" hidden tabindex="-1">
        <section class="project-delete-panel">
          <div class="card-header">
            <p class="eyebrow">Delete</p>
            <h3>Remove this project from the app</h3>
          </div>
          <form class="project-delete-form editor-form" data-project-name="${escapeHtml(project.name)}">
            <label class="field">
              <span>Delete Mode</span>
              <select name="mode">
                <option value="soft">Soft delete: remove from app and move folder to .trash</option>
                <option value="full">Full delete: remove from app and permanently delete data</option>
              </select>
            </label>
            <label class="field">
              <span>Type the project name to confirm</span>
              <input name="confirmName" type="text" placeholder="${escapeHtml(project.name)}" />
            </label>
            <div class="rename-actions">
              <button type="submit" class="ghost-button inline-action danger-button">${icon("trash")} Delete Project</button>
            </div>
          </form>
        </section>
      </section>
    </section>
  `;
}
