/**
 * Created by Administrator on 2016/10/26.
 */
var app = angular.module('history', []);
app.filter('selectIcon', function () {
    return function (input) {
        var out = '';
        switch (input) {
            case '提交':
                out = 'glyphicon glyphicon-arrow-up item-icon item-icon-blue';
                break;
            case '批准':
                out = 'glyphicon glyphicon-ok-sign item-icon item-icon-green';
                break;
            case '不批准':
                out = 'glyphicon glyphicon-remove-circle item-icon item-icon-red';
                break;
            case '驳回':
                out = 'glyphicon glyphicon-repeat item-icon item-icon-purple';
                break;
            case  '作废':
                out = 'glyphicon glyphicon-trash item-icon item-icon-gray';
                break;
            case '':
                out = 'glyphicon glyphicon-time item-icon item-icon-yellow';
        }

        return out;
    }
}).controller('opinion', function ($scope, $http) {
    XuntongJSBridge.call('setWebViewTitle', {'title': '审批历史'});
    $scope.openPersonTab = function (openid) {
        XuntongJSBridge.call('personInfo', {
            //'openId': res.data.createopenid
            'openId': openid
        }, function (result) {
        });
    };
    $scope.showIcon = function (iconStr) {
        return iconStr ? iconStr : 'img/icon.png';
    };
    $scope.redirectFlow = function (imgUrl) {
        var uri = new URI('/flow');
        uri.addQuery('imgUrl', imgUrl);
        window.location = uri.toString();
    };
    $http({
        method: 'get',
        url: requrl,
        params: {
            billid: urlObj.billid,
            billtype: urlObj.billtype,
            taskid: urlObj.taskid,
            ts: urlObj.ts,
            method: 'getWorkflow'
        }
    }).success(function (response) {
        $scope.flowUrl = response.data.workflowurl;
    });
    $http({
        method: 'get',
        url: requrl,
        params: {
            billid: urlObj.billid,
            billtype: urlObj.billtype,
            method: 'getApproveHistory'
        }
    }).success(function (response) {
        console.log(response);
        if (response.flag == 0) {
            $scope.historys = response.data.reverse();
        } else {
            toastr.error(response.desc);
        }
    });
});
