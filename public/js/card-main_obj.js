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
		layer1.addChild(this.place);

		// hand表示
		this.hand = new Hand(this);
		this.addChild(this.hand);
		layer1.addChild(this.hand);

		//piece用のコンテナ
		this.otherPlace = new OtherPlace(this);
		this.addChild(this.otherPlace);
		layer2.addChild(this.otherPlace);
		

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
    	createjs.Sound.play("draw");
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

    addDeckCard(arg_card, arg_nX, arg_nY){
		let xcard = arg_card;
		xcard.status = 0;
		xcard.faceDown();

	 	this.deckCard[this.deckCard.length] = xcard;
	 	this.addChild(xcard);

    	createjs.Sound.play("place");
	 	xcard.moveCard(arg_nX, arg_nY);
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

class Card extends createjs.Container{
	constructor(arg_cardImage,arg_no){
		super();
		this.no = arg_no;
		this.x = 0;
		this.y = 0;
		this.headortail = 0;    // 0:表、1:裏
		this.moving = 0;  		// 0:静止中、1:操作中
		this.status = 0;  		// 0:deck、1:hand、2:place、9:cemetary

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
		judge.clearButton();
    // 背景選択の非活性化
		background.notActivate();

		if(this.status == 1 || this.status == 2 || this.status == 9){
	 		this.backupPointX = this.x;
	 		this.backupPointY = this.y;
	        this.dragPointX = stage.mouseX * cns_scale - this.x;
	        this.dragPointY = stage.mouseY * cns_scale - this.y;
	    // 半透明にする
	        this.alpha = 0.5;
	    // ドラッグ中ステータス　（透明化）
			this.moving  =  1;
		}
		if(this.status == 0){
			//draw button　表示。。　
			this.drawButton = new CardButton(this, stage.mouseX * cns_scale - layer1.x, stage.mouseY * cns_scale - layer1.y,"draw","hsl(200, 70%, 50%)");
			judge.registerButton(this.drawButton);
		}
 	}

    handleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(this.status == 1 || this.status == 2 || this.status == 9){
	    	if(this.moving == 1){
	        	this.x = stage.mouseX * cns_scale - this.dragPointX;
	        	this.y = stage.mouseY * cns_scale - this.dragPointY;
	        }
	        if(this.y < cns_layer1Height - cns_cardHeight * 2){
	        	this.alpha = 1;
	        }else{
	        	this.alpha = 0.5;
	        }
        }
    }

 	handleUp(event){
 		this.alpha = 1;

		if((this.status == 1 || this.status == 2 || this.status == 9) && this.moving == 1){
			if(this.backupPointX == this.x && this.backupPointY == this.y && this.status != 1){
				if(this.status == 2){
					this.cemetaryButton = new CardButton(this, stage.mouseX * cns_scale - layer1.x, stage.mouseY * cns_scale - layer1.y,"trash","hsl(250, 40%, 50%)");
					judge.registerButton(this.cemetaryButton);
				}else{
					if(this.status == 9){
						if(judge.cemetary.spread){
							this.cemetaryButton = new CardButton(this, stage.mouseX * cns_scale - layer1.x, stage.mouseY * cns_scale - layer1.y,"close","hsl(150, 40%, 50%)");
						}else{
							this.cemetaryButton = new CardButton(this, stage.mouseX * cns_scale - layer1.x, stage.mouseY * cns_scale - layer1.y,"spread","hsl(30, 40%, 50%)");
						}
						judge.registerButton(this.cemetaryButton);
					}
				}
			}else{
				let locationNo = 0;  //カード配置　0:hand , 1:place , 2:cemetary
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
	 			socket.emit("serverPlayCard", {
	 				player: xplayerNo,
			 		no: this.no,
			 		status: this.status,
			 		nX: this.x,
			 		nY: this.y,
			 		location: locationNo
				});
			}
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
		}, 1000);
	}
}

class OtherPlace extends createjs.Container{
	constructor(arg_player){
		super();
		this.player = arg_player;
		this.pieceList = [];
		this.idCounter = 0;
	}

    addPiece(arg_nX, arg_nY, arg_no, arg_rotation, arg_color){
		let xpiece = new Piece(cns_layer1Left, cns_layer1Top, arg_no, this.idCounter, arg_rotation, arg_color);
		this.idCounter++;
		this.addChild(xpiece);
		this.pieceList[this.pieceList.length] = xpiece;

    	createjs.Sound.play("piece");
	 	xpiece.movePiece(arg_nX, arg_nY);
	}

    delPiece(arg_piece){	
    	this.pieceList = this.pieceList.filter(elm => {
    		return elm.id != arg_piece.id;
    	});

    	createjs.Sound.play("button");
    	this.removeChild(arg_piece);
	}

    srtPlaceCard(arg_piece,arg_nX,arg_nY){
    	createjs.Sound.play("srthand");
	 	arg_piece.movePiece(arg_nX, arg_nY);

    	this.removeChild(arg_piece);
    	this.addChild(arg_piece);
	}
}

class Piece extends createjs.Container{
	constructor(arg_x, arg_y, arg_no, arg_id, arg_rotation, arg_color){
		super();
		this.id = arg_id;
		this.rotation = arg_rotation;
		this.no = arg_no;
		this.x = arg_x;
		this.y = arg_y;
		this.moving = 0;  		// 0:静止中、1:操作中
		this.showPieceButton = false;

		this.shape = new createjs.Shape();
        this.shape.graphics.beginFill("#00cccc");
		this.shape.graphics.drawRoundRect(0, 0, 30, 30, 0, 0);
		// this.shape.shadow = new createjs.Shadow(arg_color, 1, 1, 3);
		this.shape.alpha = 1;

		this.shapeShadow = new createjs.Shape();
		this.shapeShadow.graphics.beginFill(arg_color);
		this.shapeShadow.graphics.drawRoundRect(0, 0, 30, 30, 0, 0);
		this.shapeShadow.x = this.shapeShadow.x + 1;
		this.shapeShadow.y = this.shapeShadow.y + 2;

		this.shape.cache(0,0,30,30);
		this.shapeShadow.cache(0,0,32,32);
        this.addChild(this.shapeShadow); // 表示リストに追加
        this.addChild(this.shape); // 表示リストに追加

	    this.text =  new createjs.Text(arg_no, "14px sans-serif", "GhostWhite");
		this.text.textAlign = "center";
		this.text.textBaseline = "middle";
		this.text.x = 15;
		this.text.y = 15;

		this.textShadow = this.text.clone();
		this.textShadow.color = "dimgray";
		this.textShadow.x = this.text.x - 1;
		this.textShadow.y = this.text.y - 1;

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
		judge.clearButton();
	    // 背景選択の非活性化
		background.notActivate();

 		this.backupPointX = this.x;
 		this.backupPointY = this.y;
        this.dragPointX = stage.mouseX * cns_scale - this.x;
        this.dragPointY = stage.mouseY * cns_scale - this.y;
	    // 半透明にする
        this.alpha = 0.5;
	    // ドラッグ中ステータス　（透明化）
		this.moving  =  1;
 	}

    handleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
    	if(this.moving == 1){
        	this.x = stage.mouseX * cns_scale - this.dragPointX;
        	this.y = stage.mouseY * cns_scale - this.dragPointY;
        }
       	this.alpha = 1;
    }

 	handleUp(event){
 		this.alpha = 1;

		if(this.moving == 1){
			if(this.backupPointX == this.x && this.backupPointY == this.y && this.status != 1){
				judge.clearButton();
				this.delPieceButton = new DelPieceButton(this, stage.mouseX * cns_scale - layer2.x, stage.mouseY * cns_scale - layer2.y);
				judge.registerButton(this.delPieceButton);
			}else{
	 			socket.emit("serverPlayPiece", {
	 				cmd: "move",
			 		playerno: this.parent.player.playerNo,
			 		id: this.id,
			 		no: this.no,
			 		nX: this.x,
			 		nY: this.y
			 	});
			}
 		}

 		this.moving = 0;
		background.notActivate();
 	}

 	movePiece(arg_nX, arg_nY){
		let xrad = this.rotation * Math.PI / 180;
		let newX = arg_nX * Math.cos(xrad) - arg_nY * Math.sin(xrad);
		let newY = arg_nX * Math.sin(xrad) + arg_nY * Math.cos(xrad);

		createjs.Tween.get(this, {override:true})
		.to({x:newX, y:newY}, cns_duration, createjs.Ease.cubicOut);
 	}
}