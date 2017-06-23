let express = require('express');
let request = require('request');
let fs = require('fs');
let uuid = require('node-uuid');
let router = express.Router();
let sender = require('.././bin/www');
let S = require('string');
let xml2js = require('xml2js');

router.get('/', function (req, res, next) {
    // res.redirect('/qrcode');
    res.render('/qrcode');
});

/* GET home page. */
router.get('/binding', function (req, res, next) {
    res.render('binding');
});
router.get('/todo', function (req, res, next) {
    res.render('todo');
});
router.get('/form', function (req, res, next) {
    res.render('form');
});
router.get('/history', function (req, res, next) {
    res.render('history');
});
router.get('/flow', function (req, res, next) {
    res.render('flow');
});
router.get('/attachment', function (req, res, next) {
    res.render('attachment');
});
router.get('/qrcode', function (req, res, next) {
    const sign = uuid.v1();
    res.render('QRcode', {sign: sign});
    res.end();
});

router.get('/seeyon', function (req, res, next) {
    res.render('seeyon-m1');
});

router.get('/coremail/sso', function (req, res, next) {
    res.render('mail-sso');
});

router.post('/permission', function (req, res, next) {
    regexAdmin(req.body.openid).then(function (result) {
        res.send(result);
    });
});

router.post('/mail/verify', function (req, res, next) {
    request({
        uri: 'http://mail.gzbfdc.com/apiws/services/API/userExist',
        method: 'GET',
        qs: {
            user_at_domain: req.body.user_at_domain
        }
    }, function (error, status, data) {
        xml2js.parseString(S(data).between('<soap:Body>', '</soap:Body>').s, {trim: true}, function (err, result) {
            var resp = result['ns1:userExistResponse']['return'];
            res.send({'result': resp[0].code[0] == '0'});
        });
    });
});

router.post('/mail/authenticate', function (req, res, next) {
    console.dir(req.body);
    request({
        uri: 'http://mail.gzbfdc.com/apiws/services/API/authenticate',
        method: 'GET',
        qs: {
            user_at_domain: req.body.user_at_domain,
            password: req.body.password
        }
    }, function (error, status, data) {
        console.log(data);
        xml2js.parseString(S(data).between('<soap:Body>', '</soap:Body>').s, {trim: true}, function (err, result) {
            var resp = result['ns1:authenticateResponse']['return'];
            res.send({'result': resp[0].code[0] == '0'});
        });
    });
});

router.post('/mail/binding', function (req, res, next) {
    request({
        uri: 'http://localhost:8080/proxy/sync',
        method: 'POST',
        formData: {
            key: fs.createReadStream('./config/key/102.key'),
            url: 'http://xt.gzbfdc.com/openaccess/input/person/updateInfo',
            eid: '102',
            data: JSON.stringify({
                eid: '102',
                persons: [{
                    openId: req.body.openid,
                    email: req.body.email
                }]
            })
        }
    }, function (error, status, data) {
        console.log(data);
        res.send(data);
    });
});

router.post('/mail/login', function (req, res, next) {
    console.dir(req.body);

    request({
        uri: 'http://localhost:8080/proxy/sync',
        method: 'POST',
        formData: {
            key: fs.createReadStream('./config/key/102.key'),
            url: 'http://xt.gzbfdc.com/openaccess/input/person/get',
            eid: '102',
            data: JSON.stringify({
                eid: '102',
                type: 1,
                array: [req.body.openid]
            })
        },
        json: true
    }, function (error, status, data) {
        console.log(data);
        if (data.success) {
            if (data.data.length > 0 && data.data[0].email) {
                request({
                    uri: 'http://mail.gzbfdc.com/apiws/services/API/userLogin',
                    method: 'GET',
                    qs: {
                        user_at_domain: data.data[0].email
                    }
                }, function (error, status, data) {
                    console.log(data);
                    xml2js.parseString(S(data).between('<soap:Body>', '</soap:Body>').s, {trim: true}, function (err, result) {
                        var resp = result['ns1:userLoginResponse']['return'];
                        res.send({'result': resp[0].code[0] == '0', 'sid': resp[0].result[0]});
                    });
                });
            } else {
                res.send({'result': false});
            }
        } else {
            res.send({'result': false});
        }
    });
});

router.post('/logs', function (req, res, next) {
    console.log(JSON.stringify(req.body));
    res.end();
});

let regexAdmin = function (openId) {
    return new Promise(function (resolve, reject) {
        const adminConfig = JSON.parse(fs.readFileSync('./config/admin.json'));
        if (Array.from(adminConfig.admin).find(admin => admin == openId)) {
            resolve({
                result: true,
                openId: openId
            });
        } else {
            resolve({
                result: false
            });
        }
    });
};
let getUserInfo = function (host, ticket, access_token) {
    return new Promise(function (resolve, reject) {
        request({
            //?ticket=TICKET&access_token=TOKEN
            uri: host + '/openauth2/api/getcontext',
            method: 'GET',
            qs: {
                ticket: ticket,
                access_token: access_token
            },
            json: true
        }, function (error, status, data) {
            resolve(data.openid);
        });

    });
};
router.post('/qrlogin', function (req, res, next) {
    let host = 'http://xt.gzbfdc.com';
    let ticket = req.body.ticket;
    let appid = req.body.appid;
    let secret = 'bindingpage';
    let grant_type = 'client_credential';
    //var uri = new URI('http://xt.gzbfdc.com/openauth2/api/token');
    //grant_type=client_credential&appid=10207&secret=bindingpage
    getToken(host, appid, secret, grant_type).then(function (token) {
        return getUserInfo(host, ticket, token);
    }).then(function (curUserOpenId) {
        return regexAdmin(curUserOpenId);
    }).then(function (data) {
        return notify(data, req.body.sign);
    }).then(function () {
        res.status(200);
        res.end();
    });
});


let notify = function (data, sign) {
    sender.emit(sign, data.openId);
    return new Promise(function (resolve, reject) {
        if (data.result) {
            resolve();
        } else {
            resolve();
        }
    });
};

let getToken = function (host, appid, secret, grant_type) {
    return new Promise(function (resolve, reject) {
        request(
            {
                uri: host + '/openauth2/api/token',
                method: 'GET',
                qs: {
                    grant_type: grant_type,
                    appid: appid,
                    secret: secret
                },
                json: true
            },
            function (error, status, data) {
                resolve(data.access_token);
            });
    });
};

module.exports = router;
