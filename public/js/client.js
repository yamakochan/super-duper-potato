'use strict';

// クライアントからサーバーへの接続要求
const socket = io.connect();

let userName = null;
let userNo = 0;             //userlistの添え字に対応
let userToken = null;       //入室時にサーバから受領して保管。（reconnect検証用）
let selectRoom = null;
let memArray = new Array(2);
let cardAttr = [];
let deckArray = new Array(99);
let cemetaryArray = new Array(99);

let roomState = false;

document.getElementById("view_canvas").style.display ="none";

const dummyConnect = () => {
    setTimeout(() => {
        socket.emit("dummyConnect");   //（herokuの30秒切断対策として、接続維持のためサーバへダミー通信）
        dummyConnect();
    }, 28000);
}

// 接続時の処理
// サーバーとクライアントの接続が確立すると、サーバー側で'connection'イベント、クライアント側で'connect'イベントが発生する
socket.on('connect', () => {
    console.log('connect');
    
    //部屋選択UI
    $("#room_in_out").text("in");
    $("#room_list").prop("disabled", false);
    $("#username_text").prop("disabled", false);

    //メッセージ送信UI
    $("#message_text").prop("disabled", true);
    $("#message_send").prop("disabled", true);

    $("#game_start").prop("disabled", true);

    //メッセージリストを削除
    $("#message_list").empty();

    roomState = false;

    selectRoom = $("#room_list").val();  
    socket.emit("selectRoom", { room: selectRoom });　　　　//サーバへルーム情報（ユーザリスト）の送信依頼

    dummyConnect();
});

//メッセージの送信用関数定義
const sendMessage = function () {
    if ($("#message_text").val() != "") {
        socket.emit("message", $("#message_text").val());
        $("#message_text").val("");
    }
};

// サーバーからのメッセージ拡散に対する処理
socket.on("message", function (strMessage) {
    $("#message_list").prepend($("<p>").text(strMessage));　// 拡散されたメッセージをメッセージリストに追加
});

//セレクトルームによる部屋メンバリスト更新
$("#room_list").change(function () {
    selectRoom = $("#room_list").val();  
    socket.emit("selectRoom", { room: selectRoom });　　　　//サーバへルーム情報（ユーザリスト）の送信依頼
    $("#message_list").empty();  　　　　　　　　　　　　　　　//メッセージリストを削除
});

//サーバーからのユーザリスト配信に対する処理
socket.on("renewUserList", function (data) {
    $("#member_list").empty();
    memArray = JSON.parse(data);
    if(memArray != null){
        for(let i=0; i < memArray.length; i++){
            $("#member_list").prepend($("<li>").text(memArray[i][0]));
        }
    }
});

//メッセージボックスでのenter
//テキストボックスとボタンの動作（13はenterキー）
$("#message_text").keypress(function (event) {
    if (event.which === 13) {
        sendMessage();
    }
});

//メッセージ送信ボタン
$("#message_send").click(function () {
	sendMessage();
});

//入退室
$("#room_in_out").click(function () {
    createjs.Sound.play("turn");

    selectRoom = $("#room_list").val();
    roomState = !roomState;

    if (roomState) {
        userName = $("#username_text").val();
        socket.emit("inRoom", { room: selectRoom ,name: userName});
    } else {
        socket.emit("outRoom");
        lobbyWaitForEntry();
    }
});

socket.on("inRoomOk", function (data) {
    lobbyEntering();
    $("username_text").val(data.name);
    document.getElementById("username_text").value = data.name;
    userName = data.name;
    userNo = data.no;
    userToken = data.token;
});

socket.on("inRoomNg", function (strMessage) {
    //in-outボタンはinのまま
    roomState = false;
    lobbyWaitForEntry();
    //ngmsg表示
    $("#message_list").prepend($("<p>").text(strMessage));
});

socket.on("dismissRoom", function () {
    //in-outボタンはinのまま
    roomState = false;
    socket.emit("outRoom");
    lobbyWaitForEntry();
});

//ゲームスタート
$("#game_start").click(function () {
    socket.emit("serverGameStart");
});

socket.on("gameStart", function(data){
    createjs.Sound.play("inoutroom");

    deckArray = JSON.parse(data.deck);
    cemetaryArray = JSON.parse(data.cemetary);
    cardAttr = JSON.parse(data.cattr);

    document.getElementById("view_login").style.display ="none";
    document.getElementById("view_canvas").style.display ="block";
    initStage(memArray,deckArray,cemetaryArray,cardAttr,data.handCardNumber);
});


socket.on("playCard", function (data) {
    judge.playCard(data);
});

socket.on("buttonAction", function (data) {
    judge.buttonAction(data);
});

socket.on("changeTurn", function () {
    judge.changeTurn();
});

socket.on("rollDice", function (data) {
    judge.rollDice(data);
});

socket.on("playPiece", function (data) {
    judge.playPiece(data);
});

socket.on("deletePiece", function (data) {
    judge.deletePiece(data);
});

socket.on("resign", function (data) {
    judge.resign(data);
});

socket.on("playerDisconnect", function (data) {
    judge.playerDisconnect(data);
});

socket.on("permitRevoke", function (data) {
    judge.permitRevoke(data);
});

//ゲーム終了
const endGame = function () {
    document.getElementById("view_login").style.display ="block";
    document.getElementById("view_canvas").style.display ="none";

    roomState = false;
    socket.emit("serverDismissRoom");    //!!一人づつ抜けると、抜ける前にゲームスタートされる懸念あり。
    lobbyWaitForEntry();
}

const lobbyEntering = function () {
      //部屋選択UI
    $("#room_in_out").text("out");
    $("#room_list").prop("disabled", true);
    $("#username_text").prop("disabled", true);

    //メッセージ送信UI
    $("#message_text").prop("disabled", false);
    $("#message_send").prop("disabled", false);

    $("#game_start").prop("disabled", false);

    //メッセージリストを削除
    $("#message_list").empty();
}

const lobbyWaitForEntry = function () {
    //部屋選択UI
    $("#room_in_out").text("in");
    $("#room_list").prop("disabled", false);
    $("#username_text").prop("disabled", false);

    //メッセージ送信UI
    $("#message_text").prop("disabled", true);
    $("#message_send").prop("disabled", true);

    $("#game_start").prop("disabled", true);

    //メッセージリストを削除
    $("#message_list").empty();

    //トークンを初期化
    userToken = null;
}


