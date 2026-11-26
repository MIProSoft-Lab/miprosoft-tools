#!/usr/bin/env python3
"""Check that every local file a published page refers to exists.

    python3 scripts/check_site.py _site

Looks at href/src attributes in HTML files and url(...) in CSS files. Links to
other sites, in-page anchors, data: URLs and mailto: are skipped. A link to a
folder must have an index.html inside it. Exits with status 1 if anything is
missing, so the deploy workflow stops before publishing a broken site.
"""
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

HTML_REF = re.compile(r"""\b(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
CSS_REF = re.compile(r"""url\(\s*["']?([^"')]+)["']?\s*\)""", re.I)
SKIP = ("http://", "https://", "//", "#", "data:", "mailto:", "tel:", "javascript:")


def refs(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    pattern = CSS_REF if path.suffix == ".css" else HTML_REF
    return [m.group(1).strip() for m in pattern.finditer(text)]


def resolve(page, ref):
    target_path = unquote(urlsplit(ref).path)
    if not target_path:
        return None
    if target_path.startswith("/"):
        return None  # absolute paths depend on where the site is hosted: avoid them
    target = (page.parent / target_path).resolve()
    if target.is_dir():
        target = target / "index.html"
    return target


def main():
    site = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    problems = []
    files = [p for p in site.rglob("*") if p.suffix in (".html", ".css")]
    for page in files:
        for ref in refs(page):
            if ref.startswith(SKIP):
                continue
            if urlsplit(ref).path.startswith("/"):
                problems.append(f"{page.relative_to(site)}: absolute path '{ref}' breaks under /<repo>/ on GitHub Pages")
                continue
            target = resolve(page, ref)
            if target and not target.exists():
                problems.append(f"{page.relative_to(site)}: '{ref}' not found")
            elif target and site not in target.parents and target != site:
                problems.append(f"{page.relative_to(site)}: '{ref}' points outside the published site")

    for p in problems:
        print(f"::error::{p}")
    print(f"Checked {len(files)} files: {len(problems)} problem(s).")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
