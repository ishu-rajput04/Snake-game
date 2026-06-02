
/* selections of an elements */
const board = document.querySelector('.board')
const startBtn = document.querySelector('.btn-start')
const restartBtn = document.querySelector('.btn-restart')
const modal = document.querySelector('.modal')
const startGameModal = document.querySelector('.start-game')
const gameOverModal = document.querySelector('.game-over')
const highestScoreElement = document.querySelector('#highest-score')
const currentScoreElement = document.querySelector('#score')
const timeElement = document.querySelector('#times')

// sounds
const highScoreSound = new Audio('./sounds/flohigh_score2.mp3');
const gameOverSound = new Audio('./sounds/game-over.mp3');
const foodSound = new Audio('./sounds/eat.mp3');

let intervalId = null;
let timerIntervalId = null;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let time = `00:00`

highestScoreElement.innerText = highScore

/* finding the no. of row and col */
let cols = Math.floor(board.clientWidth / 25)
let rows = Math.floor(board.clientHeight / 25)
console.log(rows, cols);


// show blocks on display

let blocks = [];

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        let block = document.createElement('div');
        block.classList.add('block');
        board.appendChild(block);

        // key value pair : store div in obj
        blocks[`${i}, ${j}`] = block;
    }
}
console.log(blocks);
// food
let food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols)
}

// create snake then, fill it , then => move it 

let snake = [
    { x: 1, y: 5 },
]

let direction = "right";

function render() {

    let head = null;
    if (direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 }
    } else if (direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    } else if (direction === "up") {
        head = { x: snake[0].x - 1, y: snake[0].y }
    } else if (direction === "down") {
        head = { x: snake[0].x + 1, y: snake[0].y }
    }

    //----------------------- game over condition

    // Check for wall collision or self-collision
    const selfCollision = snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols || selfCollision) {
        if (score >= highScore) {

            const popMsg = document.createElement('h1');
            popMsg.innerText = "🏆 NEW HIGH SCORE!";
            popMsg.classList.add('high-score-popup');

            board.appendChild(popMsg);
            highScoreSound.play();
            blast();

            setTimeout(() => {
                popMsg.remove(); // 2 sec baad text hata do
            }, 700);

            setTimeout(() => {
                gameOverSound.play();
                modal.style.display = "flex";
                gameOverModal.style.display = "flex";
                startGameModal.style.display = "none";
            }, 800)
        } else {
            gameOverSound.play();
            modal.style.display = "flex";
            gameOverModal.style.display = "flex";
            startGameModal.style.display = "none";
        }
        clearInterval(intervalId);
        clearInterval(timerIntervalId);
        return;
    }

    // food block
    blocks[`${food.x}, ${food.y}`].classList.add('food');
    // food consume
    if (head.x == food.x && head.y == food.y) {
        foodSound.play();
        blocks[`${food.x}, ${food.y}`].classList.remove('food');
        food = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        }
        blocks[`${food.x}, ${food.y}`].classList.add('food');
        snake.unshift(head)

        // display score 

        score += 10;
        currentScoreElement.innerText = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);

        }
    }


    // remove the prev block
    snake.forEach((elem) => {
        blocks[`${elem.x}, ${elem.y}`].classList.remove("fill")
    });

    snake.unshift(head)
    snake.pop()


    // fill the intial box
    snake.forEach((elem) => {
        blocks[`${elem.x}, ${elem.y}`].classList.add("fill");
    })
}

// add event listener for key press === direction 

addEventListener('keydown', (e) => {
    if (e.key == 'ArrowUp' && direction != "down") {
        direction = "up";
    } else if (e.key == 'ArrowDown' && direction != "up") {
        direction = "down";
    } else if (e.key == 'ArrowRight' && direction != "left") {
        direction = "right";
    } else if (e.key == 'ArrowLeft' && direction != "right") {
        direction = "left";
    }
})

startBtn.addEventListener('click', startGame)

document.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        startGame();
    }
})

function startGame() {
    modal.style.display = "none";
    intervalId = setInterval(() => { render() }, 200);

    timer();
}

// --------------------------------------------------------- restart game ()

restartBtn.addEventListener('click', restartGame);

function restartGame() {
    blocks[`${food.x}, ${food.y}`].classList.remove("food")
    snake.forEach((e) => {
        blocks[`${e.x}, ${e.y}`].classList.remove('fill')
    })
    direction = "right";

    score = 0;
    time = `00:00`;

    currentScoreElement.innerText = score;
    timeElement.innerText = time;
    highestScoreElement.innerText = highScore

    modal.style.display = "none";
    snake = [
        { x: 1, y: 5 },
    ]
    food = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols)
    }
    intervalId = setInterval(() => { render() }, 200);


    timer();
}

function timer() {
    timerIntervalId = setInterval(() => {
        let [min, sec] = time.split(":").map(Number);
        if (sec > 59) {
            min += 1;
            sec = 0;

        } else sec += 1;
        time = `${min}:${sec}`
        timeElement.innerText = time;
    }, 1000)
}

// ----------------- confetti blast
const blast = () => {
    const count = 200,
        defaults = {
            origin: { y: 0.9 },
        };

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            })
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}
