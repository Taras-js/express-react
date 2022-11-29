import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

export function useDefaultTab(): string | null {
  const { search } = useLocation();
  const fromUrl = window.location.href.includes('?');
  const params = fromUrl ? queryString.parse(search) : null;

  return params?.defaultTab?.toString() || null;
}
