const KEY = 'glm_seen'

function getMap() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

export function hasSeen(feature) {
  return !!getMap()[feature]
}

export function markSeen(feature) {
  const map = getMap()
  map[feature] = 1
  localStorage.setItem(KEY, JSON.stringify(map))
}
