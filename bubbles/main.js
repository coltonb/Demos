let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

const BUBBLE_COUNT = 50;
const BUBBLE_MAX_SIZE = 50;
const BUBBLE_MIN_SIZE = 15;
const BUBBLE_MAX_LIFT = 55; // Pixels / Sec
const BUBBLE_MIN_LIFT = 15; // Pixels / Sec

const BGCOLORS = ["#3498db", "#9b59b6", "#1abc9c", "#2ecc71"];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {x: 0, y: 0};

let bubbles = [];
let pops = [];

function randomizeBgColor() {
    let randIndex = Math.floor(Math.random() * BGCOLORS.length);
    document.body.style.backgroundColor = BGCOLORS[randIndex];
}

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

function newBubble(x, y) {
    let radius = (Math.random() * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE)) + BUBBLE_MIN_SIZE;
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

function handleCollision(bubble, dt) {
    for (let i = 0; i < bubbles.length; i++) {
        if (checkBubbleCollision(bubble, bubbles[i])) {
            //drawCollision(bubble.x, bubble.y, bubble.radius);
            if (bubble.y < bubbles[i].y) {
                bubble.yspeed -= (BUBBLE_MAX_LIFT / 1.5) * dt;
                //bubble.y -= 5;
            } else {
                bubble.yspeed += (BUBBLE_MAX_LIFT / 1.5) * dt;
                //bubble.y += 5;
            }
            let moveAmt = 5 * dt;
            if (bubble.x < bubbles[i].x) {
                moveAmt = -moveAmt;
            }
            bubble.xspeed += moveAmt;
        }
    }
}

function moveBubble(bubble, dt) {
    bubble.x += bubble.xspeed * dt;
    bubble.y += bubble.yspeed * dt;
    //bubble.xspeed *= 5 * dt;
    bubble.yspeed = Math.max(bubble.yspeed - (-bubble.lift) * dt, bubble.lift);
    //bubble.yspeed = -5;
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
        time: .15
    }
    return pop;
}

function handlePops(dt) {
    for (let i = 0; i < pops.length; i++) {
        pops[i].time -= dt
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

randomizeBgColor();
generateBubbles();

let lt = Date.now();

(function renderFrame() {
    requestAnimationFrame(renderFrame);
    let t = Date.now();
    let dt = (t - lt) * 0.001;
    lt = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveBubbles(dt);
    handlePops(dt);
    drawBubbles();
    drawPops();
    drawText();
}());