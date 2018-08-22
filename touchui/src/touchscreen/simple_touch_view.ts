/* tslint:disable */
import { each, bind, map, extend, defer } from 'lodash';
import * as $ from 'jquery';
import 'jqueryui';

$.widget("interstate.screen_touches", {
    options: {
        paper: false,
        radius: 20,
        touchStartAnimationDuration: 100,
        touchEndAnimationDuration: 200,
        defaultFill: "#CCCCCC",
        defaultStroke: "#999999",
        strokeWidth: "3px",
        clusterStrokeWidth: 6
    },
    _create: function () {
        this.touchColors = {};
        this._super();
        this._addToPaper();
        this.element.addClass("simpleScreenTouches");
    },
    _destroy: function () {
        this._super();
        this._removeFromPaper();
        this.element.removeClass("simpleScreenTouches");
    },
    clear: function() {
        each(this.touchDisplays, (touchDisplay, id) => {
            each(touchDisplay, (shape) => {
                if(shape && shape.remove) {
                    shape.remove();
                }
            });
            delete this.touchDisplays[id];
        });
    },
    _addToPaper: function() {
        var paper = this.option("paper"),
            touchDisplays = this.touchDisplays = {},
            radius = this.option("radius"),
            defaultFill = this.option("defaultFill"),
            defaultStroke = this.option("defaultStroke");

        this.element.on('touchstart.simple_touch_view', bind(function(jq_event) {
                var event = jq_event.originalEvent,
                    touchPathStr = null;

                if(event.touchPath) {
                    touchPathStr = map(event.touchPath, function(info) {
                        var type = info.type,
                            touch = info.touch,
                            x = touch.pageX,
                            y = touch.pageY;

                        return (type === "touchstart" ? 'M' : 'L') + x +',' + y;
                    }).join("");
                }

                each(event.changedTouches, (touch) => {
                    const id = touch.identifier,
                        x = touch.pageX,
                        y = touch.pageY,
                        fill = defaultFill,
                        stroke = defaultStroke;

                    touchDisplays[id] = {
                        circle: paper.circle(5*this.option("radius")/4).center(x, y).attr({
                                opacity: 0.2,
                                fill: fill,
                                stroke: stroke,
                                "stroke-width": this.option("strokeWidth")
                            }),
                        clusterStrokes: [],
                        pathKnown: !!touchPathStr,
                        path: paper.path("M"+x+","+y).attr({
                            "stroke-width": 8,
                            stroke: fill,
                            "stroke-linejoin": "round",
                            "stroke-linecap": "round",
                            fill: "none"
                        }),
                        animPath: paper.path(touchPathStr || "M0,0").attr({
                            opacity: 0.2,
                            stroke: fill,
                            "stroke-width": 2,
                            "stroke-linejoin": "round",
                            "stroke-linecap": "round",
                            fill: "none"
                        }),
                        startCircle: paper.circle(0).move(x,y).attr({
                                fill: fill,
                                stroke: fill,
                                "fill-opacity": 0.1,
                                "stroke-width": this.option("strokeWidth"),
                                opacity: 0
                            }),
                    };
                    touchDisplays[id].circle.animate({
                        ease: '<>', 
                        duration: this.option("touchStartAnimationDuration")
                    }).radius(this.option('radius')).opacity(1),
                    touchDisplays[id].startCircle.animate({
                        ease: '<>', 
                        duration: this.option("touchStartAnimationDuration")
                    }).radius(this.option('radius')).opacity(1),
                    this._updateColor(id);
                });
            }, this)).on('touchmove.simple_touch_view', bind(function(jq_event) {
                const event = jq_event.originalEvent;
                each(event.changedTouches, (touch) => {
                    const id = touch.identifier,
                        x = touch.pageX,
                        y = touch.pageY,
                        touchDisplay = touchDisplays[id],
                        pathDisplay = touchDisplay.path,
                        clusterStrokes = touchDisplay.clusterStrokes;

                    touchDisplay.circle.center(x, y);
                    pathDisplay.plot(`${pathDisplay.attr("d")} L ${x},${y}`);

                    each(clusterStrokes, function(clusterStroke) {
                        clusterStroke.center(x, y);
                    });
                });
            }, this)).on('touchend.simple_touch_view touchcancel.simple_touch_view', bind(function(jq_event) {
                var event = jq_event.originalEvent;
                each(event.changedTouches, (touch) => {
                    const id = touch.identifier,
                        x = touch.pageX,
                        y = touch.pageY,
                        touchDisplay = touchDisplays[id],
                        circle = touchDisplay.circle,
                        pathDisplay = touchDisplay.path,
                        animPath = touchDisplay.animPath,
                        length = pathDisplay.length(),
                        startCircle = touchDisplay.startCircle,
                        clusterStrokes = touchDisplay.clusterStrokes,
                        r = circle.attr("r");

                    touchDisplay.animatingRemoval = true;

                    pathDisplay.plot(`${pathDisplay.attr("d")} L ${x}, ${y}`);
                    if(!touchDisplay.pathKnown) {
                        animPath.attr("path", pathDisplay.attr("path"));
                    }

                    const animation_duration = Math.min(Math.max(200, length/3), 900),
                        startTime = (new Date()).getTime(),
                        endTime = startTime + animation_duration,
                        nearStart = pathDisplay.pointAt(Math.min(5, 0.01*length)),
                        nearEnd = pathDisplay.pointAt(Math.max(length-5, 0.99*length));

                    animPath.attr({
                        "stroke-width": pathDisplay.attr("stroke-width"),
                        opacity: 1.0
                    }).animate().opacity(0.2);

                    circle.attr({
                            cx: x,
                            cy: y
                        })
                        .animate({
                            duration: animation_duration,
                            ease: '<>'
                        })
                        .center(nearEnd.x, nearEnd.y)
                        .radius(2*r/3)
                        .opacity(0)
                        .once(1, () => {
                            circle.remove();
                        });

                    each(clusterStrokes, function(clusterStroke) {
                        clusterStroke.center(x, y)
                        .animate({
                            duration: animation_duration,
                            ease: '<>'
                        })
                        .center(nearEnd.x, nearEnd.y)
                        .radius(2*clusterStroke.attr("r")/3)
                        .opacity(0)
                        .once(1, () => {
                            clusterStroke.remove();
                        });
                    });

                    startCircle.animate({
                        duration: animation_duration,
                        ease: '<>'
                    }).center(nearStart.x, nearStart.y)
                    .radius(1.1*startCircle.attr("r"))
                    .opacity(0)
                    .once(1, () => {
                        startCircle.remove();
                    });

                    pathDisplay.attr({
                            opacity: 0.5
                        })
                        .animate({
                            duration: animation_duration,
                            ease: '<>'
                        }).opacity(0).once(1, () => {
                            pathDisplay.remove();
                        });

                    var updateStartCirclePosition = function() {
                        var currTime = (new Date()).getTime();

                        if(currTime <= endTime) {
                            var pct = ((currTime - startTime) / animation_duration),
                                pos = pathDisplay.pointAt(pct*length);
                            // animPath.attr("path", pathDisplay.getSubpath(length*pct, length));
                            requestAnimationFrame(updateStartCirclePosition);
                        } else {
                            animPath.remove();
                        }
                    };
                    requestAnimationFrame(updateStartCirclePosition);
                    updateStartCirclePosition();
                    delete touchDisplays[id];
                });
            }, this));
    },

    _removeFromPaper: function() {
        $(window).off('.simple_touch_view');
    },
    _updateColor: function(id) {
        var colors = this.touchColors[id],
            display = this.touchDisplays[id];

        if(display && !display.animatingRemoval) {
            var circle = display.circle,
                path = display.path,
                animPath = display.animPath,
                startCircle = display.startCircle,
                clusterStrokes = display.clusterStrokes,
                paper = this.option("paper"),
                pathStrokeColors = map(clusterStrokes, function(cs) {
                    return cs.attr("stroke");
                }),
                strokes = map(colors, "stroke");

            if (colors && colors.length > 0) {
                var claimedIndex = find(colors, function(color) {
                    return color.claimed;
                });
                if(claimedIndex >= 0) {
                    var fillColor = colors[claimedIndex].fill,
                        strokeColor = colors[claimedIndex].stroke;

                    circle.attr({
                        fill: fillColor,
                        stroke: strokeColor
                    });
                    path.attr({
                        stroke: fillColor
                    });
                    animPath.attr({
                        stroke: fillColor
                    });
                    startCircle.attr({
                        stroke: fillColor,
                        fill: fillColor
                    });

                    each(clusterStrokes, function(clusterStroke, index) {
                        clusterStroke.remove();
                    });
                    clusterStrokes.splice(0, clusterStrokes.length);
                } else {
                    var clusterStrokeWidth = this.option("clusterStrokeWidth"),
                        was_found_indicator = {};

                    each(colors, (info, index) => {
                        var radius = parseInt(circle.attr("r")) + clusterStrokeWidth*(parseInt(index)+0);

                        if(info.circle) {
                            info.circle.animate({
                                duration: this.option("touchStartAnimationDuration"),
                                ease: '<>'
                            }).radius(radius);
                        } else {
                            var clusterStroke = info.circle = paper.circle(circle.attr("cx"), circle.attr("cy"), 5*radius/4).attr({
                                    fill: "none",
                                    stroke: info.fill,
                                    "stroke-width": clusterStrokeWidth,
                                    opacity: 0.2
                                });
                            clusterStroke.animate({
                                duration: this.option("touchStartAnimationDuration"),
                                ease: '<>'
                            }).radius(radius).opacity(1)
                            clusterStrokes.push(clusterStroke);
                        }
                        info.circle.was_found = was_found_indicator;
                    });

                    var to_remove = [];
                    each(clusterStrokes, function(clusterStroke, index) {
                        if(clusterStroke.was_found === was_found_indicator) {
                            delete clusterStroke.was_found;
                        } else {
                            clusterStroke.remove();
                            to_remove.unshift(index);
                        }
                    });

                    each(to_remove, (i) => {
                        clusterStrokes.splice(i, 1);
                    });
                }
            } else {
                var defaultFill = this.option("defaultFill"),
                    defaultStroke = this.option("defaultStroke");

                circle.attr({
                    fill: defaultFill,
                    stroke: defaultStroke
                });
                path.attr({
                    stroke: defaultFill
                });
                animPath.attr({
                    stroke: defaultFill
                });
                startCircle.attr({
                    stroke: defaultFill,
                    fill: defaultFill
                });
            }
        }
    },
    setTouchColor: function(id, cluster, fillColor, strokeColor, claimed) {
        var colors = this.touchColors[id],
            info;

        each(colors, (i) => {
            if(i.cluster === cluster) {
                info = i;
            }
        });

        if(info) {
            extend(info, {
                fill: fillColor,
                stroke: strokeColor,
                claimed: claimed
            });
        } else {
            info = {
                cluster: cluster,
                fill: fillColor,
                stroke: strokeColor,
                claimed: claimed,
                circle: false
            };

            if(colors) {
                colors.push(info);
            } else {
                colors = this.touchColors[id] = [info];
            }
        }

        defer(bind(this._updateColor, this, id));
    },
    unsetTouchColor: function(id, cluster, claims) {
        var colors = this.touchColors[id],
            toRemoveIndicies = [];
        each(colors, (info, index) => {
            if(info.cluster === cluster) {
                if(info.circle) {
                    info.circle.remove();
                    delete info.circle;
                }
                toRemoveIndicies.unshift(index);
            }
        });
        each(toRemoveIndicies, (index) => {
            colors.splice(index, 1);
        });

        defer(bind(this._updateColor, this, id));
    }
});

function find(collection, filter) {
    for (var i = 0; i < collection.length; i++) {
        if(filter(collection[i], i, collection)) return i;
    }
    return -1;
}
