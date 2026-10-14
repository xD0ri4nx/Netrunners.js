# GitLab Duo Agent Instructions: GridRunner 20XX DevSecOps Pipeline

## Overview
This document provides specifications and handoff context for the GitLab Duo agent to complete Task 9 (Containerization & GitLab CI/CD Pipeline) of the GridRunner 20XX multiplayer project.

Tasks 1 through 8 have been implemented and verified:
- Task 1: MIT License created and complete trademark sanitization performed.
- Task 2: Shared deterministic TypeScript contracts (`src/shared/multiplayerTypes.ts`).
- Task 3: Authoritative light-lag penalty verification module (`src/shared/lagCalculator.ts`).
- Task 4: Cosmetic ICON tiers, identity utility programs, and Cuckoo Bird / Proteus Protocol presets (`src/shared/daemonCatalog.ts`).
- Task 5: Zustand store updates in `meatspaceStore.ts`, `cyberdeckStore.ts`, `routingStore.ts`, and `src/store/multiplayerStore.ts`.
- Task 6: Frontend UI components (`TechieClinic.tsx`, `MeatspacePanel.tsx`, and `WorldMap.tsx` updates).
- Task 7: WebSocket server and authoritative session manager (`server/sessionManager.ts`, `server/index.ts`).
- Task 8: Test suite with 5/5 verification tests passing (`tests/multiplayerVerification.test.ts`).

---

## Strict Directives
1. NO EMOJIS: Do not use emojis anywhere in configuration files, scripts, commit messages, comments, or pipeline logs.
2. CONTINUOUS VERIFICATION: Ensure all pipeline stages execute `npx tsc --noEmit` and `npm test` before containerization.

---

## Pending Work for GitLab Duo Agent

### 1. Create `.dockerignore`
Path: `/.dockerignore`
Contents:
```text
node_modules
dist
.git
.env
*.log
```

### 2. Create `Dockerfile`
Path: `/Dockerfile`
Requirements:
- Multi-stage build leveraging Node Alpine (v22 or v26).
- Builder stage installs dependencies (`npm ci`), copies source, and builds production bundles (`npm run build`).
- Ensure `server/` is transpiled to `dist/server/index.js` or executed via a production-ready runner (such as `tsx` or `tsc`).
- Runner stage copies production package manifests, installs production-only dependencies (`npm ci --omit=dev`), copies `dist/` and server assets, exposes `PORT` (default 8080), and starts the server via `CMD ["node", "dist/server/index.js"]`.

Target Dockerfile structure:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
EXPOSE 8080
CMD ["node", "dist/server/index.js"]
```

### 3. Create `.gitlab-ci.yml`
Path: `/.gitlab-ci.yml`
The pipeline must define four sequential stages:
1. `verify`:
   - Runs `npm ci`.
   - Runs `npm run lint`.
   - Runs `npx tsc --noEmit`.
   - Runs `npm test`.
2. `secure`:
   - Includes GitLab security templates: SAST, Secret Detection, and Dependency Scanning.
   - Enforces zero high/critical vulnerabilities.
3. `package`:
   - Uses Kaniko or Docker-in-Docker to build the container image from `Dockerfile`.
   - Tags image with `$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA` and `$CI_REGISTRY_IMAGE:latest`.
   - Pushes image to `$CI_REGISTRY`.
4. `release`:
   - Deploys the built container image to Google Cloud Run (or target cloud environment).
   - Configured for manual trigger on feature branches, automatic on `main`.

Sample `.gitlab-ci.yml` outline:
```yaml
stages:
  - verify
  - secure
  - package
  - release

default:
  image: node:22-alpine

variables:
  DOCKER_DRIVER: overlay2

verify:typescript:
  stage: verify
  script:
    - npm ci
    - npm run lint
    - npx tsc --noEmit
    - npm test

include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml

package:container:
  stage: package
  image:
    name: gcr.io/kaniko-project/executor:v1.23.2-debug
    entrypoint: [""]
  script:
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}"
      --destination "${CI_REGISTRY_IMAGE}:latest"
  only:
    - main

release:cloudrun:
  stage: release
  image: google/cloud-sdk:alpine
  script:
    - echo "Deploying ${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA} to Cloud Run..."
    # Authentication using Workload Identity Federation or Service Account Key:
    # - gcloud auth activate-service-account --key-file=${GCP_SERVICE_KEY}
    # - gcloud run deploy gridrunner-server --image ${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA} --platform managed --region ${GCP_REGION} --allow-unauthenticated
  only:
    - main
  when: manual
```

---

## Required GitLab CI/CD Variables
The following environment variables should be configured under Settings > CI/CD > Variables:
- `GCP_PROJECT_ID`: Google Cloud Project ID.
- `GCP_REGION`: Target region (e.g., `us-central1`).
- `GCP_SERVICE_NAME`: Cloud Run service name (`gridrunner-server`).
- `GCP_SERVICE_KEY`: Service account key JSON (masked and protected).

---

## Verification Commands for GitLab Duo Agent
Before finalizing pipeline deliverables, run the verification gate:
1. `npx tsc --noEmit` -> Zero errors.
2. `npm test` -> 5 tests passing.
3. `npm run lint` -> Zero lint errors.
4. `npm run build` -> Successful frontend compilation.
5. `grep -rnE "Arasaka|Petrochem|Bartmoss|Netwatch|Kerenzikov|Sandevistan" src/ server/` -> Zero matches.
