const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameInterval;
let keys = {};
let score = 0;
let currentLevel = 1;
const maxLevel = 3;

// Load assets
const playerImage = new Image();
playerImage.src = 'assets/mf_doom_sprite.png';  // Replace with actual path to the sprite image

const enemyImage = new Image();
enemyImage.src = 'assets/enemy_sprite.png';  // Replace with actual path to the sprite image

const bgImages = [
    new Image(),
    new Image(),
    new Image()
];
bgImages[0].src = 'assets/background1.png';  // Replace with actual path to the background image
bgImages[1].src = 'assets/background2.png';  // Replace with actual path to the background image
bgImages[2].src = 'assets/background3.png';  // Replace with actual path to the background image

const punchSound = new Audio('assets/punch.mp3');  // Replace with actual path to punch sound
const bgMusic = new Audio('assets/bg_music.mp3');  // Replace with actual path to background music

bgMusic.loop = true;
bgMusic.play();

class Sprite {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Player extends Sprite {
    constructor(x, y, width, height, image) {
        super(x, y, width, height, image);
        this.speed = 5;
        this.health = 100;
    }

    move() {
        if (keys['ArrowLeft'] || keys['left']) this.x -= this.speed;
        if (keys['ArrowRight'] || keys['right']) this.x += this.speed;
        if (keys['ArrowUp'] || keys['up']) this.y -= this.speed;
        if (keys['ArrowDown'] || keys['down']) this.y += this.speed;
    }
}

class Enemy extends Sprite {
    constructor(x, y, width, height, image) {
        super(x, y, width, height, image);
        this.speed = 2;
        this.health = 50;
    }

    moveToward(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
}

const player = new Player(50, 50, 50, 50, playerImage);
const enemies = [
    new Enemy(700, 100, 50, 50, enemyImage),
    new Enemy(600, 400, 50, 50, enemyImage),
];

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Health: ${player.health}`, 10, 50);
    ctx.fillText(`Level: ${currentLevel}`, 10, 80);

    // Draw health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 90, player.health, 10);
}

function detectCollisions() {
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            // Collision detected
            player.health -= 1;
            enemy.health -= 1;
            if (enemy.health <= 0) {
                enemies.splice(index, 1);
                score += 10;
            }
        }
    });
}

function gameLoop() {
    ctx.drawImage(bgImages[currentLevel - 1], 0, 0, canvas.width, canvas.height);
    player.move();
    player.draw();
    enemies.forEach(enemy => {
        enemy.moveToward(player);
        enemy.draw();
    });
    detectCollisions();
    drawUI();

    if (player.health <= 0) {
        clearInterval(gameInterval);
        alert('Game Over!');
    }

    if (enemies.length === 0) {
        currentLevel++;
        if (currentLevel > maxLevel) {
            clearInterval(gameInterval);
            alert('You Win!');
        } else {
            alert(`Level ${currentLevel}`);
            // Add new enemies for the next level
            for (let i = 0; i < currentLevel; i++) {
                enemies.push(new Enemy(700 - (i * 100), 100 + (i * 100), 50, 50, enemyImage));
            }
        }
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') punchSound.play();  // Play punch sound on space bar press
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

const touchControls = {
    'left': document.getElementById('left'),
    'right': document.getElementById('right'),
    'up': document.getElementById('up'),
    'down': document.getElementById('down'),
    'action': document.getElementById('action')
};

for (let key in touchControls) {
    touchControls[key].addEventListener('touchstart', () => {
        keys[key] = true;
        if (key === 'action') punchSound.play();  // Play punch sound on action button press
    });
    touchControls[key].addEventListener('touchend', () => keys[key] = false);
}

function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60);
}

startGame();
