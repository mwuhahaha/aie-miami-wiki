export const DEFAULT_HOME_QUICK_CATEGORY_ORDER = ["tools", "topics", "people", "resources", "events", "places"];
export const TODO_LIST_HOME_QUICK_CATEGORY_ORDER = ["tasks", "projects", "areas", "notes", "resources", "people", "events", "ideas"];

export function getProjectHomeQuickCategories(
  pages = [],
  configuredCategories = [],
  preferredOrder = DEFAULT_HOME_QUICK_CATEGORY_ORDER
) {
  const pageCategories = Array.from(new Set(pages.map((page) => String(page?.category || "").trim()).filter(Boolean)));
  const configured = Array.from(new Set(configuredCategories.map((item) => String(item || "").trim()).filter(Boolean)));
  const ordered = [
    ...preferredOrder,
    ...configured,
    ...pageCategories,
  ].filter((value, index, list) => value && list.indexOf(value) === index);

  return ordered
    .map((name) => ({
      name,
      pages: pages.filter((page) => page.category === name).slice(0, 6),
    }))
    .filter((group) => group.pages.length || configured.includes(group.name));
}

export function buildPersonComposePrefillFromSource(source = {}, { autoRun = false, fallbackUrl = "" } = {}) {
  const speaker = String(source.speaker || "").trim();
  const evidence = String(source.evidence || "").trim();
  const url = String(source.url || fallbackUrl || "").trim();
  return {
    category: "people",
    personName: speaker,
    titleHint: speaker,
    autoRun,
    banner: autoRun ? `Auto-creating person page for ${speaker || "this speaker"}` : `Person draft for ${speaker || "this speaker"}`,
    url,
    evidence,
    instructions: [
      `Create a people page for ${speaker || "this official speaker"}.`,
      `Use the exact page title "${speaker || "Unknown Speaker"}".`,
      "Label them as a Person.",
      "Pull baseline facts from the canonical conference site and any local supporting material.",
      evidence ? `Known local supporting pages: ${evidence}.` : "",
      "Keep uncertain claims tentative.",
      "Add bilateral links to related talks, resources, events, and notes if they exist.",
    ].filter(Boolean).join(" "),
  };
}

export function renderProjectHome(model, deps) {
  const {
    pages = [],
    sourceContext = null,
    currentProject = null,
    recentPanelHtml = "",
    conferenceSourcePanelHtml = "",
    speakerMatchPanelHtml = "",
    taskHomePanelHtml = "",
  } = { ...model };
  const {
    renderHomeCategoryStrip = () => "",
    getCategoryIconName = () => "file",
    icon = () => "",
    escapeHtml = (value) => String(value || ""),
  } = { ...deps };
  const configuredCategories = Array.isArray(currentProject?.configuredCategories)
    ? currentProject.configuredCategories
    : Array.isArray(currentProject?.categories)
      ? currentProject.categories
      : [];
  const preferredOrder = String(currentProject?.genre || "").trim().toLowerCase() === "to-do-list"
    ? TODO_LIST_HOME_QUICK_CATEGORY_ORDER
    : DEFAULT_HOME_QUICK_CATEGORY_ORDER;
  const quickCategories = getProjectHomeQuickCategories(pages, configuredCategories, preferredOrder);
  const populatedQuickCategories = quickCategories.filter((group) => group.pages.length);
  const primaryCreateLabel = String(currentProject?.genre || "").trim().toLowerCase() === "to-do-list"
    ? "New Task"
    : "New Entry";
  const readOnly = Boolean(currentProject?.readOnly || currentProject?.publicShare);

  const suppressTodoTaskStrip = Boolean(taskHomePanelHtml);
  const homeCategoryPanels = populatedQuickCategories
    .filter((group) => !(suppressTodoTaskStrip && String(currentProject?.genre || "").trim().toLowerCase() === "to-do-list" && String(group.name || "").trim().toLowerCase() === "tasks"))
    .map((group) => renderHomeCategoryStrip(group, {
      escapeHtml,
      icon,
      getCategoryIconName,
      projectGenre: currentProject?.genre || "",
    }))
    .join("");

  return `
    <div class="article-shell ${sourceContext?.accent === "conference" ? "conference-home" : ""}">
      ${conferenceSourcePanelHtml}
      <section class="home-panel home-quick-access-panel">
        <div class="card-header">
          <p class="eyebrow">Quick Access</p>
        </div>
        <div class="home-actions home-actions-split">
          <div class="home-actions-group">
            ${quickCategories.map((group) => `
              <button class="ghost-button home-open-category" data-category="${escapeHtml(group.name)}">${icon(getCategoryIconName(group.name))} ${escapeHtml(labelizeCategory(group.name))}</button>
            `).join("")}
            <button class="ghost-button home-open-view" data-view="graph">${icon("links")} Graph</button>
            ${!readOnly ? `<button class="ghost-button home-toggle-category-form" type="button">${icon("plus")} New Category</button>` : ""}
          </div>
          ${!readOnly ? `<button class="primary-button home-open-view home-primary-entry" data-view="compose" data-category="${escapeHtml(String(currentProject?.genre || "").trim().toLowerCase() === "to-do-list" ? "tasks" : "")}">${icon("plus")} ${escapeHtml(primaryCreateLabel)}</button>` : ""}
        </div>
        ${!readOnly ? `<form id="home-category-create-form" class="home-category-create-form hidden">
          <label class="field home-category-create-field">
            <span>New category</span>
            <input
              name="categoryName"
              type="text"
              placeholder="Add a category like ${escapeHtml(suggestCategoryPlaceholder(configuredCategories))}"
              autocomplete="off"
            />
          </label>
          <div class="home-category-create-actions">
            <button type="submit" class="primary-button inline-action">${icon("plus")} Add Category</button>
            <button type="button" class="ghost-button inline-action home-cancel-category-form">Cancel</button>
          </div>
        </form>` : ""}
      </section>
      ${taskHomePanelHtml}
      ${speakerMatchPanelHtml}
      ${recentPanelHtml}
      ${homeCategoryPanels}
    </div>
  `;
}

function suggestCategoryPlaceholder(categories) {
  const suggestions = ["harnesses", "playbooks", "evaluations", "places", "projects", "notes"];
  return suggestions.find((item) => !categories.includes(item)) || "new-category";
}

function labelizeCategory(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
