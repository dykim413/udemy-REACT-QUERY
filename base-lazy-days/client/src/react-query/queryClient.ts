import { QueryClient } from 'react-query';

import { createStandaloneToast } from '@chakra-ui/react';
import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
    // error is type unknown because in js, anything can be an error (e.g. throw(5))
    const id = 'react-query-error';
    const title = error instanceof Error ? error.message : 'error connecting to server';

    // prevent duplicate toasts
    toast.closeAll();
    toast({ id, title, status: 'error', variant: 'subtle', isClosable: true });
}

// to satisfy typescript until this file has uncommented contents
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: queryErrorHandler,
            staleTime: 60000,
            cacheTime: 90000,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: queryErrorHandler,
        },
    },
});
