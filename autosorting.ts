import { createArticle, getWeekNumber, writePackageJsonFile } from "./utils.ts";
import { existsSync } from "std/fs/exists.ts";
import "lodash/lodash.js";

const _ = (self as any)._;
const weeknumber = getWeekNumber(new Date());
const outdir = `./news/${weeknumber[0]}`;
const filename = `w${weeknumber[1]}_contents.json`;
console.log(weeknumber);
let fileExists = existsSync(`${outdir}/${filename}`);

const cityReg = /哈尔滨|长春|沈阳|石家庄|太原|成都|济南|合肥|南京|杭州|福州|南昌|长沙|武汉|广州|海口|昆明|西安|兰州|西宁|台北|呼和浩特|银川|黑龙江|吉林|辽宁|河北|山西|四川|山东|安徽|江苏|浙江|福建|江西|湖南|湖北|广东|海南|郑州|云南|兵团|陕西|澳门|贵州|甘肃|青海|深圳|重庆|台湾|内蒙古|河南|广西|宁夏|上海|沪深|青岛|国内|乌鲁木齐|北京|香港|中国|全国/g;

const intlReg = /以色列|韩美|印尼|法国|哥伦比亚|瑞士|俄罗斯|缅北|加拿大|韩国|斯里兰卡|意大利|澳洲|德意志银行|胡塞武装|美英|也门|英国|埃及|荷台达省|世卫组织|美联储|美国|联合国|欧元区|纳斯达克|越南|澳大利亚|泰国|日本|日经|北约|美股|新西兰|摩根士丹利|伊朗|朝鲜|土耳其|黎巴嫩|南非|利比亚|印度|新德里|乌克兰|马来西亚|欧委会|菲律宾|欧股|巴西|空中客车|LVMH|阿斯麦|马斯克|高盛|富国银行|标普500|英特尔|伦敦金属交易所|德国|阿根廷|欧洲央行|玻利维亚|加沙|波兰|欧洲|中东|北非|厄瓜多尔/g;

const apprLocReg = /工信部|海关总署|国家统计局|生态环境部|国家能源局|深中通道|国家外汇管理局|国家药监局|股份制商业银行|超长期特别国债|人民币信用债|工业和信息化部|航天局|中证|发改委|司法部|国开行|涉税服务|市场监管总局|金融监管总局|金融监督管理总局|中国人民银行|住建部|经济日报|最高法|人民代表大会常务委员会|新华社|自然资源部|国新办|商务部|农业农村部|上交所|外交部|进出口行|证监局|证监会|国家卫生健康委|财政部|国务院|农发行|年期国债|中指研究院|中央网信办|全国铁路|近央行人士|百度|国庆|离岸人民币/g;

const companyReg = /台积电|恒生科技|恒指|鸿海精密|东方财富|吉利汽车|赛力斯|嘉禾生物|港交所|天猫|去哪儿|蔚来|茅台飞天|飞天茅台|特斯拉|腾讯|创业板|波音|诺基亚|瑞芯微|毫末智行|中信建投|荣科科技|海通证券|招商蛇口|沪指|港股|北证50指数|昊铂|小鹏|极氪|理想|极星汽车|远洋集团|比亚迪|工商银行|岚图汽车|零跑汽车|Shibor|联想|SHIBOR/g;

const futuresReg = /氧化铝|白银|比特币|期货|现货黄金|集运指数|主力合约/g;

const checkContent = function(path,id){
  const content = Deno.readTextFileSync(path);
  if(content){
    const data = JSON.parse(content);
    //console.log(data.items.length);
    const filteredById = _.filter(data.items, { 'id': Number(id.replace('wscn_','')) });
    if(filteredById.length>0 && filteredById[0]){
      var result = filteredById[0].content_text.match(cityReg);
      var result1 = filteredById[0].content_text.match(intlReg);
      var result2 = filteredById[0].content_text.match(apprLocReg);
      var result3 = filteredById[0].content_text.match(companyReg);
      var result4 = filteredById[0].content_text.match(futuresReg);
      if(result || result1 || result2 || result3 || result4){
        return true;
      }else{
        return false;
      }
    }
    //return false;
  }
}


if(fileExists){
  const cthad = Deno.readTextFileSync(`${outdir}/${filename}`);
  if(cthad){
    const data = JSON.parse(cthad);

    let hasCity = 0;

    for (let index = 0; index < data.cc.length; index++) {
      const nArticle = data.cc[index];
      var result = nArticle.title.match(cityReg);
      var result1 = nArticle.title.match(intlReg);
      var result2 = nArticle.title.match(apprLocReg);
      var result3 = nArticle.title.match(companyReg);
      var result4 = nArticle.title.match(futuresReg);
      if(result || result1 || result2 || result3 || result4){
        hasCity++;
      }else{
        const chkContent = checkContent(nArticle.file,nArticle.id)
        if(chkContent)hasCity++;
        if(!chkContent)
          console.log(nArticle.title,nArticle.id);
      }
    }

    console.log(data.cc.length,hasCity,(hasCity/data.cc.length*100).toFixed(2)+"%");
  }
}