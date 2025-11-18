import sys
from pathlib import Path

try:
    from pdfminer.high_level import extract_text
except ImportError as e:
    print("Missing dependency: pdfminer.six. Install it and retry.")
    sys.exit(2)


def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/extract_pdf_text.py <input.pdf> <output.txt>")
        sys.exit(1)

    input_pdf = Path(sys.argv[1])
    output_txt = Path(sys.argv[2])

    if not input_pdf.exists():
        print(f"Input file not found: {input_pdf}")
        sys.exit(1)

    text = extract_text(str(input_pdf))
    output_txt.parent.mkdir(parents=True, exist_ok=True)
    output_txt.write_text(text, encoding="utf-8")
    print(f"Extracted text to {output_txt}")


if __name__ == "__main__":
    main()
