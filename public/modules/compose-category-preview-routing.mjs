export function buildComposeCategoryPreviewRoutingSignature(data = {}) {
  return [
    String(data.effectiveCategory || "").trim().toLowerCase(),
    String(data.routingReason || "").trim().toLowerCase(),
    String(data.routingEvidence || "").trim(),
  ].join("::");
}
