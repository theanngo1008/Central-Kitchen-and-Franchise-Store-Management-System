import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginRequest, LoginData, AuthResponse } from '@/api';

const getRoleDashboardPath = (data: LoginData): string => {
    const normalizedRole = data.role.toLowerCase();

    const paths: Record<string, string> = {
        admin: '/admin',
        supplycoordinator: '/coordinator',
        kitchenstaff: '/kitchen',
        manager: '/manager',
    };

    if (normalizedRole === 'storestaff') {
        return `/stores/${data.franchiseId}`;
    }

    return paths[normalizedRole] || '/';
};

interface UseLoginOptions {
    onSuccess?: (data: AuthResponse<LoginData>) => void;
    onError?: (error: Error) => void;
    redirectOnSuccess?: boolean;
}

export const useLogin = (options: UseLoginOptions = {}) => {
    const { onSuccess, onError, redirectOnSuccess = true } = options;
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
        onSuccess: (response) => {
            if (response.success && response.data) {
                onSuccess?.(response);

                if (redirectOnSuccess) {
                    const dashboardPath = getRoleDashboardPath(response.data);
                    navigate(dashboardPath, { replace: true });
                }
            }
        },
        onError: (error: Error) => {
            onError?.(error);
        },
    });

    const login = (usernameOrEmail: string, password: string) => {
        mutation.mutate({ usernameOrEmail, password });
    };

    return {
        login,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};

export default useLogin;
