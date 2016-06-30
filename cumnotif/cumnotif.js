

module.exports = function(RED) {
    "use strict";
    var http = require("follow-redirects").http;
    var https = require("follow-redirects").https;
    var urllib = require("url");
    var mustache = require("mustache");
    var querystring = require("querystring");
    
    var urlCumul = "https://management.";
    var urlTenant = "teleena-iot.com/";
    var urlSufix1 = "";
    var urlSufix2 = "";

    function HTTPRequestCum(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var notification = n.notification;
        var device = "";
        var notiftype = n.notiftype;
        var useDate = n.useDate;
        var fromDate = n.fromDate;
        var toDate = n.toDate;
               
//        console.log("Wade - notification = " + notification);
          console.log("Wade - device = " + device);
//        console.log("Wade - notiftype = " + notiftype);
//        console.log("Wade - useDate = " + useDate);
//        console.log("Wade - fromDate = " + fromDate);
//        console.log("Wade - toDate = " + toDate);
        

        if (n.device !== "") {
            device = "&source=" + n.device;
        }
        
        if (notification === "measurements") {
            urlSufix1 = "measurement/measurements?";
            
        } else if (notification === "events") {
            urlSufix1 = "event/events?";
        } else if (notification === "alarms") {
            urlSufix1 = "alarm/alarms?";
        }
         
        if (device === "") {
            console.log("PPPP1 - device = " + device);
        } else {
            console.log("PPPP2 - device = " + device);
        }
        
        var nodeUrl = urlCumul + urlTenant + urlSufix1 + device + notiftype;
        console.log("Wade - nodeUrl = " + nodeUrl);
        
        var isTemplatedUrl = (nodeUrl||"").indexOf("{{") != -1;
        //var nodeMethod = n.method || "GET";
//        if (n.tls) {
//            var tlsNode = RED.nodes.getNode(n.tls);
//        }
        //this.ret = n.ret || "txt";
        this.ret = "txt";
        if (RED.settings.httpRequestTimeout) { this.reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 120000; }
        else { this.reqTimeout = 120000; }

        var prox, noprox;
        if (process.env.http_proxy != null) { prox = process.env.http_proxy; }
        if (process.env.HTTP_PROXY != null) { prox = process.env.HTTP_PROXY; }
        if (process.env.no_proxy != null) { noprox = process.env.no_proxy.split(","); }
        if (process.env.NO_PROXY != null) { noprox = process.env.NO_PROXY.split(","); }
        
        
        

        this.on("input",function(msg) {
            var preRequestTimestamp = process.hrtime();
            node.status({fill:"blue",shape:"dot",text:"httpin.status.requesting"});
            var url = nodeUrl || msg.url;
            if (msg.url && nodeUrl && (nodeUrl !== msg.url)) {  // revert change below when warning is finally removed
                node.warn(RED._("common.errors.nooverride"));
            }
            if (isTemplatedUrl) {
                url = mustache.render(nodeUrl,msg);
            }
            if (!url) {
                node.error(RED._("httpin.errors.no-url"),msg);
                return;
            }
            // url must start http:// or https:// so assume http:// if not set
//            if (!((url.indexOf("http://") === 0) || (url.indexOf("https://") === 0))) {
//                if (tlsNode) {
//                    url = "https://"+url;
//                } else {
//                    url = "http://"+url;
//                }
//            }

              var method = "GET";
//            var method = nodeMethod.toUpperCase() || "GET";
//            if (msg.method && n.method && (n.method !== "use")) {     // warn if override option not set
//                node.warn(RED._("common.errors.nooverride"));
//            }
//            if (msg.method && n.method && (n.method === "use")) {
//                method = msg.method.toUpperCase();          // use the msg parameter
//            }
            var opts = urllib.parse(url);
            opts.method = method;
            opts.headers = {};
            if (msg.headers) {
                for (var v in msg.headers) {
                    if (msg.headers.hasOwnProperty(v)) {
                        var name = v.toLowerCase();
                        if (name !== "content-type" && name !== "content-length") {
                            // only normalise the known headers used later in this
                            // function. Otherwise leave them alone.
                            name = v;
                        }
                        opts.headers[name] = msg.headers[v];
                    }
                }
            }
            
            this.credentials.user = "levi9.dragan";
            this.credentials.password = "Cum9Tel16";
            
            if (this.credentials && this.credentials.user) {
                opts.auth = this.credentials.user+":"+(this.credentials.password||"");
            }
            var payload = null;

            if (msg.payload && (method == "POST" || method == "PUT" || method == "PATCH" ) ) {
                if (typeof msg.payload === "string" || Buffer.isBuffer(msg.payload)) {
                    payload = msg.payload;
                } else if (typeof msg.payload == "number") {
                    payload = msg.payload+"";
                } else {
                    if (opts.headers['content-type'] == 'application/x-www-form-urlencoded') {
                        payload = querystring.stringify(msg.payload);
                    } else {
                        payload = JSON.stringify(msg.payload);
                        if (opts.headers['content-type'] == null) {
                            opts.headers['content-type'] = "application/json";
                        }
                    }
                }
                if (opts.headers['content-length'] == null) {
                    if (Buffer.isBuffer(payload)) {
                        opts.headers['content-length'] = payload.length;
                    } else {
                        opts.headers['content-length'] = Buffer.byteLength(payload);
                    }
                }
            }
            var urltotest = url;
            var noproxy;
            if (noprox) {
                for (var i in noprox) {
                    if (url.indexOf(noprox[i]) !== -1) { noproxy=true; }
                }
            }
            if (prox && !noproxy) {
                var match = prox.match(/^(http:\/\/)?(.+)?:([0-9]+)?/i);
                if (match) {
                    //opts.protocol = "http:";
                    //opts.host = opts.hostname = match[2];
                    //opts.port = (match[3] != null ? match[3] : 80);
                    opts.headers['Host'] = opts.host;
                    var heads = opts.headers;
                    var path = opts.pathname = opts.href;
                    opts = urllib.parse(prox);
                    opts.path = opts.pathname = path;
                    opts.headers = heads;
                    opts.method = method;
                    //console.log(opts);
                    urltotest = match[0];
                }
                else { node.warn("Bad proxy url: "+process.env.http_proxy); }
            }
//            if (tlsNode) {
//                tlsNode.addTLSOptions(opts);
//            }
            var req = ((/^https/.test(urltotest))?https:http).request(opts,function(res) {
                (node.ret === "bin") ? res.setEncoding('binary') : res.setEncoding('utf8');
                msg.statusCode = res.statusCode;
                msg.headers = res.headers;
                msg.payload = "";
                // msg.url = url;   // revert when warning above finally removed
                res.on('data',function(chunk) {
                    msg.payload += chunk;
                });
                res.on('end',function() {
                    if (node.metric()) {
                        // Calculate request time
                        var diff = process.hrtime(preRequestTimestamp);
                        var ms = diff[0] * 1e3 + diff[1] * 1e-6;
                        var metricRequestDurationMillis = ms.toFixed(3);
                        node.metric("duration.millis", msg, metricRequestDurationMillis);
                        if (res.client && res.client.bytesRead) {
                            node.metric("size.bytes", msg, res.client.bytesRead);
                        }
                    }
                    if (node.ret === "bin") {
                        msg.payload = new Buffer(msg.payload,"binary");
                    }
                    else if (node.ret === "obj") {
                        try { msg.payload = JSON.parse(msg.payload); }
                        catch(e) { node.warn(RED._("httpin.errors.json-error")); }
                    }
                    node.send(msg);
                    node.status({});
                });
            });
            req.setTimeout(node.reqTimeout, function() {
                node.error(RED._("common.notification.errors.no-response"),msg);
                setTimeout(function() {
                    node.status({fill:"red",shape:"ring",text:"common.notification.errors.no-response"});
                },10);
                req.abort();
            });
            req.on('error',function(err) {
                node.error(err,msg);
                msg.payload = err.toString() + " : " + url;
                msg.statusCode = err.code;
                node.send(msg);
                node.status({fill:"red",shape:"ring",text:err.code});
            });
            if (payload) {
                req.write(payload);
            }
            req.end();
        });
    }

    RED.nodes.registerType("cumnotif",HTTPRequestCum,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"}
        }
    });
}