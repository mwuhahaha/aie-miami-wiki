function formatTimeLabel(timestamp, options = {}) {
  const value = Number(timestamp || 0);
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleString("en-US", options);
}

export function formatActivityElapsed(totalSeconds) {
  const minutes = Math.floor(Number(totalSeconds || 0) / 60);
  const seconds = Number(totalSeconds || 0) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatActivityJobDateTime(timestamp) {
  return formatTimeLabel(timestamp, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatActivityJobTime(timestamp) {
  return formatTimeLabel(timestamp, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function describeActivityThreadStatus(thread, { formatElapsed = formatActivityElapsed } = {}) {
  const currentStep = String(thread.currentStep || "").trim();
  if (thread.status === "running") {
    if (thread.kind === "youtube-import" && currentStep) {
      return `${currentStep} · ${formatElapsed(thread.elapsedSeconds || 0)}`;
    }
    return `Elapsed ${formatElapsed(thread.elapsedSeconds || 0)}`;
  }
  if (thread.status === "completed") {
    return thread.pageId ? thread.pageId : (thread.updatedAt ? `Finished ${formatActivityJobTime(thread.updatedAt)}` : "Finished");
  }
  if (thread.status === "failed") {
    return thread.updatedAt ? `Failed ${formatActivityJobTime(thread.updatedAt)}` : "Failed";
  }
  return thread.updatedAt ? `${thread.status} ${formatActivityJobTime(thread.updatedAt)}` : (thread.status || "Unknown");
}

export function resolveActivityThreadSelection(threads = [], activeThreadId = null) {
  if (!threads.length) {
    return {
      activeThreadId: null,
      activeThread: null,
    };
  }

  const runningThreads = threads.filter((thread) => thread.status === "running");
  let nextActiveThreadId = activeThreadId;
  if (runningThreads.length === 1) {
    nextActiveThreadId = runningThreads[0].id;
  } else if (!nextActiveThreadId || !threads.some((thread) => thread.id === nextActiveThreadId)) {
    nextActiveThreadId = threads[0].id;
  }

  return {
    activeThreadId: nextActiveThreadId,
    activeThread: threads.find((thread) => thread.id === nextActiveThreadId) || threads[0],
  };
}

function getThreadKindLabel(thread) {
  return thread.kind === "youtube-import" ? "YouTube Import" : "AI Create";
}

function getThreadPrimaryTitle(thread) {
  if (thread.title) {
    return thread.title;
  }
  if (thread.kind === "youtube-import") {
    return thread.url ? `YouTube import` : "YouTube import";
  }
  return thread.pageId || "AI draft";
}

export function renderActivityThreadList(threads = [], activeThreadId = null, deps = {}) {
  const {
    escapeHtml = (value) => String(value || ""),
    formatProjectName = (value) => String(value || ""),
    describeThreadStatus = describeActivityThreadStatus,
  } = deps;

  return threads.map((thread) => `
    <button class="activity-thread-chip ${thread.id === activeThreadId ? "active" : ""} ${thread.status !== "running" ? "is-finished" : ""}" data-job-id="${escapeHtml(thread.id)}" type="button">
      <span class="activity-thread-chip-top">
        <strong>${escapeHtml(getThreadPrimaryTitle(thread))}</strong>
        <small>${escapeHtml(thread.status)}</small>
      </span>
      <span>${escapeHtml(getThreadKindLabel(thread))}</span>
      <span>${escapeHtml(formatProjectName(thread.projectName || ""))}</span>
      <span>${escapeHtml(describeThreadStatus(thread))}</span>
    </button>
  `).join("");
}

export function renderActivityThreadDetail(thread, deps = {}) {
  const {
    escapeHtml = (value) => String(value || ""),
    icon = () => "",
    formatProjectName = (value) => String(value || ""),
    summarizeAiCreateFailure = () => "",
    formatDateTime = formatActivityJobDateTime,
  } = deps;

  if (!thread) {
    return `<div class="empty-state compact"><p>Select a job to see details.</p></div>`;
  }

  const startedLabel = formatDateTime(thread.startedAt) || "unknown";
  const finishedLabel = thread.status === "running"
    ? "Still running"
    : (formatDateTime(thread.updatedAt) || "unknown");
  const resultLabel = thread.status === "completed"
    ? (thread.pageId || "Completed without page id")
    : thread.status === "failed"
      ? (summarizeAiCreateFailure(thread.error) || "Failed")
      : "Awaiting result";
  const safeMessage = thread.status === "running"
    ? "This job keeps running on the server if you close this panel or navigate elsewhere in the app. Hiding it will not cancel the job. Dismiss is only available after the job finishes."
    : thread.status === "completed"
      ? "This job finished. You can open the created page now or dismiss it permanently from the activity center."
      : summarizeAiCreateFailure(thread.error) || "This job failed. Review the output below before retrying.";
  const submittedCategory = thread.submittedCategory || thread.category || "unknown";
  const effectiveCategory = thread.effectiveCategory || thread.category || submittedCategory;
  const hasRoutingOverride = Boolean(submittedCategory && effectiveCategory && submittedCategory !== effectiveCategory);
  const routingLabel = hasRoutingOverride
    ? `${submittedCategory} -> ${effectiveCategory}`
    : effectiveCategory;
  const routingReason = thread.routingReason
    ? thread.routingReason.replace(/^explicit-category-instruction:/, "explicit user instruction: ")
    : "";
  const kindLabel = getThreadKindLabel(thread);
  const projectLabel = thread.projectName || thread.selectedProject || "";
  const title = getThreadPrimaryTitle(thread);
  const metaRows = thread.kind === "youtube-import"
    ? `
        <div><span>Current step</span><strong>${escapeHtml(thread.currentStep || thread.status || "unknown")}</strong></div>
        <div><span>Project target</span><strong>${escapeHtml(projectLabel || "smart route")}</strong></div>
        <div><span>Category</span><strong>${escapeHtml(thread.category || "auto")}</strong></div>
        <div><span>Started</span><strong>${escapeHtml(startedLabel)}</strong></div>
        <div><span>Updated</span><strong>${escapeHtml(finishedLabel)}</strong></div>
        <div><span>Result</span><strong>${escapeHtml(resultLabel)}</strong></div>
        <div><span>Source URL</span><strong>${escapeHtml(thread.url || "none")}</strong></div>
        <div><span>Run</span><strong>${escapeHtml(thread.id)}</strong></div>
      `
    : `
        <div><span>Routing</span><strong>${escapeHtml(routingLabel || "unknown")}</strong></div>
        <div><span>Submitted</span><strong>${escapeHtml(submittedCategory)}</strong></div>
        <div><span>Effective</span><strong>${escapeHtml(effectiveCategory)}</strong></div>
        <div><span>Routing reason</span><strong>${escapeHtml(routingReason || "none")}</strong></div>
        <div><span>Started</span><strong>${escapeHtml(startedLabel)}</strong></div>
        <div><span>Updated</span><strong>${escapeHtml(finishedLabel)}</strong></div>
        <div><span>Result</span><strong>${escapeHtml(resultLabel)}</strong></div>
        <div><span>Source URL</span><strong>${escapeHtml(thread.url || "none")}</strong></div>
        <div><span>Job</span><strong>${escapeHtml(thread.id)}</strong></div>
      `;

  return `
    <div class="activity-thread-panel ${thread.status}">
      <div class="activity-thread-topline">
        <div class="activity-thread-status ${thread.status}">
          <div class="activity-robot ${thread.status === "running" ? "is-running" : ""}">${icon("robot")}</div>
          <div>
            <p class="eyebrow">${escapeHtml(kindLabel)}</p>
            <h4>${escapeHtml(title)}</h4>
            ${thread.kind === "youtube-import"
              ? `<p class="muted">Current step: <strong>${escapeHtml(thread.currentStep || thread.status || "unknown")}</strong></p>`
              : (hasRoutingOverride ? `<p class="muted">Routing override: <strong>${escapeHtml(effectiveCategory)}</strong></p>` : "")}
          </div>
        </div>
        <div class="activity-thread-badges">
          <span class="filter-chip static">${escapeHtml(thread.status)}</span>
          <span class="filter-chip static">${escapeHtml(kindLabel)}</span>
          <span class="filter-chip static">${escapeHtml(formatProjectName(projectLabel || ""))}</span>
          <span class="filter-chip static">${escapeHtml(describeActivityThreadStatus(thread))}</span>
        </div>
      </div>
      <p class="activity-thread-note">${escapeHtml(safeMessage)}</p>
      <div class="activity-thread-meta">
        ${metaRows}
      </div>
      ${thread.routingEvidence ? `<div class="empty-state compact"><p><strong>Routing evidence:</strong> ${escapeHtml(thread.routingEvidence)}</p></div>` : ""}
      ${thread.status === "failed" && thread.error ? `<div class="empty-state compact"><p>${escapeHtml(summarizeAiCreateFailure(thread.error))}</p></div>` : ""}
      <pre class="activity-thread-output">${escapeHtml(thread.output || "Waiting for output...")}</pre>
      <div class="activity-thread-actions">
        <div class="rename-actions">
        ${thread.status === "completed" && thread.pageId ? `<button class="primary-button inline-action" data-action="open-created-page" type="button">${icon("file")} Open created page</button>` : ""}
        ${thread.status === "failed" && thread.retryPayload && thread.kind !== "youtube-import" ? `<button class="primary-button inline-action" data-action="retry-thread" type="button">${icon("robot")} Retry draft</button>` : ""}
        <button class="ghost-button inline-action" data-action="close-activity" type="button">${thread.status === "running" ? "Hide panel, keep job running" : "Close panel"}</button>
        ${thread.status !== "running" ? `<button class="ghost-button inline-action" data-action="dismiss-thread" type="button">Dismiss permanently</button>` : ""}
        </div>
      </div>
    </div>
  `;
}
