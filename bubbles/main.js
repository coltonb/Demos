let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

const BUBBLE_COUNT = 50;
const BUBBLE_MAX_SIZE = 50;
const BUBBLE_MIN_SIZE = 15;
const BUBBLE_MAX_SPEED = -1;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {x: 0, y: 0};

let bubbles = [];
let pops = [];

function newBubble(x, y) {
    let radius = (Math.random() * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE)) + BUBBLE_MIN_SIZE;
    let xspeed = 0;
    let yspeed = -Math.random();
    let lift = 1.25 - radius / BUBBLE_MAX_SIZE;
    let bubble = {
        x: x,
        y: y,
        radius: radius,
        xspeed: xspeed,
        yspeed: yspeed,
        lift: lift
    };
    return bubble
}

function generateBubbles() {
    for (let i = 0; i < BUBBLE_COUNT; i++) {
        bubbles.push(newBubble(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function drawCollision(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.closePath();
}

function checkMouseCollision(bubble, mouse) {
    let dx = mouse.x - bubble.x;
    let dy = mouse.y - bubble.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble.radius;
}

function checkBubbleCollision(bubble1, bubble2) {
    if (bubble1 === bubble2) {
        return false;
    }
    let dx = bubble2.x - bubble1.x;
    let dy = bubble2.y - bubble1.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble1.radius + bubble2.radius;
}

function handleCollision(bubble) {
    for (let i = 0; i < bubbles.length; i++) {
        if (checkBubbleCollision(bubble, bubbles[i])) {
            //drawCollision(bubble.x, bubble.y, bubble.radius);
            if (bubble.y < bubbles[i].y) {
                bubble.yspeed -= .01;
            } else {
                bubble.yspeed += .01;
            }
            let moveAmt = .01;
            if (bubble.x < bubbles[i].x) {
                moveAmt = -moveAmt;
            }
            bubble.xspeed += moveAmt;
        }
    }
}

function moveBubble(bubble) {
    bubble.x += bubble.xspeed;
    bubble.y += bubble.yspeed;
    bubble.xspeed /= 1.01;
    bubble.yspeed = Math.min(bubble.yspeed /= 1.01, -bubble.lift);
    if (bubble.x > canvas.width + bubble.radius) {
        bubble.x = -bubble.radius;
    }
    if (bubble.x < -bubble.radius) {
        bubble.x = canvas.width + bubble.radius;
    }
    if (bubble.y > canvas.height + bubble.radius) {
        bubble.y = -bubble.radius;
    }
    if (bubble.y < -bubble.radius) {
        bubble.y = canvas.height + bubble.radius;
    }
}

function moveBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
        moveBubble(bubbles[i]);
    }
    for (let i = 0; i < bubbles.length; i++) {
        handleCollision(bubbles[i]);
    }
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
        drawBubble(bubbles[i]);
    }
}

function newPop(bubble) {
    let pop = {
        x: bubble.x,
        y: bubble.y,
        radius: bubble.radius,
        time: 1
    }
    return pop;
}

function handlePops() {
    for (let i = 0; i < pops.length; i++) {
        pops[i].time -= .1
        if (pops[i].time <= 0) {
            pops.splice(i, 1);
        }
    }
}

function drawPop(pop) {
    ctx.beginPath();
    ctx.arc(pop.x, pop.y, pop.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();
}

function drawPops() {
    for (let i = 0; i < pops.length; i++) {
        drawPop(pops[i]);
    }
}

// Event listeners
document.body.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

document.body.addEventListener('click', function() {
    let bubbleClicked = false;
    for (let i = 0; i < bubbles.length && !bubbleClicked; i++) {
        if (checkMouseCollision(bubbles[i], mouse)) {
            pops.push(newPop(bubbles[i]));
            bubbles.splice(i, 1);
            return;
        }
    }

    bubbles.push(newBubble(mouse.x, mouse.y));
}, false);

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

generateBubbles();

(function renderFrame() {
    requestAnimationFrame(renderFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveBubbles();
    drawBubbles();
    handlePops();
    drawPops();
}());