function isStructuralHomePage(page) {
  const id = String(page?.id || "").toLowerCase();
  return id === "index" || id === "overview" || id === "quotes" || id === "log";
}

function formatProjectName(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultFormatDateLabel(value) {
  return String(value || "");
}

function normalizeTodoTaskDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitTodoMarkdownFrontmatter(rawContent = "") {
  const normalized = String(rawContent || "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return {
      hasFrontmatter: false,
      frontmatterText: "",
      bodyText: normalized,
    };
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return {
      hasFrontmatter: false,
      frontmatterText: "",
      bodyText: normalized,
    };
  }

  return {
    hasFrontmatter: true,
    frontmatterText: normalized.slice(4, closingIndex),
    bodyText: normalized.slice(closingIndex + 5),
  };
}

function updateSimpleFrontmatterValue(frontmatterText, key, value) {
  const lines = String(frontmatterText || "").split("\n");
  const nextLines = [];
  let replaced = false;
  const normalizedKey = String(key || "").trim();
  const normalizedValue = String(value || "").trim();

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match && match[1] === normalizedKey) {
      replaced = true;
      if (normalizedValue) {
        nextLines.push(`${normalizedKey}: ${normalizedValue}`);
      }
      continue;
    }
    nextLines.push(line);
  }

  if (!replaced && normalizedValue) {
    nextLines.push(`${normalizedKey}: ${normalizedValue}`);
  }

  return nextLines.join("\n").trimEnd();
}

function isTodoTaskComplete(page = {}) {
  const rawContent = String(page.rawContent || "");
  const frontmatterStatus = String(page.frontmatter?.status || "").trim().toLowerCase();
  if (["done", "completed", "complete", "closed", "finished"].includes(frontmatterStatus)) {
    return true;
  }

  const checkboxMatches = rawContent.match(/^[ \t]*[-*+]\s+\[[ xX]\]\s+.*$/gm) || [];
  const openMatches = rawContent.match(/^[ \t]*[-*+]\s+\[\s\]\s+.*$/gm) || [];
  return checkboxMatches.length > 0 && openMatches.length === 0;
}

function findTodoTaskCheckboxLine(bodyText = "") {
  const lines = String(bodyText || "").split("\n");
  for (const line of lines) {
    const match = line.match(/^([ \t]*[-*+]\s+\[)( |x|X)(\]\s+.*)$/);
    if (match && match[2] === " ") {
      return match[3].replace(/^\]\s+/, "").trim();
    }
  }
  return "";
}

function buildTodoTaskDueState(dueDate, todayKey) {
  if (!dueDate) {
    return "no-date";
  }
  if (dueDate < todayKey) {
    return "overdue";
  }
  if (dueDate === todayKey) {
    return "today";
  }
  return "upcoming";
}

export function buildTodoTaskSummaryFromPage(page = {}, { today = new Date() } = {}) {
  const dueDate = normalizeTodoTaskDate(page.frontmatter?.due);
  const todayKey = getLocalDateKey(today);
  const taskText = findTodoTaskCheckboxLine(page.rawContent) || String(page.excerpt || "").trim() || String(page.title || "");

  return {
    id: page.id,
    pageId: page.id,
    title: page.title,
    category: page.category,
    wikiPath: page.wikiPath,
    byline: page.byline || "",
    excerpt: page.excerpt || "",
    mtimeMs: page.mtimeMs || 0,
    dueDate,
    dueState: buildTodoTaskDueState(dueDate, todayKey),
    complete: isTodoTaskComplete(page),
    taskText,
    rawContent: String(page.rawContent || ""),
    frontmatter: { ...(page.frontmatter || {}) },
  };
}

export function groupTodoTaskSummaries(tasks = [], { today = new Date() } = {}) {
  const todayKey = getLocalDateKey(today);
  const groups = [
    { key: "overdue", label: "Overdue", tasks: [] },
    { key: "today", label: "Today", tasks: [] },
    { key: "upcoming", label: "Upcoming", tasks: [] },
    { key: "no-date", label: "No date", tasks: [] },
  ];

  for (const task of tasks) {
    if (!task || task.complete) {
      continue;
    }
    const dueDate = normalizeTodoTaskDate(task.dueDate || task.frontmatter?.due);
    const dueState = buildTodoTaskDueState(dueDate, todayKey);
    const group = groups.find((item) => item.key === dueState);
    if (group) {
      group.tasks.push({
        ...task,
        dueDate,
        dueState,
      });
    }
  }

  for (const group of groups) {
    group.tasks.sort((left, right) => {
      const leftDue = left.dueDate || "9999-12-31";
      const rightDue = right.dueDate || "9999-12-31";
      if (leftDue !== rightDue) {
        return leftDue.localeCompare(rightDue);
      }
      return String(left.title || "").localeCompare(String(right.title || ""));
    });
  }

  return groups;
}

export function updateTodoTaskMarkdownContent(rawContent = "", options = {}) {
  const { dueDate, markDone = false } = options;
  const normalized = String(rawContent || "").replace(/\r\n/g, "\n");
  const { hasFrontmatter, frontmatterText, bodyText } = splitTodoMarkdownFrontmatter(normalized);
  const bodyLines = String(bodyText || "").split("\n");
  let didCheckOff = false;

  if (markDone) {
    for (let index = 0; index < bodyLines.length; index += 1) {
      const match = bodyLines[index].match(/^([ \t]*[-*+]\s+\[)( |x|X)(\]\s+.*)$/);
      if (!match || match[2] !== " ") {
        continue;
      }
      bodyLines[index] = `${match[1]}x${match[3]}`;
      didCheckOff = true;
      break;
    }
  }

  let nextFrontmatterText = String(frontmatterText || "");
  if (Object.prototype.hasOwnProperty.call(options, "dueDate")) {
    nextFrontmatterText = updateSimpleFrontmatterValue(nextFrontmatterText, "due", normalizeTodoTaskDate(dueDate));
  }

  if (markDone && !didCheckOff) {
    const hasAnyCheckbox = /^[ \t]*[-*+]\s+\[[ xX]\]\s+.*$/m.test(normalized);
    if (!hasAnyCheckbox) {
      nextFrontmatterText = updateSimpleFrontmatterValue(nextFrontmatterText, "status", "done");
    }
  }

  const nextBody = bodyLines.join("\n");
  const nextFrontmatterTrimmed = nextFrontmatterText.trim();
  if (!nextFrontmatterTrimmed) {
    return hasFrontmatter ? nextBody.replace(/^\n+/, "") : normalized.replace(/^\n+/, "");
  }
  if (hasFrontmatter) {
    return `---\n${nextFrontmatterTrimmed}\n---\n${nextBody}`;
  }
  return `---\n${nextFrontmatterTrimmed}\n---\n\n${nextBody.replace(/^\n+/, "")}`;
}

export function getRecentHomeItems(pages = []) {
  return pages
    .filter((page) => !isStructuralHomePage(page))
    .filter((page) => page.category !== "root" || !["index", "overview", "quotes", "log"].includes(String(page.id || "").toLowerCase()))
    .map((page) => ({
      ...page,
      createdAtMs: Date.parse(String(page.createdAt || "")),
    }))
    .filter((page) => Number.isFinite(page.createdAtMs))
    .sort((left, right) => right.createdAtMs - left.createdAtMs);
}

export function renderHomeCategoryStrip(group, {
  escapeHtml = (value) => String(value || ""),
  icon = () => "",
  getCategoryIconName = () => "file",
  projectGenre = "",
} = {}) {
  if (!group?.pages?.length) {
    return "";
  }
  if (String(projectGenre || "").trim().toLowerCase() === "to-do-list" && String(group.name || "").trim().toLowerCase() === "tasks") {
    return renderTodoTaskCategoryStrip(group, {
      escapeHtml,
      icon,
      getCategoryIconName,
    });
  }
  return `
    <section class="home-panel">
      <div class="card-header card-header-with-action">
        <div>
          <p class="eyebrow">${icon(getCategoryIconName(group.name))} ${escapeHtml(group.name)}</p>
        </div>
        <button class="ghost-button inline-action subtle-link home-open-category" data-category="${escapeHtml(group.name)}">${icon("file")} Open</button>
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
  `;
}

function renderTodoTaskCategoryStrip(group, {
  escapeHtml = (value) => String(value || ""),
  icon = () => "",
  getCategoryIconName = () => "check-circle",
} = {}) {
  return `
    <section class="home-panel task-list-panel">
      <div class="card-header card-header-with-action">
        <div>
          <p class="eyebrow">${icon(getCategoryIconName(group.name))} Task List</p>
        </div>
        <button class="ghost-button inline-action subtle-link home-open-category" data-category="${escapeHtml(group.name)}">${icon("file")} Open task list</button>
      </div>
      <div class="task-list">
        ${group.pages.map((page) => `
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

export function renderTodoTaskHomePanel(tasks = [], {
  escapeHtml = (value) => String(value || ""),
  icon = () => "",
  formatDateLabel = defaultFormatDateLabel,
} = {}) {
  const groups = groupTodoTaskSummaries(tasks);
  const visibleGroups = groups.filter((group) => group.tasks.length);

  if (!visibleGroups.length) {
    return `
      <section class="home-panel task-dashboard-panel">
        <div class="card-header card-header-with-action">
          <div>
            <p class="eyebrow">${icon("check-circle")} Tasks</p>
            <h3>Open task list</h3>
          </div>
          <button class="primary-button inline-action home-open-view" data-view="compose" data-category="tasks">${icon("plus")} New task</button>
        </div>
        <div class="empty-state compact">
          <p>No open tasks yet.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="home-panel task-dashboard-panel">
      <div class="card-header card-header-with-action">
        <div>
          <p class="eyebrow">${icon("check-circle")} Tasks</p>
          <h3>Open task list</h3>
        </div>
        <button class="primary-button inline-action home-open-view" data-view="compose" data-category="tasks">${icon("plus")} New task</button>
      </div>
      <div class="task-dashboard">
        ${visibleGroups.map((group) => `
          <section class="task-dashboard-group task-dashboard-group-${escapeHtml(group.key)}" data-group-key="${escapeHtml(group.key)}">
            <div class="task-dashboard-group-header">
              <div>
                <h4>${escapeHtml(group.label)}</h4>
                <p class="muted">${escapeHtml({
                  overdue: "Tasks past their due date.",
                  today: "Tasks due today.",
                  upcoming: "Tasks due later.",
                  "no-date": "Tasks without a due date.",
                }[group.key] || "")}</p>
              </div>
              <span class="type-badge subtle">${escapeHtml(String(group.tasks.length))}</span>
            </div>
            <div class="task-dashboard-list">
              ${group.tasks.map((task) => renderTodoTaskHomeRow(task, { escapeHtml, icon, formatDateLabel })).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTodoTaskHomeRow(task, {
  escapeHtml = (value) => String(value || ""),
  icon = () => "",
  formatDateLabel = defaultFormatDateLabel,
} = {}) {
  const dueLabel = task.dueDate ? formatDateLabel(task.dueDate) : "No due date";

  return `
    <article class="task-dashboard-row" data-page-id="${escapeHtml(task.pageId)}" data-task-id="${escapeHtml(task.pageId)}">
      <button class="task-dashboard-open home-open-page" data-page-id="${escapeHtml(task.pageId)}" type="button">
        <div class="task-dashboard-open-top">
          <strong>${escapeHtml(task.title)}</strong>
          <span class="type-badge subtle">${escapeHtml(dueLabel)}</span>
        </div>
        <span>${escapeHtml(task.taskText || task.excerpt || task.wikiPath || "")}</span>
      </button>
      <div class="task-dashboard-actions">
        <button class="ghost-button inline-action home-task-mark-done" type="button" data-task-id="${escapeHtml(task.pageId)}">${icon("check-circle")} Done</button>
        <label class="task-dashboard-due-field">
          <span class="sr-only">Due date</span>
          <input class="task-dashboard-due-input" type="date" value="${escapeHtml(task.dueDate || "")}" data-task-id="${escapeHtml(task.pageId)}" />
        </label>
        <button class="ghost-button inline-action home-task-save-due" type="button" data-task-id="${escapeHtml(task.pageId)}">${icon("calendar")} Save due</button>
        ${task.dueDate ? `<button class="ghost-button inline-action home-task-clear-due" type="button" data-task-id="${escapeHtml(task.pageId)}">${icon("trash")} Remove due</button>` : ""}
        <button class="ghost-button inline-action danger-button home-task-delete" type="button" data-task-id="${escapeHtml(task.pageId)}">${icon("trash")} Delete</button>
      </div>
    </article>
  `;
}

export function renderHomeRecentPanel(items, indexPage = null, {
  escapeHtml = (value) => String(value || ""),
  icon = () => "",
} = {}) {
  if (!items.length) {
    return "";
  }
  const visibleItems = items.slice(0, 3);
  const overflowCount = Math.max(0, items.length - visibleItems.length);

  return `
    <section class="home-panel recent-home-panel">
      <div class="card-header">
        <p class="eyebrow">Start Here</p>
        <h3>Featured entry points from the wiki</h3>
      </div>
      <div class="recent-home-list">
        ${visibleItems.map((item) => `
          <button class="recent-home-item home-open-page" data-page-id="${escapeHtml(item.id)}">
            <div class="recent-home-item-top">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="type-badge subtle">${escapeHtml(item.entityType || formatProjectName(item.category))}</span>
            </div>
            <span>${escapeHtml(item.byline || item.excerpt || item.wikiPath)}</span>
            <small>${escapeHtml(item.wikiPath || formatProjectName(item.category))}</small>
          </button>
        `).join("")}
      </div>
      ${overflowCount > 0 ? `
        <div class="rename-actions">
          ${indexPage
            ? `<button class="ghost-button inline-action home-open-page" data-page-id="${escapeHtml(indexPage.id)}">${icon("file")} Open index for ${escapeHtml(String(overflowCount + visibleItems.length))} total pages</button>`
            : `<p class="muted">${escapeHtml(String(overflowCount))} more pages in this project.</p>`
          }
        </div>
      ` : ""}
    </section>
  `;
}
