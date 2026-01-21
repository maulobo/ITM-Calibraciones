
export interface ICity {
    id: string
    name: string;
    state: string;
  }

  export interface IAddCity {
    id?: string
    name: string;
    state: string;
  }

  export interface IState {
    id: string
    nombre: string;
  }

  export interface IAddState {
    id?: string
    nombre: string;
  }