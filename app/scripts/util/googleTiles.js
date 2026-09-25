/**
 * Sesiones y URLs de Google Map Tiles API (createSession + 2dtiles).
 * Las plantillas usan el esquema google://{mapType}/{z}/{x}/{y}?key=...
 */

const sessions = {};

/**
 * @param {string} sessionKey
 * @param {URL} url
 * @returns {Promise<string>}
 */
const ensureSession = async (sessionKey, url) => {
  const cached = sessions[sessionKey];
  if (cached && !(cached instanceof Promise)) {
    return cached;
  }
  if (cached instanceof Promise) {
    await cached;
    return sessions[sessionKey];
  }

  const createPromise = (async () => {
    const key = url.searchParams.get('key');
    const mapType = url.hostname;
    const layerType = url.searchParams.get('layerType');
    const overlay = url.searchParams.get('overlay');

    const sessionRequest = {
      mapType: mapType,
      language: 'es',
      region: 'CO',
      scale: 'scaleFactor2x',
      highDpi: true,
    };

    if (layerType) {
      sessionRequest.layerTypes = [layerType];
    }
    if (overlay != null) {
      sessionRequest.overlay = overlay === 'true';
    }

    const response = await fetch(
      'https://tile.googleapis.com/v1/createSession?key=' + encodeURIComponent(key),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionRequest),
      }
    );

    if (!response.ok) {
      throw new Error('Google Map Tiles createSession failed (' + response.status + ')');
    }

    const result = await response.json();
    if (!result.session) {
      throw new Error('Google Map Tiles createSession returned no session token');
    }

    sessions[sessionKey] = result.session;
    return result.session;
  })();

  sessions[sessionKey] = createPromise;

  try {
    await createPromise;
    return sessions[sessionKey];
  } catch (err) {
    delete sessions[sessionKey];
    throw err;
  }
};

/**
 * @param {string} tileUrl
 * @returns {boolean}
 */
export const isGoogleTileUrl = (tileUrl) =>
  typeof tileUrl === 'string' && tileUrl.indexOf('google://') === 0;

/**
 * @param {string} tileUrl
 * @returns {string}
 */
export const getBasemapAttribution = (tileUrl) =>
  isGoogleTileUrl(tileUrl) ? '&copy; Google Maps' : 'Tiles &copy; Esri';

/**
 * Convierte una URL ya expandida (google://roadmap/z/x/y?key=...) en la URL HTTPS de la tesela.
 * @param {string} expandedUrl
 * @returns {Promise<string>}
 */
export const resolveGoogleTileUrl = async (expandedUrl) => {
  const url = new URL(String(expandedUrl).replace(/^google:\/\//, 'https://'));
  const key = url.searchParams.get('key');
  if (!key) {
    throw new Error('google:// tile URL requires a key query parameter');
  }

  const sessionKey = url.hostname + '?' + url.searchParams.toString();
  const session = await ensureSession(sessionKey, url);
  return (
    'https://tile.googleapis.com/v1/2dtiles' +
    url.pathname +
    '?session=' +
    encodeURIComponent(session) +
    '&key=' +
    encodeURIComponent(key)
  );
};
