import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '../api/client';

export interface LinkedInstance {
  id: string;
  instance_name: string;
  token_prefix: string;
  last_seen_at: string | null;
  is_online: boolean;
  created_at: string;
}

interface InstallResult {
  success: boolean;
  characterId?: string;
  error?: string;
}

async function fetchLinkedInstances(): Promise<LinkedInstance[]> {
  const res = await apiFetch('/api/v1/links/instances');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function installToInstance(params: {
  instanceId: string;
  characterId: string;
  source: 'lumihub' | 'chub';
  includeWorldbook?: boolean;
  chubSlug?: string;
}): Promise<InstallResult> {
  const res = await apiFetch('/api/v1/links/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instance_id: params.instanceId,
      character_id: params.characterId,
      source: params.source,
      include_worldbook: params.includeWorldbook ?? false,
      chub_slug: params.chubSlug,
    }),
  });
  return res.json();
}

async function unlinkInstance(instanceId: string): Promise<void> {
  await apiFetch(`/api/v1/links/instances/${instanceId}`, {
    method: 'DELETE',
  });
}

/** Fetch linked instances (only when authenticated). */
export function useLinkedInstances() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['link', 'instances'],
    queryFn: fetchLinkedInstances,
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

/** Trigger a remote install to a Lumiverse instance. */
export function useInstallToLumiverse() {
  return useMutation({
    mutationFn: installToInstance,
  });
}

/** Unlink a Lumiverse instance. */
export function useUnlinkInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['link', 'instances'] });
    },
  });
}

/** Returns the first online instance, or null. */
export function useOnlineInstance() {
  const { data: instances } = useLinkedInstances();
  return instances?.find((i) => i.is_online) ?? null;
}
