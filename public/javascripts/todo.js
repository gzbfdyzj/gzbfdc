toastr.options = {
    "closeButton": false,
    "debug": true,
    "positionClass": "toast-bottom-full-width",
    "onclick": null,
    "showDuration": "1",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
var app = angular.module('todo', ['ngCookies']);
var pageSize = 10;
$('#myTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show')
});
function switchTab(currentTab) {
    switch (currentTab) {
        case 'todounhd':
            XuntongJSBridge.call('setWebViewTitle', '待办流程');
            break;
        case 'todohd':
            XuntongJSBridge.call('setWebViewTitle', '已办流程');
            break;
        case 'subunhd':
            XuntongJSBridge.call('setWebViewTitle', '我的在办');
            break;
        case 'subhd':
            XuntongJSBridge.call('setWebViewTitle', '我的已办');
            break;

    }
}
var count = 0;
app.controller('matters', function ($scope, $http, $cookieStore, $window) {
        //XuntongJSBridge.call('defback',
        //    {},
        //    function () {
        //        $cookieStore.remove('currentTab');
        //        XuntongJSBridge.call('closeWebView');
        //    }
        //);
        if (!$cookieStore.get('isFirst')) {
            $cookieStore.put('isFirst', true);
            location.reload(true);
        } else {
            if (isYzjApp() || getCloudHub().isCloudHub) {//如果运行在云之家（Android或IOS的云之家APP客户端）里面，才能执行下面的逻辑}
                XuntongJSBridge.call('getPersonInfo', {}, function (result) {
                        /* ****  注意 start **** */
                        /* ****  由于在桌面端，实现JS-API方式不同，这里的回调返回值result是一个string **** */
                        /* ****  为确保result正常使用，建议在回调中添加如下代码 **** */
                        if (typeof result == 'string') {
                            result = JSON.parse(result);
                        }
                        /* ****  注意 end **** */

                        userid = result.data.openId;
                        //userid = 'fcbe652e-9f22-11e6-943d-005056b8712a';//高梦雅
                        //userid = 'ed3fbe63-95d8-11e6-a383-005056b8712a';//陈急着
                        //userid ='6b2da1c2-95d8-11e6-a383-005056b8712a';//杨总
                    var currentTab = $cookieStore.get('currentTab');
                    if (currentTab) {//如果currentTab不为空
                        switchTab(currentTab);
                    } else {
                        switchTab('todounhd');
                    }
                    document.getElementById('spinner').style.visibility = 'visible';
                    $scope.setCookie = function (cookieValue) {
                        $cookieStore.put('currentTab', cookieValue);
                    };
                    $scope.isActive = function (historyTab) {
                        if (!currentTab) {//如果第一次打开
                            if (historyTab == 'todounhd') {//默认显示待办流程
                                $cookieStore.put('currentTab', 'todounhd');
                                XuntongJSBridge.call('setWebViewTitle', '待办流程');
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            if (historyTab == currentTab) {//如果页签对应上了cookie里面存储的历史页签，那么返回true
                                switchTab(currentTab);
                                return true;
                            } else {
                                return false;
                            }
                        }
                    };
                    $scope.showTitle = function (title) {
                        XuntongJSBridge.call('setWebViewTitle', {'title': title});
                    };
                    $scope.hds = [];
                    $scope.unhds = [];
                    $scope.subhds = [];
                    $scope.subunhds = [];
                    $scope.todounhdcount = 0;
                    $scope.todohdcount = 0;
                    $scope.subhdcount = 0;
                    $scope.subunhdcount = 0;
                    $scope.getMatters = function (type) {
                        document.getElementById('spinner').style.visibility = 'visible';
                        distinguish(type);
                        switch (type) {
                            case 'todounhd':
                                count = $scope.todounhdcount;
                                $scope.todounhdcount = $scope.todounhdcount + 1;
                                break;
                            case 'todohd':
                                count = $scope.todohdcount;
                                $scope.todohdcount = $scope.todohdcount + 1;
                                break;
                            case 'subhd':
                                count = $scope.subhdcount;
                                $scope.subhdcount = $scope.subhdcount + 1;
                                break;
                            case 'subunhd':
                                count = $scope.subunhdcount;
                                $scope.subunhdcount = $scope.subunhdcount + 1;
                                break;

                        }
                        $http({
                                method: 'get',
                                // url: requrl,
                                url: "../../data/test.json",
                                params: {
                                    userid: userid,
                                    statuskey: statuskeyparam,
                                    statuscode: statuscodeparam,
                                    startline: count * pageSize,
                                    count: pageSize,
                                    condition: '',
                                    method: 'getTaskList'
                                }
                            }
                        ).success(function (response) {
                                document.getElementById('spinner').style.visibility = 'hidden';
                                console.log(type);
                                console.log(response);
                                if (response.flag) {
                                    if (response.data.length == 0) {
                                        //toastr.info('暂无待办');
                                        document.getElementById('hdload').style.visibility = 'hidden';
                                        document.getElementById('unhdload').style.visibility = 'hidden';
                                        document.getElementById('subhdload').style.visibility = 'hidden';
                                        document.getElementById('subunhdload').style.visibility = 'hidden';
                                    } else {
                                        switch (type) {
                                            case 'todohd'://需要我处理并且已经处理
                                                document.getElementById('mytabcontent').style.visibility = 'visible';
                                                if (response.data.length == pageSize) {
                                                    document.getElementById('hdload').style.visibility = 'visible';
                                                } else {
                                                    document.getElementById('hdload').style.visibility = 'hidden';
                                                }
                                                $scope.hds = $scope.hds.concat(response.data);
                                                break;
                                            case 'todounhd'://需要我处理并且未处理
                                                document.getElementById('mytabcontent').style.visibility = 'visible';
                                                if (response.data.length == pageSize) {
                                                    document.getElementById('unhdload').style.visibility = 'visible';
                                                } else {
                                                    document.getElementById('unhdload').style.visibility = 'hidden';
                                                }
                                                $scope.unhds = $scope.unhds.concat(response.data);
                                                break;
                                            case 'subhd'://我提交的并且已经处理
                                                document.getElementById('mytabcontent').style.visibility = 'visible';
                                                if (response.data.length == pageSize) {
                                                    document.getElementById('subhdload').style.visibility = 'visible';
                                                } else {
                                                    document.getElementById('subhdload').style.visibility = 'hidden';
                                                }
                                                $scope.subhds = $scope.subhds.concat(response.data);
                                                break;
                                            case 'subunhd'://我提交的并且未处理
                                                document.getElementById('mytabcontent').style.visibility = 'visible';
                                                if (response.data.length == pageSize) {
                                                    document.getElementById('subunhdload').style.visibility = 'visible';
                                                } else {
                                                    document.getElementById('subunhdload').style.visibility = 'hidden';
                                                }
                                                $scope.subunhds = $scope.subunhds.concat(response.data);
                                                break;
                                        }

                                    }
                                } else {
                                    console.log("错误接收")
                                    toastr.error(response.desc);
                                }
                            });

                    };
                    $scope.getMatters('todohd');
                    $scope.getMatters('todounhd');
                    $scope.getMatters('subhd');
                    $scope.getMatters('subunhd');
                    $scope.goDetail = function (matter, type) {
                        var uri = new URI('/form');
                        uri.addQuery('taskid', matter.taskid);
                        uri.addQuery('userid', userid);
                        uri.addQuery('billtype', matter.billtype);
                        uri.addQuery('ts', matter.senddate);
                        uri.addQuery('billid', matter.billid);
                        uri.addQuery('isFromApp', false);//记录来自App还是轻应用
                        uri.addQuery('type', type);//跳转到表单详情页面时，携带了type参数，用来告知表单详情页面过来的这个待办是哪种类型的待办。
                        window.location = uri.toString();
                    };
                    }//func
                );//xuntong
            }//if
        }

    }
);

//判断是否运行于云之家App中
function isYzjApp() {
    return !!navigator.userAgent.match(/Qing\/.*;(iPhone|Android).*/);
}

/* 判断是否运行于云之家桌面端
 * @return {object} cloudhub 返回是否桌面端、当前桌面端userAgent版本及是否支持JS-API
 * cloudhub = {isCloudHub: true | false, hasJS-APIt: true | false, version: '0.0.1'}
 */
function getCloudHub() {
    var ua = window.navigator.userAgent;
    var reg = /cloudhub 10204\/([^;]+)/;
    var cloudhub = {
        isCloudHub: false,
        hasJS_APIt: false,
        version: ''
    };

    var match = reg.exec(ua), version;

    if (match) {
        version = match[1];
        cloudhub.isCloudHub = true,
            cloudhub.version = version;

        if (version.replace(/\./g, '') > 1) {
            cloudhub.hasJS_APIt = true;
        }
    }

    return cloudhub;
}