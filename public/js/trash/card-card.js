class Card extends createjs.Container{
	constructor(arg_cardImage,arg_no){
		super();
		this.no = arg_no;
		this.x = 0;
		this.y = 0;
		this.headortail = 0;    // 0:表、1:裏
		this.moving = 0;  		// 0:静止中、1:操作中
		this.status = 0;  		// 0:deck、1:hand、2:place、9:cemetary
		this.showCardButton = false;

		this.tail = new createjs.Bitmap("./image/card01/tails01.png");
        this.addChild(this.tail); // 表示リストに追加

		this.head = new createjs.Bitmap(arg_cardImage);
        this.addChild(this.head); // 表示リストに追加

		this.gray = new createjs.Shape();
        this.gray.graphics.beginFill("darkgray");
		this.gray.graphics.drawRoundRect(this.x, this.y, cns_cardWidth, cns_cardHeight, 0, 0);
		this.gray.alpha = 0.5;
        this.addChild(this.gray); // 表示リストに追加

        this.faceUp();

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressmove", this.handleMove,this);
        this.on("pressup", this.handleUp,this);
	}

	handleDown(event){
    // 背景選択の非活性化
		background.notActivate();

		if(this.status == 1 || this.status == 2 || this.status == 9){
	 		this.backupPointX = this.x;
	 		this.backupPointY = this.y;
	        this.dragPointX = stage.mouseX - this.x;
	        this.dragPointY = stage.mouseY - this.y;
	    // 半透明にする
	        this.alpha = 0.5;
	    // ドラッグ中ステータス　（透明化）
			this.moving  =  1;
		}
		if(this.status == 0){
			//draw button　表示。。　
			if(!this.showCardButton){
				this.drawButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"draw","hsl(200, 70%, 50%)");
				this.showCardButton = true;
			}
		}
 	}

    handleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(this.status == 1 || this.status == 2 || this.status == 9){
	    	if(this.moving == 1){
	        	this.x = stage.mouseX - this.dragPointX;
	        	this.y = stage.mouseY - this.dragPointY;
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
				if(!this.showCardButton){
					if(this.status == 2){
						this.cemetaryButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"trash","hsl(250, 40%, 50%)");
					}else{
						if(this.status == 9){
							if(judge.cemetary.spread){
								this.cemetaryButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"close","hsl(300, 40%, 50%)");
							}else{
								this.cemetaryButton = new CardButton(this, stage.mouseX - layer1.x, stage.mouseY - layer1.y,"spread","hsl(300, 40%, 50%)");
							}
						}
					}
					this.showCardButton = true;
				}
			}else{
				let locationNo = 0;  //カード配置　0:hand , 1:place , 2:cemetary
		        if(this.y < cns_handTop - cns_cardHeight / 4){	//place側に配置
		        	locationNo = 1;
		        }else{
		        	locationNo = 0;
		        }
	 			socket.emit("serverPlayCard", {
			 		no: this.no,
			 		status: this.status,
			 		nX: this.x,
			 		nY: this.y,
			 		location: locationNo
				});
			}
 		}

 		this.moving = 0;
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
		this.gray.visible = false;
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
}