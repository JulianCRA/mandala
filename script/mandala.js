let sections;
let increment;
let scaleFactor;

let showGuides;
let reflect;
let smoothLines;
let samplePercentage;

let xOffset;
let yOffset;
let currentlyDrawing;

let cnv;
let points;
let currentCurve;
let curves;

function setup(){
    initSketch(8);
}

function initSketch(s){
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("mandala");
    cnv.mousePressed(beginCurveDrawing);
    cnv.mouseMoved(doDrawing);
    cnv.mouseReleased(finishDrawing);
    pixelDensity(1);
    noLoop();

    sections = s/1;
    increment = 2 * Math.PI / sections;
    scaleFactor = 3;
    samplePercentage = 0.3;
    reflect = true;
    showGuides = true;
    smoothLines = true;

    xOffset = Math.floor(cnv.width * 0.5);
    yOffset = Math.floor(cnv.height * 0.5);
    currentlyDrawing = false;

    curves = new Array();
    drawAll(showGuides);
}

function beginCurveDrawing(){
    points = new Array(transMouse());
    configGraphics();
    currentlyDrawing = true;
}

function doDrawing(){
    if(currentlyDrawing){
        points.push(transMouse());
        drawCurve(currentCurve, points);
        image(currentCurve, 0, 0);
    }
}

function finishDrawing(){
    currentlyDrawing = false;
    addCurve(samplePercentage);
    drawAll(showGuides);
}

function drawCurve(container, samples, ref = reflect){
    container.push();
    container.translate(xOffset, yOffset);
    for(let s = 0; s < sections; s++){
        container.push();
        container.rotate(s * increment);
        if(ref && s%2 != 0){
            container.rotate(increment);
            container.scale(1.0, -1.0);;
        }
        container.beginShape();
        container.curveVertex(samples[0].x, samples[0].y);
        for(let i = 0; i < samples.length; i++){
            container.curveVertex(samples[i].x, samples[i].y);
        }
        container.curveVertex(samples[samples.length-1].x, samples[samples.length-1].y);
        container.endShape();
        container.pop();
    }
    container.pop();
}

function addCurve(sp){
    currentCurve.remove();
    configGraphics();
    let totalSamples = Math.ceil((sp * points.length)-1);
    let newPoints = new Array();
    for(let i = 0; i < totalSamples; i++){
        newPoints.push(points[Math.floor(i*points.length/totalSamples)]);
    }
    newPoints.push(points[points.length-1]);
    drawCurve(currentCurve, newPoints);
    curves.push(currentCurve);
    currentCurve.remove();
}

function drawAll(shg = showGuides){
    clear();
    if(shg){
        push();
        translate(xOffset, yOffset);
        stroke(120);
        strokeWeight(0.4);
        for(let s = 0; s < sections; s++){
            rotate(increment);
            line(80, 0, width*2, 0);
        }
        pop();
    }

    if(!smoothLines){
        background(0);
        for(let i = 0; i < curves.length; i++){
            image(curves[i], 0, 0);
        }
        filter(THRESHOLD);
    }
    else{
        for(let i = 0; i < curves.length; i++){
            image(curves[i], 0, 0);
        }
    }
}

function saveDrawing(sl = smoothLines){
    let final = createGraphics(width * scaleFactor, height * scaleFactor);
    final.scale(scaleFactor, scaleFactor);
    for(let i = 0; i < curves.length; i++){
        final.image(curves[i], 0, 0);
    }
    final.filter(INVERT);

    if(!sl){
        final.loadPixels();
        for (let i = 0; i < final.pixels.length; i += 4) {
            final.pixels[i+3] = (final.pixels[i+3] > 127) ? 255 : 0;
        }
        final.updatePixels();
    }
    
    save(final, "mandala.png");
    final.remove();
}

function toggleSmooth(){
    smoothLines = !smoothLines;
    drawAll(showGuides);
}

function toggleGuides(){
    showGuides = !showGuides;
    if(showGuides) smoothLines = true;
    drawAll(showGuides);
}

function transMouse(){
    return({x:mouseX - xOffset, y:mouseY - yOffset});
}

function setSections(ns){
    if(ns < 2) ns = 2;
    reflect = ns % 2 == 0;
    sections = ns;
    increment = 2 * Math.PI / sections;
    drawAll(showGuides);
}

function configGraphics(){
    currentCurve = createGraphics(cnv.width, cnv.height);
    currentCurve.clear();
    currentCurve.noFill();
    currentCurve.stroke(255);
    currentCurve.strokeWeight(3);
    currentCurve.strokeCap(ROUND);
    currentCurve.strokeJoin(ROUND);
}

let ctrl = false;
function keyPressed(){
    if (keyCode == CONTROL){ 
        ctrl = true;
    }
    if(ctrl){
        if (keyCode == 90) {
            curves.pop();
            drawAll(showGuides);
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
}