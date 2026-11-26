#!/usr/bin/env python3
"""Build a UIB logo extended with a research group / institution name.

Following the UIB identity guidelines, the group name goes after
"Universitat / de les Illes Balears", separated by a black line that keeps the
same spacing used between the diamond, the first line and the university name.

    pip install fonttools uharfbuzz
    python3 scripts/build_group_logo.py "MIPro" "Soft" --slug mipro-soft

It reads the cleaned UIB logos in banner-editor/assets/logos/ (see
banner-editor/scripts/convert_logos.py) and writes three new files, leaving the
originals untouched:

    logos/<slug>/uib-<slug>-color.svg     full colour
    logos/<slug>/uib-<slug>-positive.svg  dark, for light backgrounds
    logos/<slug>/uib-<slug>-negative.svg  white, for dark backgrounds

The text is converted to outlines (UIBsans Bold for the first line, UIBsans
Regular for the second), so the SVGs do not need the font to be installed.
Size, baseline and letter spacing of each line are fitted to the existing
"Universitat" and "de les Illes Balears" lines, so both blocks look the same.
"""
import argparse
import re
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "banner-editor" / "assets" / "logos"
FONTS = ROOT / "fonts"
DARK = "#231f20"

VARIANTS = {
    # output suffix: (source file, colour of the new line and text)
    "color": ("uib-color.svg", DARK),
    "positive": ("uib-dark.svg", None),   # None: drawn through the existing mask
    "negative": ("uib-white.svg", None),
}

PATH_RE = re.compile(r'<path fill="([^"]+)" d="([^"]+)"/>')


class Font:
    def __init__(self, path):
        self.tt = TTFont(path)
        self.glyphs = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()
        blob = hb.Blob.from_file_path(str(path))
        self.hb = hb.Font(hb.Face(blob))

    def shape(self, text, tracking=0.0):
        """Returns [(glyph name, x offset, y offset)] in font units, with kerning."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": True})
        out, x = [], 0.0
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append((self.order[info.codepoint], x + pos.x_offset, pos.y_offset))
            x += pos.x_advance + tracking
        return out

    def bounds(self, glyphs):
        """Ink bounding box (x0, y0, x1, y1), font units, y up."""
        box = None
        for name, gx, gy in glyphs:
            pen = BoundsPen(self.glyphs)
            self.glyphs[name].draw(pen)
            if pen.bounds is None:
                continue
            x0, y0, x1, y1 = pen.bounds
            b = (x0 + gx, y0 + gy, x1 + gx, y1 + gy)
            box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
        return box

    def svg_path(self, glyphs, scale, origin_x, baseline_y):
        pen = SVGPathPen(self.glyphs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        for name, gx, gy in glyphs:
            t = TransformPen(pen, (scale, 0, 0, -scale, origin_x + gx * scale, baseline_y - gy * scale))
            self.glyphs[name].draw(t)
        return pen.getCommands()


def bbox(d):
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    return min(nums[0::2]), min(nums[1::2]), max(nums[0::2]), max(nums[1::2])


def union(boxes):
    return (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))


def analyse(svg):
    """Finds the diamond, the separator and the two text lines of a UIB logo."""
    boxes = [bbox(d) for _, d in PATH_RE.findall(svg)]
    sep = next(b for b in boxes if (b[2] - b[0]) < 5 and (b[3] - b[1]) > 150)
    left = [b for b in boxes if b[2] < sep[0]]
    text = [b for b in boxes if b[0] > sep[2]]
    split = sep[1] + 0.4 * (sep[3] - sep[1])
    line1 = union([b for b in text if b[1] < split])
    line2 = union([b for b in text if b[1] >= split])
    diamond = union(left)
    gap = ((sep[0] - diamond[2]) + (min(line1[0], line2[0]) - sep[2])) / 2
    return sep, line1, line2, gap


def fit(font, reference, target_box):
    """Scale, tracking and baseline that make `reference` cover `target_box` exactly."""
    glyphs = font.shape(reference)
    x0, y0, x1, y1 = font.bounds(glyphs)
    tx0, ty0, tx1, ty1 = target_box
    scale = (ty1 - ty0) / (y1 - y0)
    tracking = ((tx1 - tx0) / scale - (x1 - x0)) / (len(glyphs) - 1)
    baseline = ty1 + y0 * scale  # glyph y0 (font units, y up) lands on the box bottom
    return scale, tracking, baseline


def layout_lines(line1_text, line2_text, line1, line2, bold, regular, both_bold):
    """Returns [(font, text, scale, tracking, baseline)] for the group name."""
    scale1, tracking1, baseline1 = fit(bold, "Universitat", line1)
    scale2, tracking2, baseline2 = fit(regular, "de les Illes Balears", line2)
    if not both_bold:
        return [(bold, line1_text, scale1, tracking1, baseline1),
                (regular, line2_text, scale2, tracking2, baseline2)]

    # Two bold lines of equal size filling the same span as the UIB text block:
    # from the cap height of "Universitat" to the baseline of "de les Illes Balears".
    cap = bold.tt["OS/2"].sCapHeight
    upm = bold.tt["head"].unitsPerEm
    top = baseline1 - cap * scale1
    texts = [t for t in (line1_text, line2_text) if t]
    leading = LEADING * upm
    scale = (baseline2 - top) / (cap + leading * (len(texts) - 1))
    first = top + cap * scale
    return [(bold, t, scale, tracking1, first + i * leading * scale) for i, t in enumerate(texts)]


LEADING = 0.88  # baseline-to-baseline distance in ems for the two-bold-lines style


def build(svg, line1_text, line2_text, colour, bold, regular, both_bold=False):
    sep, line1, line2, gap = analyse(svg)
    text_right = max(line1[2], line2[2])
    new_sep_x = text_right + gap
    new_text_x = new_sep_x + (sep[2] - sep[0]) + gap

    parts = [f'M {new_sep_x:.2f} {sep[1]:.2f} H {new_sep_x + sep[2] - sep[0]:.2f} V {sep[3]:.2f} H {new_sep_x:.2f} Z']
    right = new_text_x
    for font, text, scale, tracking, baseline in layout_lines(
            line1_text, line2_text, line1, line2, bold, regular, both_bold):
        if not text:
            continue
        glyphs = font.shape(text, tracking)
        gx0, _, gx1, _ = font.bounds(glyphs)
        origin = new_text_x - gx0 * scale  # align ink, not the side bearing
        parts.append(font.svg_path(glyphs, scale, origin, baseline))
        right = max(right, origin + gx1 * scale)
    d = " ".join(parts)

    if colour:  # plain SVG: append a path
        svg = svg.replace("\n</svg>", f'\n<path fill="{colour}" d="{d}"/>\n</svg>')
    else:  # knockout SVG: add the shapes to the mask (white = visible)
        svg = svg.replace("\n</mask>", f'\n<path fill="#fff" d="{d}"/>\n</mask>')
    return resize(svg, right + 2)


def resize(svg, new_right):
    m = re.search(r'viewBox="([\d.\-]+) ([\d.\-]+) ([\d.\-]+) ([\d.\-]+)"', svg)
    x, y, w, h = map(float, m.groups())
    new_w = new_right - x
    svg = svg.replace(m.group(0), f'viewBox="{x:.2f} {y:.2f} {new_w:.2f} {h:.2f}"', 1)
    svg = re.sub(r'(<svg[^>]*?) width="[\d.]+"', rf'\1 width="{new_w:.0f}"', svg, count=1)
    # Mask region and coloured rect of the knockout versions.
    svg = re.sub(r'(<(?:mask|rect)[^>]*? width=")[\d.]+(")', rf'\g<1>{new_w:.2f}\2', svg)
    return svg


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("line1", help='first line, bold (e.g. "MIPro")')
    ap.add_argument("line2", nargs="?", default="", help='second line, regular (e.g. "Soft")')
    ap.add_argument("--slug", help="file name part, default derived from the text")
    ap.add_argument("--both-bold", action="store_true",
                    help="set both lines in bold at the same size, filling the height of the UIB text block")
    ap.add_argument("--leading", type=float, default=LEADING,
                    help=f"line spacing for --both-bold, in ems (default {LEADING}); lower = tighter lines, bigger text")
    args = ap.parse_args()
    globals()["LEADING"] = args.leading

    slug = args.slug or re.sub(r"[^a-z0-9]+", "-", f"{args.line1} {args.line2}".lower()).strip("-")
    out_dir = ROOT / "logos" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    bold = Font(FONTS / "UIBsans-Bold.ttf")
    regular = Font(FONTS / "UIBsans-Regular.ttf")

    for suffix, (src, colour) in VARIANTS.items():
        svg = (SRC / src).read_text()
        out = out_dir / f"uib-{slug}-{suffix}.svg"
        out.write_text(build(svg, args.line1, args.line2, colour, bold, regular, args.both_bold))
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
