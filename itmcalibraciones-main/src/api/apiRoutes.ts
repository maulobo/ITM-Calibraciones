export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
  },
  CLIENTS: {
    GET_ALL: "/clients/all",
    ADD_OR_UPDATE: "/clients/add-or-update",
    DELETE: "/clients",
  },
  OFFICES: {
    GET_ALL: "/offices/all",
    ADD_OR_UPDATE: "/offices/add-or-update",
    DELETE: "/offices",
  },
  LOCATIONS: {
    GET_ALL_STATES: "/city/all-states",
    GET_CITIES_BY_STATE: "/city/state",
  },
} as const;
