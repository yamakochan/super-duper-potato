'use strict';

//◆Node.js におけるグローバル空間
// ブラウザだと、ファイルの一番大きな部分に変数を宣言したり、そもそも宣言せずに変数を使った場合、その変数は window オブジェクトの
// プロパティとして定義されます。
// そして、 Node.js で同じことを行うと、 global オブジェクトのプロパティになります。
// 要するに、 window の代わりとなるのが global オブジェクトです。
// この global オブジェクトは、1ファイルごとにそれぞれ生成されます。つまり、ブラウザにおける window オブジェクトと違い、ファイルをまたい
// で変数が共有されることはありません。
// 例えば a.js で global.test = 1 を定義したとしても、 b.js では global.test は undefined を返します。
// というかそもそもプロパティ自体がありません。これによって、不用意なグローバル汚染をなくすことができます。
// モジュール

//◆タイムアウト回避
//HerokuのWebSocketには30秒でのタイムアウトがあるので、それを回避するために定期的に通信を行わなければならない

const os	   = require('os');
const crypto 　= require("crypto");
const http     = require('http');
const express  = require('express');
const socketIO = require('socket.io');
const moment   = require('moment');

// オブジェクト
const app    = express();
const server = http.Server(app);
const io     = socketIO(server);

// name リスト
const nameList = require('./name_list.js');

// handCardNumber
const handCardNumber = 5;

// cardAttr リスト
const descList = require('./desc_list.js');
let cardAttr = descList.cardAttr;

// オブジェクト deck　リスト
const deckCardsNumber = 93;
let deckArray = [];
for(let i = 0; i < deckCardsNumber; i++){
  let xtext = "./image/card01/mm" + ('000' + (i + 1)).slice(-2) + ".png";
  deckArray[i] = new Array(xtext, i, Math.random());
}

// オブジェクト cemetary　リスト
const cemetaryCardsNumber = 5;
let cemetaryArray = [];
for(let i = 0; i < cemetaryCardsNumber; i++){
  let xtext = "./image/card01/ima" + ('000' + (i + 1)).slice(-2) + ".png";
  cemetaryArray[i] = new Array(xtext, i + deckCardsNumber);
}

// room,各部屋のユーザ
const roomsNumber = 3;
const usersNumberLimit = 4;
// ユーザーリスト
let userList = new Array(roomsNumber);  //room
for (let i = 0; i < userList.length; i++){
    userList[i] = new Array(usersNumberLimit);  //user
    for(let j = 0; j < userList[i].length; j++){
        userList[i][j] = new Array(5); //username , userno , token　,枠だけー＞live(false:死,true:生) ,peer
	    for(let k = 0; k < userList[i][j].length; k++){
	        userList[i][j][k] = null;
	    }
    }
}

// プレイヤーリスト
let playerArray = new Array(roomsNumber);  //room毎
for (let i = 0; i < playerArray.length; i++){
    playerArray[i] = [];  
};

// カレントプレーヤーはサーバ管理とする。（disconnect等を考慮）
let currentPlayer = new Array(roomsNumber);   //room毎

// ルームステータス　0:ロビー　1:ゲーム中
const status_lobby = 0;
const status_game = 1;
let roomStatus = new Array(roomsNumber);   //room毎;
for (let i = 0; i < roomStatus.length; i++){
    roomStatus[i] = status_lobby;  
};

// コマンドリスト
let commandList = new Array(roomsNumber);  //room毎
for (let i = 0; i < commandList.length; i++){
    commandList[i] = [];  //command
};

// コマンドの遅延設定
let commandHold = new Array(roomsNumber);  //room毎
for (let i = 0; i < commandHold.length; i++){
    commandHold[i] = false;
};

// ポート番号	||は左がtrueなら左、以外は右を返す。（null,0以外はtrue）
const PORT = process.env.PORT || 3000;

// //httpのレスポンス
// app.get("/", (req, res) => {
//   res.sendFile(path.join(process.cwd(), "public", "index.html"));
// });

//  ipアドレス表示
console.log(getLocalAddress());
function getLocalAddress() {
    let ifacesObj = {}
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = os.networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal){
                switch(details.family){
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:details.address});
                    break;
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:details.address})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

// 接続単位の処理（クライアント単位にio.onのインスタンスが作成されるイメージ。。socketも、callback関数内のローカル変数もクライアント単位）
// サーバーとクライアントの接続が確立すると、サーバー側で'connection'イベント、クライアント側で'connect'イベントが発生する
io.on('connection', (socket) => {
    console.log('connection');
    //socket.broadcast.to(room).emit('server_to_client', {value : data.value});  自分以外に送る
    //メッセージのブロードキャスト

    //クライアント毎情報の退避領域
    let roomNo = null;        　　　　//クライアントのルームNo
    let userName = null;            //クライアントのユーザー名
    let userNo = null;               //クライアントのuserNo userListのindexと同値

    //セレクトルームによる部屋メンバリスト更新
    socket.on("selectRoom", (data) => {
    	// let xplayerList = userList[roomNo].filter(elm =>{return elm[0] != null});
        console.log(playerArray[data.room]);
        io.to(socket.id).emit("renewPlayerList",  JSON.stringify(playerArray[data.room]));
    });

	//部屋に入る
	socket.on("inRoom", (data) => {
		if(roomStatus[data.room] == status_lobby){  //ロビー
            //入ろうとしている部屋の空きを確認
            let i = 0;
            while(i < userList[data.room].length && userList[data.room][i][0] != null){
                i += 1;
            };
            //対象roomに空きがあったか？
            console.log('i=',i);
            console.log('userList[data.room].length=',userList[data.room].length);
	        //対象roomに空きがあったか？
	        if(i < usersNumberLimit){
                //入室＆ユーザリスト更新
	            roomNo = data.room;                 //部屋番号を退避
	            socket.join(roomNo);                //★部屋分け
	            userNo   = i;                       //クライアントのuserList[roomNo]内indexを退避
	            userName = data.name || nameList.getNiceName();      //ユーザ名を退避（ユーザ名が空の場合、tokenをユーザ名にする）
	            userList[roomNo][userNo][0] = userName;     //userListにユーザ名を記録
                userList[roomNo][userNo][1] = userNo;     　//userListにindexを格納（playerArrayとuserListの紐つけに必要）
	            userList[roomNo][userNo][3] = true;     　//userListに生存中aliveを設定
            　　//トークン生成　→　クライアントの識別情報
                const time = new Date();
                const md5 = crypto.createHash("MD5");
                md5.update(time.toString());
                let token = md5.digest("hex");
                userList[roomNo][userNo][2] = token;     //userListにトークンを記録

                userList[roomNo][userNo][4] = data.peerId;  //peerIdを記録

		    	playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
	            io.to(roomNo).emit("renewPlayerList", JSON.stringify(playerArray[roomNo]));   //同室メンバーにplayerArrayを配布
                console.log("playerArray[roomNo]",playerArray[roomNo]);

	            io.to(roomNo).emit("message", `${userName}が入室`);                        //同室メンバーに新規メンバー入室のメッセージ送信

	            io.to(socket.id).emit("inRoomOk", {name: userName, no: userNo, token: token}); //該当クライアントの入室ok処理
	        }else{
	            //入室ng時の該当クライアント処理
	            io.to(socket.id).emit("inRoomNg", '定員オーバー入室不可'); //入室ng時の該当クライアント処理
	        }
		}else{
			io.to(socket.id).emit("inRoomNg", 'ゲーム中入室不可'); //入室ng時の該当クライアント処理
		}
	});

	//部屋を出る
	socket.on("outRoom", () => {
        if(roomNo != null && userNo != null && userList[roomNo][userNo][0] != null){
            //ユーザリスト更新
    	    io.to(roomNo).emit("message", `${userName}が退室`);
            userList[roomNo][userNo][0] = null;
            userList[roomNo][userNo][1] = null;
            userList[roomNo][userNo][2] = null;
            userList[roomNo][userNo][3] = null;

            userList[roomNo][userNo][4] = null;  //peerIdを削除

            playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
            io.to(roomNo).emit("renewPlayerList", JSON.stringify(playerArray[roomNo]));   //同室メンバーにユーザ名リストを配布

            socket.leave(roomNo);
            roomNo = null;
            userName = null;
            userNo = null;
        }else{
            socket.leave(roomNo);
            roomNo = null;
            userName = null;
            userNo = null;
        }
	});

	socket.on("message", (strMessage) => {
        io.to(roomNo).emit("message", strMessage); // 同じ部屋のクライアント全員にメッセージ送信
	});

    // ダミーコネクト　heroku の30秒タイムアウト対応
    socket.on("dummyConnect", () => {
        // console.log("dummyconnect",userName);
    });

//-------------------------------------------------------------
    // 切断時の処理
    // クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
    socket.on('disconnect', () => {
        console.log("disconnect");
        console.log("roomStatus",roomStatus);
        console.log('userList',userList);
        console.log('roomNo',roomNo,"  userNo",userNo);        
        if(roomNo == null || userNo == null || roomStatus[roomNo] == status_lobby){    //ロビー
            if(userName != null){
                //ユーザリスト更新
                io.to(roomNo).emit("message", `${userName}が切断`);
                userList[roomNo][userNo][0] = null;
                userList[roomNo][userNo][1] = null;
                userList[roomNo][userNo][2] = null;
                userList[roomNo][userNo][3] = null;

                userList[roomNo][userNo][4]= null;  //peerIdを削除

                playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
                io.to(roomNo).emit("renewPlayerList", JSON.stringify(playerArray[roomNo]));
            }
        }else{　 //ゲーム中
            //・該当クライアント以外のルームメンバー以外に対して、該当クライアントが切断時の処理を要求
            //・該当クライアントがカレントプレイヤーだった場合は、カレントプレイヤー、ターンを更新
            userList[roomNo][userNo][3] = false;
            playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
            // io.to(roomNo).emit("renewPlayerList", JSON.stringify(playerArray[roomNo])); //クライアント側ではplayerarrayの生死パラメタを使用しないため、配信なし。

            let xplayerIndex = playerArray[roomNo].findIndex((elm) => elm[1] == userNo);  //playerIndex取得
            io.to(roomNo).emit("playerDisconnect", {playerIndex: xplayerIndex});

            //切断したのがカレントプレイヤーだったら、他のプレイヤーに対してreadyNextTurn実行指示
            if(xplayerIndex == currentPlayer[roomNo]){
                updateCurrentPlayer();
                io.to(roomNo).emit("readyNextTurn", {currentPlayer : currentPlayer[roomNo]});
            }
        }
    });

    socket.on('serverReconnect', (data) => {
        //リコネクトかどうかをユーザリスト　userList[roomNo][i][2] でチェックし、
        //リコネクトならサーバ側の状態を入室、ゲーム中に変えて、みんなの操作をホールド、切断中のコマンドを送信、ホールド解除を行う。
        console.log('serverReconnect',data);
        roomNo = data.room
        userNo = data.no
        if(roomNo != null && userNo != null && userList[roomNo][userNo][2] == data.token){
            userName = userList[roomNo][userNo][0]
            socket.join(roomNo);

            console.log('commandList[roomNo].length',commandList[roomNo].length);
            commandHold[roomNo] = true;     //みんなの操作を時間差実行設定。
            for(let i = data.cnt; i < commandList[roomNo].length; i++){
                io.to(socket.id).emit(commandList[roomNo][i][0], commandList[roomNo][i][1]);
            }

            userList[roomNo][userNo][4] = data.peerId;  //peerIdを更新

            userList[roomNo][userNo][3] = true;
            playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
            io.to(roomNo).emit("renewPlayerList", JSON.stringify(playerArray[roomNo]));

            //みんなに対してリコネクト通知。
            let xplayerIndex = playerArray[roomNo].findIndex((elm) => elm[1] == userNo);  //playerIndex取得
            io.to(roomNo).emit("playerReconnect", {playerIndex: xplayerIndex});

            //自分に対してカレントプレイヤー設定。
            io.to(socket.id).emit("readyNextTurn", {currentPlayer : currentPlayer[roomNo]});
            
            commandHold[roomNo] = false;    //みんなの操作を解放
        }else{
            io.to(socket.id).emit("displacement");
        }
    });

    // ゲーム終了時の部屋解散
    socket.on("serverDismissRoom", () => {
        if(roomNo != null){
            io.to(roomNo).emit("dismissRoom");
	    	roomStatus[roomNo] = status_lobby;
            for(let i = 0; i < usersNumberLimit; i++){
                for(let j = 0; j < userList[roomNo][i].length; j++){
                    userList[roomNo][i][j] = null;
                }
            }
        }
    });

    socket.on("serverGameStart", () => {
        //deckArrayのソート
        for(let i = 0; i < deckCardsNumber; i++){
          deckArray[i][2] = Math.random();
        }
        deckArray.sort((a,b)=>{
            if( a[2] < b[2] ) return -1;
            if( a[2] > b[2] ) return 1;
            return 0;
        });
        let sortDeckArray = deckArray.map(item => {return new Array(item[0],item[1]);});

        if(roomNo != null){
        	if(playerArray[roomNo].length > 1){
                roomStatus[roomNo] = status_game;      //ゲーム中
                currentPlayer[roomNo] = 0; //カレントプレイヤーの初期化
                commandList[roomNo] = [];
	        	io.to(roomNo).emit("gameStart",{
                    currentPlayer: currentPlayer[roomNo],
	        		deck: JSON.stringify(sortDeckArray),
	        		cemetary: JSON.stringify(cemetaryArray),
                    cattr: JSON.stringify(cardAttr),
                    handCardNumber: handCardNumber
	        	});
        	}else{
				io.to(socket.id).emit("message", 'メンバー不足 ゲーム開始不可'); //入室ng時の該当クライアント処理
        	}
    	}
    });

//-------------------------------------------------------------

    // カード移動msgの送信（全員）
    socket.on("serverPlayCard", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("playCard", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("playCard", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["playCard", data];
        console.log('serverPlayCard',commandList[roomNo].length);
    });

    socket.on("serverButtonAction", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("buttonAction", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("buttonAction", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["buttonAction", data];
        console.log('serverButtonAction',commandList[roomNo].length);
    });

    socket.on("serverReadyNextTurn", () => {
        if(!commandHold[roomNo]){
            //currentPlayerを更新
            updateCurrentPlayer();
            io.to(roomNo).emit("readyNextTurn", {currentPlayer : currentPlayer[roomNo]});
        }else{
            setTimeout(() => {
                //currentPlayerを更新
                updateCurrentPlayer();
                io.to(roomNo).emit("readyNextTurn", {currentPlayer : currentPlayer[roomNo]});
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["readyNextTurn", {currentPlayer : currentPlayer[roomNo]}];
        console.log('serverReadyNextTurn',commandList[roomNo].length);
    });

    function updateCurrentPlayer(){
        let preCrrentPlayer = currentPlayer[roomNo];
        currentPlayer[roomNo] = currentPlayer[roomNo] + 1;
        if(currentPlayer[roomNo] >= playerArray[roomNo].length){
            currentPlayer[roomNo] = 0;
        }
        while(!playerArray[roomNo][currentPlayer[roomNo]][3] && preCrrentPlayer != currentPlayer[roomNo]){  //死んだプレイヤーをスキップ
            currentPlayer[roomNo] += 1;
            if(currentPlayer[roomNo] >= playerArray[roomNo].length){
                currentPlayer[roomNo] = 0;
            }
        }
    }

    socket.on("serverRollDice", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("rollDice", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("rollDice", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["rollDice", data];
        console.log('serverRollDice',commandList[roomNo].length);
    });

    socket.on("serverPlayPiece", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("playPiece", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("playPiece", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["playPiece", data];
        console.log('serverPlayPiece',commandList[roomNo].length);
    });

    socket.on("serverDeletePiece", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("deletePiece", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("deletePiece", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["deletePiece", data];
        console.log('serverDeletePiece',commandList[roomNo].length);
    });

    socket.on("serverResign", (data) => {
        if(!commandHold[roomNo]){
            userList[roomNo][data.player][3] = false;
            playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
            io.to(roomNo).emit("resign", data);
        }else{
            setTimeout(() => {
                userList[roomNo][data.player][3] = false;
                playerArray[roomNo] = userList[roomNo].filter(elm =>{return elm[0] != null});  //playerArray更新
                io.to(roomNo).emit("resign", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["resign", data];
        console.log('serverResign',commandList[roomNo].length);
    });

    socket.on("serverPermitRevoke", (data) => {
        if(!commandHold[roomNo]){
            io.to(roomNo).emit("permitRevoke", data);
        }else{
            setTimeout(() => {
                io.to(roomNo).emit("permitRevoke", data);
            }, 500);        
        }
        commandList[roomNo][commandList[roomNo].length] = ["permitRevoke", data];
        console.log('serverPermitRevoke',commandList[roomNo].length);
    });

    // msgの送信（送信元以外）
    //    socket.broadcast.to(roomNo).emit("moveCard", data);

});
// 公開フォルダの指定..express
//app.use([パス]ミドルウェア関数)はミドルウェア関数の使用を指定。
//[パス]は省略可能で、クライアントからのすべてのリクエストでミドルウェア関数が実行される。
//[パス]に'/about'などが記述される、'/about'のリクエストが合った際に実行されるミドルウェア関数を設定できる。
//app.useで設定した順でミドルウェア関数が実行さることに注意
//__dirnameはプロジェクト全体のファイルのリンク
//express.static関数は、静的ファイルのフォルダを指定する（参照可能にする）もの
app.use(express.static(__dirname + '/public'));

//app.get('パス', ミドルウェア関数)
//クライアントから'パス'へのGET要求があったときに実行する処理をミドルウェア関数記述
//app.getのミドルウェア関数の中でres.renderを使用して、htmlファイルを生成したりする
//--------------------------
// app.get('/', (req, res, next) => {
//     res.render('home.hbs',{
//         pageTitle:'Welcome to My ホームページ',
//         titleName:'タイトルなんやで'
//     })
// })
//--------------------------
// 　reqは「request」の略。クライアントからのHTTPリクエストに関する情報が格納される
// 　resは「response」の略。クライアントに送り返すHTTPの情報が格納される
// 　nextは、このミドルウェア関数の次に実行したいコールバック関数が入る。これはapp.useで設定した関数が格納される。
// 　app.useで設定したミドルウェア関数を連続で実行させたいときは、そのミドルウェア関数の中でと、next関数を実行（next();）
// 　する必要がある。

// サーバーの起動
server.listen(PORT, () => {
    console.log('server starts on port: %d', PORT,Date(Date.now()));
});
// クライアントからブラウザでhttp://localhost:3000 にアクセスすると、上記公開フォルダ
// のindex.htmlが表示される。（パスだけで接続しに行くとindex.htmlを探して表示）
// サーバーとクライアントの接続が確立すると、下記イベントが発生する。
//・ サーバー側　　 ： connection イベント（/server.js に記載）
//・ クライアント側 ： connect イベント（/public/client.js に記載）


