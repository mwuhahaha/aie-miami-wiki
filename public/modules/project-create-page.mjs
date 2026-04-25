function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderProjectCreatePage({
  projectTemplates = [],
  renderProjectCategoryInputs = () => "",
  renderRecencyBiasOptions = () => "",
  icon = () => "",
  defaultProjectPath = () => "",
} = {}) {
  const templateOptions = projectTemplates
    .map((template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.label)}</option>`)
    .join("");

  return `
    <div class="article-shell">
      <section id="project-create-panel" class="editor-panel project-create-panel-focus">
        <div class="card-header">
          <p class="eyebrow">Add Project</p>
          <h3>Create a new vault-backed project with genre defaults</h3>
        </div>
        <section class="project-import-panel">
          <div class="card-header">
            <p class="eyebrow">Import With AI</p>
            <h3>Paste notes or upload a markdown brief to prefill the project form</h3>
          </div>
          <form id="project-import-form" class="editor-form">
            <label class="field">
              <span>Paste markdown notes</span>
              <textarea name="markdown" rows="6" placeholder="Paste a project brief, messy notes, or an AI-generated markdown spec here"></textarea>
            </label>
            <label class="field">
              <span>Or upload a markdown file</span>
              <input name="importFile" type="file" accept=".md,.markdown,.txt" />
            </label>
            <div class="rename-actions">
              <button type="submit" class="ghost-button inline-action">${icon("robot")} Import With AI</button>
            </div>
          </form>
        </section>
        <form id="project-create-form" class="editor-form">
          <div class="rename-grid">
            <label class="field">
              <span>Project Name</span>
              <input name="name" type="text" placeholder="my-new-project" />
            </label>
            <label class="field">
              <span>Genre</span>
              <select name="genre">
                ${templateOptions}
              </select>
            </label>
          </div>
          <label class="field">
            <span>Path</span>
            <input name="path" type="text" value="${escapeHtml(defaultProjectPath(""))}" placeholder="${escapeHtml(defaultProjectPath("my-new-project"))}" />
          </label>
          <label class="field">
            <span>Project Description</span>
            <textarea name="description" rows="3" placeholder="What this project is about"></textarea>
          </label>
          <label class="field">
            <span>AI Filing Guidance</span>
            <textarea name="filingGuidance" rows="4" placeholder="Tell AI what belongs in this project and when recordings should be filed here"></textarea>
          </label>
          <label class="field">
            <span>Knowledge Priority Rules</span>
            <textarea name="knowledgePriority" rows="4" placeholder="Explain how the app should prioritize canonical sources, firsthand notes, newer resources, and conflicting opinions"></textarea>
          </label>
          <div class="rename-grid">
            <label class="field">
              <span>Resource Recency Bias</span>
              <select name="resourceRecencyBias">
                ${renderRecencyBiasOptions("neutral")}
              </select>
            </label>
            <label class="field">
              <span>Freshness Window (days)</span>
              <input name="resourceRecencyWindowDays" type="number" min="0" step="1" value="30" />
            </label>
          </div>
          <p class="muted">Example: for a conference project, a dated resource even 30 days newer can outrank an older opinionated summary when they conflict.</p>
          <div class="field">
            <span>Categories</span>
            <div class="project-category-grid">
              ${renderProjectCategoryInputs([], true, "", projectTemplates)}
            </div>
          </div>
          <div class="rename-grid">
            <label class="field">
              <span>Primary URL</span>
              <input name="primaryUrl" type="url" placeholder="https://example.com" />
            </label>
            <label class="field">
              <span>Primary Label</span>
              <input name="primaryLabel" type="text" placeholder="Official site" />
            </label>
          </div>
          <label class="field">
            <span>Primary Summary</span>
            <textarea name="primarySummary" rows="3" placeholder="Why this source matters for this project"></textarea>
          </label>
          <div class="rename-actions">
            <button type="submit" class="primary-button">${icon("plus")} Create Project</button>
          </div>
        </form>
      </section>
    </div>
  `;
}
