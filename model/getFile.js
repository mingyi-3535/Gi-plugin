import { promises as fs } from 'fs';
import fs_ from 'fs'
import { readFile, writeFile } from 'fs';
import path from 'path';
import { promisify } from 'util';
import yaml from 'yaml'
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
import getconfig from './cfg.js';

class Gimodel {
  /**
   * 已废弃
   * @param {*} filePath 
   * @param {*} callback 
   */
  async duquFile(filePath, callback) {
    console.log(`已废弃。`)
    /**fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      const lines = data.split('@');
      const Piaoliu = [];

      lines.forEach((line) => {
        line = line.slice(0, -1);
        const parts = line.split('；');
        const plp = parts[0];
        const userid = parts[1];
        Piaoliu.push(`@${plp}；${userid}`);
      });

      callback(Piaoliu);
    });**/
  }
  /**
   * 获取并解析文件内容
   * @param {*} dc 包含type和filePath
   * @param {*} e  e
   * @returns 
   */
  async NewgetFile(dc, e) {
    let data = await fs.readFile(dc.filePath, 'utf-8')
    const lines = data.split('@');
    const Piaoliu = [];
    let msgList = [];
    if (dc.type != `init`) {
      msgList.push({
        message: `${e.group_name}(${e.group_id})的历史文献`,
        nickname: `Q群管家`
      })
    }
    lines.forEach(async (line) => {
      line = line.slice(0, -1);
      const parts = line.split('；');
      const plp = parts[0];
      const userId = parts[1];
      if (dc.type == 'plp') {
        if (userId != undefined && userId != e.user_id) Piaoliu.push(`@${plp}；${userId}`)
      } else if (dc.type == 'history') {
        if (plp > 100000) {
          let history = userId
          let userid_ = await redis.get(`Yunzai:giplugin-${plp}_history_userid`);
          userid_ = JSON.parse(userid_);
          let username = await redis.get(`Yunzai:giplugin-${plp}_history_username`);
          username = JSON.parse(username);
          let date = await redis.get(`Yunzai:giplugin-${plp}_history_date`);
          date = JSON.parse(date);
          history = history.replace(/换行/g, '\n');
          let history_text =
            `文献编号:${plp}
贡献者:${username}(${userid_})
贡献时间:${date}
文献正文:
${history}`
          msgList.push({
            message: history_text,
            nickname: `${username}(${userid_})`
          })
        }
      } else if (dc.type == `rfb`) {
        if (userId == e.user_id) Piaoliu.push(`@${plp}；${userId}`)
      } else if (dc.type == `init`) {
        if (userId != undefined) Piaoliu.push(`@${plp}；${userId}`)
      }
    })
    if (dc.type == 'plp' || dc.type == 'rfb' || dc.type == `init`) return Piaoliu
    if (dc.type == 'history') return msgList
  }
  /**
   * 指定内容删除
   * @param {*} filePath 文件路径
   * @param {*} shuju1 内容
   */
  async delfile(filePath, shuju1) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const regex = new RegExp(shuju1.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\r?\\n?', 'g');
      const updatedData = data.replace(regex, '');
      await fs.writeFile(filePath, updatedData, 'utf8');
    } catch (error) {
      console.error(error);
    }

  }
  /**
   * 创建文件夹和文件
   * @param {*} filePath 文件路径，不包含文件名
   * @param {*} filename 文件名，不包含文件路径
   */
  async mdfile(filePath, filename) {
    if (!fs_.existsSync(filePath)) {
      fs.mkdirSync(filePath)
    }
    let filePath_ = path.join(filePath, filename)
    await fs.writeFile(filePath_, '');
  }
  async date_time() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const date_time = `${year}-${month}-${day}`;
    return date_time;
  }
  //废案
  async getplpid() {
    let { config } = getconfig(`resources`, `plp`)
    let plpid = config
    const randomIndex = Math.floor(Math.random() * plpid.plpid.length);
    const plpid_ = plpid.plpid[randomIndex];
    return plpid_
  }

  /**
 * 删除JSON数组内容
 * @param {*} deldata 要删除的数据
 * @param {string} filePath 路径
 */
  async deljson(deldata, filePath) {
    try {
      let data = fs_.readFileSync(filePath, 'utf-8');
      data = JSON.parse(data);
      if (!Array.isArray(data)) return false;
      let filteredData = []
      for (let item of data) {
        item = JSON.stringify(item)
        deldata = JSON.stringify(deldata)
        if (item != deldata) {
          item = JSON.parse(item)
          filteredData.push(item)
          deldata = JSON.parse(deldata)
        }
      }
      const tempData = JSON.stringify(filteredData, null, 3);
      console.log(tempData)
      fs_.writeFileSync(filePath, tempData, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error processing the file', error);
      return false;
    }
  }

  /**
   * 删除指定yaml中的内容 废案
   * @param {*} filePath 文件路径
   * @param {*} content 文件内容
   */
  async delyaml_plpid(filePath, content) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = yaml.parse(fileContent);
    data.plpid = data.plpid.filter(id => id !== content);
    const updatedFileContent = yaml.stringify(data);
    await fs.writeFile(filePath, updatedFileContent, 'utf-8');
  }
}

export default new Gimodel