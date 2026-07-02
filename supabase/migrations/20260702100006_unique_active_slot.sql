-- Prevent race condition: concurrent bookings can double-book the same slot
-- because checkSlotAvailability() → insertReservation() is not atomic.
-- This partial UNIQUE index makes the DB reject duplicate active slots.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_active_slot
  ON public.reservations (date, time)
  WHERE status IN ('pending', 'confirmed');
