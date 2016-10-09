//自适应屏幕高度
$(".container").css({
    "min-height":$(window).height()
})
$(window).resize(function(){
    $(".container").css({
        "min-height":$(window).height()
    })
});

// 不要mobile默认样式
$("input, button, select").attr("data-role", "none");
$("a").attr('data-ajax',false);
// 绑定mobile默认配置
$( document ).bind( "mobileinit", function() { 
   $.support.cors = true;    
   $.mobile.allowCrossDomainPages = true; 
})

// 获取验证码
var regPhone = /^1[34578]\d{9}$/ ;//手机号正则
$("#getCapthcha").on("click", function(){
    var telephone=$(".telephone").val();
    var data={
        tel: telephone
    }
    var url="IcCardWebService/sendVerCode";
    if(telephone==""){
        tipInformation("请输入手机号！",function(){});
        return false;
    }else if(!regPhone.test(telephone)){
        tipInformation("请输入正确的手机号！",function(){});
        return false;
    }
    var btn=$(this);
    settime(btn);
    ajaxGetRequest(url, data, callback);
    function callback(result) {
        var a=processData(result);
        tipInformation(a.message,function(){});
    }
});
//倒计时60秒
var countdown=60;
function settime(val) {
    if (countdown == 0) {
        val.attr("disabled", false); 
        val.val("重新发送");
        val.css({
            "background":"#73be1e"
        });
        countdown = 60;
        return false;
    } else {
        val.attr("disabled", true); 
        val.val("正在获取"+countdown);
        val.css({
            "background":"#ccc"
        });
        countdown--;
    }
    setTimeout(function() {
    settime(val)
    },1000)
} 

// 百度地图API功能
var addr,lat,lon;
function baiduMap(map_name){
    var map = new BMap.Map(map_name);
    var point = new BMap.Point();
    map.centerAndZoom(point,12);
    var geoc = new BMap.Geocoder();   
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            var mk = new BMap.Marker(r.point);
            map.addOverlay(mk);
            map.panTo(r.point);

            lat=r.point.lat;
            lon=r.point.lng;

            var pt = r.point;
            geoc.getLocation(pt, function(rs){
                var addComp = rs.addressComponents;
                addr=addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
                $(".position-address").val(addr);
                $(".position-address").text(addr);
            });  
        }else {
            tipInformation('failed'+this.getStatus(),function(){});
        }   
    },{enableHighAccuracy: true})
}
// 封装ajax
function ajaxRequest(url, method, data, callback) {
    var ip=getLocalStorage("ip");
    if(ip!=""){
        var this_url="http://"+ip+":8000/webservice/services/"+url+"?response=application/json";
    }else{
        var this_url="http://180.96.17.120:8000/webservice/services/"+url+"?response=application/json";
    }
    var request = $.ajax({
        type: method,
        url: this_url,
        dataType: 'json',
        data:data,
        crossDomain: true,
        success: callback
    });
}
// get方式
function ajaxGetRequest(url, data, callback) {
    ajaxRequest(url, 'GET', data, callback)
}
// post方式
function ajaxPOSTRequest(url, data, callback) {
    ajaxRequest(url, 'POST', data, callback)
}
// 处理返回数据
function processData(result) {
    var myJSONString = JSON.stringify(result);
    var a = $.parseJSON(result.return);
    return a;
}
// 提示信息
function tipInformation(message, successCallback) {
    var html_mask="";
    var html="";
    var close_tip_html="";

    html_mask+='<div class="mask" style="background: #000;opacity: 0.37;position: absolute;width: 100%;height: 100%;top: 0;z-index: 99999998;"></div>';

    html+='<div id="tip" style="width:188px;position:absolute;left:25%;top:25%;z-index: 99999999;">';
    html+=' <p style="padding-top:17px;height:90px;background:#fff;width:100%;text-align:center;line-height:30px;font-size:.6rem;font-weight:bold;">'+message+'</p>';
    html+=' <div style="width:100%;height:50px;background:#fff;" id="tipBox">';
    html+=' </div>';
    html+='</div>';

    close_tip_html = '<div style="color:#fff;font-size:1em;width:110px;height:28px;background:#59a42c;border-radius:30px;text-align:center;line-height:28px;margin:0 auto;" id="closeTip">确定</div>';

    var $html = $(html);
    var $closeTipHtml = $(close_tip_html);
    $html.find("#tipBox").html($closeTipHtml);

    $("body").append($(html_mask));
    $("body").append($html);
    // 提示框居中
    boxCenter("#tip");
    $(".mask").css({
        "height":$("body").height()
    })
    // 点击确定按钮
    $closeTipHtml.on("click", function(){
        $("#tip").remove();
        $(".mask").remove();
        successCallback();
    })
    // 点击遮罩层关闭信息框
    $(".mask").on("click",function(){
        $("#tip").remove();
        $(".mask").remove();
    })
}
// 个人中心，判断是否登陆
isLogin("#islogin","personal.html");
// 我的订单，判断是否登陆
isLogin(".to-order","order.html");
// 我要充电，判断是否登陆
isLogin(".to-appointment","appointment.html");
// 我的收藏，判断是否登陆
isLogin(".to-collection","collection.html");
// 判断是否登陆
function isLogin(click_name,to_href){
    var $click_name=$(click_name);
    $click_name.on("click",function(){
        var islogin = getLocalStorage("islogin");
        if(islogin==1){
            location.href=to_href;
        }else{
            tipInformation("请登陆！",function(){location.href="login.html";});
        }
    })
}
// 本地存储
function setLocalStorage(key, value) {
    var storage = window.localStorage;
    storage[key] = value;
}

function getLocalStorage(key) {
    var storage = window.localStorage;
    return ("undefined" == typeof storage[key]) ? false : storage[key];
}
// 加载页面
function circleMask(){

    $("body").append('<div id="circle_mask" style="background: #000;opacity: 0.37;position: absolute;width: 100%;height: 100%;top: 0;z-index: 999999;"></div><img src="img/circle.gif" id="circle_img" width="50" height="50" style="position:absolute;display:block;z-index: 99999999;">');
    boxCenter("#circle_img");
    $("#circle_mask").css({
        "height":$("body").height()
    })

}

// 信息框居中
function boxCenter(doc){
    var $doc=$(doc);
    var windowWidth = ($(window).width()-$doc.width())*0.5;
    var windowHeight = $(window).height(),      //获取当前窗口高度
    scrollHeight = $(document).scrollTop(),    //相对滚动条上侧的偏移值
    dialogBoxHeight = $doc.height() + 2,
    dialogBoxTop = windowHeight * 0.5,      //动态top值
    dialogBoxMarTOP = 0 - (dialogBoxHeight/2) + scrollHeight;   //动态margin-top值
    $doc.css({"left" : windowWidth + "px","top" : dialogBoxTop + "px", "margin-top":dialogBoxMarTOP + "px"  });
}

// 扫描
function inputScan(){
    cordova.plugins.barcodeScanner.scan(
        function (result) {
             alert("We got a barcode\n" +
                   "Result: " + result.text + "\n" +
                   "Format: " + result.format + "\n" +
                   "Cancelled: " + result.cancelled);
        }, 
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}
// // 有遮罩层时不可滑动页面
// document.body.addEventListener('touchmove', function (event) {
//    if($("#mask").is(":hidden")) {
//        event.preventDefault();
//    }
//    if($(".mask").is(":hidden")) {
//        event.preventDefault();
//    }
//    if(!$("#circle_mask").is(":hidden")) {
//        event.preventDefault();
//    }
// });

//获得当前日期的后x天，通用
function nextDay(x){ 
    var mydate = new Date();
    var time=new Date(mydate.getTime() + x*24*60*60*1000);
    var year=time.getFullYear(); //获取完整的年份(4位,1970-????)
    var month=time.getMonth()+1; //获取当前月份(0-11,0代表1月)
    var day=time.getDate(); //获取当前日(1-31) 
    var hours=time.getHours(); //获取当前小时数(0-23) 
    var minutes=time.getMinutes(); //获取当前分钟数(0-59) 
    var seconds=time.getSeconds(); //获取当前秒数(0-59) 
    if(month<10){
        month="0"+month;
    }
    if(day<10){
        day="0"+day;
    }
    if(hours<10){
        hours="0"+hours;
    }
    if(minutes<10){
        minutes="0"+minutes;
    }
    if(seconds<10){
        seconds="0"+seconds;
    }
    mydate=year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
    return mydate;
}
// 毫秒转换为年月
function formatterDate(millisecond) {
    var myDate = new Date(millisecond);
    var date = myDate.getFullYear()
            + "/"// "年"
            + ((myDate.getMonth() + 1) > 10 ? (myDate.getMonth() + 1) : "0"
                    + (myDate.getMonth() + 1))
            + "/"// "月"
            + (myDate.getDate() < 10 ? "0" + myDate.getDate() : myDate
                    .getDate())
    return date;
}
// 毫秒转换为时分
function formatterTime(millisecond) {
    var myDate = new Date(millisecond);
    var time = (myDate.getHours() < 10 ? "0" + myDate.getHours() : myDate
                    .getHours())
            + ":"
            + (myDate.getMinutes() < 10 ? "0" + myDate.getMinutes() : myDate
                    .getMinutes())
            // + ":"
            // + (myDate.getSeconds() < 10 ? "0" + myDate.getSeconds() : myDate
            //         .getSeconds());
    return time;
}

// 获取当前预约
function order(){
    var identity=1;
    var cardNo=getLocalStorage("cardno");
    var pass=getLocalStorage("pass");
    var car=getLocalStorage("car");
    var data={
        identity: identity,
        cardNo: cardNo,
        pass: pass
    }
    var url="IcCardWebService/getBespeakPole";
    ajaxGetRequest(url, data, callback);
    function callback(result) {
        var a=processData(result);
        if(a.success){
            if(a.list.length<10){
                $(".order01").text(a.list.length);
            }else{
                $(".order01").addClass(".points");
                $(".order01").text("...");
            }
        }
    }
}
// 读取我的充电
function orderDoing(){
    var identity=1;
    var cardNo=getLocalStorage("cardno");
    var pass=getLocalStorage("pass");
    var data={
        identity: identity,
        cardNo: cardNo,
        pass: pass
    }
    var url="IcCardWebService/getStartChargingPole";
    ajaxGetRequest(url, data, callback);
    function callback(result) {
        var a=processData(result);
        // tipInformation(a.message,function(){});
        if(a.success){
            if(a.list.length<10){
                $(".order02").text(a.list.length);
            }else{
                $(".order02").addClass(".points");
                $(".order02").text("...");
            }
        }
    }
}
// 读取待支付订单
function orderPaid(){
    var identity=1;
    var cardNo=getLocalStorage("cardno");
    var pass=getLocalStorage("pass");
    var data={
        identity: identity,
        cardNo: cardNo,
        pass: pass
    }
    var url="IcCardWebService/queryCardBill";
    ajaxGetRequest(url, data, callback);
    function callback(result) {
        var a=processData(result);
        // tipInformation(a.message,function(){});
        if(a.success){
            if(a.list.length<10){
                $(".order03").text(a.list.length);
            }else{
                $(".order03").addClass(".points");
                $(".order03").text("...");
            }
        }
    }
}
// 读取已取消订单
function orderCancel(){
    var identity=1;
    var cardNo=getLocalStorage("cardno");
    var pass=getLocalStorage("pass");
    var data={
        identity: identity,
        cardNo: cardNo,
        pass: pass
    }
    var url="IcCardWebService/getDispBespeakPole";
    ajaxGetRequest(url, data, callback);
    function callback(result) {
        var a=processData(result);
        // tipInformation(a.message,function(){});
        if(a.success){
            if(a.list.length<10){
                $(".order04").text(a.list.length);
            }else{
                $(".order04").addClass(".points");
                $(".order04").text("...");
            }
        }
    }
}



