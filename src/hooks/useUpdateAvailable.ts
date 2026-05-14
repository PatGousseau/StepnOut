import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from '../lib/supabase';

const getCurrentBuildNumber = () => {
  const buildVersion = Application.nativeBuildVersion;
  const parsedBuildVersion = buildVersion ? Number(buildVersion) : 0;

  if (!Number.isFinite(parsedBuildVersion)) return 0;
  return parsedBuildVersion;
};

export const useUpdateAvailable = () => {
  const platform = Platform.OS;

  const query = useQuery({
    queryKey: ['appVersionConfig', platform],
    queryFn: async () => {
      if (platform !== 'ios' && platform !== 'android') {
        return null;
      }

      const { data, error } = await supabase
        .from('app_version_config')
        .select('latest_build, min_supported_build, store_url')
        .eq('platform', platform)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const currentBuildNumber = getCurrentBuildNumber();
  const latestBuildNumber = query.data?.latest_build ?? 0;

  const updateAvailable = currentBuildNumber > 0 && latestBuildNumber > currentBuildNumber;

  return {
    ...query,
    currentBuildNumber,
    latestBuildNumber,
    storeUrl: query.data?.store_url ?? null,
    minSupportedBuildNumber: query.data?.min_supported_build ?? 0,
    updateAvailable,
  };
};
