(function () {
  const MARKER = 'sisuPlusReauth';
  const SPLASH_ID = 'sisu-plus-splash';
  const MAX_VISIBLE_MS = 8000;

  const readMarker = function () {
    try {
      const value = sessionStorage.getItem(MARKER);
      if (value) sessionStorage.removeItem(MARKER);
      return value;
    } catch {
      return null;
    }
  };

  const marker = readMarker();
  if (!marker) return;
  if (document.getElementById(SPLASH_ID)) return;

  const splash = document.createElement('div');
  splash.id = SPLASH_ID;
  splash.setAttribute('role', 'status');
  splash.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'background:#0d0d11',
    'color:#ddddf0',
    "font-family:'Fira Sans',system-ui,sans-serif",
    'font-size:15px',
    'letter-spacing:0.02em',
  ].join(';');
  splash.textContent = 'Sisu+';

  document.documentElement.appendChild(splash);

  setTimeout(function () {
    const node = document.getElementById(SPLASH_ID);
    if (node) node.remove();
  }, MAX_VISIBLE_MS);
})();
