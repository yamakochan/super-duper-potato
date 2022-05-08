class Player extends createjs.Container{
	constructor(arg_playerno,arg_playername,arg_hue){
		super();
		//playerパラメータ
		this.playerNo = arg_playerno;
		this.playerName = arg_playername;
		this.hue = arg_hue;
		this.live = true;
		this.currentCard = 0;
		//スコア
		this.score = 0;

		this.pieceList = [];

		// place表示
		this.place = new Place(this);
		this.addChild(this.place);
		background.addChild(this.place);

		// hand表示
		this.hand = new Hand(this);
		this.addChild(this.hand);
		background.addChild(this.hand);

// 拡大縮小のため、cardのコンテナはbackgroundのchildにする。
// card,pieceのイベント処理では、backgraundへのイベント波及を止めるため、stopPropagation()をコール。

		//player毎の表示位置計算用角度
		this.playerRotation = 0;
		if(cns_players == 2 && this.playerNo == 1){
			this.playerRotation = 180;
		}
		if((cns_players == 3 || cns_players == 4) && this.playerNo == 1){
			this.playerRotation = 90;
		}
		if((cns_players == 3 || cns_players == 4) && this.playerNo == 2){
			this.playerRotation = 180;
		}
		if(cns_players == 4 && this.playerNo == 3){
			this.playerRotation = -90;
		}
	}
}

class Hand extends createjs.Container{
	constructor(arg_player){
		super();
		//手札
		this.handCard = [];
		this.player = arg_player;
	}

    addHandCard(arg_card, arg_nX, arg_myself){
    	if(arg_card.status == 0){
    		createjs.Sound.play("draw");
    	}else{
    		createjs.Sound.play("srthand");
    	}
    	arg_card.status = 1;
    	this.addChild(arg_card);

		let i = this.handCard.length
	    while(i != 0 && this.handCard[i - 1].x > arg_nX){
	   		this.handCard[i] = this.handCard[i - 1];
	   		i--;
	    }
	 	this.handCard[i] = arg_card;

    	this.alignHandCard();

    	if(arg_myself){
    		arg_card.faceUp();
    	}else{
    		// arg_card.hide();  
    		// arg_card.faceUp();
    		//デバッグ用
    		arg_card.faceDown();
    	}
	}

    delHandCard(arg_card){
    	this.removeChild(arg_card);

    	this.handCard = this.handCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});

    	this.alignHandCard();
	}

    srtHandCard(arg_card, arg_nX){	
    	createjs.Sound.play("srthand");
    	this.handCard = this.handCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});

		let i = this.handCard.length
	    while(i != 0 && this.handCard[i - 1].x > arg_nX){
	   		this.handCard[i] = this.handCard[i - 1];
	   		i--;
	    }
	 	this.handCard[i] = arg_card;

	 	this.alignHandCard();

    	this.removeChild(arg_card);
    	this.addChild(arg_card);
	}

	alignHandCard(){
	 	let xhandLeft = cns_handLeft;
	 	let xcardWidth = cns_cardWidth + cns_handMargin;
		if(this.handCard.length < Math.floor(cns_handWidth / cns_cardWidth)){
		 	xhandLeft = -1 * (this.handCard.length * cns_cardWidth + (this.handCard.length - 1) * cns_handMargin) / 2 + cns_cardWidth / 2;
		}else{
		 	xcardWidth = cns_handWidth / this.handCard.length;
		}

	 	for(let i = 0;i < this.handCard.length;i++){
	 		this.handCard[i].moveCard(xhandLeft + xcardWidth * i, cns_handTop);
		}	
	}
}

class Place extends createjs.Container{
	constructor(arg_player){
		super();
		//場札
		this.placeCard = [];
		this.player = arg_player;
	}

    addPlaceCard(arg_card,arg_nX,arg_nY){
    	createjs.Sound.play("place");
    	this.addChild(arg_card);
    	arg_card.status = 2;
    	arg_card.faceUp();
	 	this.placeCard[this.placeCard.length] = arg_card;

	 	arg_card.moveCard(arg_nX, arg_nY);
	}

    delPlaceCard(arg_card){	
    	this.placeCard = this.placeCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});

    	this.removeChild(arg_card);
	}

    srtPlaceCard(arg_card,arg_nX,arg_nY){
    	createjs.Sound.play("place");
	 	arg_card.moveCard(arg_nX, arg_nY);

    	this.removeChild(arg_card);
    	this.addChild(arg_card);
	}
}

class Deck extends createjs.Container{
	constructor(){
		super();
		this.deckCard = [];
	}

    addDeckCard(arg_card){
		let xcard = arg_card;
		xcard.status = 0;
		xcard.faceDown();

	 	this.deckCard[this.deckCard.length] = xcard;
	 	this.addChild(xcard);

    	createjs.Sound.play("place");
	 	// xcard.moveCard(arg_nX, arg_nY);
	 	xcard.moveCard(cns_deckLeft + 0.1 * this.deckCard.length, cns_deckTop + 0.1 * this.deckCard.length);
	}

	delDeckCard(arg_card){
    	this.deckCard = this.deckCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});
	}
}

class Cemetary extends createjs.Container{
	constructor(){
		super();
		this.cemetaryCard = [];
		this.spread = false;
	}

    addCemetaryCard(arg_card){
		let xcard = arg_card;
		xcard.status = 9;
		xcard.faceGray();

	 	this.cemetaryCard[this.cemetaryCard.length] = xcard;
	 	this.addChild(xcard);

    	createjs.Sound.play("draw");
	 	xcard.moveCard(cns_cemetaryLeft + 0.1 * this.cemetaryCard.length, cns_cemetaryTop + 0.1 * this.cemetaryCard.length);
	}

	delCemetaryCard(arg_card){	
    	this.cemetaryCard = this.cemetaryCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});
	}

	closeCemetaryCard(){
    	createjs.Sound.play("draw");
	 	for(let i = 0; i < this.cemetaryCard.length; i++){
	 		this.cemetaryCard[i].rotation = cns_rotation;
	 		this.cemetaryCard[i].moveCard(cns_cemetaryLeft, cns_cemetaryTop); 		
		 	this.spread = false;
	 	}
	}
	spreadCemetaryCard(arg_rotation){
    	createjs.Sound.play("draw");
	 	let xcards   = new Array(4);
	 	let xlines   = Math.ceil(this.cemetaryCard.length / Math.floor(cns_handWidth / cns_cardWidth));
	 	let xtempCards = Math.floor(cns_handWidth / cns_cardWidth)
	 	if(xlines > 4){
	 		xlines = 4;
	 		xtempCards = Math.floor(this.cemetaryCard.length / 4);
		 	for(let i = 0; i < 4; i++){
	 			xcards[i] = xtempCards + Math.floor((this.cemetaryCard.length - xtempCards * xlines + 3 - i) / 4);
	 		}
	 	}else{
		 	for(let i = 0; i < 4; i++){
		 		if(this.cemetaryCard.length - xtempCards * (i + 1) < 0){
		 			xcards[i] = this.cemetaryCard.length - xtempCards * i;
		 			if(xcards[i] < 0){
		 				xcards[i] = 0;
		 			}
		 		}else{
		 			xcards[i] = xtempCards;
		 		}
		 	}
	 	}

	 	let xcardcnt = 0;
	 	let xspreadTop = cns_cemetaryTop - cns_cardHeight;
	 	for(let i = 0; i < xlines; i++){
		 	let xspreadLeft = cns_handLeft;
		 	let xcardWidth  = cns_cardWidth + cns_handMargin;
			if(xcards[i] < Math.floor(cns_handWidth / cns_cardWidth)){
			 	xspreadLeft = -1 * (xcards[i] * cns_cardWidth + (xcards[i] - 1) * cns_handMargin) / 2 + cns_cardWidth / 2;
			}else{
			 	xcardWidth = cns_handWidth / xcards[i];
			}

		 	for(let j = 0; j < xcards[i]; j++){
		 		this.cemetaryCard[xcardcnt].rotation = this.cemetaryCard[xcardcnt].rotation - arg_rotation;
		 		this.cemetaryCard[xcardcnt].moveCard(xspreadLeft + xcardWidth * j, xspreadTop + cns_cardHeight * 2 / 3 * i);
		 		xcardcnt++;
			}	
	 	}
	 	this.spread = true;
	}
}

class KenjyaYumePlace extends createjs.Container{
	constructor(){
		super();
		this.x = 0;
		this.y = 0;
		this.cardsTop = 280;
		this.kenjyaYumeCard = [];
		this.cardData = [];
		if(judge.currentPlayer == cns_myPlayerIndex){
			this.visibleCard = true;
		}else{
			this.visibleCard = false;
		}

		let initX = 0;
		let initY = 280;
		let xrotation = cns_rotation - judge.playerList[judge.currentPlayer].playerRotation;
		let xrad = xrotation * Math.PI / 180;
		let newX = initX * Math.cos(xrad) - initY * Math.sin(xrad);
		let newY = initX * Math.sin(xrad) + initY * Math.cos(xrad);

		this.boxShape = new createjs.Shape();
        this.boxShape.graphics.beginFill("slategray");
		this.boxShape.graphics.drawRoundRect(0, 0, 650, 200, 5, 5);
		this.boxShape.alpha = 0.55;
		this.boxShape.cache(-2,-2,654, 204);
		this.boxShape.regX = 300;
		this.boxShape.regY = 100;
		this.boxShape.x = newX;
		this.boxShape.y = newY;
		this.addChild(this.boxShape); 

		this.wakuShape = new createjs.Shape();
        this.wakuShape.graphics.beginStroke("hsl(20, 30%, 30%)");
        this.wakuShape.graphics.setStrokeStyle(1);
		this.wakuShape.graphics.drawRoundRect(0, 0, 650, 200, 5, 5);
		this.wakuShape.alpha = 1.0;
		this.wakuShape.cache(-2,-2,654, 204);
		this.wakuShape.regX = 300;
		this.wakuShape.regY = 100;
		this.wakuShape.x = newX;
		this.wakuShape.y = newY;
		this.addChild(this.wakuShape); 

		this.wakuShape.rotation = (cns_rotation - judge.playerList[judge.currentPlayer].playerRotation);
	}

    addCard(arg_card, data){
    	createjs.Sound.play("draw");
    	arg_card.status = 5;
    	this.addChild(arg_card);

	 	this.kenjyaYumeCard[this.kenjyaYumeCard.length] = arg_card;
	 	this.cardData[this.cardData.length] = data;

		arg_card.rotation = (cns_rotation - judge.playerList[judge.currentPlayer].playerRotation);

    	this.alignCard();

    	if(this.visibleCard){
    		arg_card.faceUp();
    	}else{
    		arg_card.faceDown();
    	}
	}

    delCard(arg_card){
    	this.removeChild(arg_card);

    	this.kenjyaYumeCard = this.kenjyaYumeCard.filter(elm => {
    		return elm.no != arg_card.no;
    	});
    	this.cardData = this.cardData.filter(elm => {
    		return elm.no != arg_card.no;
    	});

    	this.alignCard();
	}

    returnCard(){
	 	for(let i = this.kenjyaYumeCard.length - 1;i > 0; i--){
	 		let tempCard = this.kenjyaYumeCard[i];
			let xplayer = judge.playerList[this.cardData[i].player];
	    	this.removeChild(tempCard);
	    	switch(this.cardData[i].status){
				case 0:		//deckカード
					tempCard.rotation = cns_rotation;
					judge.deck.addDeckCard(tempCard);
					break;
				case 1:		//handカード
					tempCard.rotation = (cns_rotation - xplayer.playerRotation);
				    xplayer.hand.addHandCard(tempCard, this.cardData[i].nX, xplayer.playerNo == cns_myPlayerIndex);　　
					break;
				default:
					console.log('error');
			}
		}
		this.kenjyaYumeCard = [];
		this.cardData = [];	
	}

   	alignCard(){
	 	let xhandLeft = cns_handLeft;
	 	let xcardWidth = cns_cardWidth + cns_handMargin;
		if(this.kenjyaYumeCard.length < Math.floor(cns_handWidth / cns_cardWidth)){
		 	xhandLeft = -1 * (this.kenjyaYumeCard.length * cns_cardWidth + (this.kenjyaYumeCard.length - 1) * cns_handMargin) / 2 + cns_cardWidth / 2;
		}else{
		 	xcardWidth = cns_handWidth / this.kenjyaYumeCard.length;
		}

	 	for(let i = 0;i < this.kenjyaYumeCard.length;i++){
	 		this.kenjyaYumeCard[i].moveCard(xhandLeft + xcardWidth * i, this.cardsTop);
		}	
	}
}

class Card extends createjs.Container{
	constructor(arg_cardImage,arg_no,arg_desc){
		super();
		this.no = arg_no;
		this.x = 0;
		this.y = 0;
		this.headortail = 0;    // 0:表、1:裏
		this.moving = 0;  		// 0:静止中、1:操作中
		this.status = 0;  		// 0:deck、1:hand、2:place、9:cemetary、5:kenjyayume
		this.desc = arg_desc;	// 説明書き

		this.tail = new createjs.Bitmap(cns_tailImage);
		// this.tail.shadow = new createjs.Shadow("#000000", 1, 1, 1);
		this.tail.regX = cns_cardWidth / 2;
		this.tail.regY = cns_cardHeight / 2;
        this.addChild(this.tail); // 表示リストに追加

        this.head = new createjs.Container();
        let xheadBitmap = new createjs.Bitmap(arg_cardImage);
		let xheadShadow = new createjs.Shape();
        xheadShadow.graphics.beginFill("black");
		xheadShadow.graphics.drawRoundRect(this.x-1, this.y-1, cns_cardWidth+2, cns_cardHeight+2, 0, 0);
		xheadShadow.cache(0,0,cns_cardWidth+2,cns_cardHeight+2);
		this.head.addChild(new createjs.Bitmap(xheadShadow.cacheCanvas));
		this.head.addChild(xheadBitmap);
		this.head.regX = cns_cardWidth / 2;
		this.head.regY = cns_cardHeight / 2;
        this.addChild(this.head); // 表示リストに追加

		let xgray = new createjs.Shape();
        xgray.graphics.beginFill("darkgray");
		xgray.graphics.drawRoundRect(this.x, this.y, cns_cardWidth, cns_cardHeight, 0, 0);
		xgray.cache(0,0,cns_cardWidth+1,cns_cardHeight+1);
		this.gray = new createjs.Bitmap(xgray.cacheCanvas);
// キャッシュした画像は、別CANVASに書かれて固定される。オブジェクトのプロパティを変更しても別CANVASの画像は変わらない。
// 変更するには該当オブジェクトのupdateCacheメソッドを呼ぶ必要がある。

// キャッシュで済まさず、パーティクルをビットマップでつくらないと、WebGLの速さが活かせない。
// DisplayObject.cacheCanvasプロパティで、キャッシュしたイメージをもったHTMLCanvasElementが得られるので、
// Bitmap()コンストラクタに渡せばビットマップのオブジェクトがつくれる。

		this.gray.alpha = 0.5;
		this.gray.regX = cns_cardWidth / 2;
		this.gray.regY = cns_cardHeight / 2;
        this.addChild(this.gray); // 表示リストに追加

        this.faceUp();

        // this.on('tick',this.update,this);
    	this.mousedownListener = this.on("mousedown", this.handleDown,this);
        this.pressmoveListener = this.on("pressmove", this.handleMove,this);
        this.pressupListener = this.on("pressup", this.handleUp,this);
	}

	handleDown(event){
		event.stopPropagation();
		judge.clearButton();
    // 背景選択の非活性化
		background.notActivate();

 		this.backupPointX = this.x;
 		this.backupPointY = this.y;
        this.dragPointX = stage.mouseX / cns_scale - this.x;
        this.dragPointY = stage.mouseY / cns_scale - this.y;
	    // 半透明にする
        this.alpha = 0.5;
	    // 賢者の夢の呪文中は、動かさない。
	    if(judge.kenjyaYumeMode == false){
			this.moving  =  1;			// ドラッグ中ステータス
	    }
 	}

    handleMove(event){
    // 親オブジェクトへのイベントの伝播を止める。
		event.stopPropagation();
    // マウス追従　ドラッグ開始地点との補正あり
    	if(this.moving == 1){
        	this.x = stage.mouseX / cns_scale - this.dragPointX;
        	this.y = stage.mouseY / cns_scale - this.dragPointY;
        }
        if(this.y < cns_layer1Height - cns_cardHeight * 2){
        	this.alpha = 1;
        }else{
        	this.alpha = 0.5;
        }
    }

 	handleUp(event){
		event.stopPropagation();
 		this.alpha = 1;

		if(this.moving == 1 &&	this.backupPointX == this.x && this.backupPointY == this.y){
			switch(this.status){
				case 0:
					judge.registerButton( this.drawButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"draw","hsl(200, 70%, 50%)") );
					break;
				case 1:
					judge.registerButton(new HandCardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"desc","hsl(90, 40%, 50%)","trash2","hsl(250, 40%, 50%)","reverse","hsl(280, 40%, 50%)"));
					break;
				case 2:
					judge.registerButton(new PlaceCardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"trash","hsl(250, 40%, 50%)","desc","hsl(90, 40%, 50%)"));
					break;
				case 9:
					if(judge.cemetary.spread){
						judge.registerButton( this.cemetaryButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"close","hsl(150, 40%, 50%)") );
					}else{
						judge.registerButton( this.cemetaryButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"spread","hsl(30, 40%, 50%)") );
					}
					break;
				default:
					console.log('error');					
			}
		}
	    // カードを動かしたとき、または賢者の夢の呪文中のsocket.emit
		if(judge.kenjyaYumeMode == true || this.moving == 1 && (this.backupPointX != this.x || this.backupPointY != this.y)){
			let locationNo = 0;  //カード配置　0:hand , 1:place , xxx2:cemetary
	        if(this.y < cns_handTop - cns_cardHeight / 4){	//place側に配置
	        	locationNo = 1;
	        }else{
	        	locationNo = 0;
	        }
	        let xplayerNo = judge.currentPlayer;
	        if(this.status == 1 || this.status == 2){
	        	xplayerNo = this.parent.player.playerNo;
	        }else{
	        	xplayerNo = cns_myPlayerIndex;
	        }

	        //カード処理中のカード選択禁止。
       		this.nonreactiveCard();
			this.reactiveCard();

 			socket.emit("serverPlayCard", {
 				player: xplayerNo,
		 		no: this.no,
		 		status: this.status,
		 		nX: this.x,
		 		nY: this.y,
		 		location: locationNo
			});
 		}

 		this.moving = 0;
		background.Activate();
 	}

 	moveCard(arg_nX, arg_nY){
		let xrad = this.rotation * Math.PI / 180;
		let newX = arg_nX * Math.cos(xrad) - arg_nY * Math.sin(xrad);
		let newY = arg_nX * Math.sin(xrad) + arg_nY * Math.cos(xrad);

		createjs.Tween.get(this, {override:true})
		.to({x:newX, y:newY}, cns_duration, createjs.Ease.cubicOut);
 	}

 	faceUp(){
		this.head.visible = true;
		this.tail.visible = false;
		this.gray.visible = false;
 	}

 	faceDown(){
		this.head.visible = false;
		this.tail.visible = true;
		// this.gray.uncache();
		this.gray.visible = false;
		// this.gray.cache(0,0,cns_cardWidth+1,cns_cardHeight+1);
 	}

 	faceGray(){
		this.head.visible = true;
		this.tail.visible = false;
		this.gray.visible = true;
 	}

 	hide(){
		this.head.visible = false;
		this.tail.visible = false;
		this.gray.visible = false;
 	}

 	cloneCard(arg_card){
 		let xcard = new Card(arg_card.children[0].image.currentSrc,arg_card.no);
		xcard.x = arg_card.x;
		xcard.y = arg_card.y;
		xcard.headortail = arg_card.headortail;    // 0:表、1:裏
		xcard.moving = arg_card.moving;  		// 0:静止中、1:操作中
		xcard.status = arg_card.status;  		// 0:deck、1:hand、2:place、9:cemetary

		return xcard;
 	}

 	showDescription(){
 		judge.registerButton(new CardDescription(this));
 	}

 	nonreactiveCard(){
 		this.off("mousedown",this.mousedownListener);
		this.off("pressmove",this.pressmoveListener);
		this.off("pressup",this.pressupListener);
	}

 	reactiveCard(){
		setTimeout(()=>{
		   	this.mousedownListener = this.on("mousedown", this.handleDown,this);
	        this.pressmoveListener = this.on("pressmove", this.handleMove,this);
	        this.pressupListener = this.on("pressup", this.handleUp,this);
		}, 300);
	}
}

class OtherPlace extends createjs.Container{
	constructor(){
		super();
		this.pieceList = [];
	}

    addPiece(arg_nX, arg_nY, arg_id, arg_no, arg_mrg, arg_mrgId ,arg_rotation, arg_color){
		let xpiece = new Piece(cns_layer1Left, cns_layer1Top, arg_id, arg_no, arg_rotation, arg_color);
		this.addChild(xpiece);

	   	createjs.Sound.play("piece");
	 	xpiece.movePiece(arg_nX, arg_nY);

	 	//同じ位置にpieceがあったら統合
	 	if(arg_mrg){
			let ypiece = this.pieceList.find(elm => {return elm.id == arg_mrgId;});
			if(ypiece != null){
				xpiece.addNo(ypiece.no);
				this.delPiece(ypiece);
			}
	 	}
	 	if(xpiece.no == 0){
	 		xpiece.off();
			setTimeout(()=>{
		 		createjs.Tween.get(xpiece, {override:true})
				.to({alpha:0}, cns_duration + 300, createjs.Ease.cubicOut);
				setTimeout(()=>{
			   		this.delPiece(xpiece);
				}, 200);
			}, 500);
	 	}

		this.pieceList[this.pieceList.length] = xpiece;
	}

    delPiece(arg_piece){
    	this.pieceList = this.pieceList.filter(elm => {
    		return elm.id != arg_piece.id;
    	});

    	createjs.Sound.play("button");
    	this.removeChild(arg_piece);
	}

    srtPlaceCard(arg_piece, arg_nX, arg_nY, arg_mrg, arg_mrgId ,arg_rotation){
    	createjs.Sound.play("srthand");

    	arg_piece.rotation = arg_rotation;
	 	arg_piece.movePiece(arg_nX, arg_nY);

	 	if(arg_mrg){
			let ypiece = this.pieceList.find(elm => {return elm.id == arg_mrgId;});
			if(ypiece != null){
				arg_piece.addNo(ypiece.no);
				this.delPiece(ypiece);
			}
	 	}

    	this.removeChild(arg_piece);
    	this.addChild(arg_piece);
	}
}

class Piece extends createjs.Container{
	constructor(arg_x, arg_y, arg_id, arg_no, arg_rotation, arg_color){
		super();
		this.id = arg_id;
		this.rotation = arg_rotation;
		this.no = arg_no;
		this.x = arg_x;
		this.y = arg_y;
		this.moving = 0;  		// 0:静止中、1:操作中

		this.shape = new createjs.Shape();
		this.shape.graphics.beginFill("mediumpurple");
		this.shape.graphics.drawRoundRect(0, 0, 30, 30, 0, 0);
		// this.shape.shadow = new createjs.Shadow(arg_color, 1, 1, 3);
		this.shape.alpha = 1;
		this.shape.regX = 15;
		this.shape.regY = 15;

		this.shapeShadow = new createjs.Shape();
		this.shapeShadow.graphics.beginFill(arg_color);
		this.shapeShadow.graphics.drawRoundRect(0, 0, 30, 30, 0, 0);
		this.shapeShadow.x = this.shapeShadow.x + 1;
		this.shapeShadow.y = this.shapeShadow.y + 2;
		this.shapeShadow.regX = 15;
		this.shapeShadow.regY = 15;

		this.shape.cache(0,0,30,30);
		this.shapeShadow.cache(0,0,32,32);
        this.addChild(this.shapeShadow); // 表示リストに追加
        this.addChild(this.shape); // 表示リストに追加

		if(this.no > 0){
		    this.text =  new createjs.Text(arg_no, "14px sans-serif", "GhostWhite");
		}else{
		    this.text =  new createjs.Text(arg_no, "14px sans-serif", "red");
		}
		this.text.textAlign = "center";
		this.text.textBaseline = "middle";
		this.text.x = 15;
		this.text.y = 15;
		this.text.regX = 15;
		this.text.regY = 15;

		this.textShadow = this.text.clone();
		this.textShadow.color = "dimgray";
		this.textShadow.x = this.text.x - 1;
		this.textShadow.y = this.text.y - 1;
		this.text.regX = 15;
		this.text.regY = 15;

		this.text.cache(-15,-15,30,30);
		this.textShadow.cache(-15,-15,30,30);

		this.addChild(this.textShadow);
		this.addChild(this.text);

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressmove", this.handleMove,this);
        this.on("pressup", this.handleUp,this);
	}

	handleDown(event){
		event.stopPropagation();
		judge.clearButton();
	    // 背景選択の非活性化
		background.notActivate();

 		this.backupPointX = this.x;
 		this.backupPointY = this.y;
        this.dragPointX = stage.mouseX / cns_scale - this.x;
        this.dragPointY = stage.mouseY / cns_scale - this.y;
	    // 半透明にする
        this.alpha = 0.5;
	    // ドラッグ中ステータス　（透明化）
		this.moving  =  1;
 	}

    handleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		event.stopPropagation();
    	if(this.moving == 1){
        	this.x = stage.mouseX / cns_scale - this.dragPointX;
        	this.y = stage.mouseY / cns_scale - this.dragPointY;
        }
       	this.alpha = 1;
    }

 	handleUp(event){
		event.stopPropagation();
 		this.alpha = 1;

		if(this.moving == 1){
			if(this.backupPointX == this.x && this.backupPointY == this.y){
				judge.clearButton();
				this.delPieceButton = new DelPieceButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y);
				judge.registerButton(this.delPieceButton);
			}else{
				let xPieceList = judge.otherPlace.pieceList.filter(elm => {return elm.id != this.id;});
				let ypiece = xPieceList.find(elm => {return Math.sqrt((this.x - elm.x)**2 + (this.y - elm.y)**2) < 15;});
				let mrg = false;
				let mrgId = 0;
				if(ypiece != null){
					mrg = true;
					mrgId = ypiece.id;
				}

	 			socket.emit("serverPlayPiece", {
	 				cmd: "move",
			 		playerno: cns_myPlayerIndex,
			 		id: this.id,
			 		no: this.no,
		 			mrg: mrg,
		 			mrgId : mrgId,
			 		nX: this.x,
			 		nY: this.y
			 	});
			}
 		}

 		this.moving = 0;
		background.Activate();
 	}

 	movePiece(arg_nX, arg_nY){
		let xrad = this.rotation * Math.PI / 180;
		let newX = arg_nX * Math.cos(xrad) - arg_nY * Math.sin(xrad);
		let newY = arg_nX * Math.sin(xrad) + arg_nY * Math.cos(xrad);

		createjs.Tween.get(this, {override:true})
		.to({x:newX, y:newY}, cns_duration, createjs.Ease.cubicOut);
 	}

 	addNo(arg_no){
		this.no = this.no + arg_no;

		this.text.uncache();
		this.text.text = this.no;
		this.textShadow.text = this.no;
		this.text.cache(-15,-15,30,30);
		this.textShadow.cache(-15,-15,30,30);

		this.text.uncache();
		if(this.no > 0){
		    this.text.color =  "GhostWhite";
		}else{
		    this.text.color =  "red";
		}
		this.text.cache(-15,-15,30,30);
 	}

}