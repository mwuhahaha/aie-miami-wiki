function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const AUTO_REORGANIZE_MOVE_FOCUS_VALUES = new Set(["all", "apply-ready", "blocked-now", "review-only"]);
const AUTO_REORGANIZE_WIZARD_STEPS = [
  { key: "quick-read", title: "Quick read", eyebrow: "Step 1", decisionRequired: false, idleLabel: "Info only" },
  { key: "landing-cleanup", title: "Landing & structure", eyebrow: "Step 2" },
  { key: "project-experience", title: "Home & first view", eyebrow: "Step 3" },
  { key: "category-review", title: "Category health", eyebrow: "Step 4" },
  { key: "category-changes", title: "Suggested changes", eyebrow: "Step 5" },
  { key: "move-candidates", title: "Pages to move", eyebrow: "Step 6" },
  { key: "duplicates", title: "Similar titles", eyebrow: "Step 7" },
  { key: "apply-summary", title: "Review & apply", eyebrow: "Step 8" },
];
const AUTO_REORGANIZE_STEP_DECISION_VALUES = new Set(["continue", "skip", "review-later"]);
const AUTO_REORGANIZE_REVIEW_DECISION_LABELS = {
  continue: "Looks good",
  skip: "Nothing here",
  "review-later": "Come back to this",
};
const AUTO_REORGANIZE_CATEGORY_DISPOSITION_VALUES = new Set(["pursue", "not-now", "needs-evidence"]);
const AUTO_REORGANIZE_CATEGORY_DISPOSITION_LABELS = {
  pursue: "Pursue",
  "not-now": "Not now",
  "needs-evidence": "Needs evidence",
};
const AUTO_REORGANIZE_LANDING_ACTION_KEYS = new Set(["primary-landing-page", "root-merge-category"]);
const AUTO_REORGANIZE_STAT_EXPLANATIONS = {
  pages: {
    label: "Pages",
    shortLabel: "All indexed pages",
    title: "Pages",
    body: "The total number of wiki pages currently indexed in this project. This is the broad project size the proposal is looking at.",
  },
  "root-pages": {
    label: "Root pages",
    shortLabel: "Pages at wiki root",
    title: "Root pages",
    body: "Pages sitting directly under `wiki/` instead of inside a category folder. These often act like landing pages, utility pages, or loose notes that may need clearer placement.",
  },
  categories: {
    label: "Categories",
    shortLabel: "Sections in use",
    title: "Categories",
    body: "How many categories the current proposal sees in the indexed project structure. This helps frame how spread out or concentrated the project is.",
  },
  "duplicate-groups": {
    label: "Duplicate groups",
    shortLabel: "Similar titles to review",
    title: "Duplicate groups",
    body: "Groups of pages with very similar titles. They may be true duplicates, pages that need clearer naming, or pages that need stronger context labels.",
  },
  "apply-ready": {
    label: "Apply-ready",
    shortLabel: "Can run now if checked",
    title: "Apply-ready",
    body: "Move suggestions that fit the current conservative safety rules and have no known conflict right now. These can be checked in the move step and applied in the final step.",
  },
  "blocked-before-apply": {
    label: "Blocked before apply",
    shortLabel: "Looks plausible but conflicts now",
    title: "Blocked before apply",
    body: "Move suggestions that look plausible, but the proposal already sees a reason they cannot run right now, such as an existing destination page or file conflict.",
  },
  "review-only": {
    label: "Review-only",
    shortLabel: "Shown for judgment only",
    title: "Review-only",
    body: "Suggestions that are shown for context but are outside the current apply scope because the evidence is weaker, the action is broader, or the move is not safe enough yet.",
  },
};

function getAutoReorganizeWizardStep(stepKey = "") {
  return AUTO_REORGANIZE_WIZARD_STEPS.find((step) => step.key === String(stepKey || "").trim().toLowerCase()) || null;
}

function doesAutoReorganizeStepRequireDecision(stepKey = "") {
  const step = getAutoReorganizeWizardStep(stepKey);
  return step ? step.decisionRequired !== false : true;
}

function getAutoReorganizeStepStatusLabel(stepKey = "", stepDecisions = {}) {
  if (!doesAutoReorganizeStepRequireDecision(stepKey)) {
    return getAutoReorganizeWizardStep(stepKey)?.idleLabel || "Info only";
  }
  const decision = normalizeAutoReorganizeStepDecision(stepDecisions?.[stepKey]);
  return decision ? AUTO_REORGANIZE_REVIEW_DECISION_LABELS[decision] : "Pending";
}

function countAutoReorganizeDecisionSteps() {
  return AUTO_REORGANIZE_WIZARD_STEPS.filter((step) => doesAutoReorganizeStepRequireDecision(step.key)).length;
}

function normalizeAutoReorganizeMoveFocus(value = "") {
  const focus = String(value || "").trim().toLowerCase();
  return AUTO_REORGANIZE_MOVE_FOCUS_VALUES.has(focus) ? focus : "all";
}

function normalizeAutoReorganizeWizardStepKey(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return AUTO_REORGANIZE_WIZARD_STEPS.some((step) => step.key === key) ? key : AUTO_REORGANIZE_WIZARD_STEPS[0].key;
}

function normalizeAutoReorganizeStepDecision(value = "") {
  const decision = String(value || "").trim().toLowerCase();
  return AUTO_REORGANIZE_STEP_DECISION_VALUES.has(decision) ? decision : "";
}

function normalizeAutoReorganizeStepDecisions(stepDecisions = null) {
  const normalized = {};
  if (!stepDecisions || typeof stepDecisions !== "object") {
    return normalized;
  }
  AUTO_REORGANIZE_WIZARD_STEPS.forEach((step) => {
    const decision = normalizeAutoReorganizeStepDecision(stepDecisions[step.key]);
    if (decision) {
      normalized[step.key] = decision;
    }
  });
  return normalized;
}

function getAutoReorganizeLastUnlockedStepIndex(stepDecisions = {}) {
  let lastUnlockedIndex = 0;
  for (let index = 1; index < AUTO_REORGANIZE_WIZARD_STEPS.length; index += 1) {
    const previousStepKey = AUTO_REORGANIZE_WIZARD_STEPS[index - 1]?.key || "";
    if (doesAutoReorganizeStepRequireDecision(previousStepKey) && !stepDecisions[previousStepKey]) {
      break;
    }
    lastUnlockedIndex = index;
  }
  return lastUnlockedIndex;
}

function constrainAutoReorganizeWizardStepKey(value = "", stepDecisions = {}) {
  const requestedKey = normalizeAutoReorganizeWizardStepKey(value);
  const requestedIndex = AUTO_REORGANIZE_WIZARD_STEPS.findIndex((step) => step.key === requestedKey);
  if (requestedIndex < 0) {
    return AUTO_REORGANIZE_WIZARD_STEPS[0].key;
  }
  const lastUnlockedIndex = getAutoReorganizeLastUnlockedStepIndex(stepDecisions);
  return AUTO_REORGANIZE_WIZARD_STEPS[Math.min(requestedIndex, lastUnlockedIndex)].key;
}

function buildAutoReorganizeCategoryChangeKey(item = {}) {
  return [
    String(item?.category || "").trim().toLowerCase(),
    String(item?.action || "").trim().toLowerCase(),
    String(item?.suggestedTargetCategory || "").trim().toLowerCase(),
  ].join("::");
}

function normalizeAutoReorganizeCategoryDisposition(value = "") {
  const disposition = String(value || "").trim().toLowerCase();
  return AUTO_REORGANIZE_CATEGORY_DISPOSITION_VALUES.has(disposition) ? disposition : "";
}

function normalizeAutoReorganizeCategoryDispositionMap(dispositions = null) {
  const normalized = {};
  if (!dispositions || typeof dispositions !== "object") {
    return normalized;
  }
  Object.entries(dispositions).forEach(([key, value]) => {
    const normalizedKey = String(key || "").trim();
    const normalizedValue = normalizeAutoReorganizeCategoryDisposition(value);
    if (normalizedKey && normalizedValue) {
      normalized[normalizedKey] = normalizedValue;
    }
  });
  return normalized;
}

function normalizeAutoReorganizeLandingActionSelections(selections = null) {
  const normalized = {};
  if (!selections || typeof selections !== "object") {
    return normalized;
  }
  Object.entries(selections).forEach(([key, value]) => {
    const normalizedKey = String(key || "").trim().toLowerCase();
    if (!AUTO_REORGANIZE_LANDING_ACTION_KEYS.has(normalizedKey)) {
      return;
    }
    const normalizedValue = String(value || "").trim();
    if (normalizedValue) {
      normalized[normalizedKey] = normalizedValue;
    }
  });
  return normalized;
}

function getAutoReorganizeConfiguredCategories(project = {}) {
  const configuredCategories = Array.isArray(project?.configuredCategories) && project.configuredCategories.length
    ? project.configuredCategories
    : Array.isArray(project?.categories)
      ? project.categories
      : [];
  return Array.from(
    new Set(
      configuredCategories
        .map((value) => String(value || "").trim())
        .filter((value) => Boolean(value) && !["root", "assets"].includes(value.toLowerCase()))
    )
  );
}

function renderPageSummary(page) {
  if (!page) {
    return "";
  }

  const parts = [page.title || page.id || "Untitled"];
  if (page.category) {
    parts.push(`(${page.category})`);
  }
  if (page.mtimeMs) {
    parts.push(`@ ${page.mtimeMs}`);
  }
  return escapeHtml(parts.join(" "));
}

function humanizeSlug(value = "") {
  return String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function choosePrimaryLandingPage(landingPages = []) {
  if (!Array.isArray(landingPages) || !landingPages.length) {
    return null;
  }
  const landingPageById = new Map(
    landingPages.map((page) => [String(page?.id || "").trim().toLowerCase(), page])
  );
  return landingPageById.get("index")
    || landingPageById.get("overview")
    || landingPages[0]
    || null;
}

function renderList(items, emptyText, renderItem) {
  if (!Array.isArray(items) || !items.length) {
    return emptyText
      ? `<div class="empty-state compact"><p>${escapeHtml(emptyText)}</p></div>`
      : "";
  }

  return `<ul class="auto-reorganize-list">${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`;
}

function countByConfidence(items = []) {
  return items.reduce((counts, item) => {
    const confidence = String(item?.confidence || "unknown").trim().toLowerCase();
    counts[confidence] = (counts[confidence] || 0) + 1;
    return counts;
  }, {});
}

function getMatchedLabelCount(candidate = {}) {
  const explicitCount = Number(candidate?.matchedLabelCount);
  if (Number.isFinite(explicitCount) && explicitCount >= 0) {
    return explicitCount;
  }
  return Array.isArray(candidate?.matchedLabels) ? candidate.matchedLabels.length : 0;
}

function isApplyEligibleMoveCandidate(candidate = {}) {
  const confidence = String(candidate?.confidence || "").trim().toLowerCase();
  const currentCategory = String(candidate?.currentCategory || "").trim().toLowerCase();
  const suggestedCategory = String(candidate?.suggestedCategory || "").trim().toLowerCase();
  const matchedLabelCount = getMatchedLabelCount(candidate);
  const reservedCategories = new Set(["root", "assets"]);
  const rootMoveAllowed = currentCategory === "root" && confidence === "high";
  const lowConfidenceWithCorroboration = confidence === "low" && matchedLabelCount >= 2;
  const nonRootMoveAllowed = (
    !reservedCategories.has(currentCategory)
    && (confidence === "high" || confidence === "medium" || lowConfidenceWithCorroboration)
  );
  return (
    (rootMoveAllowed || nonRootMoveAllowed)
    && currentCategory
    && suggestedCategory
    && !reservedCategories.has(suggestedCategory)
    && !String(candidate?.applyBlockedReason || "").trim()
  );
}

function countMoveBatchStates(moveCandidates = []) {
  return moveCandidates.reduce((counts, candidate) => {
    if (isApplyEligibleMoveCandidate(candidate)) {
      counts.applyReady += 1;
      return counts;
    }
    if (String(candidate?.applyBlockedReason || "").trim()) {
      counts.blockedBeforeApply += 1;
      return counts;
    }
    counts.reviewOnly += 1;
    return counts;
  }, {
    applyReady: 0,
    blockedBeforeApply: 0,
    reviewOnly: 0,
  });
}

function renderAutoReorganizeChip(label, tone = "") {
  const className = tone ? `filter-chip static ${tone}` : "filter-chip static";
  return `<span class="${className}">${escapeHtml(label)}</span>`;
}

function buildMoveCandidateDestinationPreview(candidate = {}) {
  const suggestedCategory = String(candidate?.suggestedCategory || "").trim();
  const pageId = String(candidate?.pageId || "").trim();
  if (!suggestedCategory || !pageId) {
    return "";
  }
  const leafId = pageId.split("/").filter(Boolean).pop() || pageId;
  return `${suggestedCategory}/${leafId}`;
}

function renderMoveCandidateEvidence(candidate = {}, escape = escapeHtml) {
  const matchedLabels = Array.isArray(candidate?.matchedLabels) ? candidate.matchedLabels : [];
  if (!matchedLabels.length) {
    return "";
  }
  return `
    <div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
      ${matchedLabels.map((label) => renderAutoReorganizeChip(
        `${String(label?.source || "signal").trim() || "signal"} match`,
        "auto-reorganize-chip-balanced"
      )).join("")}
    </div>
    <div class="auto-reorganize-step-summary-list">
      ${matchedLabels.map((label, index) => `
        <div data-auto-reorganize-move-evidence="${escape(String(candidate?.pageId || ""))}-${index}">
          <span>${escape(humanizeSlug(label?.source || "signal"))}</span>
          <strong>${escape(String(label?.value || "").trim() || "Matched value")}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function getAutoReorganizeMoveStatusLabel(status = "") {
  if (status === "apply-ready") {
    return "apply-ready";
  }
  if (status === "blocked-now") {
    return "blocked before apply";
  }
  return "review-only";
}

function getAutoReorganizeMoveCandidateStatus(candidate = {}) {
  if (isApplyEligibleMoveCandidate(candidate)) {
    return "apply-ready";
  }
  if (String(candidate?.applyBlockedReason || "").trim()) {
    return "blocked-now";
  }
  return "review-only";
}

function getAutoReorganizeMoveFocusSummary(moveCandidates = []) {
  return moveCandidates.reduce((counts, candidate) => {
    const status = getAutoReorganizeMoveCandidateStatus(candidate);
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {
    "apply-ready": 0,
    "blocked-now": 0,
    "review-only": 0,
  });
}

function renderAutoReorganizeMoveGroupStatusChip(status = "", count = 0) {
  const label = `${count} ${getAutoReorganizeMoveStatusLabel(status)}`;
  const tone = (
    status === "apply-ready"
      ? "auto-reorganize-chip-balanced"
      : status === "blocked-now"
        ? (count ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced")
        : (count ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced")
  );
  return `<span class="filter-chip static ${tone}" data-auto-reorganize-group-status="${escapeHtml(status)}">${escapeHtml(label)}</span>`;
}

function renderAutoReorganizeMoveGroupStatusSummary(group = {}) {
  const candidates = Array.isArray(group?.candidates) ? group.candidates : [];
  const statusCounts = getAutoReorganizeMoveFocusSummary(candidates);
  const confidenceSummary = `${String(group.highConfidenceCount || 0)} high · ${String(group.mediumConfidenceCount || 0)} medium · ${String(group.lowConfidenceCount || 0)} low`;

  return `
    <div class="auto-reorganize-move-group-summary" data-auto-reorganize-group-status-summary>
      <p class="muted auto-reorganize-move-group-confidence">${escapeHtml(confidenceSummary)}</p>
      <div class="auto-reorganize-chip-row auto-reorganize-move-group-statuses">
        ${renderAutoReorganizeMoveGroupStatusChip("apply-ready", statusCounts["apply-ready"] || 0)}
        ${renderAutoReorganizeMoveGroupStatusChip("blocked-now", statusCounts["blocked-now"] || 0)}
        ${renderAutoReorganizeMoveGroupStatusChip("review-only", statusCounts["review-only"] || 0)}
      </div>
    </div>
  `;
}

function buildAutoReorganizeMoveFocusInputName(project = {}) {
  const slug = String(project?.name || "project")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `auto-reorganize-move-focus-${slug || "project"}`;
}

function renderAutoReorganizeMoveFocusControls(project = {}, moveCandidates = [], selectedFocus = "all") {
  const focus = normalizeAutoReorganizeMoveFocus(selectedFocus);
  const counts = getAutoReorganizeMoveFocusSummary(moveCandidates);
  const inputName = buildAutoReorganizeMoveFocusInputName(project);
  const options = [
    { value: "all", label: "All", count: moveCandidates.length, tone: "auto-reorganize-chip-balanced" },
    { value: "apply-ready", label: "Apply-ready", count: counts["apply-ready"] || 0, tone: "auto-reorganize-chip-balanced" },
    { value: "blocked-now", label: "Blocked before apply", count: counts["blocked-now"] || 0, tone: "auto-reorganize-chip-medium" },
    { value: "review-only", label: "Review-only", count: counts["review-only"] || 0, tone: "auto-reorganize-chip-low" },
  ];

  return `
    <fieldset class="auto-reorganize-focus-filter" data-auto-reorganize-move-focus-controls>
      <legend>Move review focus</legend>
      <p class="muted">This only narrows the review surface. Approved selections remain intact until you change them.</p>
      <div class="auto-reorganize-focus-filter-options">
        ${options.map((option) => `
          <label class="auto-reorganize-focus-option">
            <input
              type="radio"
              name="${escapeHtml(inputName)}"
              value="${escapeHtml(option.value)}"
              data-auto-reorganize-move-focus
              ${focus === option.value ? "checked" : ""}
            />
            <span>${escapeHtml(option.label)}</span>
            ${renderAutoReorganizeChip(String(option.count), option.tone)}
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function countVisibleApplyReadyMoveCandidates(moveCandidates = [], selectedFocus = "all") {
  const focus = normalizeAutoReorganizeMoveFocus(selectedFocus);
  return moveCandidates.filter((candidate) => {
    const status = getAutoReorganizeMoveCandidateStatus(candidate);
    if (status !== "apply-ready") {
      return false;
    }
    return focus === "all" || focus === status;
  }).length;
}

function renderAutoReorganizeMoveBatchControls(moveCandidates = [], selectedFocus = "all") {
  const visibleApplyReadyCount = countVisibleApplyReadyMoveCandidates(moveCandidates, selectedFocus);
  return `
    <section class="proposal-card auto-reorganize-step-card auto-reorganize-batch-approve-card">
      <div class="auto-reorganize-list-item-top">
        <strong>Batch approval</strong>
        ${renderAutoReorganizeChip(`${visibleApplyReadyCount} apply-ready in view`, visibleApplyReadyCount ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low")}
      </div>
      <p class="muted">This marks only the currently visible apply-ready move suggestions in this step. It does not change eligibility rules, and blocked or review-only suggestions stay untouched.</p>
      <div class="rename-actions">
        <button
          class="ghost-button inline-action"
          type="button"
          data-auto-reorganize-approve-visible
          ${visibleApplyReadyCount ? "" : "disabled"}
        >
          Approve all apply-ready in view
        </button>
      </div>
    </section>
  `;
}

function buildAutoReorganizeMoveFocusEmptyMessage(focus = "all") {
  if (focus === "apply-ready") {
    return "No apply-ready move candidates are visible in this proposal.";
  }
  if (focus === "blocked-now") {
    return "No blocked-now move candidates are visible in this proposal.";
  }
  if (focus === "review-only") {
    return "No review-only move candidates are visible in this proposal.";
  }
  return "No page move candidates were generated.";
}

function listProposalMoveCandidates(proposal = {}) {
  if (Array.isArray(proposal.pageMoveCandidates) && proposal.pageMoveCandidates.length) {
    return proposal.pageMoveCandidates;
  }
  if (!Array.isArray(proposal.moveCandidateGroups)) {
    return [];
  }
  return proposal.moveCandidateGroups.flatMap((group) => Array.isArray(group?.candidates) ? group.candidates : []);
}

function listRecentlyAppliedApprovalIds(applyResult = null) {
  if (!applyResult || !Array.isArray(applyResult.results)) {
    return [];
  }
  return Array.from(
    new Set(
      applyResult.results
        .filter((item) => String(item?.status || "").trim().toLowerCase() === "applied")
        .map((item) => String(item?.pageId || "").trim())
        .filter(Boolean)
    )
  );
}

export function buildAutoReorganizeApprovalDriftSummary(proposal = {}, reviewState = null, applyResult = null) {
  if (!reviewState?.hasSnapshot || !Array.isArray(reviewState.approvedPageIds) || !reviewState.approvedPageIds.length) {
    return null;
  }

  const moveCandidates = listProposalMoveCandidates(proposal);
  const currentCandidateIds = new Set(
    moveCandidates
      .map((candidate) => String(candidate?.pageId || "").trim())
      .filter(Boolean)
  );
  const currentEligibleIds = new Set(
    moveCandidates
      .filter((candidate) => isApplyEligibleMoveCandidate(candidate))
      .map((candidate) => String(candidate?.pageId || "").trim())
      .filter(Boolean)
  );
  const recentlyAppliedIds = new Set(listRecentlyAppliedApprovalIds(applyResult));
  const previouslyApprovedIds = Array.from(
    new Set(
      reviewState.approvedPageIds
        .map((value) => String(value || "").trim())
        .filter((value) => Boolean(value) && !recentlyAppliedIds.has(value))
    )
  );
  if (!previouslyApprovedIds.length) {
    return null;
  }

  const disappearedPageIds = [];
  const noLongerEligiblePageIds = [];
  const stillApprovedPageIds = [];

  previouslyApprovedIds.forEach((pageId) => {
    if (!currentCandidateIds.has(pageId)) {
      disappearedPageIds.push(pageId);
      return;
    }
    if (!currentEligibleIds.has(pageId)) {
      noLongerEligiblePageIds.push(pageId);
      return;
    }
    stillApprovedPageIds.push(pageId);
  });

  if (!disappearedPageIds.length && !noLongerEligiblePageIds.length) {
    return null;
  }

  return {
    previousApprovedCount: previouslyApprovedIds.length,
    disappearedPageIds,
    noLongerEligiblePageIds,
    stillApprovedPageIds,
  };
}

function readAutoReorganizeWizardDecisions(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return {};
  }
  return Array.from(panel.querySelectorAll("[data-auto-reorganize-step-choice]")).reduce((decisions, button) => {
    if (button?.getAttribute?.("aria-pressed") !== "true") {
      return decisions;
    }
    const stepKey = normalizeAutoReorganizeWizardStepKey(button?.dataset?.autoReorganizeStepKey || "");
    const decision = normalizeAutoReorganizeStepDecision(button?.dataset?.autoReorganizeStepChoice || "");
    if (stepKey && decision) {
      decisions[stepKey] = decision;
    }
    return decisions;
  }, {});
}

function readAutoReorganizeCategoryDispositionState(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return {};
  }
  return Array.from(panel.querySelectorAll("[data-auto-reorganize-category-disposition]")).reduce((dispositions, input) => {
    if (!input?.checked) {
      return dispositions;
    }
    const changeKey = String(input?.dataset?.autoReorganizeCategoryChangeKey || "").trim();
    const disposition = normalizeAutoReorganizeCategoryDisposition(input?.value || "");
    if (changeKey && disposition) {
      dispositions[changeKey] = disposition;
    }
    return dispositions;
  }, {});
}

function readAutoReorganizeLandingActionState(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return {};
  }
  return Array.from(panel.querySelectorAll("[data-auto-reorganize-landing-action]")).reduce((selections, input) => {
    const key = String(input?.dataset?.autoReorganizeLandingAction || "").trim().toLowerCase();
    if (!AUTO_REORGANIZE_LANDING_ACTION_KEYS.has(key)) {
      return selections;
    }
    const value = String(input?.value || "").trim();
    if (value) {
      selections[key] = value;
    }
    return selections;
  }, {});
}

export function captureAutoReorganizeReviewState(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return null;
  }

  const sections = Array.from(panel.querySelectorAll("details[data-auto-reorganize-section-key]"));
  const approvals = Array.from(panel.querySelectorAll("[data-auto-reorganize-approve]"));
  const stepChoices = Array.from(panel.querySelectorAll("[data-auto-reorganize-step-choice]"));
  const categoryDispositionInputs = Array.from(panel.querySelectorAll("[data-auto-reorganize-category-disposition]"));
  const landingActionInputs = Array.from(panel.querySelectorAll("[data-auto-reorganize-landing-action]"));
  if (!sections.length && !approvals.length && !stepChoices.length && !categoryDispositionInputs.length && !landingActionInputs.length) {
    return null;
  }

  const reviewState = {
    hasSnapshot: true,
    openSectionKeys: Array.from(
      new Set(
        sections
          .filter((section) => Boolean(section?.open))
          .map((section) => String(section?.dataset?.autoReorganizeSectionKey || "").trim())
          .filter(Boolean)
      )
    ),
    moveCandidateFocus: normalizeAutoReorganizeMoveFocus(
      panel.querySelector?.("[data-auto-reorganize-move-focus]:checked")?.value || "all"
    ),
    landingActionSelections: readAutoReorganizeLandingActionState(panel),
    approvedPageIds: Array.from(
      new Set(
        approvals
          .filter((input) => Boolean(input?.checked))
          .map((input) => String(input?.value || "").trim())
          .filter(Boolean)
      )
    ),
    categoryChangeDispositions: readAutoReorganizeCategoryDispositionState(panel),
  };

  if (stepChoices.length) {
    reviewState.currentWizardStep = normalizeAutoReorganizeWizardStepKey(
      panel.querySelector?.("[data-auto-reorganize-wizard]")?.dataset?.autoReorganizeCurrentStep || AUTO_REORGANIZE_WIZARD_STEPS[0].key
    );
    reviewState.stepDecisions = readAutoReorganizeWizardDecisions(panel);
  }

  return reviewState;
}

function applyAutoReorganizeWizardStepState(panel, reviewState = null) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return;
  }
  const stepDecisions = normalizeAutoReorganizeStepDecisions(reviewState?.stepDecisions);
  const stepKey = constrainAutoReorganizeWizardStepKey(
    reviewState?.currentWizardStep || AUTO_REORGANIZE_WIZARD_STEPS[0].key,
    stepDecisions
  );
  const wizard = panel.querySelector?.("[data-auto-reorganize-wizard]");
  if (wizard?.dataset) {
    wizard.dataset.autoReorganizeCurrentStep = stepKey;
  }

  Array.from(panel.querySelectorAll("[data-auto-reorganize-step-panel]")).forEach((stepPanel) => {
    const active = normalizeAutoReorganizeWizardStepKey(stepPanel?.dataset?.autoReorganizeStepPanel || "") === stepKey;
    stepPanel.hidden = !active;
    stepPanel.classList?.toggle?.("active", active);
  });

  Array.from(panel.querySelectorAll("[data-auto-reorganize-step-link]")).forEach((button) => {
    const buttonStepKey = normalizeAutoReorganizeWizardStepKey(button?.dataset?.autoReorganizeStepLink || "");
    const active = buttonStepKey === stepKey;
    button.setAttribute("aria-current", active ? "step" : "false");
    button.setAttribute("aria-disabled", "false");
    button.classList?.toggle?.("active", active);
    button.classList?.remove?.("locked");
  });

  Array.from(panel.querySelectorAll("[data-auto-reorganize-step-choice]")).forEach((button) => {
    const buttonStepKey = normalizeAutoReorganizeWizardStepKey(button?.dataset?.autoReorganizeStepKey || "");
    const buttonDecision = normalizeAutoReorganizeStepDecision(button?.dataset?.autoReorganizeStepChoice || "");
    const selectedDecision = stepDecisions[buttonStepKey] || "";
    const pressed = Boolean(buttonStepKey && buttonDecision && selectedDecision === buttonDecision);
    button.setAttribute("aria-pressed", pressed ? "true" : "false");
    button.classList?.toggle?.("active", pressed);
  });

  Array.from(panel.querySelectorAll("[data-auto-reorganize-step-status]")).forEach((statusEl) => {
    const statusStepKey = normalizeAutoReorganizeWizardStepKey(statusEl?.dataset?.autoReorganizeStepStatus || "");
    const decision = stepDecisions[statusStepKey] || "";
    statusEl.textContent = getAutoReorganizeStepStatusLabel(statusStepKey, stepDecisions);
    statusEl.dataset.autoReorganizeStepDecision = decision || (doesAutoReorganizeStepRequireDecision(statusStepKey) ? "pending" : "info-only");
  });

  Array.from(panel.querySelectorAll("[data-auto-reorganize-next]")).forEach((button) => {
    button.disabled = false;
  });
}

export function restoreAutoReorganizeReviewState(panel, reviewState = null) {
  if (!panel || typeof panel.querySelectorAll !== "function" || !reviewState?.hasSnapshot) {
    return;
  }

  const openSectionKeys = new Set(
    Array.isArray(reviewState.openSectionKeys)
      ? reviewState.openSectionKeys.map((value) => String(value || "").trim()).filter(Boolean)
      : []
  );
  Array.from(panel.querySelectorAll("details[data-auto-reorganize-section-key]")).forEach((section) => {
    const sectionKey = String(section?.dataset?.autoReorganizeSectionKey || "").trim();
    if (!sectionKey) {
      return;
    }
    section.open = openSectionKeys.has(sectionKey);
  });

  const approvedPageIds = new Set(
    Array.isArray(reviewState.approvedPageIds)
      ? reviewState.approvedPageIds.map((value) => String(value || "").trim()).filter(Boolean)
      : []
  );
  Array.from(panel.querySelectorAll("[data-auto-reorganize-approve]")).forEach((input) => {
    const pageId = String(input?.value || "").trim();
    input.checked = Boolean(pageId) && approvedPageIds.has(pageId);
  });

  const categoryChangeDispositions = normalizeAutoReorganizeCategoryDispositionMap(reviewState?.categoryChangeDispositions);
  Array.from(panel.querySelectorAll("[data-auto-reorganize-category-disposition]")).forEach((input) => {
    const changeKey = String(input?.dataset?.autoReorganizeCategoryChangeKey || "").trim();
    const disposition = normalizeAutoReorganizeCategoryDisposition(input?.value || "");
    input.checked = Boolean(changeKey) && Boolean(disposition) && categoryChangeDispositions[changeKey] === disposition;
  });

  const landingActionSelections = normalizeAutoReorganizeLandingActionSelections(reviewState?.landingActionSelections);
  Array.from(panel.querySelectorAll("[data-auto-reorganize-landing-action]")).forEach((input) => {
    const key = String(input?.dataset?.autoReorganizeLandingAction || "").trim().toLowerCase();
    if (!AUTO_REORGANIZE_LANDING_ACTION_KEYS.has(key)) {
      return;
    }
    input.value = landingActionSelections[key] || "";
  });

  applyAutoReorganizeMoveFocus(panel, reviewState.moveCandidateFocus);
  applyAutoReorganizeWizardStepState(panel, reviewState);
}

export function applyAutoReorganizeMoveFocus(panel, moveCandidateFocus = null) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return "all";
  }

  const focus = normalizeAutoReorganizeMoveFocus(
    moveCandidateFocus ?? panel.querySelector?.("[data-auto-reorganize-move-focus]:checked")?.value ?? "all"
  );

  Array.from(panel.querySelectorAll("[data-auto-reorganize-move-focus]")).forEach((input) => {
    input.checked = String(input?.value || "").trim() === focus;
  });

  const candidates = Array.from(panel.querySelectorAll("[data-auto-reorganize-move-candidate]"));
  const groups = Array.from(panel.querySelectorAll("[data-auto-reorganize-move-group]"));
  const emptyState = panel.querySelector?.("[data-auto-reorganize-move-focus-empty]");
  let visibleCandidateCount = 0;

  candidates.forEach((candidate) => {
    const status = normalizeAutoReorganizeMoveFocus(candidate?.dataset?.autoReorganizeMoveFocusStatus || "all");
    const visible = focus === "all" || status === focus;
    candidate.hidden = !visible;
    if (visible) {
      visibleCandidateCount += 1;
    }
  });

  groups.forEach((group) => {
    const visibleCandidates = Array.from(group.querySelectorAll?.("[data-auto-reorganize-move-candidate]") || [])
      .filter((candidate) => !candidate.hidden);
    const hasVisibleCandidates = visibleCandidates.length > 0;
    group.hidden = !hasVisibleCandidates;

    const visibleStatusCounts = visibleCandidates.reduce((counts, candidate) => {
      const status = normalizeAutoReorganizeMoveFocus(candidate?.dataset?.autoReorganizeMoveFocusStatus || "all");
      if (status !== "all") {
        counts[status] = (counts[status] || 0) + 1;
      }
      return counts;
    }, {
      "apply-ready": 0,
      "blocked-now": 0,
      "review-only": 0,
    });

    Array.from(group.querySelectorAll?.("[data-auto-reorganize-group-status]") || []).forEach((chip) => {
      const status = normalizeAutoReorganizeMoveFocus(chip?.dataset?.autoReorganizeGroupStatus || "all");
      if (status === "all") {
        return;
      }
      chip.textContent = `${visibleStatusCounts[status] || 0} ${getAutoReorganizeMoveStatusLabel(status)}`;
    });
  });

  if (emptyState) {
    const shouldShowEmptyState = candidates.length > 0 && visibleCandidateCount === 0;
    emptyState.hidden = !shouldShowEmptyState;
    if (shouldShowEmptyState) {
      emptyState.innerHTML = `<p>${escapeHtml(buildAutoReorganizeMoveFocusEmptyMessage(focus))}</p>`;
    }
  }

  if (panel.dataset) {
    panel.dataset.autoReorganizeMoveFocus = focus;
  }
  return focus;
}

function getApplyStatusTone(status = "") {
  if (status === "applied") {
    return "high";
  }
  if (status === "blocked") {
    return "medium";
  }
  return "low";
}

function getApplyStatusHeading(status = "") {
  if (status === "applied") {
    return "Applied now";
  }
  if (status === "blocked") {
    return "Blocked";
  }
  return "Skipped";
}

function getApplyStatusDescription(status = "") {
  if (status === "applied") {
    return "These approved moves completed in the current limited apply pass.";
  }
  if (status === "blocked") {
    return "These selections were still eligible in principle, but a current-project conflict or write-time problem stopped them.";
  }
  return "These selections were not executed because they fell outside the current bounded apply slice or disappeared from the refreshed proposal.";
}

function renderApplyResultItem(item = {}, escape = escapeHtml) {
  const status = String(item.status || "unknown").trim().toLowerCase();
  const title = item.nextId || item.pageId || item.previousId || "Unknown page";
  const routeSummary = item.previousId && item.nextId
    ? `${item.previousId} -> ${item.nextId}`
    : item.currentCategory && item.suggestedCategory
      ? `${item.currentCategory} -> ${item.suggestedCategory}`
      : "";
  const detailLines = [];

  if (routeSummary) {
    detailLines.push(routeSummary);
  }
  if (item.reason) {
    detailLines.push(item.reason);
  } else if (status === "applied") {
    detailLines.push("Move applied through the current limited page-move flow.");
  }
  if (item.destinationFilePath) {
    detailLines.push(`Destination file: ${item.destinationFilePath}`);
  }
  if (item.conflictPath) {
    detailLines.push(`Conflict path: ${item.conflictPath}`);
  }
  if (Array.isArray(item.stalePaths) && item.stalePaths.length) {
    detailLines.push(`Stale path${item.stalePaths.length === 1 ? "" : "s"}: ${item.stalePaths.join(", ")}`);
  }

  return `
    <article class="proposal-card nested auto-reorganize-apply-item" data-auto-reorganize-apply-status="${escape(status)}">
      <div class="auto-reorganize-list-item-top">
        <strong>${escape(title)}</strong>
        ${renderAutoReorganizeChip(status || "unknown", `auto-reorganize-chip-${getApplyStatusTone(status)}`)}
      </div>
      ${detailLines.map((line) => `<p>${escape(line)}</p>`).join("")}
    </article>
  `;
}

function renderApplyStatusSummary(applyResult = {}, escape = escapeHtml) {
  if (!applyResult || !Array.isArray(applyResult.results) || !applyResult.results.length) {
    return "";
  }

  const appliedCount = Number(applyResult.appliedCount || 0);
  const blockedCount = Number(applyResult.blockedCount || 0);
  const skippedCount = Number(applyResult.skippedCount || 0);
  const groupedResults = [
    { status: "applied", items: applyResult.results.filter((item) => item?.status === "applied") },
    { status: "blocked", items: applyResult.results.filter((item) => item?.status === "blocked") },
    { status: "skipped", items: applyResult.results.filter((item) => item?.status === "skipped") },
  ].filter((group) => group.items.length);

  return `
    <section class="proposal-card" data-auto-reorganize-apply-result>
      <div class="auto-reorganize-list-item-top">
        <strong>Last apply attempt</strong>
        ${renderAutoReorganizeChip(`${appliedCount} applied`, "auto-reorganize-chip-high")}
      </div>
      <p>${escape(applyResult.limitedScope || "Limited apply scope")}</p>
      <div class="auto-reorganize-chip-row">
        ${renderAutoReorganizeChip(`${blockedCount} blocked`, blockedCount ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced")}
        ${renderAutoReorganizeChip(`${skippedCount} skipped`, skippedCount ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced")}
      </div>
      <div class="proposal-card-list auto-reorganize-apply-groups">
        ${groupedResults.map((group) => `
          <article class="proposal-card auto-reorganize-apply-group" data-auto-reorganize-apply-group="${escape(group.status)}">
            <div class="auto-reorganize-list-item-top">
              <strong>${escape(getApplyStatusHeading(group.status))}</strong>
              ${renderAutoReorganizeChip(`${group.items.length} result${group.items.length === 1 ? "" : "s"}`, `auto-reorganize-chip-${getApplyStatusTone(group.status)}`)}
            </div>
            <p class="muted">${escape(getApplyStatusDescription(group.status))}</p>
            <div class="proposal-card-list">
              ${group.items.map((item) => renderApplyResultItem(item, escape)).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderApprovalDriftSummary(driftSummary = null, escape = escapeHtml) {
  if (!driftSummary) {
    return "";
  }
  const disappearedCount = driftSummary.disappearedPageIds?.length || 0;
  const noLongerEligibleCount = driftSummary.noLongerEligiblePageIds?.length || 0;
  const stillApprovedCount = driftSummary.stillApprovedPageIds?.length || 0;
  const affectedCount = disappearedCount + noLongerEligibleCount;
  if (!affectedCount) {
    return "";
  }

  return `
    <section class="proposal-card" data-auto-reorganize-approval-drift>
      <div class="auto-reorganize-list-item-top">
        <strong>Selections changed after refresh</strong>
        ${renderAutoReorganizeChip(`${affectedCount} changed`, "auto-reorganize-chip-medium")}
      </div>
      <p class="muted">Some previously approved moves are no longer in the same apply-ready state in this refreshed proposal.</p>
      <div class="auto-reorganize-chip-row">
        ${renderAutoReorganizeChip(`${disappearedCount} disappeared`, disappearedCount ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced")}
        ${renderAutoReorganizeChip(`${noLongerEligibleCount} no longer eligible`, noLongerEligibleCount ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced")}
        ${stillApprovedCount ? renderAutoReorganizeChip(`${stillApprovedCount} still approved`, "auto-reorganize-chip-balanced") : ""}
      </div>
      ${disappearedCount ? `<p class="muted">Disappeared: ${escape(driftSummary.disappearedPageIds.join(", "))}</p>` : ""}
      ${noLongerEligibleCount ? `<p class="muted">No longer eligible: ${escape(driftSummary.noLongerEligiblePageIds.join(", "))}</p>` : ""}
    </section>
  `;
}

function renderSimpleProposalCard({ eyebrow = "", title = "", body = "", badges = [] } = {}) {
  return `
    <article class="auto-reorganize-simple-card">
      <div class="auto-reorganize-simple-card-top">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h4>${escapeHtml(title)}</h4>
        </div>
        <div class="auto-reorganize-section-badges">
          ${badges.map((badge) => renderAutoReorganizeChip(badge.label, badge.tone)).join("")}
        </div>
      </div>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function pickSimpleProposalExample(moveCandidates = []) {
  const eligibleCandidate = moveCandidates.find((candidate) => isApplyEligibleMoveCandidate(candidate));
  if (eligibleCandidate) {
    return {
      eyebrow: "Example move",
      title: eligibleCandidate.title || eligibleCandidate.pageId || "Eligible move",
      body: `${eligibleCandidate.currentCategory || "unknown"} -> ${eligibleCandidate.suggestedCategory || "unknown"}. ${eligibleCandidate.reason || "This is currently safe enough to approve in the limited apply flow."}`,
      badges: [
        { label: `${eligibleCandidate.confidence || "unknown"} confidence`, tone: `auto-reorganize-chip-${String(eligibleCandidate.confidence || "unknown").toLowerCase()}` },
        { label: "Apply-ready now", tone: "auto-reorganize-chip-balanced" },
      ],
    };
  }

  const reviewOnlyCandidate = moveCandidates[0];
  if (reviewOnlyCandidate) {
    return {
      eyebrow: "Example review item",
      title: reviewOnlyCandidate.title || reviewOnlyCandidate.pageId || "Review item",
      body: reviewOnlyCandidate.applyBlockedReason
        ? `${reviewOnlyCandidate.currentCategory || "unknown"} -> ${reviewOnlyCandidate.suggestedCategory || "unknown"}. Blocked before apply: ${reviewOnlyCandidate.applyBlockedReason}`
        : `${reviewOnlyCandidate.currentCategory || "unknown"} -> ${reviewOnlyCandidate.suggestedCategory || "unknown"}. ${reviewOnlyCandidate.reason || "This proposal has a possible move, but it is still review-only in the current slice."}`,
      badges: [
        { label: `${reviewOnlyCandidate.confidence || "unknown"} confidence`, tone: `auto-reorganize-chip-${String(reviewOnlyCandidate.confidence || "unknown").toLowerCase()}` },
        { label: "Review only", tone: "auto-reorganize-chip-low" },
      ],
    };
  }

  return {
    eyebrow: "Example review item",
    title: "No page move example yet",
    body: "This proposal currently found no eligible move example. You can still review landing signals, sparse or dense categories, and duplicate-title groups to understand the project shape.",
    badges: [
      { label: "0 move examples", tone: "auto-reorganize-chip-low" },
    ],
  };
}

function renderSimpleProposalSummary({
  summary = {},
  landingCleanup = {},
  projectExperienceReview = {},
  categoryChanges = [],
  duplicateGroups = [],
  moveCandidates = [],
}) {
  const landingSignalCount = Array.isArray(landingCleanup?.signals) ? landingCleanup.signals.length : 0;
  const homePriorityCount = Array.isArray(projectExperienceReview?.homePriorities) ? projectExperienceReview.homePriorities.length : 0;
  const moveBatchCounts = countMoveBatchStates(moveCandidates);
  const example = pickSimpleProposalExample(moveCandidates);

  return `
    <section class="auto-reorganize-simple-summary" data-auto-reorganize-simple-summary>
      <div class="auto-reorganize-simple-intro">
        <p class="eyebrow">Quick read</p>
        <h4>What this review is suggesting</h4>
        <p class="muted">This is the short version: what looks ready to act on now, what still needs your judgment, and one example so the review feels concrete.</p>
      </div>
      <div class="auto-reorganize-simple-grid">
        ${renderSimpleProposalCard({
          eyebrow: "Ready now",
          title: moveBatchCounts.applyReady
            ? `${moveBatchCounts.applyReady} page move${moveBatchCounts.applyReady === 1 ? "" : "s"} can run now`
            : "Nothing is ready to run yet",
          body: moveBatchCounts.applyReady
            ? "The last step only runs the page moves you checked and that still look reliable in the current project. Suggestions with conflicts or weaker evidence stay visible for review, but they are not moved."
            : "This pass still found useful patterns, but none of the page moves look ready to run right now. Suggestions with conflicts or weaker evidence stay visible for review only.",
          badges: [
            { label: `${moveBatchCounts.applyReady} apply-ready`, tone: "auto-reorganize-chip-balanced" },
            { label: `${moveBatchCounts.blockedBeforeApply} blocked-before-apply`, tone: moveBatchCounts.blockedBeforeApply ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced" },
            { label: `${moveBatchCounts.reviewOnly} review-only`, tone: moveBatchCounts.reviewOnly ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced" },
            { label: `${summary.moveCandidateCount ?? 0} total move candidates`, tone: "auto-reorganize-chip-medium" },
          ],
        })}
        ${renderSimpleProposalCard({
          eyebrow: "Needs review",
          title: `${landingSignalCount + homePriorityCount + categoryChanges.length + duplicateGroups.length} broader organization idea${landingSignalCount + homePriorityCount + categoryChanges.length + duplicateGroups.length === 1 ? "" : "s"} need review`,
          body: "Landing cleanup, Home guidance, category merge or split ideas, duplicate titles, and lower-confidence move suggestions are here to help you understand the project shape. They do not change anything by themselves.",
          badges: [
            { label: `${landingSignalCount} landing`, tone: "auto-reorganize-chip-low" },
            { label: `${homePriorityCount} home`, tone: "auto-reorganize-chip-balanced" },
            { label: `${categoryChanges.length} category`, tone: "auto-reorganize-chip-medium" },
            { label: `${duplicateGroups.length} duplicate`, tone: "auto-reorganize-chip-medium" },
            { label: `${moveBatchCounts.reviewOnly} review-only moves`, tone: "auto-reorganize-chip-low" },
          ],
        })}
        ${renderSimpleProposalCard(example)}
      </div>
    </section>
  `;
}

function renderProjectExperienceRecommendationList(items = [], emptyText = "", escape = escapeHtml) {
  return renderList(items, emptyText, (item) => `
    <article class="proposal-card nested auto-reorganize-step-card">
      <div class="auto-reorganize-list-item-top">
        <strong>${escape(item?.title || "Recommendation")}</strong>
        ${renderAutoReorganizeChip("Review only", "auto-reorganize-chip-low")}
      </div>
      <p>${escape(item?.recommendation || "")}</p>
      <p class="muted">${escape(item?.rationale || "")}</p>
      ${Array.isArray(item?.evidence) && item.evidence.length
        ? `<div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
            ${item.evidence.map((entry) => renderAutoReorganizeChip(entry, "auto-reorganize-chip-balanced")).join("")}
          </div>`
        : ""}
    </article>
  `);
}

function buildAutoReorganizeStats(summary = {}, moveBatchCounts = {}) {
  return [
    { key: "pages", value: summary.pageCount ?? 0 },
    { key: "root-pages", value: summary.rootPageCount ?? 0 },
    { key: "categories", value: summary.categoryCount ?? 0 },
    { key: "duplicate-groups", value: summary.duplicateTitleGroupCount ?? 0 },
    { key: "apply-ready", value: moveBatchCounts.applyReady ?? 0 },
    { key: "blocked-before-apply", value: moveBatchCounts.blockedBeforeApply ?? 0 },
    { key: "review-only", value: moveBatchCounts.reviewOnly ?? 0 },
  ].map((item) => ({
    ...item,
    ...(AUTO_REORGANIZE_STAT_EXPLANATIONS[item.key] || {}),
  }));
}

function renderAutoReorganizeStatHelpDialog(stats = []) {
  const defaultStat = stats[0] || AUTO_REORGANIZE_STAT_EXPLANATIONS.pages;
  return `
    <div class="auto-reorganize-stat-help-dialog hidden" data-auto-reorganize-stat-help-dialog aria-hidden="true">
      <div class="auto-reorganize-stat-help-card">
        <div class="auto-reorganize-list-item-top">
          <strong data-auto-reorganize-stat-help-title>${escapeHtml(defaultStat.title || "")}</strong>
          <button class="ghost-button inline-action" type="button" data-auto-reorganize-stat-help-close>Close</button>
        </div>
        <p class="muted" data-auto-reorganize-stat-help-body>${escapeHtml(defaultStat.body || "")}</p>
      </div>
    </div>
  `;
}

function renderStatsSummary(summary = {}, moveBatchCounts = {}) {
  const stats = buildAutoReorganizeStats(summary, moveBatchCounts);
  return `
    <div class="auto-reorganize-summary" data-auto-reorganize-stats>
      <div class="auto-reorganize-stat-grid">
        ${stats.map((stat) => `
          <button
            class="auto-reorganize-stat auto-reorganize-stat-button"
            type="button"
            data-auto-reorganize-stat-help-trigger="${escapeHtml(stat.key || "")}"
            data-auto-reorganize-stat-help-title="${escapeHtml(stat.title || stat.label || "")}"
            data-auto-reorganize-stat-help-body="${escapeHtml(stat.body || "")}"
            aria-label="${escapeHtml(`${stat.label || ""}: ${stat.value}. ${stat.shortLabel || ""}`)}"
            aria-expanded="false"
          >
            <span>${escapeHtml(stat.label || "")}</span>
            <strong>${escapeHtml(String(stat.value ?? 0))}</strong>
            <small>${escapeHtml(stat.shortLabel || "")}</small>
          </button>
        `).join("")}
      </div>
      ${renderAutoReorganizeStatHelpDialog(stats)}
    </div>
  `;
}

function renderMoveCandidateCard(item = {}, escape = escapeHtml) {
  const destinationPreview = buildMoveCandidateDestinationPreview(item);
  const matchedLabelCount = getMatchedLabelCount(item);
  const moveStatus = getAutoReorganizeMoveCandidateStatus(item);
  return `
    <article class="proposal-card nested" data-confidence="${escape(item.confidence || "unknown")}" data-auto-reorganize-move-candidate data-auto-reorganize-move-focus-status="${escape(getAutoReorganizeMoveCandidateStatus(item))}">
      <div class="auto-reorganize-list-item-top">
        <strong>${escape(item.title || item.pageId || "Untitled")}</strong>
        ${item.applyBlockedReason
          ? renderAutoReorganizeChip("Blocked now", "auto-reorganize-chip-medium")
          : renderAutoReorganizeChip(`${item.confidence || "unknown"} confidence`, `auto-reorganize-chip-${String(item.confidence || "unknown").toLowerCase()}`)}
      </div>
      <p>${escape(item.currentCategory || "unknown")} → ${escape(item.suggestedCategory || "unknown")}</p>
      <div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
        ${destinationPreview
          ? renderAutoReorganizeChip(`Destination: ${destinationPreview}`, "auto-reorganize-chip-balanced")
          : ""}
        ${renderAutoReorganizeChip(
          `${matchedLabelCount} matched evidence${matchedLabelCount === 1 ? "" : " items"}`,
          matchedLabelCount ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low"
        )}
        ${renderAutoReorganizeChip(
          moveStatus === "apply-ready" ? "Can run now if checked" : moveStatus === "blocked-now" ? "Blocked before apply" : "Review only in this pass",
          moveStatus === "apply-ready" ? "auto-reorganize-chip-balanced" : moveStatus === "blocked-now" ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-low"
        )}
      </div>
      <p class="muted">${escape(item.reason || "")}</p>
      ${isApplyEligibleMoveCandidate(item) ? `
        <label class="checkbox-row">
          <input type="checkbox" data-auto-reorganize-approve value="${escape(item.pageId || "")}" />
          <span>Approve this move for the limited apply flow.</span>
        </label>
      ` : item.applyBlockedReason ? `
        <p class="muted">Blocked before apply. ${escape(item.applyBlockedReason)}</p>
        ${item.applyConflictPath ? `<p class="muted">Conflict path: ${escape(item.applyConflictPath)}</p>` : ""}
      ` : `<p class="muted">Shown for review only in this pass.</p>`}
      ${renderMoveCandidateEvidence(item, escape)}
    </article>
  `;
}

function renderWizardDecisionButtons(stepKey = "", stepDecisions = {}, stepHint = "") {
  const currentDecision = normalizeAutoReorganizeStepDecision(stepDecisions[stepKey]);
  return `
    <div class="auto-reorganize-step-decision-group" data-auto-reorganize-step-decision-group="${escapeHtml(stepKey)}">
      <p class="muted">${escapeHtml(stepHint || "Choose how this step looks to you before moving on.")}</p>
      <div class="auto-reorganize-step-decision-actions">
        ${Object.entries(AUTO_REORGANIZE_REVIEW_DECISION_LABELS).map(([value, label]) => `
          <button
            class="ghost-button inline-action auto-reorganize-step-decision-button ${currentDecision === value ? "active" : ""}"
            type="button"
            data-auto-reorganize-step-choice="${escapeHtml(value)}"
            data-auto-reorganize-step-key="${escapeHtml(stepKey)}"
            aria-pressed="${currentDecision === value ? "true" : "false"}"
          >
            ${escapeHtml(label)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderWizardFooter(stepKey = "", options = {}) {
  const { allowNext = true, isLast = false, stepDecisions = {}, requiresDecision = true } = options;
  const currentDecision = normalizeAutoReorganizeStepDecision(stepDecisions[stepKey]);
  return `
    <footer class="auto-reorganize-step-footer">
      <div class="auto-reorganize-step-footer-nav">
        <button class="ghost-button inline-action" type="button" data-auto-reorganize-prev="${escapeHtml(stepKey)}">Previous</button>
        ${isLast ? `<button class="primary-button" type="button" data-auto-reorganize-close>Close wizard</button>` : `
          <button class="primary-button" type="button" data-auto-reorganize-next="${escapeHtml(stepKey)}" ${allowNext && (!requiresDecision || currentDecision) ? "" : "disabled"}>
            Next step
          </button>
        `}
      </div>
    </footer>
  `;
}

function renderCategoryChangeDispositionControls(item = {}, categoryChangeDispositions = {}, escape = escapeHtml) {
  const changeKey = buildAutoReorganizeCategoryChangeKey(item);
  const selectedDisposition = normalizeAutoReorganizeCategoryDisposition(categoryChangeDispositions[changeKey]);
  const inputName = `auto-reorganize-category-change-${changeKey || "suggestion"}`;

  return `
    <fieldset class="auto-reorganize-category-disposition-group" data-auto-reorganize-category-disposition-group="${escape(changeKey)}">
      <legend>Review mark</legend>
      <div class="auto-reorganize-category-disposition-options">
        ${Object.entries(AUTO_REORGANIZE_CATEGORY_DISPOSITION_LABELS).map(([value, label]) => `
          <label class="auto-reorganize-category-disposition-option">
            <input
              type="radio"
              name="${escape(inputName)}"
              value="${escape(value)}"
              data-auto-reorganize-category-disposition
              data-auto-reorganize-category-change-key="${escape(changeKey)}"
              ${selectedDisposition === value ? "checked" : ""}
            />
            <span>${escape(label)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function summarizeAutoReorganizeCategoryDispositionCounts(categoryChanges = [], categoryChangeDispositions = {}) {
  const normalizedDispositions = normalizeAutoReorganizeCategoryDispositionMap(categoryChangeDispositions);
  return categoryChanges.reduce((counts, item) => {
    const changeKey = buildAutoReorganizeCategoryChangeKey(item);
    const disposition = normalizeAutoReorganizeCategoryDisposition(normalizedDispositions[changeKey]);
    if (disposition) {
      counts[disposition] += 1;
      counts.marked += 1;
    } else {
      counts.pending += 1;
    }
    return counts;
  }, {
    pursue: 0,
    "not-now": 0,
    "needs-evidence": 0,
    pending: 0,
    marked: 0,
  });
}

function renderCategoryChangeDispositionSummary(categoryChanges = [], categoryChangeDispositions = {}, escape = escapeHtml) {
  if (!categoryChanges.length) {
    return `
      <section class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Category change review marks</strong>
          ${renderAutoReorganizeChip("0 suggestions", "auto-reorganize-chip-balanced")}
        </div>
        <p class="muted">No category-change suggestions were generated in this proposal.</p>
      </section>
    `;
  }

  const counts = summarizeAutoReorganizeCategoryDispositionCounts(categoryChanges, categoryChangeDispositions);
  const normalizedDispositions = normalizeAutoReorganizeCategoryDispositionMap(categoryChangeDispositions);

  return `
    <section class="proposal-card auto-reorganize-step-card" data-auto-reorganize-category-summary>
      <div class="auto-reorganize-list-item-top">
        <strong>Category change review marks</strong>
        <span data-auto-reorganize-category-summary-marked>
          ${renderAutoReorganizeChip(`${counts.marked} of ${categoryChanges.length} marked`, counts.marked ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low")}
        </span>
      </div>
      <p class="muted">These review marks stay read-only here. They summarize which category-level suggestions feel worth pursuing, deferring, or validating later.</p>
      <div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
        <span data-auto-reorganize-category-summary-count="pursue">
          ${renderAutoReorganizeChip(`${counts.pursue} pursue`, counts.pursue ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low")}
        </span>
        <span data-auto-reorganize-category-summary-count="needs-evidence">
          ${renderAutoReorganizeChip(`${counts["needs-evidence"]} needs evidence`, counts["needs-evidence"] ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced")}
        </span>
        <span data-auto-reorganize-category-summary-count="not-now">
          ${renderAutoReorganizeChip(`${counts["not-now"]} not now`, counts["not-now"] ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced")}
        </span>
        <span data-auto-reorganize-category-summary-count="pending">
          ${renderAutoReorganizeChip(`${counts.pending} pending`, counts.pending ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced")}
        </span>
      </div>
      <div class="auto-reorganize-step-summary-list">
        ${categoryChanges.map((item) => {
          const changeKey = buildAutoReorganizeCategoryChangeKey(item);
          const disposition = normalizeAutoReorganizeCategoryDisposition(normalizedDispositions[changeKey]);
          return `
            <div data-auto-reorganize-category-summary-item="${escape(changeKey)}">
              <span>${escape(item.category || "uncategorized")}${item.suggestedTargetCategory ? ` → ${escape(item.suggestedTargetCategory)}` : ""}</span>
              <strong data-auto-reorganize-category-summary-item-status="${escape(changeKey)}">${escape(disposition ? AUTO_REORGANIZE_CATEGORY_DISPOSITION_LABELS[disposition] : "Pending")}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

export function syncAutoReorganizeCategoryChangeSummary(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return;
  }

  const summary = panel.querySelector?.("[data-auto-reorganize-category-summary]");
  if (!summary) {
    return;
  }

  const categoryChanges = Array.from(
    panel.querySelectorAll("[data-auto-reorganize-category-summary-item]")
  ).map((item) => ({
    changeKey: String(item?.dataset?.autoReorganizeCategorySummaryItem || "").trim(),
  })).filter((item) => item.changeKey);

  if (!categoryChanges.length) {
    return;
  }

  const categoryChangeDispositions = readAutoReorganizeCategoryDispositionState(panel);
  const counts = categoryChanges.reduce((acc, item) => {
    const disposition = normalizeAutoReorganizeCategoryDisposition(categoryChangeDispositions[item.changeKey]);
    if (disposition) {
      acc[disposition] += 1;
      acc.marked += 1;
    } else {
      acc.pending += 1;
    }
    return acc;
  }, {
    pursue: 0,
    "not-now": 0,
    "needs-evidence": 0,
    pending: 0,
    marked: 0,
  });

  const markedSummary = summary.querySelector?.("[data-auto-reorganize-category-summary-marked]");
  if (markedSummary) {
    markedSummary.innerHTML = renderAutoReorganizeChip(
      `${counts.marked} of ${categoryChanges.length} marked`,
      counts.marked ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low"
    );
  }

  [
    ["pursue", `${counts.pursue} pursue`, counts.pursue ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low"],
    ["needs-evidence", `${counts["needs-evidence"]} needs evidence`, counts["needs-evidence"] ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced"],
    ["not-now", `${counts["not-now"]} not now`, counts["not-now"] ? "auto-reorganize-chip-low" : "auto-reorganize-chip-balanced"],
    ["pending", `${counts.pending} pending`, counts.pending ? "auto-reorganize-chip-medium" : "auto-reorganize-chip-balanced"],
  ].forEach(([key, label, tone]) => {
    const chip = summary.querySelector?.(`[data-auto-reorganize-category-summary-count="${key}"]`);
    if (chip) {
      chip.innerHTML = renderAutoReorganizeChip(label, tone);
    }
  });

  categoryChanges.forEach((item) => {
    const disposition = normalizeAutoReorganizeCategoryDisposition(categoryChangeDispositions[item.changeKey]);
    const status = summary.querySelector?.(`[data-auto-reorganize-category-summary-item-status="${escapeHtml(item.changeKey)}"]`);
    if (status) {
      status.textContent = disposition ? AUTO_REORGANIZE_CATEGORY_DISPOSITION_LABELS[disposition] : "Pending";
    }
  });
}

function buildLandingCleanupActionSummaryItems(landingCleanup = {}, configuredCategories = [], landingActionSelections = {}) {
  const normalizedSelections = normalizeAutoReorganizeLandingActionSelections(landingActionSelections);
  const landingPages = Array.isArray(landingCleanup?.landingPages) ? landingCleanup.landingPages : [];
  const rootPages = Array.isArray(landingCleanup?.rootPages) ? landingCleanup.rootPages : [];
  const landingPageLookup = new Map(
    landingPages.map((page) => [String(page?.id || "").trim(), page])
  );
  const primaryLandingPage = landingPageLookup.get(normalizedSelections["primary-landing-page"]) || null;
  const rootMergeCategory = String(normalizedSelections["root-merge-category"] || "").trim();

  return [
    {
      key: "primary-landing-page",
      label: "Front door follow-up",
      value: primaryLandingPage
        ? `Keep ${primaryLandingPage.title || primaryLandingPage.id} as the front door and turn off extra landing-page competition later.`
        : landingPages.length
          ? "No front-door follow-up selected yet."
          : "No landing pages were detected, so there is no front-door follow-up to choose yet.",
    },
    {
      key: "root-merge-category",
      label: "Loose root follow-up",
      value: rootMergeCategory
        ? `Merge loose root content into ${humanizeSlug(rootMergeCategory)} and turn off root-level clutter later.`
        : !configuredCategories.length
          ? "No configured categories are enabled for this project, so this follow-up is not available."
          : rootPages.length
            ? "No loose-root follow-up selected yet."
            : "No extra root pages were detected, so this follow-up is optional.",
    },
  ];
}

function renderLandingCleanupActionSummary(landingCleanup = {}, configuredCategories = [], landingActionSelections = {}, escape = escapeHtml) {
  const items = buildLandingCleanupActionSummaryItems(landingCleanup, configuredCategories, landingActionSelections);
  const selectedCount = items.filter((item) => (
    !String(item.value || "").startsWith("No ")
    && !String(item.value || "").includes("not available")
    && !String(item.value || "").includes("optional")
  )).length;
  return `
    <section class="proposal-card auto-reorganize-step-card" data-auto-reorganize-landing-summary>
      <div class="auto-reorganize-list-item-top">
        <strong>Review-first follow-up choices</strong>
        <span data-auto-reorganize-landing-summary-count>
          ${renderAutoReorganizeChip(`${selectedCount} selected`, "auto-reorganize-chip-balanced")}
        </span>
      </div>
      <p class="muted">These choices only capture the direction that looks right. They do not move files, rewrite landing pages, or expand the current apply pass.</p>
      <div class="auto-reorganize-step-summary-list">
        ${items.map((item) => `
          <div>
            <span>${escape(item.label)}</span>
            <strong data-auto-reorganize-landing-summary-item="${escape(item.key)}">${escape(item.value)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

export function syncAutoReorganizeLandingActionSummary(panel) {
  if (!panel || typeof panel.querySelectorAll !== "function") {
    return;
  }
  const summaries = Array.from(panel.querySelectorAll("[data-auto-reorganize-landing-summary]"));
  if (!summaries.length) {
    return;
  }
  const configuredCategories = Array.from(panel.querySelectorAll("[data-auto-reorganize-configured-category-option]"))
    .map((option) => String(option?.value || "").trim())
    .filter(Boolean);
  const landingCleanup = {
    landingPages: Array.from(panel.querySelectorAll("[data-auto-reorganize-landing-page-option]")).map((option) => ({
      id: String(option?.value || "").trim(),
      title: String(option?.dataset?.autoReorganizeLandingPageTitle || option?.textContent || "").trim(),
    })).filter((page) => page.id),
    rootPages: Array.from(panel.querySelectorAll("[data-auto-reorganize-root-page-summary]")).map((item) => ({
      id: String(item?.dataset?.autoReorganizeRootPageSummary || "").trim(),
    })).filter((page) => page.id),
  };
  const items = buildLandingCleanupActionSummaryItems(
    landingCleanup,
    configuredCategories,
    readAutoReorganizeLandingActionState(panel)
  );
  const selectedCount = items.filter((item) => (
    !String(item.value || "").startsWith("No ")
    && !String(item.value || "").includes("not available")
    && !String(item.value || "").includes("optional")
  )).length;
  summaries.forEach((summary) => {
    const count = summary.querySelector?.("[data-auto-reorganize-landing-summary-count]");
    if (count) {
      count.innerHTML = renderAutoReorganizeChip(`${selectedCount} selected`, "auto-reorganize-chip-balanced");
    }
    items.forEach((item) => {
      const status = summary.querySelector?.(`[data-auto-reorganize-landing-summary-item="${escapeHtml(item.key)}"]`);
      if (status) {
        status.textContent = item.value;
      }
    });
  });
}

function renderWizardStep({
  stepKey = "",
  title = "",
  eyebrow = "",
  body = "",
  currentStep = AUTO_REORGANIZE_WIZARD_STEPS[0].key,
  stepDecisions = {},
  withDecision = true,
  isLast = false,
  decisionHint = "",
} = {}) {
  const activeStep = constrainAutoReorganizeWizardStepKey(currentStep, normalizeAutoReorganizeStepDecisions(stepDecisions));
  const requiresDecision = withDecision !== false;
  return `
    <section class="auto-reorganize-wizard-step" data-auto-reorganize-step-panel="${escapeHtml(stepKey)}" data-auto-reorganize-step-requires-decision="${requiresDecision ? "true" : "false"}" tabindex="-1" ${stepKey === activeStep ? "" : "hidden"}>
      <div class="auto-reorganize-wizard-step-header">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <div class="auto-reorganize-wizard-step-body">
        ${body}
      </div>
      ${withDecision ? renderWizardDecisionButtons(stepKey, stepDecisions, decisionHint) : ""}
      ${renderWizardFooter(stepKey, { allowNext: true, isLast, stepDecisions, requiresDecision })}
    </section>
  `;
}

function renderWizardProgress(currentStep = "", stepDecisions = {}) {
  const activeStep = normalizeAutoReorganizeWizardStepKey(currentStep);
  return `
    <aside class="auto-reorganize-wizard-progress">
      <p class="eyebrow">Review path</p>
      <div class="auto-reorganize-wizard-progress-list">
        ${AUTO_REORGANIZE_WIZARD_STEPS.map((step, index) => `
          <button
            class="auto-reorganize-step-link ${step.key === activeStep ? "active" : ""}"
            type="button"
            data-auto-reorganize-step-link="${escapeHtml(step.key)}"
            aria-current="${step.key === activeStep ? "step" : "false"}"
          >
            <span class="auto-reorganize-step-link-index">${index + 1}</span>
            <span class="auto-reorganize-step-link-copy">
              <strong>${escapeHtml(step.title)}</strong>
              <small data-auto-reorganize-step-status="${escapeHtml(step.key)}" data-auto-reorganize-step-decision="${escapeHtml(stepDecisions[step.key] || (doesAutoReorganizeStepRequireDecision(step.key) ? "pending" : "info-only"))}">${escapeHtml(getAutoReorganizeStepStatusLabel(step.key, stepDecisions))}</small>
            </span>
          </button>
        `).join("")}
      </div>
    </aside>
  `;
}

export function renderAutoReorganizeProposalReview(proposal = {}, deps = {}) {
  const {
    escapeHtml: escape = escapeHtml,
    applyResult = null,
    approvalDriftSummary = null,
    moveCandidateFocus = "all",
    currentWizardStep = AUTO_REORGANIZE_WIZARD_STEPS[0].key,
    stepDecisions = {},
    categoryChangeDispositions = {},
    landingActionSelections = {},
  } = deps;

  const project = proposal.project || {};
  const summary = proposal.summary || {};
  const landingCleanup = proposal.landingCleanup || { signals: [], landingPages: [], rootPages: [] };
  const projectExperienceReview = proposal.projectExperienceReview || {
    summary: "",
    signals: [],
    homePriorities: [],
    landingEmphasis: [],
    surfaceFirst: [],
    structureDisplayChanges: [],
  };
  const categoryReview = Array.isArray(proposal.categoryReview) ? proposal.categoryReview : [];
  const categoryChanges = Array.isArray(proposal.suggestedCategoryChanges) ? proposal.suggestedCategoryChanges : [];
  const moveCandidates = Array.isArray(proposal.pageMoveCandidates) ? proposal.pageMoveCandidates : [];
  const moveCandidateGroups = Array.isArray(proposal.moveCandidateGroups) ? proposal.moveCandidateGroups : [];
  const duplicateGroups = Array.isArray(proposal.duplicateTitleGroups) ? proposal.duplicateTitleGroups : [];
  const moveBatchCounts = countMoveBatchStates(moveCandidates);
  const moveConfidenceCounts = countByConfidence(moveCandidates);
  const normalizedMoveCandidateFocus = normalizeAutoReorganizeMoveFocus(moveCandidateFocus);
  const normalizedStepDecisions = normalizeAutoReorganizeStepDecisions(stepDecisions);
  const normalizedCurrentWizardStep = constrainAutoReorganizeWizardStepKey(currentWizardStep, normalizedStepDecisions);
  const normalizedCategoryChangeDispositions = normalizeAutoReorganizeCategoryDispositionMap(categoryChangeDispositions);
  const normalizedLandingActionSelections = normalizeAutoReorganizeLandingActionSelections(landingActionSelections);
  const configuredCategories = getAutoReorganizeConfiguredCategories(project);
  const primaryLandingChoice = choosePrimaryLandingPage(landingCleanup.landingPages || []);

  const quickReadBody = `
    <p class="muted">This first step is informational. It gives you the short version of the proposal before you get into individual review steps. Each time you open or refresh this wizard, it scans the current pages and categories on disk and builds a fresh proposal from that live structure.</p>
    <p class="muted">Use the summary cards below to understand project size and proposal scope. You can click any stat for a plain-English explanation. Only checked page moves that still meet the current safety rules can be applied right now; everything else stays review-only.</p>
    ${renderSimpleProposalSummary({
      summary,
      landingCleanup,
      projectExperienceReview,
      categoryChanges,
      duplicateGroups,
      moveCandidates,
    })}
    ${renderStatsSummary(summary, moveBatchCounts)}
    ${renderApprovalDriftSummary(approvalDriftSummary, escape)}
  `;

  const landingCleanupBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">These are the pages that currently act like the project's front door, plus any loose top-level pages that may need cleanup later. Use the action controls below to mark which conservative follow-up direction looks right; those choices stay review-only in this pass.</p>
    </div>
    <div class="auto-reorganize-step-card-grid">
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Structure signals</strong>
          ${renderAutoReorganizeChip(`${landingCleanup.signals?.length || 0} signals`, "auto-reorganize-chip-balanced")}
        </div>
        ${renderList(landingCleanup.signals, "No landing cleanup signals were generated.", (signal) => `<p>${escape(signal)}</p>`)}
      </article>
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Landing pages</strong>
          ${renderAutoReorganizeChip(`${landingCleanup.landingPages?.length || 0} pages`, "auto-reorganize-chip-low")}
        </div>
        ${renderList(landingCleanup.landingPages, "No landing pages were detected.", renderPageSummary)}
      </article>
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Root pages</strong>
          ${renderAutoReorganizeChip(`${landingCleanup.rootPages?.length || 0} pages`, "auto-reorganize-chip-low")}
        </div>
        ${renderList(landingCleanup.rootPages, "No extra root pages were detected.", renderPageSummary)}
      </article>
    </div>
    <section class="proposal-card auto-reorganize-step-card">
      <div class="auto-reorganize-list-item-top">
        <strong>Choose a follow-up direction</strong>
        ${renderAutoReorganizeChip("Review only", "auto-reorganize-chip-low")}
      </div>
      <p class="muted">These controls capture what you want to do next without changing files now. They exist so this step can lead to a concrete, understandable follow-up instead of a passive review.</p>
      <div class="auto-reorganize-step-card-grid">
        <article class="proposal-card nested auto-reorganize-step-card">
          <div class="auto-reorganize-list-item-top">
            <strong>Front door plan</strong>
            ${renderAutoReorganizeChip(`${landingCleanup.landingPages?.length || 0} landing page(s)`, "auto-reorganize-chip-balanced")}
          </div>
          <p class="muted">Keep one landing page as the clear front door and turn off extra landing-page competition later.</p>
          ${landingCleanup.landingPages?.length ? `
            <label class="editor-field">
              <span>Keep this page as the front door</span>
              <select data-auto-reorganize-landing-action="primary-landing-page">
                <option value="">No front-door follow-up selected</option>
                ${landingCleanup.landingPages.map((page) => `
                  <option
                    value="${escape(page.id || "")}"
                    data-auto-reorganize-landing-page-option
                    data-auto-reorganize-landing-page-title="${escape(page.title || page.id || "")}"
                    ${normalizedLandingActionSelections["primary-landing-page"] === String(page.id || "") ? "selected" : ""}
                  >
                    ${escape(page.title || page.id || "Untitled")}
                  </option>
                `).join("")}
              </select>
            </label>
          ` : `<p class="muted">No landing pages were detected, so this follow-up stays unavailable for now.</p>`}
          ${primaryLandingChoice ? `<p class="muted">Current best candidate from the proposal: ${escape(primaryLandingChoice.title || primaryLandingChoice.id || "Untitled")}.</p>` : ""}
        </article>
        <article class="proposal-card nested auto-reorganize-step-card">
          <div class="auto-reorganize-list-item-top">
            <strong>Loose root page plan</strong>
            ${renderAutoReorganizeChip(`${landingCleanup.rootPages?.length || 0} loose root page(s)`, "auto-reorganize-chip-medium")}
          </div>
          <p class="muted">Merge loose root content into a configured category and turn off root-level clutter later. This remains a review note only in the current slice.</p>
          ${configuredCategories.length ? `
            <label class="editor-field">
              <span>Merge loose root content into category</span>
              <select data-auto-reorganize-landing-action="root-merge-category">
                <option value="">No loose-root follow-up selected</option>
                ${configuredCategories.map((category) => `
                  <option
                    value="${escape(category)}"
                    data-auto-reorganize-configured-category-option
                    ${normalizedLandingActionSelections["root-merge-category"] === String(category || "") ? "selected" : ""}
                  >
                    ${escape(humanizeSlug(category))}
                  </option>
                `).join("")}
              </select>
            </label>
          ` : `<p class="muted">This project has no configured categories enabled right now, so there is nowhere explicit to route loose root content.</p>`}
          <div class="auto-reorganize-step-summary-list">
            ${(landingCleanup.rootPages || []).slice(0, 5).map((page) => `
              <div data-auto-reorganize-root-page-summary="${escape(page.id || "")}">
                <span>${escape(page.title || page.id || "Untitled")}</span>
                <strong>${escape(page.category || "root")}</strong>
              </div>
            `).join("")}
          </div>
        </article>
      </div>
    </section>
    ${renderLandingCleanupActionSummary(landingCleanup, configuredCategories, normalizedLandingActionSelections, escape)}
  `;

  const projectExperienceBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">This step looks at the project the way a visitor would. It asks what should appear first, what Home should emphasize, and which structure or presentation changes would make the project easier to understand.</p>
    </div>
    <section class="proposal-card auto-reorganize-step-card">
      <div class="auto-reorganize-list-item-top">
        <strong>Project experience summary</strong>
        ${renderAutoReorganizeChip(`${projectExperienceReview.signals?.length || 0} signals`, "auto-reorganize-chip-balanced")}
      </div>
      <p>${escape(projectExperienceReview.summary || "No project-experience summary was generated.")}</p>
      <div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
        ${(Array.isArray(projectExperienceReview.signals) ? projectExperienceReview.signals : []).map((signal) => renderAutoReorganizeChip(signal, "auto-reorganize-chip-balanced")).join("")}
      </div>
    </section>
    <div class="auto-reorganize-step-card-grid">
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Recommended Home priorities</strong>
          ${renderAutoReorganizeChip(`${projectExperienceReview.homePriorities?.length || 0} items`, "auto-reorganize-chip-balanced")}
        </div>
        ${renderProjectExperienceRecommendationList(projectExperienceReview.homePriorities, "No Home priorities were generated.", escape)}
      </article>
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Landing and overview emphasis</strong>
          ${renderAutoReorganizeChip(`${projectExperienceReview.landingEmphasis?.length || 0} items`, "auto-reorganize-chip-medium")}
        </div>
        ${renderProjectExperienceRecommendationList(projectExperienceReview.landingEmphasis, "No landing emphasis guidance was generated.", escape)}
      </article>
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>What should be surfaced first</strong>
          ${renderAutoReorganizeChip(`${projectExperienceReview.surfaceFirst?.length || 0} items`, "auto-reorganize-chip-balanced")}
        </div>
        ${renderProjectExperienceRecommendationList(projectExperienceReview.surfaceFirst, "No first-surface guidance was generated.", escape)}
      </article>
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>Structure and display changes</strong>
          ${renderAutoReorganizeChip(`${projectExperienceReview.structureDisplayChanges?.length || 0} items`, "auto-reorganize-chip-medium")}
        </div>
        ${renderProjectExperienceRecommendationList(projectExperienceReview.structureDisplayChanges, "No structure or display changes were generated.", escape)}
      </article>
    </div>
  `;

  const categoryReviewBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">Some sections are doing a lot of work, while others are barely used. This review helps you spot areas that may eventually need to be split, merged, or cleaned up. Nothing changes in this step.</p>
    </div>
    ${renderList(categoryReview, "No category review entries were generated.", (item) => `
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>${escape(item.category || "uncategorized")}</strong>
          ${renderAutoReorganizeChip(item.status || "review", item.status === "dense" ? "auto-reorganize-chip-high" : "auto-reorganize-chip-low")}
        </div>
        <p>${escape(item.status || "review")} · ${escape(item.action || "review")}</p>
        <p class="muted">${escape(item.reason || "")}</p>
        ${renderList(item.samplePages, "No sample pages available.", renderPageSummary)}
      </article>
    `)}
  `;

  const categoryChangesBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">These are category-level ideas based on the current project shape. Nothing changes automatically. Mark each one so the final review can show which ideas feel worth pursuing later, which ones should wait, and which ones still need more evidence.</p>
    </div>
    ${renderList(categoryChanges, "No category change suggestions were generated.", (item) => `
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>${escape(item.category || "uncategorized")}</strong>
          ${renderAutoReorganizeChip(item.action || "review", "auto-reorganize-chip-medium")}
        </div>
        <p>${escape(item.action || "review")} · ${escape(String(item.pageCount ?? 0))} pages</p>
        <p class="muted">${escape(item.reason || "")}</p>
        ${item.suggestedTargetCategory ? `<p class="muted">Suggested target: ${escape(item.suggestedTargetCategory)} · ${escape(String(item.targetEvidenceCount || 0))} supporting move candidate(s)</p>` : ""}
        ${renderList(item.targetEvidence, "", (evidence) => `<p class="muted">${escape(evidence)}</p>`)}
        ${renderList(item.samplePages, "No sample pages available.", renderPageSummary)}
        ${renderCategoryChangeDispositionControls(item, normalizedCategoryChangeDispositions, escape)}
      </article>
    `)}
  `;

  const moveCandidatesBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">These pages may fit better in a different section. Check the moves you agree with, then go to the last step to apply only those checked moves. Suggestions that are blocked or still too uncertain stay visible for context, but they won't run.</p>
      <div class="auto-reorganize-chip-row auto-reorganize-chip-row-left">
        ${renderAutoReorganizeChip(`${moveConfidenceCounts.high || 0} high confidence`, "auto-reorganize-chip-high")}
        ${renderAutoReorganizeChip(`${moveConfidenceCounts.medium || 0} medium`, "auto-reorganize-chip-medium")}
        ${renderAutoReorganizeChip(`${moveConfidenceCounts.low || 0} low`, "auto-reorganize-chip-low")}
        ${renderAutoReorganizeChip(`${moveBatchCounts.applyReady || 0} ready to apply`, "auto-reorganize-chip-balanced")}
      </div>
    </div>
    ${renderAutoReorganizeMoveFocusControls(project, moveCandidates, normalizedMoveCandidateFocus)}
    ${renderAutoReorganizeMoveBatchControls(moveCandidates, normalizedMoveCandidateFocus)}
    ${moveCandidateGroups.length ? `
      <div class="auto-reorganize-group-list">
        ${moveCandidateGroups.map((group) => `
          <article class="proposal-card auto-reorganize-step-card" data-auto-reorganize-move-group>
            <div class="auto-reorganize-list-item-top">
              <strong>${escape(group.suggestedCategory || "uncategorized")}</strong>
              ${renderAutoReorganizeChip(`${group.candidateCount || 0} candidate(s)`, `auto-reorganize-chip-${String(group.confidence || "unknown").toLowerCase()}`)}
            </div>
            ${renderAutoReorganizeMoveGroupStatusSummary(group)}
            <div class="proposal-card-list">
              ${renderList(group.candidates, "No move candidates in this group.", (item) => renderMoveCandidateCard(item, escape))}
            </div>
          </article>
        `).join("")}
      </div>
    ` : renderList(moveCandidates, "No page move candidates were generated.", (item) => renderMoveCandidateCard(item, escape))}
    <div class="empty-state compact" data-auto-reorganize-move-focus-empty hidden><p>${escape(buildAutoReorganizeMoveFocusEmptyMessage(normalizedMoveCandidateFocus))}</p></div>
  `;

  const duplicatesBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">These pages have very similar titles. Some may be duplicates, some may be related pages, and some may just need clearer naming. This step is for review only.</p>
    </div>
    ${renderList(duplicateGroups, "No duplicate title groups were found.", (item) => `
      <article class="proposal-card auto-reorganize-step-card">
        <div class="auto-reorganize-list-item-top">
          <strong>${escape(item.canonicalTitle || item.normalizedTitle || "Untitled")}</strong>
          ${renderAutoReorganizeChip(`${item.pageCount || 0} page(s)`, "auto-reorganize-chip-medium")}
        </div>
        <p>${escape(item.normalizedTitle || "")}</p>
        ${renderList(item.pages, "No duplicate pages available.", renderPageSummary)}
      </article>
    `)}
  `;

  const summaryBody = `
    <div class="auto-reorganize-step-intro">
      <p class="muted">This is the only step that can make changes. Review the checked moves below, then apply them if they still look right. Each run only affects the moves that are currently checked and still allowed by the current safety rules.</p>
    </div>
    <section class="proposal-card auto-reorganize-apply-action-card">
      <div class="auto-reorganize-list-item-top">
        <strong>${moveBatchCounts.applyReady ? "Apply your selected moves" : "No moves ready to apply"}</strong>
        ${renderAutoReorganizeChip(`${moveBatchCounts.applyReady} ready`, moveBatchCounts.applyReady ? "auto-reorganize-chip-balanced" : "auto-reorganize-chip-low")}
      </div>
      <p class="muted">${moveBatchCounts.applyReady
        ? "Only the moves you checked in the previous step will run. Blocked and review-only suggestions are never included."
        : "Go back to \"Pages to move,\" check any move suggestions you agree with, then return here."
      }</p>
      <form class="editor-form" data-auto-reorganize-apply-form>
        <div class="rename-actions">
          <button class="primary-button" type="submit" data-auto-reorganize-apply-button ${moveBatchCounts.applyReady ? "" : "disabled"}>
            Apply selected moves
          </button>
        </div>
      </form>
    </section>
    ${renderApprovalDriftSummary(approvalDriftSummary, escape)}
    ${renderApplyStatusSummary(applyResult, escape)}
    ${renderStatsSummary(summary, moveBatchCounts)}
    ${renderLandingCleanupActionSummary(landingCleanup, configuredCategories, normalizedLandingActionSelections, escape)}
    ${renderCategoryChangeDispositionSummary(categoryChanges, normalizedCategoryChangeDispositions, escape)}
    <section class="proposal-card auto-reorganize-step-card">
      <div class="auto-reorganize-list-item-top">
        <strong>What you decided</strong>
        ${renderAutoReorganizeChip(`${Object.keys(normalizedStepDecisions).length} of ${countAutoReorganizeDecisionSteps() - 1} steps marked`, "auto-reorganize-chip-balanced")}
      </div>
      <div class="auto-reorganize-step-summary-list">
        ${AUTO_REORGANIZE_WIZARD_STEPS
          .filter((step) => step.key !== "apply-summary")
          .map((step) => `<div><span>${escape(step.title)}</span><strong>${escape(getAutoReorganizeStepStatusLabel(step.key, normalizedStepDecisions))}</strong></div>`)
          .join("")}
      </div>
    </section>
  `;

  return `
    <section class="editor-panel auto-reorganize-proposal auto-reorganize-wizard" data-auto-reorganize-review="wizard" data-auto-reorganize-wizard data-auto-reorganize-current-step="${escape(normalizedCurrentWizardStep)}">
      <div class="card-header">
        <div>
          <p class="eyebrow">Auto reorganize</p>
          <h3>${escape(project.name || "Project proposal")}</h3>
        </div>
        <span class="filter-chip static">Wizard review</span>
      </div>
      <div class="auto-reorganize-wizard-shell">
        ${renderWizardProgress(normalizedCurrentWizardStep, normalizedStepDecisions)}
        <div class="auto-reorganize-wizard-main">
          ${renderWizardStep({
            stepKey: "quick-read",
            title: "Start with the big picture",
            eyebrow: "Quick read",
            body: quickReadBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            withDecision: false,
          })}
          ${renderWizardStep({
            stepKey: "landing-cleanup",
            title: "Front door and loose top-level pages",
            eyebrow: "Landing & structure",
            body: landingCleanupBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Choose a status once you've looked over the front-door pages and loose top-level pages.",
          })}
          ${renderWizardStep({
            stepKey: "project-experience",
            title: "What should people see first?",
            eyebrow: "Home & first view",
            body: projectExperienceBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Choose a status once you've reviewed the Home and first-view guidance.",
          })}
          ${renderWizardStep({
            stepKey: "category-review",
            title: "Which sections feel crowded or thin?",
            eyebrow: "Category health",
            body: categoryReviewBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Choose a status once you've looked through the current section balance.",
          })}
          ${renderWizardStep({
            stepKey: "category-changes",
            title: "Section changes to consider later",
            eyebrow: "Suggested changes",
            body: categoryChangesBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Choose a status once you've reviewed these read-only section suggestions.",
          })}
          ${renderWizardStep({
            stepKey: "move-candidates",
            title: "Choose the page moves you agree with",
            eyebrow: "Pages to move",
            body: moveCandidatesBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Check any move suggestions you agree with, then choose a status and continue to the final review.",
          })}
          ${renderWizardStep({
            stepKey: "duplicates",
            title: "Pages that may be easy to confuse",
            eyebrow: "Similar titles",
            body: duplicatesBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            decisionHint: "Choose a status after reviewing the similar-title groups. No action is needed here.",
          })}
          ${renderWizardStep({
            stepKey: "apply-summary",
            title: "Review and apply checked moves",
            eyebrow: "Review & apply",
            body: summaryBody,
            currentStep: normalizedCurrentWizardStep,
            stepDecisions: normalizedStepDecisions,
            withDecision: false,
            isLast: true,
          })}
        </div>
      </div>
    </section>
  `;
}
