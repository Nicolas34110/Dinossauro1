// ==> 0) Criar um sol 
// ==> 1) Ajustar posições dos objetos de acordo com tamanho da tela
// ==> 2) Saltar Trex e reiniciar com toque na tela

var PLAY = 1;
var END = 0;
var score=0;
var gameState = PLAY;
var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;
var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4;
var backgroundImg;
var jumpSound, collidedSound;
var gameOver, restart;

function preload(){
  //jumpSound = loadSound("sounds/jump.wav")
  //collidedSound = loadSound("sounds/collided.wav")
  backgroundImg = loadImage("backgroundImg.png")
  trex_running = loadAnimation("trex_2.png","trex_1.png","trex_3.png");
  trex_collided = loadAnimation("trex_collided.png");
  groundImage = loadImage("ground.png");
  cloudImage = loadImage("cloud.png");
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");
  //==> 0) Adiciona imagem do sol
  sunAnimation = loadImage("sun.png");
}

function setup() {
  // ==> 1) Ajusta largura (windowWidth) e altura (windowHeight) para tamanho do dispositivo
  //createCanvas(600,200);
  createCanvas(windowWidth,windowHeight);

  // ==> 0) cria sol no eixo X com largura da tela-50
  sun = createSprite(width-50,30,10,10);
  sun.addAnimation("sun", sunAnimation);
  sun.scale = 0.1

  // ==> 1) cria Trex no eixo Y com altura da tela-70
  trex = createSprite(50,height-70,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.setCollider('circle',0,0,350)
  trex.scale = 0.08
    
  // ==> 1) cria chão invisível no eixo X com largura da tela/2, no eixo Y com altura da tela-10 e largura da tela
  //invisibleGround = createSprite(200,190,400,10);
  invisibleGround = createSprite(width/2,height-10,width,125);  
  invisibleGround.shapeColor = "#f4cbaa";
  // invisibleGround.visible = false

  // ==> 1) cria chão no eixo X com largura da tela/2, no eixo Y com altura da tela e largura da tela
  ground = createSprite(width/2,height,width,2);
  ground.addImage("ground",groundImage);
  ground.x = width/2
  ground.velocityX = -(6 + 3*score/100);
  
  // ==> 1) cria Fim de Jogo no eixo X com largura da tela/2, no eixo Y com altura da tela/2
  gameOver = createSprite(width/2,height/2- 50);
  gameOver.addImage(gameOverImg);

  // ==> 1) cria Reinício no eixo X com largura da tela/2, no eixo Y com altura da tela/2
  restart = createSprite(width/2,height/2);
  restart.addImage(restartImg);  
  gameOver.scale = 0.5;
  gameOver.visible = false;
  restart.scale = 0.1;
  restart.visible = false;
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  score = 0;
}

function draw() {
  //trex.debug = true;
  background(backgroundImg);
  textSize(20);
  fill("black");
  text("Score: "+ score,30,50);
  
  if (gameState===PLAY){
    score = score + Math.round(getFrameRate()/60);
    ground.velocityX = -(6 + 3*score/100);

    // ==> 2) Trex salta se "touches" > 0 (coordenadas do ponto de toque na tela do celular) 
    // ==> 2) Matriz touches com "length" (tamanho) > 0 = tela foi tocada
    if ((touches.length > 0 || keyDown("SPACE")) && trex.y >= height-120) {
      //jumpSound.play( );
      trex.velocityY = -10;
      touches = [];             // ==> Zera "touches" (esvazia array)
    }
    
    trex.velocityY = trex.velocityY + 0.8
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    trex.collide(invisibleGround);
    spawnClouds();
    spawnObstacles();
    if(obstaclesGroup.isTouching(trex)) {
        //collidedSound.play()
        gameState = END;
    }
  }
  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;  
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
    trex.changeAnimation("collided",trex_collided);
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
    if(mousePressedOver(restart)) {
      reset();
    }

    // ==> 2) Reinicia jogo se teclou espaço ou "touches" > 0 (coordenadas do ponto de toque na tela do celular) 
    if (touches.length > 0 || keyDown("SPACE")) {      
      reset();                   // ==> Chama função de reinício do jogo
      touches = [];              // ==> Zera "touches" (esvazia array)
    }
  }
  
  drawSprites();
}

function spawnClouds() {
  if (frameCount % 60 === 0) {

    // ==> 1) cria Nuvens: X = largura da tela+20, Y = altura da tela-300  height-500
    var cloud = createSprite(width+20,height-350,40,10);
    console.log ("height:" + height);
    cloud.y = Math.round(random(200,350));
    cloud.y = height - cloud.y;
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    cloud.lifetime = 300;
    cloud.depth = trex.depth;
    trex.depth = trex.depth+1;
    cloudsGroup.add(cloud);
  }  
}

function spawnObstacles() {
  if(frameCount % 60 === 0) {
 
    // ==> 1) cria Obstáculos: X = 600 e Y = altura da tela-95
    var obstacle = createSprite(600,height-95,20,30);
    obstacle.setCollider('circle',0,0,45)
    obstacle.velocityX = -6;   //-(6 + 3*score/100);
    var rand = Math.round(random(1,2));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;        
      default: break;
    }
    obstacle.scale = 0.3;
    obstacle.lifetime = 300;
    obstacle.depth = trex.depth;
    trex.depth +=1;
    obstaclesGroup.add(obstacle);
  }
}

// ==> 2) Função de Reinício de jogo
function reset(){
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;  
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  trex.changeAnimation("running",trex_running);
  score = 0;
}