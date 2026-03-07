import { post } from './api';

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface LoginData {
    accessToken: string;
    tokenType: string;
    expiresInSeconds: number;
    userId: number;
    franchiseId: number;
    username: string;
    role: string;
}

export interface AuthResponse<T = unknown> {
    success: boolean;
    message: string | null;
    data: T;
    errors: string[] | null;
}

export const authApi = {
    /**
     * Đăng nhập
     * @param credentials - Thông tin đăng nhập (usernameOrEmail, password)
     * @returns Promise<AuthResponse<LoginData>>
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse<LoginData>> => {
        const response = await post<AuthResponse<LoginData>>('/auth/login', credentials);

        if (response.success && response.data?.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('userId', String(response.data.userId));
            localStorage.setItem('franchiseId', String(response.data.franchiseId));
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userRole', response.data.role);

            window.dispatchEvent(new Event('auth-login'));
        }

        return response;
    },


    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('accessToken');
    },

    /**
     * Lấy thông tin user hiện tại từ localStorage
     */
    getCurrentUser: () => {
        return {
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            franchiseId: localStorage.getItem('franchiseId'),
            role: localStorage.getItem('userRole'),
        };
    },

    /**
     * Lấy access token
     */
    getAccessToken: (): string | null => {
        return localStorage.getItem('accessToken');
    },
};

export default authApi;
