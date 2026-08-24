(function () {
  const source = 'sisu-plus-route-bridge';
  const type = 'sisuplus:main-world-route-change';
  const key = '__sisuPlusRouteBridgeInstalled';

  if (window[key]) return;
  window[key] = true;

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  const dispatchRouteChange = () => {
    window.postMessage(
      {
        pathname: window.location.pathname,
        source,
        type,
      },
      window.location.origin,
    );
  };

  const notifyAfterNavigation = () => {
    queueMicrotask(dispatchRouteChange);
  };

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    notifyAfterNavigation();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    notifyAfterNavigation();
  };

  window.addEventListener('popstate', notifyAfterNavigation);
  window.addEventListener('hashchange', notifyAfterNavigation);
})();
