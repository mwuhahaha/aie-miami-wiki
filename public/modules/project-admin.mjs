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

export function renderProjectManageListItem(project, active) {
  return `
    <button class="project-manage-item ${active ? "active" : ""}" data-project-manage-select="${escapeHtml(project.name)}" type="button">
      <strong>${escapeHtml(formatProjectName(project.name))}</strong>
      <span>${escapeHtml(project.description || project.genre || "No description")}</span>
      <small>${escapeHtml(String(project.pageCount || 0))} pages · ${escapeHtml((project.configuredCategories || project.categories || []).slice(0, 4).join(", ") || "no categories")}</small>
    </button>
  `;
}

export function renderRecencyBiasOptions(selectedValue = "neutral") {
  const options = [
    ["neutral", "Neutral"],
    ["prefer-newer", "Prefer Newer"],
    ["strongly-prefer-newer", "Strongly Prefer Newer"],
  ];
  return options
    .map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");
}
