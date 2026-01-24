import { useState, useEffect } from "react";
import { Autocomplete, TextField, Box, CircularProgress } from "@mui/material";
import { locationsApi, type State, type City } from "../api/locationsApi";

interface LocationSelectorProps {
  selectedStateId?: string;
  selectedCityId?: string;
  onStateChange: (stateId: string) => void;
  onCityChange: (cityId: string) => void;
  onStateSelect?: (state: State | null) => void;
  onCitySelect?: (city: City | null) => void;
  stateError?: string;
  cityError?: string;
}

export const LocationSelector = ({
  selectedStateId,
  selectedCityId,
  onStateChange,
  onCityChange,
  onStateSelect,
  onCitySelect,
  stateError,
  cityError,
}: LocationSelectorProps) => {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Cargar provincias al montar
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const data = await locationsApi.getAllStates();
        setStates(data);
      } catch (error) {
        console.error("Error al cargar provincias:", error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Establecer estado seleccionado cuando cambia selectedStateId
  useEffect(() => {
    if (selectedStateId && states.length > 0 && !selectedState) {
      const state = states.find((s) => s._id === selectedStateId);
      if (state) {
        console.log("✅ Estado encontrado por ID:", state.nombre);
        setSelectedState(state);
      }
    }
  }, [selectedStateId, states, selectedState]);

  // Si no hay selectedStateId pero sí selectedCityId, buscar la ciudad para obtener el estado
  useEffect(() => {
    const loadInitialData = async () => {
      if (
        !selectedStateId &&
        selectedCityId &&
        states.length > 0 &&
        !selectedState
      ) {
        console.log("🔍 Buscando estado desde ciudad...");
        // Buscar la ciudad en todas las provincias para obtener su estado
        for (const state of states) {
          try {
            const cities = await locationsApi.getCitiesByState(state._id);
            const city = cities.find((c) => c._id === selectedCityId);
            if (city) {
              console.log(
                "✅ Ciudad encontrada, estableciendo provincia:",
                state.nombre,
              );
              setSelectedState(state);
              setCities(cities);
              setSelectedCity(city);
              onStateChange(state._id);
              break;
            }
          } catch (error) {
            console.error(
              "Error al buscar ciudad en estado:",
              state.nombre,
              error,
            );
          }
        }
      }
    };

    loadInitialData();
  }, [selectedStateId, selectedCityId, states, selectedState]);

  // Cargar ciudades cuando cambia el estado seleccionado
  useEffect(() => {
    if (!selectedState?._id) {
      setCities([]);
      setSelectedCity(null);
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const data = await locationsApi.getCitiesByState(selectedState._id);
        setCities(data);
      } catch (error) {
        console.error("Error al cargar ciudades:", error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState?._id]);

  // Establecer ciudad seleccionada cuando cambia selectedCityId
  useEffect(() => {
    if (selectedCityId && cities.length > 0) {
      const city = cities.find((c) => c._id === selectedCityId);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [selectedCityId, cities]);

  return (
    <Box>
      <Autocomplete
        options={states}
        getOptionLabel={(option) => option.nombre}
        getOptionKey={(option) => option._id}
        loading={loadingStates}
        value={selectedState}
        onChange={(_, newValue) => {
          setSelectedState(newValue);
          setSelectedCity(null);
          setCities([]);
          if (newValue) {
            onStateChange(newValue._id);
            onCityChange(""); // Reset ciudad
          } else {
            onStateChange("");
            onCityChange("");
          }
          if (onStateSelect) onStateSelect(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Provincia"
            size="small"
            error={!!stateError}
            helperText={stateError}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingStates ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      <Autocomplete
        options={cities}
        getOptionLabel={(option) => option.name}
        getOptionKey={(option) => option._id}
        loading={loadingCities}
        disabled={!selectedState}
        value={selectedCity}
        onChange={(_, newValue) => {
          setSelectedCity(newValue);
          if (newValue) {
            onCityChange(newValue._id);
          } else {
            onCityChange("");
          }
          if (onCitySelect) onCitySelect(newValue);
        }}
        sx={{ mt: 2 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Ciudad"
            size="small"
            error={!!cityError}
            helperText={cityError || "Primero selecciona una provincia"}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCities ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
};
