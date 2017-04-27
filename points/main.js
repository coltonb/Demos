var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var widthSlider = document.getElementById('width');
var maxSlider = document.getElementById('max');

var LINE_WIDTH = 1;
var MAX_DIST = 100;

widthSlider.value = LINE_WIDTH;
maxSlider.value = MAX_DIST;

var points = [];

const POINT_NUM = 100;
const POINT_MAX_SPEED = .005;
const MOUSE_COLOR = '#ffffff';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouseX, mouseY;

// Create POINT_NUM points
for (var i = 0; i < POINT_NUM; i++) {
    points.push([Math.random()*canvas.width, Math.random()*canvas.height,
                 Math.random()*POINT_MAX_SPEED*2 - POINT_MAX_SPEED,
                 Math.random()*POINT_MAX_SPEED*2 - POINT_MAX_SPEED]);
}

// Draws lines from point to point and moves the points as well
function drawLines() {
    ctx.lineWidth = LINE_WIDTH;
    for (var i = 0; i < points.length; i++) {
        for (var x = i; x < points.length; x++) {
            ctx.strokeStyle = 'hsl('+points[i][0]+', 100%, 50%)';
            drawLine(points[i], points[x]);

            points[i][0] += points[i][2];

            if (points[i][0] > canvas.width) points[i][0] = 0;
            else if (points[i][0] < 0)            points[i][0] = canvas.width;

            points[i][1] += points[i][3];

            if (points[i][1] > canvas.height) points[i][1] = 0;
            else if (points[i][1] < 0)        points[i][1] = canvas.height;
        }
    }
}

// Draws lines to mouse
function drawToMouse() {
    for (var i = 0; i < points.length; i++) {
        ctx.strokeStyle = MOUSE_COLOR;
        drawLine(points[i], [mouseX, mouseY]);
    }
}

// Generic draw line function
function drawLine(posA, posB) {
        var dist =  Math.sqrt(Math.pow(posA[0] - posB[0], 2) +
                              Math.pow(posA[1] - posB[1], 2));
        if (dist > MAX_DIST)
            return;
        ctx.globalAlpha = (MAX_DIST - dist) / MAX_DIST;
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
    canvas.hight = window.innerHeight;
});

widthSlider.addEventListener('input', function(){
    LINE_WIDTH = widthSlider.value;
});

maxSlider.addEventListener('input', function(){
    MAX_DIST = maxSlider.value;
});

(function renderFrame() {
    requestAnimationFrame(renderFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawToMouse();
}());
