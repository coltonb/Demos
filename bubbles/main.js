let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

const BUBBLE_COUNT = 50;
const BUBBLE_MAX_SIZE = 50;
const BUBBLE_MIN_SIZE = 15;
const BUBBLE_MAX_LIFT = 55; // Pixels / Sec
const BUBBLE_MIN_LIFT = 15; // Pixels / Sec

const MAX_DT = 1;

const BGCOLORS = ["#3498db", "#9b59b6", "#1abc9c", "#2ecc71"];
const FGCOLORS = ["#8bdeff", "#E59EFF", "#6AF7D4", "#81FFB1"];

let currColor = Math.floor(Math.random() * BGCOLORS.length);
document.body.style.backgroundColor = BGCOLORS[currColor];

function resizeCanvas() {
    let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    canvas.width = width;
    canvas.height = height;
}

let mouse = {x: 0, y: 0};

let bubbles = [];
let pops = [];

let pseudoBubble = null;

function drawText() {
    ctx.globalCompositeOperation = 'xor';
    ctx.font = "bold 20pt sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = 'white';
    ctx.fillText("Bubbles", canvas.width / 2, canvas.height / 2);
    ctx.font = "12pt sans-serif";
    ctx.fillText("Try clicking!", canvas.width / 2, canvas.height / 2 + 30);
    ctx.globalCompositeOperation = 'source-over';
}

function newBubble(x, y, radius) {
    if (x === undefined) {
        x = Math.random() * canvas.width;
    }
    if (y === undefined) {
        y = Math.random() * canvas.height;
    }
    if (radius === undefined) {
        radius = (Math.random() * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE)) + BUBBLE_MIN_SIZE;
    }
    let xspeed = 0;
    let yspeed = -(BUBBLE_MAX_LIFT - (BUBBLE_MAX_LIFT - BUBBLE_MIN_LIFT) * radius / BUBBLE_MAX_SIZE);
    let bubble = {
        x: x,
        y: y,
        radius: radius,
        xspeed: xspeed,
        yspeed: yspeed,
        lift: yspeed
    };
    return bubble
}

function generateBubbles() {
    for (let i = 0; i < BUBBLE_COUNT; i++) {
        bubbles.push(newBubble());
    }
}

function drawCollision(x, y, radius, alpha) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = FGCOLORS[currColor];
    ctx.globalAlpha = alpha * 10;
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.closePath();
}

function checkMouseCollision(bubble, mouse) {
    let dx = mouse.x - bubble.x;
    let dy = mouse.y - bubble.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bubble.radius;
}

function getBubbleCollisionFactor(bubble1, bubble2) {
    if (bubble1 === bubble2) {
        return 0;
    }
    let dx = bubble2.x - bubble1.x;
    let dy = bubble2.y - bubble1.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return (bubble1.radius + bubble2.radius - distance) / (bubble1.radius + bubble2.radius);
}

function handleCollision(bubble, dt) {
    for (let i = 0; i < bubbles.length; i++) {
        let collisionFactor = getBubbleCollisionFactor(bubble, bubbles[i]);
        if (collisionFactor > 0) {
            //drawCollision(bubble.x, bubble.y, bubble.radius, collisionFactor);
            if (bubble.y < bubbles[i].y) {
                bubble.yspeed -= collisionFactor * BUBBLE_MAX_LIFT * dt;
            } else {
                bubble.yspeed += collisionFactor * BUBBLE_MAX_LIFT * dt;
            }
            if (bubble.x < bubbles[i].x) {
                bubble.xspeed -= collisionFactor * BUBBLE_MAX_LIFT * dt;;
            } else {
                bubble.xspeed += collisionFactor * BUBBLE_MAX_LIFT * dt;;
            }
        }
    }
}

function moveBubble(bubble, dt) {
    bubble.x += bubble.xspeed * dt;
    bubble.y += bubble.yspeed * dt;
    if (bubble.yspeed < bubble.lift) {
        bubble.yspeed += 5 * dt;
    } else {
        bubble.yspeed -= 5 * dt;
    }
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

function moveBubbles(dt) {
    for (let i = 0; i < bubbles.length; i++) {
        moveBubble(bubbles[i], dt);
    }
    for (let i = 0; i < bubbles.length; i++) {
        handleCollision(bubbles[i], dt);
    }
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBubbleOutline(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = FGCOLORS[currColor];
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.closePath();
}

function drawBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
        drawBubbleOutline(bubbles[i]);
    }
    if (pseudoBubble !== null) {
        drawBubbleOutline(pseudoBubble);
    }
    for (let i = 0; i < bubbles.length; i++) {
        drawBubble(bubbles[i]);
    }
    if (pseudoBubble !== null) {
        drawBubble(pseudoBubble);
    }
}

function newPop(bubble) {
    let pop = {
        x: bubble.x,
        y: bubble.y,
        radius: bubble.radius + 5,
        startRadius: bubble.radius + 5,
        width: 10,
        time: .15
    }
    return pop;
}

function handlePops(dt) {
    for (let i = 0; i < pops.length; i++) {
        pops[i].time -= dt;
        pops[i].width = (pops[i].time / .15) * 10;
        pops[i].radius = (1 - pops[i].time / .15) * pops[i].startRadius;
        if (pops[i].time <= 0) {
            pops.splice(i, 1);
        }
    }
}

function drawPop(pop) {
    ctx.beginPath();
    ctx.arc(pop.x, pop.y, pop.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = FGCOLORS[currColor];
    ctx.lineWidth = pop.width;
    ctx.stroke();
    ctx.closePath();
}

function drawPops() {
    for (let i = 0; i < pops.length; i++) {
        drawPop(pops[i]);
    }
}

function handlePseudoBubble(dt) {
    if (pseudoBubble !== null) {
        if (pseudoBubble.radius < BUBBLE_MAX_SIZE) {
            pseudoBubble.timeAlive += dt;
            pseudoBubble.radius = (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE) *
                                  pseudoBubble.timeAlive *
                                  pseudoBubble.timeAlive + BUBBLE_MIN_SIZE;
        } else {
            bubbles.push(newBubble(pseudoBubble.x, pseudoBubble.y, pseudoBubble.radius));
            pseudoBubble = null;
        }
    }
}

// Event listeners
function updateMousePos(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    if (pseudoBubble !== null) {
        pseudoBubble.x = mouse.x;
        pseudoBubble.y = mouse.y;
    }
}

function mouseDown() {
    let bubbleClicked = false;
    for (let i = 0; i < bubbles.length && !bubbleClicked; i++) {
        if (checkMouseCollision(bubbles[i], mouse)) {
            pops.push(newPop(bubbles[i]));
            bubbles.splice(i, 1);
            return;
        }
    }
    if (pseudoBubble === null) {
        pseudoBubble = newBubble(mouse.x, mouse.y, BUBBLE_MIN_SIZE);
        pseudoBubble.timeAlive = 0;
    }
}

function mouseUp() {
    if (pseudoBubble != null) {
        bubbles.push(newBubble(pseudoBubble.x, pseudoBubble.y, pseudoBubble.radius));
        pseudoBubble = null;
    }
}

function touchStart(e) {
    let touch = e.targetTouches[0];
    let info = {pageX: touch.pageX, pageY: touch.pageY};
    updateMousePos(info);
    mouseDown();
}

function touchMove(e) {
    let touch = e.targetTouches[0];
    let info = {pageX: touch.pageX, pageY: touch.pageY};
    updateMousePos(info);
}

function touchEnd(e) {
    mouseUp();
}

if (!/Mobi/.test(navigator.userAgent)) {
    document.body.addEventListener('mousedown', mouseDown, false);
    document.body.addEventListener('mouseup', mouseUp, false);
    document.body.addEventListener('mousemove', updateMousePos, false);
} else {
    document.body.addEventListener('touchstart', touchStart, false);
    document.body.addEventListener('touchend', touchEnd, false);
    document.body.addEventListener('touchmove', touchMove, false);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
generateBubbles();

let lt = Date.now();

(function renderFrame() {
    requestAnimationFrame(renderFrame);
    let t = Date.now();
    let dt = (t - lt) * 0.001;
    dt = Math.min(dt, MAX_DT);
    lt = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveBubbles(dt);
    handlePops(dt);
    handlePseudoBubble(dt);
    drawPops();
    drawBubbles();
    drawText();
}());