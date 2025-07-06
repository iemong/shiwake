# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a photo sorting PWA (Progressive Web App) for organizing JPEG/DNG photo pairs from SD cards. The app uses React with shadcn/ui components and a Rust/WASM core for high-performance image processing.

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui + Tailwind CSS (dark theme)
- **Core Processing**: Rust crate (`photo_sort_core`) compiled to WASM
- **File I/O**: File System Access API for browser-based file management
- **Target**: Chrome 122+ only (other browsers unsupported)

## Key Components

- `src/App.tsx`: Main application component with photo pair management
- `src/hooks/useFileSystemAccess.ts`: File system operations hook
- `src/wasm/`: Rust WASM module for image processing
- `src/components/PhotoGallery.tsx`: Photo display component
- `src/components/ui/`: shadcn/ui components

## Common Commands

```bash
# Development
pnpm dev                  # Start development server
pnpm build               # Build for production (includes WASM build)
pnpm preview             # Preview production build

# WASM Development
pnpm wasm:build          # Build WASM module for production
pnpm wasm:dev            # Build WASM module for development

# Testing
pnpm test                # Run Vitest tests
pnpm test:ui             # Run tests with UI
pnpm test:coverage       # Run tests with coverage

# Quality Checks
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript type checking

# Documentation
pnpm storybook           # Start Storybook dev server
pnpm build-storybook     # Build Storybook for production
```

## Development Workflow

1. **WASM Changes**: When modifying Rust code, run `pnpm wasm:build` before testing
2. **Cross-Origin Headers**: Development server includes COOP/COEP headers for SharedArrayBuffer support
3. **File System Access**: App requires `showDirectoryPicker()` API (Chrome-only)

## Testing

- **JavaScript**: Vitest with jsdom for React components
- **Rust**: `cargo test` and `wasm-bindgen-test` for WASM modules
- **E2E**: Manual testing with actual photo files

## Build Configuration

- **Vite**: Configured with WASM, top-level await, and React plugins
- **Rust**: Release builds use LTO and optimization level 3
- **Target**: ES2022+ for modern browser features

## Photo Processing

The app processes photos in pairs (JPEG + DNG with same basename):
- Scans directories for photo files
- Creates PhotoPair objects linking related files
- Supports move/delete operations on paired files
- Generates thumbnails via WASM module (future implementation)

## UI/UX Notes

- Dark theme only (`class="dark"` on body)
- Japanese language interface
- Toast notifications for user feedback
- Progress indicators for long operations
- Folder picker for directory selection