import { createClient } from "@/lib/supabase/server";

export const reservationService = {
  async getAllReservations() {
    const supabase = await createClient();
    return supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: true });
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
