# Tester Sources

The tester projects were copied from a local working directory on 2026-07-01. Upstream remotes are listed below so each snapshot can be traced back to its source.

## Copied Projects

| Folder                   | Upstream Remote                                     | Local State At Copy                                                                                                             |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `testers/ATS-Checker`    | `https://github.com/fuchenru/ATS-Checker.git`       | Source copied; generated `__pycache__/ats.cpython-313.pyc` excluded.                                                            |
| `testers/ats-screener`   | `https://github.com/sunnypatell/ats-screener.git`   | Copied with local changes to `src/lib/engine/scorer/keyword-matcher.ts`, plus `package-lock.json` and `scripts/score-local.ts`. |
| `testers/Resume-Matcher` | `https://github.com/srbhr/Resume-Matcher.git`       | Clean source snapshot copied.                                                                                                   |
| `testers/ResumeParser`   | `https://github.com/saraprettyman/ResumeParser.git` | Clean source snapshot copied.                                                                                                   |

## Excluded From Snapshots

The copies intentionally exclude:

- Nested `.git` directories
- Python virtual environments
- `node_modules`
- Python bytecode and `__pycache__`
- Build and cache output

This keeps Resume Cooker version-controllable while preserving the tester source and local useful changes.
