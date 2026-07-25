import { trpc } from "@/lib/trpc";

/**
 * Hook para obtener y gestionar viajes
 */
export function useTrips() {
  const trpcClient = trpc.useContext();

  // Obtener lista de viajes disponibles
  const listTrips = trpc.trips.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Obtener detalles de un viaje específico
  const getTripById = (tripId: number) => {
    return trpc.trips.getById.useQuery({ id: tripId });
  };

  // Publicar un nuevo viaje
  const publishTrip = trpc.trips.publish.useMutation({
    onSuccess: () => {
      // Invalidar caché de viajes
      trpcClient.trips.myTrips.invalidate();
      trpcClient.trips.list.invalidate();
    },
  });

  // Obtener viajes del usuario actual
  const myTrips = trpc.trips.myTrips.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  // Cancelar un viaje
  const cancelTrip = trpc.trips.cancel.useMutation({
    onSuccess: () => {
      trpcClient.trips.myTrips.invalidate();
      trpcClient.trips.list.invalidate();
    },
  });

  return {
    listTrips,
    getTripById,
    publishTrip,
    myTrips,
    cancelTrip,
  };
}
