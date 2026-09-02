const PREFIX = 'agroneon_'

export function storeUser(user) {
  localStorage.setItem(`${PREFIX}user`, JSON.stringify(user))
}

export function getStoredUser() {
  const data = localStorage.getItem(`${PREFIX}user`)
  return data ? JSON.parse(data) : null
}

export function clearStoredUser() {
  localStorage.removeItem(`${PREFIX}user`)
}

export function storeFarm(farm) {
  localStorage.setItem(`${PREFIX}farm`, JSON.stringify(farm))
}

export function getStoredFarm() {
  const data = localStorage.getItem(`${PREFIX}farm`)
  return data ? JSON.parse(data) : null
}

export function storeSoilReport(report) {
  localStorage.setItem(`${PREFIX}soil_report`, JSON.stringify(report))
}

export function getStoredSoilReport() {
  const data = localStorage.getItem(`${PREFIX}soil_report`)
  return data ? JSON.parse(data) : null
}

export function storeSelectedCrop(crop) {
  localStorage.setItem(`${PREFIX}selected_crop`, JSON.stringify(crop))
}

export function getStoredSelectedCrop() {
  const data = localStorage.getItem(`${PREFIX}selected_crop`)
  return data ? JSON.parse(data) : null
}

export function storeRecommendations(recs) {
  localStorage.setItem(`${PREFIX}recommendations`, JSON.stringify(recs))
}

export function getStoredRecommendations() {
  const data = localStorage.getItem(`${PREFIX}recommendations`)
  return data ? JSON.parse(data) : null
}

export function storeFarmingPlan(plan) {
  localStorage.setItem(`${PREFIX}farming_plan`, JSON.stringify(plan))
}

export function getStoredFarmingPlan() {
  const data = localStorage.getItem(`${PREFIX}farming_plan`)
  return data ? JSON.parse(data) : null
}

export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}
