# Nexus — AI-Powered Skill Mapping and Team Collaboration Platform

> Map every skill on your team, surface gaps before they become blockers, and let AI generate a personal learning path to close them — all in one place.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started — Step-by-Step Setup](#getting-started--step-by-step-setup)
- [How to Use Nexus — Feature Walkthrough](#how-to-use-nexus--feature-walkthrough)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Build Roadmap — 8 Phases Over 2 Months](#build-roadmap--8-phases-over-2-months)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## About the Project

**Nexus** is a full-stack web platform designed for engineering teams who want complete visibility into their collective skill landscape. Instead of guessing who knows what, Nexus gives every team member a living skill profile — a radar chart of their proficiencies across Frontend, Backend, DevOps, Data Science, Design, Mobile, and Security.

Team leads can create projects, define the skills those projects require, and run a one-click **AI gap analysis** powered by Claude. The result is a scored breakdown of which skills are covered, which are missing, and concrete recommendations on how to close the gap — whether by upskilling existing members or hiring.

Individuals can generate a personalized **AI learning path** for any skill they want to grow, getting a week-by-week structured curriculum tailored to their current level.

On top of skill intelligence, Nexus includes a full **Kanban board system** so teams can track their actual work alongside their skill data — everything in one workspace.

---

## Key Features

| Feature | Description |
|---|---|
| **Skill Profiles** | Every user maintains a living profile with skills rated Beginner → Expert, years of experience, and a radar chart visualization grouped by category |
| **Team Skill Heatmap** | Aggregate view of all members' proficiencies across categories — instantly see where your team is strong and where it's thin |
| **AI Gap Analysis** | Define skill requirements for a project, click Run Analysis, and get a 0–100 gap score with per-skill breakdowns and actionable recommendations from Claude |
| **AI Learning Paths** | Generate a week-by-week learning curriculum for any skill, personalized to your current level and context |
| **Kanban Boards** | Drag-and-drop task boards per team — columns, priorities, due dates, and assignees |
| **Multi-provider Auth** | Sign in with Google, GitHub, or email + password. Role-based access (Admin / Member) |
| **Demo Account** | Click-to-fill demo credentials on the login page (`admin@gmail.com` / `admin`) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI |
| **Database** | PostgreSQL via Prisma v7 ORM |
| **Auth** | NextAuth.js v4 — Google, GitHub OAuth + Credentials |
| **AI** | Anthropic Claude (`claude-sonnet-4-6`) |
| **Drag & Drop** | @hello-pangea/dnd |
| **Charts** | Recharts (radar chart, bar chart) |
| **Validation** | Zod |

---

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** v20 or later — [nodejs.org](https://nodejs.org)
- **PostgreSQL** v14 or later — [postgresql.org/download](https://www.postgresql.org/download/)
- **npm** v10+ (comes with Node.js)
- **An Anthropic API key** (for AI features) — [console.anthropic.com](https://console.anthropic.com)
- *(Optional)* Google and GitHub OAuth app credentials if you want social login

---

## Getting Started — Step-by-Step Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/fozankhana/nexus.git
cd nexus
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs all packages including Next.js, Prisma, NextAuth, Anthropic SDK, Recharts, and all UI components.

### Step 3 — Set up PostgreSQL

Open psql (or pgAdmin) and create the database:

```sql
CREATE DATABASE nexus;
```

If you are on Windows and installed PostgreSQL to a custom path:

```powershell
& "D:\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE nexus;"
```

You will be prompted for your PostgreSQL password.

### Step 4 — Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/nexus"

# NextAuth — generate a secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-your-generated-secret-here"

# Google OAuth (optional — skip if you only want credentials login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Anthropic — required for AI gap analysis and learning paths
ANTHROPIC_API_KEY="sk-ant-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generating NEXTAUTH_SECRET on Windows (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

**On Mac / Linux:**

```bash
openssl rand -base64 32
```

### Step 5 — Run database migrations

This creates all the tables in your `nexus` database:

```bash
npx prisma migrate dev --name init
```

You will see output confirming that 14 tables were created (User, Profile, Skill, UserSkill, Team, TeamMember, Project, ProjectSkillRequirement, SkillGapAnalysis, LearningPath, Board, BoardColumn, BoardTask, TaskSkillRequirement).

### Step 6 — Seed the database

This populates 37 canonical skills across 8 categories and creates the demo admin account:

```bash
npm run db:seed
```

Expected output:

```
Seeding skills...
Seeded 37 skills.
Seeding demo user...
Demo user created: admin@gmail.com / admin
```

### Step 7 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use Nexus — Feature Walkthrough

### 1. Sign In

Go to [http://localhost:3000/login](http://localhost:3000/login).

- **Demo account:** click the `admin@gmail.com` link in the demo box — it fills in the credentials automatically. Click **Sign in**.
- **Register a new account:** click "Create an account", fill in your name, email, and password.
- **OAuth:** click Google or GitHub (requires OAuth credentials in `.env.local`).

---

### 2. Build Your Skill Profile

After signing in you land on the **Dashboard**. Navigate to **Skills** in the left sidebar.

1. Click **Add Skill** (top-right button).
2. Type a skill name in the search box (e.g. "React", "Python", "Docker").
3. Select the skill from the dropdown.
4. Set your **proficiency level**: Beginner, Intermediate, Advanced, or Expert.
5. Optionally enter years of experience.
6. Click **Add skill**.

Repeat for every skill you have. The **radar chart** on your profile page updates automatically, grouping your skills by category (Frontend, Backend, DevOps, etc.).

To **edit or remove** a skill: go to **Profile → Skills** tab, hover over a skill card, and use the edit/delete icons.

---

### 3. Create a Team

Navigate to **Teams** → **New Team**.

1. Enter a team name (e.g. "Platform Engineering").
2. Add an optional description.
3. Click **Create team**.

You are automatically the team Owner.

**Add members:**

1. Open the team detail page.
2. Click **Add member**.
3. Enter the member's email address (they must have a Nexus account already).
4. Click **Add**.

The **Skill Heatmap** tab on the team page aggregates all members' proficiencies into a grouped bar chart — showing at a glance how many team members are at each proficiency level for each skill category.

---

### 4. Create a Project and Define Skill Requirements

Navigate to **Projects** → **New Project**.

1. Enter the project name (e.g. "Payments Microservice Rewrite").
2. Select the team it belongs to.
3. Set status: Planning / Active / On Hold / Completed / Archived.
4. Click **Create project**.

**Add skill requirements:**

1. Open the project detail page.
2. Under the Requirements section click **Add requirement**.
3. Search for a skill, set the minimum proficiency needed, headcount required, and priority (Low / Medium / High / Critical).
4. Repeat for every skill the project needs.

---

### 5. Run an AI Gap Analysis

Once your project has skill requirements defined:

1. Open the project page and click **Run Gap Analysis** (or navigate to `/projects/[id]/gap-analysis`).
2. Nexus sends the project requirements + all team members' skills to Claude.
3. Claude returns:
   - A **gap score** from 0 (fully covered, green) to 100 (critical gaps, red)
   - A **per-skill table** showing coverage vs. requirement
   - **Recommendations** — specific actions to close each gap
4. Results are cached — click **View Latest Analysis** on subsequent visits to see the cached result instantly.

> **Note:** This feature requires `ANTHROPIC_API_KEY` to be set in `.env.local`.

---

### 6. Generate a Personal Learning Path

Navigate to **Learning** → **Generate path**.

1. Search for the skill you want to learn (e.g. "Kubernetes").
2. Set your target proficiency level.
3. Optionally add context (e.g. "building CI/CD pipelines for a Node.js monorepo").
4. Click **Generate**.

Nexus sends your current skill profile and the target to Claude. You get:

- A titled learning path (e.g. "Kubernetes for Node.js Engineers")
- Estimated total weeks
- Step-by-step curriculum with resource titles, estimated hours per step, and milestone outcomes

Click the path card to view the full curriculum and track your progress.

---

### 7. Use Kanban Boards

Navigate to **Boards** → **New Board**.

1. Enter a board name (e.g. "Sprint 1").
2. Select the team.
3. Click **Create**.

The board opens with three default columns: **To Do**, **In Progress**, **Done**.

**Add a task:**

1. Click **Add task** (top-right of the board).
2. Fill in the title, optional description, column, priority, and due date.
3. Click **Create task**.

**Move a task:** drag the task card and drop it into the target column. The new position saves instantly to the database.

**Edit a task:** click on a task card to update any field.

---

### 8. Manage Your Profile

Navigate to **Profile** in the sidebar.

- Update your display name, bio, job title, department, and location.
- Add links to your LinkedIn and GitHub profiles.
- View your skill radar chart and full skill list.

---

## Project Structure

```
nexus/
├── prisma/
│   ├── schema.prisma          # 14-model database schema
│   └── seed.ts                # Seeds skills catalog + demo admin account
├── prisma.config.ts           # Prisma v7 datasource configuration
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout (Toaster, SessionProvider)
│   │   ├── error.tsx          # Global error boundary
│   │   ├── (auth)/            # Login and Register pages (no sidebar)
│   │   ├── (dashboard)/       # All authenticated pages with sidebar
│   │   │   ├── layout.tsx     # Sidebar + TopNav shell
│   │   │   ├── dashboard/     # Overview with stats cards
│   │   │   ├── skills/        # Skill catalog browser
│   │   │   ├── profile/       # User profile + radar chart
│   │   │   ├── teams/         # Team list, create, detail, members
│   │   │   ├── projects/      # Project list, create, detail, gap analysis
│   │   │   ├── boards/        # Kanban board list + board detail
│   │   │   └── learning/      # Learning path list + path detail
│   │   └── api/
│   │       ├── auth/          # NextAuth handler
│   │       ├── skills/        # Skill catalog CRUD
│   │       ├── user/skills/   # User skill CRUD
│   │       ├── teams/         # Team + members + skill-map aggregation
│   │       ├── projects/      # Project + skill requirements
│   │       ├── boards/        # Board + columns + tasks
│   │       └── ai/            # Gap analysis + learning path (Claude)
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Sidebar, TopNav, UserMenu
│   │   ├── auth/              # LoginForm, RegisterForm, OAuthButtons
│   │   ├── skills/            # SkillRadarChart, AddSkillDialog, ProficiencySelector
│   │   ├── teams/             # TeamCard, MemberList, InviteMemberDialog, TeamSkillHeatmap
│   │   ├── projects/          # ProjectCard, SkillRequirementForm, GapAnalysisPanel
│   │   ├── boards/            # KanbanBoard, KanbanColumn, TaskCard, CreateTaskDialog
│   │   ├── ai/                # GapAnalysisResult, LearningPathCard, AILoadingState
│   │   └── shared/            # PageHeader, EmptyState, ConfirmDialog
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton client (adapter-pg pattern)
│   │   ├── auth.ts            # NextAuth config (providers + callbacks)
│   │   ├── claude.ts          # Anthropic client singleton
│   │   ├── skill-gap.ts       # Assembles context before Claude call
│   │   └── utils.ts           # cn(), formatDate()
│   ├── proxy.ts               # Auth guard — Next.js 16 replacement for middleware.ts
│   └── types/                 # TypeScript interfaces (skill, team, board, ai)
├── .env.example               # Template for environment variables
├── .env.local                 # Your local secrets (gitignored)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## API Reference

All endpoints require an authenticated session cookie except where noted.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/skills` | List skills (`?q=search&category=Frontend`) |
| `POST` | `/api/skills` | Create skill (Admin only) |
| `GET/POST` | `/api/user/skills` | Get / add user's own skills |
| `PATCH/DELETE` | `/api/user/skills/[id]` | Update / remove a user skill |
| `GET/POST` | `/api/teams` | List teams / create team |
| `GET/PATCH/DELETE` | `/api/teams/[teamId]` | Get / update / delete team |
| `GET/POST` | `/api/teams/[teamId]/members` | List / add team members |
| `GET` | `/api/teams/[teamId]/skill-map` | Aggregated heatmap data by category |
| `GET/POST` | `/api/projects` | List / create projects (`?teamId=`) |
| `GET/PATCH/DELETE` | `/api/projects/[projectId]` | Get / update / delete project |
| `GET/POST` | `/api/projects/[projectId]/requirements` | List / add skill requirements |
| `GET/POST` | `/api/boards` | List / create boards (`?teamId=`) |
| `GET/PATCH/DELETE` | `/api/boards/[boardId]` | Get / update / delete board |
| `POST` | `/api/boards/[boardId]/tasks` | Create a task |
| `PATCH/DELETE` | `/api/boards/[boardId]/tasks/[taskId]` | Update (incl. drag-drop move) / delete task |
| `POST` | `/api/ai/gap-analysis` | Trigger Claude gap analysis for a project |
| `GET` | `/api/ai/gap-analysis/[id]` | Poll / fetch cached analysis result |
| `POST` | `/api/ai/learning-path` | Generate a Claude learning path |
| `GET` | `/api/ai/learning-path/[id]` | Fetch generated learning path |

---

## Build Roadmap — 8 Phases Over 2 Months

This is the exact sequence used to build Nexus from scratch. Use it as a reference if you are extending the platform or building something similar.

---

### Phase 1 — Scaffold & Dependencies
**Week 1 · Days 1–3 · April 2026**

- Bootstrap Next.js 16 with TypeScript, Tailwind CSS v4, App Router, and `src/` directory
- Install all production dependencies: Prisma v7, NextAuth v4, @auth/prisma-adapter, Anthropic SDK, Recharts, @hello-pangea/dnd, Zod, bcryptjs, dotenv, sonner
- Initialize shadcn/ui — components added: button, card, dialog, input, label, badge, select, tabs, sheet, drawer, skeleton, avatar, separator, dropdown-menu, textarea
- Initialize Prisma, configure `prisma.config.ts` (Prisma v7 datasource URL lives here, not in schema.prisma)
- Set up `.env.local` with all required variables and verify database connection

**Deliverable:** `npm run dev` starts with zero errors on an empty home page.

---

### Phase 2 — Database Schema & Authentication
**Weeks 1–2 · Days 4–10 · April 2026**

- Write the complete Prisma schema with 14 models: User, Profile, Skill, UserSkill, Team, TeamMember, Project, ProjectSkillRequirement, SkillGapAnalysis, LearningPath, Board, BoardColumn, BoardTask, TaskSkillRequirement — plus 6 enums (UserRole, Proficiency, TeamRole, ProjectStatus, Priority, AIJobStatus)
- Run `npx prisma migrate dev --name init`
- Build `src/lib/prisma.ts` singleton using `@prisma/adapter-pg` + `pg.Pool` (the Prisma v7 pattern that replaces the old `datasource db` URL approach)
- Build `src/lib/auth.ts` with Google, GitHub, and Credentials providers; JWT strategy; `session.user.id` injected via callbacks
- Wire up `src/app/api/auth/[...nextauth]/route.ts`
- Build `POST /api/auth/register` custom endpoint (validate input → bcrypt hash → create User + Profile)
- Build `src/proxy.ts` auth guard for all `/dashboard`, `/profile`, `/skills`, `/teams`, `/projects`, `/boards`, `/learning` routes (Next.js 16 auth middleware replacement)
- Build `LoginForm` with credentials fields, OAuth buttons, and click-to-fill demo hint; build `RegisterForm`
- Write `prisma/seed.ts` — 37 canonical skills across 8 categories + demo user `admin@gmail.com / admin`

**Deliverable:** Full auth works — register, login with credentials or OAuth, session persists across refresh, unauthenticated routes redirect to `/login`.

---

### Phase 3 — Skill Profiles & Radar Chart
**Week 2 · Days 11–14 · April–May 2026**

- Build `GET/POST /api/skills` — searchable catalog with `?q=` fuzzy search and `?category=` filter
- Build `GET/POST/PATCH/DELETE /api/user/skills` — full CRUD for a user's personal skills
- Build `AddSkillDialog` — debounced search input (300ms), skill list dropdown, `ProficiencySelector` radio group (Beginner / Intermediate / Advanced / Expert), optional years-of-experience field
- Build `SkillRadarChart` using Recharts `RadarChart` — maps proficiency enum to numeric scale 1–4, groups radar axes by category, custom tooltip
- Build `/profile` page — radar chart left column, sortable skill cards right column, inline edit/delete per skill
- Build `/skills` page — searchable/filterable catalog browser showing all 37 seeded skills with category badges

**Deliverable:** User can add 5+ skills, see them visualized on a radar chart, edit proficiency, and delete skills.

---

### Phase 4 — Teams & Skill Heatmap
**Week 3 · Days 15–21 · May 2026**

- Build `GET/POST /api/teams` — list user's teams, create a team (auto-assigns owner membership)
- Build `GET/PATCH/DELETE /api/teams/[teamId]` — team detail, update name/description, delete (owner only)
- Build `GET/POST /api/teams/[teamId]/members` — list members with their roles, add member by email
- Build `GET /api/teams/[teamId]/skill-map` — aggregates all members' `UserSkill` records by category, returns `{ heatmap: [{category, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT}] }` for charting
- Build `TeamCard`, `MemberList` with role badges, `InviteMemberDialog`
- Build `TeamSkillHeatmap` — Recharts grouped `BarChart` showing proficiency count distribution per skill category
- Build `/teams` list page, `/teams/new` create page, `/teams/[teamId]` detail page with Overview / Members / Heatmap tabs

**Deliverable:** Can create teams, invite members by email, and see the collective skill distribution heatmap.

---

### Phase 5 — Projects & AI Gap Analysis
**Weeks 4–5 · Days 22–30 · May 2026**

- Build `GET/POST /api/projects` with `?teamId=` filter
- Build `GET/PATCH/DELETE /api/projects/[projectId]` — project detail and management
- Build `GET/POST /api/projects/[projectId]/requirements` — skill requirement CRUD (skill + minProficiency + headcount + priority)
- Build `SkillRequirementForm`, `ProjectCard`, project create and detail pages
- Build `src/lib/claude.ts` — Anthropic client singleton initialized from `ANTHROPIC_API_KEY`
- Build `src/lib/skill-gap.ts` — queries DB to assemble project requirements and all team members' skills into a structured `GapAnalysisInput` object
- Build `POST /api/ai/gap-analysis` — creates `SkillGapAnalysis` row (status: PENDING), calls `claude.messages.create` with system prompt and JSON-structured user prompt, parses + Zod-validates response, updates row to COMPLETED
- Build `GET /api/ai/gap-analysis/[id]` — returns row for polling
- Build `GapAnalysisResult` — gap score gauge (0–25 green, 26–60 amber, 61–100 red), per-skill coverage table, ranked recommendations
- Build `AILoadingState` component with 2-second polling interval
- Build `/projects/[projectId]/gap-analysis` page with run / view-latest flow

**Deliverable:** Full AI gap analysis — define project requirements, run analysis, get Claude's scored gap report with recommendations.

---

### Phase 6 — Kanban Boards
**Weeks 5–6 · Days 31–37 · May 2026**

- Build `GET/POST /api/boards` — list boards for user's teams, create board (auto-creates 3 default columns)
- Build `GET/PATCH/DELETE /api/boards/[boardId]` — board detail, rename, delete
- Build `POST /api/boards/[boardId]/tasks` — create task with title, description, columnId, priority, dueDate
- Build `PATCH /api/boards/[boardId]/tasks/[taskId]` — handles column moves (columnId + order), field updates (title, description, priority, dueDate, assigneeId) in a single endpoint
- Build `DELETE /api/boards/[boardId]/tasks/[taskId]` with team membership check
- Build `KanbanBoard` with `@hello-pangea/dnd` `DragDropContext` — optimistic UI updates on drag-end, fires PATCH to persist `columnId` and `order`
- Build `KanbanColumn` (droppable area with task count badge), `TaskCard` (priority color dot, due date chip, assignee avatar), `CreateTaskDialog`
- Build `/boards` list page and `/boards/[boardId]` full board server page that fetches and passes `Column[]` to the client `KanbanBoard`

**Deliverable:** Fully functional drag-and-drop Kanban board with database persistence on every move.

---

### Phase 7 — AI Learning Paths
**Weeks 6–7 · Days 38–44 · May–June 2026**

- Build `POST /api/ai/learning-path` — creates `LearningPath` row (status: PENDING), fetches user's current skills, calls Claude with target skill + proficiency + optional context, stores parsed step-by-step curriculum as JSON
- Build `GET /api/ai/learning-path/[id]` — returns path with all fields for rendering
- Build `LearningPathCard` — title, estimated weeks, status badge (PENDING / PROCESSING / COMPLETED / FAILED with spinner on PROCESSING)
- Build learning path detail page — ordered step list with step type (video / article / project / quiz), estimated hours, resource title, milestone outcome
- Add "Generate Learning Path" CTA to the Profile page; add contextual link from gap analysis recommendations page
- Build `/learning` list page and `/learning/[pathId]` detail page

**Deliverable:** User can generate a personalized AI curriculum for any target skill and track it step by step.

---

### Phase 8 — Dashboard, Polish & Hardening
**Weeks 7–8 · Days 45–56 · June 2026**

- Build dashboard overview page — parallel DB queries for: total user skills, active team count, open projects, average gap score; render as stats card grid with trend indicators
- Add `error.tsx` error boundaries to the root app, `(auth)`, and `(dashboard)` route groups — all with Reset button and descriptive message
- Add `loading.tsx` Suspense skeleton files for all 6 dashboard routes: skills, profile, teams, projects, boards, learning
- Add Zod validation on all API POST/PATCH routes — return structured `{ error: string }` on validation failure
- Add `notFound()` on all dynamic route pages when record is missing or requester is not a team member
- Add `DialogDescription` (visually hidden via `sr-only`) to all Radix UI `DialogContent` instances — satisfies ARIA accessibility requirements
- Add `next.config.ts` image domain allowlist for Google and GitHub avatar CDNs
- Rename all "SkillsSync" references to "Nexus" throughout UI, `package.json`, env files
- Remove "Built with Next.js + Claude AI" attribution from footer
- Run final TypeScript check: `npx tsc --noEmit` → 0 errors
- Write full README with setup guide, feature walkthrough, and this build roadmap

**Deliverable:** Production-quality codebase. Zero TypeScript errors. All routes have error boundaries, loading states, and access control. App is fully branded as Nexus.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Full URL of your app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing — `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth App ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth App Secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth App ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth App Secret |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key — required for AI features |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `NEXTAUTH_URL` — available client-side |

> \* Without `ANTHROPIC_API_KEY`, the app runs fully but gap analysis and learning path generation return an error. All other features work without it.

---

## License

MIT — free to use, modify, and distribute.
