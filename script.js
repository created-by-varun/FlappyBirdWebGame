const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const images = ['assets/background-day.png', 'assets/background-night.png', 'assets/yellowbird-upflap.png', 'assets/yellowbird-upflap-up.png', 'assets/yellowbird-midflap.png', 'assets/yellowbird-midflap-up.png', 'assets/yellowbird-upflap-down.png', 'assets/yellowbird-downflap.png', 'assets/yellowbird-downflap-up.png','assets/pipe-green-top.png', 'assets/pipe-green.png', 'assets/base.png', 'assets/0.png', 'assets/1.png', 'assets/2.png', 'assets/3.png', 'assets/4.png', 'assets/5.png', 'assets/6.png', 'assets/7.png', 'assets/8.png', 'assets/9.png', 'assets/gameover.png'];

const sounds = {
    fly: new Audio('sounds/fly.mp3'),
    score: new Audio('sounds/score.mp3')
};

const backgroundImgs = ['assets/background-day.png', 'assets/background-night.png'];
const birdImgsUp = ['assets/yellowbird-upflap-up.png', 'assets/yellowbird-midflap-up.png', 'assets/yellowbird-downflap-up.png'];
const birdImgsDown = ['assets/yellowbird-midflap-down.png'];
const birdImgsStraight = ['assets/yellowbird-upflap.png', 'assets/yellowbird-midflap.png', 'assets/yellowbird-downflap.png'];
let birdImgs = birdImgsStraight;

const loadedImages = {};
const promiseArray = images.map((imgurl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            loadedImages[imgurl] = img;
            resolve();
        };
        img.src = imgurl;
    });
});

Promise.all(promiseArray)
    .then(imgAssign)
    .then(drawSprites);

let background, pipeTop, pipeBottom, bird, base, score, gameOver, flapCount = 0;

function imgAssign() {
    background = loadedImages['assets/background-day.png'];
    pipeTop = loadedImages['assets/pipe-green-top.png'];
    pipeBottom = loadedImages['assets/pipe-green.png'];
    base = loadedImages['assets/base.png'];
    score = loadedImages['assets/0.png'];
    gameOver = loadedImages['assets/gameover.png'];
    bird = loadedImages['assets/yellowbird-upflap.png'];

    canvas.width = background.width;
    canvas.height = background.height;

    bird.flap = () => {
        bird.src = birdImgs[flapCount++ % birdImgs.length];
    }
    setInterval(bird.flap, 100)

    bird.posX = 130;
    bird.posY = 150;
    score.count = 0;
    gameOver.status = false;
}

let timeoutBirdStraight;
let timeoutBirdDown;
let timeoutGravity;

timeoutBirdStraight = setTimeout(() => {
    birdImgs = birdImgsStraight;
    timeoutBirdDown = setTimeout(() => {
        birdImgs = birdImgsDown;
    }, 300);
}, 300);


const gap = 90;
let gravity = 2.5;
const pipes = [];
pipes[0] = {
    posX: canvas.width,
    posY: -78
};

function drawSprites() {
    ctx.drawImage(background, 0, 0);
    pipes.forEach((pipe) => {
        ctx.drawImage(pipeTop, pipe.posX, pipe.posY);
        ctx.drawImage(pipeBottom, pipe.posX, pipeTop.height + pipe.posY + gap);
        pipe.posX--;
        if (pipe.posX === 75) {
            pipes.push({
                posX: canvas.width,
                posY: Math.floor(Math.random() * pipeTop.height) - pipeTop.height
            });
        }
        if (bird.posX + bird.width >= pipe.posX && bird.posX <= pipe.posX + pipeTop.width && (bird.posY <= pipe.posY + pipeTop.height || bird.posY + bird.height >= pipeTop.height + pipe.posY + gap) || bird.posY + bird.height >= background.height - base.height) {
            gameOver.status = true;
        }
        if (pipe.posX === 130) {
            sounds.score.play();
            score.count++;
        }
    });

    ctx.drawImage(base, 0, background.height - base.height);
    ctx.drawImage(bird, bird.posX, bird.posY);
    score.count.toString().split('').forEach((num, i) => {
        score.src = `assets/${num}.png`;
        ctx.drawImage(score, 120 + (i*25), 50);
    });
    if (gameOver.status) {
        ctx.fillStyle ="#fff";
        ctx.font = "22px flappy_birdregular";
        ctx.fillText("Press any key to restart.", 55, 260);
        return ctx.drawImage(gameOver, 50, 180);
    }
    
    bird.posY += gravity;
    window.requestAnimationFrame(drawSprites);
}

const keyPressResponse = e => {
    clearTimeout(timeoutBirdStraight);
    clearTimeout(timeoutBirdDown);
    clearTimeout(timeoutGravity);
    gravity = -4;
    sounds.fly.play();
    birdImgs = birdImgsUp;
    if (gameOver.status) {
        window.location.reload();
    }
};

const keyReleaseResponse = e => {
    timeoutGravity = setTimeout(() => {
        gravity = 2.5;
    }, 100);
    timeoutBirdStraight = setTimeout(() => {
        birdImgs = birdImgsStraight;
        timeoutBirdDown = setTimeout(() => {
            birdImgs = birdImgsDown;
        }, 300);
    }, 300);
};

document.addEventListener('keydown', keyPressResponse);
document.addEventListener('keyup', keyReleaseResponse);
document.addEventListener('touchstart', keyPressResponse);
document.addEventListener('touchend', keyReleaseResponse);

