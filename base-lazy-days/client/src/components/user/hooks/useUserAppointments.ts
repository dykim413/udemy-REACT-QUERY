import dayjs from 'dayjs';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';
import { useQuery } from 'react-query';

// for when we need a query function for useQuery
async function getUserAppointments(user: User | null): Promise<Appointment[] | null> {
    if (!user) return null;
    const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
        headers: getJWTHeader(user),
    });
    return data.appointments;
}

// 의존적 쿼리
// user 가 falsy 값이면 enabled 옵션에 의해 쿼리가 비활성화 되고 따라서 fallback 으로 설정한 빈 배열이 리턴되어 예약목록은 빈 데이터가 된다.
export function useUserAppointments(): Appointment[] {
    const { user } = useUser();
    const fallback: Appointment[] = [];
    const { data: userAppointments = fallback } = useQuery(
        [queryKeys.appointments, queryKeys.user, user?.id],
        () => getUserAppointments(user),
        {
            enabled: !!user,
        },
    );
    return userAppointments;
}
