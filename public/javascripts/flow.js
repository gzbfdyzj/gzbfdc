/**
 * Created by Administrator on 2016/10/26.
 */
var app = angular.module('app', []);
app.controller('flow', function ($scope, $http) {
    XuntongJSBridge.call('setWebViewTitle', {'title': '流程图'});
    $scope.flowUrl = urlObj.imgUrl;
});