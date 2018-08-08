var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* tslint:disable */
import * as cjs from 'constraintjs';
import { filter, each, isArray, every, keys, last, map, extend, some } from 'lodash';
import { CrossEvent } from './cross_event';
import { EventEmitter } from 'events';
import { isPointInsidePath } from './pathutils';
/*
 * downInside
 * downOutside
 *
 * numFingers
 *
 * maxRadius
 */
var average = function (arr) {
    var sum = 0;
    each(arr, function (x) { sum += x; });
    return sum / arr.length;
}, distanceSquared = function (x1, y1, x2, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}, getTime = function () {
    return (new Date()).getTime();
};
var touchClusters = [];
var touches;
function addListeners() {
    touches = cjs({});
    window.addEventListener("touchstart", _onTouchStart);
    window.addEventListener("touchmove", _onTouchMove);
    window.addEventListener("touchend", _onTouchEnd);
    window.addEventListener("touchcancel", _onTouchEnd);
}
function removeListeners() {
    touches.destroy(true);
    touches = null;
    window.removeEventListener("touchstart", _onTouchStart);
    window.removeEventListener("touchmove", _onTouchMove);
    window.removeEventListener("touchend", _onTouchEnd);
    window.removeEventListener("touchcancel", _onTouchEnd);
}
function computeTouchDistances() {
    var touchObject = touches.toObject(), touchValues = {}, matrix = {}, identifiers = touches.keys(), len = identifiers.length;
    each(touchObject, function (touchMap, identifier) {
        touchValues[identifier] = touchMap.toObject();
        matrix[identifier] = {};
        matrix[identifier][identifier] = 0;
    });
    for (var i = 0; i < len - 1; i++) {
        var identifieri = identifiers[i];
        var touchi = touchValues[identifieri];
        if (touchi.pressed) {
            for (var j = i + 1; j < len; j++) {
                var identifierj = identifiers[j];
                var touchj = touchValues[identifierj];
                var distance = Math.sqrt(Math.pow(touchi.x - touchj.x, 2) + Math.pow(touchi.y - touchj.y, 2));
                matrix[identifieri][identifierj] = matrix[identifierj][identifieri] = distance;
            }
        }
    }
    return matrix;
}
function _onTouchStart(event) {
    var unsatisfiedTouchClusters = filter(touchClusters, function (touchCluster) {
        return !touchCluster.isSatisfied();
    }), currTime = getTime();
    cjs.wait();
    each(touchClusters, function (touchCluster) {
        //touchCluster.pruneTimedOutUsableFingers();
        //touchCluster.pruneClaimedFingers();
        var downInside = touchCluster.options.downInside, downOutside = touchCluster.options.downOutside;
        if (downInside) {
            if (!isArray(downInside)) {
                downInside = [downInside];
            }
        }
        if (downOutside) {
            if (!isArray(downOutside)) {
                downOutside = [downOutside];
            }
        }
        each(event.changedTouches, function (touch) {
            var downInsideOK = true, downOutsideOK = true;
            if (downInside) {
                downInsideOK = every(downInside, function (path) {
                    var pathString = path.toString();
                    if (isPointInsidePath(pathString, touch.pageX, touch.pageY)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
            if (downOutside) {
                downOutsideOK = every(downOutside, function (path) {
                    var pathString = path.toString();
                    if (!isPointInsidePath(pathString, touch.pageX, touch.pageY)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
            if (downInsideOK && downOutsideOK) {
                touchCluster.addUsableFinger(touch);
            }
        });
    });
    each(event.changedTouches, function (touch) {
        touches.put(parseInt(touch.identifier), cjs({
            x: touch.pageX,
            y: touch.pageY,
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            force: touch.force,
            downAt: currTime,
            movedAt: currTime,
            pressed: true,
            claimedBy: [],
            usedBy: []
        }));
    });
    updateTouchDistributions(event.changedTouches);
    cjs.signal();
    // Recompute active touches
    event.preventDefault();
    event.stopPropagation();
}
function _onTouchMove(event) {
    var currTime = getTime();
    cjs.wait();
    each(event.changedTouches, function (touch) {
        var touchMap = touches.get(parseInt(touch.identifier));
        touchMap.put('x', touch.clientX)
            .put('y', touch.clientY)
            .put('force', touch.force)
            .put('movedAt', currTime);
    });
    cjs.signal();
    // radius checking
    event.preventDefault();
    event.stopPropagation();
}
function _onTouchEnd(event) {
    var currTime = getTime();
    cjs.wait();
    each(touchClusters, function (touchCluster) { touchCluster.removeUsableFingers(event.changedTouches); });
    var satisfiedTouchClusters = filter(touchClusters, function (touchCluster) {
        return touchCluster.isSatisfied();
    }), newlyUnsatisfiedTouchClusters = filter(satisfiedTouchClusters, function (touchCluster) {
        return touchCluster.usesAnyTouch(event.changedTouches);
    });
    each(newlyUnsatisfiedTouchClusters, function (touchCluster) {
        touchCluster.preUnsatisfied();
    });
    var removedUsingFinger = false;
    each(event.changedTouches, function (touch) {
        var touchMap = touches.get(parseInt(touch.identifier));
        touchMap.put('x', touch.clientX)
            .put('y', touch.clientY)
            .put('movedAt', currTime)
            .put('force', touch.force)
            .put('pressed', false);
    });
    updateTouchDistributions(false, event.changedTouches);
    cjs.signal();
    // Recompute active touches
    event.preventDefault();
    event.stopPropagation();
}
function updateTouchDistributions(addedTouches, removedTouches, movedTouches) {
    var distanceMatrix = computeTouchDistances();
    each(touchClusters, function (touchCluster) {
        touchCluster.pruneClaimedFingers();
        touchCluster.pruneTimedOutUsableFingers();
        var satisfied = touchCluster.isSatisfied(), usableFingers = touchCluster.getUsableFingers(), usingFingers = touchCluster.getUsingFingers(), usableFingersLength = usableFingers.length, usingFingersLength = usingFingers.length, numFingers = touchCluster.options.numFingers, i, j, k;
        if (satisfied && removedTouches) { // see if should still be satified
            if (usableFingers.length < numFingers) {
                touchCluster.postUnsatisfied();
            }
            else {
                for (i = 0; i < usingFingersLength; i++) {
                    if (usableFingers.indexOf(usingFingers[i]) < 0) {
                        touchCluster.postUnsatisfied();
                        break;
                    }
                }
            }
        }
        else if (!satisfied && addedTouches) { // check if now satisfied
            if (usableFingers.length >= numFingers) {
                if (numFingers > 1) {
                    var closestTouchArr = keys(closestTouchObject), radiusOK = false;
                    if (usableFingers.length === numFingers) {
                        closestTouchArr = usableFingers;
                    }
                    else {
                        var usableFingersDistances = {}, identifieri, identifierj, smallestDistances = [], largestSmallDistance = false, distance, inserted, distance_info;
                        for (i = 0; i < usableFingersLength; i++) {
                            identifieri = usableFingers[i];
                            for (j = i + 1; j < usableFingersLength; j++) {
                                identifierj = usableFingers[j];
                                distance = distanceMatrix[identifieri][identifierj];
                                if (smallestDistances.length < numFingers || distance < largestSmallDistance) {
                                    inserted = false;
                                    distance_info = {
                                        identifiers: [identifieri, identifierj],
                                        distance: distance
                                    };
                                    for (k = 0; k < smallestDistances.length; k++) {
                                        if (distance < smallestDistances[k].distance) {
                                            smallestDistances.splice(k, 0, distance_info);
                                            inserted = true;
                                            break;
                                        }
                                    }
                                    if (!inserted) {
                                        smallestDistances.push(distance_info);
                                        largestSmallDistance = distance;
                                    }
                                    if (smallestDistances.length > numFingers) {
                                        smallestDistances.splice(numFingers, numFingers - smallestDistances.length);
                                    }
                                    largestSmallDistance = last(smallestDistances).distance;
                                }
                            }
                        }
                        var closestTouchObject = {};
                        each(smallestDistances, function (distance) {
                            closestTouchObject[distance.identifiers[0]] =
                                closestTouchObject[distance.identifiers[1]] = true;
                        });
                        closestTouchArr = keys(closestTouchObject);
                    }
                    if (touchCluster.options.maxRadius) {
                        radiusOK = true;
                        var touches_1 = map(closestTouchArr, function (identifier) {
                            return touches_1.get(identifier);
                        }), center_1 = {
                            x: average(map(touches_1, 'x')),
                            y: average(map(touches_1, 'y'))
                        }, maxRadiusSquared_1 = Math.pow(touchCluster.options.maxRadius, 2);
                        if (every(touches_1, function (touch) {
                            return distanceSquared(touch.x, touch.y, center_1.x, center_1.y) <= maxRadiusSquared_1;
                        })) {
                            radiusOK = true;
                        }
                    }
                    else {
                        radiusOK = true;
                    }
                    if (radiusOK) {
                        touchCluster.postSatisfied(closestTouchArr);
                    }
                }
                else {
                    touchCluster.postSatisfied([usableFingers[0]]);
                }
            }
        }
    });
}
var twoPI = 2 * Math.PI;
;
var TouchCluster = /** @class */ (function (_super) {
    __extends(TouchCluster, _super);
    function TouchCluster(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this._id = TouchCluster.tc_id++;
        _this.startForce = cjs(0);
        _this.$force = cjs(function () {
            var touchLocations = _this.$usingTouchInfo.get();
            if (touchLocations.length > 0) {
                return average(map(touchLocations, 'force'));
            }
            else {
                return 0;
            }
        });
        _this.$startForce = cjs(0);
        _this.$endForce = cjs(0);
        _this.$usableFingers = cjs([]);
        _this.$usingFingers = cjs([]);
        _this.$satisfied = cjs(false);
        _this.$usingTouchInfo = cjs(function () {
            var touchLocations = [];
            _this.$usingFingers.forEach(function (touchID) {
                var touch = touches.get(parseInt(touchID)), touchObj = touch.toObject();
                touchLocations.push(touchObj);
            }, _this);
            return touchLocations;
        });
        _this.$startCenter = cjs.constraint({ x: false, y: false });
        _this.$center = cjs(function () {
            var touchLocations = _this.$usingTouchInfo.get();
            if (touchLocations.length > 0) {
                var averageX = average(map(touchLocations, 'x')), averageY = average(map(touchLocations, 'y'));
                return { x: averageX, y: averageY };
            }
            else {
                return { x: false, y: false };
            }
        });
        _this.$endCenter = cjs(false);
        _this.$startRadius = cjs(function () {
            var touchLocations = _this.$usingTouchInfo.get(), startCenter = _this.$startCenter.get();
            if (touchLocations.length > 0) {
                var maxDistance_1;
                each(touchLocations, function (touchLocation) {
                    var dSq = distanceSquared(startCenter.x, startCenter.y, touchLocation.startX, touchLocation.startY);
                    if (!maxDistance_1 || dSq < maxDistance_1) {
                        maxDistance_1 = dSq;
                    }
                });
                var r = Math.sqrt(maxDistance_1);
                return r;
            }
            else {
                return false;
            }
        });
        _this.$radius = cjs(function () {
            var touchLocations = _this.$usingTouchInfo.get(), center = _this.$center.get();
            if (touchLocations.length > 0) {
                var maxDistance_2;
                each(touchLocations, function (touchLocation) {
                    var dSq = distanceSquared(center.x, center.y, touchLocation.x, touchLocation.y);
                    if (!maxDistance_2 || dSq < maxDistance_2) {
                        maxDistance_2 = dSq;
                    }
                });
                var r = Math.sqrt(maxDistance_2);
                return r;
            }
            else {
                return false;
            }
        });
        _this.$endRadius = cjs(false);
        _this.$rotation = cjs(function () {
            var usingFingers = _this.$usingFingers.toArray();
            if (usingFingers.length > 1) {
                var touchLocations = _this.$usingTouchInfo.get(), startCenter_1 = _this.$startCenter.get(), center_2 = _this.$center.get();
                var angleDiffs = map(touchLocations, function (point) {
                    var origAngle = Math.atan2(point.y - center_2.y, point.x - center_2.x), newAngle = Math.atan2(point.startY - startCenter_1.y, point.startX - startCenter_1.x);
                    while (origAngle < 0) {
                        origAngle += twoPI;
                    }
                    while (newAngle < 0) {
                        newAngle += twoPI;
                    }
                    var diff = newAngle - origAngle;
                    while (diff < 0) {
                        diff += twoPI;
                    }
                    return diff;
                });
                var averageDiff = average(angleDiffs);
                while (averageDiff >= Math.PI) {
                    averageDiff -= twoPI;
                }
                return averageDiff;
            }
            else {
                return false;
            }
        });
        _this.$endRotation = cjs(false);
        _this.$scale = cjs(function () {
            var usingFingers = _this.$usingFingers.toArray();
            if (usingFingers.length > 1) {
                var touchLocations = _this.$usingTouchInfo.get(), startCenter = _this.$startCenter.get(), center = _this.$center.get();
                var startDistance = average(map(touchLocations, function (point) {
                    return Math.sqrt(Math.pow(point.startX - startCenter.x, 2) + Math.pow(point.startY - startCenter.y, 2));
                })), currentDistance = average(map(touchLocations, function (point) {
                    return Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
                }));
                return currentDistance / startDistance;
            }
            else {
                return false;
            }
        });
        _this.$endScale = cjs(false);
        _this.$claimed = cjs(false);
        _this.$xConstraint = _this.$center.prop('x');
        _this.$yConstraint = _this.$center.prop('y');
        _this.$startXConstraint = _this.$startCenter.prop('x');
        _this.$startYConstraint = _this.$startCenter.prop('y');
        _this.$endXConstraint = _this.$endCenter.prop('x');
        _this.$endYConstraint = _this.$endCenter.prop('y');
        _this.crossEvents = [];
        _this.sid = _this.id;
        _this.options = extend({}, TouchCluster.optionDefaults, _this.options);
        touchClusters.push(_this);
        if (touchClusters.length === 1) {
            addListeners();
        }
        return _this;
    }
    ;
    TouchCluster.prototype.addCrossListener = function (path, callback) {
        var crossEvent = new CrossEvent({
            cluster: this,
            path: path
        });
        this.crossEvents.push(crossEvent);
        crossEvent.on('cross', function (e) {
            //this._emit('cross', e);
            callback(e);
        });
        return this;
    };
    ;
    TouchCluster.prototype.destroy = function (silent) {
        var index = touchClusters.indexOf(this);
        if (index >= 0) {
            touchClusters.splice(index, 1);
            if (touchClusters.length === 0) {
                removeListeners();
            }
        }
        this.$usableFingers.destroy(true);
        this.$usingFingers.destroy(true);
        this.$usingTouchInfo.destroy(true);
        this.$startCenter.destroy(true);
        this.$center.destroy(true);
        this.$endCenter.destroy(true);
        this.$scale.destroy(true);
        this.$endScale.destroy(true);
        this.$endRotation.destroy(true);
        this.$startRadius.destroy(true);
        this.$radius.destroy(true);
        this.$endRadius.destroy(true);
        this.$radius.destroy(true);
        this.$claimed.destroy(true);
        this.$xConstraint.destroy(true);
        this.$startXConstraint.destroy(true);
        this.$startYConstraint.destroy(true);
        this.$endXConstraint.destroy(true);
        this.$endYConstraint.destroy(true);
        this.$force.destroy(true);
        this.$startForce.destroy(true);
        this.$endForce.destroy(true);
    };
    ;
    TouchCluster.prototype.isGreedy = function () { return this.options.greedy; };
    ;
    TouchCluster.prototype.isSatisfied = function () { return this.$satisfied.get(); };
    ;
    TouchCluster.prototype.isSatisfiedConstraint = function () { return this.$satisfied; };
    ;
    TouchCluster.prototype.preUnsatisfied = function () {
        this.$endCenter.set(this.$center.get());
        this.$endRadius.set(this.$radius.get());
        this.$endRotation.set(this.$rotation.get());
        this.$endScale.set(this.$scale.get());
        this.$endForce.set(this.$force.get());
    };
    ;
    TouchCluster.prototype.postUnsatisfied = function () {
        cjs.wait();
        this.$usingFingers.forEach(function (touchID) {
            var touch = touches.get(touchID), usedBy = touch.get('usedBy'), claimedBy = touch.get('claimedBy'), index = usedBy.indexOf(this);
            if (index >= 0) {
                usedBy.splice(index, 1);
            }
            index = claimedBy.indexOf(this);
            if (index >= 0) {
                claimedBy.splice(index, 1);
            }
        }, this);
        this.$satisfied.set(false);
        this.$claimed.set(false);
        this.$usableFingers.setValue([]);
        this.$usingFingers.setValue([]);
        this.$startCenter.set({ x: false, y: false });
        this.emit('unsatisfied');
        cjs.signal();
    };
    ;
    TouchCluster.prototype.postSatisfied = function (usingFingers) {
        var _this = this;
        cjs.wait();
        this.$satisfied.set(true);
        this.$usingFingers.setValue(usingFingers);
        each(usingFingers, function (touchID) {
            var touch = touches.get(touchID), usedBy = touch.get('usedBy');
            usedBy.push(_this);
        });
        var touchLocations = this.$usingTouchInfo.get();
        if (touchLocations.length > 0) {
            var averageX = average(map(touchLocations, 'startX')), averageY = average(map(touchLocations, 'startY'));
            this.$startCenter.set({ x: averageX, y: averageY });
        }
        else {
            this.$startCenter.set({ x: false, y: false });
        }
        var averageForce = average(map(touchLocations, 'force'));
        this.$startForce.set(averageForce);
        this.emit('satisfied');
        if (this.isGreedy()) {
            this.claimTouches();
        }
        cjs.signal();
    };
    ;
    //proto.getSatisfiedEvent = function() { return this.satisfied; };
    //proto.getUnsatisfiedEvent = function() { return this.unsatisfied; };
    TouchCluster.prototype.getX = function () { return this.$xConstraint.get(); };
    ;
    TouchCluster.prototype.getY = function () { return this.$yConstraint.get(); };
    ;
    TouchCluster.prototype.getXConstraint = function () { return this.$xConstraint; };
    ;
    TouchCluster.prototype.getYConstraint = function () { return this.$yConstraint; };
    ;
    TouchCluster.prototype.getStartX = function () { return this.$startXConstraint.get(); };
    ;
    TouchCluster.prototype.getStartY = function () { return this.$startYConstraint.get(); };
    ;
    TouchCluster.prototype.getStartXConstraint = function () { return this.$startXConstraint; };
    ;
    TouchCluster.prototype.getStartYConstraint = function () { return this.$startYConstraint; };
    ;
    TouchCluster.prototype.getEndX = function () { return this.$endXConstraint.get(); };
    ;
    TouchCluster.prototype.getEndY = function () { return this.$endYConstraint.get(); };
    ;
    TouchCluster.prototype.getEndXConstraint = function () { return this.$endXConstraint; };
    ;
    TouchCluster.prototype.getEndYConstraint = function () { return this.$endYConstraint; };
    ;
    TouchCluster.prototype.getRadius = function () { return this.$radius.get(); };
    ;
    TouchCluster.prototype.getRadiusConstraint = function () { return this.$radius; };
    ;
    TouchCluster.prototype.getStartRadius = function () { return this.$startRadius.get(); };
    ;
    TouchCluster.prototype.getStartRadiusConstraint = function () { return this.$radius.get(); };
    ;
    TouchCluster.prototype.getEndRadius = function () { return this.$endRadius.get(); };
    ;
    TouchCluster.prototype.getEndRadiusConstraint = function () { return this.$endRadius; };
    ;
    TouchCluster.prototype.getRotation = function () { return this.$rotation.get(); };
    ;
    TouchCluster.prototype.getRotationConstraint = function () { return this.$rotation; };
    ;
    TouchCluster.prototype.getEndRotation = function () { return this.$endRotation.get(); };
    ;
    TouchCluster.prototype.getEndRotationConstraint = function () { return this.$endRotation; };
    ;
    TouchCluster.prototype.getScale = function () { return this.$scale.get(); };
    ;
    TouchCluster.prototype.getScaleConstraint = function () { return this.$scale; };
    ;
    TouchCluster.prototype.getEndScale = function () { return this.$endScale.get(); };
    ;
    TouchCluster.prototype.getEndScaleConstraint = function () { return this.$endScale; };
    ;
    TouchCluster.prototype.getForce = function () { return this.$force.get(); };
    ;
    TouchCluster.prototype.getForceConstraint = function () { return this.$force; };
    ;
    TouchCluster.prototype.getStartForce = function () { return this.$startForce.get(); };
    ;
    TouchCluster.prototype.getStartForceConstraint = function () { return this.$startForce; };
    ;
    TouchCluster.prototype.getEndForce = function () { return this.$endForce.get(); };
    ;
    TouchCluster.prototype.getEndForceConstraint = function () { return this.$endForce; };
    ;
    TouchCluster.prototype.setOption = function (a, b) {
        if (arguments.length === 1) {
            extend(this.options, a);
        }
        else if (arguments.length > 1) {
            this.options[a] = b;
        }
    };
    ;
    TouchCluster.prototype.usesTouch = function (touch) {
        var identifier = touch.identifier;
        return this.$usingFingers.indexOf(identifier) >= 0;
    };
    ;
    TouchCluster.prototype.usesAnyTouch = function (touches) {
        var _this = this;
        return some(touches, function (t) { return _this.usesTouch(t); });
    };
    ;
    TouchCluster.prototype.removeUsableFinger = function (touch) {
        var index = this.$usableFingers.indexOf(touch.identifier);
        if (index >= 0) {
            this.$usableFingers.splice(index, 1);
        }
    };
    ;
    TouchCluster.prototype.removeUsableFingers = function (touches) {
        var _this = this;
        each(touches, function (t) { return _this.removeUsableFinger(t); });
    };
    ;
    TouchCluster.prototype.addUsableFinger = function (touch) {
        this.$usableFingers.push(touch.identifier);
    };
    ;
    TouchCluster.prototype.addUsableFingers = function (touches) {
        var _this = this;
        each(touches, function (t) { return _this.addUsableFinger(t); });
    };
    ;
    TouchCluster.prototype.getUsableFingers = function () {
        return this.$usableFingers.toArray();
    };
    ;
    TouchCluster.prototype.getUsingFingers = function () {
        return this.$usingFingers.toArray();
    };
    ;
    TouchCluster.prototype.pruneClaimedFingers = function () {
        var usableFingers = this.getUsableFingers(), currTime = getTime();
        var len = usableFingers.length;
        for (var i = 0; i < len; i++) {
            var touch = touches.get(usableFingers[i]), claimedBy = touch.get('claimedBy');
            if (claimedBy.length > 0 && claimedBy.indexOf(this) < 0) {
                this.$usableFingers.splice(i, 1);
                usableFingers.splice(i, 1);
                i--;
                len--;
            }
        }
    };
    ;
    TouchCluster.prototype.pruneTimedOutUsableFingers = function () {
        if (this.options.maxTouchInterval) {
            var usableFingers = this.getUsableFingers(), len = usableFingers.length, currTime = getTime();
            var toRemoveLen = 0;
            for (var i = 0; i < len; i++) {
                var touch = touches.get(usableFingers[i]), touchdownTime = touch.get('downAt');
                if (currTime - touchdownTime > this.options.maxTouchInterval) {
                    toRemoveLen = i;
                }
                else {
                    break;
                }
            }
        }
    };
    ;
    TouchCluster.prototype.getTouches = function () {
        return this.$usingTouchInfo.get();
    };
    ;
    TouchCluster.prototype.claimTouches = function () {
        cjs.wait();
        this.$claimed.set(true);
        this.$usingFingers.forEach(function (touchID) {
            var touch = touches.get(touchID), claimedBy = touch.get('claimedBy'), usedBy = touch.get('usedBy');
            claimedBy.push(this);
            var toRemove = [];
            usedBy.forEach(function (tc, i) {
                if (tc !== this) {
                    toRemove[i] = tc;
                }
            }, this);
            toRemove.reverse();
            toRemove.forEach(function (tc, index) {
                if (tc) {
                    tc.preUnsatisfied();
                    tc.postUnsatisfied();
                    usedBy.splice(index, 1);
                }
            });
        }, this);
        cjs.signal();
    };
    ;
    TouchCluster.prototype.disclaimTouches = function () {
        cjs.wait();
        this.$claimed.set(false);
        this.$usingFingers.forEach(function (touchID) {
            var touch = touches.get(touchID), claimedBy = touch.get('claimedBy'), index = claimedBy.indexOf(this);
            if (index >= 0) {
                claimedBy.splice(index, 1);
            }
        }, this);
        cjs.signal();
    };
    ;
    TouchCluster.prototype.claimsTouches = function () {
        return this.$claimed.get();
    };
    ;
    TouchCluster.prototype.id = function () { return this._id; };
    ;
    TouchCluster.optionDefaults = {
        downInside: false,
        downOutside: false,
        numFingers: 1,
        maxRadius: null,
        maxTouchInterval: 500,
        greedy: false
    };
    TouchCluster.tc_id = 0;
    return TouchCluster;
}(EventEmitter));
export { TouchCluster };
;
//# sourceMappingURL=TouchCluster.js.map