import { useState, useCallback, useMemo } from "react";
import type { UsePaginationResult } from "../utils/pagination.types";

export interface UsePaginationOptions {
  /** Tamaño de página inicial (default: 10) */
  initialPageSize?: number;
  /** Página inicial (default: 1) */
  initialPage?: number;
  /** Total de elementos (puede actualizarse dinámicamente) */
  total?: number;
}

/**
 * Hook personalizado para manejar la lógica de paginación
 *
 * @example
 * ```tsx
 * const pagination = usePagination({
 *   initialPageSize: 20,
 *   total: data?.pagination.total
 * });
 *
 * // Usar en la consulta
 * const { data } = useClients({
 *   limit: pagination.pageSize,
 *   offset: pagination.offset
 * });
 *
 * // Actualizar total cuando lleguen los datos
 * useEffect(() => {
 *   if (data?.pagination.total) {
 *     pagination.setTotal(data.pagination.total);
 *   }
 * }, [data]);
 * ```
 */
export const usePagination = (
  options: UsePaginationOptions = {},
): UsePaginationResult => {
  const {
    initialPageSize = 10,
    initialPage = 1,
    total: initialTotal = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);

  // Cálculos derivados
  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const totalPages = useMemo(
    () => Math.ceil(total / pageSize) || 1,
    [total, pageSize],
  );
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrevPage = useMemo(() => page > 1, [page]);

  // Acciones
  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(validPage);
    },
    [totalPages],
  );

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reiniciar a la primera página cuando cambie el tamaño
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    // Estado
    page,
    pageSize,
    total,
    totalPages,
    offset,
    hasNextPage,
    hasPrevPage,

    // Acciones
    nextPage,
    prevPage,
    goToPage,
    setPageSize: handleSetPageSize,
    setTotal,
    reset,
  };
};
