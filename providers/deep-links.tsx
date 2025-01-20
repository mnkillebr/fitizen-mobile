import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from './auth-provider';

/** Handle deep links for the app */
const DeepLinkHandler: React.FC = () => {
  const { validateMagicLink } = useAuth();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }): Promise<void> => {
      const { url } = event;
      const parsedUrl = Linking.parse(url);
      const magicLink = parsedUrl.queryParams?.magic;

      if (magicLink) {
        await validateMagicLink(magicLink);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [validateMagicLink]);

  return null;
};

export default DeepLinkHandler;