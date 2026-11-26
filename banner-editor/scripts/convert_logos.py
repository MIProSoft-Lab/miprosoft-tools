#!/usr/bin/env python3
"""Convert the UIB logo sources (logos/*.ai) into web-ready SVGs.

Requires `pdftocairo` (poppler). Run from the repository root:

    python3 banner-editor/scripts/convert_logos.py

Outputs into banner-editor/assets/logos/:
  uib-color.svg  full-colour logo, background removed
  uib-dark.svg   positive (dark) logo, letters inside the diamond are knocked out
  uib-white.svg  negative (white) logo, letters inside the diamond are knocked out

The knock-out versions let the gradient show through the "UIB" letters, as in
the official banners.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "logos"
OUT = ROOT / "banner-editor" / "assets" / "logos"

PATH_RE = re.compile(r'<path [^>]*?fill="([^"]+)"[^>]*?d="([^"]+)"[^>]*/>')
DARK = "rgb(13.725281%, 12.156677%, 12.548828%)"
WHITE = "rgb(100%, 100%, 100%)"
BLUE_HEX = "#005db9"
DARK_HEX = "#231f20"


def ai_to_paths(name):
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out.svg"
        subprocess.run(["pdftocairo", "-svg", str(SRC / f"{name}.ai"), str(out)], check=True)
        svg = out.read_text()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    paths = PATH_RE.findall(svg)
    # Drop a background rectangle covering (almost) the whole artboard.
    cleaned = []
    for fill, d in paths:
        x0, y0, x1, y1 = bbox(d)
        if (x1 - x0) * (y1 - y0) > 0.9 * vb[2] * vb[3]:
            continue
        cleaned.append((fill, d))
    return cleaned


def bbox(d):
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)


def union_bbox(paths, pad=2.0):
    boxes = [bbox(d) for _, d in paths]
    return (min(b[0] for b in boxes) - pad, min(b[1] for b in boxes) - pad,
            max(b[2] for b in boxes) + pad, max(b[3] for b in boxes) + pad)


def svg_doc(box, body):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
            f'width="{w:.0f}" height="{h:.0f}">\n{body}\n</svg>\n')


def color_logo():
    paths = ai_to_paths("uib-full")
    colors = {DARK: DARK_HEX, WHITE: "#ffffff"}
    body = "\n".join(
        f'<path fill="{colors.get(f, BLUE_HEX)}" d="{d}"/>' for f, d in paths)
    return svg_doc(union_bbox(paths), body)


def knockout_logo(name, visible_fill, color):
    """Visible shapes use `visible_fill`; every other fill becomes a hole."""
    paths = ai_to_paths(name)
    box = union_bbox(paths)
    x0, y0, x1, y1 = box
    mask = "\n".join(
        f'<path fill="{"#fff" if f == visible_fill else "#000"}" d="{d}"/>' for f, d in paths)
    body = (f'<defs><mask id="m" maskUnits="userSpaceOnUse" x="{x0}" y="{y0}" '
            f'width="{x1 - x0}" height="{y1 - y0}">\n{mask}\n</mask></defs>\n'
            f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{color}" mask="url(#m)"/>')
    return svg_doc(box, body)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "uib-color.svg").write_text(color_logo())
    (OUT / "uib-dark.svg").write_text(knockout_logo("uib-full-positive", DARK, DARK_HEX))
    (OUT / "uib-white.svg").write_text(knockout_logo("uib-full-negative", WHITE, "#ffffff"))
    print("Logos written to", OUT)


if __name__ == "__main__":
    sys.exit(main())
