/* eslint-disable no-console */
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Mock URL APIs
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock scrollTo
window.scrollTo = jest.fn()

// Suppress console errors/warnings in tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    // Check if args[0] is a string before using includes
    if (typeof args[0] === 'string' && args[0].includes('Error:')) return
    originalError.call(console, ...args)
  }
  console.warn = (...args) => {
    // Check if args[0] is a string before using includes
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalWarn.call(console, ...args)
  }
})


afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})