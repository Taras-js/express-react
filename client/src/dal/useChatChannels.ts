import useSWR from 'swr';
import { FetchResult } from '../entities';
import { ChatChannel } from '../entities/chat';

type Result = FetchResult & { chatChannels: ChatChannel[]; };

export function useChatChannels(searchParams?: URLSearchParams): Result {
  const { data, error, mutate } = useSWR(`/chat/channels?${searchParams}`);

  return {
    chatChannels: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
