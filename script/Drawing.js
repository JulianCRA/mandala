/*jshint esversion: 6 */
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
class Drawing{
    constructor(){
        this.layers = [];
    }

    drawAll(w, h){
        let a = createGraphics(w, h);
        
        let temp = this.drawRegions(w, h);
        a.image(temp, 0, 0);
        temp.remove();
        temp = null;

        temp = this.drawCurves(w, h);
        a.image(temp, 0, 0);
        temp.remove();
        temp = null;

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
        for(let i = 0; i < list.length; i++){
            placeHolder.image(list[i], 0, 0);
        }
        return(placeHolder);
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
        this.layers.push({graphics:layer.get(), type:type});
    }

    removeLast(){
        if(this.layers.length <= 0) return;
        
        let x = this.layers.pop();
        //x.graphics.remove();
        x.graphics = null;
        x = null;
    }
}