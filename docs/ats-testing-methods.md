# ATS Testing Methods

These are the main ways to test whether a generated resume PDF is likely to parse cleanly.

## Text Extraction

Use PDF text extraction as the first-line smoke test. If extracted text has broken words, wrong reading order, missing dates, or misplaced bullets, ATS systems may do the same.

Useful checks:

- Extract all text from the PDF.
- Search for critical keywords like `Kubernetes`, `Terraform`, `PostgreSQL`, `Kotlin`, and `TypeScript`.
- Confirm section order is readable.
- Confirm job titles, companies, locations, and dates stay together.

## Parser Comparison

Run the same resume through multiple parser tools and compare:

- Contact fields
- Education
- Experience entries
- Skills
- Keyword matches against a job description
- Bullet reading order

## Keyword Match

Compare the resume against target job descriptions for:

- Exact tool names
- Standard role titles
- Cloud/platform terms
- Backend/full-stack terms
- Missing must-have skills

## Manual PDF Inspection

Visual inspection still matters, but it is not enough. A resume can look correct while the hidden PDF text layer extracts badly.

Manual checks:

- Copy and paste all PDF text into a plain text editor.
- Confirm words do not split.
- Confirm bullets appear under the right role.
- Confirm links display as useful plain text.

## Future Automation

Good future repo checks:

- Build PDF from LaTeX.
- Extract PDF text.
- Fail if critical keywords are missing.
- Save extracted text under `resume/output/`.
- Run one or more parser/scoring tools against a sample job description.
