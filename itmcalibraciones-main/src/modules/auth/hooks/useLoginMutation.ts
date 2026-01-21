import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import type { LoginRequest } from "../types/authTypes";
import { useAuthStore } from "../../../store/useAuthStore";

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),

    onSuccess: (data) => {
      // La respuesta del backend trae data.access_token y data.payload (User)
      setCredentials(data.access_token, data.payload);
      navigate("/");
    },

    onError: (error) => {
      console.error("Falló el login", error);
    },
  });
};
