class DrawingTool{
    constructor(width, height, sections = 32, showguides = true){
        this.canvas = createGraphics(width, height);
        this.drawing = new Drawing();

        this.points = [];

        this.showguides = showguides;
        this.reflect = true;
        
        this.sections = sections;
        this.rotationIncrement = Math.PI * 2 / this.sections;
        this.xOff = width * 0.5;
        this.yOff = height * 0.5;
        this.sampleSize = 0.15;

        this.refresh();
    }

    setSections(s){
        if(s === undefined) return this.sections;

        this.sections = s;
        this.rotationIncrement = Math.PI * 2 / this.sections;

        if(this.showguides){
            this.refresh();
        }
    }

    matchColors(firstColor, secondColor){
        return (firstColor[0] == secondColor[0] && firstColor[1] == secondColor[1] && firstColor[2] == secondColor[2]);
    }

    bucketPaint(xpos, ypos, newColor = [random(255),random(255),random(255)]){
        let dr = this.drawing.drawAll(this.canvas.width, this.canvas.height);
        let startColor = dr.get(xpos, ypos);
        if(this.matchColors(startColor, newColor)){
            return false;
        }
        let pixStack = [{x:xpos, y:ypos}];
        let placeHolder = createGraphics(this.canvas.width, this.canvas.height);
        placeHolder.loadPixels();
        dr.loadPixels();
        
        while(pixStack.length > 0){
            let pix = pixStack.pop();
            let searchLeft = false;
            let searchRight = false;
            
            while(pix.y >= 0){
                pix.y--;
                let ppos = (pix.y*cnv.width+pix.x) * 4;
                let currentColor = [dr.pixels[ppos], dr.pixels[ppos+1], dr.pixels[ppos+2]];
                if(!this.matchColors(currentColor, startColor)){
                    break;
                }
            }
            
            while(pix.y < dr.height){
                pix.y++;
                let ppos = (pix.y*dr.width+pix.x) * 4;
                let currentColor = [dr.pixels[ppos], dr.pixels[ppos+1], dr.pixels[ppos+2]];
                if(!this.matchColors(currentColor, startColor)){
                    pix.y--;
                    break;
                }
                
                dr.pixels[ppos] = newColor[0];
                dr.pixels[ppos+1] = newColor[1];
                dr.pixels[ppos+2] = newColor[2];
                dr.pixels[ppos+3] = 255;
                
                placeHolder.pixels[ppos] = newColor[0];
                placeHolder.pixels[ppos+1] = newColor[1];
                placeHolder.pixels[ppos+2] = newColor[2];
                placeHolder.pixels[ppos+3] = 255;
                
                if(pix.x > 0){
                    ppos = (pix.y*cnv.width+pix.x-1) * 4;
                    currentColor = [dr.pixels[ppos], dr.pixels[ppos+1], dr.pixels[ppos+2]];
                    if(this.matchColors(currentColor, startColor)){
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
                    currentColor = [dr.pixels[ppos], dr.pixels[ppos+1], dr.pixels[ppos+2]];
                    if(this.matchColors(currentColor, startColor)){
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
        placeHolder.updatePixels();
        this.drawing.addLayer(placeHolder, 1);
        this.refresh();
        placeHolder.remove();
        dr.remove();
    }

    drawGuides(){
        let placeHolder = createGraphics(this.canvas.width, this.canvas.height);
        placeHolder.translate(this.xOff, this.yOff);
        placeHolder.stroke(color(170,170,170,50));
        placeHolder.strokeWeight(2);

        for(let s = 0; s < this.sections; s++){
            placeHolder.rotate(this.rotationIncrement);
            placeHolder.line(80, 0, this.canvas.width * 2, 0);
        }
        return(placeHolder);
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
    correctCurve(samples = this.points){
        let placeHolder = createGraphics(this.canvas.width, this.canvas.height);
        placeHolder.stroke(255);
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
        return(placeHolder);
    }

    addCurve(){
        let totalSamples = Math.ceil((this.sampleSize * this.points.length)-1);
        let samples = [this.points[0]];
        for(let i = 0; i < totalSamples; i++){
            samples.push(this.points[Math.floor(i*this.points.length/totalSamples)]);
        }
        samples.push(this.points[this.points.length-1]);
        let placeHolder = this.correctCurve(samples);
        
        this.drawing.addLayer(placeHolder, 1);
        this.refresh();
        placeHolder.remove();
    }

    restart(){
        this.canvas.clear();
        this.drawing = new Drawing();
        this.points = [];
        this.refresh();
    }

    addPoint(mx, my, start){
        if(start == true){
            this.points = [];
        }
        this.points.push({x:mx - this.xOff, y:my - this.yOff});
        if(start == false){
            this.addCurve();
        }
    }

    undo(){
        this.drawing.removeLast();
        this.refresh();
    }

    refresh(){
        this.canvas.clear();
        
        let tmp = this.drawing.drawAll(this.canvas.width, this.canvas.height);
        this.canvas.image(tmp, 0, 0);
        tmp.remove();

        if(this.showguides){
            tmp = this.drawGuides();
            this.canvas.image(tmp, 0, 0);
            tmp.remove();
        }
    }
}