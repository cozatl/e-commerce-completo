/** Shape of GET/PATCH /profile (UserProfileSerializer). Never contains the password. */
export interface UserProfile {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    timestamp: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    full_name: string;
    password: string;
}

/** Fields the profile page can change. Changing the password requires current_password. */
export interface ProfileUpdate {
    full_name?: string;
    password?: string;
    current_password?: string;
}

/** Response of POST /token and POST /register. */
export interface TokenPair {
    access: string;
    refresh: string;
}
