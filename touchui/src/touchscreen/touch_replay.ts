/* tslint:disable */
import { extend } from 'lodash';
function getReplayBoundingBox(touch_log) {
    var left = Number.POSITIVE_INFINITY,
        top = Number.POSITIVE_INFINITY,
        right = Number.NEGATIVE_INFINITY,
        bottom = Number.NEGATIVE_INFINITY;

    touch_log.forEach(function(e) {
        e.changedTouches.forEach(function(touch) {
            var x = touch.pageX,
                y = touch.pageY;
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
        });
    });

    return {
        left: left,
        top: top,
        width: right - left,
        height: bottom - top
    };
}
function replayTouches(touch_log, options) {
    var root = window;

    options = extend({
        target: root,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1
    }, options);

    function doScalePoint(x, y) {
        return {
            x: options.scaleX * (x + options.offsetX),
            y: options.scaleY * (y + options.offsetY)
        };
    }

    var timeouts = [],
        fns = [],
        touches = {};

    var target = options.target;
    var rv = new Promise(function(resolve, reject) {
        if(touch_log.length > 0) {
            var first_touch = touch_log[0],
                starting_time = first_touch.timestamp,
                touch_targets = {};

            touch_log.forEach(function(e, index) {
                var fn = function() {
                    var touch_event,
                        changedTouches = e.changedTouches,
                        type = e.type;

                    changedTouches.forEach(function(originalTouch) {
                        var page = doScalePoint(originalTouch.pageX, originalTouch.pageY),
                            screen = doScalePoint(originalTouch.screenX, originalTouch.screenY),
                            client = doScalePoint(originalTouch.clientX, originalTouch.clientY);

                        var newTouch = extend({}, originalTouch, {
                            pageX: page.x,
                            pageY: page.y,
                            screenX: screen.x,
                            screenY: screen.y,
                            clientX: client.x,
                            clientY: client.y
                        });

                        if(type === "touchstart" || !touches.hasOwnProperty(newTouch.identifier)) {
                            var touch = document.createTouch ? document.createTouch(root, target, newTouch.identifier, newTouch.pageX, newTouch.pageY,
                                                                  newTouch.screenX, newTouch.screenY)//, newTouch.clientY, newTouch.clientY)
                                                                  : newTouch;
                            touch.force = originalTouch.force;

                            touches[newTouch.identifier] = touch;
                            touch_targets[newTouch.identifier] = target;
                        } else {
                            var old_touch = touches[newTouch.identifier];
                            extend(old_touch, {
                                pageX: page.x,
                                pageY: page.y,
                                screenX: screen.x,
                                screenY: screen.y,
                                clientX: client.x,
                                clientY: client.y,
                                force: originalTouch.force
                            });
                            touch_targets[newTouch.identifier] = target;
                        }
                    });

                    var i = 0,
                        tl = [],
                        ctl = [],
                        ttl = [],
                        key, len, targ;
                    for(key in touches) {
                        if(touches.hasOwnProperty(key)) {
                            tl[i++] = touches[key];
                            targ = touch_targets[key];

                            if(targ === target) {
                                ttl.push(touches[key]);
                            }
                        }
                    }
                    for(i = 0, len = changedTouches.length; i<len; i++) {
                        ctl[i] = touches[changedTouches[i].identifier];
                    }

                    var touch_list, changed_touch_list, target_touch_list;

                    if(document.createTouchList) {
                        touch_list = document.createTouchList.apply(document, tl);
                        changed_touch_list = document.createTouchList.apply(document, ctl);
                        target_touch_list = document.createTouchList.apply(document, ttl);
                    } else {
                        touch_list = tl;
                        changed_touch_list = ctl;
                        target_touch_list = ttl;
                    }

                    if(type === "touchend" || type === "touchcancel") {
                        changedTouches.forEach(function(touch) {
                            delete touches[touch.identifier];
                            delete touch_targets[touch.identifier];
                        });
                    }

                    try {
                        //touch_event = document.createEvent('TouchEvent');
                        //touch_event.initTouchEvent(changed_touch_list, target_touch_list, touch_list, e.type, root);
                        touch_event = new TouchEvent(e.type, {
                            touches: touch_list,
                            changedTouches: changed_touch_list,
                            targetTouches: target_touch_list
                        });
                    } catch(err) {
                        touch_event = new CustomEvent(type, {
                            bubbles: true,
                            cancelable: false,
                            detail: {
                                touches: touch_list,
                                changedTouches: changed_touch_list,
                                targetTouches: touch_list
                            }
                        });
                        touch_event.touches = touch_list;
                        touch_event.targetTouches = target_touch_list;
                        touch_event.changedTouches = changed_touch_list;
                    }

                    touch_event.simulated = true;

                    target.dispatchEvent(touch_event);

                    if(index === touch_log.length-1) {
                        resolve();
                    }
                    timeouts.shift();
                    fns.shift();
                };
                var timeoutID = setTimeout(fn, e.timestamp - starting_time);
                fns.push(fn);
                timeouts.push(timeoutID);
            });
        }
    });

    rv['stop'] = function() {
        timeouts.forEach(function(timeoutID) {
            clearTimeout(timeoutID);
        });
        fns.forEach(function(fn) {
            fn();
        });
    };

    return rv;
}