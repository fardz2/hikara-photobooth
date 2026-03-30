import { createClient } from "@/lib/supabase/server";

export const reservationService = {
  async getReservations(from?: string, to?: string, status?: string) {
    const supabase = await createClient();
    let query = supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: true });

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);
    if (status && status !== "all") query = query.eq("status", status);

    return query;
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
