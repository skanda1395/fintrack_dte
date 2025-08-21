import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  addCategory,
  updateCategory,
} from '@/services/categoriesService';
import { Category } from '@/interfaces/interfaces';

export const useCategories = (userId?: string) => {
  return useQuery<Category[], Error>({
    queryKey: ['categories', userId],
    queryFn: () => fetchCategories(userId!),
    enabled: !!userId,
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      newCategoryName,
      userId,
    }: {
      newCategoryName: string;
      userId: string;
    }) => addCategory(newCategoryName, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.userId],
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      updatedCategory,
      userId,
    }: {
      updatedCategory: Omit<Category, 'userId'>;
      userId: string;
    }) => updateCategory(updatedCategory, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.userId],
      });
    },
  });
};
