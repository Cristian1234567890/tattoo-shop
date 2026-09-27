# BRIEFING — 2026-09-23T23:36:30Z

## Mission
Survey authoritative reference sources (existing frontend and backend) to extract complete API, data models, auth, external services specifications and verification criteria for V2 migration.

## 🔒 My Identity
- Archetype: specminer
- Roles: Specification Miner, Domain Investigator
- Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey
- Original parent: d512e0de-1504-4fc8-9dda-bf5fa0c144bf
- Milestone: Specification Mining (V2 Rebuild)

## 🔒 Key Constraints
- READ-ONLY. DO NOT modify any code in frontend, backend, or project workspace.
- Write only to working directory .agents/specminer_api_survey.
- Thorough and complete probe of all endpoints, models, contracts, PayPal, Nodemailer, Supabase, Auth, and frontend structure.
- Output handoff.md and progress.md.

## Current Parent
- Conversation ID: d512e0de-1504-4fc8-9dda-bf5fa0c144bf
- Updated: 2026-09-23T23:36:30Z

## Task Summary
- **What to build**: Specification report for complete backend and frontend reconstruction.
- **Success criteria**: Comprehensive handoff report with exact data models, all endpoints with headers/params/request/response schemas/status codes, auth contracts, external services, concrete verification cURL requests and templates, frontend DOM/structural checklist.
- **Status**: Completed. Report generated at `.agents/specminer_api_survey/handoff.md`.

## Key Decisions Made
- Extracted exact DDL schema for Supabase tables (`tatuadores_data`, `user_subscription`) and storage bucket (`user_profile`).
- Documented all 10 Express API routes, request/response bodies, HTTP headers (supporting both `refresh_token` and `refresh`).
- Defined graceful handling for `PAYPAL_KEY=pendiente`.
- Documented Nodemailer integration and contact email template.
- Documented all frontend DOM components, modals, filters, and forms for React+TypeScript SPA rebuild.
- Documented concrete cURL scripts for verification by the independent auditor.

## Artifact Index
- .agents/specminer_api_survey/DISPATCH.md — Dispatch record
- .agents/specminer_api_survey/progress.md — Liveness & progress tracking
- .agents/specminer_api_survey/handoff.md — Final comprehensive specification report
