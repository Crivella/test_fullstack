import axios from 'axios';

import { useQuery } from '@tanstack/react-query';

const APIendpoint = process.env.REACT_APP_API_ENDPOINT;
const todoEndpoint = APIendpoint + '/user';
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

const getUsers = async ({signal}) => {
    const {data} = await axios.get(`${todoEndpoint}/`, {
        headers: { 'Content-Type': 'application/json' },
        signal
    });
    return data;
}

export function useAPIUser() {
    // const queryClient = useQueryClient();

    const users = useQuery({
        queryKey: ['user-list'],
        queryFn: ({ signal }) => getUsers({signal}),
        staleTime: 1000 * 60 * 5,
    });

    return users.data;
}

