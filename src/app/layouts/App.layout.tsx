import { Outlet, useLocation, useNavigation } from 'react-router';
import { SpinnerLoader } from '@/app/components/ui/SpinnerLoader.comp';
import React from 'react';
import { Navbar } from '@/app/components/ui/Navbar.comp';
import { AppToaster } from '@/app/components/ui/AppToaster.comp';
import {
  CHANGELOG_V2,
  InAppChangelog,
  shouldShowInAppChangelog,
  useChangelogRelease,
} from '@/app/components/changelog';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';

export const AppLayout: React.FC = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const [prefs, setPrefs, prefsLoaded] = useChromeStorage();
  const isNavigating = Boolean(navigation.location);
  const isTimeline = location.pathname.startsWith('/student/plan');
  const isDashboard = location.pathname === '/student/frontpage';
  const isFullWidth = isTimeline || isDashboard;
  const changelogRelease = useChangelogRelease();
  const showChangelog = shouldShowInAppChangelog(prefs, prefsLoaded, CHANGELOG_V2.version);

  const closeChangelog = () => {
    setPrefs({ lastSeenChangelogVersion: CHANGELOG_V2.version });
  };

  return (
    <div>
      {isNavigating && <SpinnerLoader />}
      <AppToaster />
      <Navbar />
      <div className={`mx-auto w-full px-6 pt-6 ${isFullWidth ? 'max-w-none' : 'max-w-7xl'}`}>
        <Outlet />
      </div>
      {showChangelog && <InAppChangelog release={changelogRelease} onClose={closeChangelog} />}
    </div>
  );
};
