export type Role = "admin" | "user";
export type Session = { id: number; name: string; email: string; role: Role };
export type AuthResult = { customerId?: number; userId?: number; token?: string; name?: string; role?: string; user?: { name?: string; role?: string }; customer?: { name?: string; role?: string } };
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; phone: string; address: string };
export type Customer = { customerId: number; name: string; email: string; phone: string; address: string; orders?: number; spent?: number; status?: string };
