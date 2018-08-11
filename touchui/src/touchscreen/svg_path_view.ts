/* tslint:disable */
import * as $ from 'jquery';
import * as cjs from 'constraintjs';
import { extend } from 'lodash';
import 'jqueryui';

$.widget("interstate.svg_path", {
    options: {
        cluster: false,
        paper: false,
        defaultPathAttributes: {
            fill: "#888",
            "fill-opacity": 0.05,
            stroke: "#EEE",
            "stroke-width": 2,
            "stroke-dasharray": "5, 5, 2, 5"
        }
    },
    _create: function () {
        this._super();
        this.paths = [];
    },
    _destroy: function () {
        this._super();
        this.clear();
    },
    _getDrawListener: function(path, pathAttributes) {
        var paper = this.option("paper"),
            attributes = extend({}, this.option("defaultPathAttributes"), pathAttributes),
            paper_path = paper.path("M0,0").attr(attributes);

        var draw_fn = cjs.liven(function() {
            var pathStr = path.toString();
            if(!pathStr) {
                pathStr = "M0,0";
            }

            paper_path.plot(pathStr);
        }, {
            context: this,
            on_destroy: function() {
                paper_path.remove();
            }
        });

        return draw_fn;
    },
    addPathToPaper: function(path, pathAttributes) {
        var i = 0, len = this.paths.length, pinfo;
        for(; i<len; i++) {
            pinfo = this.paths[i];
            if(pinfo.path === path) { // we already have this cluster
                return;
            }
        }

        this.paths.push({
            path: path,
            draw_fn: this._getDrawListener(path, pathAttributes)
        });
    },
    removePathFromPaper: function(path) {
        var i = 0, len = this.paths.length, pinfo;
        for(; i<len; i++) {
            pinfo = this.paths[i];
            if(pinfo.path === path) { // we already have this cluster
                pinfo.draw_fn.destroy();
                this.paths.splice(i, 1);
                return;
            }
        }
    },
    clear: function() {
        var i = this.paths.length-1, pinfo;
        for(; i>=0; i--) {
            pinfo = this.paths[i];
            pinfo.draw_fn.destroy();
        }

        this.paths.splice(0, this.paths.length);
    }
});
