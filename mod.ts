#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json mod.ts
import { IResponse, IImg, IArticle } from "./types.ts";
import { createArticle, getWeekNumber, writeJson } from "./utils.ts";
import * as Minio from "minio";
import { existsSync } from "std/fs/exists.ts";
import moment from 'moment';

const NEWS_API = `https://api-one-wscn.awtmt.com/apiv1/content/lives?channel=global-channel&client=pc&limit=20&first_page=true&accept=live%2Cvip-live`;

const minioClient = new Minio.Client({
  endPoint: 'cone.xhashao.top',
  port: 443,
  useSSL: true,
  accessKey: 'vvjZPE9sc6KdrLV625nW',
  secretKey: 'hXiQTWle3iIFRWcP9w9V2Q2M8UihstZJsWhER7UQ',
})

const getBuckets = async() =>{
  try {
    const buckets = await minioClient.listBuckets();
    //minioClient.fPutObject
    console.log('Success', buckets)
  } catch (err) {
    console.log(err.message)
  }
}

const allArchiveText:string[] = [];
const weeknumber = getWeekNumber(new Date());
const outdir = `./news/${weeknumber[0]}/w${weeknumber[1]}`;
const minnumber = Number(moment().format('YYYYMMDDHHmm'));
const jsonfname = minnumber - minnumber%5;


let dirExists = existsSync(outdir);
let fileExists = existsSync(`${outdir}/${jsonfname}.json`);
console.log(dirExists,fileExists);// returns boolean

if(!dirExists){
  await Deno.mkdir(outdir, { recursive: true });
}
const uploadJson = (filepath:string) => {
  const metaData = {
    'Content-Type': 'application/json',
  }
  minioClient.fPutObject('nchome', `${jsonfname}.json`, filepath, metaData, function (err, objInfo) {
    if (err) {
      return console.log(err)
    }
    console.log('Success', objInfo)
  })
}

if(!fileExists){
  const response = await fetch(NEWS_API);
  const { data }: IResponse = await response.json();
  const articles = data.items;

  if (!response.ok) {
    console.error(response.statusText);
    Deno.exit(-1);
  }

  if(articles.length > 0) {

    for (let index = 0; index < articles.length; index++) {
      const articleInfo: IArticle = articles[index];
      // 更新 archives
      const archiveTextSingle = createArticle(articleInfo);
      allArchiveText.push(archiveTextSingle);
    }
  
    console.log(weeknumber);
    //moment().format('YYYYMMDDHHmm');
    writeJson(`${outdir}/${jsonfname}.json`,data);  
    uploadJson(`${outdir}/${jsonfname}.json`);
    await Deno.writeTextFile("./articles.html", allArchiveText.join("\n"), { append: true });
  }
}else{
  uploadJson(`${outdir}/${jsonfname}.json`);
}

//getBuckets();


