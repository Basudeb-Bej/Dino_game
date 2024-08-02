window.onload = gameloop;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight * .25;
let framecount = 1;
let img = new Image();
img.src = 'allimages.png';
let score = 0;
let highScore = 0;
let lastTimeCalled = 1;
let dt;
let oldgamespeed = 4;
let gameSpeed = 4;
let oldScore = performance.now(); 
let jumpSound = new Audio('Trex sound.mp3');
let gameOverSound = new Audio('Trex game_over sound.mp3');
let gameOverSoundPlayed = false;

function whenClick() {
    if (dino.dead) {
        dino.dead = false;
        reset();
    } else if (!dino.isJump) {
        dino.isJump = true;
        jumpSound.play().catch(err => console.log('Error playing sound:', err));
    }
}

class Dinosaur {
    constructor() {
        this.spriteH = 97;
        this.spriteW = 88;
        this.spriteX = 1853;
        this.spriteY = 0;
        this.spriteNo = 1;
        this.scale = .5;
        this.h = this.spriteH * this.scale;
        this.w = this.spriteW * this.scale;
        this.x = W * .1;
        this.y = H - this.h;
        this.velocity = 0;
        this.isJump = false;
        this.jumpSpeed = -3;
        this.gravity = 3;
        this.jumpHight = H - this.h * 2.5;
        this.running = true;
        this.dead = false;
    }

    update(dt) {
        if (this.running) {
            this.running = false;
            if (this.isJump) {
                this.isJump = false;
                this.velocity = this.jumpSpeed;
            }
        }
        if (this.y < this.jumpHight) {
            this.velocity = this.gravity;
        }
        if (this.y >= H - this.h - 4) {
            this.y = H - this.h - 3;
            this.running = true;
        }
        this.y += this.velocity;
        if (this.running) {
            if (framecount % 10 == 0) {
                this.spriteX += this.spriteW;
                if (this.spriteNo % 2 == 0) {
                    this.spriteX = 1853;
                }
                this.spriteNo++;
            }
        } else {
            this.spriteX = 1678;
        }
    }

    draw() {
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h);
    }
}

const dino = new Dinosaur();

class Cactuses {
    constructor() {
        this.spriteX = 0;
        this.spriteY = 0;
        this.spriteH = 0;
        this.spriteW = 0;
        this.scale = .45;
        this.type = oldgamespeed < 6 ? 'short' : Math.random() > .5 ? 'short' : 'long';
        this.no = oldgamespeed > 6 ? Math.floor(Math.random() * 3 + 1) : Math.floor(Math.random() * 2 + 1);
        if (this.type == 'short') {
            this.spriteX = 443;
            this.spriteH = 75;
            this.spriteW = 35;
        } else {
            this.spriteH = 100;
            this.spriteW = 50;
            this.spriteX = 650;
        }
        if (this.no == 2) {
            this.spriteX += this.spriteW;
            this.spriteW *= 2;
        } else if (this.no == 3) {
            this.spriteX += (this.spriteW * 3);
            this.spriteW *= 3;
        }
        this.h = this.spriteH * this.scale;
        this.w = this.spriteW * this.scale;
        this.x = W;
        this.y = H - this.h + 3;
    }

    update(dt) {
        this.x -= gameSpeed * dt;
    }

    draw() {
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h);
    }

    collision() {
        if (dino.x + dino.w * .25 < this.x + this.w &&
            dino.x + dino.w * .25 + dino.w * .5 > this.x &&
            dino.y + dino.h * .25 < this.y + this.h &&
            dino.y + dino.h * .25 + dino.h * .5 > this.y) {
            dino.dead = true;
        }
    }
}

let cactuses = [];

function canPlaceCactus() {
    for (let bird of birds) {
        if (bird.x > W - 200 && bird.x < W + 200) {
            return false;
        }
    }
    return true;
}
//for distance of the cactus 
function handdlecactuses() {
    if (framecount % 100 == 0 && canPlaceCactus()) {
        cactuses.push(new Cactuses());
        handleGameSpeed();
    }
    if (cactuses[0] && cactuses[0].x <= 0 - cactuses[0].w) {
        cactuses.shift();
    }
}

class Ground {
    constructor() {
        this.spriteH = 38;
        this.spriteW = 2400;
        this.spriteX = 0;
        this.spriteY = 100;
        this.h = this.spriteH * .5;
        this.w = this.spriteW;
        this.x = 0;
        this.y = H - this.h;
    }

    draw() {
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h);
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x + this.w, this.y, this.w, this.h);
    }

    update(dt) {
        this.x -= gameSpeed * dt;
        if (this.x + this.w <= 0) {
            this.x = 0;
        }
    }
}

const ground = new Ground();

class Clouds {
    constructor(x, y) {
        this.spriteH = 40;
        this.spriteW = 100;
        this.spriteX = 160;
        this.spriteY = 0;
        this.h = this.spriteH * .5;
        this.w = this.spriteW * .5;
        this.x = W + x;
        this.y = y;
    }

    update(dt) {
        this.x -= (gameSpeed * .3) * dt;
        if (this.x + this.w < 0) {
            this.x = W;
        }
    }

    draw() {
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h);
    }
}

const cloud1 = new Clouds(30, 30);
const cloud2 = new Clouds(180, 80);
const cloud3 = new Clouds(280, 50);

class Bird {
    constructor() {
        this.spriteH = 75;
        this.spriteW = 90;
        this.spriteX = 260;
        this.spriteY = 0;
        this.h = this.spriteH * .5;
        this.w = this.spriteW * .5;
        this.x = W;
        this.y = H - this.h - 60; 
        this.spriteNo = 1;
    }

    update(dt) {
        this.x -= gameSpeed * dt;

        if (framecount % 10 === 0) {
            this.spriteX += this.spriteW;
            if (this.spriteNo % 2 === 0) {
                this.spriteX = 260;
            }
            this.spriteNo++;
        }
    }

    draw() {
        ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, this.x, this.y, this.w, this.h);
    }

    collision() {
        if (dino.x < this.x + this.w &&
            dino.x + dino.w > this.x &&
            dino.y < this.y + this.h &&
            dino.y + dino.h > this.y) {
            dino.dead = true;
        }
    }
}

let birds = [];

function handdleBirds() {
    if (score >= 100 && framecount % 300 == 0) { 
        birds.push(new Bird());
    }
    if (birds[0] && birds[0].x < 0 - birds[0].w) {
        birds.shift();
    }
}

//game speed 
function handleGameSpeed() {
    if (oldgamespeed >= 3) {
        oldgamespeed = 3;
    } else {
        oldgamespeed += .10;
    }
}

function AddScore() {
    ctx.font = '17px Raleway sans-serif';

    let displayScore = score.toString().padStart(5, '0');
    let displayHighScore = highScore.toString().padStart(5, '0');

    highScore = score > highScore ? score : highScore;

    ctx.fillText('HI  ' + displayHighScore + '  ' + displayScore, W / 2, 20);
}

function gameOver() {
    ctx.drawImage(img, 1290, 25, 390, 30, W / 2 - 390 / 4, H / 2 - 30 / 4, 390 * .5, 30 * .5);
    ctx.drawImage(img, 0, 0, 75, 65, W / 2 - 75 / 4, H / 2 + 65 / 4, 75 * .5, 65 * .5);
    dino.spriteX = 2031;
    dino.draw();
    gameOverSound.play();
}

function reset() {
    cactuses = [];
    birds = [];
    oldgamespeed = 4;
    oldScore = performance.now();
}

function gameloop(timestamp) {
    dt = performance.now() - lastTimeCalled;
    lastTimeCalled = performance.now();

    if (dino.dead) {
        gameOver();
    } else {
        ctx.clearRect(0, 0, W, H);

        score = Math.round((performance.now() - oldScore) / 200);
        gameSpeed = oldgamespeed / dt;

        let obj = [cloud1, cloud2, cloud3, ground, ...cactuses, ...birds, dino];
        for (let i = 0; i < obj.length; i++) {
            obj[i].update(dt);
            obj[i].draw();
            if (obj[i].collision) {
                obj[i].collision();
            }
        }
        handdleBirds();
        handdlecactuses();
        framecount++;
        AddScore();
    }
    requestAnimationFrame(gameloop);
          }
