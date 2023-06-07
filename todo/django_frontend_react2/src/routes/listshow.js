import { useParams } from 'react-router-dom';

import UserLists from './UserLists';

export function ListShow() {
    const { id } = useParams();
    
    return (
        <UserLists id={Number(id)} />
    );
}
