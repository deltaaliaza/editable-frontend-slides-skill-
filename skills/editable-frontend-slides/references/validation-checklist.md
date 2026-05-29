# Validation Checklist

Run the audit script first:

```bash
node scripts/audit_editable_deck.js deck.html
```

Then manually verify in a browser.

## Static Checks

- HTML contains `.slide` elements.
- A fixed stage exists: `.deck-stage`, `#deckStage`, or `[data-deck-stage]`.
- Editor state script serialization is safe.
- Runtime editor script syntax passes.
- Export function exists.
- Text auto-editing logic exists.
- Inline-only text logic exists.
- Matrix/table exception exists.
- Image crop controls exist if the deck contains screenshots or image strips.

## Browser Checks

- Press `E`: edit controls appear and text outlines appear.
- Edit ordinary headings and paragraphs.
- Edit card text such as `.step strong`, `.tile p`, `.db-card strong`.
- Edit matrix/table cells.
- Select and resize the outer matrix/table.
- Select and resize/move cards, callouts, formulas, and title blocks.
- Use arrow keys to nudge selected objects.
- Replace an image from the image toolbar.
- Use fit/fill/original ratio/reset on images.
- Export, open the exported file, and verify edits persist.

## Regression Traps

- Do not let old localStorage override freshly exported state.
- Do not let `.screenshot` or `.image-strip img` CSS distort crop-frame images.
- Do not make every table cell a draggable layout object.
- Do not block matrix selection by clicking editable cell text.
- Do not insert a literal `<\/script>` into exported HTML.
- Do not export a black or blank file caused by a broken state script.

