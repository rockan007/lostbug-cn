# Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mobile navigation (hamburger menu + slide-out drawer) and hide "次访问" label on small screens.

**Architecture:** Four component changes: WebsiteCard hides label text on mobile, Navbar gets a hamburger button, Sidebar gets a mobile drawer mode with backdrop, and LayoutShell wires the state between them.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4

## Global Constraints

- Sidebar drawer/backdrop: `lg:hidden` (shown below 1024px)
- Jump count label hidden: `< sm` (640px)
- Follow existing component patterns (client components, Tailwind utility classes)

---

### Task 1: WebsiteCard — Hide "次访问" on mobile

**Files:**
- Modify: `src/components/WebsiteCard.tsx`

- [ ] **Step 1: Wrap "次访问" text in responsive span**

Change the jump count display section. Current code (lines 87-92):

```tsx
      {/* Jump count display */}
      <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
        <span className="font-medium tabular-nums">{displayCount}</span>
        <span className="text-xs">次访问</span>
      </div>
```

Replace with:

```tsx
      {/* Jump count display */}
      <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
        <span className="font-medium tabular-nums">{displayCount}</span>
        <span className="text-xs hidden sm:inline">次访问</span>
      </div>
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`, open http://localhost:3000, resize to < 640px width — confirm "次访问" is hidden and only the number shows.

- [ ] **Step 3: Commit**

```bash
git add src/components/WebsiteCard.tsx
git commit -m "feat: hide '次访问' label on mobile screens"
```

---

### Task 2: Navbar — Add hamburger button

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Add onMenuToggle prop and hamburger button**

Change the component signature and add a hamburger button before the logo.

Current component signature (line 6):

```tsx
export default function Navbar() {
```

Replace with:

```tsx
export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
```

Add hamburger button before the Logo link. Current (lines 22-24):

```tsx
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>
```

Replace with:

```tsx
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-600 shrink-0"
          aria-label="打开菜单"
        >
          ☰
        </button>
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`. At viewport < 1024px, hamburger button appears. At ≥ 1024px, it's hidden. Clicking it triggers `onMenuToggle` (verify via console.log in LayoutShell or observe no crash if prop is optional).

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add hamburger menu button to Navbar for mobile"
```

---

### Task 3: Sidebar — Add mobile drawer mode

**Files:**
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Add mobileOpen and onClose props**

Change component signature. Current (lines 23-31):

```tsx
export default function Sidebar({
  categories,
  open,
  onToggle,
}: {
  categories: Category[]
  open: boolean
  onToggle: () => void
}) {
```

Replace with:

```tsx
export default function Sidebar({
  categories,
  open,
  onToggle,
  mobileOpen = false,
  onClose,
}: {
  categories: Category[]
  open: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onClose?: () => void
}) {
```

- [ ] **Step 2: Add mobile drawer rendering before the return statement**

Insert after the `if (!mounted)` block and before the final return. The mobile drawer renders conditionally when `mobileOpen` is true, inside `lg:hidden`. Add this right before the final `return` statement:

```tsx
  // Mobile drawer (lg:hidden)
  if (mobileOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        {/* Drawer */}
        <aside className="lg:hidden fixed left-0 top-0 h-full w-48 bg-gray-50 shadow-lg z-50 flex flex-col overflow-y-auto p-3 gap-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">导航</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-200 text-gray-400 text-sm"
              aria-label="关闭菜单"
            >
              ✕
            </button>
          </div>

          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>🔥</span>
            <span>热门推荐</span>
          </Link>

          <div className="mt-2 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase px-3">分类</span>
          </div>

          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                pathname === `/category/${cat.slug}`
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{ICONS[cat.slug] ?? '📌'}</span>
              <span className="flex-1">{cat.name}</span>
              <span className="text-xs text-gray-400 tabular-nums">{cat.count}</span>
            </Link>
          ))}
        </aside>
      </>
    )
  }
```

Note: the existing desktop sidebar returns remain unchanged below this block (both the collapsed and expanded paths).

- [ ] **Step 2: Manual verification**

Run `npm run dev`. At viewport < 1024px, `mobileOpen={true}` should show the drawer with backdrop. Clicking backdrop or ✕ should close it. Selecting a link navigates and closes. At ≥ 1024px, mobile drawer is invisible.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add mobile slide-out drawer to Sidebar"
```

---

### Task 4: LayoutShell — Wire mobile menu state

**Files:**
- Modify: `src/components/LayoutShell.tsx`

- [ ] **Step 1: Add mobileMenuOpen state and wire props**

Add state and pass through to Navbar and Sidebar.

Add state after existing state declarations (line 21):

```tsx
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
```

Pass `onMenuToggle` to Navbar. Current (line 58):

```tsx
        <Navbar />
```

Replace with:

```tsx
        <Navbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
```

Pass `mobileOpen` and `onClose` to Sidebar. Current (lines 60-64):

```tsx
          <Sidebar
            categories={categories}
            open={sidebarOpen}
            onToggle={toggleSidebar}
          />
```

Replace with:

```tsx
          <Sidebar
            categories={categories}
            open={sidebarOpen}
            onToggle={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`. On mobile viewport (< 1024px):
1. Click hamburger (☰) → drawer slides out with backdrop
2. Click backdrop → drawer closes
3. Click ✕ → drawer closes
4. Click a category link → navigates, drawer closes
5. Desktop (≥ 1024px) → sidebar behaves as before, hamburger invisible

- [ ] **Step 3: Commit**

```bash
git add src/components/LayoutShell.tsx
git commit -m "feat: wire mobile menu state in LayoutShell"
```
