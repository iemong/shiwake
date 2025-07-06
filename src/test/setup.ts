import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
})

// グローバルなモック設定
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// File System Access API のモック
Object.defineProperty(window, 'showDirectoryPicker', {
  writable: true,
  value: vi.fn(),
})

// crossOriginIsolated のモック
Object.defineProperty(window, 'crossOriginIsolated', {
  writable: true,
  value: true,
})