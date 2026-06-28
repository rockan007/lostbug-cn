# Responsive Layout Design

**Date:** 2026-06-28

## Requirements

1. **Mobile navigation**: On screens < `lg` (1024px), add a hamburger menu button in Navbar that opens Sidebar as a left-sliding drawer with a backdrop overlay.
2. **Jump count on mobile**: On screens < `sm` (640px), hide the "次访问" label text, showing only the numeric count.

## Design

### Navbar — hamburger button

- Add a hamburger button (☰) `lg:hidden` at the left side of the navbar, next to the logo.
- Expose `onMenuToggle?: () => void` prop. Click calls `onMenuToggle`.

### Sidebar — mobile drawer mode

- New props: `mobileOpen: boolean`, `onClose?: () => void`.
- When `mobileOpen` is true, render (inside `lg:hidden`):
  - **Backdrop**: `<div>` with `fixed inset-0 bg-black/50 z-40`, `onClick` calls `onClose`.
  - **Drawer**: `fixed left-0 top-0 h-full w-48 bg-gray-50 shadow-lg z-50` with the same category list as the expanded desktop sidebar. Includes a close button (✕) at top right.
- The existing collapsed/expanded desktop sidebar behavior is unchanged.

### LayoutShell — state management

- Add `mobileMenuOpen` state (default `false`).
- Pass `onMenuToggle` to Navbar, `mobileOpen` + `onClose` (sets `mobileMenuOpen` to false) to Sidebar.

### WebsiteCard — responsive jump count

- Wrap `次访问` text in `<span className="hidden sm:inline">`, keeping only the number visible on screens < 640px.

## Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| < `sm` (640px) | Jump count shows number only, no "次访问" |
| < `lg` (1024px) | Hamburger button visible, sidebar hidden unless drawer is open |
| ≥ `lg` (1024px) | Sidebar visible as before, hamburger hidden |

## Files Changed

- `src/components/Navbar.tsx` — add hamburger button + `onMenuToggle` prop
- `src/components/Sidebar.tsx` — add mobile drawer mode with backdrop
- `src/components/LayoutShell.tsx` — manage `mobileMenuOpen` state, wire props
- `src/components/WebsiteCard.tsx` — hide "次访问" on mobile
