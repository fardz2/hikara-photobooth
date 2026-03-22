---
name: hikara
description: Mandatory coding standards for Next.js 16 projects with Server-First Architecture, Zero-Blocking Shell, and Granular Data Loading patterns.
---

# 🎯 fardz - Next.js 16 Coding Rules & Standards

> **Last Updated:** 2026-02-20
> **Enforcement Level:** STRICT - All rules must be followed
> **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI

**Purpose:** This skill enforces coding standards for Next.js 16 projects focusing on **Server-First Architecture**, **Zero-Blocking Shell**, and **Granular Data Loading**.

---

## 📋 Table of Contents

1. [Core Architecture](#-1-core-architecture)
2. [Project Structure](#-2-project-structure)
3. [State Management](#-3-state-management)
4. [Coding Patterns](#-4-coding-patterns)
5. [Client-Side Best Practices](#-5-client-side-best-practices)
6. [Data Fetching & Server Actions](#-6-data-fetching--server-actions)
7. [TypeScript Rules](#-7-typescript-rules)
8. [Forms & Validation](#-8-forms--validation)
9. [Styling & UI](#-9-styling--ui)
10. [Error Handling](#-10-error-handling)
11. [Performance & Best Practices](#-11-performance--best-practices)
12. [Testing](#-12-testing)
13. [Accessibility](#-13-accessibility)
14. [Security](#-14-security)
15. [Git & Commit Standards](#-15-git--commit-standards)

---

## 🏗️ 1. Core Architecture

### 1.1 Server-First & Zero-Blocking Shell (PPR)

We follow a strict **Server-First** approach. Most logic should happen on the server.

**Zero-Blocking Shell = Partial Prerendering (PPR)**

Next.js 16's **PPR** enables mixing static and dynamic content in a single route. Our Zero-Blocking Shell pattern implements PPR for optimal UX.

**✅ GOOD: Zero-Blocking Shell (PPR Pattern)**
```typescript
// Page component - NO await, NO Suspense here!
// This is the "Static Shell" in PPR
export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />  {/* Static - instant from CDN */}
      <main className="flex-1">
        <Header />  {/* Static - instant from CDN */}
        
        {/* Dynamic content streams in via Suspense */}
        <Suspense fallback={<StatsSkeleton />}><StatsWidget /></Suspense>
        <Suspense fallback={<ChartSkeleton />}><ChartWidget /></Suspense>
        <Suspense fallback={<TableSkeleton />}><DataTable /></Suspense>
      </main>
    </div>
  )
}
```

### 1.2 Page Components (`page.tsx`)

**Role:** Shell / Orchestrator

**Responsibilities:**
- Receive `searchParams` AND `params` (as Promises)
- Pass Promises to Feature Components (DON'T await)
- Wrap async components in `<Suspense>` with granular keys

**✅ GOOD Pattern:**
```typescript
export default function UsersPage({ searchParams, params }: PageProps) {
  // ✅ Synchronous - shell renders instantly
  // ✅ NO await here
  return (
    <div className="space-y-4">
      {/* ✅ Pass Promises directly */}
      <UsersFetcher searchParams={searchParams} params={params} />
    </div>
  )
}
```

### 1.3 Feature Components (Fetcher Pattern)

**Role:** View + Data Fetcher

**✅ GOOD: Dashboard Fetcher (Fresh)**
```typescript
async function UsersFetcher({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await connection() // Opt-out of cache
  const params = await searchParams
  const query = params.q?.toString() || ''
  const page = Number(params.page || '1')

  return (
    <Suspense key={JSON.stringify({ query, page })} fallback={<TableSkeleton />}>
      <UsersTable query={query} page={page} />
    </Suspense>
  )
}
```

**✅ GOOD: Public Fetcher (Cached)**
```typescript
async function BlogFetcher({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  const category = params.category?.toString()

  return (
    <Suspense key={category || 'all'} fallback={<BlogSkeleton />}>
      <BlogPosts category={category} />
    </Suspense>
  )
}
```

---

## 🗂️ 2. Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                 # Atomic UI (Shadcn/Primitive)
│   ├── features/           # Feature-specific components (Organisms)
│   ├── skeletons/          # Loading Skeletons
│   ├── layout/             # Layout components (Header, Footer)
│   └── providers/          # Client Context Providers
├── lib/
│   ├── actions/            # Server Actions (Mutations ONLY)
│   ├── services/           # Data Fetching & Business Logic (Queries)
│   ├── hooks/              # Custom React Hooks
│   ├── utils/              # Helper functions
│   └── supabase/           # Supabase client setup
```

---

## 🔗 3. State Management

- Do not use `useState` for filterable states (search, page, tab, status).
- Store these states in the **URL Search Params**.
- **Dashboard Data:** Fetch Fresh on Server
- **Public Data:** Cache using 'use cache'

---

## 📡 6. Data Fetching & Server Actions

**Cache Profiles:** Default, minutes, hours, days, weeks, max.
Use `'use cache'` directive for static/cached pages, and `connection()` + `revalidatePath()` for pure real-time dashboard data mapping mutations directly to fresh DOM state.

```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function createStat(formData: FormData) {
  await db.stats.create({ data: {...} })
  revalidatePath('/dashboard')
  return { success: true, message: 'Stat created' }
}
```

---

## 🎯 Quick Reference Checklist

- [ ] Page component is synchronous (no top-level await)
- [ ] Data fetching delegated to Feature Components with `Suspense`
- [ ] Dashboard components use `await connection()` for fresh data
- [ ] Public components use `"use cache"` or `unstable_cache`
- [ ] Client components with `useSearchParams` wrapped in `Suspense`
- [ ] Server Actions return `{ success, message, errors }` format
- [ ] Forms use Zod + React Hook Form pattern
- [ ] Skeletons exist for all async components
