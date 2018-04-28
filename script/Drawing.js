'use strict';

class Drawing{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.layers = [];
        this.buffer = [];
        
        this.canvas = createGraphics(this.width, this.height);
        this.curves = createGraphics(this.width, this.height);
        this.regions = createGraphics(this.width, this.height);
    }

    getCanvas(){
        let temp = createImage(this.width, this.height);
        temp = this.canvas.get();
        return temp;
    }

    addLayer(layer, type = 1){
        this.layers.push({graphics:layer.drawingContext.canvas.toDataURL("image/png"), type:type});
        this.buffer.push(this.canvas.drawingContext.canvas.toDataURL("image/png"));
        this.canvas.image(layer, 0, 0);
        
        switch(type){
            case 0:
                this.regions.image(layer, 0, 0);
                break;
            case 1:
                this.curves.image(layer, 0, 0);
                break;
        }
        layer = null;
    }

    updateCanvas(callback){
        this.canvas.clear();
        
        if(this.layers.length == 0){
            callback();
            return;
        }

        loadImage(this.buffer.pop(), 
            function(img) {
                this.canvas.image(img, 0, 0);
                callback();
            }.bind(this)
        );
        
    }

    updateRegions(){
        this.regions.clear();
        for(let i = 0; i < this.layers.length; i++)
            if(this.layers[i].type == 0)
                this.regions.image(this.layers[i].graphics);
    }

    updateCurves(){
        this.curves.clear();
        for(let i = 0; i < this.layers.length; i++)
            if(this.layers[i].type == 1)
                this.curves.image(this.layers[i].graphics);
    }

    removeLast(callback){
        if(this.layers.length <= 0){
            return;
        } 
        
        let x = this.layers.pop();
        this.updateCanvas(callback);
        x = null;
    }

    removeAll(){
        while(this.layers.length > 0){
            let x = this.layers.pop();
            x = null;
        }
        this.canvas.clear();
        this.regions.clear();
        this.curves.clear();
        this.buffer = [];
    }

    getLast(){
        return this.layers[this.layers.length - 1].graphics;
    }
}