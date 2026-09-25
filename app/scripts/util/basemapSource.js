import XYZ from 'ol/source/XYZ';
import TileState from 'ol/TileState';
import { variables } from '../base/variables';
import { applyRasterPaint } from './rasterBasemapStyle';
import {
  getBasemapAttribution,
  isGoogleTileUrl,
  resolveGoogleTileUrl,
} from './googleTiles';

/**
 * @param {import('ol/ImageTile').default} imageTile
 * @param {string} src
 * @param {Object | null} paint
 */
const loadGoogleTile = (imageTile, src, paint) => {
  resolveGoogleTileUrl(src)
    .then((tileUrl) => fetch(tileUrl))
    .then((response) => {
      if (!response.ok) {
        throw new Error('Google tile ' + response.status);
      }
      return response.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const decoded = new Image();
      decoded.onload = () => {
        if (imageTile.getState() === TileState.ERROR) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        if (!paint) {
          const image = imageTile.getImage();
          image.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
          image.addEventListener('error', () => URL.revokeObjectURL(objectUrl), { once: true });
          image.src = objectUrl;
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = decoded.naturalWidth;
        canvas.height = decoded.naturalHeight;
        const ctx = canvas.getContext('2d');
        URL.revokeObjectURL(objectUrl);
        if (!ctx) {
          imageTile.setState(TileState.ERROR);
          return;
        }
        ctx.drawImage(decoded, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyRasterPaint(imageData, paint);
        ctx.putImageData(imageData, 0, 0);
        imageTile.setImage(canvas);
      };
      decoded.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        imageTile.setState(TileState.ERROR);
      };
      decoded.src = objectUrl;
    })
    .catch((err) => {
      console.warn('No se pudo cargar la tesela del mapa base:', err);
      imageTile.setState(TileState.ERROR);
    });
};

/**
 * Fuente XYZ del mapa base indicado en variables.baseMaps.
 * Gris y Noche aplican el mismo ajuste raster que el geovisor sociodemográfico.
 * @param {string} name
 * @returns {import('ol/source/XYZ').default}
 */
export const createBasemapSource = (name) => {
  const tileUrl = variables.baseMaps[name];
  const paint = variables.baseMapsStyle ? variables.baseMapsStyle[name] : null;
  const google = isGoogleTileUrl(tileUrl);

  const options = {
    url: tileUrl,
    crossOrigin: 'anonymous',
    tileSize: 256,
    tilePixelRatio: google ? 2 : 1,
    attributions: getBasemapAttribution(tileUrl),
  };

  if (google) {
    options.tileLoadFunction = (imageTile, src) => loadGoogleTile(imageTile, src, paint || null);
  }

  return new XYZ(options);
};
