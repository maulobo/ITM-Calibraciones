/**
 * Parámetros de consulta para paginación
 */
export interface PaginationParams {
  /** Número de resultados por página */
  limit?: number;
  /** Desplazamiento (offset) para la paginación */
  offset?: number;
  /** Campo(s) por los que ordenar */
  sort?: string;
  /** Campos a seleccionar */
  select?: string[];
  /** Campos a poblar (populate) */
  populate?: string[];
}

/**
 * Respuesta paginada estándar del backend
 */
export interface PaginatedResponse<T> {
  /** Datos de la página actual */
  data: T[];
  /** Metadata de paginación */
  pagination: {
    /** Total de elementos en la base de datos */
    total: number;
    /** Límite de elementos por página */
    limit: number;
    /** Desplazamiento actual */
    offset: number;
    /** Página actual (calculado: offset / limit + 1) */
    page: number;
    /** Total de páginas (calculado: ceil(total / limit)) */
    totalPages: number;
    /** Indica si hay una página siguiente */
    hasNext: boolean;
    /** Indica si hay una página anterior */
    hasPrev: boolean;
  };
}

/**
 * Estado de paginación para el hook usePagination
 */
export interface PaginationState {
  /** Página actual (1-indexed) */
  page: number;
  /** Elementos por página */
  pageSize: number;
  /** Total de elementos */
  total: number;
}

/**
 * Acciones de paginación para el hook usePagination
 */
export interface PaginationActions {
  /** Ir a la página siguiente */
  nextPage: () => void;
  /** Ir a la página anterior */
  prevPage: () => void;
  /** Ir a una página específica */
  goToPage: (page: number) => void;
  /** Cambiar el tamaño de página */
  setPageSize: (size: number) => void;
  /** Establecer el total de elementos */
  setTotal: (total: number) => void;
  /** Reiniciar a la primera página */
  reset: () => void;
}

/**
 * Resultado completo del hook usePagination
 */
export interface UsePaginationResult
  extends PaginationState, PaginationActions {
  /** Offset calculado para la API (page - 1) * pageSize */
  offset: number;
  /** Total de páginas */
  totalPages: number;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
  /** Indica si hay página anterior */
  hasPrevPage: boolean;
}
