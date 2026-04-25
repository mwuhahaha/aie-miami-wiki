# AIE Wiki UX Improvement Plan

This plan collapses the five UX investigation reports into a progressive implementation sequence. The order is intentional: fix the public read-only contract and first-load clarity first, then improve navigation, content comprehension, graph exploration, accessibility, and finally richer conference-specific experiences.

## Principles

- Treat this app as the public read-only AI Engineer Miami 2026 wiki, not a generic personal wiki export.
- Remove or disable dead-end authoring/admin paths before improving secondary workflows.
- Prefer small, independently testable changes that preserve the existing static Express + client-module architecture.
- Make every UX claim match actual data. If the app says a connection is semantic, sourced, or person-matched, the backend should provide that reason.
- Keep improvements useful on mobile, keyboard, and screen-reader paths.

## Phase 1: Public Entrypoint And Read-Only Contract

Goal: make the first screen coherent and remove UI paths that cannot work in this standalone public build.

Tasks:

1. Route the bare project URL to Home.
   - Make `#/project/aie-miami-wiki` resolve to the same view as `#/project/aie-miami-wiki/home`.
   - Update README if needed so the documented URL matches the intended first-load experience.
   - Verify direct loads, refreshes, and hash changes.

2. Rebrand the static shell for AI Engineer Miami 2026.
   - Replace `Dylan's Wiki`, `Personal Knowledge Base`, and private-vault phrasing in `public/index.html`.
   - Use project metadata where practical, but keep the standalone shell coherent before data loads.
   - Ensure the brand, title, and supporting copy identify this as a public conference knowledge base.

3. Hide disabled global navigation.
   - Remove or hide global Calendar and root Quotes links when the standalone server returns disabled routes.
   - Keep project-scoped Quotes only if it resolves successfully and has useful content.

4. Enforce read-only UI rules.
   - Hide authoring/admin controls in public mode: New Entry, Add Project, Manage Projects, project config, fork/delete, category create, AI fill, auto-reorganize apply, relationship save, and any controls backed by mutating endpoints.
   - Keep read-only explanatory links only when they add value.
   - Verify mutating API routes still return `403` or `404`.

5. Remove the relationship save dead end.
   - Gate relationship section add buttons behind non-read-only project state, or convert them into read-only "suggest connection" information without a save action.
   - Make failure states impossible for normal public readers.

Acceptance checks:

- Starting from the README URL opens a branded conference Home.
- No visible public control leads to a known `403` mutation path.
- Calendar/global Quotes do not appear as dead navigation.
- The app still serves the wiki, page, quotes, graph, and read-only project APIs.

## Phase 2: Navigation, Active State, And Search Clarity

Goal: make orientation and discovery obvious before adding new content surfaces.

Tasks:

1. Add active states for primary navigation.
   - Home, Index, Graph, Quotes, and category views should visibly indicate the current location.
   - Keep sidebar page-link highlighting for article pages.

2. Synchronize category routes and filters.
   - Opening a category landing should update the category chip/filter state.
   - Decide whether category chips primarily open category pages or filter the sidebar; avoid two subtle adjacent targets with different meanings.

3. Clarify sidebar search scope.
   - Either label the field as filtering the page list, or make it drive visible grouped search results in the main content area.
   - If search remains sidebar-only, include result counts and keep current page/category views stable.

4. Resolve the Quotes category ambiguity.
   - Remove `quotes` from category chips if it has no category pages.
   - Keep project Quotes as a nav destination or root page, not both unless the difference is explicit.

5. Add counts to discovery controls.
   - Show category/page counts in chips or section headings.
   - Counts should reflect the current filter where useful.

Acceptance checks:

- The current view is visible without relying on hero text alone.
- Category navigation and sidebar filtering do not contradict each other.
- Search behavior matches its label.

## Phase 3: Home And Category Landing Experience

Goal: make the site feel designed for a conference rather than a generic card-grid wiki.

Tasks:

1. Build an event-native Home.
   - Lead with AI Engineer Miami 2026 summary, dates, location, source boundary, and official conference link.
   - Surface Day 1, Day 2, Talks, People, Tools, Companies, Topics, and Quotes as primary paths.
   - Incorporate useful overview/index content instead of only linking to it.

2. Replace weak "Recent Additions" semantics.
   - If filesystem creation time is not meaningful, replace "Recent Additions" with "Start Here", "Featured Paths", or curated/semantic highlights.
   - Avoid implying chronology unless the timestamp is trustworthy.

3. Special-case high-value category landings.
   - Talks: schedule/day grouping, speaker pairing, topic/tool chips.
   - People: speaker roster with talk links and affiliations where available.
   - Tools: group by company/topic/talk mentions.
   - Topics: theme clusters and representative talks.
   - Companies: company pages linked to people, tools, and talks.

4. Reduce card-grid sameness.
   - Keep cards for repeated items, but introduce schedule strips, quote callouts, speaker/talk pairings, source panels, and topic clusters where they communicate better.

Acceptance checks:

- Home provides clear starting paths for a first-time public reader.
- Talks and people are easier to browse than an alphabetical list.
- No panel title overstates the data behind it.

## Phase 4: Article Reading And Related Content

Goal: make individual wiki pages easier to read and easier to continue from.

Tasks:

1. Remove duplicated article titles.
   - If the hero already renders the page title, suppress the first markdown `h1` in article content or render it as visually hidden only when needed.

2. Add article section navigation.
   - Generate a compact in-page contents list from markdown headings for longer pages.
   - Keep it unobtrusive on short pages.

3. Improve source and transcript affordances.
   - Surface source references, transcript-derived context, and public-web supporting context consistently.
   - Make source-boundary language public-reader friendly.

4. Group related pages by reason.
   - Separate outgoing links, backlinks, mutual links, same talk/speaker/tool/topic where data exists.
   - Replace generic "semantic peers" copy unless real semantic reasons are computed.

5. Preserve unresolved wikilinks visibly.
   - Render unresolved wikilinks with the existing unresolved style instead of plain text.
   - In read-only mode, frame them as unavailable references, not create-page prompts.

Acceptance checks:

- Page starts are not repetitive.
- Related content answers "why this is connected."
- Unresolved links are discoverable and non-actionable in public mode.

## Phase 5: Graph And Network Exploration

Goal: turn the graph from decorative navigation into an understandable conference map.

Tasks:

1. Fix graph labels.
   - Use `node.title` in the graph renderers or add `label` to the graph API payload.
   - Verify full graph and focused graph both show readable labels.

2. Add basic graph comprehension controls.
   - Category legend.
   - Category filter.
   - Search/focus node.
   - Selected-node detail panel with title, category, excerpt, backlink/outlink counts, and open-page action.

3. Make relationship meaning visible.
   - Show edge direction and mutual-link status.
   - Replace title-only direction badges with visible labels or accessible text.

4. Add richer graph API metadata where needed.
   - Node degree, backlink count, outlink count.
   - Optional link reason if supported by existing index data.

5. Improve focused graph as local navigation.
   - Pin the current page visually.
   - Show direct versus second-degree relationships.
   - Provide a nearby list of connected pages for non-canvas navigation.

Acceptance checks:

- Graph nodes have labels.
- A user can filter or search the graph without reading code or guessing.
- Canvas information is available through text controls/details too.

## Phase 6: Accessibility, Responsive Behavior, And Visual System

Goal: make the improved app robust across keyboard, mobile, and assistive technology paths.

Tasks:

1. Add a shared focus-visible system.
   - Cover buttons, links, inputs, selects, textareas, page links, chips, graph controls, modal controls, and custom option rows.
   - Keep focus outlines visible against all panel backgrounds.

2. Create a shared modal helper.
   - Centralize open/close, previous-focus restore, focus trap, Escape handling, backdrop handling, and background `inert`.
   - Migrate activity, relationship, AI-fill, and auto-reorganize modals or remove hidden read-only modals entirely where no longer needed.

3. Add small-screen polish below existing breakpoints.
   - Single-column sidebar actions where needed.
   - Safer modal headers/actions on narrow screens.
   - Responsive graph height.
   - Toast and floating launcher spacing.
   - Long chip/button text wrapping without layout shifts.

4. Introduce category-aware visual accents.
   - Use restrained category colors/icons for Talks, People, Tools, Topics, Companies, Events, Resources.
   - Avoid making the UI a one-hue teal card system.

5. Consolidate common CSS primitives over time.
   - Normalize button, chip, panel, modal, form field, card, and empty-state patterns.
   - Keep feature-specific classes focused on layout and feature details.

Acceptance checks:

- Keyboard users can operate and exit all remaining modals.
- Focus location is always visible.
- Mobile layouts do not overlap or hide primary controls.

## Phase 7: Optional Richer Authoring/Admin Redesign

Goal: preserve future maintainability for the full private app without exposing these flows in the public build.

Only work on this phase after the public read-only app is correct.

Tasks:

1. Reframe Compose as a single intake flow.
   - Default to one primary source/input path.
   - Put YouTube-specific controls behind source-aware disclosure.
   - Show predicted title, source, selected category, suggested category, and final submit category in one routing panel.

2. Replace silent category auto-switching.
   - Use explicit "Apply suggested category" and "Keep selected category" actions.
   - Make final submit category visible at all times.

3. Add AI import/fill review panels.
   - Show current versus suggested values.
   - Include source/reason context.
   - Avoid silently overwriting project create/admin form values.

4. Reduce admin risk density.
   - Separate config from dangerous actions like fork/delete.
   - Make assistant actions visually distinct from save/delete actions.

5. Simplify Auto Reorganize.
   - Start with a visual summary of ready moves, blocked moves, duplicate clusters, and review-only ideas.
   - Let users browse freely and reserve required confirmation for apply.

Acceptance checks:

- These flows remain hidden in the public standalone build.
- In a writable build, category and AI suggestions are explicit, inspectable, and reversible.

## Suggested Subagent Prompt

Use this prompt when delegating implementation slices:

```text
You are working in /garage/projects/aie-miami.wiki.local.

Follow UX_IMPROVEMENT_PLAN.md. Pick one small, task-specific slice from the next unfinished phase, implement it autonomously, and stop when that slice is complete and verified. Do not take a broad refactor. Do not work on authoring/admin redesign before the public read-only phases are correct.

Constraints:
- This is the public read-only AI Engineer Miami 2026 wiki.
- Preserve AGENT.md rules: do not expose mutating authoring/admin controls in the public UI, and do not make mutating endpoints succeed.
- Keep edits scoped to the files needed for your slice.
- Match existing vanilla JS/module/CSS patterns.
- Prefer data-backed UX copy; do not claim semantic/person/source relationships unless the app provides that data.
- Preserve public wiki content and source-boundary expectations.

Workflow:
1. Read UX_IMPROVEMENT_PLAN.md, AGENT.md, and only the relevant source files.
2. State the exact slice you are taking, including phase and task number.
3. Implement the slice.
4. Run focused verification. At minimum, run the app or relevant command if practical, and inspect the affected route/state.
5. Report changed files, what changed, verification performed, and any follow-up task that should remain in the plan.

Good slice examples:
- Phase 1 task 1: route bare project hash to Home and update README.
- Phase 1 task 4: hide public New Entry/Add Project/Manage Project controls when `readOnly` is true.
- Phase 2 task 1: add active states for Home/Index/Graph/Quotes.
- Phase 5 task 1: fix graph labels in both full and focused graphs.
- Phase 6 task 1: add shared focus-visible styling for existing controls.

Avoid:
- Starting multiple phases at once.
- Rewriting the app architecture.
- Making private/writable admin flows visible in this standalone app.
- Editing generated wiki content unless the selected slice explicitly requires it.
```

