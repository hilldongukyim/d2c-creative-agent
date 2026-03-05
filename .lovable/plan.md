

## Twin Crew Portal Redesign Plan

This is a significant restructuring of the portal: reorganizing agents into 4 divisions, adding 2 new agents (Rex, Vera), removing Theo, extracting support agents into a floating widget, and applying a new visual design with division-specific accent colors.

### 1. Add New Agent Assets
- Copy `user-uploads://Rex.png` and `user-uploads://Vera.png` to `public/lovable-uploads/`

### 2. Create Floating Support Widget (`src/components/FloatingSupportWidget.tsx`)
- Fixed bottom-right button with headset/chat icon and "Support" label
- On click: slide-up panel with 3 agent cards (Mochi, Mell, Fiona)
- Mochi and Mell get green status dots; Fiona is grayed out with lock icon and "관리자 전용" tooltip
- Clicking active cards triggers their existing handlers (passed as props)
- Smooth slide-up animation via CSS transition, high z-index (z-50)
- Close on outside click or toggle

### 3. Rewrite `FunctionMap.tsx` — Division-Based Card Grid
Replace the current org chart structure with 4 division sections:

| Division | Accent Color | Agents |
|---|---|---|
| Market Intelligence | Blue #1d4ed8 | Maple, Mateo, Rex (NEW), Vera (NEW) |
| Content & Creative | LG Red #A50034 | Ben, Kai, Anita, Yumi, Milo |
| Personalization & CX | Teal #0d9488 | Clara, Luna |
| Platform & Operations | Slate #475569 | Noa, Candy |

Each division renders as a card section with:
- Colored header bar with division name
- Grid of agent cards showing: profile image, name, role, status indicator (green/yellow/red per existing logic)
- Rex and Vera get a pulsing red "NEW" badge
- Cards with URLs open in new tab on click; others show profile dialog or "Coming Soon"
- Staggered entrance animation on scroll (IntersectionObserver + CSS delays)
- Remove Theo, Mochi, Mell, Fiona from the grid entirely

### 4. Update `CoverPage.tsx`
- **Hero subtitle**: Add "D2C Overseas Sales & Marketing Group AI Agent Directory" below existing tagline
- **Stats bar**: Below hero, show 4 stats: Total Active Agents (count), Divisions (4), Teams (computed), Incoming (2 — Rex, Vera)
- **Remove** `SupportSection` from `FunctionMap` props; instead render `FloatingSupportWidget` at page level
- **Add** Rex and Vera to `crewProfiles` with their descriptions, roles, tags, active status, and action URLs
- **Remove** Theo from `crewProfiles`
- Pass support handlers (Mochi, Mell, Fiona dialogs) to `FloatingSupportWidget`

### 5. Update `FunctionMap.tsx` crew data
- Remove Theo from divisions data
- Add Rex and Vera profiles with descriptions and personality/tags
- Remove support agents (mochi, mell, fiona-admin) from the main grid

### 6. Mobile Responsiveness
- Division cards stack vertically on mobile
- Agent cards use 2-column grid on mobile, 3-4 on desktop
- Floating widget stays bottom-right with appropriate sizing
- Stats bar wraps to 2x2 grid on mobile

### Files to Create
- `src/components/FloatingSupportWidget.tsx`

### Files to Modify
- `src/pages/CoverPage.tsx` — hero subtitle, stats bar, Rex/Vera profiles, remove Theo, add floating widget
- `src/components/FunctionMap.tsx` — complete restructure to 4-division card grid layout

### Files Unchanged
- All existing agent dialog components, edge functions, and route pages remain intact

