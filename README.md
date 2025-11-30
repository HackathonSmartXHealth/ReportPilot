# ReportPilot — Agent-Validated Surgical Review


<div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
  <p>Automated image/video triage, annotation, and report generation for post-operative review.</p>

  <img src="public/image.png" alt="QR — Open Repo/Demo" width="90" />
</div>


## Overview
Surgical documentation is essential but time-consuming. ReportPilot uses AI/ML and agent workflows to:
- Automatically select and crop relevant frames/clips.
- Filter low-quality visuals (blurry, empty, white noise).
- Enable fast “swipe to select” and batch review.
- Support safe annotations and instant report generation.
- Maintain chronological order with smart relevance-based display.
- Validate output with an Agent and capture UX metrics.

## Problem
Manual compilation of surgical reports is slow and inconsistent. Teams need automation that preserves quality, accountability, and usability across small tablets and desktop displays.

## Solution
An AI pipeline that ingests surgical videos/images with metadata (timestamps, sequence numbers), ranks and filters content, enables surgeon-in-the-loop selection with a Tinder-like UI, applies safety-aware annotations, and exports a structured report.

## Key Features
- Automated media triage: quality scoring, de-duplication, empty/blur/noise filtering.
- Relevance ranking: event detection and chronology-aware sorting.
- Fast gallery with swipe selection: single-swipe keep/reject, batch selection.
- Safety-aware annotations: configurable safety zones and overlays.
- Report generation: export to PDF (and JSON), with thumbnails, timestamps, notes.
- Agent validation: verifies completeness, checks quality thresholds, flags gaps.
- Device-ready UX: 10–13” tablet and 24” desktop layouts.

## Architecture
- Ingest: videos/images + timestamps/sequence metadata.
- Preprocess: sampling, stabilization, quality scoring, de-noising.
- Detect: key events/regions, salient frames, clip boundaries.
- Rank: multi-signal scoring (quality, saliency, novelty, chronology).
- UX: swipe gallery, detail view, annotation tools, keyboard/midi shortcuts.
- Report: template-based export (PDF/JSON), optional EHR-friendly structure.
- Agent: validates completeness, quality thresholds, ordering; logs UX metrics.

Diagram (placeholder): docs/architecture.png

## Data & Resources
- Surgical video/image datasets, including low-quality samples.
- Metadata: timestamps, sequence numbers.
- Annotation APIs/tools for image/video manipulation.

Place sample assets under:
- samples/videos/...
- samples/images/...
- samples/metadata/...

## Quick Start
Prerequisites:
- Docker (recommended), or Node 18+ and Python 3.10+.
- Git LFS if you store large media.
- If using sample media in this repo: git lfs install && git lfs pull

Option A — Docker
- docker compose up --build
- Open the printed URL (e.g., http://localhost:3000).

Option B — Manual (example layout)
- Backend
  - cd backend
  - python -m venv .venv && source .venv/bin/activate (or .venv\Scripts\activate on Windows)
  - pip install -r requirements.txt
  - uvicorn app.main:app --reload --port 8000
- Frontend
  - cd frontend
  - npm install
  - npm run dev

Adjust commands to your repo layout if different.

## Usage
1) Import media: drag-and-drop or point to samples/.
2) Auto-triage runs: low-quality frames/segments filtered and ranked.
3) Swipe review:
   - Left: reject, Right: keep, Up: details/annotation.
   - Batch select via range or keyboard shortcuts.
4) Annotate: apply safety-aware regions and notes.
5) Generate report: choose template, export PDF/JSON.
6) Agent validate: run checks, review flags, finalize.

## Demo Script (for judges)
- Load samples from samples/.
- Show gallery: quality badges and relevance scores.
- Swipe-select 10–20 items quickly.
- Open 2–3 items in detail; add safety-zone annotation.
- Export report (PDF), open it.
- Run Agent validation; show flagged items and fix 1 issue.
- Show tablet vs desktop layout toggle.

## Evaluation & Metrics
- UX speed: time-to-first-report, items/minute selected.
- Quality: precision/recall of relevant frames, % low-quality filtered.
- Completeness: coverage of key phases (as defined per dataset).
- Agent pass rate: % reports meeting thresholds without manual fixes.
- User feedback: SUS or custom Likert ratings.

## Configuration
- configs/quality.yaml — blur/noise thresholds, frame sampling.
- configs/ranking.yaml — weights for relevance signals.
- configs/report.yaml — templates, branding, fields.
- configs/safety-zones.yaml — zone shapes, colors, labels.

## Development
- Run tests: backend: pytest; frontend: npm test.
- Lint: flake8, black; eslint, prettier.
- Git hooks: pre-commit install.

## Troubleshooting
- Docker build on Apple Silicon: set DOCKER_DEFAULT_PLATFORM=linux/amd64
- Missing large files: install Git LFS and run git lfs pull
- No GPU available: falls back to CPU automatically (slower throughput)

## Roadmap
- Multi-video case timelines and phase segmentation.
- FHIR/HL7 export and EHR integration.
- Online/On-device modes with model caching.
- Active learning from surgeon feedback.
- Federated or privacy-preserving pipelines.

## Contributing
- Fork and create a feature branch.
- Keep PRs small and focused; include before/after screenshots for UX changes.
- Add/adjust sample assets if feature affects media handling.

## Privacy & Safety
- Use only de-identified media; no PHI in samples or exports.
- Offline-friendly: Docker setup works without internet after images are pulled.
- Safety zones help redact or avoid sensitive regions.

## License
Add a LICENSE file (e.g., Apache-2.0) if not present.

## Acknowledgments
Built for a hackathon to explore AI/ML and agent workflows for surgical documentation.
