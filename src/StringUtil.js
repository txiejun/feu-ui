/**
 * static-npm: StringUtil.js
 * Description 字符串处理类
 * Author: txiejun
 * Contact: txiejun@126.com
 * Time: 2018/12/27 15:37
 */

class StringUtil{
    constructor() {
    }

    /**
     * 获取url的query参数
     * @param name
     * @returns {*}
     */
    static getQueryString(name){
        let obj = StringUtil.searchToObj(window.location.search);
        return obj[name];
    }

    /**
     * 获得url的所有query参数
     * @returns {{}}
     */
    static getQueryObj(){
        let obj = StringUtil.searchToObj(window.location.search);
        return obj;
    }

    // static getQueryString(name){
    //     let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    //     let r = window.location.search.substr(1).match(reg);
    //     if (r != null){
    //         return decodeURIComponent(r[2]);
    //     }
    //     else{
    //         return null;
    //     }
    // }

    /**
     * search字符串转对象
     * @param search
     * @returns {{}}
     */
    static searchToObj(search){
        let result = {};
        if(search){
            //只考虑最后一个？后面的参数
            let index = search.lastIndexOf("?");
            if(index!=-1){
                search = search.substring(index+1, search.length);
            }
            if(search){
                let list = search.split("&");
                if(list.length>0){
                    list.map((item, i)=>{
                        if(item){
                            let arr = item.split("=");
                            if(arr.length>1){
                                result[arr[0]] = arr[1];
                            }
                        }
                    });
                }
            }
        }
        return result;
    }

    /**
     * 对象转search字符串
     * @param obj
     * @returns {string}
     */
    static objToSearch(obj){
        let list = [];
        if(obj){
            for(let key in obj){
                list.push(key+"="+obj[key]);
            }
        }

        return list.join("&");
    }

    static getSearch(url){
        let result = "";
        if(url){
            let index = url.lastIndexOf("?");
            if(index!=-1){
                result = url.substring(index+1, url.length);
            }

        }
        return result;
    }

    /**
     * 附加search参数到url地址上
     * @param url
     * @param search 如果url里面有相同名称到key会被覆盖
     * @returns {*}
     */
    static appendSearch(url, search){
        let result = url;
        if(url && search){
            let index = url.lastIndexOf("?");
            if(index!=-1){
                //存在老参数 融合
                if(StringUtil.isString(search)){
                    search = StringUtil.searchToObj(search);
                }
                let _path = url.substring(0, index);
                let _oldSearch = url.substring(index+1, url.length);
                _oldSearch = StringUtil.searchToObj(_oldSearch);
                search = Object.assign({}, _oldSearch, search);
                result = _path + "?" + StringUtil.objToSearch(search);
            }
            else{
                //之前没有参数
                if(StringUtil.isString(search)){
                    result = url + "?" + search;
                }
                else if(StringUtil.isObject(search)){
                    result = url + "?" + StringUtil.objToSearch(search);
                }
            }
        }
        return result;
    }

    /**
     * 检查字符串是否合法-最小范围
     * @param str
     * @returns {boolean}
     */
    static checkValidateMin(str){
        var result = true;
        if(str && (str.indexOf("\\")!=-1 || str.indexOf("\"")!=-1)){
            result = false;
        }
        return result;
    }

    /**
     * 检测字符串是否由数字、中文、下划线组成
     * @param str
     * @returns {boolean}
     */
    static checkValidate(str){
        var result = true;
        if(str && (/[^a-zA-z_0-9\u4e00-\u9fa5]/g.test(str))){
            result = false;
        }
        return result;
    }

    /**
     * 删除字符串两边的空白字符
     * @param str
     * @returns {string}
     */
    static trim(str){
        if(str){
            let newStr = str.replace(/(^\s*)|(\s*$)/g, "");
            return newStr;
        }
        return "";
    }

    /**
     * 删除左侧空白字符
     * @param str
     * @returns {string}
     */
    static ltrim(str){
        if(str){
            let newStr = str.replace(/(^\s*)/g,"");
            return newStr;
        }
        return "";
    }

    /**
     * 删除右边的空白字符
     * @param str
     * @returns {string}
     */
    static rtrim(str){
        if(str){
            let newStr = str.replace(/(\s*$)/g,"");
            return newStr;
        }
        return "";
    }

    /**
     * 中文字符当做2个长度计算
     * @param str
     * @returns {number}
     */
    static getLength(str) {
        let len = 0;
        let strLen = str.length;
        for(let i = 0; i < strLen; i++) {
            let charCode = str.charCodeAt(i);
            if(charCode >= 0 && charCode <= 128) {
                len += 1;
            }else {
                len += 2;
            }
        }
        return len;
    }

    /**
     * 中文字符当两个长度计算
     * @param str
     * @returns {number}
     */
    static realLength(str){
        let len = 0;
        if(str){
            len = str.replace(/[^\x00-\xff]/g, "**").length; // [^\x00-\xff] - 匹配非双字节的字符
        }
        return len;
    }

    /**
     * 中文字符当两个长度计算 截取字符串
     * @param str
     * @param n
     * @returns {*}
     */
    static realSubstring(str, n){
        if(str){
            if(StringUtil.realLength(str)<=n){
                return str;
            }
            let m = Math.floor(n/2);
            let len = str.length;
            for(let i=m;i<=len;i++){
                let temp = str.substr(0,i);
                let _len = StringUtil.realLength(temp);
                if(_len>n){
                    return str.substr(0,i-1);
                }
            }
        }

        return str;
    }

    /**
     * 判断是否为数组
     * @param object
     * @returns {*|boolean}
     */
    static isArray(object){
        if(Array.isArray){
            return Array.isArray(object);
        }
        else{
            return object && typeof object === 'object' && Array == object.constructor;
        }
    }

    /**
     * 判断是否为字符串
     * @param object
     * @returns {boolean}
     */
    static isString(object){
        return object && typeof object === "string" && String == object.constructor;
    }

    /**
     * 判断是否为Objec对象
     * @param object
     * @returns {*|boolean}
     */
    static isObject(object){
        return object && typeof object === "object" && Object == object.constructor;
    }

    /**
     * 判断是否为Function对象
     * @param object
     * @returns {*|boolean}
     */
    static isFunction(object){
        return object && typeof object === "function" && Function == object.constructor;
    }
}

export default StringUtil;