export interface User {
    email: string;
    name: string;
    password: string; // In a real app, this would be hashed. Secure enough for local prototype.
    role: 'admin' | 'staff';
}

const STORAGE_KEY = 'secure-app-users';

export const AuthStorage = {
    getUsers: (): User[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    register: (user: User): { success: boolean, error?: string } => {
        const users = AuthStorage.getUsers();
        if (users.find(u => u.email === user.email)) {
            return { success: false, error: 'User already exists' };
        }
        users.push(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return { success: true };
    },

    login: (email: string, password: string): User | null => {
        const users = AuthStorage.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        return user || null;
    }
};
