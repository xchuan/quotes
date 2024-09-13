#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json mod.ts
import { IResponse, IImg, IArticle, ArticleContent } from "./types.ts";
import { createArticle, getWeekNumber, writePackageJsonFile } from "./utils.ts";
import * as Minio from "minio";
import { existsSync } from "std/fs/exists.ts";
import moment from 'moment';
import { load } from "std/dotenv/mod.ts";
import "lodash/lodash.js";

const _ = (self as any)._;
const env = await load();
const accessKey = env["ACCESS_KEY"];
const secretKey = env["SECRET_KEY"];
const endPoint = env["END_POINT"];
const endPointPort = env["END_POINT_PORT"];
const NEWS_API_ONE = env["NEWS_API_ONE"];

const minioClient = new Minio.Client({
  endPoint: endPoint,
  port: Number(endPointPort),
  useSSL: true,
  accessKey: accessKey,
  secretKey: secretKey,
})

const getBuckets = async() =>{
  try {
    const buckets = await minioClient.listBuckets();
    //minioClient.fPutObject
    console.log('Success', buckets)
  } catch (err) {
    console.log(endPoint,err.message)
  }
}

const allArchiveText:string[] = [];
const weeknumber = getWeekNumber(new Date());
const outdir = `./news/${weeknumber[0]}/w${weeknumber[1]}`;
const outdirYear = `./news/${weeknumber[0]}/w${weeknumber[1]}_`;
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

const uploadJsonCustom = (filename:string, filepath:string) => {
  const metaData = {
    'Content-Type': 'application/json',
  }
  minioClient.fPutObject('nchome', filename, filepath, metaData, function (err, objInfo) {
    if (err) {
      return console.log(err)
    }
    console.log('Success', objInfo)
  })
}
let oldList:ArticleContent[] = [];


if(!fileExists){
  //const response = await fetch(Deno.env.get("NEWS_API_ONE") as string);
  const response = await fetch(NEWS_API_ONE);
  const { data }: IResponse = await response.json();
  const articles = data.items;
  const weekContent = {}

  if (!response.ok) {
    console.error(response.statusText);
    Deno.exit(-1);
  }

  if(articles.length > 0) {

    console.log(weeknumber);
    if(existsSync(`${outdirYear}contents.json`)){
      const cthad = Deno.readTextFileSync(`${outdirYear}contents.json`);
      console.log(cthad.length,"cthad.length");
      if(cthad){
        const data = JSON.parse(cthad);
        oldList = data['cc'];
      }
    }

    const alloldids = _.map(oldList, 'id');
    

    const artList:ArticleContent[] = []

    for (let index = 0; index < articles.length; index++) {
      const articleInfo: IArticle = articles[index];
      // 更新 archives
      const archiveTextSingle = createArticle(articleInfo);
      allArchiveText.push(archiveTextSingle);

      if(_.indexOf(alloldids,`wscn_${articleInfo.id}`)==-1){
        artList.push({
          id:`wscn_${articleInfo.id}`,
          title:articleInfo.title == "" ? articleInfo.content_text : articleInfo.title,
          author:articleInfo.author ? articleInfo.author.display_name : "",
          datetime:articleInfo.display_time,
          file:`${outdir}/${jsonfname}.json`
        });  
      }
    }

    weekContent['cc'] = oldList.concat(artList);

    writePackageJsonFile(`${outdirYear}contents.json`,weekContent);
    //writeJson(`${outdirYear}contents.json`,weekContent);
    //moment().format('YYYYMMDDHHmm');
    writePackageJsonFile(`${outdir}/${jsonfname}.json`,data);
    uploadJson(`${outdir}/${jsonfname}.json`);
    await Deno.writeTextFile("./articles.html", allArchiveText.join("\n"), { append: true });
  }
}else{
  console.log('upload contents.json');
  const cthad = Deno.readTextFileSync(`${outdirYear}contents.json`);
  if(cthad && cthad.length>0){
    const data = JSON.parse(cthad);
    oldList = data['cc'];
  }

  console.log(_.map(oldList, 'id').length);
  
  uploadJson(`${outdir}/${jsonfname}.json`);
  uploadJsonCustom(`w${weeknumber[1]}_contents.json`,`${outdirYear}contents.json`);
}

//getBuckets();


