
//自分の部屋のユーザリストを受け取る。自分のplayerNoはグローバルのuserNoをつかう。
//deckリスト（画像png）cemetaryリスト（画像png）を受け取る。手札数制限を受け取る
function initStage(argUserList,argDeckList,argCemetaryList,argDescList,argHandCards) {
	// verとか書かないとglobal変数
	for(let i = 0; i < argUserList.length; i++){
		if(argUserList[i][1] == userNo){
			cns_myPlayerIndex = i;	
		}
	}
	cns_players = argUserList.length;		//プレイヤー数
	cns_handCards = argHandCards;           //手札の数制限、あとで直す。（外からもらう）

	cns_cardWidth = 100;
	cns_cardHeight = 140;

	cns_deckLeft = 68;
	cns_deckTop = -55;

	cns_cemetaryLeft = -80;
	cns_cemetaryTop = 40;

	cns_layer1Width = cns_boadWidth;
	cns_layer1Height = cns_boadHeight;
	cns_layer1Left = -1 * cns_layer1Width / 2;
	cns_layer1Right = cns_layer1Width / 2;
	cns_layer1Top = -1 * cns_layer1Height / 2;
	cns_layer1Bottom = cns_layer1Height / 2;
	cns_layer1SideMargin = 100;
	cns_layer1VertMargin = 100;
	cns_layer1InitX = cns_stageWidth / 2;
	cns_layer1InitY = -1 * (cns_layer1Height / 2 - cns_stageHeight);

	cns_handMargin = 1; //カード間隔 1pt
	cns_handWidth = (cns_cardWidth + cns_handMargin) * 5; //card５枚分＋間5pt
	cns_handLeft = -1 * cns_handWidth / 2 + cns_cardWidth / 2;               //手札置き場のX座標
	cns_handTop = cns_layer1Bottom - cns_cardHeight / 2 - 5;  //手札置き場のY座標

	cns_buttonWidth = 40;
	cns_buttonHeight = 30;

	cns_flagWidth = 35;
	cns_flagHeight = 35;


	//自分用の表示位置計算用角度（backgroundの表示角度）
	cns_rotation = 0;
	if(cns_players == 2 && cns_myPlayerIndex == 1){
		cns_rotation = 180;
	}
	if((cns_players == 3 || cns_players == 4) && cns_myPlayerIndex == 1){
		cns_rotation = 90;
	}
	if((cns_players == 3 || cns_players == 4) && cns_myPlayerIndex == 2){
		cns_rotation = 180;
	}
	if(cns_players == 4 && cns_myPlayerIndex == 3){
		cns_rotation = -90;
	}


	// layer1 = new createjs.Container();
	layer1 = new createjs.Container();
	stage.addChild(layer1); 
	layer1.x = cns_layer1InitX;
	layer1.y = cns_layer1InitY;

	info = new createjs.Container();
	stage.addChild(info);

	//背景を作成 xy座標をlayer1の左上にして背景登録
	//	background = new Background(cns_layer1Left,cns_layer1Top);
	background = new Background(0,0);
	layer1.addChild(background); //背景

    // 審判を作成
    judge = new Judge(argUserList,argDeckList,argCemetaryList,argDescList);

	//stage の描画を更新
	stage.update();	

	judge.changeTurn();
}

function clearStage() {
	stage.removeChild(layer1); 
	stage.removeChild(info);

	endGame();
}

class Judge{
	constructor(argUserList, argDeckList, argCemetaryList, argDescList){
		this.playerList = [];		
		this.currentPlayer = -1;	//userNo と対応
		this.score = [];
		this.xscore = [];
		this.perm = Array();
		this.kenjyaYumeMode = false;

		//current button
		this.currentButton = null;

		//0:試合中　1:操作終了　2:試合終了
		//judgeでwinnerが決まったら一旦操作終了とする。
		//操作終了となったら、駒操作不可とする。（hitした他方のpieceから呼ばれたjudge,または運動中の駒がhitした場合に呼ばれたjudgeでdrawとなる可能性あり）
		//操作終了となり、かつ運動中の駒がなくなったら、試合終了。→背景クリックでロビーに戻る。
		this.end = 0;

		// デッキ表示
		this.deck = new Deck();
		background.addChild(this.deck);
	    // deckにカードを追加   
		for (let i = 0; i < argDeckList.length; i++){
			let xno = argDeckList[i][1];
			let xcard = new Card(cns_passPrefix + argDeckList[i][0],xno,argDescList[xno]);
			xcard.x = cns_layer1Left;
			xcard.y = cns_layer1Top;
			xcard.rotation = cns_rotation;
			this.deck.addDeckCard(xcard);
		}

		// cemetary表示
		this.cemetary = new Cemetary();
		background.addChild(this.cemetary);
	    // cemetaryにカードを追加    
	    let j = argDeckList.length;
		for (let i = 0; i < argCemetaryList.length; i++){
			let xno = argCemetaryList[i][1];
			let xcard = new Card(cns_passPrefix + argCemetaryList[i][0],xno,argDescList[xno]);
			xcard.x = cns_layer1Left;
			xcard.y = cns_layer1Top;
			xcard.rotation = cns_rotation;
			this.cemetary.addCemetaryCard(xcard);
			j++;
		}

		// playerを作成　（hand , placeを含む）
    	for (let i = 0; i < cns_players; i++){
    		let xplayer = new Player(i,argUserList[i][0],90 * i)
    	// playerを描画
	    	// layer1.addChild(xplayer);
	    // 審判に登録
			this.playerList[i] = xplayer;
		// スコアに表示
	    	this.score[i] =  new createjs.Text("", "14px sans-serif", "GhostWhite");
		//	this.score[this.playerCount - 1].text = "Player" + this.playerCount + ": " + judge.playerList[this.playerCount - 1].pieceExistFlg.reduce((p,c) => p += c,0) + "p";
			this.score[i].text = xplayer.playerName + ": " + this.playerList[i].score;
		    this.score[i].textAlign = "left";
		    this.score[i].textBaseline = "top";
		    this.score[i].x = (cns_stageWidth - 20) / cns_players * (i) + 10;
		    this.score[i].y = 10;
			// this.score[i].shadow = new createjs.Shadow("#000000", 3, 3, 5);
			this.score[i].cache(0,0,150,30);

	    	let scoreShadow =  new createjs.Text("", "14px sans-serif", "dimgray");
			scoreShadow.text = xplayer.playerName + ": " + this.playerList[i].score;
		    scoreShadow.textAlign = "left";
		    scoreShadow.textBaseline = "top";
		    scoreShadow.x = (cns_stageWidth - 20) / cns_players * (i) + 11;
		    scoreShadow.y = 11;
			scoreShadow.cache(0,0,150,30);

		    info.addChild(scoreShadow);
		    info.addChild(this.score[i]);
		}

		//piece用のコンテナ
		this.otherPlace = new OtherPlace();
		background.addChild(this.otherPlace);
		
// 拡大縮小のため、cardとpieceのコンテナはbackgroundのchildにする。　（pieceが一番上のレイヤ）
// card,pieceのイベント処理では、backgraundへのイベント波及を止めるため、stopPropagation()をコール。

		//dice
		this.diceButton = new DiceButton(10,100);

		//piece
		this.pieceButton = new PieceButton(10,150);
		this.pieceButton2 = new MinusPieceButton(10,190);

		//resign
		this.settingFlag = new SettingFlag(cns_stageWidth - 50,45 + cns_flagHeight / 2);
		
		//view
		this.viewButton = new ViewButton(cns_stageWidth - 50,95);
	}

	playCard(data){
		let tempArray = new Array();
		// if(data.status == 0){
		//     tempArray = judge.deck.deckCard;
		// }
		if(data.status == 0){
		    tempArray = this.deck.deckCard;
		}
		if(data.status == 1){
		    tempArray = this.playerList[data.player].hand.handCard;
		}
		if(data.status == 2){
		    tempArray = this.playerList[data.player].place.placeCard;
		}
		if(data.status == 9){
		    tempArray = this.cemetary.cemetaryCard;
		}
		if(data.status == 5){
		    tempArray = this.kenjyaYumePlace.kenjyaYumeCard;
		}
		let tempCard = tempArray.find(elm => {
		    return elm.no == data.no;
		});
		// カード操作直前に変更
		// tempCard.rotation = (cns_rotation - this.playerList[data.player].playerRotation)
  
		let xplayer = this.playerList[data.player]

		if(this.kenjyaYumeMode == false){    //賢者の夢の呪文中以外
			switch(tempCard.status){
				case 0:		//deckカード
			    	if(xplayer.hand.handCard.length < cns_handCards){	//手札がlimit数を超えてたら移動キャンセル
						tempCard.rotation = (cns_rotation - xplayer.playerRotation)
						this.deck.delDeckCard(tempCard);
						this.playerList[data.player].hand.addHandCard(tempCard, cns_layer1Left, this.playerList[data.player].playerNo == cns_myPlayerIndex);
					}else{
						createjs.Sound.play("beep");
			    		if(xplayer.playerNo == cns_myPlayerIndex){
				    		tempCard.x = tempCard.backupPointX;
				    		tempCard.y = tempCard.backupPointY;
			    		}
					}
					break;
				case 2:		//placeカード
					tempCard.rotation = (cns_rotation - xplayer.playerRotation)
			        if(data.location == 1){	//カード配置　0:hand , 1:place , 2:cemetary
			        	// カード場所移動だけ。
			    		xplayer.place.srtPlaceCard(tempCard,data.nX,data.nY); 
				    }
			        if(data.location == 0){	//カード配置　0:hand , 1:place , 2:cemetary
				    	if(xplayer.hand.handCard.length < cns_handCards){	//手札がlimit数を超えてたら移動キャンセル
				    // 場札から手札に変更
				    // 手札の順番入れ替え　＆　表示位置変更
				    		xplayer.place.delPlaceCard(tempCard);
				    		xplayer.hand.addHandCard(tempCard, data.nX, xplayer.playerNo == cns_myPlayerIndex);　　
				    	}else{
							createjs.Sound.play("beep");
				    		if(xplayer.playerNo == cns_myPlayerIndex){
					    		tempCard.x = tempCard.backupPointX;
					    		tempCard.y = tempCard.backupPointY;
				    		}
				    	}
				    }
					break;
				case 1:		//handカード
					tempCard.rotation = (cns_rotation - xplayer.playerRotation)
			        if(data.location == 1){	//カード配置　0:hand , 1:place , 2:cemetary
				    // 手札から場札に変更
		//		    	let cloneCard = tempCard.cloneCard(tempCard);
		//		    	xplayer.place.addPlaceCard(cloneCard,newX,newY);
			    		xplayer.hand.delHandCard(tempCard); 　
				    	xplayer.place.addPlaceCard(tempCard,data.nX,data.nY);
				    }
			        if(data.location == 0){	//カード配置　0:hand , 1:place , 2:cemetary
				    // 手札の順番入れ替え　＆　表示位置変更
			    		xplayer.hand.srtHandCard(tempCard,data.nX); 
				    }
					break;
				case 9:		//cemetaryカード
					tempCard.rotation = (cns_rotation - xplayer.playerRotation)
			        if(data.location == 1){	//カード配置　0:hand , 1:place , 2:cemetary
			    		judge.cemetary.delCemetaryCard(tempCard); 　
				    	xplayer.place.addPlaceCard(tempCard,data.nX,data.nY);
				    }
			        if(data.location == 0){	//カード配置　0:hand , 1:place , 2:cemetary
				    	if(xplayer.hand.handCard.length < cns_handCards){	//手札がlimit数を超えてたら移動キャンセル
				    // 場札から手札に変更
				    // 手札の順番入れ替え　＆　表示位置変更
				    		judge.cemetary.delCemetaryCard(tempCard); 　
				    		xplayer.hand.addHandCard(tempCard, data.nX, xplayer.playerNo == cns_myPlayerIndex);　　
				    	}else{
							createjs.Sound.play("beep");
				    		if(xplayer.playerNo == cns_myPlayerIndex){
					    		tempCard.x = tempCard.backupPointX;
					    		tempCard.y = tempCard.backupPointY;
				    		}
				    	}
				    }
					break;
				default:
					console.log('error');					
			}
		}else{
			switch(tempCard.status){
				case 0:		//deckカード
		    		if(this.kenjyaYumePlace.kenjyaYumeCard.length < 10){
						tempCard.rotation = (cns_rotation - xplayer.playerRotation)
						this.deck.delDeckCard(tempCard);
						this.kenjyaYumePlace.addCard(tempCard, data);
					}else{
						createjs.Sound.play("beep");
					}
					break;
				case 1:		//handカード
		    		if(this.kenjyaYumePlace.kenjyaYumeCard.length < 10){
						tempCard.rotation = (cns_rotation - xplayer.playerRotation)
			    		xplayer.hand.delHandCard(tempCard); 　
						this.kenjyaYumePlace.addCard(tempCard, data);
					}else{
						createjs.Sound.play("beep");
					}
					break;
				case 5:		//kenjyayumeカード
		    		this.kenjyaYumePlace.delCard(tempCard);
		    		xplayer.hand.addHandCard(tempCard, cns_layer1Left, xplayer.playerNo == cns_myPlayerIndex);　
		    		if(this.kenjyaYumePlace.kenjyaYumeCard.length > 0){
						this.kenjyaYumePlace.returnCard();
		    		}
					this.kenjyaYumeModeOff();
					background.removeChild(this.kenjyaYumePlace);
					this.kenjyaYumePlace = null;
					createjs.Sound.play("glass");
					break;
				default:
					console.log('error');					
			}
		}
	}

	buttonAction(data){
		let tempArray = this.deck.deckCard;
		let tempX = 0;
		let tempY = 0;
		let tempRotation = 0;
		if(data.text == "draw"){
	    	if(this.playerList[data.player].hand.handCard.length < cns_handCards){	//手札がlimit数を超えてたら移動キャンセル
				tempArray = this.deck.deckCard;
				let tempCard = tempArray.find(elm => {return elm.no == data.no;});
				tempX = cns_layer1Left;

				tempCard.rotation = (cns_rotation - this.playerList[data.player].playerRotation);
				this.deck.delDeckCard(tempCard);
				this.playerList[data.player].hand.addHandCard(tempCard, tempX, this.playerList[data.player].playerNo == cns_myPlayerIndex);
			}else{
				createjs.Sound.play("beep");
			}
		}
		if(data.text == "trash"){
		    tempArray = this.playerList[data.player].place.placeCard;
			let tempCard = tempArray.find(elm => {return elm.no == data.no;});
	
			tempCard.rotation = cns_rotation;
			this.playerList[data.player].place.delPlaceCard(tempCard);
			this.cemetary.addCemetaryCard(tempCard);
		}
		if(data.text == "Trash"){
		    tempArray = this.playerList[data.player].hand.handCard;
			let tempCard = tempArray.find(elm => {return elm.no == data.no;});
	
			tempCard.rotation = cns_rotation;
			this.playerList[data.player].hand.delHandCard(tempCard);
			this.cemetary.addCemetaryCard(tempCard);
		}
		if(data.text == "rvrse"){
		    tempArray = this.playerList[data.player].hand.handCard;
			let tempCard = tempArray.find(elm => {return elm.no == data.no;});
	
			tempCard.rotation = cns_rotation;
			this.playerList[data.player].hand.delHandCard(tempCard);
			this.deck.addDeckCard(tempCard);
		}
		if(data.text == "spread"){
			this.cemetary.spreadCemetaryCard(this.playerList[data.player].playerRotation);
		}
		if(data.text == "close"){
			this.cemetary.closeCemetaryCard();
		}
		if(data.text == "kenjya"){
			this.kenjyaYumePlace = new KenjyaYumePlace();
			background.addChild(this.kenjyaYumePlace);

			this.kenjyaYumeModeOn();
		}
	}

	changeTurn(){  //みんなから呼ばれる前提
		//子要素にマウスイベントが伝搬されないようにする。
		for (let i = 0; i < cns_players; i++){
			this.playerList[i].mouseChildren = false;
			this.playerList[i].hand.mouseChildren = false;
			this.playerList[i].place.mouseChildren = false;
		}
		this.deck.mouseChildren = false;
		this.cemetary.mouseChildren = false;

		//place,hand はターンに関係なく　自分のだけ操作可能
		if(this.playerList[cns_myPlayerIndex].live){
			this.playerList[cns_myPlayerIndex].place.mouseChildren = true;
			this.playerList[cns_myPlayerIndex].hand.mouseChildren = true;
		}

		//カレントプレイヤー変更
		this.currentPlayer += 1;
		if(this.currentPlayer >= cns_players){
			this.currentPlayer = 0;
		}
		while(!this.playerList[this.currentPlayer].live){
			this.currentPlayer += 1;
			if(this.currentPlayer >= cns_players){
				this.currentPlayer = 0;
			}
		}

		//自分のはターンだけ、deck,cemetaryの操作可
		if(this.currentPlayer == cns_myPlayerIndex){
			this.playerList[this.currentPlayer].mouseChildren = true;
			this.deck.mouseChildren = true;
			this.cemetary.mouseChildren = true;
		//turnendボタン作成
			this.turn = new TurnButton(10,45);

		//permitrevokeボタン作成
			let yy = 250;
			for(let i = 0; i < cns_players; i++){
				if(this.playerList[i].live && i != cns_myPlayerIndex){
					this.perm[i] = new PermitRevokeButton(10,yy,i);
					yy = yy + 40;
				}else{
					this.perm[i] = null;
				}
			}
		}else{
			for(let i = 0; i < this.perm.length; i++){
				if(this.perm[i] != null){
			 		this.perm[i].off();
			 		info.removeChild(this.perm[i]);
			 		this.perm[i] = null;
				}
			}
		}
		//currentPlayerのスコアに色付け。
		info.removeChild(this.currentscore);
		this.currentscore = this.score[judge.currentPlayer].clone();
		this.currentscore.shadow = null;
		this.currentscore.color = "hsl(" + judge.currentPlayer*99 + ", 90%, 50%)";
		this.currentscore.outline = 1;
		this.currentscore.alpha = 0.7;
		this.currentscore.cache(-2,-2,150,30);
		info.addChild(this.currentscore);

		let notice1 = new Notice(0,0,this.playerList[this.currentPlayer].playerName,"hsl(" + judge.currentPlayer*99 + ", 90%, 50%)",50,120);
		let notice2 = new Notice(0,50,"のターン","hsl(" + judge.currentPlayer*99 + ", 90%, 50%)",50,120);
	
    	createjs.Sound.play("turn");
	}

	permitRevoke(data){
		if(data.player == cns_myPlayerIndex){
			if(this.playerList[data.player].live){
				if(data.permit){
					this.playerList[data.player].mouseChildren = true;
					this.playerList[data.player].hand.mouseChildren = true;
					this.deck.mouseChildren = true;
					this.cemetary.mouseChildren = true;
				}else{
					this.playerList[data.player].mouseChildren = false;
					this.playerList[data.player].hand.mouseChildren = false;
					this.deck.mouseChildren = false;
					this.cemetary.mouseChildren = false;
				}
			}
		}
	}

	resign(data){
		this.playerList[data.player].live = false;

		let xscore = this.score[data.player].clone();
		xscore.color = "dimgray";
		xscore.outline = 1;
		xscore.cache(-2,-2,150,30);
		info.addChild(xscore);

		this.playerList[data.player].hand.mouseChildren = false;
		this.playerList[data.player].place.mouseChildren = false;

		let notice1 = new Notice(0,150,this.playerList[data.player].playerName,"GhostWhite",50,120);
		let notice2 = new Notice(0,200,"は、負け！","GhostWhite",50,120);

		if(data.player == cns_myPlayerIndex){
			this.deck.mouseChildren = false;
			this.cemetary.mouseChildren = false;
			this.diceButton.mouseChildren = false;
			this.pieceButton.mouseChildren = false;
			this.settingFlag.mouseChildren = false;

			createjs.Sound.play("lost");
		}

		let liveCount = 0;
		let winner = 0;
		for(let i = 0; i < this.playerList.length; i++){
			if(this.playerList[i].live){
				winner = i;
				liveCount++;
			}
		}
		if(liveCount == 1){
			if(cns_myPlayerIndex == winner){
				let notice1 = new Notice(0,-100,"CHANPION!!","GhostWhite",60,2000);
				createjs.Sound.play("champion");
			}else{
			}
			this.end = 2;
			background.Activate();
		}
	}

	playerDisconnect(data){
		let xplayerNo = 0;
		for(let i = 0; i < memArray.length; i++){
			if(memArray[i][1] == data.userNo){
				xplayerNo = i;
			}
		}
		this.playerList[xplayerNo].live = false;

		this.xscore[xplayerNo] = this.score[xplayerNo].clone();
		this.xscore[xplayerNo].color = "dimgray";
		this.xscore[xplayerNo].outline = 1;
		this.xscore[xplayerNo].cache(-2,-2,150,30);
		info.addChild(this.xscore[xplayerNo]);

		this.playerList[xplayerNo].hand.mouseChildren = false;
		this.playerList[xplayerNo].place.mouseChildren = false;

		let notice1 = new Notice(0,150,this.playerList[xplayerNo].playerName,"GhostWhite",25,120);
		let notice2 = new Notice(0,200,"が切断","GhostWhite",25,120);

		if(xplayerNo == this.currentPlayer){
			this.changeTurn();
		}

		// 切断によって一人になったら勝ち。。は、切断後３０秒とかの退場確定処理に移動すること

		// let liveCount = 0;
		// let winner = 0;
		// for(let i = 0; i < this.playerList.length; i++){
		// 	if(this.playerList[i].live){
		// 		winner = i;
		// 		liveCount++;
		// 	}
		// }
		// if(liveCount == 1){
		// 	if(cns_myPlayerIndex == winner){
		// 		let notice1 = new Notice(0,-100,"CHANPION!!","GhostWhite",60,2000);
		// 		createjs.Sound.play("champion");
		// 	}else{
		// 	}
		// 	this.end = 2;
		// 	background.Activate();
		// }
	}

	playerReconnect(data){
		let xplayerNo = 0;
		for(let i = 0; i < memArray.length; i++){
			if(memArray[i][1] == data.userNo){
				xplayerNo = i;
			}
		}
		this.playerList[xplayerNo].live = true;

		info.removeChild(this.xscore[xplayerNo]);

		this.playerList[xplayerNo].hand.mouseChildren = true;
		this.playerList[xplayerNo].place.mouseChildren = true;

		let notice1 = new Notice(0,150,this.playerList[xplayerNo].playerName,"GhostWhite",25,120);
		let notice2 = new Notice(0,200,"が再接続","GhostWhite",25,120);

	}

	rollDice(data){
 		info.removeChild(judge.dices);

		this.dices = new createjs.Container;
		info.addChild(this.dices);
		for(let i = 0; i < data.no; i++){
			let dice = new Dice(data.nX,data.nY);
			this.dices.addChild(dice);

			let newx = cns_stageWidth / 2 + (Math.floor(i/2) * 100 - 100) * (Math.random() + 0.5);
			let newy = cns_stageHeight / 2 + (i - Math.floor(i/2)*2) * 100 - 50 * (Math.random() + 0.5);
			dice.rollDice(dice,newx,newy,data.faces[i]);
		}
    	createjs.Sound.play("dice1");
    	createjs.Sound.play("dice2");
	}

	//data - cmd: playerno: id: no: mrg: mrgId: nX: nY:
	playPiece(data){
		let xplayer = judge.playerList[data.playerno];
		let xrotation = cns_rotation - xplayer.playerRotation;
		let xcolor = "hsl(" + 99 + ", 90%, 50%)"; //色も固定

		if(data.cmd == "add"){
			this.otherPlace.addPiece(data.nX, data.nY, data.id, data.no, data.mrg, data.mrgId ,xrotation, xcolor);
		}else{
			if(data.cmd == "move"){
				let xpiece = this.otherPlace.pieceList.find(elm => {return elm.id == data.id;});
				this.otherPlace.srtPlaceCard(xpiece, data.nX, data.nY, data.mrg, data.mrgId, xrotation);
			}
		}
		judge.pieceButton.Activate();
	}

	deletePiece(data){
		let xpiece = this.otherPlace.pieceList.find(elm => {return elm.id == data.id;});

		this.otherPlace.delPiece(xpiece);
	}

	registerButton(arg_button){
		this.currentButton = arg_button;
	}

	forgetButton(){
		this.currentButton = null;
	}

	clearButton(){
		if(this.currentButton != null){
			this.currentButton.deleteButton();
		}
		this.forgetButton();
	}

	kenjyaYumeModeOn(){
		this.kenjyaYumeMode = true;
		//子要素にマウスイベントが伝搬されないようにする。
		for (let i = 0; i < cns_players; i++){
			this.playerList[i].mouseChildren = false;
			this.playerList[i].hand.mouseChildren = false;
			this.playerList[i].place.mouseChildren = false;
		}
		this.deck.mouseChildren = false;
		this.cemetary.mouseChildren = false;
		this.kenjyaYumePlace.mouseChildren = false;

		//自分のはターンだけ、deck,cemetaryの操作可
		if(this.currentPlayer == cns_myPlayerIndex){
			for (let i = 0; i < cns_players; i++){
				this.playerList[i].mouseChildren = true;
				this.playerList[i].hand.mouseChildren = true;
				this.playerList[i].place.mouseChildren = true;
			}
			this.deck.mouseChildren = true;
			this.kenjyaYumePlace.mouseChildren = true;
		}
	}

	kenjyaYumeModeOff(){
		this.kenjyaYumeMode = false;
		//子要素にマウスイベントが伝搬されないようにする。
		for (let i = 0; i < cns_players; i++){
			this.playerList[i].mouseChildren = false;
			this.playerList[i].hand.mouseChildren = false;
			this.playerList[i].place.mouseChildren = false;
		}
		this.deck.mouseChildren = false;
		this.cemetary.mouseChildren = false;
		this.kenjyaYumePlace.mouseChildren = false;

		//place,hand はターンに関係なく　自分のだけ操作可能
		if(this.playerList[cns_myPlayerIndex].live){
			this.playerList[cns_myPlayerIndex].place.mouseChildren = true;
			this.playerList[cns_myPlayerIndex].hand.mouseChildren = true;
		}

		//自分のはターンだけ、deck,cemetaryの操作可
		if(this.currentPlayer == cns_myPlayerIndex){
			this.playerList[this.currentPlayer].mouseChildren = true;
			this.deck.mouseChildren = true;
			this.cemetary.mouseChildren = true;
			this.kenjyaYumePlace.mouseChildren = true;
		}
	}
}

class Dice extends createjs.Container{
	constructor(arg_x,arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.frameWidth = 50;
		this.frameHeight = 50;
		this.data = {
			images: [cns_diceImage],
			frames: {
			 	width: this.frameWidth,
    			height: this.frameHeight,
    			regX: this.frameWidth/2,
    			regY: this.frameHeight/2
			},
			animations: {
				dice1: {
					frames: [1,2,3,4,5,6,10,11,12,1,2,7,8,2,3,4,5,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,0],
					next: false,
					speed: this.frameSpeed
				},
				dice2: {
					frames: [10,11,12,1,2,0,1,2,13,4,5,1,2,3,4,5,6,7,2,3,4,5,8,9,10,11,12,6,7,8,9,10,11,3],
					next: false,
					speed: this.frameSpeed
				},
				dice3: {
					frames: [0,1,2,3,14,5,6,7,8,1,2,10,11,12,1,2,3,4,5,6,2,3,4,5,7,8,9,10,11,12,9,10,11,4],
					next: false,
					speed: this.frameSpeed
				},
				dice4: {
					frames: [4,5,6,7,8,9,10,11,2,3,4,5,12,2,3,4,5,6,0,1,1,2,3,9,8,15,10,11,12,1,2,10,11,7],
					next: false,
					speed: this.frameSpeed
				},
				dice5: {
					frames: [6,7,8,1,2,3,10,11,12,1,2,4,5,6,7,8,9,10,0,1,2,3,4,5,11,12,2,3,4,5,16,10,11,9],
					next: false,
					speed: this.frameSpeed
				},
				dice6: {
					frames: [4,5,10,11,12,1,2,6,7,8,9,10,1,2,3,4,5,6,0,1,2,3,7,8,9,10,11,12,2,3,4,5,17,11],
					next: false,
					speed: this.frameSpeed
				}
			},
			framerate: 30
		};
		this.spriteSheet = new createjs.SpriteSheet(this.data);
		this.sprite = new createjs.Sprite(this.spriteSheet);

		this.addChild(this.sprite);

    	this.on("mousedown", this.handleDown,this);
	}

 	rollDice(arg_dice,arg_nX,arg_nY,arg_no){
		arg_dice.sprite.gotoAndPlay("dice" + arg_no);

  // myTween.onStart = onStart;
  // myTween.onUpdate = onProgress;
  // myTween.onComplete = onComplete;
		createjs.Tween.get(this, {override:true})
		.to({x:arg_nX, y:arg_nY}, cns_duration * 5, createjs.Ease.cubicInOut);
 	}

	handleDown(event){
 		info.removeChild(judge.dices);
	}
}


class Background extends createjs.Container{
	constructor(arg_x,arg_y){
		super();
		this.activate = true;
        // 初期座標
        this.x = arg_x;
        this.y = arg_y;
        this.dx = 0;
        this.dy = 0;
        this.accx = 0;
        this.accy = 0;
        this.hitwall = false;
		this.hitwallNo = 0; // 1:left/right,2:top/bottom
		this.xxdblTap = false;


		// ボード表示
		let boad = new createjs.Bitmap(cns_boadImage);
		boad.alpha = 1;
		boad.regX = cns_layer1Width / 2;
		boad.regY = cns_layer1Height / 2;
		boad.rotation = cns_rotation;
        this.addChild(boad); // 表示リストに追加

        //マウスポインタの座標表示用
		this.XYinfo =  new createjs.Text("", "14px sans-serif", "GhostWhite");
		this.XYinfo.text = "X:" + (stage.mouseX - layer1.x) + "  Y:" + (stage.mouseY - layer1.y);
		this.XYinfo.textAlign = "left";
		this.XYinfo.textBaseline = "top";
		this.XYinfo.x = cns_stageWidth - 200;
		this.XYinfo.y = cns_stageHeight　- 30;
		// this.XYinfo.shadow = new createjs.Shadow("#000000", 3, 3, 5);

		this.XYinfoShadow =  this.XYinfo.clone();
		this.XYinfoShadow.color = "dimgray";
		this.XYinfoShadow.x = this.XYinfoShadow.x + 1;
		this.XYinfoShadow.y = this.XYinfoShadow.y + 1;
		this.XYinfoShadow.cache(-2,-2,200,30);
		this.XYinfo.cache(-2,-2,200,30);

		info.addChild(this.XYinfoShadow);
		info.addChild(this.XYinfo);


        this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressmove", this.handleMove,this);
        this.on("pressup", this.handleUp,this);

        // すまほでは使わない
        this.on("dblclick", this.handledblclick,this);

    }

    handleDown(event){
        this.dx = 0;
        this.dy = 0;
        this.accx = 0;
        this.accy = 0;
        this.dragPointX = stage.mouseX - layer1.x;
        this.dragPointY = stage.mouseY - layer1.y;
    	// this.prePointX = stage.x;
    	// this.prePointY = stage.y;
    // swipeの速度測定用
		this.prex = layer1.x;
		this.prey = layer1.y;
		this.prex2 = layer1.x;
		this.prey2 = layer1.y;
		this.hitwall = false;
    // マルチタッチ判定、ダブルタップ判定
		this.dblTap = false;
		if (cns_sp && event.nativeEvent.targetTouches.length >= 2) {
			this.pinch = true;
	        this.p1 = event.nativeEvent.targetTouches[0];
	        this.p2 = event.nativeEvent.targetTouches[1];
	        this.pinchDist = Math.abs(this.p1.pageX - this.p2.pageX) + Math.abs(this.p1.pageY - this.p2.pageY);
	        this.backupScale = this.scale;
	        this.pinchCenterx = (this.p1.pageX + this.p2.pageX) / 2;
	        this.pinchCentery = (this.p1.pageY + this.p2.pageY) / 2;
	    }else{
			this.pinch = false;
			if(this.xxdblTap){
				this.dblTap = true;
				this.xxdblTap = false;
			}else{
				this.xxdblTap = true;
			};
			setTimeout(function(){background.xxdblTap = false;},500);
	    }
 	}

    handleMove(event){
    // this.activate だとダメなのはなぜ？？？
		if(background.activate){
    // マウス追従　ドラッグ開始地点との補正あり
    		if(!this.pinch){
				layer1.x = (stage.mouseX - this.dragPointX);
	     // layer1の左端が、ステージ（画面）の右端ーマージンを超えたら止める。
	        	if(layer1.x > cns_layer1Width * this.scale / 2 + window.innerWidth  - cns_layer1SideMargin){
	        		layer1.x = cns_layer1Width * this.scale / 2 + window.innerWidth  - cns_layer1SideMargin;
	        	}else{
	     // layer1の右端が、ステージ（画面）の左端＋マージンを超えたら止める。
		        	if(layer1.x < -1 * cns_layer1Width / 2 * this.scale + cns_layer1SideMargin){
		        		layer1.x = -1 * cns_layer1Width / 2 * this.scale + cns_layer1SideMargin;
		        	}else{
						this.prex2 = this.prex;
						this.prex = layer1.x;
		        	}
	        	}

	        	layer1.y = (stage.mouseY - this.dragPointY);
	     // layer1の上端が、ステージ（画面）の下端ーマージンを超えたら止める。
	        	if(layer1.y > cns_layer1Height * this.scale / 2 + window.innerHeight - cns_layer1VertMargin){
	        		layer1.y = cns_layer1Height * this.scale / 2 + window.innerHeight - cns_layer1VertMargin;
	        	}else{
	     // layer1の下端が、ステージ（画面）の上端＋マージンを超えたら止める。
		        	if(layer1.y < -1 * cns_layer1Height / 2 * this.scale + cns_layer1VertMargin){
		        		layer1.y = -1 * cns_layer1Height / 2 * this.scale + cns_layer1VertMargin;
		        	}else{
						this.prey2 = this.prey;
						this.prey = layer1.y;
		        	}
	        	}

			}else{
				// 前回スケールを保管
		        this.preScale = this.scale;

				// backgroundのスケールを変更
		        this.p1 = event.nativeEvent.targetTouches[0];
		        this.p2 = event.nativeEvent.targetTouches[1];
		        this.pinchDist2 = Math.abs(this.p1.pageX - this.p2.pageX) + Math.abs(this.p1.pageY - this.p2.pageY);
		        this.scale = this.pinchDist2 / this.pinchDist * this.backupScale;

		        // 拡大縮小の中心を調整 （scaleを大きくしたらadjustはプラス　ー＞　pinchCenterとlayer1の中心の距離を離す。）
		        this.adjustx = (this.pinchCenterx - layer1.x) - (this.pinchCenterx - layer1.x) * this.preScale / this.scale;
		        this.adjusty = (this.pinchCentery - layer1.y) - (this.pinchCentery - layer1.y) * this.preScale / this.scale;

				layer1.x = layer1.x - this.adjustx;
				layer1.y = layer1.y - this.adjusty;
			}
		}
    }

	handleUp(event) {
		if(background.activate){
			if(!this.pinch){
				this.dx = (this.prex - this.prex2) / 20 * cns_speed;
				this.dy = (this.prey - this.prey2) / 20 * cns_speed;
				if(Math.abs(this.dx) > 5){this.dx = this.dx / Math.abs(this.dx) * 5};
				if(Math.abs(this.dy) > 5){this.dy = this.dy / Math.abs(this.dy) * 5};
				if(this.dx != 0 || this.dy != 0){
					this.accx = this.dx / (Math.abs(this.dx) + Math.abs(this.dy)) * cns_friction;
					this.accy = this.dy / (Math.abs(this.dx) + Math.abs(this.dy)) * cns_friction;
				}else{
					this.accx = 0;
					this.accy = 0;
				}
				// if(this.dx == 0 && this.dy == 0 && this.activate){
				if(this.dx == 0 && this.dy == 0 && this.prey2 == layer1.y && this.prex2 == layer1.x){
					if(judge.end == 0){
						//   自陣への移動ー＞すまほ用
						if(cns_sp && this.dblTap){
							let nX = cns_stageWidth / 2;
							let nY = -1 * cns_boadHeight * this.scale / 2 + cns_stageHeight;
							let duration = 1000;
							createjs.Tween.get(layer1, {override:true})
							.to({x:nX, y:nY}, duration, createjs.Ease.cubicOut);
						}
					}else{
						judge.end = 2;
						clearStage();
						createjs.Sound.stop("champion");
					}
				}
			}
		}else{
			// 背景選択の活性化
			background.Activate();
		}
    }

  //   自陣への移動ー＞すまほでは使わない
    handledblclick(event){
		if(background.activate){
			let nX = cns_layer1InitX;
			let nY = cns_layer1InitY; 
			let duration = 500;
			createjs.Tween.get(layer1, {override:true})
			.to({x:nX, y:nY}, duration, createjs.Ease.cubicOut);
		}else{
			// 背景選択の活性化
			background.Activate();
		}
    }

	notActivate(){
		this.activate = false;
	}

	Activate(){
		this.activate = true;
	}

	update(){
		layer1.x += this.dx;
		layer1.y += this.dy;
		this.dx -= this.accx;
		this.dy -= this.accy;
		if((layer1.x > cns_layer1Width * this.scale / 2 + window.innerWidth  - cns_layer1SideMargin ||
			layer1.x < -1 * cns_layer1Width / 2 * this.scale + cns_layer1SideMargin) && 
			( !this.hitwall || this.hitwallNo != 1) ){
			this.dx = this.dx * -1 / 2;
			this.dy = this.dy / 2;
			this.accx = this.accx * -1 * 5;
			this.accy = this.accy * 5;
			this.hitwallNo = 1;
			this.hitwall = true;
		}
		if((layer1.y > cns_layer1Height * this.scale / 2 + window.innerHeight - cns_layer1VertMargin  || 
			layer1.y < -1 * cns_layer1Height / 2 * this.scale + cns_layer1VertMargin) && 
			(!this.hitwall || this.hitwallNo != 2) ){
			this.dy = this.dy * -1 / 2;
			this.dx = this.dx / 2;
			this.accy = this.accy * -1 * 5;
			this.accx = this.accx * 5;
			this.hitwallNo = 2;
			this.hitwall = true;
		}
		if(Math.abs(this.dx) < Math.abs(this.accx) || Math.abs(this.dy) < Math.abs(this.accy)){
			this.dx = 0;
			this.dy = 0;
			this.accx = 0;
			this.accy = 0;
		}
		this.pieceaction();
	}

	pieceaction(){
		this.XYinfo.uncache();
		this.XYinfoShadow.uncache();
		let mouse_x = Math.floor((stage.mouseX - layer1.x) * 100) / 100;
		let mouse_y = Math.floor((stage.mouseY - layer1.y) * 100) / 100;
		this.XYinfo.text = "X:" + mouse_x + "  Y:" + mouse_y;
		this.XYinfoShadow.text = "X:" + mouse_x + "  Y:" + mouse_y;
		this.XYinfo.cache(-2,-2,200,30);
		this.XYinfoShadow.cache(-2,-2,200,30);
	}
}

class Notice extends createjs.Container{
	constructor(arg_x, arg_y, arg_text, arg_color, arg_size, arg_time){
		super();
		this.x = cns_stageWidth / 2 + arg_x;
		this.y = cns_stageHeight / 2 + arg_y;
		this.display = true;
		this.displayCount = 0;
		this.time = arg_time;
		this.size = arg_size;
		
	    this.noticeText =  new createjs.Text(arg_text, this.size + "px sans-serif", arg_color);
		this.noticeText.textAlign = "center";
		this.noticeText.textBaseline = "middle";
		this.noticeText.x = 0;
		this.noticeText.y = 0;
		// this.noticeText.shadow = new createjs.Shadow("dimgray", 3, 3, 5);
		this.noticeText.alpha = 0;

		this.noticeTextShadow = this.noticeText.clone();
		this.noticeTextShadow.color = "dimgray";
		this.noticeTextShadow.x = 3;
		this.noticeTextShadow.y = 3;

		this.noticeText.cache(-1 * cns_stageWidth / 2,-1 * this.size / 2,cns_stageWidth,this.size)
		this.noticeTextShadow.cache(-1 * cns_stageWidth / 2,-1 * this.size / 2,cns_stageWidth,this.size)

		this.addChild(this.noticeTextShadow);
		this.addChild(this.noticeText);

		info.addChild(this);

        this.on('tick',this.update,this);
	}

	update(){
		this.noticeText.uncache();
		this.noticeTextShadow.uncache();
		if (this.display){
			if(this.noticeText.alpha < 0.8){
				this.noticeText.alpha = this.noticeText.alpha + 0.1;
				this.noticeTextShadow.alpha = this.noticeTextShadow.alpha + 0.1;
			}else{
				this.display = false;
			}
		}else{
			if(this.displayCount > this.time){
				if(this.noticeText.alpha > 0){
					this.noticeText.alpha = this.noticeText.alpha - 0.1;
					this.noticeTextShadow.alpha = this.noticeTextShadow.alpha - 0.1;
				}else{
					this.off;
					info.removeChild(this);
				}
			}else{
				this.displayCount++;
			}
		}
		this.noticeText.cache(-1 * cns_stageWidth / 2,-1 * this.size / 2,cns_stageWidth,this.size)
		this.noticeTextShadow.cache(-1 * cns_stageWidth / 2,-1 * this.size / 2,cns_stageWidth,this.size)
	}
}
