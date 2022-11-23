'use strict';  //変数の形無し宣言（global)禁止など。

// クライアントからサーバーへの接続要求
const socket = io.connect();

const roomsNumber = 3;
const usersNumberLimit = 4;

let userName = null;
let userNo = 0;             //playerArrayの添え字に対応
let userToken = null;       //入室時にサーバから受領して保管。（reconnect検証用）
let selectRoom = null;
let playerArray = [];
let cardAttr = [];
let deckArray = new Array(99);
let cemetaryArray = new Array(99);
let commandCount = 0;

let roomState = false;  //true:入室、false：退出

let gameStart = false;

let videoElm = [];  //i:videoNo, j:0:videoObj,1:peerID
for(let i = 0; i < 3; i++){
    videoElm[i] = [];
    videoElm[i][0] = document.getElementById('their-video' + i);
    videoElm[i][1] = null;    
}

document.getElementById("view_canvas").style.display ="none";

const dummyConnect = () => {
    setTimeout(() => {
        socket.emit("dummyConnect");   //（herokuの30秒切断対策として、接続維持のためサーバへダミー通信）
        dummyConnect();
    }, 10000);
}

//Peer作成　（通信拠点の単位=peer）　
//debug 3の場合は、開発用に全てのログを出力
const peer = new Peer({
    key: '77f721d7-cebf-4f72-8a88-630f8e9a04d7',
    debug: 3
});

let myPeerId = null;
//PeerID取得　open = SkyWayのシグナリングサーバとの接続イベント
peer.on('open', () => {
    myPeerId = peer.id;
    console.log('skyway signaling open peer.id=',myPeerId);
});

//peerEventListener関数内で、mediaConnectionのonメソッドにて、相手の映像を取得したときに発生するstreamイベントのリスナを用意します。
//イベントリスナ内に、相手の映像をvideo要素にセットする処理を記載します。
const peerPlayEventListener = (mediaConnection, vidx) => {
  mediaConnection.on('stream', stream => {
    console.log('play  their-video' + vidx);
    // video要素にカメラ映像をセットして再生..ビデオが空、または別peeridに繋ぎ直す場合?
    videoElm[vidx][1] = mediaConnection.remoteId;
    videoElm[vidx][0].srcObject = stream;
    videoElm[vidx][0].play();
  });
}
const peerInitEventListener = vidx => {
    console.log('load  their-video' + vidx);
    videoElm[vidx][0].srcObject = null;       
    videoElm[vidx][0].load();        
}

// 相手から接続要求が来たタイミングの処理
// mediaConnectionオブジェクトのanswerメソッドにて、カメラ映像取得時に保存しておいたlocalStream変数を引数にとり、 自分のカメラ映像を相手に返す
peer.on('call', mediaConnection => {
    mediaConnection.answer(cns_localStream);
    let xmyPlayerIndex = playerArray.findIndex((elm) => elm[1] == userNo);  //myplayerIndex取得
    let xtheirPlayerIndex = playerArray.findIndex((elm) => elm[4] == mediaConnection.remoteId);  //theirPlayerIndex取得
    let videoIndex = 0;
    if(xmyPlayerIndex < xtheirPlayerIndex){
        videoIndex = xtheirPlayerIndex - 1;
    }else{
        videoIndex = xtheirPlayerIndex;
    }
    peerPlayEventListener(mediaConnection, videoIndex);
    console.log('call  mediaconnection peerid ,videoidx', mediaConnection.remoteId,videoIndex);
});

// 接続時の処理
// サーバーとクライアントの接続が確立すると、サーバー側で'connection'イベント、クライアント側で'connect'イベントが発生する
socket.on('connect', () => {
    console.log('connect');
    if(!gameStart){
        //初回コネクト、リコネクト共通のロビー初期設定。　ロビーで切断時、入室しててもサーバー側disconnectの処理で退出になる。
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
    }else{
        //ゲーム中のリコネクト処理。
        socket.emit("serverReconnect", { room: selectRoom, no: userNo, token: userToken, cnt: commandCount, peerId: myPeerId});   //リコネクト時のコマンド再送要求
    }
});

// 切断時、自動再接続。　これがないと、２回目の再接続がされない!!!
socket.on('disconnect', () => {
    console.log('disconnect');
    socket.close();
    socket.open();
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

//サーバーからのユーザリスト配信に対する処理。　playerArrayの更新はココ（重要）
socket.on("renewPlayerList", function (data) {
    $("#member_list").empty();
    playerArray = JSON.parse(data);
    let myPlayerIdx = 0;
    let myPlayerExist = false;
    if(playerArray != null){
        for(let i=0; i < playerArray.length; i++){
            $("#member_list").prepend($("<li>").text(playerArray[i][0]));
            if(playerArray[i][2] == userToken){
                myPlayerIdx = i;
                myPlayerExist = true;
            } 
        }
    }
    let xxclearStart = 0;
    if(myPlayerExist){
        for(let i = myPlayerIdx + 1; i < playerArray.length; i++){     //myplayeridxよりidxが大きい相手全員に能動的なpeer接続（peer call）
            let videoIndex = i - 1;
            const mediaConnection = peer.call(playerArray[i][4], cns_localStream);
            console.log('peer.call i, playerArray[i][4], videoIndex',i, playerArray[i][4], videoIndex);
            peerPlayEventListener(mediaConnection, videoIndex);
            //callメソッドで接続時にmediaconnectionオブジェクトを取得。（このオブジェクトに相手の映像が含まれる）
            //相手の映像を画面に表示するため、MediaConnectionオブジェクトを引数に取るユーザ関数setEventListenerを呼び出し。
        }
        xxclearStart = playerArray.length - 1;
    }else{
        xxclearStart = playerArray.length;
    }
    for(let i = xxclearStart; i < usersNumberLimit - 1; i++){
        peerInitEventListener(i);
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
        socket.emit("inRoom", { room: selectRoom, name: userName, peerId: myPeerId});
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
    roomState = false;
    lobbyWaitForEntry();
    //トークンを初期化
    userToken = null;
    //NGmsg表示
    $("#message_list").prepend($("<p>").text(strMessage));
});

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
}

//-------------------------------------------------------------

//ゲームスタート
$("#game_start").click(function () {
    socket.emit("serverGameStart");
});

socket.on("gameStart", function(data){
    createjs.Sound.play("inoutroom");
    gameStart = true;
    commandCount = 0;

    deckArray = JSON.parse(data.deck);
    cemetaryArray = JSON.parse(data.cemetary);
    cardAttr = JSON.parse(data.cattr);

    //playerArrayは、renewPlayerList にて適宜更新（同期）済みのため、そのままinitstageに引き渡す。
    //playerIndexは、以下の通り取得。
    console.log("playerArray",playerArray);
    let xplayerIndex = playerArray.findIndex((elm) => elm[1] == userNo);  //playerIndex取得

    document.getElementById("view_login").style.display ="none";
    document.getElementById("view_canvas").style.display ="block";
    initStage(xplayerIndex, data.currentPlayer, playerArray, deckArray, cemetaryArray, cardAttr, data.handCardNumber);
});

socket.on("dismissRoom", function () {
    endGame();
    roomState = false;
    socket.emit("outRoom");
    playerArray = null;
    lobbyWaitForEntry();
    //トークンを初期化
    userToken = null;
});

//他プレイヤー切断時処理
socket.on("playerDisconnect", function (data) {
    judge.playerDisconnect(data);
});

//他プレイヤー接続時処理
socket.on("playerReconnect", function (data) {
    judge.playerReconnect(data);
});

//強制退去（reconnect失敗）
socket.on("displacement", function () {
    console.log('displacement');
    endGame();

    roomState = false;
    socket.emit("outRoom");
    lobbyWaitForEntry();
    //トークンを初期化
    userToken = null;
});

//ゲーム終了
const endGame = function () {
    clearStage();
    
    document.getElementById("view_login").style.display ="block";
    document.getElementById("view_canvas").style.display ="none";
    gameStart = false;
}

//-------------------------------------------------------------
socket.on("initialProcedure", function (data) {
    if(data.playerNo < playerArray.length){
        if(playerArray[data.playerNo][1] == userNo){
            judge.replenishingHandCard(); //5枚づつカードを配る
            judge.placeImawashikimono();
            socket.emit("serverInitialProcedure",{playerNo : data.playerNo + 1});
        }
    }
});
//-------------------------------------------------------------

socket.on("playCard", function (data) {
    judge.playCard(data);
    commandCount++;
    console.log('playCard',commandCount);
});

socket.on("buttonAction", function (data) {
    judge.buttonAction(data);
    commandCount++;
    console.log('buttonAction',commandCount);
});

socket.on("readyNextTurn", function (data) {
    judge.readyNextTurn(data);
    commandCount++;
    console.log('readyNextTurn',commandCount);
});

socket.on("rollDice", function (data) {
    judge.rollDice(data);
    commandCount++;
    console.log('rollDice',commandCount);
});

socket.on("playPiece", function (data) {
    judge.playPiece(data);
    commandCount++;
    console.log('playPiece',commandCount);
});

socket.on("deletePiece", function (data) {
    judge.deletePiece(data);
    commandCount++;
    console.log('deletePiece',commandCount);
});

socket.on("resign", function (data) {
    judge.resign(data);
    commandCount++;
    console.log('resign',commandCount);
});

socket.on("permitRevoke", function (data) {
    judge.permitRevoke(data);
    commandCount++;
    console.log('permitRevoke',commandCount);
});

