#!/usr/bin/env python3
"""Small PDF text extraction utility for the ExamPrep repo.

Usage examples:
  python scripts/pdf_extract.py "question-bank/10. Measurement_/Measurement Day 1 Classnotes.pdf" --stdout
  python scripts/pdf_extract.py question-bank --recursive --output-dir extracted-text

Requires the optional `pypdf` package:
  python -m pip install pypdf
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract text from PDF files into .txt files.")
    parser.add_argument("source", help="Path to a PDF file or a directory containing PDFs.")
    parser.add_argument("--recursive", action="store_true", help="Search directories recursively.")
    parser.add_argument("--output-dir", help="Directory where extracted .txt files will be written.")
    parser.add_argument("--stdout", action="store_true", help="Print extracted text for a single PDF to stdout.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output files.")
    return parser


def require_pypdf():
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError:
        print("Missing dependency: pypdf", file=sys.stderr)
        print("Install it with: python -m pip install pypdf", file=sys.stderr)
        return None
    return PdfReader


def find_pdfs(source: Path, recursive: bool) -> list[Path]:
    if source.is_file():
        if source.suffix.lower() != ".pdf":
            raise ValueError(f"Not a PDF file: {source}")
        return [source]

    if not source.is_dir():
        raise FileNotFoundError(f"Path not found: {source}")

    pattern = "**/*.pdf" if recursive else "*.pdf"
    return sorted(path for path in source.glob(pattern) if path.is_file())


def extract_text(pdf_path: Path, reader_cls) -> str:
    reader = reader_cls(str(pdf_path))
    pages: list[str] = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = text.strip()
        header = f"\n\n--- Page {page_number} ---\n"
        pages.append(header + (text if text else "[No extractable text found on this page]"))

    return "".join(pages).strip() + "\n"


def resolve_output_path(pdf_path: Path, output_dir: Path | None) -> Path:
    if output_dir is None:
        return pdf_path.with_suffix(".txt")
    return output_dir / f"{pdf_path.stem}.txt"


def write_text(output_path: Path, text: str, force: bool) -> None:
    if output_path.exists() and not force:
        raise FileExistsError(f"Output already exists: {output_path} (use --force to overwrite)")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")


def main() -> int:
    args = build_parser().parse_args()
    source = Path(args.source).expanduser()
    output_dir = Path(args.output_dir).expanduser() if args.output_dir else None

    reader_cls = require_pypdf()
    if reader_cls is None:
        return 2

    try:
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

    for pdf_path in pdfs:
        try:
            text = extract_text(pdf_path, reader_cls)
            if args.stdout:
                sys.stdout.write(text)
            else:
                output_path = resolve_output_path(pdf_path, output_dir)
                write_text(output_path, text, args.force)
                print(f"Wrote {output_path}")
        except Exception as exc:
            failures += 1
            print(f"Failed to extract {pdf_path}: {exc}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())