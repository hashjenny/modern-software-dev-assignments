/**
 * Clothing advice module - provides clothing suggestions based on temperature
 */

const BASE_TEMP = 26; // Comfortable temperature baseline

export interface ClothingAdvice {
  suggestion: string;
  diff: number;
}

/**
 * Get clothing advice based on temperature
 *
 * Rules (based on comfortable temperature 26°C):
 * | diff range | suggestion |
 * | diff >= 5  | Hot: shorts + sunscreen |
 * | diff >= 2  | Warm: light shirt + pants |
 * | diff >= -2 | Comfortable: t-shirt + pants |
 * | diff >= -5 | Cool: light jacket |
 * | diff >= -8 | Chilly: hoodie/sweater |
 * | diff < -8  | Cold: heavy coat/down jacket |
 */
export function getClothingAdvice(temperature: number): ClothingAdvice {
  const diff = temperature - BASE_TEMP;

  let suggestion: string;
  if (diff >= 5) {
    suggestion = "天气较热：建议短袖 + 短裤，注意防晒。";
  } else if (diff >= 2) {
    suggestion = "天气偏暖：建议短袖或薄衬衫，搭配轻薄长裤。";
  } else if (diff >= -2) {
    suggestion = "体感舒适：短袖 + 长裤即可。";
  } else if (diff >= -5) {
    suggestion = "稍微偏凉：建议薄外套。";
  } else if (diff >= -8) {
    suggestion = "天气较凉：建议卫衣 / 薄毛衣 / 外套。";
  } else {
    suggestion = "天气较冷：建议厚外套或羽绒服。";
  }

  return { suggestion, diff };
}
