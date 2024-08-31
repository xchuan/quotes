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
  return `${image.content_text} | ![${image.author.display_name}] ${timestampToLocalDate(image.display_time)}`;
}
