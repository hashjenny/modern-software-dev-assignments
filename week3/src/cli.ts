import { getWeather, getClothingAdvice } from "./lib/weather.js";

async function main() {
  const { tempMax, tempMin } = await getWeather();
  console.log(`今日最高气温${tempMax}度, 最低气温${tempMin}度`);
  console.log("==============");

  console.log("白天温度距离体感舒适温度26度的差值为:", tempMax - 26, "度");
  console.log("白天建议穿衣: ");
  const dayAdvice = getClothingAdvice(tempMax);
  console.log(dayAdvice.suggestion);
  console.log("==============");

  console.log("夜间温度距离体感舒适温度26度的差值为:", tempMin - 26, "度");
  console.log("夜间建议穿衣: ");
  const nightAdvice = getClothingAdvice(tempMin);
  console.log(nightAdvice.suggestion);
  console.log("==============");

  console.log(`
以下穿衣搭配供参考，具体选择请根据个人体感调整：
超薄短袖：+1摄氏度
薄长袖 T 恤 / 打底：+2摄氏度
薄卫衣 / 针织开衫：+3摄氏度
厚毛衣 / 加绒卫衣：+4~5摄氏度
西装 / 风衣 / 薄外套：+5~6摄氏度
薄羽绒：+9~10摄氏度
厚羽绒服 / 棉服：+12~15摄氏度
围巾 / 帽子 / 厚袜：+2~3摄氏度
    `);
}

main().catch((error) => {
  console.error("Error fetching weather data:", error);
  process.exit(1);
});
