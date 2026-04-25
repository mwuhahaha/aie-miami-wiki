export function parseHash(rawHash = "") {
  const hash = String(rawHash || "").replace(/^#/, "");
  if (hash === "projects" || hash === "/projects") {
    return {
      project: null,
      view: "projects",
      mode: "",
      page: null,
    };
  }
  if (hash === "projects/new" || hash === "/projects/new") {
    return {
      project: null,
      view: "projects",
      mode: "new",
      page: null,
    };
  }
  const projectManageMatch = hash.match(/^\/?projects\/edit\/([^/]+)$/);
  if (projectManageMatch) {
    return {
      project: null,
      view: "projects",
      mode: "edit",
      selectedProject: decodeURIComponent(projectManageMatch[1]),
      page: null,
    };
  }
  if (hash === "quotes" || hash === "/quotes") {
    return {
      project: null,
      view: "all-quotes",
      page: null,
    };
  }
  if (hash === "calendar" || hash === "/calendar") {
    return {
      project: null,
      view: "calendar",
      page: null,
    };
  }
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] !== "project") {
    return {};
  }

  if (!parts[2]) {
    return {
      project: parts[1] ? decodeURIComponent(parts[1]) : null,
      view: "home",
      page: null,
    };
  }

  if (parts[2] === "places-by-country" && parts[3]) {
    return {
      project: parts[1] ? decodeURIComponent(parts[1]) : null,
      view: "places-by-country",
      country: decodeURIComponent(parts[3]),
      page: null,
    };
  }

  if (parts[2] === "category" && parts[3]) {
    return {
      project: parts[1] ? decodeURIComponent(parts[1]) : null,
      view: "category",
      category: decodeURIComponent(parts[3]),
      page: null,
    };
  }

  return {
    project: parts[1] ? decodeURIComponent(parts[1]) : null,
    view: ["home", "graph", "quotes", "chapters", "compose", "claude"].includes(parts[2]) ? parts[2] : "page",
    page: parts[2] === "page" && parts[3] ? decodeURIComponent(parts[3]) : null,
  };
}

export function buildCountryPlacesHash(projectName = "", country = "", fallbackProjectName = "") {
  return `/project/${encodeURIComponent(projectName || fallbackProjectName || "")}/places-by-country/${encodeURIComponent(country)}`;
}

export function buildProjectsHash(selectedProjectName = "") {
  const projectName = String(selectedProjectName || "").trim();
  return projectName
    ? `/projects/edit/${encodeURIComponent(projectName)}`
    : "/projects";
}

export function buildProjectViewHash(projectName = "", view = "home", pageId = "") {
  if (view === "page") {
    return `/project/${encodeURIComponent(projectName)}/page/${encodeURIComponent(pageId || "")}`;
  }
  return `/project/${encodeURIComponent(projectName)}/${encodeURIComponent(view)}`;
}
