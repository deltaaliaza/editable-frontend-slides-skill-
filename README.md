# Editable Frontend Slides Skill

Codex skill for adding a reusable in-browser editing layer to zero-dependency HTML slide decks, especially decks created with the `frontend-slides` skill.

The skill keeps presentation design work separate from editing mechanics:

1. Use `frontend-slides` to create or refine the 16:9 HTML deck.
2. Use `editable-frontend-slides` to inject text editing, object positioning, image crop controls, table resizing, and portable HTML export.

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

