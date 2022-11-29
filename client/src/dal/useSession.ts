import useSWR from 'swr';
import { FetchResult, User } from '../entities';
import { PermissionsType } from '../common/usePermissions/permissions';

type UserWithPermissions = User & { permissions: PermissionsType[] };
type Result = FetchResult & { session?: UserWithPermissions };

export function useSession(searchParams?): Result {
  const { data, error, mutate } = useSWR<{ user: UserWithPermissions }>(`/session?${searchParams}`);

  return {
    session: data?.user,
    isLoading: !error && !data,
    isError: error || !data?.user,
    mutate,
  };
}
