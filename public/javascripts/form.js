var app = angular.module('form', ['ngCookies', 'panzoom', 'panzoomwidget']);
toastr.options = {
    "closeButton": false,
    "debug": true,
    "positionClass": "toast-top-full-width",
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
/*
 * 延时关闭当前界面
 * */
function deplayCloseCurrentPage() {
    setTimeout(function () {
        if (history.length <= 1 || getUrlParamObj()['isFromApp'] == 'true') { //顶级页面，则关闭当前Web
            XuntongJSBridge.call('closeWebView');
        } else {
            history.back();
            //location.replace(document.referrer);//返回上一页刷新
        }
    }, 1500);
}
var yzjPerson = {};
app.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
}).controller('form_detail', function ($scope, $http, $cookieStore, PanZoomService) {

    $scope.isShowZoom = false;
    $scope.getPanzoomStype = function () {
        var width = $(window).width();   // returns width of browser viewport
        var height = $(window).height();   // returns width of browser viewport
        //$(document).width();
        return {
            "width": width,
            "height": height
        }
    };

    // Instantiate models which will be passed to <panzoom> and <panzoomwidget>

    // The panzoom config model can be used to override default configuration values
    $scope.panzoomConfig = {
        zoomLevels: 12,
        neutralZoomLevel: 5,
        scalePerZoomLevel: 1.5,
        useHardwareAcceleration: true
        //initialZoomToFit: {
        //    x: 0,
        //    y: 0,
        //    width: 0,
        //    height: 0
        //}
    };

    // The panzoom model should initialle be empty; it is initialized by the <panzoom>
    // directive. It can be used to read the current state of pan and zoom. Also, it will
    // contain methods for manipulating this state.
    $scope.panzoomModel = {};

    $cookieStore.put('isFirst', false);
    XuntongJSBridge.call('setWebViewTitle', {'title': '表单详情'});
    //var iszp = $cookieStore.get('iszhipai');
    //console.log(iszp);
    //if(iszp){
    //    if (history.length <= 1 || getUrlParamObj()['isFromApp'] == 'true') { //顶级页面，则关闭当前Web
    //        XuntongJSBridge.call('closeWebView');
    //    } else {
    //        history.back();
    //    }
    //}
    $scope.openPersonTab = function () {
        XuntongJSBridge.call('personInfo', {
            //'openId': res.data.createopenid
            'openId': $scope.starter.openId
        }, function (result) {
        });
    };
    if (urlObj.isFromApp == 'true') {
        console.log(urlObj)
        $http({
            method: 'get',
            url: requrl,
            params: {
                taskid: urlObj.taskid,
                method: 'getAPPTaskStatus'
            }
        }).success(function (response) {
            console.log(response);
            if (response.data.isexist == 'true') {
                if (response.data.istodo == 'true') {
                    document.getElementsByClassName('container')[0].style.visibility = 'visible';
                    document.getElementById('footer').style.visibility = 'visible';

                } else if (response.data.istodo == 'false') {
                    document.getElementsByClassName('container')[0].style.visibility = 'visible';
                    document.getElementById('footer').style.visibility = 'hidden';
                }
            } else {
                toastr.error('该任务已被其他人处理');
                document.querySelector('.ls1').style.visibility = 'hidden';
                document.querySelector('.ls2').style.visibility = 'hidden';
            }

        });
    } else {
        document.getElementsByClassName('container')[0].style.visibility = 'visible';
        if (urlObj.type == 'todounhd') {
            document.getElementById('footer').style.visibility = 'visible';
        } else {
            document.getElementById('footer').style.visibility = 'hidden';
        }
    }
    $http({
        method: 'get',
        url: requrl,
        params: {
            billid: urlObj.billid,
            billtype: urlObj.billtype,
            method: 'getTaskSenderInfo'
        }
    }).success(function (response) {
        $scope.starter = response.data;

    });
    $scope.isApproved = false;
    $scope.note = '';
    $scope.onInputNote = function (note) {
        console.log(note);
        if (note == undefined || note == '') {

            document.getElementById('confirm').style = 'background-color:grey';
            return true;
        } else {
            document.getElementById('confirm').style = 'background-color:#3cbaff';
            return false;
        }
    };
    $('#myModal').on('hidden.bs.modal', function (e) {
        //console.log('隐藏了');
    });
    $('#myModal').on('show.bs.modal', function (e) {
        //console.log('显示了');
    });
    $scope.agree = 'agree';
    $scope.disagree = 'disagree';
    $scope.mreject = 'reject';
    $scope.currentOper = '';
    $scope.task = {};
    $scope.goAttach = function () {
        var uri = new URI('/attachment');
        uri.addQuery('billid', urlObj.billid);
        uri.addQuery('billtype', urlObj.billtype);
        window.location = uri.toString();
    };
    // $scope.goApprove = function () {
    //     var uri = new URI('/history');
    //     uri.addQuery('billid', urlObj.billid);
    //     uri.addQuery('billtype', urlObj.billtype);
    //     uri.addQuery('taskid', urlObj.taskid);
    //     uri.addQuery('ts', $scope.task.data.ts);
    //     window.location = uri.toString();
    // };
    $scope.assigns = [];
    $scope.selecteds = [];
    $scope.selectedUserIdStr = '';
    $scope.isZhiPai = function () {
        if ($scope.selecteds.length == 0) {
            return true;
        } else {
            return false;
        }
    };
    $scope.selectAll = function () {
        $scope.selecteds = ($scope.selecteds).concat($scope.assigns);
        $scope.assigns = [];
    };
    $scope.cancelAll = function () {
        $scope.assigns = ($scope.selecteds).concat($scope.assigns);
        $scope.selecteds = [];
    };

    $scope.pushSelecteds = function (index) {
        $scope.selecteds.push($scope.assigns[index]);
        $scope.assigns.splice(index, 1);
    };
    $scope.pushAssigns = function (index) {
        $scope.assigns.push($scope.selecteds[index]);
        $scope.selecteds.splice(index, 1);
    };
    $scope.oper = function (operation) {
        $scope.currentOper = operation;
        document.getElementById('confirm').style = 'background-color:#3cbaff';
        if (operation == 'agree') {
            //$http({
            //    method: 'get',
            //    url: 'json/history',
            //    params: {}
            //}).success(function (response) {
            //    console.log(response);
            //    $scope.assigns = response.data;
            //});
            $scope.note = '批准';//每次点击前，需要清空note，这样，不管之前是以何种方式关闭了对话框，不管是否已经填写了建议，都先清空，重新填写。
            //$('#myModal').modal({
            //    show: true
            //});
        } else if (operation == 'disagree') {
            $scope.note = '不批准';
        } else if (operation == 'reject') {
            $scope.note = '驳回';
        }

    };
    $scope.submit = function (operation) {
        $http({
            method: 'get',
            url: requrl,
            params: {
                userid: urlObj.userid,
                taskid: urlObj.taskid,
                action: operation,
                note: $scope.note,
                method: 'dealTask'
            }
        }).success(function (response) {
            console.log(response);
            if (response.flag == 0) {
                $scope.assigns = [];
                $scope.selecteds = [];

                if (response.data.isAssign == 'Y') {//有指派信息
                    $scope.assigns = response.data.psnstructlist;
                    $cookieStore.put('psnstructlist', response.data.psnstructlist);
                    var uri = new URI('/users/zhipai');
                    uri.addQuery('userid', urlObj.userid);
                    uri.addQuery('taskid', urlObj.taskid);
                    uri.addQuery('action', operation);
                    uri.addQuery('note', $scope.note);
                    uri.addQuery('isFromApp', getUrlParamObj()['isFromApp']);
                    window.location = uri.toString();
                    //$('#myModal').modal({
                    //    show: true
                    //});
                } else {//没有指派信息直接关闭当前界面
                    toastr.success('审批成功');
                    deplayCloseCurrentPage();
                    $scope.isApproved = true;
                    $('#footer > div:first-child').removeAttr('data-toggle');
                    $('#footer > div:nth-child(2)').removeAttr('data-toggle');
                    $('#footer > div:nth-child(3)').removeAttr('data-toggle');
                }
            } else {
                toastr.error(response.desc);
            }


        });
    };
    $scope.mcancel = function () {
        $scope.note = '';
    };
    distinguish(urlObj.type);
    document.getElementById('spinner').style.visibility = 'visible';
    $http(
        {
            method: 'get',
            url: requrl,
            params: {
                statuskey: statuskeyparam,
                statuscode: statuscodeparam,
                taskid: urlObj.taskid,
                method: 'GetTask'
            }
        }
    ).success(function (response) {
        //附件
            document.getElementById('spinner').style.visibility = 'hidden';
            console.log(response);
            if (response.data.filecount > 0) {
                document.getElementById('form_links_appendix').style.visibility = 'visible';
            }
            $scope.task = response;
            //预算表单的三种类型：T1
            //if (response.data.billtype == 'T1') {
            //    document.getElementById('yusuan_form').style.visibility = 'visible';
            //    //angular.element(document).find("#table").html(response.data.taskbill);
            //    var tablesStr = response.data.taskbill;
            //    var tableStrs = tablesStr.split('<\/table>');
            //    var tableStrArray = [];
            //    var titleArray = [];
            //    for (var i = 0; i < tableStrs.length - 1; i++) {
            //
            //        var index = tableStrs[i].indexOf('<table');
            //        var tableStr = tableStrs[i].substring(index, tableStrs[i].length) + '<\/table>';
            //        var titleTr = tableStr.split('<tr>')[2];//获取第三行第一列的数据
            //        var titleTd = titleTr.split('<\/td>')[0];
            //        var title = titleTd.split('>')[1];
            //        tableStrArray.push(tableStr);
            //        if (escape(title).indexOf("%u") < 0) {//如果不包含中文
            //            titleArray.push('表' + (i + 1));
            //
            //        } else {
            //            titleArray.push(title);
            //        }
            //
            //    }
            //    $scope.formcontents = tableStrArray;
            //    $scope.formtitles = titleArray;
            //} else {
                document.getElementById('form_info').style.visibility = 'visible';
                //document.getElementById('table').style.visibility = 'hidden';
                if (response.flag == 0) {
                    $scope.heads = response.data.taskbill.head.tabContent;

                    var bodys = response.data.taskbill.body.tabContent;
                    for (var i = 0; i < bodys.length; i++) {
                        for (var j = 0; j < bodys[i]['tabdata'].length; j++) {
                            for (var k = 0; k < bodys[i]['tabdata'][j].length; k++) {
                                var newstring = null;
                                var oldstring = bodys[i].tabdata[j][k]['colvalue'];
                                for (var m = 0; m < oldstring.length; m++) {
                                    if (m % 10 == 0) {
                                        var temp = oldstring.substr(m, 10) + "<br>";
                                        m == 0 ? newstring = temp : newstring += temp;
                                    }
                                }

                                console.log(newstring);
                                bodys[i].tabdata[j][k]['colvalue'] = newstring;
                            }
                        }
                    }
                    $scope.bodys = response.data.taskbill.body.tabContent;
                    console.log($scope.bodys[0]['tabdata'][0])
                    $('#myTab a').click(function (e) {
                        e.preventDefault();
                        $(this).tab('show')
                    });
                    $('#myTab a:first').tab('show');
                } else {
                    toastr.error(response.desc);
                }
            //}
        });
    // 2017.06.22增加历史审批code
    $http({
        method: 'get',
        url: requrl,
        params: {
            billid: urlObj.billid,
            billtype: urlObj.billtype,
            method: 'getApproveHistoryToForm'
        }
    }).success(function (response) {
        console.log(response);
        if (response.flag == 0) {
                $scope.task = response;
            //预算表单的三种类型：T1
            //if (response.data.billtype == 'T1') {
            //    document.getElementById('yusu
            $scope.historys = response.data;
            console.log($scope.historys)
            $('#myTab a').click(function (e) {
                        e.preventDefault();
                        $(this).tab('show')
                    });
            $('#myTab a:first').tab('show');
            
        } else {
            toastr.error(response.desc);
        }
    });

});
