#!/usr/bin/env python3
"""Small PDF text extraction utility for the ExamPrep repo.

Usage examples:
  python scripts/pdf_extract.py "question-bank/10. Measurement_/Measurement Day 1 Classnotes.pdf" --stdout
  python scripts/pdf_extract.py question-bank --recursive --output-dir extracted-text
  python scripts/pdf_extract.py "question-bank/other-papers/Berry English 1.pdf" --stdout --clean --pages 2-8

Requires the optional `pypdf` package:
  python -m pip install pypdf
"""

from __future__ import annotations

import argparse
import logging
import re
import sys
from pathlib import Path

# Scanned exam papers routinely trip pypdf's "Ignoring wrong pointing object"
# and font warnings. They are noise for our purposes and they pollute stderr
# badly enough to hide the real failures, so quieten the library up front.
logging.getLogger("pypdf").setLevel(logging.ERROR)

# Vertical watermark strips (e.g. the Examberry sidebars) come through as short
# lines of stray glyphs. A line is treated as junk when it is short AND has a
# low ratio of letters/digits to total characters.
JUNK_MAX_LEN = 60
JUNK_MIN_ALNUM_RATIO = 0.55
WATERMARK_WORDS = re.compile(r"exam\W?b\W?[e3]?rry", re.IGNORECASE)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract text from PDF files into .txt files.")
    parser.add_argument("source", help="Path to a PDF file or a directory containing PDFs.")
    parser.add_argument("--recursive", action="store_true", help="Search directories recursively.")
    parser.add_argument("--output-dir", help="Directory where extracted .txt files will be written.")
    parser.add_argument("--stdout", action="store_true", help="Print extracted text for a single PDF to stdout.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output files.")
    parser.add_argument("--pages", help="Page selection, 1-based, e.g. '3', '2-8' or '1,4,9-12'.")
    parser.add_argument("--clean", action="store_true",
                        help="Drop watermark/sidebar noise lines and collapse blank runs.")
    parser.add_argument("--flat", action="store_true",
                        help="With --output-dir, write all files into one directory instead of "
                             "mirroring the source folder tree (names may collide).")
    return parser


def require_pypdf():
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError:
        print("Missing dependency: pypdf", file=sys.stderr)
        print("Install it with: python -m pip install pypdf", file=sys.stderr)
        return None
    return PdfReader


def parse_pages(spec: str | None) -> set[int] | None:
    """Turn '1,4,9-12' into {1, 4, 9, 10, 11, 12}. None means every page."""
    if not spec:
        return None

    wanted: set[int] = set()
    for chunk in spec.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        if "-" in chunk:
            start_text, _, end_text = chunk.partition("-")
            start, end = int(start_text), int(end_text)
            if start > end:
                start, end = end, start
            wanted.update(range(start, end + 1))
        else:
            wanted.add(int(chunk))

    if not wanted:
        raise ValueError(f"No pages selected by --pages {spec!r}")
    if min(wanted) < 1:
        raise ValueError("--pages is 1-based; page numbers must be 1 or greater.")
    return wanted


def find_pdfs(source: Path, recursive: bool) -> list[Path]:
    if source.is_file():
        if source.suffix.lower() != ".pdf":
            raise ValueError(f"Not a PDF file: {source}")
        return [source]

    if not source.is_dir():
        raise FileNotFoundError(f"Path not found: {source}")

    pattern = "**/*" if recursive else "*"
    return sorted(
        path for path in source.glob(pattern)
        if path.is_file() and path.suffix.lower() == ".pdf"
    )


def is_junk_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if WATERMARK_WORDS.search(stripped.replace(" ", "")):
        return True
    if len(stripped) > JUNK_MAX_LEN:
        return False
    alnum = sum(1 for ch in stripped if ch.isalnum())
    return alnum / len(stripped) < JUNK_MIN_ALNUM_RATIO


def clean_text(text: str) -> str:
    kept: list[str] = []
    blank_run = 0
    for line in text.splitlines():
        if is_junk_line(line):
            continue
        if not line.strip():
            blank_run += 1
            if blank_run > 1:
                continue
        else:
            blank_run = 0
        kept.append(line.rstrip())
    return "\n".join(kept)


def extract_text(pdf_path: Path, reader_cls, pages: set[int] | None, clean: bool) -> tuple[str, int, int]:
    """Return (text, pages_emitted, pages_without_text)."""
    reader = reader_cls(str(pdf_path))
    chunks: list[str] = []
    emitted = 0
    empty = 0

    for page_number, page in enumerate(reader.pages, start=1):
        if pages is not None and page_number not in pages:
            continue

        emitted += 1
        try:
            text = (page.extract_text() or "").strip()
        except Exception as exc:  # a single broken page should not kill the file
            text = ""
            print(f"  page {page_number} of {pdf_path.name}: {exc}", file=sys.stderr)

        if clean and text:
            text = clean_text(text).strip()
        if not text:
            empty += 1

        header = f"\n\n--- Page {page_number} ---\n"
        chunks.append(header + (text if text else "[No extractable text found on this page]"))

    return "".join(chunks).strip() + "\n", emitted, empty


def resolve_output_path(pdf_path: Path, source_root: Path, output_dir: Path | None, flat: bool) -> Path:
    if output_dir is None:
        return pdf_path.with_suffix(".txt")
    if flat or source_root.is_file():
        return output_dir / f"{pdf_path.stem}.txt"
    # Mirror the source tree so identically named PDFs in different folders
    # (e.g. "10. Measurement/…" and "10. Measurement_/…") do not overwrite
    # each other.
    try:
        relative = pdf_path.relative_to(source_root)
    except ValueError:
        return output_dir / f"{pdf_path.stem}.txt"
    return output_dir / relative.with_suffix(".txt")


def write_text(output_path: Path, text: str, force: bool) -> None:
    if output_path.exists() and not force:
        raise FileExistsError(f"Output already exists: {output_path} (use --force to overwrite)")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")


def main() -> int:
    args = build_parser().parse_args()
    source = Path(args.source).expanduser()
    output_dir = Path(args.output_dir).expanduser() if args.output_dir else None

    # Extracted exam text is full of typographic quotes, °, £ and ×; the default
    # Windows console codec cannot encode those and --stdout would blow up.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    reader_cls = require_pypdf()
    if reader_cls is None:
        return 2

    try:
        pages = parse_pages(args.pages)
        pdfs = find_pdfs(source, args.recursive)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if not pdfs:
        print("No PDF files found.", file=sys.stderr)
        return 1

    if args.stdout and len(pdfs) != 1:
        print("--stdout can only be used when exactly one PDF is selected.", file=sys.stderr)
        return 1

    failures = 0
    scanned: list[str] = []

    for pdf_path in pdfs:
        try:
            text, emitted, empty = extract_text(pdf_path, reader_cls, pages, args.clean)
            if emitted and empty == emitted:
                scanned.append(str(pdf_path))

            if args.stdout:
                sys.stdout.write(text)
            else:
                output_path = resolve_output_path(pdf_path, source, output_dir, args.flat)
                write_text(output_path, text, args.force)
                note = f" ({empty}/{emitted} pages had no text layer)" if empty else ""
                print(f"Wrote {output_path}{note}")
        except Exception as exc:
            failures += 1
            print(f"Failed to extract {pdf_path}: {exc}", file=sys.stderr)

    if scanned and not args.stdout:
        print(f"\n{len(scanned)} file(s) look image-only (no text layer) and need OCR:", file=sys.stderr)
        for name in scanned:
            print(f"  {name}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
