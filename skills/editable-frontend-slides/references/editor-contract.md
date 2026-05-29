# Editor Contract

This contract describes the reusable editable HTML slide layer.

## Expected Deck Shape

- Single HTML file.
- Fixed slide stage, normally `.deck-stage` or `[data-deck-stage]`.
- Slides are `.slide` elements.
- Existing slide navigation should remain untouched.
- Existing `data-editable="true"` content must keep working.

## Runtime State

Use an embedded state script:

```html
<script id="editable-frontend-slides-state">
window.__EDITABLE_FRONTEND_SLIDES_STATE__ = {...};
</script>
```

State should include:

- `__meta.version`
- `__meta.exportId`
- `__meta.exportedAt`
- `texts`
- `layout`

Use `exportId` to prevent older localStorage from overriding newly exported embedded state.

## Editable Text

Mark visible slide text leaf nodes with:

```html
data-editable="true"
data-efs-inline-only="true"
data-edit-id="auto-..."
```

Leaf text nodes include common headings, paragraphs, list items, strong labels, spans, and simple div cells.

Do not mark:

- Editor UI
- Selection overlay
- Image tools
- Crop frame internals
- Hidden or empty layout nodes

Existing author-declared editable elements keep stable legacy IDs for compatibility with old exports.

## Selectable Objects

Selectable layout objects include:

- Existing non-inline editable elements
- `.tile`
- `.step`
- `.db-card`
- `.callout`
- `.formula`
- `.matrix`
- `.workflow`
- `.dark-panel`
- `.top-title`
- image crop frames

Inline-only text should not become a separate draggable object.

## Tables and Matrices

Tables/matrices need special event handling:

- Cell text remains inline editable.
- Clicking inside a matrix must still select the outer `.matrix` object.
- This enables resize handles for the whole table.

Do not apply the generic "editable child prevents parent selection" rule to `.matrix`.

## Images

Images may be wrapped in a crop frame if they match:

- `img.screenshot`
- `.image-strip img`
- `[data-efs-crop]`

Crop frame requirements:

- Preserve natural image ratio.
- Clear old `width`, `height`, `max-width`, `max-height`, `object-fit`, and related layout styles on the inner image.
- Provide fit, fill, original ratio, reset, replace, drag pan, wheel zoom, and `Alt+Arrow` pan.

## Export

Export must:

1. Use the original HTML snapshot captured before runtime DOM mutation.
2. Remove old embedded editor state scripts.
3. Insert one fresh embedded state script into `<head>`.
4. Escape serialized JSON:
   - `<` to `\u003c`
   - U+2028 to `\u2028`
   - U+2029 to `\u2029`
5. Build script tags without literal `</script>` inside JavaScript string literals:

```js
const openTag = "<scr" + "ipt id=\"editable-frontend-slides-state\">";
const closeTag = "</scr" + "ipt>";
```

Never export the mutated runtime DOM as the source of truth.

