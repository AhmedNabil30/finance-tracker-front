export interface User {
    id?: number;
    email: string;
    password?: string;
    name?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }