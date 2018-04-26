'use strict';

class DrawingTool{
    constructor(container, sections = 32, showguides = true){
        this.container = container;
        this.width = this.container.width;
        this.height = this.container.height;
        this.guides = createImage(this.width, this.height);
        this.drawing = new Drawing(this.width, this.height);

        this.points = [];

        this.showguides = showguides;
        this.reflect = true;
        this.smoothlines = true;
        this.showcurves = true;
        this.showregions = true;
        
        this.sections = null;
        this.rotationIncrement = null;
        this.xOff = this.width * 0.5;
        this.yOff = this.height * 0.5;
        this.sampleSize = 0.15;
        this.currentColor = [255, 255, 255, 255];

        this.setSections(sections);
        this.updateCanvas();
    }

    updateCanvas(){
        this.container.clear();
        this.container.image(this.drawing.canvas, 0, 0);

        if(this.showguides){
            this.container.image(this.guides, 0, 0);
        }
    }

    restart(){
        this.drawing.removeAll();
        this.points = [];
        this.showcurves = true;
        this.showregions = true;
        this.currentColor = [255, 255, 255, 255];
        this.updateCanvas();
    }

    drawGuides(){
        let placeHolder = createGraphics(this.width, this.height);
        placeHolder.translate(this.xOff, this.yOff);
        placeHolder.stroke(color(170,170,170,50));
        placeHolder.strokeWeight(1);

        for(let s = 0; s < this.sections; s++){
            placeHolder.rotate(this.rotationIncrement);
            placeHolder.line(80, 0, this.width * 2, 0);
        }
        placeHolder.noFill();
        placeHolder.strokeWeight(1);
        if(this.width > this.height)
            placeHolder.rect(-this.yOff, -this.yOff, this.yOff * 2, this.yOff * 2);
        else
            placeHolder.rect(-this.xOff, -this.xOff, this.xOff * 2, this.xOff * 2);
        (this.xOff>this.yOff)?placeHolder.ellipse(0,0,2*this.yOff,2*this.yOff):placeHolder.ellipse(0,0,2*this.xOff,2*this.xOff);
        
        this.guides = placeHolder.get();
        placeHolder.remove();
        placeHolder = null;
    }

    undo(){
        this.drawing.removeLast();
        this.updateCanvas();
    }

    setSections(s){
        this.sections = s;
        this.rotationIncrement = Math.PI * 2 / this.sections;
        this.drawGuides();
        this.updateCanvas();
    }

    showGuides(showGuides){
        this.showguides = showGuides;
        this.updateCanvas();
    }

    smoothLines(smoothLines){
        this.smoothlines = smoothLines;
        this.updateCanvas();
    }

    linesOnly(linesonly){
        this.showregions = !linesonly;
        this.updateCanvas();
    }

    regionsOnly(regionsonly){
        this.showcurves = !regionsonly;
        this.updateCanvas();
    }

    matchColors(c1_, secondColor){
        return (firstColor[0] == secondColor[0] && 
                firstColor[1] == secondColor[1] && 
                firstColor[2] == secondColor[2] &&
                firstColor[3] == secondColor[3]);
    }

    fillArea(xpos, ypos, newColor = this.currentColor){
        let cnv = this.drawing.getCanvas();
        let initialColor = cnv.get(xpos, ypos);

        function matchWithInitial(r, g, b, a){
            return(initialColor[0] == r && initialColor[1] == g && initialColor[2] == b && initialColor[3] == a)
        }

        if(matchWithInitial(newColor[0], newColor[1], newColor[2], newColor[3])){
            return false;
        }

        cnv.loadPixels();
        let placeHolder = createGraphics(this.width, this.height);
        placeHolder.loadPixels();
        
        let pixStack = [{x:xpos, y:ypos}];
        let leftSideHasBeenChecked = false;
        let rightSideHasBeenChecked = false;

        while(pixStack.length > 0){
            let pixel = pixStack.pop();
            leftSideHasBeenChecked = false;
            rightSideHasBeenChecked = false;
            
            while(pixel.y >= 0){
                pixel.y--;
                let pixelPosition = (pixel.y * this.width + pixel.x) * 4;
                if(!matchWithInitial(cnv.pixels[pixelPosition], cnv.pixels[pixelPosition+1], cnv.pixels[pixelPosition+2], cnv.pixels[pixelPosition+3])){
                    break;
                }
            }
            
            while(pixel.y < this.height - 1){
                pixel.y++;
                let pixelPosition = (pixel.y * this.width + pixel.x) * 4;
                if(!matchWithInitial(cnv.pixels[pixelPosition], cnv.pixels[pixelPosition+1], cnv.pixels[pixelPosition+2], cnv.pixels[pixelPosition+3])){
                    break;
                }
                
                placeHolder.pixels[pixelPosition] = newColor[0];
                placeHolder.pixels[pixelPosition+1] = newColor[1];
                placeHolder.pixels[pixelPosition+2] = newColor[2];
                placeHolder.pixels[pixelPosition+3] = newColor[3];

                cnv.pixels[pixelPosition] = newColor[0];
                cnv.pixels[pixelPosition+1] = newColor[1];
                cnv.pixels[pixelPosition+2] = newColor[2];
                cnv.pixels[pixelPosition+3] = newColor[3];

                if(pixel.x > 0){
                    let pixelPosition = (pixel.y * this.width + (pixel.x - 1)) * 4;
                    if(matchWithInitial(cnv.pixels[pixelPosition], cnv.pixels[pixelPosition+1], cnv.pixels[pixelPosition+2], cnv.pixels[pixelPosition+3])){
                        if(!leftSideHasBeenChecked){
                            pixStack.push({x:(pixel.x - 1), y:pixel.y});
                            leftSideHasBeenChecked = true;
                        }
                    }
                    else{
                        if(leftSideHasBeenChecked) leftSideHasBeenChecked = false;
                    }
                }

                if(pixel.x < this.width - 1){
                    let pixelPosition = (pixel.y * this.width + (pixel.x + 1)) * 4;
                    if(matchWithInitial(cnv.pixels[pixelPosition], cnv.pixels[pixelPosition+1], cnv.pixels[pixelPosition+2], cnv.pixels[pixelPosition+3])){
                        if(!rightSideHasBeenChecked){
                            pixStack.push({x:(pixel.x + 1), y:pixel.y});
                            rightSideHasBeenChecked = true;
                        }
                    }
                    else{
                        if(rightSideHasBeenChecked) rightSideHasBeenChecked = false;
                    }
                }
            }
            
        }
        
        placeHolder.updatePixels();

        this.drawing.addLayer(placeHolder.get(), 0);
        cnv = null;
        placeHolder.remove();
        placeHolder = null;
        this.updateCanvas();
    }
    
    beginCurve(mx, my){
        this.points = [];
        this.previousState = this.container.get();
        this.addVertex(mx, my);
    }

    addVertex(mx, my){
        this.points.push({x:mx - this.xOff, y:my - this.yOff});
    }

    endCurve(mx, my, mode = 1){
        this.points.push({x:mx - this.xOff, y:my - this.yOff});
        switch(mode){
            case 1:
                this.addCurve();
            break;
            case 2:
                this.addStraightLine();
            break;
        }
    }

    addCurve(){
        let totalSamples = Math.ceil((this.sampleSize * this.points.length)-1);
        let samples = [this.points[0]];
        for(let i = 0; i < totalSamples; i++)
            samples.push(this.points[Math.floor(i*this.points.length/totalSamples)]);
        samples.push(this.points[this.points.length-1]);

        let placeHolder = this.correctCurve(samples);
        
        this.drawing.addLayer(placeHolder.get(), 1);
        placeHolder = null;
        this.updateCanvas();
    }

    correctCurve(samples = this.points){
        let placeHolder = createGraphics(this.width, this.height);
        placeHolder.stroke(this.currentColor);
        placeHolder.strokeWeight(3);
        placeHolder.strokeCap(ROUND);
        placeHolder.strokeJoin(ROUND);
        placeHolder.noFill();
        placeHolder.translate(this.xOff, this.yOff);
        
        for(let s = 0; s < this.sections; s++){
            placeHolder.push();

            placeHolder.rotate(s * this.rotationIncrement);
            if(this.reflect && s%2 != 0){
                placeHolder.rotate(this.rotationIncrement);
                placeHolder.scale(1.0, -1.0);;
            }

            placeHolder.beginShape();
            if(samples.length <= 2) placeHolder.curveVertex(samples[0].x, samples[0].y);
            for(let i = 0; i < samples.length; i++){
                placeHolder.curveVertex(samples[i].x, samples[i].y);
            }
            placeHolder.curveVertex(samples[samples.length-1].x, samples[samples.length-1].y);
            placeHolder.endShape();

            placeHolder.pop();
        }
        return(placeHolder.get());
    }

    drawCurve(container){
        container.push();
        container.translate(this.xOff, this.yOff);
        for(let s = 0; s < this.sections; s++){
            container.push();
            container.rotate(s * this.rotationIncrement);
            if(this.reflect && s%2 != 0){
                container.rotate(this.rotationIncrement);
                container.scale(1.0, -1.0);;
            }
            container.line(this.points[this.points.length-2].x,this.points[this.points.length-2].y,this.points[this.points.length-1].x, this.points[this.points.length-1].y);
            container.pop();
        }
        container.pop();
    }

    addStraightLine(){
        let placeHolder = createGraphics(this.width, this.height);
        placeHolder.stroke(this.currentColor);
        placeHolder.strokeWeight(3);
        placeHolder.strokeCap(ROUND);
        this.drawStraightLine(placeHolder);
        this.drawing.addLayer(placeHolder.get(), 1);
        placeHolder.remove();
        placeHolder = null;
        this.updateCanvas();
    }
    drawStraightLine(container){
        container.push();
        container.translate(this.xOff, this.yOff);
        for(let s = 0; s < this.sections; s++){
            container.push();
            container.rotate(s * this.rotationIncrement);
            if(this.reflect && s%2 != 0){
                container.rotate(this.rotationIncrement);
                container.scale(1.0, -1.0);;
            }
            container.line(this.points[0].x,this.points[0].y,this.points[this.points.length-1].x, this.points[this.points.length-1].y);
            container.pop();
        }
        container.pop();
    }
}