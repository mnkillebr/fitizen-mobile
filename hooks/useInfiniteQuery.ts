import { api } from '@/lib/api';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteExercises(query: string) {
  return useInfiniteQuery({
    queryKey: ['exercises', query],
    queryFn: ({ pageParam = 1 }) => {
      return api.exercises.list({ query, page: pageParam, limit: 10 })
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}