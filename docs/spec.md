# M1: Spec, Wireframes & A11y Plan

## 1. Purpose

A single-page app where a reader catalogs books (title, author, pages, tag, date added, optional ISBN and notes), searches the catalog with regular expressions, and keeps a monthly page budget so the to-read pile stays realistic. Everything runs in the browser and is saved to `localStorage`. There is no backend.

**Users:** students and readers on phones (primary) and laptops.
**Core jobs:** add a book in under 15 seconds, find books by author or tag, and see how much reading time the pile represents.

## 2. Sections

| Route | Section | Contents |
|---|---|---|
| `#dashboard` | Dashboard | 4 stat cards, budget meter, 7-day chart |
| `#records` | Library | Regex search, sort, table/cards, edit and delete |
| `#add` | Add book | Form: title, author, pages, date added, tag, ISBN, notes |
| `#settings` | Settings | Reading speed, converter, monthly budget, tags, import/export |
| `#about` | About | Purpose, contact, keyboard shortcuts | 
## 3. Data model

```js
// Book (stored in localStorage "vault:books" as an array)
{
  id: "book_0001",         // string, unique, sequential
  title: "Dune",           // trimmed, no double spaces, no repeated word
  author: "Frank Herbert", // one or more names, ", " or " & " separated
  pages: 412,              // whole number ≥ 1
  tag: "Fiction",          // letters/spaces/hyphens
  dateAdded: "2026-10-13", // YYYY-MM-DD, real calendar date
  isbn: "",                // optional ISBN-10/13, checksum-verified
  notes: "",               // optional, ≤ 500 chars, multi-line
  createdAt: "ISO-8601",   // set once
  updatedAt: "ISO-8601"    // refreshed on every edit
}

// Settings (localStorage "vault:settings")
{
  pagesPerHour: 30,              // reading speed for page ↔ time conversion
  timeUnit: "hours" | "minutes", // display unit for reading time
  target: 3500,                  // monthly page budget; 0 = none
  tags: ["Fiction","Non-fiction","Science","Tech","History","Biography"]
}
```

## 4. Wireframes

### Mobile (360px)

```
┌──────────────────────────┐
│ [▯] Book & Notes Vault [Menu]│
├──────────────────────────┤
│ Dashboard                 │
│ ┌──────────┐┌──────────┐ │
│ │Books  14 ││Pages 9k  │ │  ← stat cards, 2-up
│ │14 authors││≈300 h    │ │
│ └──────────┘└──────────┘ │
│ ┌──────────┐┌──────────┐ │
│ │Top  Tech ││Month 2.9k│ │
│ └──────────┘└──────────┘ │
│ ┌──────────────────────┐ │
│ │Monthly reading budget│ │
│ │[████████████░░]      │ │
│ │579 pages left of 3500│ │  ← aria-live
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │Last 7 days           │ │
│ │ █ ▆ ▁ ▇ ▃ ▂ ▃        │ │
│ │ W T F S S M T        │ │
│ └──────────────────────┘ │
└──────────────────────────┘

Library (mobile = cards)
┌──────────────────────────┐
│ Regex search [_________] │
│ ☑ Case-insensitive       │
│ Sort by [Date added ▾]   │
│ "3 of 14 books match"    │
│ ┌──────────────────────┐ │
│ │Added   2026-10-13    │ │
│ │Title   Things Fall…  │ │
│ │        ISBN 978-…    │ │
│ │        notes…        │ │
│ │Author  Chinua Achebe │ │
│ │Pages   209 ≈ 7 h     │ │
│ │Tag     (Fiction)     │ │
│ │[Edit] [Delete]       │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Tablet (768px) and desktop (1024px)

```
┌───────────────────────────────────────────────────────────────────┐
│ [▯] Book & Notes Vault     Dashboard Library Add book Settings About │
├───────────────────────────────────────────────────────────────────┤
│ Library                                                            │
│ ┌────────────────────────────────────────────────────────────────┐│
│ │ Regex search [_____________________] ☑ Case   Sort [▾]         ││
│ └────────────────────────────────────────────────────────────────┘│
│ ┌──────────┬────────────────┬────────────┬────────┬─────────┬─────┐│
│ │ Added ↓  │ Title ↕        │ Author ↕   │ Pages ↕│ Tag     │     ││
│ ├──────────┼────────────────┼────────────┼────────┼─────────┼─────┤│
│ │2026-10-13│ Things Fall…   │ C. Achebe  │   209  │(Fiction)│Edit ││
│ │          │ ISBN · notes   │            │ ≈ 7 h  │         │Del  ││
│ └──────────┴────────────────┴────────────┴────────┴─────────┴─────┘│
└───────────────────────────────────────────────────────────────────┘
At 768px the row buttons stack vertically so six columns fit; at ≥1024px they sit side by side.
Dashboard ≥768: 4 stat cards in a row; budget | chart side by side.
Settings ≥768: 2 columns of cards; ≥1024: 3 columns.
```

### Inline edit state

```
│[2026-10-13]│[Things Fall Apart]│[Chinua Achebe]│[209]│[Fiction]│[Save][Cancel]│
│            │                   │               │     │         │ ⚠ author: …  │  ← aria-describedby
```

## 5. Accessibility plan

| Concern | Plan |
|---|---|
| Structure | `header` / `nav` / `main` / `section` / `footer`; one `h1` per view |
| Bypass | Skip link → `<main>` |
| Keyboard | All controls are native elements. Shortcuts `/`, `n`, `Esc`, `Enter`. The only focus trap is the modal dialog (Esc closes it) |
| Focus | Visible 3px `:focus-visible` ring. On route change, focus goes to the page `h1`. After edit/delete, focus is restored sensibly |
| Forms | `<label for>` on every field; hints + errors via `aria-describedby`; `aria-invalid` |
| Announcements | Polite `role="status"` + assertive `role="alert"` regions; budget message switches politeness |
| Colour | AA contrast in light & dark; state is never shown by colour alone ("Over budget" is in the text) |
| Motion | Short transitions, all off under `prefers-reduced-motion` |
| Testing | axe-core scan + manual keyboard-only pass + screen-reader spot check |

## 6. Breakpoints

- **Base (<360px):** single column, stacked stat cards
- **≥360px:** 2-up stat cards
- **≥768px:** inline nav, real table with sortable headers, 2-column forms/settings, dashboard side by side
- **≥1024px:** wider gutters, taller chart, 3-column settings, inline row buttons