import dotenv from "dotenv";

export async function getWeather() {
  dotenv.config({ path: ".env", quiet: true, debug: false });
  const HOST = process.env.WEATHER_HOST;
  const LOC = process.env.LOC;
  const KEY = process.env.WEATHER_KEY;

  if (!HOST || !LOC || !KEY) {
    throw new Error("Missing WEATHER_HOST, LOC or WEATHER_KEY in environment");
  }

  const url = `${HOST}/v7/weather/3d?location=${LOC}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-QW-Api-Key": KEY,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const daily = data.daily[0];
  const tempMax = Number(daily["tempMax"]);
  const tempMin = Number(daily["tempMin"]);
  return [tempMax, tempMin];
}

export function getClothingAdvice(temp: number) {
  const BASE_TEMP = 26;
  const diff = temp - BASE_TEMP;

  let suggestion = "";

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

  console.log(suggestion);
}

async function main() {
  const [tempMax, tempMin] = await getWeather();
  console.log(`今日最高气温${tempMax}度, 最低气温${tempMin}度`);
  console.log("==============");

  console.log("白天温度距离体感舒适温度26度的差值为:", tempMax - 26, "度");
  console.log("白天建议穿衣: ");
  getClothingAdvice(tempMax);
  console.log("==============");

  console.log("夜间温度距离体感舒适温度26度的差值为:", tempMin - 26, "度");
  console.log("夜间建议穿衣: ");
  getClothingAdvice(tempMin);
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
});
