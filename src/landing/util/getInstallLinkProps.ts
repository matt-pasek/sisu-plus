import { useState, useEffect } from 'react';

const installUrl = '/install';

export const getInstallLinkProps = () => ({ href: installUrl });

export function useIsFirefox() {
  const [isFirefox, setIsFirefox] = useState(false);
  useEffect(() => {
    setIsFirefox(navigator.userAgent.includes('Firefox'));
  }, []);
  return isFirefox;
}
