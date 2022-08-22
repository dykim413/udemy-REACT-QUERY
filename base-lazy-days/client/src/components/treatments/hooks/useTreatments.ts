import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useQuery, useQueryClient } from 'react-query';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
    const { data } = await axiosInstance.get('/treatments');
    return data;
}

export function useTreatments(): Treatment[] {
    const { data } = useQuery(queryKeys.treatments, getTreatments);

    // const { data } = useQuery(queryKeys.treatments, getTreatments, {
    //     onError: error => {
    //         const title =
    //             error instanceof Error
    //                 ? error.message
    //                 : 'error connection to the server';
    //
    //         toast({ title, status: 'error' });
    //     },
    // });

    return data ?? []; // 쿼리 함수가 resolve 되기 전까지는 data 가 정의되지 않기 때문에 null 병합 연산자로 오류 방지
}

export function usePrefetchTreatments(): void {
    const queryClient = useQueryClient();
    queryClient.prefetchQuery(queryKeys.treatments, getTreatments);
}
