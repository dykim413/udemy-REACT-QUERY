import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useMutation, useQueryClient } from 'react-query';

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
    const patchData = [{ op: 'remove', path: '/userId' }];
    await axiosInstance.patch(`/appointment/${appointment.id}`, {
        data: patchData,
    });
}

// TODO: update return type
export function useCancelAppointment(): (appointment: Appointment) => void {
    const toast = useCustomToast();
    const queryClient = useQueryClient();

    const { mutate } = useMutation(removeAppointmentUser, {
        onSuccess: () => {
            queryClient.invalidateQueries([queryKeys.appointments]);
            toast({
                title: 'You have cancled the appointment',
                status: 'warning',
            });
        },
    });

    return mutate;
}
