/**
 * ==============================
 * Jquery 관련
 * ==============================
 */

var jsdom = require("jsdom");
var jquery = require('jquery');
const { JSDOM } = jsdom;

exports.initializeGlobalJquery = function initializeGlobalJquery() {
    const { window } = new JSDOM();
    const { document } = new JSDOM("").window;
    global.document = document;
    global.$ = (jQuery = require("jquery")(window));
};

exports.initializeGlobalJqueryWithDom = function initializeGlobalJqueryWithDom(dom) {
    const { window } = dom;
    const { document } = dom.window;
    global.document = document;
    global.$ = (jQuery = require("jquery")(window));
};
