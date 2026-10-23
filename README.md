# Yujie Zheng — Portfolio

Static portfolio site (no build step). Published with GitHub Pages.

- `index.html` — page structure, hero copy, about text, meta/OG tags
- `projects.js` — project titles, categories, descriptions, image captions
- `styles.css` — colours, type, layout, responsive rules
- `app.js` — filtering, project dialog, index dialog, particle artwork
- `assets/` — 6 covers, 18 process images, social preview image

## Local preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory, then open http://localhost:8000/. No dependencies or build step are needed.

## Languages and presentation

- The header’s 中 / EN controls switch the site language. The first visit follows the browser language; subsequent visits use the saved preference when browser storage is available.
- `translations.js` contains English and Chinese interface text, biography, metadata and accessibility labels. `projects.js` contains English project copy and its Chinese counterparts.
- Every project’s `slides` array specifies image order: `[3, 2, 1]` presents the final outcome before development and exploration. Captions remain tied to their original numbered images.
- Covers use the original artwork in a shared neutral editorial frame. Project boards retain their original embedded text; descriptions and image captions are bilingual.
- The introduction between the hero and selected work contains the designer’s background and statement. Responsive spacing and typography are defined in `styles.css`.
