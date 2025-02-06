import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role: string;
    profileImage?: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role: string;
    profileImage?: string;
  }
}