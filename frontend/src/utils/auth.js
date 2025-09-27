// frontend/src/utils/auth.js
export function saveAuth(payload) {
  // payload: { token, user }
  localStorage.setItem('auth', JSON.stringify(payload))
}

export function clearAuth() {
  localStorage.removeItem('auth')
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem('auth'))
  } catch { return null }
}

export function getToken() {
  const a = getAuth()
  return a?.token || null
}

export function getUser() {
  const a = getAuth()
  return a?.user || null
}

export function logout() {
  clearAuth()
  window.location.href = '/login'
}
