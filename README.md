# Editable Frontend Slides Skill

Codex skill for adding a reusable in-browser editing layer to zero-dependency HTML slide decks. It is designed as a companion extension for decks created with the `frontend-slides` skill.

## Relationship To `frontend-slides`

This repository builds on the presentation architecture and workflow established by `frontend-slides`: fixed 16:9 HTML slides, browser-native rendering, local assets, and self-contained exportable decks.

`editable-frontend-slides` does not replace `frontend-slides`. It adds a reusable editing layer after a deck has already been designed, so authors can adjust text, move objects, resize tables, crop images, replace images, and export a portable HTML file from the browser.

The skill keeps presentation design work separate from editing mechanics:

1. Use `frontend-slides` to create or refine the 16:9 HTML deck.
2. Use `editable-frontend-slides` to inject text editing, object positioning, image crop controls, table resizing, and portable HTML export.

This repository does not redistribute the `frontend-slides` source code. It is an independent companion skill intended to work with compatible HTML decks.

## Acknowledgements

With thanks to Zara Zhang and the `frontend-slides` skill/project for the original HTML presentation workflow and architecture that this skill is designed to extend.

## Repository Layout

```text
skills/
  editable-frontend-slides/
    SKILL.md
    agents/openai.yaml
    assets/editable-slides-small.svg
    references/editor-contract.md
    references/validation-checklist.md
    scripts/audit_editable_deck.js
    scripts/inject_editable_layer.js
```

## Install From GitHub

After uploading this repository to GitHub, install the skill by asking Codex:

```text
Use $skill-installer to install https://github.com/<owner>/<repo>/tree/main/skills/editable-frontend-slides
```

Restart Codex after installation so the skill is discovered.

## Local Development Install

Copy the skill folder into your Codex skills directory:

```powershell
Copy-Item -Recurse -Force .\skills\editable-frontend-slides "$env:USERPROFILE\.codex\skills\editable-frontend-slides"
```

Restart Codex after copying.

## Script Usage

Inject the editor layer into an existing HTML deck:

```powershell
node .\skills\editable-frontend-slides\scripts\inject_editable_layer.js input.html output-editable.html
```

Audit an editable deck:

```powershell
node .\skills\editable-frontend-slides\scripts\audit_editable_deck.js output-editable.html
```

Both scripts are dependency-free Node.js scripts.

## License

This repository is released under the MIT License. See [LICENSE](LICENSE).

The editable layer, helper scripts, references, and bundled assets created in this repository are covered by this license. `frontend-slides` is a separate MIT-licensed skill/project and is acknowledged above. If future work copies upstream code or assets directly, preserve the applicable upstream copyright and license notices.
