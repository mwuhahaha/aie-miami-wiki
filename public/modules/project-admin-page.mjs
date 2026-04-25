export function renderProjectManagePage({
  projects = [],
  selectedProjectName = "",
  projectTemplates = [],
  renderProjectManageListItem = () => "",
  renderProjectAdminCard = () => "",
  renderProjectCategoryInputs = () => "",
  renderRecencyBiasOptions = () => "",
  icon = () => "",
  defaultProjectPath = () => "",
} = {}) {
  const selectedProject = projects.find((project) => project.name === selectedProjectName) || projects[0] || null;
  return `
    <div class="article-shell">
      <section class="project-manage-shell">
        <aside class="project-manage-list panel">
          <div class="card-header">
            <p class="eyebrow">Manage</p>
            <h3>Existing projects</h3>
          </div>
          <div class="project-manage-items">
            ${projects.map((project) => renderProjectManageListItem(project, selectedProject?.name === project.name)).join("") || `<div class="empty-state compact"><p>No projects configured yet.</p></div>`}
          </div>
        </aside>
        <section class="project-manage-detail">
          ${selectedProject ? renderProjectAdminCard(selectedProject, {
            projectTemplates,
            renderProjectCategoryInputs,
            renderRecencyBiasOptions,
            icon,
            defaultProjectPath,
          }) : `<div class="empty-state"><p>Select a project to edit, fork, or delete it.</p></div>`}
        </section>
      </section>
      <section class="card-stack">
        <div class="card-header">
          <p class="eyebrow">Add Project</p>
          <h3>Need a new one?</h3>
        </div>
        <div class="rename-actions">
          <a class="primary-button inline-action" href="#/projects/new">${icon("plus")} Create New Project</a>
        </div>
      </section>
    </div>
  `;
}
