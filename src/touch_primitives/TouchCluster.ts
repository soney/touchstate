/* tslint:disable */
import * as cjs from 'constraintjs';
import {filter, each, isArray, every, keys, last, map, extend, some, bind} from 'lodash';
import {CrossEvent} from './cross_event';
import {Path} from './Path';
import * as Snap from 'snapsvg';
import { EventEmitter } from 'events';

/*
 * downInside
 * downOutside
 *
 * numFingers
 *
 * maxRadius
 */
const average = function(arr:number[]):number {
		let sum = 0;
		each(arr, function(x) { sum += x; });
		return sum / arr.length;
	}, distanceSquared = function(x1:number, y1:number, x2:number, y2:number):number {
		return Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
	}, getTime = function():number {
		return (new Date()).getTime();
	};

const touchClusters:TouchCluster[] = [];
let touches:cjs.MapConstraint;

function addListeners():void {
	touches = cjs({});

	window.addEventListener("touchstart",  _onTouchStart);
	window.addEventListener("touchmove",   _onTouchMove);
	window.addEventListener("touchend",    _onTouchEnd);
	window.addEventListener("touchcancel", _onTouchEnd);
}

function removeListeners():void {
	touches.destroy(true);
	touches = null;

	window.removeEventListener("touchstart",  _onTouchStart);
	window.removeEventListener("touchmove",   _onTouchMove);
	window.removeEventListener("touchend",    _onTouchEnd);
	window.removeEventListener("touchcancel", _onTouchEnd);
}


function computeTouchDistances() {
	const touchObject = touches.toObject(),
		touchValues = {},
		matrix = {},
		identifiers = touches.keys(),
		len = identifiers.length;

	each(touchObject, function(touchMap, identifier) {
		touchValues[identifier] = touchMap.toObject();
		matrix[identifier] = {};
		matrix[identifier][identifier] = 0;
	});

	for(let i = 0; i < len-1; i++) {
		const identifieri = identifiers[i];
		const touchi = touchValues[identifieri];
		if(touchi.pressed) {
			for(let j = i+1; j<len; j++) {
				const identifierj = identifiers[j];
				const touchj = touchValues[identifierj];

				const distance = Math.sqrt(Math.pow(touchi.x - touchj.x, 2) + Math.pow(touchi.y - touchj.y, 2));

				matrix[identifieri][identifierj] = matrix[identifierj][identifieri] = distance;
			}
		}
	}

	return matrix;
}

function _onTouchStart(event) {
	var unsatisfiedTouchClusters = filter(touchClusters, function(touchCluster) {
			return !touchCluster.isSatisfied();
		}),
		currTime = getTime();

	cjs.wait();

	each(touchClusters, function(touchCluster) {
		//touchCluster.pruneTimedOutUsableFingers();
		//touchCluster.pruneClaimedFingers();
		var downInside = touchCluster.options.downInside,
			downOutside = touchCluster.options.downOutside;

		if(downInside) {
			if(!isArray(downInside)) {
				downInside = [downInside];
			}
		}
		if(downOutside) {
			if(!isArray(downOutside)) {
				downOutside = [downOutside];
			}
		}

		each(event.changedTouches, function(touch) {
			var downInsideOK = true,
				downOutsideOK = true;

			if(downInside) {
				downInsideOK = every(downInside as any[], function(path) {
					var pathString = path.toString();
					if(Snap.path.isPointInside(pathString, touch.pageX, touch.pageY)) {
						return true;
					} else {
						return false;
					}
				});
			}

			if(downOutside) {
				downOutsideOK = every(downOutside as any[], function(path) {
					var pathString = path.toString();
					if(!Snap.path.isPointInside(pathString, touch.pageX, touch.pageY)) {
						return true;
					} else {
						return false;
					}
				});
			}

			if(downInsideOK && downOutsideOK) {
				touchCluster.addUsableFinger(touch);
			}
		});
	});

	each(event.changedTouches, function(touch) {
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

	each(event.changedTouches, function(touch) {
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

	each(touchClusters, function(touchCluster) { touchCluster.removeUsableFingers(event.changedTouches); });

	var satisfiedTouchClusters = filter(touchClusters, function(touchCluster) {
			return touchCluster.isSatisfied();
		}),
		newlyUnsatisfiedTouchClusters = filter(satisfiedTouchClusters, function(touchCluster) {
			return touchCluster.usesAnyTouch(event.changedTouches);
		});


	each(newlyUnsatisfiedTouchClusters, function(touchCluster) {
		touchCluster.preUnsatisfied();
	});


	var removedUsingFinger = false;
	each(event.changedTouches, function(touch) {
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
function updateTouchDistributions(addedTouches, removedTouches?, movedTouches?) {
	var distanceMatrix = computeTouchDistances();

	each(touchClusters, function(touchCluster) {
		touchCluster.pruneClaimedFingers();
		touchCluster.pruneTimedOutUsableFingers();

		var satisfied = touchCluster.isSatisfied(),
			usableFingers = touchCluster.getUsableFingers(),
			usingFingers = touchCluster.getUsingFingers(),
			usableFingersLength = usableFingers.length,
			usingFingersLength = usingFingers.length,
			numFingers = touchCluster.options.numFingers,
			i, j, k;

		if(satisfied && removedTouches) { // see if should still be satified
			if(usableFingers.length < numFingers) {
				touchCluster.postUnsatisfied();
			} else {
				for(i = 0; i<usingFingersLength; i++) {
					if(usableFingers.indexOf(usingFingers[i]) < 0) {
						touchCluster.postUnsatisfied();
						break;
					}
				}
			}
		} else if(!satisfied && addedTouches) { // check if now satisfied

			if(usableFingers.length >= numFingers) {
				if(numFingers > 1) {
					var closestTouchArr:(number[]|string[]) = keys(closestTouchObject),
						radiusOK = false;
					if(usableFingers.length === numFingers) {
						closestTouchArr = usableFingers;
					} else {
						var usableFingersDistances = {},
							identifieri, identifierj,
							smallestDistances = [], largestSmallDistance = false, distance, inserted, distance_info;

						for(i = 0; i<usableFingersLength; i++) {
							identifieri = usableFingers[i];
							for(j = i+1; j<usableFingersLength; j++) {
								identifierj = usableFingers[j];
								distance = distanceMatrix[identifieri][identifierj];
								if(smallestDistances.length < numFingers || distance < largestSmallDistance) {
									inserted = false;
									distance_info = {
										identifiers: [identifieri, identifierj],
										distance: distance
									};

									for(k = 0; k < smallestDistances.length; k++) {
										if(distance < smallestDistances[k].distance) {
											smallestDistances.splice(k, 0, distance_info);
											inserted = true;

											break;
										}
									}

									if(!inserted) {
										smallestDistances.push(distance_info);
										largestSmallDistance = distance;
									}

									if(smallestDistances.length > numFingers) {
										smallestDistances.splice(numFingers, numFingers-smallestDistances.length);
									}

									largestSmallDistance = (last(smallestDistances) as any).distance;
								}
							}
						}

						var closestTouchObject = {};
						each(smallestDistances, function(distance) {
							closestTouchObject[distance.identifiers[0]] =
								closestTouchObject[distance.identifiers[1]] = true;
						});
						closestTouchArr = keys(closestTouchObject);
					}

					if(touchCluster.options.maxRadius) {
						radiusOK = true;
						let touches = map(closestTouchArr, function(identifier) {
								return (touches as any).get(identifier);
							}),
							center = {
								x: average(map(touches, 'x')),
								y: average(map(touches, 'y'))
							},
							maxRadiusSquared = Math.pow(touchCluster.options.maxRadius, 2);

						if(every(touches, function(touch) {
								return distanceSquared(touch.x, touch.y, center.x, center.y) <= maxRadiusSquared;
							})) {
							radiusOK = true;
						}
					} else {
						radiusOK = true;
					}

					if(radiusOK) {
						touchCluster.postSatisfied(closestTouchArr as number[]);
					}
				} else {
					touchCluster.postSatisfied([usableFingers[0]]);
				}
			}
		}
	});
}

const twoPI = 2*Math.PI;

export interface TouchClusterOptions {
	downInside?: boolean|any[],
	downOutside?: boolean|any[],
	numFingers?: number,
	maxRadius?: number,
	maxTouchInterval?: number,
	greedy?: boolean
};

export class TouchCluster extends EventEmitter {
	public static optionDefaults:TouchClusterOptions = {
		downInside: false,
		downOutside: false,

		numFingers: 1,

		maxRadius: null,
		maxTouchInterval: 500,

		greedy: false
	};
	private static tc_id:number = 0;
	private _id:number = TouchCluster.tc_id++;
	private startForce:cjs.Constraint = cjs(0);
	private $force:cjs.Constraint = cjs(() => {
		var touchLocations = this.$usingTouchInfo.get();
		if(touchLocations.length > 0) {
			return average(map(touchLocations, 'force'));
		} else {
			return 0;
		}
	});
	private $startForce:cjs.Constraint = cjs(0);
	private $endForce:cjs.Constraint = cjs(0);
	private $usableFingers:cjs.ArrayConstraint = cjs([]);
	private $usingFingers:cjs.ArrayConstraint = cjs([]);
	private $satisfied:cjs.Constraint = cjs(false);
	private $usingTouchInfo:cjs.Constraint = cjs(() => {
		var touchLocations = [];
		this.$usingFingers.forEach(function(touchID) {
			var touch = touches.get(parseInt(touchID)),
				touchObj = touch.toObject();
			touchLocations.push(touchObj);
		}, this);
		return touchLocations;
	});
	private $startCenter:cjs.Constraint = cjs.constraint({x:false, y:false});
	private $center:cjs.Constraint = cjs(() => {
		var touchLocations = this.$usingTouchInfo.get();

		if(touchLocations.length > 0) {
			var averageX = average(map(touchLocations, 'x')),
				averageY = average(map(touchLocations, 'y'));
			return { x: averageX, y: averageY };
		} else {
			return { x: false, y: false };
		}
	});
	private $endCenter:cjs.Constraint = cjs(false);
	private $startRadius:cjs.Constraint = cjs(() => {
		const touchLocations = this.$usingTouchInfo.get(),
			startCenter = this.$startCenter.get();

		if(touchLocations.length > 0) {
			let maxDistance:number;
			each(touchLocations, function(touchLocation) {
				const dSq = distanceSquared(startCenter.x, startCenter.y, touchLocation.startX, touchLocation.startY);
				if(!maxDistance || dSq < maxDistance) {
					maxDistance = dSq;
				}
			});
			const r = Math.sqrt(maxDistance);

			return r;
		} else {
			return false;
		}
	});
	private $radius:cjs.Constraint = cjs(() => {
		const touchLocations = this.$usingTouchInfo.get(),
			center = this.$center.get();

		if(touchLocations.length > 0) {
			let maxDistance:number;
			each(touchLocations, function(touchLocation) {
				const dSq = distanceSquared(center.x, center.y, touchLocation.x, touchLocation.y);
				if(!maxDistance || dSq < maxDistance) {
					maxDistance = dSq;
				}
			});
			const r = Math.sqrt(maxDistance);

			return r;
		} else {
			return false;
		}
	});
	private $endRadius:cjs.Constraint = cjs(false);
	private $rotation:cjs.Constraint = cjs(() => {
		const usingFingers = this.$usingFingers.toArray();
		if(usingFingers.length > 1) {
			const touchLocations = this.$usingTouchInfo.get(),
				startCenter = this.$startCenter.get(),
				center = this.$center.get();

			const angleDiffs = map(touchLocations, function(point) {
					let origAngle = Math.atan2(point.y - center.y, point.x - center.x),
						newAngle = Math.atan2(point.startY - startCenter.y, point.startX - startCenter.x);
					while(origAngle < 0) { origAngle += twoPI; }
					while(newAngle < 0) { newAngle += twoPI; }
					let diff = newAngle - origAngle;
					while(diff < 0) { diff += twoPI; }
					return diff;
				});
			let averageDiff = average(angleDiffs as number[]);
			while(averageDiff >= Math.PI) {
				averageDiff -= twoPI;
			}
			return averageDiff;
		} else {
			return false;
		}
	});
	private $endRotation:cjs.Constraint = cjs(false);
	private $scale:cjs.Constraint = cjs(() => {
		var usingFingers = this.$usingFingers.toArray();
		if(usingFingers.length > 1) {
			var touchLocations = this.$usingTouchInfo.get(),
				startCenter = this.$startCenter.get(),
				center = this.$center.get();

			var startDistance = average(map(touchLocations, function(point) {
					return Math.sqrt(Math.pow(point.startX - startCenter.x, 2) + Math.pow(point.startY - startCenter.y, 2));
				})),
				currentDistance = average(map(touchLocations, function(point) {
					return Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
				}));

			return currentDistance / startDistance;
		} else {
			return false;
		}
	});
	private $endScale:cjs.Constraint = cjs(false);
	private $claimed:cjs.Constraint = cjs(false);
	private $xConstraint:cjs.Constraint = this.$center.prop('x');
	private $yConstraint:cjs.Constraint = this.$center.prop('y');
	private $startXConstraint:cjs.Constraint = this.$startCenter.prop('x');
	private $startYConstraint:cjs.Constraint = this.$startCenter.prop('y');
	private $endXConstraint:cjs.Constraint = this.$endCenter.prop('x');
	private $endYConstraint:cjs.Constraint = this.$endCenter.prop('y');
	private crossEvents:CrossEvent[] = [];
	public constructor (public options?:TouchClusterOptions) {
		super();
		this.options = extend({}, TouchCluster.optionDefaults, this.options);

		touchClusters.push(this);
		if(touchClusters.length === 1) { addListeners(); }
	};
	public addCrossListener(path:Path, callback:Function):this {
		const crossEvent = new CrossEvent({
			cluster: this,
			path
		});
		this.crossEvents.push(crossEvent);

		crossEvent.on('cross', (e) => {
			//this._emit('cross', e);
			callback(e);
		});
		return this;
	};
	public destroy(silent:boolean):void {
		var index = touchClusters.indexOf(this);
		if(index >= 0) {
			touchClusters.splice(index, 1);
			if(touchClusters.length === 0) { removeListeners(); }
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

	public isGreedy():boolean { return this.options.greedy; };

	public isSatisfied():boolean { return this.$satisfied.get(); };
	public isSatisfiedConstraint():cjs.Constraint { return this.$satisfied; };

	public preUnsatisfied():void {
		this.$endCenter.set(this.$center.get());
		this.$endRadius.set(this.$radius.get());
		this.$endRotation.set(this.$rotation.get());
		this.$endScale.set(this.$scale.get());
		this.$endForce.set(this.$force.get());
	};

	public postUnsatisfied():void {
		cjs.wait();
		this.$usingFingers.forEach(function(touchID) {
			var touch = touches.get(touchID),
				usedBy = touch.get('usedBy'),
				claimedBy = touch.get('claimedBy'),
				index = usedBy.indexOf(this);
			if(index >= 0) {
				usedBy.splice(index, 1);
			}

			index = claimedBy.indexOf(this);
			if(index >= 0) {
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

	public postSatisfied(usingFingers:number[]):void {
		cjs.wait();

		this.$satisfied.set(true);
		this.$usingFingers.setValue(usingFingers);
		each(usingFingers, (touchID) => {
			var touch = touches.get(touchID),
				usedBy = touch.get('usedBy');
			usedBy.push(this);
		});

		var touchLocations = this.$usingTouchInfo.get();
		if(touchLocations.length > 0) {
			var averageX = average(map(touchLocations, 'startX')),
				averageY = average(map(touchLocations, 'startY'));
			this.$startCenter.set({ x: averageX, y: averageY });
		} else {
			this.$startCenter.set({ x: false, y: false });
		}

		var averageForce = average(map(touchLocations, 'force'));
		this.$startForce.set(averageForce);

		this.emit('satisfied');

		if(this.isGreedy()) {
			this.claimTouches();
		}

		cjs.signal();
	};

	//proto.getSatisfiedEvent = function() { return this.satisfied; };
	//proto.getUnsatisfiedEvent = function() { return this.unsatisfied; };

	public getX():number { return this.$xConstraint.get(); };
	public getY():number { return this.$yConstraint.get(); };
	public getXConstraint():cjs.Constraint { return this.$xConstraint; };
	public getYConstraint():cjs.Constraint { return this.$yConstraint; };
	public getStartX():number { return this.$startXConstraint.get(); };
	public getStartY():number { return this.$startYConstraint.get(); };
	public getStartXConstraint():cjs.Constraint { return this.$startXConstraint; };
	public getStartYConstraint():cjs.Constraint { return this.$startYConstraint; };

	public getEndX():number { return this.$endXConstraint.get(); };
	public getEndY():number { return this.$endYConstraint.get(); };
	public getEndXConstraint():cjs.Constraint { return this.$endXConstraint; };
	public getEndYConstraint():cjs.Constraint { return this.$endYConstraint; };

	public getRadius():number { return this.$radius.get(); };
	public getRadiusConstraint():cjs.Constraint { return this.$radius; };
	public getStartRadius():number { return this.$startRadius.get(); };
	public getStartRadiusConstraint():cjs.Constraint { return this.$radius.get(); };
	public getEndRadius():number { return this.$endRadius.get(); };
	public getEndRadiusConstraint():cjs.Constraint { return this.$endRadius; };

	public getRotation():number { return this.$rotation.get(); };
	public getRotationConstraint():cjs.Constraint { return this.$rotation; };
	public getEndRotation():number { return this.$endRotation.get(); };
	public getEndRotationConstraint():cjs.Constraint { return this.$endRotation; };

	public getScale():number { return this.$scale.get(); };
	public getScaleConstraint():cjs.Constraint { return this.$scale; };
	public getEndScale():number { return this.$endScale.get(); };
	public getEndScaleConstraint():cjs.Constraint { return this.$endScale; };

	public getForce():number { return this.$force.get(); };
	public getForceConstraint():cjs.Constraint { return this.$force; };
	public getStartForce():number { return this.$startForce.get(); };
	public getStartForceConstraint():cjs.Constraint { return this.$startForce; };
	public getEndForce():number { return this.$endForce.get(); };
	public getEndForceConstraint():cjs.Constraint { return this.$endForce; };

	public setOption(a:string|{[key:string]:any}, b?:any):void {
		if(arguments.length === 1) {
			extend(this.options, a);
		} else if(arguments.length > 1) {
			this.options[a as string] = b;
		}
	};

	public usesTouch(touch:Touch):boolean {
		var identifier = touch.identifier;
		return this.$usingFingers.indexOf(identifier) >= 0;
	};
	public usesAnyTouch(touches:Touch[]):boolean {
		return some(touches, (t) => this.usesTouch(t));
	};

	public removeUsableFinger(touch:Touch):void {
		var index = this.$usableFingers.indexOf(touch.identifier);
		if(index >= 0) {
			this.$usableFingers.splice(index, 1);
		}
	};
	public removeUsableFingers(touches:Touch[]):void {
		each(touches, t => this.removeUsableFinger(t));
	};
	public addUsableFinger(touch:Touch):void {
		this.$usableFingers.push(touch.identifier);
	};
	public addUsableFingers(touches:Touch[]):void {
		each(touches, t => this.addUsableFinger(t));
	};
	public getUsableFingers():number[] {
		return this.$usableFingers.toArray();
	};
	public getUsingFingers():number[] {
		return this.$usingFingers.toArray();
	};
	public pruneClaimedFingers():void {
		const usableFingers = this.getUsableFingers(),
			currTime = getTime();
		let len:number = usableFingers.length;
		for(let i:number = 0; i<len; i++) {
			var touch = touches.get(usableFingers[i]),
				claimedBy = touch.get('claimedBy');

			if(claimedBy.length > 0 && claimedBy.indexOf(this) < 0) {
				this.$usableFingers.splice(i, 1);
				usableFingers.splice(i, 1);
				i--;
				len--;
			}
		}
	};
	public pruneTimedOutUsableFingers():void {
		if(this.options.maxTouchInterval) {
			const usableFingers = this.getUsableFingers(),
				len = usableFingers.length,
				currTime = getTime();

			let toRemoveLen:number = 0;
			for(let i:number = 0; i<len; i++) {
				var touch = touches.get(usableFingers[i]),
					touchdownTime = touch.get('downAt');
				if(currTime - touchdownTime > this.options.maxTouchInterval) {
					toRemoveLen = i;
				} else {
					break;
				}
			}
		}
	};

	public getTouches():Touch[] {
		return this.$usingTouchInfo.get();
	};

	public claimTouches():void {
		cjs.wait();
		this.$claimed.set(true);
		this.$usingFingers.forEach(function(touchID) {
			var touch = touches.get(touchID),
				claimedBy = touch.get('claimedBy'),
				usedBy = touch.get('usedBy');

			claimedBy.push(this);

			var toRemove = [];
			usedBy.forEach(function(tc, i) {
				if(tc !== this) {
					toRemove[i] = tc;
				}
			}, this);

			toRemove.reverse();
			toRemove.forEach(function(tc, index) {
				if(tc) {
					tc.preUnsatisfied();
					tc.postUnsatisfied();
					usedBy.splice(index, 1);
				}
			});
		}, this);
		cjs.signal();
	};

	public disclaimTouches():void {
		cjs.wait();
		this.$claimed.set(false);
		this.$usingFingers.forEach(function(touchID) {
			var touch = touches.get(touchID),
				claimedBy = touch.get('claimedBy'),
				index = claimedBy.indexOf(this);
			if(index >= 0) {
				claimedBy.splice(index, 1);
			}
		}, this);
		cjs.signal();
	};

	public claimsTouches():boolean {
		return this.$claimed.get();
	};
	public id():number { return this._id; };
	public sid = this.id;
};