import '@testing-library/jest-dom'

// Mock localStorage
const store = {}
const localStorageMock = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => { store[key] = String(val) },
  removeItem: (key) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Silence react-router-dom warnings in tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true
