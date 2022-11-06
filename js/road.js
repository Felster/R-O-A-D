var canvas = document.getElementById("canvas");
var ctx = canvas.getContext ("2d");
var gameSize = {x: canvas.width, y:canvas.height};

var numResourcesLoaded = 0;
var totalResources = 8;
var gameTime;
var gameSpeed = 10;
var score = 0;
var enemyHandler = [];
var spawnTimer = 0;
//broadcast vars
var broadcastTimer = 0;
var broadcastSwitch = false;
var broadcastLength = 180;
//difficulty vars
var enemyDifficulty = {aggression:2.5,stupidity:8}
//menu vars
var menuActive = true;
var gameActive = false;

//images
var PlayerCar = new Image();
PlayerCar.src = "images/PlayerCar.png";
var EnemyCar = new Image();
EnemyCar.src = "images/EnemyCar.png";
var landscapeDetails = new Image();
landscapeDetails.src = "images/landscapeDetails.png";
var obstacleSpritesheet = new Image();
obstacleSpritesheet.src = "images/obstacleSpritesheet.png";
var PlayerCharacterSpriteSheet = new Image();
PlayerCharacterSpriteSheet.src = "images/PlayerCharacterSpriteSheet.png";
var EnemyCharacterSpriteSheet = new Image();
EnemyCharacterSpriteSheet.src = "images/EnemyCharacterSpriteSheet.png";
var WarningSpriteSheet = new Image();
WarningSpriteSheet.src = "images/WarningSpriteSheet.png";
var speechBubble = new Image();
speechBubble.src = "images/SpeechBubble.png";

//Load images
function initGame(){
	loadImages();
}

function loadImages() {
	PlayerCar.onload = function(){
		resourceLoaded();
	},

	EnemyCar.onload = function(){
		resourceLoaded();
	},

	landscapeDetails.onload = function(){
		resourceLoaded();
	},
	
	obstacleSpritesheet.onload = function(){
        resourceLoaded();
    },
    
    EnemyCharacterSpriteSheet.onload = function(){
        resourceLoaded();
    },
    
    WarningSpriteSheet.onload = function(){
        resourceLoaded();
    },
    
    speechBubble.onload = function(){
        resourceLoaded();
    },
    
    PlayerCharacterSpriteSheet.onload = function(){
        resourceLoaded();
    };
}

function resourceLoaded() {
  numResourcesLoaded += 1;

  if(numResourcesLoaded === totalResources) {
  	//Launch init > Run game
  	stateHandler();
  }
  	
}
//__________________________________________

function stateHandler(){
    if(menuActive === true){
        menu();
    }
    
    if(gameActive === true){
        main();
    }

}

function menu(){
    this.menuGradient = ctx.createLinearGradient(0,0,0,gameSize.y);
    
    this.menuGradient.addColorStop(0,"#000000");
    this.menuGradient.addColorStop(0.5,"#5E06B5");
    this.menuGradient.addColorStop(1,"#1E0036");
    
    ctx.fillStyle="#1E0036";
    ctx.fillRect(0,0,gameSize.x,gameSize.y);
    ctx.fillStyle="#FFFFFF";
    ctx.font="400px Impact";
    ctx.textAlign="center";
    ctx.fillText("ROAD", gameSize.x/2,gameSize.y-170);
    
    ctx.font="50px Impact";
    ctx.fillText("Press SPACE to start",gameSize.x/2,gameSize.y-110);
    
    if (Key.isDown(Key.SPACE)){
        menuActive = false;
        gameActive = true;
        init();
        return;
    }
    requestAnimationFrame(menu);

}


function init(){
	playerOne.init();
	gameTime = 0;
	score = 0;
	enemyDifficulty = {aggression:2.5,stupidity:8};
	enemyHandler = [];
	obstacleGenerator.init();
	broadcastTimer = 0;
    broadcastSwitch = false;
    spawnTimer = 0;
    playerCharacter.x = -1500;
    enemyCharacter.x = -1500;
	
	
	if(gameActive === true){
	    main();
	}
}

// Main Game Loop
function main() {
	update();
	render();
	
	if(gameActive === false){
	    menu();
	    return;
	}
	
	requestAnimationFrame(main);
}


function Player(){
	//Sprite
	this.img =  PlayerCar,
	this.srcX = 0,
	this.srcY = 0,
	this.srcW = 505,
	this.srcH = 140,
	this.frame =  [0,1,2,1],
	this.numFrames =  this.frame.length,
	this.curFrame =  0,
	this.startPosX = gameSize.x/2 - this.srcW/2,
	this.startPosY = this.y = gameSize.y/2,
	//position vars
	this.x = this.startPosX,
	this.y = this.startPosY,
	//speed vars
	this.moveState = "idle",
	this.moveSpeed = gameSpeed,
	this.now = 0,
	this.midActionDelay = gameSpeed * 2.5,
	//direction vars
	this.moveRight = false,
	this.returnRight = false,
	this.moveLeft = false,
	this.returnLeft = false,
	this.moveUp = false,
	this.returnUp = false,
	this.moveDown = false,
	this.returnDown = false,
	this.moveDistW = 300,
	this.moveDistH = 25,
	//control vars
	this.acceptMove = true;
	//collision vars
	this.impact = false;
	this.acceptImpact = true;
	this.giveImpact = true;
	this.lastImpact;
	//transition vars
	this.transitionState = true;
}

Player.prototype = {
	init: function(){
      this.x = gameSize.x + 180;
      this.moveState = "idle";
      this.transitionState = true;
      this.moveRight = false;
      this.returnRight = false;
      this.moveLeft = false;
      this.returnLeft = false;
      this.moveUp = false;
      this.returnUp = false;
      this.moveDown = false;
      this.returnDown = false;
      this.acceptMove = true;
      //this.x = this.startPosX;
      this.y = this.startPosY;
    },
    
    transition: function(){
      this.x -= this.moveSpeed;
      if(this.x === this.startPosX || this.x < this.startPosX){
          this.transitionState = false;
      }
    },
	
	drawSprite: function(){
		ctx.drawImage(this.img,this.srcX,this.srcY + (this.srcH * this.frame[this.curFrame]),this.srcW,this.srcH,this.x,this.y,this.srcW,this.srcH);

		if (gameTime % 5 === 0){
			this.curFrame++;
		}

		if (this.curFrame >= this.numFrames){
			this.curFrame = 0;
		}
	},

	update: function(){
		if (this.acceptMove === true){
			if (Key.isDown(Key.RIGHT)){
				this.moveState = "right";
			}
			if (Key.isDown(Key.LEFT)){
				this.moveState = "left";
			}

			if (Key.isDown(Key.UP)){
				this.moveState = "up";
			}

			if (Key.isDown(Key.DOWN)){
				this.moveState = "down";
			}

			if (this.moveState == "right"){
				this.moveRight = true;
			}

			if (this.moveState == "left"){
				this.moveLeft = true;
			}

			if (this.moveState == "up"){
				this.moveUp = true;
			}

			if (this.moveState == "down"){
				this.moveDown = true;
			}
		}
		
		if(this.impact === true){
            this.moveDown=true;
            this.impact = false;
        }

        if(this.y === this.startPosY){
            this.giveImpact = true;
        }

		this.move();
	},
	
	crash: function(objectHit){
	    this.crashSpeed = objectHit.speed;
	},

	move: function(){
		//Right
		if (this.moveState != "crash"){
    		if (this.moveRight === true){
    			this.acceptMove = false;
    			this.x += this.moveSpeed;
    			this.now = gameTime;
    			if (this.x > this.startPosX+this.moveDistW){
    				this.moveState = "wait";
    				this.moveRight = false;
    				this.returnRight = true;
    			}
    		}
    
    		if (this.returnRight === true){
    			if (gameTime-this.now>this.midActionDelay){
    				this.x-= this.moveSpeed;
    				if (this.x == this.startPosX || this.x < this.startPosX){
    					this.x = this.startPosX;
    					this.moveState = "idle";
    					this.returnRight = false;
    					this.acceptMove = true;
    				}
    			}
    		}
    		//Left
    		if (this.moveLeft === true){
    			this.acceptMove = false;
    			this.x -= this.moveSpeed;
    			this.now = gameTime;
    			if (this.x < this.startPosX-this.moveDistW){
    				this.moveState = "wait";
    				this.moveLeft = false;
    				this.returnLeft = true;
    			}
    		}
    
    		if (this.returnLeft === true){
    			if (gameTime-this.now>this.midActionDelay){
    				this.x+= this.moveSpeed;
    				if (this.x == this.startPosX){
    					this.moveState = "idle";
    					this.returnLeft = false;
    					this.acceptMove = true;
    				}
    			}
    		}
    		//Up
    		if (this.moveUp === true){
    			this.acceptMove = false;
    			this.x -= this.moveSpeed;
    			this.y -= this.moveSpeed/2;
    			this.now = gameTime;
    			if (this.y < this.startPosY-this.moveDistH){
    				this.moveState = "wait";
    				this.moveUp = false;
    				this.returnUp = true;
    			}
    		}
    
    		if (this.returnUp === true){
    			if (gameTime-this.now>this.midActionDelay){
    				this.x += this.moveSpeed;
    				this.y += this.moveSpeed/2;
    				if (this.y == this.startPosY){
    					this.moveState = "idle";
    					this.returnUp = false;
    					this.acceptMove = true;
    				}
    			}
    		}
    		//Down
    		if (this.moveDown === true){
    			this.acceptMove = false;
    			this.x += this.moveSpeed;
    			this.y += this.moveSpeed/2;
    			this.now = 0;
    			if (this.y > this.startPosY+this.moveDistH){
    				this.moveState = "wait";
    				this.moveDown = false;
    				this.returnDown = true;
    			}
    		}
    
    		if (this.returnDown === true){
    			this.now++;
    			if (this.now>this.midActionDelay){
    				this.x -= this.moveSpeed;
    				this.y -= this.moveSpeed/2;
    				if (this.y == this.startPosY){
    					this.moveState = "idle";
    					this.returnDown = false;
    					this.acceptMove = true;
    				}
    			}
    		}
		}
		
		else {
		    this.x += this.crashSpeed;
		}

	}
};

var playerOne = new Player();

function PlayerCharacter(){
    this.img = PlayerCharacterSpriteSheet;
    this.srcX = 0;
    this.srcY = 0;
    this.srcW = 88;
    this.srcH = 58;
    this.x = 0;
    this.y = 0;
    this.frame =  [0,1,2,3];
}

PlayerCharacter.prototype = {
    update: function(){
        this.x = playerOne.x + 190;
        this.y = playerOne.y - 22;
    },
    
    draw:function(){
        ctx.drawImage(this.img,this.srcX,this.srcY + (this.srcH * this.frame[playerOne.curFrame]),this.srcW,this.srcH,this.x,this.y,this.srcW,this.srcH);
    }
};

function EnemyCharacter(){
    this.img = EnemyCharacterSpriteSheet;
    this.srcX = 0;
    this.srcY = 0;
    this.srcW = 61;
    this.srcH = 41;
    this.x = 1500;
    this.y = 0;
    this.frame =  [0,1,2,3];
}

EnemyCharacter.prototype = {
    update: function(){
        this.x = enemyHandler[0].x + 185;
        this.y = enemyHandler[0].y - 7;
    },
    
    draw:function(){
        ctx.drawImage(this.img,this.srcX,this.srcY + (this.srcH * this.frame[enemyHandler[0].curFrame]),this.srcW,this.srcH,this.x,this.y,this.srcW,this.srcH);
    }
};

var playerCharacter = new PlayerCharacter();
var enemyCharacter = new EnemyCharacter();

function Enemy(aggress, stupid){
	//Sprite
	this.img =  EnemyCar,
	this.srcX = 0,
	this.srcY = 0,
	this.srcW = 505,
	this.srcH = 140,
	this.frame =  [0,1,2,1],
	this.numFrames =  this.frame.length,
	this.curFrame =  2,
	this.startPosX = (gameSize.x/2 - this.srcW/2) - 60,
	this.startPosY = gameSize.y/2 - 45,
	//position vars
	this.x = gameSize.x + 100;
	this.y = this.startPosY;
	
	//ai vars
	//DEFAULT - agg: 3, stupid:9
    this.aggression = aggress;
    this.enemyDifficulty = 4.5;
    this.stupidity = stupid;
	
	//speed vars
    this.moveState = "idle",
    this.moveSpeed = gameSpeed,
    this.now = 0,
    this.midActionDelay = gameSpeed*this.enemyDifficulty,
    //direction vars
    this.moveRight = false,
    this.returnRight = false,
    this.moveLeft = false,
    this.returnLeft = false,
    this.moveUp = false,
    this.returnUp = false,
    this.moveDown = false,
    this.returnDown = false,
    this.moveDistW = 150,
    this.moveDistH = 35,
    //control vars
    this.acceptMove = true;
    //collision vars
    this.impact = false;
    this.giveImpact = true;
    this.impactTimeout;
    //transition vars
    this.transitionState = true;
    
	
	
}

Enemy.prototype = {
	init: function(){
	  this.x = gameSize.x + 100;
	},
	
	transition: function(){
	  this.x -= this.moveSpeed;
	  if(this.x === this.startPosX || this.x < this.startPosX){
	      this.transitionState = false;
	  }
	},
	
	drawSprite: function(){
		ctx.drawImage(this.img,this.srcX,this.srcY + (this.srcH * this.frame[this.curFrame]),this.srcW,this.srcH,this.x,this.y,this.srcW,this.srcH);
        
		if (gameTime % 5 === 0){
			this.curFrame++;
		}

		if (this.curFrame >= this.numFrames){
			this.curFrame = 0;
		}
	},
	
	update: function(){
	    
	    if(this.impact === true){
	        this.moveUp = true;
	        this.impact = false;
	    }
	    
	    if(this.y === this.startPosY){
            this.giveImpact = true;
        }

	    
	    this.ai();
	    this.move();

	},
	
	crash: function(objectHit){
        this.crashSpeed = objectHit.speed;
    },
    
    ai: function(){
        //if P1 is on their y start mark, and we're on a quarter of a second
        if(playerOne.y === playerOne.startPosY && gameTime % 10 ===0){
            this.aiActionChance = Math.random()*10;
            if(this.acceptMove === true){
                if (this.aiActionChance < this.aggression){
                    if(obstacleGenerator.obstacleArray[2].posX < 150 && obstacleGenerator.obstacleArray[2].posX > -200 &&obstacleGenerator.obstacleArray[1].posX < 600){
                        this.moveDown = true;
                    }
                }
                if (this.aiActionChance > this.stupidity){
                    if(obstacleGenerator.obstacleArray[1].posX < 150 && obstacleGenerator.obstacleArray[1].posX > -200){
                        this.moveDown = true;
                    }
                }
                
                //random moves
                if (this.aiActionChance > 5 && this.aiActionChance < 5.2){
                    this.moveDown = true;
                }
                
                if (this.aiActionChance > 7 && this.aiActionChance < 7.2 && this.moveDown !== true){
                    this.moveUp = true;
                }
            }
        }
        
    },
	
	move: function(){
    //Right
    if (this.moveState != "crash"){
        if (this.moveRight === true){
            this.acceptMove = false;
            this.x += this.moveSpeed;
            this.now = gameTime;
            if (this.x > this.startPosX+this.moveDistW){
                this.moveState = "wait";
                this.moveRight = false;
                this.returnRight = true;
            }
        }

        if (this.returnRight === true){
            if (gameTime-this.now>this.midActionDelay){
                this.x-= this.moveSpeed;
                if (this.x == this.startPosX){
                    this.moveState = "idle";
                    this.returnRight = false;
                    this.acceptMove = true;
                }
            }
        }
        //Left
        if (this.moveLeft === true){
            this.acceptMove = false;
            this.x -= this.moveSpeed;
            this.now = gameTime;
            if (this.x < this.startPosX-this.moveDistW){
                this.moveState = "wait";
                this.moveLeft = false;
                this.returnLeft = true;
            }
        }

        if (this.returnLeft === true){
            if (gameTime-this.now>this.midActionDelay){
                this.x+= this.moveSpeed;
                if (this.x == this.startPosX){
                    this.moveState = "idle";
                    this.returnLeft = false;
                    this.acceptMove = true;
                }
            }
        }
        //Up
        if (this.moveUp === true){
            this.acceptMove = false;
            this.x -= this.moveSpeed;
            this.y -= this.moveSpeed/2;
            this.now = 0;
            if (this.y < this.startPosY-this.moveDistH){
                this.moveState = "wait";
                this.moveUp = false;
                this.returnUp = true;
            }
        }

        if (this.returnUp === true){
            this.now++;
            if (this.now>this.midActionDelay){
                this.x += this.moveSpeed;
                this.y += this.moveSpeed/2;
                if (this.y == this.startPosY){
                    this.moveState = "idle";
                    this.returnUp = false;
                    this.acceptMove = true;
                }
            }
        }
        //Down
        if (this.moveDown === true){
            this.acceptMove = false;
            this.x += this.moveSpeed;
            this.y += this.moveSpeed/2;
            this.now = gameTime;
            if (this.y > this.startPosY+this.moveDistH){
                this.moveState = "wait";
                this.moveDown = false;
                this.returnDown = true;
            }
        }

        if (this.returnDown === true){
            if (gameTime-this.now>this.midActionDelay){
                this.x -= this.moveSpeed;
                this.y -= this.moveSpeed/2;
                if (this.y == this.startPosY || this.y< this.startPosY){
                    this.moveState = "idle";
                    this.returnDown = false;
                    this.acceptMove = true;
                }
            }
        }
    }
    
        else {
            this.x += this.crashSpeed;
        }
	}
};

function Obstacle(type){
    
    //[Top, Enemy Obstacle, Middle, Player Obstacle, Bottom]
    this.type = type;
    this.locationArray = [220,284,350];
    this.posY = this.locationArray[type];
    this.posX = -1200;
    this.speed = gameSpeed*1.5;
    this.active = false;
    this.img = obstacleSpritesheet;
    this.srcX = 0;
    this.srcY = 0;
    this.srcH = 67;
    this.srcW = 180;
    this.amountOfObstacles = Math.floor(Math.random()*11+1);
    
    this.warningGap = 1000;
    
    this.warningImg = WarningSpriteSheet;
    
    if(type === 1){
        this.warningSrcX=0;
        this.warningSrcY=242;
        this.warningSrcH=31;
        this.warningSrcW=46;
    } else if (type === 0){
        this.warningSrcX = 35;
        this.warningSrcY = 121;
        this.warningSrcH = 121;
        this.warningSrcW = 35;
    } else {
        this.warningSrcX = 0;
        this.warningSrcY = 0;
        this.warningSrcH = 121;
        this.warningSrcW = 35;
    }
    
    if (type === 0){this.warningPosY = this.posY-63}
    if (type === 1){this.warningPosY = this.posY+45}
    if (type === 2){this.warningPosY = this.posY-50}
    
    
    this.warningPosX = this.posX+this.warningGap;
}

Obstacle.prototype = {
    update: function(){
        
        if(this.active === true){
            this.posX += gameSpeed*1.5;
            this.warningPosX = this.posX+this.warningGap;
            
            if(this.posX - this.amountOfObstacles*this.srcW > gameSize.x){
                this.posX = -1200;
                this.srcY = this.srcH*Math.floor(Math.random()*4);
                this.amountOfObstacles = Math.floor(Math.random()*11+1);
                this.active = false;
            }
        }
    },
    
    draw: function(){
       if(this.active === true){
           for(var i=0;i<this.amountOfObstacles;i++){
               ctx.drawImage(this.img,this.srcX,this.srcY,this.srcW,this.srcH,this.posX-(i*(this.srcW-5)),this.posY,this.srcW,this.srcH);
               if(this.type !== 1){
               ctx.drawImage(this.warningImg,this.warningSrcX,this.warningSrcY,this.warningSrcW,this.warningSrcH,this.warningPosX,this.warningPosY,this.warningSrcW,this.warningSrcH);
               ctx.drawImage(this.warningImg,this.warningSrcX+this.warningSrcW,this.warningSrcY,this.warningSrcW,this.warningSrcH,this.warningPosX-this.warningGap/2,this.warningPosY,this.warningSrcW,this.warningSrcH);

               }
            }
       }
    },
    
    drawChevron:function(){
        if(this.active === true){
            if(this.type===1){
                for(var i = 0;i<8;i++){
                ctx.drawImage(this.warningImg,this.warningSrcX,this.warningSrcY,this.warningSrcW,this.warningSrcH,this.warningPosX - i*(this.warningGap/9),this.warningPosY,this.warningSrcW,this.warningSrcH);
                }
            }
        }
    }
    
};

function ObstacleGenerator(){
    this.obstacleArray = [new Obstacle(0), new Obstacle(1),new Obstacle(2)];
    this.obstacleTriggerArrayTop =[1];
    this.obstacleTriggerArrayMiddle =[1];
    this.obstacleTriggerArrayBottom =[1];
    this.curObstacle = 0;
    
    this.obstacleDifficulty = 120;

}

ObstacleGenerator.prototype = {
  init: function(){
      this.obstacleArray = [new Obstacle(0), new Obstacle(1),new Obstacle(2)];
      this.obstacleTriggerArrayTop =[1];
      this.obstacleTriggerArrayMiddle =[1];
      this.obstacleTriggerArrayBottom =[1];
      this.curObstacle = 0;
      
      this.obstacleDifficulty = 120;
  },
  
  update: function(){

       if(gameTime % this.obstacleDifficulty === 0){
           this.obstacleTriggerArrayTop.push(Math.floor(Math.random()*2));
           this.obstacleTriggerArrayMiddle.push(Math.floor(Math.random()*2));
           this.obstacleTriggerArrayBottom.push(Math.floor(Math.random()*2));
           
           if(this.obstacleTriggerArrayTop[this.curObstacle] === 1){
               this.obstacleArray[0].active = true;
           }
           
           if(this.obstacleTriggerArrayMiddle[this.curObstacle] === 1){
               this.obstacleArray[1].active = true;
           }
           
           if(this.obstacleTriggerArrayBottom[this.curObstacle] === 1){
               this.obstacleArray[2].active = true;
           }
           
           this.curObstacle++;
       }
       
       this.obstacleArray[0].update();
       this.obstacleArray[1].update();
       this.obstacleArray[2].update();
  },
  
  drawTop: function(){
      this.obstacleArray[0].draw();
      this.obstacleArray[1].drawChevron();
  },
  
  drawMiddle: function(){
      this.obstacleArray[1].draw();
},
  
  drawBottom: function(){
      this.obstacleArray[2].draw();
  }
};

var obstacleGenerator = new ObstacleGenerator();


function backgroundDetail(sprite,type,speed){
	this.bgSpeed = gameSpeed*0.5;
	
	this.type = type;
	this.pos = -100;
	this.sprite = sprite;
	//[mountains, dirt, road]
	this.speedArray = [Math.random()*(0.5-0.2)+0.2,Math.random()*(10-8)+8,4];
	this.speed = this.speedArray[speed];
	this.backgroundTypeArray = [0,85,186];
	this.displaceW = this.backgroundTypeArray[type];
	this.posXArray = [193,Math.random()*((gameSize.y/1.8+100)-(gameSize.y/1.8)+1)+(gameSize.y/1.8),Math.random()*(gameSize.y-220+1)+220];
	this.posX = this.posXArray[type];

}

backgroundDetail.prototype = {
	draw: function(){
		ctx.drawImage(landscapeDetails,this.displaceW,25*this.sprite,85,25,this.pos,this.posX,85,25);
	},

	update: function(){
		this.bgSpeed = gameSpeed*0.5;
		
		this.pos += this.speed*this.bgSpeed;
		
		if(this.pos > gameSize.x){
		    this.pos = -100;
		    if(this.type === 1){
		        this.posX = Math.random()*((gameSize.y/1.8+100)-(gameSize.y/1.8)+1)+(gameSize.y/1.8)
		    }
		}
		
	}
};

function Background(){
	floor = "rgb(221,207,161)";
	road = "rgb(142,144,145)";
	theSunColors = {r:0,g:0,b:0};
	sunSetGradient = ctx.createLinearGradient(0,0,0,170);
	sunSetColors = {r1:93,r2:63,g1:39,g2:38,b1:71,b2:77};
	
	sunSetGradient.addColorStop(0,"rgb("+sunSetColors.r1+","+sunSetColors.g1+","+sunSetColors.b1+")");
	sunSetGradient.addColorStop(1,"rgb("+sunSetColors.r2+","+sunSetColors.g2+","+sunSetColors.b2+")");
	
	theSun = 0;
	sunPos = 0;
	
	this.assetCounterMountains = 0;
	this.assetCounterRoad = 0;


	this.mountains = [];
	this.roadBlur = [];
	this.floorBlur = [];

	for(var i=0;i<13;i++){
		this.mountains.push(new backgroundDetail(i,0,0));
		this.roadBlur.push(new backgroundDetail(i,1,1));
		this.floorBlur.push(new backgroundDetail(i,2,2));
	}
	
	this.entitiesStack=[this.mountains,this.roadBlur,this.floorBlur];

	this.backgroundEntities=[];
	
}

Background.prototype = {
	draw: function(){
		ctx.fillStyle=sunSetGradient;
		ctx.fillRect(0,0,gameSize.x,gameSize.y/2.3);
		
		ctx.fillStyle=theSun;
		ctx.beginPath();
		ctx.arc(gameSize.x*0.75,sunPos,100,0,2*Math.PI);
		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle=floor;
		ctx.fillRect(0,gameSize.y/2.3,gameSize.x,310);
		ctx.fillStyle=road;
		ctx.fillRect(0,gameSize.y/1.8,gameSize.x,125);

		for (var i=0;i<this.backgroundEntities.length;i++){
			    this.backgroundEntities[i].draw();
		}
	},

	update: function(){
		//sunset
		theSunColors = {r:247,g:Math.floor(461 - gameTime/20),b:Math.floor(461 - gameTime/8)};
		theSun = "rgb("+theSunColors.r+","+theSunColors.g+","+theSunColors.b+")";
		sunPos = Math.floor(gameTime/40);

		if (gameTime % 50 === 0 && this.assetCounterMountains < 12){
		    this.backgroundEntities.push (this.mountains[this.assetCounterMountains]);
		    this.assetCounterMountains++;
		}
		
		if (gameTime % 20 === 0 && this.assetCounterRoad < 12){
            this.backgroundEntities.push (this.roadBlur[this.assetCounterRoad]);
            this.assetCounterRoad++;
        }
		
		for (var i=0;i<this.backgroundEntities.length;i++){
			    this.backgroundEntities[i].update();
		}

	}

};

var background = new Background();

function obstacleCollision(body1, body2){
    //if bottom of body 1 is greater than bottom of body 2 - 20, and bottom of body1 is less than bottom of body 2 +5
    if (body1.y+body1.srcH > body2.posY+body2.srcH && body1.y+body1.srcH < body2.posY+body2.srcH +30){
        
        //if the left of body 1 is greater than the right of body 2 && the left of body 1 is less than the right of body 2 + 10
        if(body1.x + 20> (body2.posX + body2.srcW) - 30 && body1.x +20< body2.posX + body2.srcW){
            //Front impact action
            body1.moveState = "crash";
            body1.crash(body2);
        }
        
        //if the left of body 1 is smaller than the right of body 2, && the left of body 1 is greater than the left of the array
        if(body1.x < body2.posX + body2.srcW && body1.x > body2.posX + body2.srcW - body2.amountOfObstacles*body2.srcW 
        
            ||
            
        //if the right of body 1 is smaller than the left of body two, and the right of body 1 is greater than the left of the array
            body1.x+body1.srcW < body2.posX && body1.x+body1.srcW > body2.posX + body2.srcW - body2.amountOfObstacles*body2.srcW)
            {
            
            //Side impact action
            if(body1.moveUp === true){
                body1.moveUp = false;
                body1.returnUp = true;
            } else if(body1.moveDown === true){
                body1.moveDown = false;
                body1.returnDown = true;
            }
            //body1.now -= (gameTime-body1.now);

            }
    }
}

function playerCollision(body1,body2){
    //if bottom of body 1 - 35 is less than bottom of body 2 + 10, and bottom of body1 - 30 is greater than bottom of body 2
    if (body1.y+(body1.srcH)-35 < body2.y+body2.srcH){
        if((body1.x+40 > body2.x+40 && body1.x+40 < body2.x+(body2.srcW-135)) || (body2.x+40 > body1.x+40 && body2.x+40 < body1.x+(body1.srcW-135))){
        
            if(body1.moveUp === true && body2.moveDown === true){
                body1.moveUp = false;
                body2.moveDown = false;
                body1.returnUp = true;
                body2.returnDown = true;
            } else {
            
                if (body1.moveUp === true){
                    body2.moveUp = true;
                    body1.moveUp = false;
                    body1.returnUp = true;
                } else 
                
                if (body2.moveDown === true){
                    body1.moveDown = true;
                    body2.moveDown = false;
                    body2.returnDown = true;
                }
            }
        }
        
    }
}

function scoreBroadcaster(score){
    if (broadcastSwitch === true){
        ctx.drawImage(speechBubble,playerCharacter.x+85,playerCharacter.y - 25);
        if(score === 0){
            ctx.fillStyle="#000000";
            ctx.font="12px Courier";
            ctx.textAlign="center";
            ctx.fillText("Let's go", playerCharacter.x+123,playerCharacter.y);
        } else {
            ctx.fillStyle="#000000";
            ctx.font="12px Courier";
            ctx.textAlign="center";
            ctx.fillText("That's " + score, playerCharacter.x+123,playerCharacter.y);
        }
        broadcastTimer++;
        if(broadcastTimer > broadcastLength){
            broadcastTimer = 0;
            broadcastSwitch = false;
        }
    }
}

function scoreHandler(){
    if(enemyHandler.length === 1){
        if(enemyHandler[0].x > gameSize.x && enemyHandler[0].moveState === "crash"){
            score += 1;
            enemyHandler.splice(0,1);
            spawnTimer = 0;
            broadcastSwitch = true;
        }
    }
    spawnTimer++;
    if(spawnTimer === 120){
        enemySpawner();
    }
}

function enemySpawner(){
    if(enemyHandler.length === 0){
        if(gameTime > 119){
            broadcastSwitch = true;
            enemyHandler.push (new Enemy(enemyDifficulty.aggression,enemyDifficulty.stupidity));
            if(enemyDifficulty.aggression < 9){
                enemyDifficulty.aggression += 0.5;
            }
            if(enemyDifficulty.stupidity <10){
                enemyDifficulty.stupidity += 0.2;
            }
            console.log(enemyDifficulty.aggression);
        }
    }
    
}

function endTrigger(){
    if (playerOne.x > gameSize.x + 100 && playerOne.moveState === "crash"){
        menuActive = true;
        gameActive = false;
        init();
        console.log("Endgame");
    }
}


function update(){
	gameTime++;
	background.update();
	obstacleGenerator.update();
	obstacleCollision(playerOne,obstacleGenerator.obstacleArray[1]);
	obstacleCollision(playerOne,obstacleGenerator.obstacleArray[2]);
	if(enemyHandler.length === 1){
        obstacleCollision(enemyHandler[0],obstacleGenerator.obstacleArray[0]);
        obstacleCollision(enemyHandler[0],obstacleGenerator.obstacleArray[1]);
    	playerCollision(playerOne,enemyHandler[0]);
        if (enemyHandler[0].transitionState === true){enemyHandler[0].transition();} else {enemyHandler[0].update();}
        enemyCharacter.update();
    }
	if (playerOne.transitionState === true){playerOne.transition();} else {playerOne.update();}
	playerCharacter.update();
	scoreHandler();
	endTrigger();
}

function render(){
	ctx.clearRect(0,0,gameSize.x,gameSize.y);
	background.draw();
	obstacleGenerator.drawTop();
	if(enemyHandler.length === 1){
        enemyHandler[0].drawSprite();
	    enemyCharacter.draw();
    }
    obstacleGenerator.drawMiddle();
	playerOne.drawSprite();
	playerCharacter.draw();
	obstacleGenerator.drawBottom();
	scoreBroadcaster(score);
}

//Keypressed helper
var Key = {
      _pressed: {},

      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      SPACE: 32,
      W:87,
      S:83,

      isDown: function(keyCode) {
        return this._pressed[keyCode];
      },

      onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
      },

      onKeyup: function(event) {
        delete this._pressed[event.keyCode];
      }
    };
        
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

//Begin Launch
initGame();
