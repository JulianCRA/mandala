/*jshint esversion: 6 */
class Drawing{
    constructor(){
        this.layers = [];
    }

    drawAll(w, h){
        let a = createGraphics(w, h);
        
        let temp = this.drawRegions(w, h);
        a.image(temp, 0, 0);
        temp.remove();
        
        temp = this.drawCurves(w, h);
        a.image(temp, 0, 0);
        temp.remove();
        
        return(a);
    }

    drawRegions(w, h){
        return this.drawFromArray(w, h, this.regions());
    }

    drawCurves(w, h){
        return this.drawFromArray(w, h, this.curves());
    }

    drawFromArray(w, h, list){
        let placeHolder = createGraphics(w, h);
        for(let i = 0; i < list.length; i++)
            placeHolder.image(list[i], 0, 0);
        return(placeHolder);
    }

    unSmooth(container){
        container.loadPixels();
        for (let i = 0; i < container.pixels.length; i += 4) 
            if(container.pixels[i+3] != 0)
                container.pixels[i+3] = 255;
        container.updatePixels();
    }

    regions(){
        let a = [];
        for(let i = 0; i < this.layers.length; i++)
            if(this.layers[i].type == 0)
                a.push(this.layers[i].graphics);
        return a;
    }

    curves(){
        let a = [];
        for(let i = 0; i < this.layers.length; i++)
            if(this.layers[i].type == 1)
                a.push(this.layers[i].graphics);
        return a;
    }

    addLayer(layer, type = 0){
        this.layers.push({graphics:layer, type:type});
    }

    removeLast(){
        this.layers.pop();
    }
}