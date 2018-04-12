let sections;
let increment;
let scaleFactor;

let showGuides;
let reflect;
let smoothLines;
let samplePercentage;
let colorMode;

let xOffset;
let yOffset;
let currentlyDrawing;

let cnv;
let points;
let currentCurve;
let curves;
let currentRegion;
let regions;

function setup(){
    initSketch(32);
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
    samplePercentage = 0.15;
    reflect = true;
    showGuides = false;
    smoothLines = false;
    colorMode = false;

    xOffset = Math.floor(cnv.width * 0.5);
    yOffset = Math.floor(cnv.height * 0.5);
    currentlyDrawing = false;

    curves = new Array();
    regions = new Array();
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
    
    let regionsLayer = createGraphics(cnv.width, cnv.height);
    regionsLayer.clear();
    for(let i = 0; i < regions.length; i++){
        regionsLayer.image(regions[i], 0, 0);
    }

    let curvesLayer = createGraphics(cnv.width, cnv.height);
    curvesLayer.clear();
    for(let i = 0; i < curves.length; i++){
        curvesLayer.image(curves[i], 0, 0);
    }

    if(!smoothLines){
        curvesLayer.loadPixels();
        for (let i = 0; i < curvesLayer.pixels.length; i += 4) {
            if(curvesLayer.pixels[i+3] != 0){
                curvesLayer.pixels[i+3] = 255;
            }
        }
        curvesLayer.updatePixels();
    }

    image(regionsLayer, 0, 0);
    image(curvesLayer, 0, 0);
    regionsLayer.remove();
    curvesLayer.remove();
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

function switchMode(){
    colorMode = !colorMode
    if(colorMode){
        
        
    }else{
        cnv.mousePressed(beginCurveDrawing);
        cnv.mouseMoved(doDrawing);
        cnv.mouseReleased(finishDrawing);
    }
    smoothLines = !colorMode;
    showGuides = !colorMode;
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

function colorRegion(xpos, ypos, newColor, ref = false){
    let startColor = cnv.get(xpos, ypos);
    if(matchColors(startColor, newColor)){
        return false;
    }
    let pixStack = new Array({x:xpos, y:ypos});
    loadPixels();
    currentRegion = createGraphics(cnv.width, cnv.height);
    currentRegion.loadPixels();
    while(pixStack.length > 0){
        let pix = pixStack.pop();
        let searchLeft = false;
        let searchRight = false;
        
        while(pix.y >= 0){
            pix.y--;
            let ppos = (pix.y*cnv.width+pix.x) * 4;
            let cc = [pixels[ppos], pixels[ppos+1], pixels[ppos+2]];
            if(!matchColors(cc, startColor)){
                break;
            }
        }
        
        while(pix.y < cnv.height){
            pix.y++;
            let ppos = (pix.y*cnv.width+pix.x) * 4;
            let cc = [pixels[ppos], pixels[ppos+1], pixels[ppos+2]];
            if(!matchColors(cc, startColor)){
                pix.y--;
                break;
            }
            
            pixels[ppos] = newColor[0];
            pixels[ppos+1] = newColor[1];
            pixels[ppos+2] = newColor[2];
            pixels[ppos+3] = 255;
            
            currentRegion.pixels[ppos] = newColor[0];
            currentRegion.pixels[ppos+1] = newColor[1];
            currentRegion.pixels[ppos+2] = newColor[2];
            currentRegion.pixels[ppos+3] = 255;
            
            
            
            if(pix.x > 0){
                ppos = (pix.y*cnv.width+pix.x-1) * 4;
                cc = [pixels[ppos], pixels[ppos+1], pixels[ppos+2]];
                if(matchColors(cc, startColor)){
                    if(!searchLeft){
                        pixStack.push({x:pix.x-1, y:pix.y});
                        searchLeft = true;
                    }
                }
                else if(searchLeft){
                    searchLeft = false;
                }
            }

            if(pix.x < cnv.width - 1){
                ppos = (pix.y*cnv.width+pix.x+1) * 4;
                cc = [pixels[ppos], pixels[ppos+1], pixels[ppos+2]];
                if(matchColors(cc, startColor)){
                    if(!searchRight){
                        pixStack.push({x:pix.x+1, y:pix.y});
                        searchRight = true;
                    }
                }
                else if(searchRight){
                    searchRight = false;
                }
            }
        }
    }
    currentRegion.updatePixels();
    regions.push(currentRegion);
    currentRegion.remove();
    updatePixels();
}

function matchColors(firstColor, secondColor){
    return (firstColor[0] == secondColor[0] && firstColor[1] == secondColor[1] && firstColor[2] == secondColor[2]);
}