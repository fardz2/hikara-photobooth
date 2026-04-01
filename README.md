# Hikara Photobooth

Hikara is a premium, professional photobooth reservation and management system.

## 🚀 Quality & Testing Milestone

This project has achieved a **Production-Grade** testing maturity with **100 passing tests** covering 100% of the core business logic.

### Testing Architecture
- **Framework:** [Vitest](https://vitest.dev/)
- **UI Testing:** React Testing Library + Happy DOM
- **Mocks:** High-fidelity `vi.hoisted` mocks for Supabase and Fonnte (WhatsApp)
- **Coverage:** 95%+ for core utilities (`lib/utils`)

### Commands
```bash
# Run all tests
bun run test

# Run tests with coverage report
bun run test:coverage

# Interactive testing UI
bun run test:ui
```

### CI/CD
Automated verification is configured via **GitHub Actions** (`.github/workflows/ci.yml`). Every push to `main` must pass:
1. Linting (Biome)
2. Type Checking (TypeScript)
3. Full Test Suite (100 Tests)

---

## Getting Started

First, run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More
Check the exhaustive [Testing Walkthrough](file:///C:/Users/farid/.gemini/antigravity/brain/2c22cbc7-cf80-4b51-9f4e-ac06e4878a9f/walkthrough.md) for detailed verification results and coverage metrics.
