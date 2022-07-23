class CancelButton extends createjs.Container{
	constructor(arg_x,arg_y,arg_magnification){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.buttonPush = false;
		
		this.buttonWidth = cns_buttonWidth * arg_magnification;

		this.buttonShape = new createjs.Shape();
        this.buttonShape.graphics.beginFill("hsl(300, 70%, 50%)");
		this.buttonShape.graphics.drawRoundRect(0, 0, this.buttonWidth, cns_buttonHeight, 5, 5);
		this.buttonShape.alpha = 0.5;
		this.buttonShape.cache(-2,-2,this.buttonWidth+4, cns_buttonHeight+4);
		this.addChild(this.buttonShape); 

	    this.buttonText =  new createjs.Text("cancel", "14px sans-serif", "GhostWhite");
		this.buttonText.textAlign = "center";
		this.buttonText.textBaseline = "middle";
		this.buttonText.x = this.buttonWidth / 2;
		this.buttonText.y = cns_buttonHeight / 2;
		// this.buttonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.buttonText.cache(-1 * this.buttonWidth / 2, -1 * cns_buttonHeight / 2, this.buttonWidth, cns_buttonHeight);

	    this.buttonTextShadow =  new createjs.Text("cancel", "14px sans-serif", "dimgray");
		this.buttonTextShadow.textAlign = "center";
		this.buttonTextShadow.textBaseline = "middle";
		this.buttonTextShadow.x = this.buttonWidth / 2 + 1;
		this.buttonTextShadow.y = cns_buttonHeight / 2 + 1;
		this.buttonTextShadow.cache(-1 * this.buttonWidth / 2 + 1, -1 * cns_buttonHeight / 2 + 1, this.buttonWidth, cns_buttonHeight);
		this.addChild(this.buttonTextShadow);
		this.addChild(this.buttonText);

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressup", this.handleUp,this);
	}

 	handleDown(){
		event.stopPropagation();
		background.notActivate();
	    this.buttonPush   = true;
 	}
 	handleUp(event){
 		if(this.buttonPush){
	       	createjs.Sound.play("button");
			this.parent.deleteButton();
 		}
 		background.Activate();
 	}
}

class AbstButton extends createjs.Container{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_magnification){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.text = arg_text;
		this.color = arg_color;
		this.onAlpha = 0.9;
		this.offAlpha = 0.5;
		this.buttonPush = false;
		
		this.buttonWidth = cns_buttonWidth * arg_magnification;

		this.buttonShape = new createjs.Shape();
				//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
        this.buttonShape.graphics.beginLinearGradientFill([this.color,"aliceblue",this.color],[0.4,0.6,1.0],50,0,50,30);
		this.buttonShape.graphics.drawRoundRect(0, 0, this.buttonWidth, cns_buttonHeight, 5, 5);
		this.buttonShape.alpha = this.offAlpha;
		this.buttonShape.cache(-2,-2,this.buttonWidth+4, cns_buttonHeight+4);
		this.addChild(this.buttonShape); 

	    this.buttonText =  new createjs.Text(arg_text, "14px sans-serif", "GhostWhite");
		this.buttonText.textAlign = "center";
		this.buttonText.textBaseline = "middle";
		this.buttonText.x = this.buttonWidth / 2;
		this.buttonText.y = cns_buttonHeight / 2;
		// this.buttonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.buttonText.cache(-1 * this.buttonWidth / 2,-1 * cns_buttonHeight / 2, this.buttonWidth, cns_buttonHeight);

	    this.buttonTextShadow =  new createjs.Text(arg_text, "14px sans-serif", "dimgray");
		this.buttonTextShadow.textAlign = "center";
		this.buttonTextShadow.textBaseline = "middle";
		this.buttonTextShadow.x = this.buttonWidth / 2 + 1;
		this.buttonTextShadow.y = cns_buttonHeight / 2 + 1;
		this.buttonTextShadow.cache(-1 * this.buttonWidth / 2 + 1,-1 * cns_buttonHeight / 2 + 1, this.buttonWidth, cns_buttonHeight);
		this.addChild(this.buttonTextShadow);
		this.addChild(this.buttonText);

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressmove", this.handleMove,this);
        this.on("pressup", this.handleUp,this);
	}

	handleDown(event){
		background.notActivate();
		this.buttonShape.uncache();
		this.buttonShape.alpha = this.onAlpha;
		this.buttonShape.cache(-2,-2,this.buttonWidth+4, cns_buttonHeight+4);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.buttonPush   = true;
 	}

    handleMove(event){
		if(Math.abs(this.dragPointX - stage.mouseX) > 30 || Math.abs(this.dragPointY - stage.mouseY) > 30){
	        this.buttonPush = false;
			this.buttonShape.uncache();
			this.buttonShape.alpha = this.offAlpha;
			this.buttonShape.cache(-2,-2,this.buttonWidth+4, cns_buttonHeight+4);
        }
    }

 	handleUp(event){
 		if(this.buttonPush){
 			this.buttonCommand();
			this.buttonDelete();
 		}
 		background.Activate();
 	}

 	buttonCommand(){
 	}

 	buttonDelete(){
	 	this.parent.deleteButton();
 	}
}

class CncrCardButton extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_card){
		super(arg_x,arg_y,arg_text,arg_color,1);
		this.card = arg_card;
		this.text = arg_text;

       	createjs.Sound.play("button");
	}

 	buttonCommand(){
 		let xplayer = cns_myPlayerIndex;
 		this.card.nonreactiveCard();
	 	this.card.reactiveCard();
 		// let xplayer = null;
 		// this.card.nonreactiveCard();
 		// if(this.text == "trash" || this.text == "draw" || this.text == "spread" || this.text == "close"){
 		// 	xplayer = cns_myPlayerIndex;
	 	// 	this.card.reactiveCard();
 		// }
		socket.emit("serverButtonAction", {
			player: xplayer,
	 		no: this.card.no,
	 		text: this.text,
	 		nX: 0,	//未使用
	 		nY: 0	//未使用
		});	
 	}
}

class CncrCardButtonPiece extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_card){
		super(arg_x,arg_y,arg_text,arg_color,1);
		this.card = arg_card;
		this.text = arg_text;

       	createjs.Sound.play("button");
	}

 	buttonCommand(){
 		this.card.nonreactiveCard();
	 	this.card.reactiveCard();
	 	if(Number.isInteger(this.text) && this.text > 0){
	 		judge.pieceButton.pseudoPushButton(this.text,this.card.x,this.card.y - 100);
		}else{
	 		judge.pieceButton2.pseudoPushButton(this.text,this.card.x,this.card.y - 100);
		}
 	}
}

class CncrCardButtonDice extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_card){
		super(arg_x,arg_y,arg_text,arg_color,1);
		this.card = arg_card;
		this.text = arg_text;

       	createjs.Sound.play("button");
	}

 	buttonCommand(){
 		this.card.nonreactiveCard();
	 	this.card.reactiveCard();
	 	if(this.text == "ATK"){
	 		judge.diceButton.pseudoPushButton(2);
		}else{
	 		judge.diceButton.pseudoPushButton(1);
		}
 	}
}

class DescButton extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_card){
		super(arg_x,arg_y,arg_text,arg_color,1);
		this.card = arg_card;
		this.text = arg_text;

       	createjs.Sound.play("button");
	}

 	buttonCommand(){
 		this.card.showDescription();
 	}
}

class CardButton extends createjs.Container{
	constructor(arg_card,arg_x,arg_y,arg_text,arg_color){
		super();
		this.x = arg_x - 20 ;
		this.y = arg_y - 15;
		this.card = arg_card;
		this.text = arg_text;
		this.color = arg_color;
		this.layer = layer1;
		
		this.cardButton = new CncrCardButton(0, 0, this.text, this.color, this.card);
		this.addChild(this.cardButton);
		this.cancelButton = new CancelButton(cns_buttonWidth + 5, 0, 1);
		this.addChild(this.cancelButton);

		layer1.addChild(this);
	}

 	deleteButton(){
 		this.cardButton.off();
 		this.cancelButton.off();
		layer1.removeChild(this);
		judge.forgetButton();　　//judge に保管してるcurrentButton をクリア。
 	}
}

class PlaceCardButton extends createjs.Container{
	constructor(arg_card,arg_x,arg_y,arg_text,arg_color,arg_text2,arg_color2){
		super();
		this.x = arg_x - 20 ;
		this.y = arg_y - 15;
		this.card = arg_card;
		this.text = arg_text;
		this.color = arg_color;
		this.text2 = arg_text2;
		this.color2 = arg_color2;
		this.layer = layer1;
		this.cardButton = [];
		this.cardButton2 = [];
		
		if(this.card.check){
			this.cardButton[this.cardButton.length] = new CncrCardButtonDice(0, 0, "CHK", "dimgray", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.attack){
			this.cardButton[this.cardButton.length] = new CncrCardButtonDice((cns_buttonWidth + 5) * this.cardButton.length, 0, "ATK", "dimgray", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.damage > 0){
			this.cardButton[this.cardButton.length] = new CncrCardButtonPiece((cns_buttonWidth + 5) * this.cardButton.length, 0, this.card.damage, "#00cccc", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.damage < 0){
			this.cardButton[this.cardButton.length] = new CncrCardButtonPiece((cns_buttonWidth + 5) * this.cardButton.length, 0, this.card.damage, "#CC0066", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.damage2 > 0){
			this.cardButton[this.cardButton.length] = new CncrCardButtonPiece((cns_buttonWidth + 5) * this.cardButton.length, 0, this.card.damage2, "#00cccc", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.damage2 < 0){
			this.cardButton[this.cardButton.length] = new CncrCardButtonPiece((cns_buttonWidth + 5) * this.cardButton.length, 0, this.card.damage2, "#CC0066", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.condition != ""){
			this.cardButton[this.cardButton.length] = new CncrCardButtonPiece((cns_buttonWidth + 5) * this.cardButton.length, 0, this.card.condition, "#CC9900", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}
		if(this.card.no == 30){	   //賢者の夢の呪文
			this.cardButton[this.cardButton.length] = new CncrCardButton((cns_buttonWidth + 5) * this.cardButton.length, 0, "kenjya", "hsl(180, 40%, 50%)", this.card);
			this.addChild(this.cardButton[this.cardButton.length - 1]);
		}

		let tempY = cns_buttonHeight + 5;
		if(this.cardButton.length == 0){tempY = 0;};
		this.cardButton2[this.cardButton2.length] = new DescButton((cns_buttonWidth + 5) * this.cardButton2.length, tempY, this.text2, this.color2, this.card);
		this.addChild(this.cardButton2[this.cardButton2.length - 1]);
		this.cardButton2[this.cardButton2.length] = new CncrCardButton((cns_buttonWidth + 5) * this.cardButton2.length, tempY, this.text, this.color, this.card);
		this.addChild(this.cardButton2[this.cardButton2.length - 1]);
		this.cardButton2[this.cardButton2.length] = new CancelButton((cns_buttonWidth + 5) * this.cardButton2.length, tempY,1);
		this.addChild(this.cardButton2[this.cardButton2.length - 1]);

		layer1.addChild(this);
	}

 	deleteButton(){
 		for(const elem of this.cardButton){elem.off();}
 		for(const elem of this.cardButton2){elem.off();}
		layer1.removeChild(this);
		// judge.forgetButton();　　//description を選んだらjudge に保管してるcurrentButton が、cardDescriptionに置き換わってるため、コメントアウト
 	}
}

class HandCardButton extends createjs.Container{
	constructor(arg_card,arg_x,arg_y,arg_text,arg_color,arg_text2,arg_color2,arg_text3,arg_color3){
		super();
		this.x = arg_x - 20;
		this.y = arg_y - 15;
		this.card = arg_card;
		this.text = arg_text;
		this.color = arg_color;
		this.text2 = arg_text2;
		this.color2 = arg_color2;
		this.text3 = arg_text3;
		this.color3 = arg_color3;
		this.layer = layer1;
		
		this.cardButton = new DescButton(0, 0, this.text, this.color, this.card);
		this.addChild(this.cardButton);
		this.cardButton2 = new CncrCardButton(cns_buttonWidth + 5, 0, this.text2, this.color2, this.card);
		this.addChild(this.cardButton2);
		this.cardButton3 = new CncrCardButton((cns_buttonWidth + 5) * 2, 0, this.text3, this.color3, this.card);
		this.addChild(this.cardButton3);
		this.cancelButton = new CancelButton(0, cns_buttonHeight + 5,1);
		this.addChild(this.cancelButton);

		layer1.addChild(this);
	}

 	deleteButton(){
 		this.cardButton.off();
 		this.cancelButton.off();
 		this.cardButton2.off();
 		this.cardButton3.off();
		layer1.removeChild(this);
		// judge.forgetButton();   description を選んだらjudge に保管してるcurrentButton が、cardDescriptionに置き換わってるため、コメントアウト
 	}
}

class CardDescription extends createjs.Container{
	constructor(arg_card){
		super();
		this.card = arg_card;
		this.boxWidth = 345;
		this.boxHeight = 100;
		this.textHeight = 13;
		this.x = 10;
		this.y = cns_stageHeight - (this.card.desc.length * this.textHeight) - 30;
		this.buttonPush = false;
		
		this.boxShape = new createjs.Shape();
        this.boxShape.graphics.beginFill("hsl(40, 60%, 98%)");
		// this.boxShape.graphics.drawRoundRect(0, 0, this.boxWidth, this.boxHeight, 5, 5);
		this.boxShape.graphics.drawRoundRect(0, 0, this.boxWidth, 10 + this.card.desc.length * this.textHeight, 5, 5);
		this.boxShape.alpha = 0.95;
		this.boxShape.cache(-2,-2,this.boxWidth+4, 10 + this.card.desc.length * this.textHeight + 4);
		this.addChild(this.boxShape); 

		this.wakuShape = new createjs.Shape();
        this.wakuShape.graphics.beginStroke("hsl(80, 70%, 30%)");
        this.wakuShape.graphics.setStrokeStyle(3);
		this.wakuShape.graphics.drawRoundRect(0, 0, this.boxWidth, 10 + this.card.desc.length * this.textHeight, 5, 5);
		this.wakuShape.alpha = 1.0;
		this.wakuShape.cache(-2,-2,this.boxWidth+4, 10 + this.card.desc.length * this.textHeight + 4);
		this.addChild(this.wakuShape); 

		let i = 0;
		for (const elem of this.card.desc) {
		    this.boxText =  new createjs.Text(elem, "11px Meiryo", "black");
			this.boxText.textAlign = "left";
			this.boxText.textBaseline = "top";
			this.boxText.x = 5;
			this.boxText.y = 5 + i * this.textHeight;
			this.boxText.cache(0,0,this.boxWidth, this.textHeight);
			this.addChild(this.boxText);
			i = i + 1;
		}

		info.addChild(this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressup", this.handleUp,this);
	}

 	handleDown(){
		background.notActivate();
		this.buttonPush = true
 	}

 	handleUp(event){
 		if(this.buttonPush){
	       	createjs.Sound.play("button");
			this.deleteButton();
 		}
 		background.Activate();
 	}

 	deleteButton(){
		this.off();
		info.removeChild(this);
		judge.forgetButton();
 	}

}



class CncrDelPieceButton extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_piece){
		super(arg_x,arg_y,arg_text,arg_color,1);
		this.piece = arg_piece;

       	createjs.Sound.play("button");
	}

 	buttonCommand(){
		socket.emit("serverDeletePiece", {
			// player: this.piece.parent.player.playerNo,
			// player: cns_myPlayerIndex,
	 		id: this.piece.id
		});	
 	}
}

class DelPieceButton extends createjs.Container{
	constructor(arg_piece,arg_x,arg_y){
		super();
		this.x = arg_x - 10 ;
		this.y = arg_y - 15;
		this.piece = arg_piece;
		
		this.delPieceButton = new CncrDelPieceButton(0, 0, "delete", "darkgray", this.piece);
		this.addChild(this.delPieceButton);
		this.cancelButton = new CancelButton(0, cns_buttonHeight + 5,1);
		this.addChild(this.cancelButton);

		layer1.addChild(this);
	}

 	deleteButton(){
 		this.delPieceButton.off();
 		this.cancelButton.off();
		layer1.removeChild(this);
		this.currentButton = null;
 	}
}

class TurnButton extends AbstButton{
	constructor(arg_x,arg_y){
		super(arg_x, arg_y, "ターン終了", "navy",2);
		info.addChild(this);
	}

	buttonCommand(){
		if(judge.kenjyaYumeMode == false){
			socket.emit("serverChangeTurn");
		}
 	}

 	buttonDelete(){
		judge.clearButton();
 		this.off();
 		info.removeChild(this);
 		judge.turn = null;
 	}
}

class PermitRevokeButton extends AbstButton{
	constructor(arg_x,arg_y,arg_playerNo){
		super(arg_x, arg_y, "操作許可", "hsl(" + arg_playerNo*99 + ", 90%, 50%)",2);
		info.addChild(this);
		this.player = arg_playerNo;
		this.swich = true;
	}

	buttonCommand(){
		socket.emit("serverPermitRevoke",{
			player: this.player,
			permit: this.swich
		});
		this.swich = (!this.swich);
		let xAlpha = this.onAlpha;
		this.onAlpha = this.offAlpha;
		this.offAlpha = xAlpha;
 	}

 	buttonDelete(){
		judge.clearButton();
 	}
}

class SettingFlag extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.onAlpha = 0.9;
		this.offAlpha = 0.5;
		this.onRotation = 20;
		this.offRotation = 0;
		this.perform = false;

		// 旗表示
		this.flag = new createjs.Bitmap(cns_flagImage);
		this.flag.alpha = this.offAlpha;
		this.flag.rotation = this.offRotation;
		this.flag.regX = cns_flagWidth / 2;
		this.flag.regY = cns_flagHeight / 2;
		this.addChild(this.flag); // 表示リストに追加

		info.addChild(this);

    	this.flag.on("mousedown", this.flagHandleDown,this);
        this.flag.on("pressmove", this.flagHandleMove,this);
        this.flag.on("pressup", this.flagHandleUp,this);
	} 	

	flagHandleDown(event){
		event.stopPropagation();
		background.notActivate();
		this.flag.uncache();
		this.flag.alpha = this.onAlpha;
		this.flag.cache(-2,-2,cns_flagWidth+4, cns_flagHeight+4);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.flagPush   = true;
 	}

    flagHandleMove(event){
		event.stopPropagation();
		if(Math.abs(this.dragPointX - stage.mouseX) > 30 || Math.abs(this.dragPointY - stage.mouseY) > 30){
	        this.flagPush = false;
			this.flag.uncache();
			this.flag.alpha = this.offAlpha;
			this.flag.cache(-2,-2,cns_flagWidth+4, cns_flagHeight+4);
        }
    }

 	flagHandleUp(event){
		event.stopPropagation();
 		if(this.flagPush){
	 		if(this.perform){
	 			this.deleteButton();
 		       	createjs.Sound.play("flag");
		 	}else{
			    this.perform = true;
 		       	createjs.Sound.play("flag");

				this.resignButton = new ResignButton(cns_stageWidth / 2 - cns_buttonWidth / 2 - this.x,cns_stageHeight / 2 - cns_buttonHeight - this.y);
				this.addChild(this.resignButton);
				this.cancelButton = new CancelButton(cns_stageWidth / 2 - cns_buttonWidth / 2 - this.x,cns_stageHeight / 2 + 5 - this.y,2);
				this.addChild(this.cancelButton);

				this.flag.uncache();
				this.flag.rotation = this.onRotation;
				this.flag.cache(-2,-2,cns_flagWidth+4, cns_flagHeight+4);
	 		}
	 	}
		background.Activate();
 	}

 	deleteButton(){
 		this.resignButton.off();
 		this.cancelButton.off();
		this.removeChild(this.resignButton);
		this.removeChild(this.cancelButton);

		this.perform = false;

		this.flag.uncache();
		this.flag.alpha = this.offAlpha;
		this.flag.rotation = this.offRotation;
		this.flag.cache(-2,-2,cns_flagWidth+4, cns_flagHeight+4);
 	}
}

class ResignButton extends AbstButton{
	constructor(arg_x,arg_y){
		super(arg_x, arg_y, " 降参 ", "dimgray",2);
		info.addChild(this);
	}

	buttonCommand(){
		socket.emit("serverResign",{
			player: cns_myPlayerIndex
		});	
 	}
}

class ViewButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.viewButton = [];

		for(let i = 0; i < 4; i++){this.viewButton[i] = new createjs.Container;}
		this.drawViewButton(0,0,0,"T");
		this.drawViewButton(1,-22,22,"L");
		this.drawViewButton(2,22,22,"R");
		this.drawViewButton(3,0,44,"B");
		for(let i = 0; i < 4; i++){this.addChild(this.viewButton[i]);}

	 //    let viewButtonText =  new createjs.Text("change view", "15px sans-serif", "GhostWhite");
		// viewButtonText.textAlign = "left";
		// viewButtonText.textBaseline = "top";
		// viewButtonText.x = -30;
		// viewButtonText.y = 70;
		// // diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		// viewButtonText.cache(0,0,40,15);

	 //    let viewButtonTextShadow =  new createjs.Text("change view", "15px sans-serif", "dimgray");
		// viewButtonTextShadow.textAlign = "left";
		// viewButtonTextShadow.textBaseline = "top";
		// viewButtonTextShadow.x = -30;
		// viewButtonTextShadow.y = 70;
		// viewButtonTextShadow.cache(0,0,40,15);
		// this.addChild(viewButtonTextShadow);
		// this.addChild(viewButtonText);

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.viewButton[0].on("mousedown", this.viewHandleDown1,this);
    	this.viewButton[1].on("mousedown", this.viewHandleDown2,this);
    	this.viewButton[2].on("mousedown", this.viewHandleDown3,this);
    	this.viewButton[3].on("mousedown", this.viewHandleDown4,this);
		for(let i = 0; i < 4; i++){
    	    this.viewButton[i].on("pressmove", this.viewHandleMove,this);
        	this.viewButton[i].on("pressup", this.viewHandleUp,this);
        }
	}

	drawViewButton(arg_i,arg_x,arg_y,arg_text){
		let viewButtonShape = new createjs.Shape();
		//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
        viewButtonShape.graphics.beginLinearGradientFill(["violet","dimgray","violet"],[0.4,1.0,0.3],0,0,20,20);
		viewButtonShape.graphics.drawRoundRect(0, 0, 20, 20, 5, 5);
		viewButtonShape.x = arg_x;
		viewButtonShape.y = arg_y;
		viewButtonShape.alpha = 0.5;
		viewButtonShape.cache(0,0,20,20);
		viewButtonShape.rotation = 45;
		this.viewButton[arg_i].addChild(viewButtonShape); 

	    let viewButtonText =  new createjs.Text(arg_text, "14px sans-serif", "GhostWhite");
		viewButtonText.textAlign = "center";
		viewButtonText.textBaseline = "middle";
		viewButtonText.x = arg_x;
		viewButtonText.y = arg_y + 13;
		// diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		viewButtonText.cache(-15,-15,20,20);

	    let viewButtonTextShadow =  new createjs.Text(arg_text, "14px sans-serif", "dimgray");
		viewButtonTextShadow.textAlign = "center";
		viewButtonTextShadow.textBaseline = "middle";
		viewButtonTextShadow.x = arg_x + 1;
		viewButtonTextShadow.y = arg_y + 13;
		viewButtonTextShadow.cache(-15,-15,21,21);
		this.viewButton[arg_i].addChild(viewButtonTextShadow);
		this.viewButton[arg_i].addChild(viewButtonText);
	}

	viewHandleDownAction(arg_i){
		background.notActivate();
		judge.clearButton();

		this.viewButton[arg_i].children[0].uncache();
		this.viewButton[arg_i].children[0].alpha = 1.0;
		this.viewButton[arg_i].children[0].cache(0,0,20,20);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.no = arg_i;
	    this.viewPush   = true;
 	}
	viewHandleDown1(event){
		this.viewHandleDownAction(0);
		this.nX = cns_stageWidth / 2;
		this.nY = cns_boadHeight * background.scale / 2 - (cns_cardHeight - 10) * background.scale;
 	}
	viewHandleDown2(event){
		this.viewHandleDownAction(1);
		this.nX = cns_boadWidth * background.scale / 2 - (cns_cardHeight - 10) * background.scale;
		this.nY = cns_stageHeight / 2;
 	}
	viewHandleDown3(event){
		this.viewHandleDownAction(2);
		this.nX = -1 * cns_boadWidth * background.scale / 2 + cns_stageWidth + (cns_cardHeight - 10) * background.scale;
		this.nY = cns_stageHeight / 2; 
 	}
	viewHandleDown4(event){
		this.viewHandleDownAction(3);
		this.nX = cns_stageWidth / 2;
		this.nY = -1 * cns_boadHeight * background.scale / 2 + cns_stageHeight; 
 	}

    viewHandleMove(event){
		background.notActivate();
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.viewPush = false;
			this.viewButton[this.no].children[0].uncache();
			this.viewButton[this.no].children[0].alpha = 0.5;
			this.viewButton[this.no].children[0].cache(0,0,20,20);
        }
    }

 	viewHandleUp(event){
 		if(this.viewPush){
			let duration = 500;
			createjs.Tween.get(layer1, {override:true})
			.to({x:this.nX, y:this.nY}, duration, createjs.Ease.cubicOut);
 		}
		this.viewButton[this.no].children[0].uncache();
		this.viewButton[this.no].children[0].alpha = 0.5;
		this.viewButton[this.no].children[0].cache(0,0,20,20);
		background.Activate();
 	}
}

class DiceButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.diceButton = [];

		for(let i = 0; i < 3; i++){
			this.diceButton[i] = new createjs.Container;
			let diceButtonShape = new createjs.Shape();
			//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
	        diceButtonShape.graphics.beginLinearGradientFill(["dimgray","aliceblue","dimgray"],[0.4,0.6,1.0],50,0,50,30);
			diceButtonShape.graphics.drawRoundRect(0, 0, 39, 30, 5, 5);
			diceButtonShape.x = 40 * i;
			diceButtonShape.y = 0;
			diceButtonShape.alpha = 0.5;
			diceButtonShape.cache(0,0,39,30);
			this.diceButton[i].addChild(diceButtonShape); 

		    let diceButtonText =  new createjs.Text("x" + (i+1), "14px sans-serif", "GhostWhite");
			diceButtonText.textAlign = "center";
			diceButtonText.textBaseline = "middle";
			diceButtonText.x = 40 * i + 19.5;
			diceButtonText.y = 15;
			// diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
			diceButtonText.cache(-9.5,-15,39,30);

		    let diceButtonTextShadow =  new createjs.Text("x" + (i+1), "14px sans-serif", "dimgray");
			diceButtonTextShadow.textAlign = "center";
			diceButtonTextShadow.textBaseline = "middle";
			diceButtonTextShadow.x = 40 * i + 20.5;
			diceButtonTextShadow.y = 16;
			diceButtonTextShadow.cache(-8.5,-14,38,29);
			this.diceButton[i].addChild(diceButtonTextShadow);
			this.diceButton[i].addChild(diceButtonText);

			this.addChild(this.diceButton[i]);
		}

	    let diceButtonText =  new createjs.Text("Dice", "15px sans-serif", "GhostWhite");
		diceButtonText.textAlign = "left";
		diceButtonText.textBaseline = "top";
		diceButtonText.x = 5;
		diceButtonText.y = -15;
		// diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		diceButtonText.cache(0,0,40,15);

	    let diceButtonTextShadow =  new createjs.Text("Dice", "15px sans-serif", "dimgray");
		diceButtonTextShadow.textAlign = "left";
		diceButtonTextShadow.textBaseline = "top";
		diceButtonTextShadow.x = 6;
		diceButtonTextShadow.y = -14;
		diceButtonTextShadow.cache(0,0,40,15);
		this.addChild(diceButtonTextShadow);
		this.addChild(diceButtonText);

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.diceButton[0].on("mousedown", this.diceHandleDown1,this);
    	this.diceButton[1].on("mousedown", this.diceHandleDown2,this);
    	this.diceButton[2].on("mousedown", this.diceHandleDown3,this);
    	// this.diceButton[3].on("mousedown", this.diceHandleDown4,this);
    	// this.diceButton[4].on("mousedown", this.diceHandleDown5,this);
		// for(let i = 0; i < 5; i++){
		for(let i = 0; i < 3; i++){
    	    this.diceButton[i].on("pressmove", this.diceHandleMove,this);
        	this.diceButton[i].on("pressup", this.diceHandleUp,this);
        }
	}

	diceHandleDown1(event){
		background.notActivate();
		judge.clearButton();

		this.diceButton[0].children[0].uncache();
		this.diceButton[0].children[0].alpha = 1.0;
		this.diceButton[0].children[0].cache(0,0,39,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 1;
 	}
	diceHandleDown2(event){
		background.notActivate();
		judge.clearButton();

		this.diceButton[1].children[0].uncache();
		this.diceButton[1].children[0].alpha = 1.0;
		this.diceButton[1].children[0].cache(0,0,39,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 2;
 	}
	diceHandleDown3(event){
		background.notActivate();
		judge.clearButton();

		this.diceButton[2].children[0].uncache();
		this.diceButton[2].children[0].alpha = 1.0;
		this.diceButton[2].children[0].cache(0,0,39,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 3;
 	}
	diceHandleDown4(event){
		background.notActivate();
		judge.clearButton();

		this.diceButton[3].children[0].uncache();
		this.diceButton[3].children[0].alpha = 1.0;
		this.diceButton[3].children[0].cache(0,0,19,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 4;
 	}
	diceHandleDown5(event){
		background.notActivate();
		judge.clearButton();

		this.diceButton[4].children[0].uncache();
		this.diceButton[4].children[0].alpha = 1.0;
		this.diceButton[4].children[0].cache(0,0,19,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 5;
 	}

    diceHandleMove(event){
		background.notActivate();
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.dicePush = false;
			this.diceButton[this.no - 1].children[0].uncache();
			this.diceButton[this.no - 1].children[0].alpha = 0.5;
			this.diceButton[this.no - 1].children[0].cache(0,0,39,30);
        }
    }

 	diceHandleUp(event){
 		if(this.dicePush){
 			socket.emit("serverRollDice",{
				no: this.no,
				nX: this.x,
				nY: this.y,
				faces:  [Math.floor(Math.random() * 6) + 1,
						 Math.floor(Math.random() * 6) + 1,
						 Math.floor(Math.random() * 6) + 1,
						 Math.floor(Math.random() * 6) + 1,
						 Math.floor(Math.random() * 6) + 1,
						 Math.floor(Math.random() * 6) + 1]
			});
 		}
		this.diceButton[this.no - 1].children[0].uncache();
		this.diceButton[this.no - 1].children[0].alpha = 0.5;
		this.diceButton[this.no - 1].children[0].cache(0,0,39,30);
		background.Activate();
 	}

	pseudoPushButton(arg_no){
		socket.emit("serverRollDice",{
			no: arg_no,
			nX: 10,
			nY: 100,
			faces:  [Math.floor(Math.random() * 6) + 1,
					 Math.floor(Math.random() * 6) + 1,
					 Math.floor(Math.random() * 6) + 1,
					 Math.floor(Math.random() * 6) + 1,
					 Math.floor(Math.random() * 6) + 1,
					 Math.floor(Math.random() * 6) + 1]
		});
	}
}


class PieceButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.idNo = 0;
		this.activate = true;
		
		this.pieceButton = [];

		for(let i = 0; i < 6; i++){
			this.pieceButton[i] = new createjs.Container;
			let pieceButtonShape = new createjs.Shape();
			//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
	        pieceButtonShape.graphics.beginLinearGradientFill(["#00cccc","aliceblue","#00cccc"],[0.4,0.6,1.0],50,0,50,30);
			pieceButtonShape.graphics.drawRoundRect(0, 0, 19, 30, 5, 5);
			pieceButtonShape.x = 20 * i;
			pieceButtonShape.y = 0;
			pieceButtonShape.alpha = 0.5;
			pieceButtonShape.cache(0,0,19,30);
			this.pieceButton[i].addChild(pieceButtonShape); 

			let xtext = i + 1;
			if (xtext == 6){xtext = 10;};
		    let pieceButtonText =  new createjs.Text(xtext, "14px sans-serif", "GhostWhite");
			pieceButtonText.textAlign = "center";
			pieceButtonText.textBaseline = "middle";
			pieceButtonText.x = 20 * i + 9.5;
			pieceButtonText.y = 15;
			// pieceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
			pieceButtonText.cache(-9.5, -15, 19, 30);

		    let pieceButtonTextShadow =  new createjs.Text(xtext, "14px sans-serif", "dimgray");
			pieceButtonTextShadow.textAlign = "center";
			pieceButtonTextShadow.textBaseline = "middle";
			pieceButtonTextShadow.x = 20 * i + 10.5;
			pieceButtonTextShadow.y = 16;
			pieceButtonTextShadow.cache(-8.5, -14, 19, 30);
			this.pieceButton[i].addChild(pieceButtonTextShadow);
			this.pieceButton[i].addChild(pieceButtonText);

			this.addChild(this.pieceButton[i]);
		}

	    let pieceButtonText =  new createjs.Text("piece", "15px sans-serif", "GhostWhite");
		pieceButtonText.textAlign = "left";
		pieceButtonText.textBaseline = "top";
		pieceButtonText.x = 5;
		pieceButtonText.y = -15;
		// pieceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		pieceButtonText.cache(0,0,40,18);
	    let pieceButtonTextShadow =  new createjs.Text("piece", "15px sans-serif", "dimgray");
		pieceButtonTextShadow.textAlign = "left";
		pieceButtonTextShadow.textBaseline = "top";
		pieceButtonTextShadow.x = 6;
		pieceButtonTextShadow.y = -14;
		pieceButtonTextShadow.cache(0,0,40,18);
		this.addChild(pieceButtonTextShadow);
		this.addChild(pieceButtonText);

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.pieceButton[0].on("mousedown", this.pieceHandleDown1,this);
    	this.pieceButton[1].on("mousedown", this.pieceHandleDown2,this);
    	this.pieceButton[2].on("mousedown", this.pieceHandleDown3,this);
    	this.pieceButton[3].on("mousedown", this.pieceHandleDown4,this);
    	this.pieceButton[4].on("mousedown", this.pieceHandleDown5,this);
    	this.pieceButton[5].on("mousedown", this.pieceHandleDown6,this);
		for(let i = 0; i < 6; i++){
    	    this.pieceButton[i].on("pressmove", this.pieceHandleMove,this);
        	this.pieceButton[i].on("pressup", this.pieceHandleUp,this);
        }
	}
	pieceHandleDownAction(arg_i){
		background.notActivate();
		judge.clearButton();

		this.pieceButton[arg_i].children[0].uncache();
		this.pieceButton[arg_i].children[0].alpha = 1.0;
		this.pieceButton[arg_i].children[0].cache(0,0,19,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = arg_i + 1;
 	}
	pieceHandleDown1(event){
		this.pieceHandleDownAction(0);
 	}
	pieceHandleDown2(event){
		this.pieceHandleDownAction(1);
 	}
	pieceHandleDown3(event){
		this.pieceHandleDownAction(2);
 	}
	pieceHandleDown4(event){
		this.pieceHandleDownAction(3);
 	}
	pieceHandleDown5(event){
		this.pieceHandleDownAction(4);
 	}
	pieceHandleDown6(event){
		this.pieceHandleDownAction(5);
 	}

    pieceHandleMove(event){
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.piecePush = false;
			this.pieceButton[this.no - 1].children[0].uncache();
			this.pieceButton[this.no - 1].children[0].alpha = 0.5;
			this.pieceButton[this.no - 1].children[0].cache(0,0,19,30);
        }
    }

 	pieceHandleUp(event){
 		if(this.piecePush){
 			this.idNo = this.idNo + 1;
 			let xno = this.no;
 			if(xno == 6){xno = 10};
 			let xplayer = judge.playerList[cns_myPlayerIndex];
 			let newX = 0;
 			let newY = 100;
			let ypiece = judge.otherPlace.pieceList.find(elm => {return Math.sqrt((newX - elm.x)**2 + (newY - elm.y)**2) < 15;});
			let mrg = false;
			let mrgId = 0;
			if(ypiece != null){
				mrg = true;
				mrgId = ypiece.id;
			}

			this.notActivate();
 			socket.emit("serverPlayPiece", {
		 		cmd: "add",
		 		playerno: xplayer.playerNo,
		 		id: cns_myPlayerIndex + "/" + this.idNo,
		 		no: xno,
		 		mrg: mrg,
		 		mrgId : mrgId,
		 		nX: 0,
		 		nY: 100
		 	});
 		}
		this.pieceButton[this.no - 1].children[0].uncache();
		this.pieceButton[this.no - 1].children[0].alpha = 0.5;
		this.pieceButton[this.no - 1].children[0].cache(0,0,19,30);
		background.Activate();
 	}

	notActivate(){
		this.activate = false;
	}

	Activate(){
		this.activate = true;
	}

	pseudoPushButton(arg_no,arg_x,arg_y){
		this.idNo = this.idNo + 1;
		let xno = arg_no;
		let xplayer = judge.playerList[cns_myPlayerIndex];
		let newX = arg_x;
		let newY = arg_y;
		let ypiece = judge.otherPlace.pieceList.find(elm => {return Math.sqrt((newX - elm.x)**2 + (newY - elm.y)**2) < 15;});
		let mrg = false;
		let mrgId = 0;
		if(ypiece != null){
			mrg = true;
			mrgId = ypiece.id;
		}

		this.notActivate();
 		socket.emit("serverPlayPiece", {
	 		cmd: "add",
	 		playerno: xplayer.playerNo,
	 		id: cns_myPlayerIndex + "/" + this.idNo,
	 		no: xno,
	 		mrg: mrg,
	 		mrgId : mrgId,
	 		nX: arg_x,
	 		nY: arg_y
	 	});
	}

}

class MinusPieceButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.idNo = 0;
		this.activate = true;
		
		this.pieceButton = [];

		for(let i = 0; i < 6; i++){
			this.pieceButton[i] = new createjs.Container;
			let pieceButtonShape = new createjs.Shape();
			//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
	        pieceButtonShape.graphics.beginLinearGradientFill(["#CC0066","Lavenderblush","#CC0066"],[0.4,0.6,1.0],50,0,50,30);
			pieceButtonShape.graphics.drawRoundRect(0, 0, 19, 30, 5, 5);
			pieceButtonShape.x = 20 * i;
			pieceButtonShape.y = 0;
			pieceButtonShape.alpha = 0.5;
			pieceButtonShape.cache(0,0,19,30);
			this.pieceButton[i].addChild(pieceButtonShape); 

			let xtext = -1 * (i + 1);
			if (xtext == -6){xtext = -10;};
		    let pieceButtonText =  new createjs.Text(xtext, "13px sans-serif", "GhostWhite");
			pieceButtonText.textAlign = "center";
			pieceButtonText.textBaseline = "middle";
			pieceButtonText.x = 20 * i + 9.5;
			pieceButtonText.y = 15;
			// pieceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
			pieceButtonText.cache(-9.5, -15, 19, 30);

		    let pieceButtonTextShadow =  new createjs.Text(xtext, "13px sans-serif", "dimgray");
			pieceButtonTextShadow.textAlign = "center";
			pieceButtonTextShadow.textBaseline = "middle";
			pieceButtonTextShadow.x = 20 * i + 10.5;
			pieceButtonTextShadow.y = 16;
			pieceButtonTextShadow.cache(-8.5, -14, 19, 30);
			this.pieceButton[i].addChild(pieceButtonTextShadow);
			this.pieceButton[i].addChild(pieceButtonText);

			this.addChild(this.pieceButton[i]);
		}

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.pieceButton[0].on("mousedown", this.pieceHandleDown1,this);
    	this.pieceButton[1].on("mousedown", this.pieceHandleDown2,this);
    	this.pieceButton[2].on("mousedown", this.pieceHandleDown3,this);
    	this.pieceButton[3].on("mousedown", this.pieceHandleDown4,this);
    	this.pieceButton[4].on("mousedown", this.pieceHandleDown5,this);
    	this.pieceButton[5].on("mousedown", this.pieceHandleDown6,this);
		for(let i = 0; i < 6; i++){
    	    this.pieceButton[i].on("pressmove", this.pieceHandleMove,this);
        	this.pieceButton[i].on("pressup", this.pieceHandleUp,this);
        }
	}
	pieceHandleDownAction(arg_i){
		background.notActivate();
		judge.clearButton();

		this.pieceButton[arg_i].children[0].uncache();
		this.pieceButton[arg_i].children[0].alpha = 1.0;
		this.pieceButton[arg_i].children[0].cache(0,0,19,30);
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = -1 * (arg_i + 1);
 	}
	pieceHandleDown1(event){
		this.pieceHandleDownAction(0);
 	}
	pieceHandleDown2(event){
		this.pieceHandleDownAction(1);
 	}
	pieceHandleDown3(event){
		this.pieceHandleDownAction(2);
 	}
	pieceHandleDown4(event){
		this.pieceHandleDownAction(3);
 	}
	pieceHandleDown5(event){
		this.pieceHandleDownAction(4);
 	}
	pieceHandleDown6(event){
		this.pieceHandleDownAction(5);
 	}

    pieceHandleMove(event){
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.piecePush = false;
			this.pieceButton[-1 * this.no - 1].children[0].uncache();
			this.pieceButton[-1 * this.no - 1].children[0].alpha = 0.5;
			this.pieceButton[-1 * this.no - 1].children[0].cache(0,0,19,30);
        }
    }

 	pieceHandleUp(event){
 		if(this.piecePush){
 			this.idNo = this.idNo + 1;
 			let xno = this.no;
 			if(xno == -6){xno = -10};
 			let xplayer = judge.playerList[cns_myPlayerIndex];
 			let newX = 0;
 			let newY = 100;
			let ypiece = judge.otherPlace.pieceList.find(elm => {return Math.sqrt((newX - elm.x)**2 + (newY - elm.y)**2) < 15;});
			let mrg = false;
			let mrgId = 0;
			if(ypiece != null){
				mrg = true;
				mrgId = ypiece.id;
			}

			this.notActivate();
 			socket.emit("serverPlayPiece", {
		 		cmd: "add",
		 		playerno: xplayer.playerNo,
		 		id: cns_myPlayerIndex + "/minus/" + this.idNo,
		 		no: xno,
		 		mrg: mrg,
		 		mrgId : mrgId,
		 		nX: 0,
		 		nY: 100
		 	});
 		}
		this.pieceButton[-1 * this.no - 1].children[0].uncache();
		this.pieceButton[-1 * this.no - 1].children[0].alpha = 0.5;
		this.pieceButton[-1 * this.no - 1].children[0].cache(0,0,19,30);
		background.Activate();
 	}

	notActivate(){
		this.activate = false;
	}

	Activate(){
		this.activate = true;
	}

	pseudoPushButton(arg_no,arg_x,arg_y){
		this.idNo = this.idNo + 1;
		let xno = arg_no;
		let xplayer = judge.playerList[cns_myPlayerIndex];
		let newX = arg_x;
		let newY = arg_y;
		let ypiece = judge.otherPlace.pieceList.find(elm => {return Math.sqrt((newX - elm.x)**2 + (newY - elm.y)**2) < 15;});
		let mrg = false;
		let mrgId = 0;
		if(ypiece != null && Number.isInteger(xno) && Number.isInteger(ypiece.no)){
			mrg = true;
			mrgId = ypiece.id;
		}

		this.notActivate();
 		socket.emit("serverPlayPiece", {
	 		cmd: "add",
	 		playerno: xplayer.playerNo,
	 		id: cns_myPlayerIndex + "/minus/" + this.idNo,
	 		no: xno,
	 		mrg: mrg,
	 		mrgId : mrgId,
	 		nX: arg_x,
	 		nY: arg_y
	 	});
	}

}
