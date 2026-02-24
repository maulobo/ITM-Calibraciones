
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { usersApi } from "../api/usersApi";
import type { User } from "../types/userTypes";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const ChangePasswordDialog = ({
  open,
  onClose,
  user,
  onSuccess,
}: ChangePasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userOffice = (user as any).office;
      const officeId = typeof userOffice === 'object' && userOffice ? userOffice._id : userOffice;

      await usersApi.adminUpdateUser({ 
        id: user.id || (user as any)._id,
        password: password,
        // If office exists, include its ID to satisfy backend validation
        ...(officeId ? { office: officeId } : {})
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Cambiar Contraseña: {user?.name}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? <CircularProgress size={24} /> : "Actualizar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
