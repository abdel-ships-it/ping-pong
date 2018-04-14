//@ts-check
/*******
* Game of pong
* modified from https://robots.thoughtbot.com/pong-clone-in-javascript
*/
var canvas = null;
var context = null;
var player = null;
var computer = null;
var ball = null;
var keysDown = {};
var isGoing = false;
var animationId;
function pongStart(canvasId) {
    pongStop();
    canvas = document.getElementById(canvasId);
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
        going = false;
    }
}
function pongStep() {
    pongUpdate();
    pongRender();
}
function pongRender() {
    context.fillStyle = "#FF00FF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.render();
    computer.render();
    ball.render();
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
    this.x += deltaX;
    this.y += deltaY;
    this.y_speed = deltaY;
    if (this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > canvas.height) {
        this.y = canvas.height- this.height;
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
function Player() {
    this.paddle = new Paddle(canvas.width - 20, canvas.height / 2 - 25, 10, 50);
}

Player.prototype.render = function () {
    this.paddle.render();
};
Player.prototype.update = function () {
    this.paddle.move(0, 0);
    for (var key in keysDown) {
        var value = Number(key);
        if (value === 38) {
            this.paddle.move(0, -4);
        } else if (value === 40) {
            this.paddle.move(0, 4);
        }

    }
};
function Ball() {
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
    context.arc(this.x, this.y, 5, 2 * Math.PI, false);
    context.fillStyle = "#000000";
    context.fill();
};
Ball.prototype.update = function (computerPaddle, playerPaddle) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    if (this.x < 0 || this.x > canvas.width) {
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
window.addEventListener("keydown", function (event) {
    keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});