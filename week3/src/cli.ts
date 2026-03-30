/**
 * @file cli.ts
 * @desc CLI命令行入口 - 独立运行的天气查询工具
 *
 * 功能说明：
 * - 不依赖MCP协议，直接调用天气API
 * - 输出今日天气预报和穿衣建议
 * - 适合在没有MCP客户端的环境下使用
 *
 * 使用方式：
 * ```bash
 * pnpm run cli
 * ```
 *
 * 输出内容：
 * 1. 今日最高/最低气温
 * 2. 白天和夜间的穿衣建议
 * 3. 详细的温度-穿衣对照表
 */

import { getWeather } from "./lib/weather-api.js";
import { getClothingAdvice } from "./lib/clothing.js";

/**
 * CLI主函数
 *
 * 执行流程：
 * 1. 调用getWeather()获取今日天气
 * 2. 打印最高/最低温度
 * 3. 计算并打印白天（最高温度）的穿衣建议
 * 4. 计算并打印夜间（最低温度）的穿衣建议
 * 5. 打印详细的温度-穿衣对照表
 */
async function main() {
  // 获取今日天气数据
  const { tempMax, tempMin } = await getWeather();

  // 打印今日气温概览
  console.log(`今日最高气温${tempMax}度, 最低气温${tempMin}度`);
  console.log("==============");

  // 白天穿衣建议（基于最高温度）
  console.log("白天温度距离体感舒适温度26度的差值为:", tempMax - 26, "度");
  console.log("白天建议穿衣: ");
  const dayAdvice = getClothingAdvice(tempMax);
  console.log(dayAdvice.suggestion);
  console.log("==============");

  // 夜间穿衣建议（基于最低温度）
  console.log("夜间温度距离体感舒适温度26度的差值为:", tempMin - 26, "度");
  console.log("夜间建议穿衣: ");
  const nightAdvice = getClothingAdvice(tempMin);
  console.log(nightAdvice.suggestion);
  console.log("==============");

  // 打印详细的温度-穿衣对照表
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

// 入口点：执行主函数并处理错误
main().catch((error) => {
  console.error("Error fetching weather data:", error);
  process.exit(1);
});
