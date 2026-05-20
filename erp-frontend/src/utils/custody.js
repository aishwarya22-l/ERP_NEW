export const CUSTODY_LEVEL_LABELS = {
  healthy: "Healthy",
  watch: "Watch",
  high: "High Risk",
};

export function indexCustodyByAsset(items = []) {
  return items.reduce((acc, item) => {
    acc[String(item.asset_id)] = item;
    return acc;
  }, {});
}

export function getCustodyLevelLabel(level) {
  return CUSTODY_LEVEL_LABELS[level] || "Unknown";
}

