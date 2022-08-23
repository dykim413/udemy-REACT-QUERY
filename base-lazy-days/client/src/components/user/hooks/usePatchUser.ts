import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { Appointment } from '../../../../../shared/types';
import { queryKeys } from '../../../react-query/constants';

// for when we need a server function
async function patchUserOnServer(newData: User | null, originalData: User | null): Promise<User | null> {
    if (!newData || !originalData) return null;
    // create a patch for the difference between newData and originalData
    const patch = jsonpatch.compare(originalData, newData);

    // send patched data to the server
    const { data } = await axiosInstance.patch(
        `/user/${originalData.id}`,
        { patch },
        {
            headers: getJWTHeader(originalData),
        },
    );
    return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<User, unknown, User, unknown> {
    const { user, updateUser } = useUser();
    const toast = useCustomToast();
    const queryClient = useQueryClient();

    const { mutate: patchUser } = useMutation((newUserData: User) => patchUserOnServer(newUserData, user), {
        // returns context that is passed to onError
        // 변이 함수로 전달된 모든 데이터는 onMutate 로 전달됨
        onMutate: async (newData: User | null) => {
            // cancel any outgoing queries for user data, so old server data
            // doesn't overwrite our optimistic update
            // 낙관적 업데이트를 덮어 쓰는 서버측의 old data 를 받지 않는다.
            queryClient.cancelQueries(queryKeys.user);

            // snapshot of previous user value
            const previousUserData: User = queryClient.getQueryData(queryKeys.user);

            // optimistically update the cache with new user value
            updateUser(newData);

            // return context object with snapshotted value
            return { previousUserData };
        },
        onError: (error, newData, context) => {
            // roll back cache to saved value
            if (context.previousUserData) {
                updateUser(context.previousUserData);
                toast({
                    title: 'Update failed; restoring previous values',
                    status: 'warning',
                });
            }
        },
        onSuccess: (userData: User | null) => {
            if (user) {
                // 낙관적 업데이트를 수행하므로 주석처리
                //updateUser(userData);

                toast({
                    title: 'User updated',
                    status: 'success',
                });
            }
        },
        // mutate 를 resolve 했을때 성공 여부와 관계없이 호출됨
        onSettled: () => {
            // invalidate user query to make sure we're in sync with server data
            queryClient.invalidateQueries(queryKeys.user);
        },
    });

    return patchUser;
}
