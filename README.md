# Book & Notes Vault
![Book & Notes Vault dashboard](assets/screenshot.png)

My summative project for Building Responsive UI. ...
An accessible, responsive book catalog built with vanilla HTML, CSS and JavaScript (ES modules). No frameworks, no build step.

- **Live site:** https://rayanimanzi.github.io/book-and-notes-vault-summative/
- **Theme:** 3. Book & Notes Vault


## Features

- **Dashboard:** total books and authors, total pages with reading time, top tag, pages added this month, 7-day bar chart.
- **Monthly budget (cap):** message is `aria-live="polite"` while under the budget and `"assertive"` when over.
- **Library:** table on tablet/desktop, cards on mobile. Sort by date, title, author or pages.
- **Regex search:** safe compile with `try/catch`, case-insensitive toggle, matches highlighted with `<mark>` after HTML-escaping.
- **Add / edit / delete:** regex-validated form, inline edit (Enter saves, Esc cancels), delete confirmation dialog.
- **ISBN extraction:** paste text such as `Back cover: ISBN 978-0-306-40615-7` into the ISBN field and only the valid ISBN is kept.
- **Persistence:** auto-saves to `localStorage` (`vault:books`, `vault:settings`).
- **Import / export:** JSON export; import is validated (types, regex rules, ISBN checksum, ids, timestamps) before anything is replaced.
- **Units:** reading speed in pages/hour, time shown in hours or minutes, pages/minutes/hours converter.
- **Responsive:** mobile-first with breakpoints at 360px, 768px and 1024px. Dark mode and reduced motion supported.


## Regex catalog (`scripts/validators.js`)

| Rule | Pattern | Passes | Fails |
|---|---|---|---|
| No leading/trailing spaces | `/^\S(?:[\s\S]*\S)?$/` | `Dune` | ` Dune` |
| No double spaces | `/\s{2,}/` (must not match) | `Clean Code` | `Clean  Code` |
| Pages (number) | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` + `/^[1-9]\d*$/` | `412` | `012`, `12.5`, `0` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` + real-date check | `2024-02-29` | `2025-02-30` |
| Tag | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Non-fiction` | `Sci-Fi2` |
| Author (Unicode) | `\p{L}` names joined by `, ` or ` & ` | `Ngũgĩ wa Thiong'o` | `Jane1` |
| **Back-reference:** repeated word | `/\b(\w+)\s+\1\b/` | `the theory` | `Into the the Wild` |
| **Back-reference:** repeated author | `/(?:^\|, \| & )([^,&]+)…\1(?=$\|, \| & )/` | `Will Durant & Ariel Durant` | `Jane Doe & Jane Doe` |
| **Lookahead:** ISBN-10/13 digit count | `/^(?:(?=(?:\D*\d){13}$)97[89]…\|(?=(?:[^\dX]*[\dX]){10}$)…)$/` + checksum | `978-0-306-40615-7` | `978030640615` |
| **Lookbehind/lookahead:** ISBN extraction | `/(?<![\d-])(?:97[89]-?)?(?:\d-?){9}[\dX](?![\d-])/g` | finds ISBNs in text | ignores `0788123456` |

**Search patterns to try:** `achebe|adichie`, `^97[89]`, `\b\d{2}:\d{2}\b`, `^2026-10`, `(?<=ISBN )[\d-]+`, and `(` (shows an error, no crash).

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move through links, buttons and fields |
| `Enter` on "Skip to main content" | Jump to the main content |
| `/` | Go to Library search |
| `n` | Go to Add book |
| `Esc` | Clear search / cancel edit / close dialog |
| `Enter` | Save an edited

## Accessibility

- Landmarks (`header`, `nav`, `main`, `section`, `footer`), skip link, one `h1` per page.
- Focus moves to each page heading; visible `:focus-visible` outline.
- Every input has a `<label>`; errors use `aria-describedby` and `aria-invalid`.
- Live regions announce sorts, edits, deletes and the budget status.
- Chart bars have screen-reader text; dark mode and reduced motion respected.

## Run and test

ES modules need a server: open the folder in VS Code and use **Live Server** (or `python3 -m http.server`). Open `tests.html` to run the unit tests.

## Data

`seed.json` holds 10 sample books with edge cases: a leap day, a 1-page and a 4,215-page book, Unicode authors, an ISBN inside notes, and an HTML-looking title.

## Author

- GitHub: [@rayanimanzi](https://github.com/rayanimanzi)
- Email: r.mugangaim@alustudent.com