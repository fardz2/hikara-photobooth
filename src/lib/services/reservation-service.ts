import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

// ─── Read: public, cached (booked slots) ───

export async function getBookedSlots(date: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.bookedSlots(date));

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("booked_slots")
    .select("time")
    .eq("date", date);

  if (error) throw error;
  return data.map((row) => row.time as string);
}

// ─── Read: admin, no cache ───

export async function getReservations(
  from?: string,
  to?: string,
  status?: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
) {
  const supabase = await createClient();

  const selectColumns = `
    id, name, phone, package, date, time, status,
    total_price, payment_proof_url, payment_method,
    extra_print_count, extra_people_count, addons, extras, created_at
  `.replace(/\s+/g, "");

  let query = supabase
    .from("reservations")
    .select(selectColumns, { count: "exact" })
    .order("date", { ascending: false })
    .order("time", { ascending: true });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (status && status !== "all") query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const fromRange = (page - 1) * pageSize;
  const toRange = fromRange + pageSize - 1;

  return query.range(fromRange, toRange);
}

export async function getReservationStats(
  from?: string,
  to?: string,
  search?: string,
) {
  const supabase = await createClient();

  const buildQuery = (status?: string) => {
    let query = supabase
      .from("reservations")
      .select("*", { count: "exact", head: true });
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);
    if (search) query = query.ilike("name", `%${search}%`);
    if (status) query = query.eq("status", status);
    return query;
  };

  const [
    { count: totalCount },
    { count: pendingCount },
    { count: confirmedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    buildQuery(),
    buildQuery("pending"),
    buildQuery("confirmed"),
    buildQuery("cancelled"),
  ]);

  return {
    total: totalCount ?? 0,
    pending: pendingCount ?? 0,
    confirmed: confirmedCount ?? 0,
    cancelled: cancelledCount ?? 0,
  };
}

export async function getRecentReservations(limit: number = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id, name, status, total_price, date, time")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ─── Read: uncached (slot checks must be fresh) ───

export async function checkSlotAvailability(
  date: string,
  time: string,
  excludeId?: string,
) {
  const supabase = await createClient();
  let query = supabase
    .from("reservations")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .in("status", ["pending", "confirmed"]);

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) throw error;
  return data && data.length > 0;
}

export async function getReservationById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "name, phone, date, time, package, addons, extras, extra_people_count, extra_print_count, payment_method, total_price, status",
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

// ─── Write ───

export async function insertReservation(record: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").insert(record);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateReservation(
  id: string,
  payload: Record<string, unknown>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateReservationStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteReservation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
