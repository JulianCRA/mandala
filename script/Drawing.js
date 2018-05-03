'use strict';

class Drawing{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.layers = [];
        this.buffer = [];
        
        this.canvas = createGraphics(this.width, this.height);
        this.curves = createGraphics(this.width, this.height);
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

    updateCurves(forcedaliasing, callback){
        let c = [];
        for(let i = 0; i < this.layers.length; i++)
            if(this.layers[i].type == 1)
                c.push(this.layers[i].graphics);

        this.curves.clear();
        for(let i = 0; i < c.length; i++){
            loadImage(c[i], 
                function(img) {
                    if(forcedaliasing){
                        img.loadPixels();
                        for (let i = 0; i < img.pixels.length; i += 4) 
                            if(img.pixels[i+3] != 0){
                                img.pixels[i+3] = 255;
                            }
                        img.updatePixels();
                    }

                    this.curves.image(img, 0, 0);
                    
                    img = null;
                    if(i == c.length - 1){
                        callback();
                        c = null;
                    }
                }.bind(this)
            );
        }
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