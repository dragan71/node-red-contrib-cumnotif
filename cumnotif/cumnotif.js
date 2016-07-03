

module.exports = function(RED) {
    "use strict";
    var http = require("follow-redirects").http;
    var https = require("follow-redirects").https;
    var urllib = require("url");
    var mustache = require("mustache");
    var querystring = require("querystring");
    
    //var dateFormat = require('dateformat');
    
    var urlCumul = "https://management.";
    var urlTenant = "teleena-iot.com/";
    var urlSufix1 = "";
    var urlSufix2 = "";
    
    var httpReqHelper = require("./httpreq2");
    var dateoper = require("./dateoperation");

    function CumNotif(n) {
        RED.nodes.createNode(this,n);
        
        this.method = "GET";
        this.credentials.user = "levi9.dragan";
        this.credentials.password = "Cum9Tel16";

        var notification = n.notification;
        var deviceFilter = "";
        var deviceTypeFilter = "";
        var useDate = n.useDate;
        var fromDate = n.fromDate;
        var toDate = n.toDate;
               
//        console.log("Wade - notification = " + notification);
//        console.log("Wade - deviceTypeFilter = " + deviceTypeFilter);
//        console.log("Wade - useDate = " + useDate);
        console.log("Wade - fromDate = " + fromDate);
        console.log("Wade - toDate = " + toDate);
        
        var today = new Date();
        var todaystring = today.getFullYear()  + "-" + (today.getMonth()+1) + "-" + today.getDate();
        console.log("Wade - todaystring = " + todaystring);
        
        var dy = today.getDate();
        console.log("Wade - dy = " + dy);
//        
//        var addDays1 = 55;
//        var newDate;
//        dateoper.addDays(today,addDays1,function (resp) {
//               newDate = resp;
//            });
//        var newDatestring = newDate.getFullYear()  + "-" + (newDate.getMonth()+1) + "-" + newDate.getDate();
//        console.log("Wade - newDate = " + newDatestring);
//
//        var addMonths1 = -8;
//        var newDate2;
//        dateoper.addMonths(today,addMonths1,function (resp) {
//               newDate2 = resp;
//            });
//        var newDate2string = newDate2.getFullYear()  + "-" + (newDate2.getMonth()+1) + "-" + newDate2.getDate();
//        console.log("Wade - newDate2 = " + newDate2string);


        if (notification === "measurements") {
            urlSufix1 = "measurement/measurements?";
        } else if (notification === "events") {
            urlSufix1 = "event/events?";
        } else if (notification === "alarms") {
            urlSufix1 = "alarm/alarms?";
        }
        
        if (n.device !== "") {
            deviceFilter = "&source=" + n.device;   
        }
        
        if (n.devicetype !== "") {
            deviceTypeFilter = "&type=" + n.devicetype;
        }
        
        //console.log("DD1 - deviceFilter = " + deviceFilter);
        //console.log("DD2 - deviceTypeFilter = " + deviceTypeFilter);
        
        console.log("PRIM - useDate = " + useDate);
        if (useDate === true) {
            console.log("UD1 - useDate = " + useDate);
        } else if (useDate === false) {
            console.log("UD2 - useDate = " + useDate);
        } else {
            console.log("UD00 - useDate = " + useDate);
        }
        
        

        var node = this;
        this.nodeUrl = urlCumul + urlTenant + urlSufix1 + deviceFilter + deviceTypeFilter;
        console.log("NNN - notification = " + urlSufix1);
        console.log("FFF - filter = " + deviceFilter + deviceTypeFilter);
        //var nodeUrl = "https://management.teleena-iot.com/measurement/measurements?source=19083&type=c8y_SignalStrength";
        
        node.on("input", function(msg) {

            httpReqHelper.httpRequest(msg, node, function (error, resp) {
                node.status({fill:"blue",shape:"dot",text:"httpin.status.requesting"});
                
                if (error) {
                    
                    if (error === "nooverride") {
                        console.log("SSSS- error = " + error);
                        node.warn(RED._("common.errors.nooverride"));
                    } else {
                        console.log("KOKO- error = " + error);
                        node.error(err,msg);
                        msg.payload = err.toString() + " : " + url;
                        msg.statusCode = err.code;
                        node.send(msg);
                        node.status({fill:"red",shape:"ring",text:err.code}); 
                    }
                   
                } else {
                    node.send(resp);
                    node.status({});
                }

            });

        });

    }
    
    RED.nodes.registerType("cumnotif", CumNotif,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"}
        }
    });
    
}