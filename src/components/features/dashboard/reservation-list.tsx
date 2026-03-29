import { reservationService } from "@/lib/services/reservation-service";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const ReservationList = async () => {
  const { data: reservations, error } = await reservationService.getAllReservations();

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 border border-red-100 uppercase text-[10px] tracking-widest">
        Error fetching reservations: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-transparent">
        <DataTable columns={columns} data={reservations || []} />
    </div>
  );
};
