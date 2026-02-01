import { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  useTheme
} from "@mui/material";
import { Plus, X, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { useBrands, useCreateBrand } from "../hooks/useCatalog";
import type { CreateBrandDTO } from "../types";

export const BrandsPage = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { data: brands, isLoading, error } = useBrands();
  const createMutation = useCreateBrand();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBrandDTO>();

  const onSubmit = (data: CreateBrandDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
            Marcas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las marcas de fabricantes disponibles
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
          }}
        >
          Nueva Marca
        </Button>
      </Box>

      {/* Content */}
      <Card sx={{ borderRadius: "16px", overflow: "hidden", boxShadow: theme.shadows[3] }}>
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Error al cargar los datos</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'background.paper' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No hay marcas definidas aún</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands?.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell sx={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: "50%", 
                          bgcolor: "primary.light", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: "white"
                        }}>
                          {item.name.charAt(0).toUpperCase()}
                        </Box>
                        {item.name}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Tag size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: "16px", maxWidth: "450px", width: "100%" }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Nueva Marca</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
             <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
               <TextField
                 label="Nombre de la Marca"
                 placeholder="Ej: Fluke"
                 fullWidth
                 autoFocus
                 {...register("name", { required: "El nombre es requerido" })}
                 error={!!errors.name}
                 helperText={errors.name?.message}
               />
             </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Guardando..." : "Crear Marca"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
