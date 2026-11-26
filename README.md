# MIProSoft tools

A collection of static web tools for the everyday tasks of the MIProSoft research group, published with
GitHub Pages. Each tool lives in its own folder and has no build step. All tools share the group's look and
feel (see below), which follows the [group website](https://github.com/MIProSoft-Lab/miprosoft-site).

| Tool | Folder | Description |
| --- | --- | --- |
| Course banner editor | [`banner-editor/`](banner-editor/) | Ads and banners for courses: background photo + gradient + UIB logo + course data. |

## Running locally

Any static server works, for example:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

(Opening the HTML files directly with `file://` may fail to load the logos into the canvas.)

## Publishing on GitHub Pages

1. Push the repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be at `https://<user>.github.io/<repo>/`.

The `.nojekyll` file tells GitHub Pages to serve the files as they are.

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

## Banner editor

- **Background image**: choose a file, drop it on the preview or paste it. Drag the preview to reposition it and scroll to zoom.
- **Gradient**: two colours with their own opacity, angle and blend mode, plus presets.
- **Logo**: choose the UIB logo or the UIB · MIPro Soft group logo (copies of `logos/mipro-soft/` live in
  `banner-editor/assets/logos/`). In *Auto* mode it checks how bright the area behind the logo is and picks the negative (white),
  positive (dark) or full-colour version. You can also choose one yourself.
- **Course data**: label, title, subtitle, dates and modality. Empty fields are left out. Use line breaks to control wrapping.
- **Badge**: optional round "Matrícula oberta" badge.
- **Export**: download the current size, or every preset size at once, as PNG or JPEG. Settings (not the image) are remembered in the browser.

Banner text uses UIBsans Bold, Regular and Light, loaded through `assets/site.css`.

The logos in `banner-editor/assets/logos/` are generated from the originals in `logos/`:

```sh
python3 banner-editor/scripts/convert_logos.py   # requires pdftocairo (brew install poppler)
```
