import { useSession } from '../../dal';
import { PermissionsType } from './permissions';
import { useSearchParams } from "react-router-dom";

export function usePermissions(): { hasPermission: (p: PermissionsType) => boolean; permissions: PermissionsType[] } {
  const [searchParams] = useSearchParams();
  const { session } = useSession(searchParams);
  const permissions = session?.permissions || [];

  const hasPermission = (permission: PermissionsType) => {
    return permissions.includes(permission);
  };

  return { permissions, hasPermission };
}
