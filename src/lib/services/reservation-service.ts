import { createClient } from "@/lib/supabase/server";

export const reservationService = {
  async getReservations(from?: string, to?: string, status?: string, page: number = 1, pageSize: number = 10, search?: string) {
    const supabase = await createClient();
    
    // Narrow selection: Avoid "*" to reduce payload and allow covering indexes
    const selectColumns = `
      id, name, phone, package, date, time, status, 
      total_price, payment_proof_url, payment_method, 
      extra_print_count, extra_people_count, addons, created_at
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
  },

  /** @deprecated use getReservations() */
  async getAllReservations() {
    return this.getReservations();
  },

  async getBookedSlots(date: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("time")
      .eq("date", date)
      .neq("status", "cancelled");

    if (error) throw error;
    return data.map((row) => row.time as string);
  },

  async checkSlotAvailability(date: string, time: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("id")
      .eq("date", date)
      .eq("time", time)
      .neq("status", "cancelled");

    if (error) throw error;
    return data && data.length > 0;
  }
};
