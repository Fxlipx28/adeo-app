import { trpc } from "@/lib/trpc";

/**
 * Hook para gestionar calificaciones de usuarios
 */
export function useRatings() {
  const trpcClient = trpc.useContext();

  // Crear una calificación
  const createRating = trpc.ratings.create.useMutation({
    onSuccess: () => {
      trpcClient.ratings.myRatings.invalidate();
    },
  });

  // Obtener calificaciones de un usuario
  const getUserRatings = (userId: number) => {
    return trpc.ratings.getUserRatings.useQuery({ userId });
  };

  // Obtener promedio de calificación
  const getAverageRating = (userId: number) => {
    return trpc.ratings.getAverageRating.useQuery({ userId });
  };

  // Obtener mis calificaciones
  const myRatings = trpc.ratings.myRatings.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  return {
    createRating,
    getUserRatings,
    getAverageRating,
    myRatings,
  };
}
