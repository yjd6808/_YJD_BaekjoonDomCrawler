var jsdom = require("jsdom");
var got = require("got");
var fileSystem = require("fs");
var jqueryUtility = require("./jquery-utility");

const { XMLHttpRequest } = require("xmlhttprequest");
const { exception } = require("console");
const { JSDOM } = jsdom;


/**
 * 글로벌 DOM을 변경합니다.
 * global.
 */
 exports.changeGlobalDOM = async function changeGlobalDOM(url) {
    var dom;
    try {
        var domOrError = await exports.downloadWebDOMAsync(url);

        if ( ! dom instanceof JSDOM ) {
            throw domOrError;
		}

		dom = domOrError;
    } catch (exception) {
        console.error(url + "\n" + "DOM 데이터를 가져오는데 실패했습니다.\nException : " + exception);
		return false;
    }

    try {
		jqueryUtility.initializeGlobalJqueryWithDom(dom);
        return true;
    } catch (exception) {
        console.error(url + "\n" + "로 글로벌 dom 변경에 실패했습니다.\nnException : " + exception);
        return false;
    }
}


/**
 * 웹페이지의 소스를 다운로드 합니다.
 * @param {string} url - 다운받고자 하는 웹사이트 주소
 */

 exports.downloadWebStringAsync = function downloadWebStringAsync(url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onload = function () {
            if (request.status != 200) {
                resolve(request.responseText);
            } else {
                reject(request.responseText);
            }
        };
        request.open("GET", url);
        request.send();
    });
}

/**
 * 웹페이지의 DOM을 가져옵니다.
 * @param {string} url - 다운받고자 하는 웹사이트 주소
 */

 exports.downloadWebDOMAsync = function downloadWebDOMAsync(url) {
    return new Promise(function (resolve, reject) {
        got(url)
            .then((response) => {
				if (response.statusCode == 200){
					resolve(new JSDOM(response.body));
				} else {
					resolve(url + 'downloadWebDOMAsync Fail ( Error Code : ' + response.statusCode + ' )');
				}
            })
			.catch(err =>
			{
				reject(url + ' ( ' + err + ' )');
			});
    });
}
