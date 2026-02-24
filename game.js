const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 350;
canvas.height = 600;

// Images
const spermImg = new Image();
spermImg.src = "IMG_20260224_190818.jpg";

const gateTop = new Image();
gateTop.src = "IMG_20260224_190516.jpg";

const gateBottom = new Image();
gateBottom.src = "IMG_20260224_190527.jpg";

const bg = new Image();
bg.src = "assets/background.png";

// Sperm object
let sperm = {
    x: 80,
    y: 200,
    radius: 16, // bigger sperm
    gravity: 0.5,
    lift: -9,
    velocity: 0
};

let walls = [];
let frame = 0;
let babies = 0;
let gameOver = false;

// Background music
const bgMusic = document.getElementById("bgMusic");
let musicStarted = false;
bgMusic.volume = 0.6;

// Victory sound
const victorySound = document.getElementById("victorySound");

// Swim sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSwimSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// Draw sperm
function drawSperm() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(sperm.x, sperm.y, sperm.radius, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(sperm.x - sperm.radius, sperm.y);
    ctx.lineTo(sperm.x - 40, sperm.y + Math.sin(frame * 0.3) * 10);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Update sperm
function updateSperm() {
    sperm.velocity += sperm.gravity;
    sperm.y += sperm.velocity;

    if (sperm.y + sperm.radius > canvas.height || sperm.y - sperm.radius < 0) {
        endGame();
    }
}

// Create wall
function createWall() {
    let gap = 140;
    let topHeight = Math.random() * 250 + 50;

    walls.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        width: 60
    });
}

// Draw walls as gates
function drawWalls() {
    walls.forEach(wall => {
        // Brown color for gate
        ctx.fillStyle = "#8B4513";

        // Top gate
        ctx.fillRect(wall.x, 0, wall.width, wall.top);
        // Bottom gate
        ctx.fillRect(wall.x, wall.bottom, wall.width, canvas.height - wall.bottom);

        // Optional labels
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("MAIN GATE", wall.x + wall.width / 2, wall.top - 10);
        ctx.fillText("MAIN GATE", wall.x + wall.width / 2, wall.bottom + 20);

        // Move walls
        wall.x -= 2;

        // Collision
        if (
            sperm.x + sperm.radius > wall.x &&
            sperm.x - sperm.radius < wall.x + wall.width &&
            (sperm.y - sperm.radius < wall.top || sperm.y + sperm.radius > wall.bottom)
        ) {
            endGame();
        }

        // Score
        if (wall.x + wall.width === sperm.x) {
            babies++;
            document.getElementById("score").innerText = "Babies: " + babies;

            // Play victory sound at final score (e.g., 10 babies)
            if (babies % 10 === 0) {
                victorySound.currentTime = 0;
                victorySound.play();
            }
        }
    });

    // Remove off-screen walls
    walls = walls.filter(wall => wall.x + wall.width > 0);
}

// Swim on tap
function swim() {
    sperm.velocity = sperm.lift;

    // Start music once
    if (!musicStarted) {
        bgMusic.play();
        musicStarted = true;
    }

    playSwimSound();
}

// End game
function endGame() {
    gameOver = true;

    // Stop background music
    bgMusic.pause();
    bgMusic.currentTime = 0;

    // Play final victory sound
    victorySound.currentTime = 0;
    victorySound.play();

    setTimeout(() => {
        alert("Journey ended! Total babies: " + babies);
        location.reload();
    }, 200);
}

// Main game loop
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateSperm();
    drawSperm();

    if (frame % 100 === 0) {
        createWall();
    }

    drawWalls();

    frame++;
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("click", swim);
document.addEventListener("touchstart", swim);

gameLoop();
