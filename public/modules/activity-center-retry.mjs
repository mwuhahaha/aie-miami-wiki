export function buildActivityCenterRetryOutput(thread) {
  const retryPayload = thread?.retryPayload || {};
  return [
    "Retrying AI draft job from saved compose inputs...",
    "",
    `Category: ${thread?.category || retryPayload.category || "unknown"}`,
    retryPayload.titleHint ? `Target title: ${retryPayload.titleHint}` : "Target title: AI decides",
    (thread?.url || retryPayload.url) ? `URL: ${thread?.url || retryPayload.url}` : "URL: none",
    retryPayload.importFileName ? `Supporting file: ${retryPayload.importFileName}` : "Supporting file: none",
    retryPayload.imageName ? `Image: ${retryPayload.imageName}` : "Image: none",
  ].join("\n");
}
