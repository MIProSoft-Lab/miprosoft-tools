# MIProSoft tools

A collection of static web tools for the everyday tasks of the MIProSoft research group, published with
GitHub Pages. Each tool lives in its own folder and has no build step. All tools share the group's look and
feel (see below), which follows the [group website](https://github.com/MIProSoft-Lab/miprosoft-site).

| Tool | Folder | Description |
| --- | --- | --- |
| Banner editor | [`banner-editor/`](banner-editor/) | Banners and social media images for courses, events, news…: background photo + gradient + logo + text. |

## Running locally

Any static server works, for example:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

(Opening the HTML files directly with `file://` may fail to load the logos into the canvas.)

## Publishing on GitHub Pages

The workflow in `.github/workflows/deploy.yml` publishes the tools on every push to `main` (it can also be
run by hand from the **Actions** tab). One-time setup:

1. Push the repository to GitHub.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`. The site will be at `https://<owner>.github.io/<repo>/`.

What the workflow does:

- **build**: copies the files the pages need into `_site/`, leaving out development material (original
  `.ai`/`.eps` logos, `sample/`, `scripts/` folders, Markdown files). It then runs `scripts/check_site.py`,
  which fails the run if a page links to a missing file or uses an absolute path (`/…`), which would break
  under `/<repo>/`. The list of published files is shown in the run's summary.
- **deploy**: publishes `_site/` to GitHub Pages, only from `main`.
- On pull requests it runs the build and checks, without publishing.
- Until Pages is set to "GitHub Actions", it skips publishing and says so in the run's summary.

To run the same check locally: `python3 scripts/check_site.py .`

## Look and feel

`assets/site.css` and `assets/site.js` hold everything the pages share, taken from the group website:

- the UIB visual identity: UIBsans (from `fonts/`), UIB blue `#0065bd`, the light blue tint, cards with a
  blue edge, headings with a short blue rule;
- the header (UIB top bar and the MIProSoft brand) and the black footer, added by `site.js`;
- light and dark themes, following the system or the toggle in the header. The choice is saved under the same
  key as the group website, so it carries over between both sites when they are served from the same domain.

## Adding a new tool

1. Create a folder, e.g. `my-tool/`, with its own `index.html` (and any CSS/JS/assets it needs).
2. In its `<head>`, link the shared files, then put the header where it goes:

   ```html
   <link rel="icon" type="image/png" href="../assets/logo.png">
   <link rel="stylesheet" href="../assets/site.css">
   <script src="../assets/site.js"></script>
   …
   <header data-site-header="compact"></header>   <!-- or data-site-header for the full header -->
   <footer data-site-footer></footer>             <!-- optional -->
   ```

   Use the CSS variables (`--accent`, `--tint`, `--rule`, `--muted`…) and the `.button` / `.button.secondary`
   classes so the tool works in both themes.
3. Add a card for it in the root `index.html` and a row in the table above.

## Research group logos

`scripts/build_group_logo.py` extends the UIB logo with a group or institution name after
"Universitat / de les Illes Balears": a black separator line with the same spacing as the original, then
two lines of text (UIBsans Bold / Regular) sized and aligned to match the university name. It writes
full-colour, positive and negative SVGs to `logos/<slug>/` and doesn't modify the original logos.
With `--both-bold`, both lines are bold at the same size and together fill the height of the UIB text block
(this is how the MIPro / Soft logo is built).

```sh
pip install fonttools uharfbuzz
python3 scripts/build_group_logo.py "MIPro" "Soft" --slug mipro-soft --both-bold
```

## Group icon

`assets/logo.svg` is the MIProSoft icon (UIB-blue rounded square, white bar, "MIPro / Soft" in UIBsans Bold,
text as outlines). `assets/logo.png` is the same icon at 512×512, for places that need a bitmap (favicon
fallback, share previews). To change it, edit the settings at the top of `scripts/build_team_icon.py` and run:

```sh
python3 scripts/build_team_icon.py      # needs fonttools and uharfbuzz, like build_group_logo.py
```

Then export `assets/logo.svg` to a 512×512 PNG with a transparent background (any SVG editor or browser).

## Banner editor

- **Background image**: choose a file, drop it on the preview or paste it. Drag the preview to reposition it and scroll to zoom.
- **Gradient**: two colours with their own opacity, angle and blend mode. Presets come in groups: the original
  sample-banner gradients; combinations from the UIB secondary palette in the same style (two contrasting hues,
  e.g. Indigo → Ochre, Pine → Lime, Brown → Teal), so each kind of activity can have its own look; UIB blue with
  secondary colours; and two light presets for dark text. The colour pickers
  suggest every UIB colour (in Chromium-based browsers). The colours, with their Pantone references, are listed
  at the top of `banner-editor/app.js` (source: the UIB visual identity manual, logo.uib.cat).
- **Logo**: choose the UIB logo or the UIB · MIPro Soft group logo (copies of `logos/mipro-soft/` live in
  `banner-editor/assets/logos/`). In *Auto* mode it checks how bright the area behind the logo is and picks the negative (white),
  positive (dark) or full-colour version. You can also choose one yourself.
- **Content**: label, title, subtitle, highlight (bold, e.g. dates) and details. Empty fields are left out. Use line breaks to control wrapping.
- **Badge**: optional round badge, e.g. "Matrícula oberta" or "Register now".
- **Export**: download the current size, or every preset size at once, as PNG or JPEG. Settings (not the image) are remembered in the browser.

Banner text uses UIBsans Bold, Regular and Light, loaded through `assets/site.css`.

The logos in `banner-editor/assets/logos/` are generated from the originals in `logos/`:

```sh
python3 banner-editor/scripts/convert_logos.py   # requires pdftocairo (brew install poppler)
```
