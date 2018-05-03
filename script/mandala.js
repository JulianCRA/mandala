'use strict';
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
    document.getElementById("bot-checkbox").disabled = true;
    document.getElementById("fa-checkbox").disabled = true;

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
        containerClassName: 'colorp',
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

const BUCKET = 0;
const FREEHAND = 1;
const STRAIGHT = 2;

let mandala;
let currentDrawing;
let cnv;
let currentlyDrawing;
let mode;
let saveOptions;

function setup(){
    initSketch(32);
}

function initSketch(s){
    saveOptions = {full:true, bot:false, forcedaliasing:false, ratio:1.0};
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
    
    currentDrawing = createGraphics(windowWidth, windowHeight);
    mandala = new DrawingTool(currentDrawing, s);
    update();
}

function pressed(){
    switch(mode){
        case FREEHAND:
            currentlyDrawing = true;
            mandala.beginCurve(mouseX, mouseY);
        break;
        case STRAIGHT:
            currentlyDrawing = true;
            mandala.beginCurve(mouseX, mouseY);
        break;
    }
}

function moved(){
    switch(mode){
        case FREEHAND:
            if(currentlyDrawing){
                mandala.addVertex(mouseX, mouseY);
                mandala.drawCurve(cnv);
            }
        break;
        case STRAIGHT:
            if(currentlyDrawing){
                mandala.addVertex(mouseX, mouseY);
                update();
                mandala.drawStraightLine(cnv);
            }
        break;
    }
}

function released(){
    switch(mode){
        case FREEHAND:
            currentlyDrawing = false;
            mandala.endCurve(mouseX, mouseY, FREEHAND);
        break;
        case BUCKET:
            bucketFill();
        break;
        case STRAIGHT:
            currentlyDrawing = false;
            mandala.endCurve(mouseX, mouseY, STRAIGHT);
        break;
    }
    update();
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

let isToolsMenuActive = false;
function slideToolsMenu(){
    if(isSaveMenuActive) slideSaveMenu();
    isToolsMenuActive = !isToolsMenuActive;
    
    if(isToolsMenuActive){
        document.getElementById("controls").style.left = "0px";
        document.getElementById("togglemenubtn").style.background = "url('./img/closebtn.png') center no-repeat";
    }
    else{
        document.getElementById("controls").style.left = "-250px";
        document.getElementById("togglemenubtn").style.background = "url('./img/toolsbtn.png') center no-repeat";
    }
    
}

let isSaveMenuActive = false;
function slideSaveMenu(){
    if(isToolsMenuActive) slideToolsMenu();
    isSaveMenuActive = !isSaveMenuActive;
    
    if(isSaveMenuActive){
        document.getElementById("saveconfig").style.left = "0px";
        document.getElementById("togglesavebtn").style.background = "url('./img/closebtn.png') center no-repeat";
    }
    else{
        document.getElementById("saveconfig").style.left = "-250px";
        document.getElementById("togglesavebtn").style.background = "url('./img/savebtn.png') center no-repeat";
    }
    
}

let isPaused = false;

function pause(){
    isPaused = true;
    console.log("PENSANDO...");
}

function unpause(){
    console.log("HAGALE...");
    isPaused = false;
}

function update(){
    clear();
    image(currentDrawing, 0, 0);
    if(isPaused){
        unpause();
    }
}

function bucketFill(){
    mandala.fillArea(mouseX, mouseY);
}

function undo(){
    pause();
    mandala.undo(update);
}

function restart(){
    mandala.restart();
    $("#colorpicker").spectrum("set", "white");
    previewColor();
    update();
}

function sections(sect){
    document.getElementById("sections-label").innerText = "Sections : "+sect;
    mandala.setSections(sect);
    update();
}

function setSaveDimensions(sd){
    document.getElementById("dimensions-label").innerText = Math.round(width*sd)+"px x "+Math.round(height*sd)+"px";
    saveOptions.ratio = sd;
}

function showGuides(g){
    mandala.showGuides(g);
    update();
}

function antiAlias(aa){
    mandala.antiAlias = aa;
}

function sampleSize(sa){
    document.getElementById("correction-label").innerText = "Stroke accuracy : "+  sa + "%";
    mandala.sampleSize = sa / 100;
}

function strokeWidth(sw){
    document.getElementById("swidth-label").innerText = "Stroke width : " + sw;
    mandala.strokeSize = sw;
}

function setMode(m){
    mode = m;
}

function reflect(r){
    mandala.reflect = r;
}

function setColor(c){
    cnv.stroke(color(Math.round(c._r*0.6),Math.round(c._g*0.6),Math.round(c._b*0.6)));
    mandala.currentColor = [Math.round(c._r), Math.round(c._g), Math.round(c._b), Math.round(c._a*255)];
}

function saveDrawing(){
    mandala.saveDrawing(saveOptions);
}

function setSaveOptions(){
    let linesOnly = document.getElementById("lo-checkbox").checked;
    document.getElementById("bot-checkbox").disabled = !linesOnly;
    document.getElementById("fa-checkbox").disabled = !linesOnly;
    if(!linesOnly){
        document.getElementById("bot-checkbox").checked = false;
        document.getElementById("fa-checkbox").checked = false;
    }
    let bot = document.getElementById("bot-checkbox").checked;
    let fa = document.getElementById("fa-checkbox").checked;

    saveOptions.full = !linesOnly;
    saveOptions.bot = bot;
    saveOptions.forcedaliasing = fa;
}