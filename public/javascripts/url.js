/**
 * Created by mingxing_he@kingdee.com on 2016/10/20.
 */
var debug = false;
// var host_produce = "http://61.136.222.229:80";
var host_produce = "http://61.136.222.248:80";
//var host_test = "http://192.168.1.158:8089";
//var host_test = "http://61.136.222.246:8089";
//var host_test = "http://61.136.222.246:8089";//吉哲原服务
var host_test = "http://61.136.222.246:9081";//was测试环境
//var host_test = 'http://61.136.222.246:6666';//新标准测试服务
//var host_test = 'http://61.136.222.246:8088';//新标准测试服务
var common_biz_url = "/servlet/MobileApproveServlet";
var requrl = (debug ? host_test : host_produce) + common_biz_url;


//-----区分不同表单类型-------------------------------
var statuskeyparam = '';
var statuscodeparam = '';
var urlObj = getUrlParamObj();
//-----区分不同表单类型-------------------------------

/*
 * 获取当前页面（通用审批页面参数）
 * */
function getUrlParamObj() {
    var curUrl = window.location.href;//获取当前页面url地址（带参数的）
    var uri = new URI(curUrl);//实例化一个URI对象
    var paramObj = uri.search(true);//返回?之后链接对应参数所组成的js对象：例如uri == "http://example.org/bar/world.html?foo=bar&hello=world&hello=mars"  返回{ foo: "bar", hello : ["world", "mars"] }
    return paramObj;
}
/*
 * 区分不同表单类型
 * */
function distinguish(type) {
    switch (type) {
        case 'todohd'://需要我处理并且已经处理
            statuskeyparam = 'ishandled';
            statuscodeparam = 'handled';
            break;
        case 'todounhd'://需要我处理并且未处理
            statuskeyparam = 'ishandled';
            statuscodeparam = 'unhandled';
            break;
        case 'subhd'://我提交的并且已经处理
            statuskeyparam = 'submit';
            statuscodeparam = 'finished';
            break;
        case 'subunhd'://我提交的并且未处理
            statuskeyparam = 'submit';
            statuscodeparam = 'unhandled';
            break;
    }
}