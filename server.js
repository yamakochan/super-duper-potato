'use strict';

// モジュール
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

// オブジェクト deck
let deckArray = [];
let xxArray = new Array(93);
for(let i = 0; i < 93; i++){
  let xtext = "./image/card01/mm" + ('000' + (i+1)).slice(-2) + ".png";
  xxArray[i] = new Array(xtext,Math.random());
}
xxArray.sort((a,b)=>{
        if( a[1] < b[1] ) return -1;
        if( a[1] > b[1] ) return 1;
        return 0;
});
deckArray = xxArray.map(item => item[0]);

// オブジェクト cemetary
let cemetaryArray = [];
let yyArray = new Array(5);
for(let i = 0; i < 5; i++){
  let xtext = "./image/card01/ima" + ('000' + (i+1)).slice(-2) + ".png";
  yyArray[i] = new Array(xtext,Math.random());
}
yyArray.sort((a,b)=>{
        if( a[1] < b[1] ) return -1;
        if( a[1] > b[1] ) return 1;
        return 0;
});
cemetaryArray = yyArray.map(item => item[0]);

// ユーザーリスト
const userList = new Array(3);  //room
for (let i=0; i<userList.length; i++){
    userList[i] = new Array(4);  //user
    for(let j=0; j<userList[i].length; j++){
        userList[i][j] = new Array(2); //username , userno
	    for(let k=0; k<userList[i][j].length; k++){
	        userList[i][j][k] = null;
	    }
    }
}
// ルームステータス　0:受付中　1:ゲーム中
const roomStatus = [0,0,0];

// ポート番号	||は左がtrueなら左、以外は右を返す。（null,0以外はtrue）
const PORT = process.env.PORT || 3000;

  // グローバル変数
let MEMBER_COUNT = 0; // ユーザー数

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

// 接続単位の処理（クライアント単位にインスタンスが作成されるイメージ。。socketも、callback関数内のローカル変数もクライアント単位）
io.on('connection', (socket) => {
    console.log('connection');
　　//トークン生成　→　クライアントの仮ユーザー名
    const time = new Date();
    const md5 = crypto.createHash("MD5");
    md5.update(time.toString());
    let token = md5.digest("hex");
    //クライアント毎情報の退避領域
    let roomNo = null;        　　　　//クライアントのルームNo
    let userName = null;            //クライアントのユーザー名
    let userNo = null;               //クライアントのuserNo userListのindexと同値

    //セレクトルームによる部屋メンバリスト更新
    socket.on("selectRoom", (data) => {
    	let xuserList = userList[data.room].filter(elm =>{return elm[0] != null});
        console.log(xuserList);
        io.to(socket.id).emit("renewUserList",  JSON.stringify(xuserList));
    });

	//部屋に入る
	socket.on("inRoom", (data) => {
		if(roomStatus[data.room] == 0){
	        //入ろうとしている部屋の空きを確認
	        let i = 0;
	        while(i < userList[data.room].length && userList[data.room][i][0] != null){
	            i += 1;
	        };
	        //対象roomに空きがあったか？
	        console.log('i=',i);
	        console.log('userList[data.room].length=',userList[data.room].length);
	        if(i < userList[data.room].length){
	            roomNo = data.room;                 //部屋番号を退避
	            socket.join(roomNo);                //★部屋分け
	            userNo   = i;                       //クライアントのuserList[roomNo]内indexを退避
	            userName = data.name || token;      //ユーザ名を退避（ユーザ名が空の場合、tokenをユーザ名にする）
	            userList[roomNo][i][0] = userName;     //userListにユーザ名を記録
	            userList[roomNo][i][1] = userNo;     //userListにユーザ名を記録

		    	let xuserList = userList[roomNo].filter(elm =>{return elm[0] != null});
	            io.to(roomNo).emit("renewUserList", JSON.stringify(xuserList));   //同室メンバーにユーザ名リストを配布

	            io.to(roomNo).emit("message", `${userName}が入室`);                        //同室メンバーに新規メンバー入室のメッセージ送信
	            io.to(socket.id).emit("inRoomOk", {name: userName, no: i }); //入室ok時の該当クライアント処理
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
        if(userList[roomNo][userNo][0] != null){
    	    io.to(roomNo).emit("message", `${userName}が退室`);
            userList[roomNo][userNo][0] = null;
            userList[roomNo][userNo][1] = null;

	    	let xuserList = userList[roomNo].filter(elm =>{return elm[0] != null});
            io.to(roomNo).emit("renewUserList", JSON.stringify(xuserList));   //同室メンバーにユーザ名リストを配布
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

    //socket.broadcast.to(room).emit('server_to_client', {value : data.value});  自分以外に送る
	//メッセージのブロードキャスト

	socket.on("message", (strMessage) => {
        // 同じ部屋のクライアント全員に送信
        io.to(roomNo).emit("message", strMessage);
	});

    // 切断時の処理
    socket.on('disconnect', () => {
        console.log('disconnect');
        if(userName != null){
            io.to(roomNo).emit("message", `${userName}が切断`);
            // //ユーザリストからクライアントのユーザ名を除外（そして後ろを詰める）
            // for(let i=0; i<userList[roomNo].length - 1; i++){
            //     if(i >= userNo){
            //         userList[roomNo][i] = userList[roomNo][i+1];
            //     }
            // }
            // userList[roomNo][userList[roomNo].length - 1] = null;
            userList[roomNo][userNo][0] = null;
            userList[roomNo][userNo][1] = null;
	    	let xuserList = userList[roomNo].filter(elm =>{return elm[0] != null});
            io.to(roomNo).emit("renewUserList", JSON.stringify(xuserList));
            if(xuserList.length == 0){
            	roomStatus[roomNo] = 0;
            }
        }
    });

    // ゲーム終了時の部屋解散
    socket.on("serverDismissRoom", () => {
        if(roomNo != null){
            io.to(roomNo).emit("dismissRoom");
	    	roomStatus[roomNo] = 0;
        }
    });

    socket.on("serverGameStart", () => {
        if(roomNo != null){
	    	let xuserList = userList[roomNo].filter(elm =>{return elm[0] != null});
        	if(xuserList.length > 1){
	    		roomStatus[roomNo] = 1;
	        	io.to(roomNo).emit("gameStart",{
	        		deck: JSON.stringify(deckArray),
	        		cemetary: JSON.stringify(cemetaryArray)
	        	});
        	}else{
				io.to(socket.id).emit("message", 'メンバー不足 ゲーム開始不可'); //入室ng時の該当クライアント処理
        	}
    	}
    });

    // カード移動msgの送信（全員）
    socket.on("serverPlayCard", (data) => {
        io.to(roomNo).emit("playCard", data);
    });

    socket.on("serverButtonAction", (data) => {
        io.to(roomNo).emit("buttonAction", data);
        console.log(data);
    });

    socket.on("serverChangeTurn", () => {
        io.to(roomNo).emit("changeTurn");
    });

    socket.on("serverRollDice", (data) => {
        io.to(roomNo).emit("rollDice", data);
    });

    socket.on("serverPlayPiece", (data) => {
        io.to(roomNo).emit("playPiece", data);
    });

    socket.on("serverDeletePiece", (data) => {
        io.to(roomNo).emit("deletePiece", data);
    });

    socket.on("serverResign", (data) => {
        io.to(roomNo).emit("resign", data);
    });

    socket.on("serverPermitRevoke", (data) => {
        io.to(roomNo).emit("permitRevoke", data);
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


