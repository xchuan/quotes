#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json mod.ts
import { IResponse, IImg, IArticle } from "./types.ts";
import { createArticle } from "./utils.ts";

const NEWS_API = `https://api-one-wscn.awtmt.com/apiv1/content/lives?channel=global-channel&client=pc&limit=20&first_page=true&accept=live%2Cvip-live`;

const response = await fetch(NEWS_API);

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const { data }: IResponse = await response.json();
const articles = data.items;
const allArchiveText:string[] = [];

if(articles.length > 0) {

  for (let index = 0; index < articles.length; index++) {
    const articleInfo: IArticle = articles[index];
    // 更新 archives
    const archiveTextSingle = createArticle(articleInfo);
    allArchiveText.push(archiveTextSingle);
  }


  
  await Deno.writeTextFile("./articles.html", allArchiveText.join("\n"), { append: true });
}
