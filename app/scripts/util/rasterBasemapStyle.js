/**
 * Ajuste de color equivalente al paint raster de MapLibre
 * (saturation, contrast, brightness-min, brightness-max).
 */

/**
 * @param {number} value
 * @returns {number}
 */
const clampByte = (value) => {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 255) return 255;
  return rounded;
};

/**
 * @param {number} saturation
 * @returns {number}
 */
const saturationFactor = (saturation) =>
  saturation > 0 ? 1 - 1 / (1.001 - saturation) : -saturation;

/**
 * @param {number} contrast
 * @returns {number}
 */
const contrastFactor = (contrast) =>
  contrast > 0 ? 1 / (1 - contrast) : 1 + contrast;

/**
 * @param {ImageData} imageData
 * @param {{ 'raster-saturation'?: number, 'raster-contrast'?: number, 'raster-brightness-min'?: number, 'raster-brightness-max'?: number }} paint
 */
export const applyRasterPaint = (imageData, paint) => {
  const saturation = paint['raster-saturation'] != null ? paint['raster-saturation'] : 0;
  const contrast = paint['raster-contrast'] != null ? paint['raster-contrast'] : 0;
  const brightnessMin = paint['raster-brightness-min'] != null ? paint['raster-brightness-min'] : 0;
  const brightnessMax = paint['raster-brightness-max'] != null ? paint['raster-brightness-max'] : 1;
  const sat = saturationFactor(saturation);
  const con = contrastFactor(contrast);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    const average = (r + g + b) / 3;
    r += (average - r) * sat;
    g += (average - g) * sat;
    b += (average - b) * sat;

    r = (r - 0.5) * con + 0.5;
    g = (g - 0.5) * con + 0.5;
    b = (b - 0.5) * con + 0.5;

    r = brightnessMin + (brightnessMax - brightnessMin) * r;
    g = brightnessMin + (brightnessMax - brightnessMin) * g;
    b = brightnessMin + (brightnessMax - brightnessMin) * b;

    data[i] = clampByte(r * 255);
    data[i + 1] = clampByte(g * 255);
    data[i + 2] = clampByte(b * 255);
  }
};
