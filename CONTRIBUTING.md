# Contributing to VocabTalk

## Branching Strategy
- `main` — stable, demo-ready code only
- `develop` — working integration branch
- `feature/<name>` — individual feature branches (e.g. `feature/vad-voice`, `feature/gemini-service`)

## Commit Message Convention
Follow the format: `<type>(<scope>): <description>`

| Type | Usage |
| :--- | :--- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Build process, config, or dependency updates |

**Examples:**
```
feat(ai_engine): implement Groq Whisper STT transcription service
feat(core_backend): add PostgreSQL session history model
fix(frontend): fix VAD silence threshold for noisy environments
```

## Pull Request Rules
1. Always branch off from `develop`, never directly from `main`.
2. Create a Pull Request (PR) into `develop` and request review from at least 1 teammate.
3. Only merge `develop` → `main` when a milestone feature is fully working.

## Module Ownership
| Module | Owner |
| :--- | :--- |
| `frontend/` | Hồ Minh Quân (19120627) |
| `core_backend/` | Nguyễn Quốc Hưng (24120263) |
| `ai_engine/` | Nguyễn Hoàng Phát (24120467) |
| Integration & Infra | Bùi Minh Nhật (19120501) |
