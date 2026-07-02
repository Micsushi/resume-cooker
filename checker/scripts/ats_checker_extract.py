"""Extract PDF text the way testers/ATS-Checker does, for parser-agreement checks.

Mirrors ATS-Checker's parse_resume normalization (join lines, drop bullet glyphs).
Prefers PyPDF2 (what ATS-Checker imports); falls back to pypdf, its successor.
Emits a single JSON object on stdout so the Node wrapper can consume it without
parsing free-form text. Exits non-zero with a JSON error payload when no reader
library is available so the wrapper can skip gracefully.
"""

import json
import sys


def load_reader():
    try:
        from PyPDF2 import PdfReader  # type: ignore

        return PdfReader, "PyPDF2"
    except Exception:  # noqa: BLE001 - any import failure means try the fallback
        pass
    try:
        from pypdf import PdfReader  # type: ignore

        return PdfReader, "pypdf"
    except Exception:  # noqa: BLE001
        return None, None


def parse_resume(reader_cls, path):
    reader = reader_cls(path)
    text = ""
    for page in reader.pages:
        current = page.extract_text()
        if current:
            current = current.replace("\n", " ").replace("●", " ")
            text += current
    return text


def main(argv):
    if len(argv) < 2:
        json.dump({"ok": False, "error": "usage: ats_checker_extract.py <pdf>"}, sys.stdout)
        return 2

    reader_cls, lib = load_reader()
    if reader_cls is None:
        json.dump(
            {"ok": False, "error": "no PDF reader library (PyPDF2 or pypdf) available"},
            sys.stdout,
        )
        return 3

    try:
        text = parse_resume(reader_cls, argv[1])
    except Exception as exc:  # noqa: BLE001 - surface any read failure as JSON
        json.dump({"ok": False, "error": f"{type(exc).__name__}: {exc}"}, sys.stdout)
        return 4

    json.dump({"ok": True, "library": lib, "text": text}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
