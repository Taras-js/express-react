import { KeyedMutator } from 'swr';

export interface FetchResult {
  isLoading: boolean;
  isError: boolean;
  mutate: KeyedMutator<any>;
}

export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
  createdAt: string;
  updatedAt: string;
}
