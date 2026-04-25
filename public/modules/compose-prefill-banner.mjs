export function renderComposePrefillBannerHtml(prefill = {}, {
  escapeHtml = (value) => String(value || ""),
} = {}) {
  return `
    <div class="card-header">
      <p class="eyebrow">Prefilled Draft</p>
      <h3>${escapeHtml(prefill.banner || "")}</h3>
    </div>
    <p class="muted">${prefill.autoRun
    ? "Category is preselected to <strong>people</strong>. The draft is starting automatically with the canonical conference source and local evidence loaded below."
    : "Category is preselected to <strong>people</strong>. The canonical conference source and draft instructions are already loaded below; edit them if needed, then click <strong>Create Person Page</strong>."}</p>
  `;
}
