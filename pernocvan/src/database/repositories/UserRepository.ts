import type { SessionUser } from "../../interfaces/SessionUser";

export interface UserRepository {
    login: (email: string, password: string) => Promise<{ data: SessionUser | null; error: any }>;
    fetchRole: (userId: string) => Promise<{ data: string | null }>;
}