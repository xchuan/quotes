import { IImg, IArticle } from "./types.ts";

export async function createReadme(image: IImg): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(
    /<!-- BEGIN -->[\W\w]*<!-- END -->/,
    createImageRow(image)
  );
}

export function createImageRow(image: IImg): string {
  return `<!-- BEGIN -->
<!--  ${Date()} -->
  ![${image.copyright}](${image.previewUrl})

  ${image.date}

  [${image.copyright}](${image.url})
<!-- END -->`;
}

export function createArchive(image: IImg): string {
  return `\n| ${image.date} | ![${image.copyright}](${image.previewUrl}) | [下载](${image.url}) |`;
}

function timestampToLocalDate(timestamp) {
  const date = new Date(timestamp*1000); // 创建一个Date对象
  
  // 使用Intl.DateTimeFormat来格式化日期
  const localDate = new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
  return localDate;
}

export function createArticle(image: IArticle): string {
  const author = image.author ? image.author.display_name : "Unknown";
  return `${image.content_text} | ![${author}] ${timestampToLocalDate(image.display_time)}`;
}

export function getWeekNumber(d: Date) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number Make
  // Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  const weekStartDate = new Date(d.getTime());
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 3);

  const weekEndDate = new Date(d.getTime());
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 3);

  return [d.getUTCFullYear(), weekNo, weekStartDate, weekEndDate] as const;
}

export function writeJson(path: string, data: object): string {
  try {
    Deno.writeTextFileSync(path, JSON.stringify(data));
    return "Written to " + path;
  } catch (e) {
    return e.message;
  }
}
