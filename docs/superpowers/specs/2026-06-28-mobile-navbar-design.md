# Mobile Navbar Simplification Design

**Date:** 2026-06-28

## Requirements

1. **Recommend button on mobile**: Show only "+" icon, hide "推荐网站" text below `lg` breakpoint.
2. **Search on mobile**: Replace inline search box with a search icon button. Click opens a centered search modal with backdrop.

## Design

### File

- `src/components/Navbar.tsx` only.

### Recommend Button

- Text "推荐网站" wrapped in `<span className="hidden lg:inline">`.
- On mobile (`< lg`): button shows just `+`.
- Desktop (≥ `lg`): unchanged `+ 推荐网站`.

### Search

**Desktop (≥ `lg`):** unchanged — inline search input with ⌘K badge.

**Mobile (`< lg`):**
- Search input hidden (`hidden lg:block` on the form).
- Search icon button `🔍` shown instead (`lg:hidden`).
- Click icon → opens modal:
  - **Backdrop**: `fixed inset-0 bg-black/50 z-50`, click closes.
  - **Modal**: centered white rounded card with search input (auto-focused) + hint text "输入关键词搜索网站".
  - **Submit**: Enter key navigates to `/search?q=xxx`.
  - **Close**: Click backdrop or press Esc.

**State:**
- `searchOpen` boolean state.
- `useRef` on input for auto-focus on open.
- `useEffect` for Esc key listener when modal is open.

## Breakpoints

| Breakpoint | Search | Recommend Button |
|-----------|--------|-----------------|
| < `lg` | Icon → modal | "+" only |
| ≥ `lg` | Inline input + ⌘K | "+ 推荐网站" |
