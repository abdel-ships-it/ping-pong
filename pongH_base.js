//@ts-check
/** @type HTMLCanvasElement */
var canvas = null;
/** @type CanvasRenderingContext2D */
var context = null;
/** @type Player */
var player = null;
/** @type Computer */
var computer = null;
/** @type Ball */
var ball = null;
var keysDown = {};
var isGoing = false;
var animationId;

/** Represents the configuration of different modes */
var difficultyConfig = {
    easy: {
        ballRadius: 10,
        paddleHeight: 70
    },
    hard: {
        ballRadius: 5,
        paddleHeight: 40
    }
};

/**
 * Step 6 ⚠️
 * Render a message with who has won
 * @param {string} title 
 * @param {string} message 
 */
function renderWinner(title, message) {
    // Stopping the game
    //
    pongStop();

    // Setting the win text
    //

    var winContainer = document.querySelector('.win-container');

    winContainer.querySelector('span').innerText = message;

    winContainer.querySelector('h1').innerText = title;

    // Showing the user feedback on when the game will start
    //
    var secondsToRestart = 5;

    var restartFeedbackEl = winContainer.querySelector('.restarting-in');

    restartFeedbackEl.innerText = `Restarting in ${secondsToRestart}`;

    var restartInterval = setInterval(() => {
        secondsToRestart -= 1;
        restartFeedbackEl.innerText = `Restarting in ${secondsToRestart}`;
    }, 1000);


    // Showing the win container
    // 
    winContainer.removeAttribute('hidden');

    // Starting the game after 5 seconds, and hiding the win container
    //
    setTimeout(() => {
        winContainer.setAttribute('hidden', '');
        pongStart();
        clearInterval(restartInterval);

        restartFeedbackEl.innerText = '';
    }, secondsToRestart * 1000);
}

function pongStart() {
    pongStop();
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    player = new Player();
    computer = new Computer();
    ball = new Ball();
 
    pongRender();
    animationId = setInterval(pongStep, 15);
    isGoing = true;
}
function pongStop() {
    if (isGoing) {
        clearInterval(animationId);
        isGoing = false;
    }
}
function pongStep() {
    pongUpdate();
    pongRender();
}
function pongRender() {
    // Step 2 ⚠️
    // We will pass the canvas dimensions to the image constructor to ensure the image is resized properly
    // 
    var image = new Image(canvas.width, canvas.height);

    image.src = './background.jpg';

    // We want to draw when the image has loaded, we are creating a function here that will be called once the image has loaded
    //
    image.onload = () => {
        // We are ready to draw now
        //
        console.log('image has loaded, drawing...');
        // Setting the filter and blurring the image just slightly
        //
        context.filter = 'blur(4px)';
        // Drawing the image at x = 0 and y = 0
        //
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        // Getting rid of the filter
        // 
        context.filter = 'none';

        // We will render the rest of the things we need to render
        // Its very important this happens in this function as this function will not immediately execute ( because its an asynchronous event )
        // So placing these outside of this function, would render the game elements. And then it would get overrwiten by our image render which is executed later.
        //
        player.render();
        computer.render();
        ball.render();
    }
}
function pongUpdate() {
    player.update();
    computer.update(ball);
    ball.update(computer.paddle, player.paddle);
}
function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.y_speed = 0;
}
Paddle.prototype.render = function () {
    context.fillStyle = "#0000FF";
    context.fillRect(this.x, this.y, this.width, this.height);
};
Paddle.prototype.move = function (deltaX, deltaY) {

    // Step 7 ⚠️
    //
    var centerCrossingCondition = this.x > ((canvas.width - (10 + this.width)) - deltaX)
    var rightSideCrossingCondition = this.x < canvas.width - (canvas.width / 2 - this.width) - deltaX;

    if ( centerCrossingCondition || rightSideCrossingCondition ) {
        return;
    }

    this.x += deltaX;
    this.y += deltaY;
    this.y_speed = deltaY;
    if (this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        this.y_speed = 0;
    }     
};
Paddle.prototype.checkCollision = function (ball) {
    if (ball.x + 5 < this.x ||
        ball.x - 5 > this.x + this.width ||
        ball.y + 5 <= this.y ||
        ball.y - 5 >= this.y + this.height) {
        
        return;

    }
    if (ball.x > this.x + this.width / 2 && ball.x_speed > 0) {
        return;

    }
    if (ball.x < this.x + this.width / 2 && ball.x_speed < 0) {
        return;
    }
    ball.x_speed = -ball.x_speed;
    ball.y_speed += this.y_speed / 3;
    if (ball.y_speed > 6) {
        ball.y_speed = 6;
    } else if (ball.y_speed < -6) {
        ball.y_speed = -6;
    }
};

function Computer() {
    this.paddle = new Paddle(10, canvas.height / 2 - 25, 10, 50);
    this.score = 0;
}
Computer.prototype.render = function () {
    this.paddle.render();
};
Computer.prototype.update = function (ball) {
    var targetYPos = canvas.height / 2;
    if (ball.x_speed < 0) {
        targetYPos = ball.y;
    }
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - targetYPos);
    if (diff < -6) {
        diff = -6;
    } else if (diff > 6) {
        diff = 6;
    }
    this.paddle.move(0, 2 * diff / 3);
};
// Step 3 ️⚠️
//
Computer.prototype.incrementScore = function() {
    this.score++;
    var el = document.getElementById("computer-score");

    el.innerText = this.score.toString();

    el.classList.add('bounce');

    setTimeout(() => {
        el.classList.remove('bounce');
    }, 300);

    if ( this.score === 5 ) {
        renderWinner('game over', 'Computer has won 😣😣😣');
    }
}
function Player() {
    this.paddle = new Paddle(canvas.width - 20, canvas.height / 2 - 25, 10, difficultyConfig.easy.paddleHeight);
    this.score = 0;
}

Player.prototype.render = function () {
    this.paddle.render();
};
Player.prototype.update = function () {
    this.paddle.move(0, 0);
    for (var value in keysDown) {
        if (value === "ArrowUp") {
            this.paddle.move(0, -4);
        } 
        if (value === "ArrowDown") {
            this.paddle.move(0, 4);
        }
        if (value === "ArrowRight") {
            this.paddle.move(4, 0);
        }
        if (value === "ArrowLeft") {
            this.paddle.move(-4, 0);
        }
    }
};
// Step 3 ️⚠️
//
Player.prototype.incrementScore = function() {
    this.score++;
    var el = document.getElementById("player-score");

    el.innerText = this.score.toString();

    el.classList.add('bounce');

    setTimeout(() => {
        el.classList.remove('bounce');
    }, 300);

    if ( this.score === 5 ) {
        renderWinner('winner', 'You have won 🎉🎉🎉');
    }
}

/**
 * Step 4 ⚠️
 * Updates the difficulty on the player by modifying the paddle size
 * @param {number} difficulty either 0 or 1, where 0 is easy and 1 is hard
 */
Player.prototype.updatePaddle = function (difficulty) {
    if ( difficulty === 0 ) {
        this.paddle = new Paddle(canvas.width - 20, canvas.height / 2 - 25, 10, difficultyConfig.easy.paddleHeight);
    }
    
    if ( difficulty === 1 ) {
        this.paddle = new Paddle(canvas.width - 20, canvas.height / 2 - 25, 10, difficultyConfig.hard.paddleHeight);
    }
}

function Ball() {
    this.x = null;
    this.y = null;
    this.x_speed = null;
    this.y_speed = null;
    this.radius = difficultyConfig.easy.ballRadius;
    this.reset();
}
Ball.prototype.reset = function () {
    this.x = canvas.width / 2 + 10;
    this.y = canvas.height / 2;
    this.x_speed = 3;
    this.y_speed = 0;
};
Ball.prototype.render = function () {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, 0);
    context.fillStyle = "white";
    context.fill();
};
Ball.prototype.update = function (computerPaddle, playerPaddle) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    // Step 3 ️⚠️
    //
    if (this.x < 0 || this.x > canvas.width) {
        // Means the ball exitted the canvas through the left side
        // Player scored !
        //
        if (this.x < 0) {
            player.incrementScore();
        }

        // Means the ball exitted the canvas through the right side
        // Computer scored!
        //
        if (this.x > canvas.width) {
            computer.incrementScore();
        }

        this.reset();
        return;
    }
    

    if (this.y - 5 < 0) {
        this.y = 5;
        if (this.y_speed < 0) {
            this.y_speed = -this.y_speed;

        }
    } else if (this.y + 5 > canvas.height) {
        this.y = canvas.height - 5;
        if (this.y_speed > 0) {
            this.y_speed = -this.y_speed;
        }
    }
    if (this.x < canvas.width / 2) {
        computerPaddle.checkCollision(this);
    } else {
        playerPaddle.checkCollision(this);
    }
};

/**
 * Step 5 ⚠️
 * Updates the difficulty by modifying the radius
 * @param {number} difficulty either 0 or 1, where 0 is easy and 1 is hard
 */
Ball.prototype.updateRadius = function (difficulty) {
    if (difficulty === 0) { 
        this.radius = difficultyConfig.easy.ballRadius;
    }
    if (difficulty === 1) {
        this.radius = difficultyConfig.hard.ballRadius; 
    }
}

window.addEventListener("keydown", function (event) {
    keysDown[event.key] = true;
});
window.addEventListener("keyup", function (event) {
    if ( event.key.toUpperCase() === 'S' ) {
        pongStart();
    }
    delete keysDown[event.key];
    
});

// Step 4 ⚠️
// Listening to the input value changes 
//
document.querySelectorAll('input[name=difficulty]').forEach( function( element ) {
    element.addEventListener('change', function(event) {
        // The difficulty will be either 0 or 1, where 0 is easy and 1 is hard
        //
        var value = Number(this.value);
        player.updatePaddle(value);
        ball.updateRadius(value);
    });

    // We dont want the browser to change values when keydown is pressed
    //
    element.addEventListener('keydown', function(event) {
        event.preventDefault();
    });
});