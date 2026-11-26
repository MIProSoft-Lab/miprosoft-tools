#!/usr/bin/env python3
"""Build the MIProSoft icon: a UIB-blue rounded square with a white bar and
"MIPro / Soft" in UIBsans Bold.

    pip install fonttools uharfbuzz
    python3 scripts/build_team_icon.py

Writes assets/logo.svg (text as outlines, no font needed). To refresh the PNG
(512×512, used as favicon and share image), see the README.

Composition:
- natural UIBsans spacing, slightly tightened, and a line spacing of 1 em: tight
  enough to read as one block, loose enough to stay legible at favicon sizes
  (the banner logo's tighter spacing looks cramped here);
- lines are aligned by their ink, not by the glyphs' side bearings;
- the bar overhangs the text by the same amount above and below, as the
  separator does in the UIB logo;
- the group (bar + text) is centred in the square.
"""
from pathlib import Path

from build_group_logo import FONTS, Font  # same shaping and outline code

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "logo.svg"

SIZE = 512
RADIUS = 64            # corner radius of the square
BLUE = "#0065bd"       # UIB blue (Pantone 300 C), as on the group website
WHITE = "#ffffff"

LINES = ("MIPro", "Soft")
TRACKING = -12         # font units: slightly tighter than the font's default
LEADING = 1.0          # baseline to baseline, in ems
CONTENT_WIDTH = 336    # max. bar + gap + widest line, in px
CONTENT_HEIGHT = 336   # max. bar height, in px (limits the size when there are more lines)
BAR_WIDTH = 0.30       # × cap height
GAP = 0.42             # bar → text, × cap height
OVERHANG = 0.28        # bar beyond the text, above and below, × cap height
OPTICAL_SHIFT_X = 4    # px to the right: the solid bar weighs more than the text's ragged right edge


def num(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def build(lines=LINES, out=OUT, leading=None, bar=True, align="left"):
    """Writes the icon with the given lines of text to `out`.

    bar:   draw the white bar on the left of the text.
    align: "left" (every line starts at the same point) or "center".
    """
    leading = LEADING if leading is None else leading
    font = Font(FONTS / "UIBsans-Bold.ttf")
    cap = font.tt["OS/2"].sCapHeight
    upm = font.tt["head"].unitsPerEm

    shaped = [font.shape(t, TRACKING) for t in lines]
    boxes = [font.bounds(g) for g in shaped]
    widest = max(b[2] - b[0] for b in boxes)  # font units

    # As large as possible within CONTENT_WIDTH × CONTENT_HEIGHT (all sizes in
    # px are proportional to the scale).
    bar_units = (BAR_WIDTH + GAP) * cap if bar else 0
    width_units = bar_units + widest
    height_units = cap + leading * upm * (len(lines) - 1) + (2 * OVERHANG * cap if bar else 0)
    scale = min(CONTENT_WIDTH / width_units, CONTENT_HEIGHT / height_units)
    cap_px = cap * scale
    bar_w, gap, overhang = (BAR_WIDTH * cap_px, GAP * cap_px, OVERHANG * cap_px) if bar else (0, 0, 0)
    leading_px = leading * upm * scale

    # Text block: from the first line's cap height to the last line's baseline.
    text_h = cap_px + leading_px * (len(lines) - 1)
    bar_h = text_h + 2 * overhang
    left = (SIZE - width_units * scale) / 2 + (OPTICAL_SHIFT_X if bar else 0)
    bar_top = (SIZE - bar_h) / 2
    text_x = left + bar_w + gap
    first_baseline = bar_top + overhang + cap_px

    paths = []
    for i, (glyphs, box) in enumerate(zip(shaped, boxes)):
        if align == "center":  # centre the ink of every line
            origin = SIZE / 2 - (box[0] + box[2]) / 2 * scale
        else:  # align the ink of every line on the left
            origin = text_x - box[0] * scale
        paths.append(font.svg_path(glyphs, scale, origin, first_baseline + i * leading_px))

    bar_rect = (f'  <rect x="{num(left)}" y="{num(bar_top)}" width="{num(bar_w)}" height="{num(bar_h)}" fill="{WHITE}"/>\n'
                if bar else "")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}">
  <title>MIProSoft</title>
  <rect width="{SIZE}" height="{SIZE}" rx="{RADIUS}" fill="{BLUE}"/>
{bar_rect}  <path fill="{WHITE}" d="{' '.join(paths)}"/>
</svg>
"""
    out.write_text(svg)
    print(f"wrote {out.name}: cap height {cap_px:.1f}px, bar {bar_w:.1f}×{bar_h:.1f}px at ({left:.1f}, {bar_top:.1f})")


def main():
    import argparse
    ap = argparse.ArgumentParser(description="Build the MIProSoft icon (assets/logo.svg).")
    ap.add_argument("--lines", default="/".join(LINES), help='text rows separated by "/" (default: %(default)s)')
    ap.add_argument("--leading", type=float, help=f"line spacing in ems (default: {LEADING})")
    ap.add_argument("--no-bar", action="store_true", help="leave out the white bar")
    ap.add_argument("--align", choices=("left", "center"), default="left", help="text alignment (default: left)")
    ap.add_argument("--out", type=Path, default=OUT, help="output file (default: assets/logo.svg)")
    args = ap.parse_args()
    build(tuple(args.lines.split("/")), args.out, args.leading, bar=not args.no_bar, align=args.align)


if __name__ == "__main__":
    main()
