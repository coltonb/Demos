let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let widthSlider = document.getElementById('width');
let maxSlider = document.getElementById('max');

let s = new Audio('siksample.wav');

let lineWidth = 1;
let maxDist = 100;
let offset = 50;

widthSlider.value = lineWidth;
maxSlider.value = maxDist;

let points = [];

const POINT_NUM = 100;
const POINT_MAX_SPEED = .25;
const MOUSE_COLOR = '#ffffff';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX, mouseY;

// Create POINT_NUM points
for (let i = 0; i < POINT_NUM; i++) {
    points.push([Math.random()*canvas.width, Math.random()*canvas.height,
                 Math.random()*POINT_MAX_SPEED*2 - POINT_MAX_SPEED,
                 Math.random()*POINT_MAX_SPEED*2 - POINT_MAX_SPEED]);
}

// Draws lines from point to point and moves the points as well
function drawLines() {
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < points.length; i++) {
        points[i][0] += points[i][2];
        points[i][1] += points[i][3];
        for (let x = i; x < points.length; x++) {
            ctx.strokeStyle = 'hsl('+(points[i][0] + 180 *
                               (mouseX / screen.width))+', 100%, 50%)';

            drawLine(points[i], points[x]);

            if (points[i][0] > canvas.width) points[i][0] = 0;
            else if (points[i][0] < 0)       points[i][0] = canvas.width;

            if (points[i][1] > canvas.height) points[i][1] = 0;
            else if (points[i][1] < 0)        points[i][1] = canvas.height;
        }
    }
}

// Draws lines to mouse
function drawToMouse() {
    for (let i = 0; i < points.length; i++) {
        ctx.strokeStyle = MOUSE_COLOR;
        drawLine(points[i], [mouseX, mouseY]);
    }
}

// Generic draw line function
function drawLine(posA, posB) {
        let dist =  Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
                              Math.pow(posA[1] - posB[1], 2));
        if (dist > maxDist) return;
        ctx.globalAlpha = (maxDist - dist) / maxDist;
        ctx.beginPath();
        ctx.moveTo(posA[0], posA[1]);
        ctx.lineTo(posB[0], posB[1]);
        ctx.stroke();
}

// Event listeners
document.body.addEventListener('mousemove', function(e){
    mouseX = e.pageX;
    mouseY = e.pageY;
});

// Only works sometimes? May require some hacking to fix
window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

widthSlider.addEventListener('input', function(){
    lineWidth = widthSlider.value;
});

maxSlider.addEventListener('input', function(){
    maxDist = maxSlider.value;
});

(function renderFrame() {
    requestAnimationFrame(renderFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawToMouse();
}());
