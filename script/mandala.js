let sections = 16;
let increment = 2 * Math.PI / sections;
let hOffset = 0;
let vOffset = 0;

let reflect = true;
let correction = false;
let samples = 50;
let drawGuides = true;

let ctrl = false;

let cnv;
let guides;

let currentLine;
let currentPoints = new Array();;

let curves = new Array();

function setup(){
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("mandala");

    guides = createGraphics(width, height);
    
    hOffset = Math.floor(width / 2);
    vOffset = Math.floor(height / 2);

    drawBackground();
    noLoop();
}

function draw(){
    
}

function mousePressed(){
    
    currentPoints.push({x:mouseX - hOffset, y:mouseY - vOffset});

    push();
    translate(hOffset, vOffset);
    stroke(200);
    strokeWeight(2);
}

function mouseReleased(){
    pop();
    commitCurve(correction);
    currentPoints = new Array();
    curves.push(currentLine);
    drawLines();
}

function mouseDragged(){
    drawNewLine();
}

function drawNewLine(){
    let xpos = mouseX - hOffset;
    let ypos = mouseY - vOffset;
    for(let i = 0; i < sections; i++){
        push();
        rotate(increment*i);
        if(i%2 != 0){
            rotate(increment);
            scale(1.0, -1.0);
        }
        
        line(currentPoints[currentPoints.length-1].x, currentPoints[currentPoints.length-1].y, xpos, ypos);
        pop();
    }
    currentPoints.push({x:xpos, y:ypos});
}

function commitCurve(){
    currentLine = createGraphics(width, height);
    currentLine.translate(hOffset, vOffset);
    currentLine.stroke(255);
    currentLine.strokeJoin(ROUND);
    currentLine.strokeCap(ROUND);
    currentLine.strokeWeight(3);

    for(let i = 0; i < sections; i++){
        currentLine.push();
        currentLine.noFill();
        currentLine.rotate(increment*i);

        if(i%2 != 0){
            currentLine.rotate(increment);
            currentLine.scale(1.0, -1.0);;
        }
        
        if(correction){
            currentLine.beginShape();
            currentLine.curveVertex(currentPoints[0].x, currentPoints[0].y);
            for(let j = 0; j < samples; j++){
                currentLine.curveVertex(currentPoints[Math.floor(j*currentPoints.length/samples)].x, currentPoints[Math.floor(j*currentPoints.length/samples)].y);
            }
            currentLine.curveVertex(mouseX - hOffset, mouseY - vOffset);
            currentLine.endShape();
        }
        else{
            for(let j = 1; j < currentPoints.length; j++)
                currentLine.line(currentPoints[j-1].x, currentPoints[j-1].y, currentPoints[j].x, currentPoints[j].y);
        }

        currentLine.pop();
    }
}

function drawLines(){
    drawBackground();
    for(let i = 0; i < curves.length; i++){
        image(curves[i], 0, 0);
    }
}

function drawBackground(){
    guides.background(0);
    if(drawGuides){
        guides.stroke(120);
        guides.strokeWeight(0.3);
        guides.push();
        guides.translate(hOffset, vOffset);
        for(let i = 0; i < sections; i++){
            guides.line(75, 0, width, 0);
            guides.rotate(increment);
        }
        guides.pop();
        }
    image(guides, 0, 0);
}

function keyPressed(){
    if (keyCode == CONTROL){ 
        ctrl = true;
    }
    if (keyCode == SHIFT){ 
        noLoop();
    }
}

function keyTyped(){
    if(ctrl){
        if (keyCode == 26) {
            curves.pop();
            drawLines();
        }
    }
    return false;
}

function keyReleased(){
    if(keyCode == CONTROL){
        ctrl = false;
    }
}
