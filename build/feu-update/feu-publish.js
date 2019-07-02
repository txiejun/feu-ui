/**
 * feu-ui: feu-publish.js
 * 测试2
 * Description:
 * 发布流程：
 * 0、前置条件：需手动git pull拉取最新代码（防止命令自动拉取冲突）
 * 1、安装最新依赖包的版本
 * 2、打包当前代码库
 * 3、获得当前npm仓库最新版本号，并增加1，修改本地package.json的version字段
 * 4、发布到npm仓库
 * 5、后置条件：需要手动git push提交本地修改的代码及package.json
 *
 * Author: txiejun
 * Contact: txiejun@126.com
 * Time: 2018/12/27 15:37
 */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const os = require('os');
const Platform = {
    WIN:"win32",    //windows系统
    MAC:"darwin"    //mac系统
};

let step = 100;
let packageJson = require('../../package.json');
let packagePath = path.resolve(__dirname, '../../package.json');
let platform = os.platform();
console.log("os platform:"+platform);

//环境检测
if (!shell.which('npm')) {
    shell.echo('Error: Sorry, this script requires npm');
    shell.exit(1);
}

if(!packageJson){
    shell.echo('Error: file package.json is not exist');
    shell.exit(1);
}

if(!checkIsLogin()){
    shell.echo('Error: please login to the npm server first!');
    shell.exit(1);
}

let isSuceess = false;
let newVerName = "";
if(platform === Platform.MAC){
    //1、安装最新依赖包的版本

    //2、打包当前代码库
    if(shell.exec("sudo npm run build").code !== 0){
        shell.echo('Error: 打包' + packageJson.name + '失败');
        shell.exit(1);
    }

    //3、获得当前npm仓库最新版本号，并增加1，修改本地package.json的version字段
    let version = getLatestVersion();
    console.log("npm latest version:"+version);
    let nextVersion = getNexVersion(version);
    console.log("nextVersion:" + nextVersion);
    console.log("local package.version:" + packageJson.version);
    if(nextVersion){
        newVerName = packageJson.name + "@" + nextVersion;
        let packageStr = readFile(packagePath);
        packageStr = packageStr.replace(/"version":[\s]*"([0-9\.]+)"/, "\"version\": \"" + nextVersion + "\"");
        saveFile(packagePath , packageStr);

        //4、发布到npm仓库
        if(shell.exec("sudo npm publish").code == 0){
            isSuceess = true;
        }
    }
    if(isSuceess){
        console.log("====== " + newVerName + "发布成功 ======");
    }
    else{
        shell.echo('Error: ' + newVerName + '发布失败！！！');
        shell.exit(1);
    }
}
else if(platform === Platform.WIN){
    //1、安装最新依赖包的版本

    //2、打包当前代码库
    if(shell.exec("npm run build").code !== 0){
        shell.echo('Error: 打包' + packageJson.name + '失败');
        shell.exit(1);
    }

    //3、获得当前npm仓库最新版本号，并增加1，修改本地package.json的version字段
    let version = getLatestVersion();
    console.log("npm latest version:"+version);
    let nextVersion = getNexVersion(version);
    console.log("nextVersion:" + nextVersion);
    console.log("local package.version:" + packageJson.version);
    if(nextVersion){
        newVerName = packageJson.name + "@" + nextVersion;
        let packageStr = readFile(packagePath);
        packageStr = packageStr.replace(/"version":[\s]*"([0-9\.]+)"/, "\"version\": \"" + nextVersion + "\"");
        // console.log("package.json:"+packageStr);
        saveFile(packagePath , packageStr);

        //4、发布到npm仓库
        if(shell.exec("npm publish").code == 0){
            isSuceess = true;
        }
    }
    if(isSuceess){
        console.log("====== " + newVerName + "发布成功 ======");
    }
    else{
        shell.echo('Error: ' + newVerName + '发布失败！！！');
        shell.exit(1);
    }
}
else{
    shell.echo('Error: 不支持的平台：'+platform);
    shell.exit(1);
}

/**
 * 检查是否登录npm
 */
function checkIsLogin() {
    let flag = false;
    let result = null;
    if(platform === Platform.MAC){
        result = shell.exec("sudo npm whoami");
    }
    else if(platform === Platform.WIN){
        result = shell.exec("npm whoami");
    }
    if(result && result.code == 0){
        let npmAccount = result.stdout;
        console.log("npm account:"+npmAccount);
        flag = true;
    }
    return flag;
}

/**
 * 获得当前最新版本
 * TODO：解决可能存在多个tag的情况，npm包多个tag的版本号之间是共享命名空间的。
 * @returns {string}
 */
function getLatestVersion() {
    let ver = "";
    let result = null;
    if(platform === Platform.MAC){
        result = shell.exec("sudo npm dist-tag ls");
    }
    else if(platform === Platform.WIN){
        result = shell.exec("npm dist-tag ls");
    }
    if(result && result.code === 0){
        let str = result.stdout;
        let arr = str.split('\n');
        if(arr.length>0){
            for(let i=0; i<arr.length; i++){
                let item = arr[i];
                if(item&&item.indexOf(':')>=0){
                    let tempVer = item.split(':')[1] || '';
                    tempVer = tempVer.trim();
                    if(tempVer){
                        if(!ver){
                            ver = tempVer;
                        }
                        else if(compare(tempVer, ver)===1){
                            ver = tempVer;
                        }
                    }
                }
            }
        }
    }
    return ver;
}

/**
 * a和b两个版本号对比 解决直接字符串对比时：'0.12.4'小于'0.4.79'的情况
 * @param a 如：0.12.4
 * @param b 如：0.4.798
 * @returns {number} 1-a大于b，0-a等于b,-1-a小于b
 */
function compare(a, b) {
    let result = 0;
    if(a && b){
        let alist = a.split('.');
        let blist = b.split('.');
        if(alist.length==3 && blist.length==3){
            //标准格式
            if(parseInt(alist[0])>parseInt(blist[0])){
                result = 1;
            }
            else if(parseInt(alist[0])<parseInt(blist[0])){
                result = -1;
            }
            else{
                if(parseInt(alist[1])>parseInt(blist[1])){
                    result = 1;
                }
                else if(parseInt(alist[1])<parseInt(blist[1])){
                    result = -1;
                }
                else{
                    if(parseInt(alist[2])>parseInt(blist[2])){
                        result = 1;
                    }
                    else if(parseInt(alist[2])<parseInt(blist[2])){
                        result = -1;
                    }
                }
            }
        }
        else{
            //如果不是规范的格式，粗暴处理
            if(a>b){
                result = 1;
            }
            else if(a<b){
                result = -1;
            }
        }
    }

    return result;
}

/**
 * 最后两位版本号大于100，上一级版本号增加一个
 * @param version
 * @returns {string}
 */
function getNexVersion(version){
    let result = "";
    if(version){
        let arr = version.split(".");
        if(arr.length == 3){
            let v1 = parseInt(arr[0]);
            let v2 = parseInt(arr[1]);
            let v3 = parseInt(arr[2]);
            v3 += 1;
            if(v3>=step){
                v3 = 0;
                v2 += 1;
                if(v2 >= step){
                    v2 = 0;
                    v1 += 1;
                }
            }
            result = v1 + "." + v2 + "." + v3;
        }
    }
    return result;
}

function readFile(file) {
    let str = fs.readFileSync(file, { encoding: "utf-8" });
    return str;
}

function saveFile(file, text) {
    fs.writeFileSync(file, text);
}
