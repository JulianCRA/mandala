/*jshint esversion: 6 */
const FREEHAND = 0;
const BUCKET = 1;

let mandala;
let cnv;
let currentlyDrawing;
let mode;

function setup(){
    initSketch(32);
}

function initSketch(s){
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("mandala");

    cnv.stroke(170);
    cnv.strokeWeight(2);
    cnv.strokeCap(ROUND);
    cnv.strokeJoin(ROUND);
    
    cnv.mousePressed(pressed);
    cnv.mouseMoved(moved);
    cnv.mouseReleased(released);
    currentlyDrawing = false;
    mode = FREEHAND;

    mandala = new DrawingTool(cnv.width, cnv.height, s);
    image(mandala.canvas, 0, 0);
}

function bucketFill(){
    mandala.bucketPaint(mouseX, mouseY);
    clear();
    image(mandala.canvas, 0, 0);
}

function pressed(){
    switch(mode){
        case FREEHAND:
            currentlyDrawing = true;        
            mandala.addPoint(mouseX, mouseY, currentlyDrawing);
        break;
    }
}

function moved(){
    switch(mode){
        case FREEHAND:
            if(currentlyDrawing){
                mandala.addPoint(mouseX, mouseY);
                mandala.drawCurve(cnv);
            }
        break;
    }
}

function released(){
    switch(mode){
        case FREEHAND:
            currentlyDrawing = false;
            mandala.addPoint(mouseX, mouseY, currentlyDrawing);
            clear();
            image(mandala.canvas, 0, 0);
        break;
        case BUCKET:
            bucketFill();
        break;
    }
}

let ctrl = false;
function keyPressed(){
    if (keyCode == CONTROL){ 
        ctrl = true;
    }
    if(ctrl){
        if (keyCode == 90) {
            undo();
        }
        else if (keyCode == 83) {
            //saveDrawing();
        }
    }
    return false;
}

function keyReleased(){
    if(keyCode == CONTROL){
        ctrl = false;
    }
}

let isMenuActive = false;
function slideToolsMenu(){
    isMenuActive = !isMenuActive;
    if(isMenuActive){
        document.getElementById("controls").style.left = "0px";
        document.getElementById("togglemenubtn").style.background = "url('./img/closebtn.png') center no-repeat";
    }
    else{
        document.getElementById("controls").style.left = "-250px";
        document.getElementById("togglemenubtn").style.background = "url('./img/toolsbtn.png') center no-repeat";
    }
}

function undo(){
    mandala.undo();
    clear();
    image(mandala.canvas, 0, 0);
}

function restart(){
    mandala.restart();
    cnv.clear();
    image(mandala.canvas, 0, 0);
}

function sections(sect){
    mandala.setSections(sect);
    cnv.clear();
    image(mandala.canvas, 0, 0);
}