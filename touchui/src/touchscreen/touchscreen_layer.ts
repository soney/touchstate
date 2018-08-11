/* tslint:disable */
import * as $ from 'jquery';
import 'jqueryui';
import './simple_touch_view';
import './svg_path_view';
import { Path } from '../touch_primitives/Path';
import  * as cjs from 'constraintjs';

$.widget("interstate.touchscreen_layer", {
    options: {
        highlightTouches: true,
        paper: false
    },
    _create: function () {
        this._super();

        this.element.addClass("hasTouchscreenLayer");
        this.paper = this.option('paper');

        //this.paper = new Snap(0,0);
        //this.raphaelDiv = $(this.paper.node);
        /*
        this.raphaelDiv.prependTo(document.body).css({
            "pointer-events": "none",
            "position": "absolute",
            "z-index": 10
        });

        var onWindowResize = _.bind(function() {
            var width = window.innerWidth,
                height = window.innerHeight;

            this.paper.attr({
                width: width,
                height: height
            });

            var scrollWidth = document.body.scrollWidth,
                scrollHeight = document.body.scrollHeight;

            this.paper.attr({
                width: scrollWidth,
                height: scrollHeight
            });
        }, this);

        $(window).on('resize.touchscreen_layer', onWindowResize);
        onWindowResize();
        */

        if(this.option("highlightTouches")) {
            this.element.screen_touches({
                paper: this.paper
            });
        }

        this.element.svg_path({
            paper: this.paper,
            pathAttributes: {
                "stroke-dasharray": "5, 5, 1, 5"
            }
        });

        //this.element.touch_cluster({
            //paper: this.paper
        //});

        /*
        var tc1 = new ist.TouchCluster({
                numFingers: 1
            }),
            tc2 = new ist.TouchCluster({
                numFingers: 1
            });
        this.addTouchCluster(tc1);
        this.addTouchCluster(tc2);

        cjs.liven(function() {
            if(tc2.isSatisfied()) {
                _.delay(function() {
                    tc2.claimTouches();
                }, 1000);
                //tc2.claimTouches();
            } else {
                tc2.disclaimTouches();
            }
        }, {
            context: this
        });
        /**/
    },
    _destroy: function () {
        this.element.removeClass("hasTouchscreenLayer");
        this._super();
        $(window).off('resize.touchscreen_layer');

        if(this.option("highlightTouches")) {
            this.element.screen_touches("destroy");
        }

        this.element.svg_path("destroy");
        //this.element.touch_cluster("destroy");

        this.paper.clear();
        this.raphaelDiv.remove();
    },
    addPath: function(toAdd) {
        this.element.svg_path("addPathToPaper", toAdd);
    },
    removePath: function(path) {
        this.element.svg_path("removePathFromPaper", path);
    },
    addTouchCluster: function(cluster) {
        //this.element.touch_cluster("addClusterToPaper", cluster);
    },
    removeTouchCluster: function(cluster) {
        //this.element.touch_cluster("removeClusterFromPaper", cluster);
    },
    clear: function() {
        this.element.screen_touches('clear');
    }
});
