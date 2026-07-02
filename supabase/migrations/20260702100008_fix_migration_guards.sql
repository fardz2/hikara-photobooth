-- Migration: Fix pricing table — add idempotency guards
-- Created: 2026-07-02

alter table if not exists pricing_items add column if not exists is_walk_in boolean default false;
