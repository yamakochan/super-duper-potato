class TurnButton extends createjs.Container{
	constructor(arg_x, arg_y){
		super();
		this.x = arg_x;
		this.y = arg_y;
		
		this.turnButton = new createjs.Container;
		this.addChild(this.turnButton);

		this.turnButtonShape = new createjs.Shape();
		//グラデーション指定：[色1,色2,色3],[色2開始割合、色3開始割合、色3終了割合],開始位置x,y,終了位置x,y
        this.turnButtonShape.graphics.beginLinearGradientFill(["dimgray","aliceblue","dimgray"],[0.4,0.6,1.0],50,0,50,30);
		this.turnButtonShape.graphics.drawRoundRect(0, 0, 100, 30, 5, 5);
		this.turnButtonShape.alpha = 0.5;
		this.turnButton.addChild(this.turnButtonShape); 

	    this.turnButtonText =  new createjs.Text("turn end", "14px sans-serif", "GhostWhite");
		this.turnButtonText.textAlign = "left";
		this.turnButtonText.textBaseline = "top";
		this.turnButtonText.x = 10;
		this.turnButtonText.y = 8;
		this.turnButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.turnButton.addChild(this.turnButtonText);

		info.addChild(this);

        // this.on('tick',this.update,this);
    	this.turnButton.on("mousedown", this.turnHandleDown,this);
        this.turnButton.on("pressmove", this.turnHandleMove,this);
        this.turnButton.on("pressup", this.turnHandleUp,this);
	}

	turnHandleDown(event){
		this.turnButtonShape.alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.turnPush   = true;
 	}

    turnHandleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(Math.abs(this.dragPointX - stage.mouseX) > 30 || Math.abs(this.dragPointY - stage.mouseY) > 30){
	        this.turnPush = false;
			this.turnButtonShape.alpha = 0.5;
        }
    }

 	turnHandleUp(event){
 		if(this.turnPush){
 			socket.emit("serverChangeTurn");
			info.removeChild(this);
 		}
		this.turnButtonShape.alpha = 0.5;
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
		this.diceButton[0].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 1;
 	}
	diceHandleDown2(event){
		this.diceButton[1].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 2;
 	}
	diceHandleDown3(event){
		this.diceButton[2].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 3;
 	}
	diceHandleDown4(event){
		this.diceButton[3].children[0].alpha = 1.0;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.dicePush   = true;
	    this.no = 4;
 	}
	diceHandleDown5(event){
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


class CardButton extends createjs.Container{
	constructor(arg_card,arg_x,arg_y,arg_text,arg_color){
		super();
		this.x = arg_x - 10 ;
		this.y = arg_y - 15;
		this.card = arg_card;
		this.text = arg_text;
		
		this.cardButton = new createjs.Container;
		this.cancelButton = new createjs.Container;

		this.cardButtonShape = new createjs.Shape();
		this.cardButtonShape.graphics.beginFill(arg_color);
		this.cardButtonShape.graphics.drawRoundRect(this.x, this.y, 100, 30, 5, 5);
		this.cardButtonShape.alpha = 0.5;
		this.cardButton.addChild(this.cardButtonShape); 

	    this.cardButtonText =  new createjs.Text(arg_text, "14px sans-serif", "GhostWhite");
		this.cardButtonText.textAlign = "left";
		this.cardButtonText.textBaseline = "top";
		this.cardButtonText.x = this.x + 30;
		this.cardButtonText.y = this.y + 8;
		this.cardButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.cardButton.addChild(this.cardButtonText);

		field.addChild(this.cardButton);

		this.cancelButtonShape = new createjs.Shape();
        this.cancelButtonShape.graphics.beginFill("hsl(300, 70%, 50%)");
		this.cancelButtonShape.graphics.drawRoundRect(this.x, this.y + 35, 100, 30, 5, 5);
		this.cancelButtonShape.alpha = 0.5;
		this.cancelButton.addChild(this.cancelButtonShape); 

	    this.cancelButtonText =  new createjs.Text("cancel", "14px sans-serif", "GhostWhite");
		this.cancelButtonText.textAlign = "left";
		this.cancelButtonText.textBaseline = "top";
		this.cancelButtonText.x = this.x + 26;
		this.cancelButtonText.y = this.y + 43;
		this.cancelButtonText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
		this.cancelButton.addChild(this.cancelButtonText);

		field.addChild(this.cancelButton);

        // this.on('tick',this.update,this);
    	this.cardButton.on("mousedown", this.cardHandleDown,this);
        this.cardButton.on("pressmove", this.cardHandleMove,this);
        this.cardButton.on("pressup", this.cardHandleUp,this);

    	this.cancelButton.on("mousedown", this.deleteButton,this);
	}

	cardHandleDown(event){
	    this.cardButtonShape.graphics.color = "hsl(200, 70%, 90%)";
		this.cardButtonShape.alpha = 0.9;
	    this.dragPointX = stage.mouseX;
	    this.dragPointY = stage.mouseY;
	    this.cardButtonPush   = true;
 	}

    cardHandleMove(event){
    // マウス追従　ドラッグ開始地点との補正あり
		if(Math.abs(this.dragPointX - stage.mouseX) > 30 || Math.abs(this.dragPointY - stage.mouseY) > 30){
	        this.cardButtonPush = false;
			this.cardButtonShape.alpha = 0.5;
		    this.cardButtonShape.color = "hsl(200, 70%, 50%)";
        }
    }

 	cardHandleUp(event){
 		if(this.cardButtonPush){
 			socket.emit("serverButtonAction", {
		 		no: this.card.no,
		 		text: this.text,
		 		nX: 0,	//未使用
		 		nY: 0	//未使用
			});
 		}
 		this.deleteButton();
 	}

 	deleteButton(){
 		this.cardButton.off();
 		this.cancelButton.off();
 		field.removeChild(this.cardButton);
 		field.removeChild(this.cancelButton);
 		this.card.showCardButton = false;
 	}
}
