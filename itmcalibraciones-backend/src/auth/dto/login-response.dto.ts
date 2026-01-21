import { JwtPayload } from "../interfaces/jwt-payload.interface";

export class LoginResponse {
  access_token: string;
  payload: JwtPayload
}
