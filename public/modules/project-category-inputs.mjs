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

export function renderProjectCategoryInputs(selectedCategories = [], isCreate = false, projectName = "", projectTemplates = []) {
  const selected = new Set((selectedCategories || []).map((item) => String(item)));
  const categories = Array.from(new Set([
    ...projectTemplates.flatMap((template) => template.categories || []),
    ...selected,
  ])).sort();

  return categories.map((category) => `
    <label class="project-category-chip ${selected.has(category) ? "active" : ""}">
      <input
        type="checkbox"
        name="categories"
        value="${escapeHtml(category)}"
        ${selected.has(category) ? "checked" : ""}
        ${isCreate ? 'data-scope="create"' : `data-project-name="${escapeHtml(projectName)}"`}
      />
      <span>${escapeHtml(formatProjectName(category))}</span>
    </label>
  `).join("");
}
