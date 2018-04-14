//@ts-check
/** @type HTMLCanvasElement */
var canvas = null;
/** @type CanvasRenderingContext2D */
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
    this.x = null;
    this.y = null;
    this.x_speed = null;
    this.y_speed = null;
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
    context.fillStyle = "white";
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