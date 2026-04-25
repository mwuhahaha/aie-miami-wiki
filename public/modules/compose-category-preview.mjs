export function renderComposeCategoryPreviewHtml(data, {
  selectedCategory = "",
  autoSyncState = null,
  suppressedSignature = "",
  routingSignature = "",
  escapeHtml = (value) => String(value || ""),
} = {}) {
  const submitted = data.submittedCategory || selectedCategory || "unknown";
  const effective = data.effectiveCategory || submitted;
  const hasOverride = Boolean(data.hasOverride || (submitted && effective && submitted !== effective));
  const reason = String(data.routingReason || "").replace(/^explicit-category-instruction:/, "explicit user instruction: ");
  const suggestionNotice = hasOverride && (!suppressedSignature || suppressedSignature !== routingSignature)
    ? `
      <div class="compose-category-preview-notice">
        <p><strong>Suggested category:</strong> ${escapeHtml(effective)}</p>
        <p class="muted">Preview found category evidence in the intake. Choose whether to apply it before submit.</p>
        <div class="compose-category-preview-actions">
          <button type="button" class="primary-button inline-action" data-compose-preview-action="apply-suggested">Apply suggested category</button>
          <button type="button" class="ghost-button inline-action" data-compose-preview-action="keep-selected">Keep selected category: ${escapeHtml(selectedCategory || submitted)}</button>
        </div>
      </div>
    `
    : "";
  const suppressedNotice = suppressedSignature && suppressedSignature === routingSignature
    ? `
      <div class="compose-category-preview-notice">
        <p><strong>Keeping your selected category:</strong> ${escapeHtml(selectedCategory || submitted)}</p>
      <p class="muted">The preview still detects ${escapeHtml(effective)}, but auto-switch is paused because you chose to keep the original category for this evidence.</p>
    </div>
  `
    : "";
  return `${suggestionNotice}${suppressedNotice}${hasOverride
    ? `
      <p><strong>Routing override:</strong> ${escapeHtml(submitted)} -> ${escapeHtml(effective)}</p>
      <p class="muted">${escapeHtml(reason || "explicit text instruction detected")}</p>
      ${data.routingEvidence ? `<p class="muted">Evidence: ${escapeHtml(data.routingEvidence)}</p>` : ""}
    `
    : `
      <p><strong>Detected category:</strong> ${escapeHtml(effective)}</p>
      <p class="muted">${data.routingEvidence
        ? `Evidence: ${escapeHtml(data.routingEvidence)}`
        : "No explicit category override detected yet; submit will use the selected category unless stronger text evidence appears."}</p>
    `}`;
}
