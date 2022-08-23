import { AxiosResponse } from 'axios';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { clearStoredUser, getStoredUser, setStoredUser } from '../../../user-storage';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { queryClient } from '../../../react-query/queryClient';

async function getUser(user: User | null, signal: AbortSignal): Promise<User | null> {
    console.log('called : getUser');
    if (!user) return null;
    const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(`/user/${user.id}`, {
        headers: getJWTHeader(user),
        signal,
    });
    return data.user;
}

interface UseUser {
    user: User | null;
    updateUser: (user: User) => void;
    clearUser: () => void;
}

// localStorage, queryCache 에서 사용자의 상태를 유지
export function useUser(): UseUser {
    console.log('called : useUser');

    // call useQuery to update user data from server
    const { data: user } = useQuery(queryKeys.user, ({ signal }) => getUser(user, signal), {
        initialData: getStoredUser,
        onSuccess: (received: User | null) => {
            if (!received) {
                clearStoredUser();
            } else {
                setStoredUser(received);
            }
        },
    });

    // meant to be called from useAuth
    function updateUser(newUser: User): void {
        // update the user in the query cache

        queryClient.setQueryData(queryKeys.user, newUser);
    }

    // meant to be called from useAuth
    function clearUser() {
        // reset user to null in query cache
        queryClient.setQueryData(queryKeys.user, null);
        queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
    }

    return { user, updateUser, clearUser };
}
