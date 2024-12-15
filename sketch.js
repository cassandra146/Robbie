let gameState = 'start'; // 'start', 'playing', 'gameover', 'win'
let player = {
  x: 0,
  y: 0,
  speedX: 0,
  speedY: 0,
  isFlying: false,
  isAlive: true
};

let princess = {
  x: 100,
  y: 100,
  isRescued: false
};

let prince = {
  x: 0,
  y: 100,
  isRescued: false
};

let coins = [];
let monsters = [];
let score = 0;
const numCoins = 35;
const numMonsters = 15;
const gravity = 0.4;
const flapForce = -10;
const CHASE_DISTANCE = 200; // Distance from royals where monsters start chasing player
const NORMAL_SPEED = 3;
const CHASE_SPEED = 5; // Speed when chasing player

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Set player's starting position
  player.x = width/2;
  player.y = height - 100;
  
  // Set prince position on right side
  prince.x = width - 100;
  
  // Create coins
  for (let i = 0; i < numCoins; i++) {
    coins.push({
      x: random(width),
      y: random(height/2),
      size: 15,
      isCollected: false
    });
  }
  
  // Create monsters
  for (let i = 0; i < numMonsters; i++) {
    monsters.push({
      x: random(width),
      y: random(height),
      speedX: random(-NORMAL_SPEED, NORMAL_SPEED),
      speedY: random(-NORMAL_SPEED, NORMAL_SPEED),
      size: 30,
      isChasing: false
    });
  }
}

function updateMonsterBehavior(monster) {
  // Check if player is near either royal
  let playerToPrincess = !princess.isRescued ? 
    dist(player.x, player.y, princess.x, princess.y) : Infinity;
  let playerToPrince = !prince.isRescued ? 
    dist(player.x, player.y, prince.x, prince.y) : Infinity;
  
  // If player is near either royal, chase the player
  if (playerToPrincess < CHASE_DISTANCE || playerToPrince < CHASE_DISTANCE) {
    monster.isChasing = true;
    
    // Calculate direction to player
    let angle = atan2(player.y - monster.y, player.x - monster.x);
    
    // Update monster speeds to chase player
    monster.speedX = cos(angle) * CHASE_SPEED;
    monster.speedY = sin(angle) * CHASE_SPEED;
  } else {
    // Return to normal wandering behavior
    monster.isChasing = false;
    if (random(1) < 0.02) { // Occasionally change direction
      monster.speedX = random(-NORMAL_SPEED, NORMAL_SPEED);
      monster.speedY = random(-NORMAL_SPEED, NORMAL_SPEED);
    }
  }
}

function keyPressed() {
  if (keyCode === 32 && player.isAlive) {
    player.speedY = flapForce;
    player.isFlying = true;
    setTimeout(() => {
      player.isFlying = false;
    }, 100);
  }
}

function draw() {
  background(0, 150, 255);
  
  if (player.isAlive) {
    // Player movement code remains the same
    if (keyIsDown(LEFT_ARROW)) {
      player.speedX -= 0.5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      player.speedX += 0.5;
    }
    
    player.speedY += gravity;
    player.speedX *= 0.98;
    player.speedY *= 0.98;
    
    player.x += player.speedX;
    player.y += player.speedY;
    
    player.x = constrain(player.x, 0, width);
    player.y = constrain(player.y, 0, height);
    
    if (player.y >= height - 50) {
      player.y = height - 50;
      player.speedY = 0;
    }
    
    // Check coin collection
    for (let coin of coins) {
      if (!coin.isCollected && dist(player.x, player.y, coin.x, coin.y) < 30) {
        coin.isCollected = true;
        score += 10;
      }
    }
    
    // Check princess rescue
    if (!princess.isRescued && dist(player.x, player.y, princess.x, princess.y) < 30) {
      princess.isRescued = true;
      score += 50;
    }
    
    // Check prince rescue
    if (!prince.isRescued && dist(player.x, player.y, prince.x, prince.y) < 30) {
      prince.isRescued = true;
      score += 50;
    }
    
    // Update and check monster collision
    for (let monster of monsters) {
      updateMonsterBehavior(monster);
      
      if (dist(player.x, player.y, monster.x, monster.y) < 25) {
        player.isAlive = false;
      }
      
      monster.x += monster.speedX;
      monster.y += monster.speedY;
      
      // Bounce off walls
      if (monster.x < 0 || monster.x > width) monster.speedX *= -1;
      if (monster.y < 0 || monster.y > height) monster.speedY *= -1;
    }
  }
  
  // Draw coins
  for (let coin of coins) {
    if (!coin.isCollected) {
      fill(255, 215, 0);
      circle(coin.x, coin.y, coin.size);
    }
  }
  
  // Draw princess if not rescued
  if (!princess.isRescued) {
    push();
    translate(princess.x, princess.y);
    fill(255, 192, 203);
    triangle(-15, 0, 0, -30, 15, 0);
    fill(255, 220, 177);
    circle(0, -35, 20);
    fill(255, 215, 0);
    triangle(-10, -45, 0, -55, 10, -45);
    pop();
  }
  
  // Draw prince if not rescued
  if (!prince.isRescued) {
    push();
    translate(prince.x, prince.y);
    fill(0, 0, 255);
    rect(-15, -30, 30, 30);
    fill(255, 220, 177);
    circle(0, -35, 20);
    fill(255, 215, 0);
    triangle(-10, -45, 0, -55, 10, -45);
    pop();
  }
  
  // Draw monsters
  for (let monster of monsters) {
    // Change monster color based on chase state
    if (monster.isChasing) {
      fill(255, 0, 0); // Bright red when chasing
    } else {
      fill(200, 0, 0); // Darker red when wandering
    }
    
    circle(monster.x, monster.y, monster.size);
    fill(0);
    circle(monster.x - 5, monster.y - 5, 5);
    circle(monster.x + 5, monster.y - 5, 5);
  }
  
  // Draw player
  if (player.isAlive) {
    push();
    translate(player.x, player.y);
    stroke(255);
    strokeWeight(2);
    line(0, 0, 0, 30);
    if (player.isFlying) {
      line(-15, 5, 15, 5);
    } else {
      line(-15, 15, 15, 15);
    }
    line(-10, 45, 0, 30);
    line(10, 45, 0, 30);
    noFill();
    circle(0, 0, 20);
    pop();
  }
  
  // Display score
  fill(255);
  textSize(24);
  text('Score: ' + score, 20, 30);
  
  // Check win conditions
  let allCoinsCollected = coins.every(coin => coin.isCollected);
  if (allCoinsCollected || princess.isRescued || prince.isRescued) {
    textSize(32);
    textAlign(CENTER);
    fill(255);
    text('YOU WIN!', width/2, height/2);
    if (princess.isRescued) text('Princess Rescued!', width/2, height/2 + 40);
    if (prince.isRescued) text('Prince Rescued!', width/2, height/2 + 40);
    if (allCoinsCollected) text('All Coins Collected!', width/2, height/2 + 40);
    noLoop();
  }
  
  // Game over screen
  if (!player.isAlive) {
    textSize(32);
    textAlign(CENTER);
    fill(255);
    text('GAME OVER', width/2, height/2);
    text('Score: ' + score, width/2, height/2 + 40);
    noLoop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
