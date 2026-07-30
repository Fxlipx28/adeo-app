import { trpc } from "@/lib/trpc";

/**
 * Hook para gestionar reservas de viajes
 */
export function useBookings() {
  const trpcClient = trpc.useContext();

  // Crear una nueva reserva
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      trpcClient.bookings.myBookings.invalidate();
      trpcClient.trips.list.invalidate();
    },
  });

  // Obtener mis reservas
  const myBookings = trpc.bookings.myBookings.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  // Obtener reservas de un viaje (solo conductor)
  const getTripBookings = (tripId: number) => {
    return trpc.bookings.tripBookings.useQuery({ tripId });
  };

  // Cancelar una reserva
  const cancelBooking = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      trpcClient.bookings.myBookings.invalidate();
      trpcClient.trips.list.invalidate();
    },
  });

  // Confirmar una reserva (conductor)
  const confirmBooking = trpc.bookings.confirm.useMutation({
    onSuccess: () => {
      trpcClient.bookings.myBookings.invalidate();
    },
  });

  return {
    createBooking,
    myBookings,
    getTripBookings,
    cancelBooking,
    confirmBooking,
  };
}
