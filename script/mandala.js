let sections = 24;
let increment = 2 * Math.PI / sections;
let hOffset = 0;
let vOffset = 0;
let reflect = false;

function setup(){
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('cnv');
    background('black');
    hOffset = width/2;
    vOffset = height/2;
    reflect = true;
}

function draw(){
    drawGuides();
}

function mouseDragged() 
{ 
    if(!reflect){
        push();
        translate(hOffset, vOffset);
        
        let a = atan2(mouseX - hOffset, mouseY - vOffset);
        stroke('red');
        strokeWeight(4);
        for(let i = 0; i < sections; i++){
            rotate(increment);
            line(mouseX - hOffset, mouseY - vOffset, pmouseX - hOffset, pmouseY - vOffset);
        }
        
        pop();
    }else{
        push();
        translate(hOffset, vOffset);
        
        let a = atan2(mouseX - hOffset, mouseY - vOffset);
        stroke('red');
        strokeWeight(4);
        for(let i = 0; i < sections; i++){
           
            if(i%2 == 0){
                rotate(increment*2);
                push();
                
                scale(-1.0, 1.0);
                line(mouseX - hOffset, mouseY - vOffset, pmouseX - hOffset, pmouseY - vOffset);
                pop();
            }else{
                //rotate(increment);
                line(mouseX - hOffset, mouseY - vOffset, pmouseX - hOffset, pmouseY - vOffset);
                
            }
        }
        pop();
    }
}

function drawGuides(){
    push();
    translate(hOffset, vOffset);
    stroke('white');
    strokeWeight(1);
    for(let i = 0; i < sections; i++){
        line(0, 0, width, 0);
        rotate(increment);
    }
    pop();
}