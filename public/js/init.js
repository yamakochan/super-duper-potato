window.addEventListener('load',init);
function init() {
	if (window.innerWidth <= 767) {
		let xlocarr  = document.location.href.split("/");
		let xlocarr1 = xlocarr.slice(0,-1);
		let xlocation = xlocarr1.join("/");
    	document.location.href = xlocation + "/sp/";
	}

	cns_sp = false;
    cns_boadWidth = 1281;
    cns_boadHeight = 1281;
    cns_scale = 1;
	if(window.innerWidth < cns_boadWidth){
		cns_stageWidth = window.innerWidth;
	}else{
		cns_stageWidth = cns_boadWidth;
	}
	if(window.innerHeight < cns_boadHeight){
		cns_stageHeight = window.innerHeight;
	}else{
		cns_stageHeight = cns_boadHeight;
	}

	const canvasElement = document.getElementById("myCanvas");
	canvasElement.setAttribute("width" ,cns_stageWidth);
	canvasElement.setAttribute("height" ,cns_stageHeight);

	stage = new createjs.StageGL(canvasElement);

	//パスプレフィックス　カードパスのプレフィックス
	cns_passPrefix = "";

	//イメージ定義
	cns_diceImage = "./image/dice2.png";
	cns_boadImage = "./image/boad1281.png";
	cns_tailImage = "./image/card01/tails01.png";

	//サウンド定義
	createjs.Sound.registerSound("./sounds/piece.mp3", "piece");
	createjs.Sound.registerSound("./sounds/draw.mp3", "draw");
	createjs.Sound.registerSound("./sounds/srthand.mp3", "srthand");
	createjs.Sound.registerSound("./sounds/turn.mp3", "turn");
	createjs.Sound.registerSound("./sounds/place.mp3", "place");
	createjs.Sound.registerSound("./sounds/dice1.mp3", "dice1");
	createjs.Sound.registerSound("./sounds/dice2.mp3", "dice2");
	createjs.Sound.registerSound("./sounds/button.mp3", "button");
	createjs.Sound.registerSound("./sounds/champion.mp3", "champion");
	createjs.Sound.registerSound("./sounds/lost.mp3", "lost");
	createjs.Sound.registerSound("./sounds/in_out_room.mp3", "inoutroom");
	createjs.Sound.registerSound("./sounds/glass.mp3", "glass");
	createjs.Sound.registerSound("./sounds/beep.mp3", "beep");

	// スピード
	cns_speed = 1;          //background 速さ係数（fps60のとき1。fpsが小さいと係数は大きくする必要がある）  
	cns_friction = 1 / 50;  //background 摩擦係数（fps60のとき1/50。fpsが小さいと係数は大きくする必要がある）
	cns_duration = 300;     //teenの期間　


	// タッチ操作をサポートしているブラウザーならばタッチ操作を有効にします。
	if(createjs.Touch.isSupported() == true){
 		createjs.Touch.enable(stage);
	}

	createjs.Ticker.addEventListener("tick",stage); //自動更新を有効にする

	//ブラウザの画面更新に適したタイミング「RAF」は１秒間に６０回発生する。60fpsを実現
	createjs.Ticker.timingMode = createjs.Ticker.RAF; //滑らかに

	//１秒間に更新するフレーム数を指定。デフォルトは２４fps ＝＞　スマホはこっちで調整
	// createjs.Ticker.framerate = 40;
}
