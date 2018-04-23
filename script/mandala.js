/*jshint esversion: 6 */
p5.Graphics.prototype.remove = function() {
    if (this.elt.parentNode) {
      this.elt.parentNode.removeChild(this.elt);
    }
    var idx = this._pInst._elements.indexOf(this);
    if (idx !== -1) {
      this._pInst._elements.splice(idx, 1);
    }
    for (var elt_ev in this._events) {
      this.elt.removeEventListener(elt_ev, this._events[elt_ev]);
    }
};

$(document).ready(function() {
    
    $("#colorpicker").spectrum({
        color: 'white',
        flat: true,
        move: function() {
            previewColor();
        },
        change: function(color){
            setColor(color);
        },
        showPalette: true,
        showSelectionPalette: true,
        maxSelectionSize: 9,
        showButtons: false,
        containerClassName: 'colorp'
    });
    
    $("#colorpicker").on('dragstop.spectrum', function(e, tinycolor) { 
            setColor(tinycolor);
        }
    );
    previewColor();
});

function previewColor(){
    $(".csampler").css("background-color", $("#colorpicker").spectrum("get").toHexString());
    
}
const FREEHAND = 0;
const BUCKET = 1;
const STRAIGHT = 2;

let mandala;
let cnv;
let currentlyDrawing;
let mode;
let ph;

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
    setMode(FREEHAND);
    
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
        case STRAIGHT:
            currentlyDrawing = true;
            mandala.addPoint(mouseX, mouseY, currentlyDrawing);
            mandala.addPoint(mouseX, mouseY);
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
        case STRAIGHT:
            if(currentlyDrawing){
                mandala.addPoint(mouseX, mouseY);
                clear();
                image(mandala.canvas, 0, 0);
                mandala.drawStraightLine(cnv);
            }
        break;
    }
}

function released(){
    switch(mode){
        case FREEHAND:
            currentlyDrawing = false;
            mandala.addPoint(mouseX, mouseY, currentlyDrawing, FREEHAND);
            clear();
            image(mandala.canvas, 0, 0);
        break;
        case BUCKET:
            bucketFill();
        break;
        case STRAIGHT:
            currentlyDrawing = false;
            mandala.addPoint(mouseX, mouseY, currentlyDrawing, STRAIGHT);
            clear();
            image(mandala.canvas, 0, 0);
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
            saveDrawing();
        }
    }
    return false;
}

function keyReleased(){
    if(keyCode == CONTROL){
        ctrl = false;
    }
    else if(keyCode == TAB){
        slideToolsMenu();
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
    $("#colorpicker").spectrum("set", "white");
    previewColor();
    cnv.clear();
    image(mandala.canvas, 0, 0);
}

function sections(sect){
    document.getElementById("sections-label").innerText = sect + " sections";
    mandala.setSections(sect);
    cnv.clear();
    image(mandala.canvas, 0, 0);
}

function showGuides(){
    mandala.toggleShowGuides();
    cnv.clear();
    image(mandala.canvas, 0, 0);
}

function showLines(){
    mandala.linesOnly();
    cnv.clear();
    image(mandala.canvas, 0, 0);
}

function sampleSize(v){
    document.getElementById("correction-label").innerText = v + "% stroke accuracy";
    mandala.sampleSize = v / 100;
}

function setMode(m){
    mode = m;
}

function setColor(c){
    cnv.stroke(color(Math.round(c._r*0.6),Math.round(c._g*0.6),Math.round(c._b*0.6)));
    mandala.currentColor = [Math.round(c._r), Math.round(c._g), Math.round(c._b)];
}

function saveDrawing(){
    save(cnv, "mandala.png");
}