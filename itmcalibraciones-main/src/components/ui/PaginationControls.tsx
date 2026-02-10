import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { UsePaginationResult } from "../../hooks/usePagination";

export interface PaginationControlsProps {
  /** Estado y acciones de paginación del hook usePagination */
  pagination: UsePaginationResult;
  /** Opciones de tamaño de página (default: [10, 25, 50, 100]) */
  pageSizeOptions?: number[];
  /** Mostrar selector de tamaño de página (default: true) */
  showPageSizeSelector?: boolean;
  /** Mostrar información de totales (default: true) */
  showTotalInfo?: boolean;
}

/**
 * Componente de controles de paginación reutilizable
 *
 * @example
 * ```tsx
 * const pagination = usePagination({
 *   initialPageSize: 20,
 *   total: data?.pagination.total
 * });
 *
 * <PaginationControls pagination={pagination} />
 * ```
 */
export const PaginationControls = ({
  pagination,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showTotalInfo = true,
}: PaginationControlsProps) => {
  const theme = useTheme();

  const {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    setPageSize,
  } = pagination;

  // Calcular rango de elementos mostrados
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        px: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Selector de tamaño de página */}
      {showPageSizeSelector && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Filas por página:
          </Typography>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 70 }}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* Información de totales */}
      {showTotalInfo && (
        <Typography variant="body2" color="text.secondary">
          {startItem}-{endItem} de {total}
        </Typography>
      )}

      {/* Controles de navegación */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Página {page} de {totalPages}
        </Typography>

        <IconButton
          onClick={prevPage}
          disabled={!hasPrevPage}
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <ChevronLeft size={20} />
        </IconButton>

        <IconButton
          onClick={nextPage}
          disabled={!hasNextPage}
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <ChevronRight size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};
