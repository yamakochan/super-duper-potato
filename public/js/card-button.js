class CancelButton extends createjs.Container{
	constructor(arg_x,arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.buttonShape = new createjs.Shape();
        this.buttonShape.graphics.beginFill("hsl(300, 70%, 50%)");
		this.buttonShape.graphics.drawRoundRect(0, 0, cns_buttonWidth, cns_buttonHeight, 5, 5);
		this.buttonShape.alpha = 0.5;
		this.addChild(this.buttonShape); 

	    this.buttonText =  new createjs.Text("cancel", "14px sans-serif", "GhostWhite");
		this.buttonText.textAlign = "left";
		this.buttonText.textBaseline = "top";
		this.buttonText.x = 26;
		this.buttonText.y = 8;
		this.buttonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.addChild(this.buttonText);

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
	}

 	handleDown(){
       	createjs.Sound.play("button");
		this.parent.deleteButton();
 	}
}

class AbstButton extends createjs.Container{
	constructor(arg_x,arg_y,arg_text,arg_color){
		super();
		this.x = arg_x;
		this.y = arg_y;
		this.text = arg_text;
		this.color = arg_color;
		this.onAlpha = 0.9;
		this.offAlpha = 0.5;
		
		this.buttonShape = new createjs.Shape();
				//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
        this.buttonShape.graphics.beginLinearGradientFill([this.color,"aliceblue",this.color],[0.4,0.6,1.0],50,0,50,30);
		this.buttonShape.graphics.drawRoundRect(0, 0, cns_buttonWidth, cns_buttonHeight, 5, 5);
		this.buttonShape.alpha = this.offAlpha;
		this.addChild(this.buttonShape); 

	    this.buttonText =  new createjs.Text(arg_text, "14px sans-serif", "GhostWhite");
		this.buttonText.textAlign = "left";
		this.buttonText.textBaseline = "top";
		this.buttonText.x = cns_buttonWidth / 2 - this.text.length * 5;
		this.buttonText.y = 8;
		this.buttonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.addChild(this.buttonText);

        // this.on('tick',this.update,this);
    	this.on("mousedown", this.handleDown,this);
        this.on("pressmove", this.handleMove,this);
        this.on("pressup", this.handleUp,this);

       	createjs.Sound.play("button");
	}

	handleDown(event){
		this.buttonShape.alpha = this.onAlpha;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.buttonPush   = true;
 	}

    handleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(Math.abs(this.dragPointX - stage.mouseX) > 30 || Math.abs(this.dragPointY - stage.mouseY) > 30){
	        this.buttonPush = false;
			this.buttonShape.alpha = this.offAlpha;
        }
    }

 	handleUp(event){
 		if(this.buttonPush){
 			this.buttonCommand();
 		}
		this.buttonDelete();
 	}

 	buttonCommand(){
 	}

 	buttonDelete(){
	 	this.parent.deleteButton();
 	}
}

class CncrCardButton extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_card){
		super(arg_x,arg_y,arg_text,arg_color);
		this.card = arg_card;
		this.text = arg_text;
	}

 	buttonCommand(){
 		let xplayer = null;
 		if(this.text == "trash" || this.text == "draw"){
 			xplayer = cns_myPlayerIndex;
 		}
		socket.emit("serverButtonAction", {
			player: xplayer,
	 		no: this.card.no,
	 		text: this.text,
	 		nX: 0,	//未使用
	 		nY: 0	//未使用
		});	
 	}
}

class CardButton extends createjs.Container{
	constructor(arg_card,arg_x,arg_y,arg_text,arg_color){
		super();
		this.x = arg_x - 10 ;
		this.y = arg_y - 15;
		this.card = arg_card;
		this.text = arg_text;
		this.color = arg_color;
		this.layer = layer1;
		
		this.cardButton = new CncrCardButton(0, 0, this.text, this.color, this.card);
		this.addChild(this.cardButton);
		this.cancelButton = new CancelButton(0, cns_buttonHeight + 5);
		this.addChild(this.cancelButton);

		layer1.addChild(this);
	}

 	deleteButton(){
 		this.cardButton.off();
 		this.cancelButton.off();
		layer1.removeChild(this);
		this.currentButton = null;
 	}
}

class CncrDelPieceButton extends AbstButton{
	constructor(arg_x,arg_y,arg_text,arg_color,arg_piece){
		super(arg_x,arg_y,arg_text,arg_color);
		this.piece = arg_piece;
	}

 	buttonCommand(){
		socket.emit("serverDeletePiece", {
			// player: this.piece.parent.player.playerNo,
			player: cns_myPlayerIndex,
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
		this.layer = layer2;
		
		this.delPieceButton = new CncrDelPieceButton(0, 0, "delete", "darkgray", this.piece);
		this.addChild(this.delPieceButton);
		this.cancelButton = new CancelButton(0, cns_buttonHeight + 5);
		this.addChild(this.cancelButton);

		layer2.addChild(this);
	}

 	deleteButton(){
 		this.delPieceButton.off();
 		this.cancelButton.off();
		layer2.removeChild(this);
		this.currentButton = null;
 	}
}

class TurnButton extends AbstButton{
	constructor(arg_x,arg_y){
		super(arg_x, arg_y, "ターン終了", "navy");
		info.addChild(this);
	}

	buttonCommand(){
		socket.emit("serverChangeTurn");
 	}

 	buttonDelete(){
		judge.clearButton();
 		this.off();
 		info.removeChild(this);
 	}
}

class PermitRevokeButton extends AbstButton{
	constructor(arg_x,arg_y,arg_playerNo){
		super(arg_x, arg_y, "操作許可", "hsl(" + arg_playerNo*99 + ", 90%, 50%)");
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

class ResignButton extends AbstButton{
	constructor(arg_x,arg_y){
		super(arg_x, arg_y, " 降参 ", "dimgray");
		info.addChild(this);
	}

	buttonCommand(){
		socket.emit("serverResign",{
			player: cns_myPlayerIndex
		});	
 	}

 	buttonDelete(){
		judge.clearButton();
 		this.off();
 		info.removeChild(this);
 	}
}

class DiceButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.diceButton = [];

		for(let i = 0; i < 5; i++){
			this.diceButton[i] = new createjs.Container;
			let diceButtonShape = new createjs.Shape();
			//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
	        diceButtonShape.graphics.beginLinearGradientFill(["dimgray","aliceblue","dimgray"],[0.4,0.6,1.0],50,0,50,30);
			diceButtonShape.graphics.drawRoundRect(20 * i, 0, 19, 30, 5, 5);
			diceButtonShape.alpha = 0.5;
			this.diceButton[i].addChild(diceButtonShape); 

		    let diceButtonText =  new createjs.Text("x" + (i+1), "14px sans-serif", "GhostWhite");
			diceButtonText.textAlign = "left";
			diceButtonText.textBaseline = "top";
			diceButtonText.x = 1 + 20 * i;
			diceButtonText.y = 8;
			diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
			this.diceButton[i].addChild(diceButtonText);

			this.addChild(this.diceButton[i]);
		}

	    let diceButtonText =  new createjs.Text("Dice", "15px sans-serif", "GhostWhite");
		diceButtonText.textAlign = "left";
		diceButtonText.textBaseline = "top";
		diceButtonText.x = 5;
		diceButtonText.y = -15;
		diceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.addChild(diceButtonText);

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.diceButton[0].on("mousedown", this.diceHandleDown1,this);
    	this.diceButton[1].on("mousedown", this.diceHandleDown2,this);
    	this.diceButton[2].on("mousedown", this.diceHandleDown3,this);
    	this.diceButton[3].on("mousedown", this.diceHandleDown4,this);
    	this.diceButton[4].on("mousedown", this.diceHandleDown5,this);
		for(let i = 0; i < 5; i++){
    	    this.diceButton[i].on("pressmove", this.diceHandleMove,this);
        	this.diceButton[i].on("pressup", this.diceHandleUp,this);
        }
	}

	diceHandleDown1(event){
		judge.clearButton();

		this.diceButton[0].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 1;
 	}
	diceHandleDown2(event){
		judge.clearButton();

		this.diceButton[1].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 2;
 	}
	diceHandleDown3(event){
		judge.clearButton();

		this.diceButton[2].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 3;
 	}
	diceHandleDown4(event){
		judge.clearButton();

		this.diceButton[3].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 4;
 	}
	diceHandleDown5(event){
		judge.clearButton();

		this.diceButton[4].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 5;
 	}

    diceHandleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.dicePush = false;
			this.diceButton[this.no - 1].children[0].alpha = 0.5;
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
		this.diceButton[this.no - 1].children[0].alpha = 0.5;
 	}
}


class PieceButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.pieceButton = [];

		for(let i = 0; i < 6; i++){
			this.pieceButton[i] = new createjs.Container;
			let pieceButtonShape = new createjs.Shape();
			//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
	        pieceButtonShape.graphics.beginLinearGradientFill(["#00cccc","aliceblue","#00cccc"],[0.4,0.6,1.0],50,0,50,30);
			pieceButtonShape.graphics.drawRoundRect(20 * i, 0, 19, 30, 5, 5);
			pieceButtonShape.alpha = 0.5;
			this.pieceButton[i].addChild(pieceButtonShape); 

			let xtext = i + 1;
			if (xtext == 6){xtext = 10;};
		    let pieceButtonText =  new createjs.Text(xtext, "14px sans-serif", "GhostWhite");
			pieceButtonText.textAlign = "left";
			pieceButtonText.textBaseline = "top";
			pieceButtonText.x = 4 + 20 * i - Math.floor(i/6) * 3;
			pieceButtonText.y = 8;
			pieceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
			this.pieceButton[i].addChild(pieceButtonText);

			this.addChild(this.pieceButton[i]);
		}

	    let pieceButtonText =  new createjs.Text("piece", "15px sans-serif", "GhostWhite");
		pieceButtonText.textAlign = "left";
		pieceButtonText.textBaseline = "top";
		pieceButtonText.x = 5;
		pieceButtonText.y = -15;
		pieceButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
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

	pieceHandleDown1(event){
		judge.clearButton();

		this.pieceButton[0].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 1;
 	}
	pieceHandleDown2(event){
		judge.clearButton();

		this.pieceButton[1].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 2;
 	}
	pieceHandleDown3(event){
		judge.clearButton();

		this.pieceButton[2].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 3;
 	}
	pieceHandleDown4(event){
		judge.clearButton();

		this.pieceButton[3].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 4;
 	}
	pieceHandleDown5(event){
		judge.clearButton();

		this.pieceButton[4].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 5;
 	}
	pieceHandleDown6(event){
		judge.clearButton();

		this.pieceButton[5].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.piecePush   = true;
	    this.no = 6;
 	}

    pieceHandleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(Math.abs(this.dragPointX - stage.mouseX) > 15 || Math.abs(this.dragPointY - stage.mouseY) > 15){
	        this.piecePush = false;
			this.pieceButton[this.no - 1].children[0].alpha = 0.5;
        }
    }

 	pieceHandleUp(event){
 		if(this.piecePush){
 			let xno = this.no;
 			if(xno == 6){xno = 10};
 			let xplayer = judge.playerList[cns_myPlayerIndex];
 			socket.emit("serverPlayPiece", {
		 		cmd: "add",
		 		playerno: xplayer.playerNo,
		 		id: 0,
		 		no: xno,
		 		nX: 0,
		 		nY: 100
		 	});
 		}
		this.pieceButton[this.no - 1].children[0].alpha = 0.5;
 	}
}

