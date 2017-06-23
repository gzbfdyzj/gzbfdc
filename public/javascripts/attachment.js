/**
 * Created by 1 on 2016/11/8.
 */
Logger.useDefaults();
Logger.setHandler(function (messages, context) {
    $.post('/logs', {message: messages[0], level: context.level});
});
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';

    var k = 1024;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}
angular.module('app', []).controller('attachment', function ($scope, $http) {
    $scope.showSize = function (size) {
        return bytesToSize(size);
    };
    $scope.openFile = function (index) {
        if (isYzjApp()) {
            Logger.info("attachment.js run in app");
            XuntongJSBridge.call('setWebViewTitle', {'title': '附件列表'});
            //alert($scope.attachments[index]['name'].split('.')[0]);
            XuntongJSBridge.call('showFile',
                {
                    fileName: $scope.attachments[index]['name'],
                    fileExt: $scope.attachments[index]['ext'],
                    fileTime: $scope.attachments[index]['ts'],
                    //fileTime: '2015-06-02 15:40',
                    fileSize: $scope.attachments[index]['size'],
                    //fileDownloadUrl: fileDownloadUrl + '&fileSize=' + fileSize
                    fileDownloadUrl: $scope.attachments[index]['url']
                },
                function (result) {
                    if (!(result.success)) {
                    }
                }
            );
        } else if (getCloudHub().isCloudHub) {
            //XuntongJSBridge.call('downloadFile',
            //    {
            //        fileExt: $scope.attachments[index]['ext'],
            //        fileTime: $scope.attachments[index]['ts'],
            //        'fileName': $scope.attachments[index]['name'],
            //        'fileSize': $scope.attachments[index]['size'],
            //        'fileDownloadUrl': $scope.attachments[index]['url']
            //    }, function (result) {
            //
            //    }
            //);

            XuntongJSBridge.call('openInBrowser',
                {'url': $scope.attachments[index]['url']}, //自定义链接
                function (result) {
                }
            );
            //Logger.info("attachment.js run in cloudhub => " + $scope.attachments[index]['url']);
            //Logger.info("UA => " + window.navigator.userAgent);
            //// window.location.href = $scope.attachments[index]['url'];
            //try {
            //    download($scope.attachments[index]['url']);
            //    Logger.info("download js is called");
            //} catch (e) {
            //    Logger.error(JSON.stringify(e));
            //}
        } else {
            Logger.info("attachment.js run in other");
        }

    };
    $http({
        method: 'get',
        url: requrl,
        params: {
            billid: urlObj.billid,
            billtype: urlObj.billtype,
            method: 'getBillFileList'
        }
    }).success(function (response) {
        console.log(response);
        if (response.data.length == 0) {
            //alert('暂无附件');
            //toastr
        } else {
            $scope.attachments = response.data;
        }

    });
});

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
