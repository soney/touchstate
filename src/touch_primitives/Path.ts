/* tslint:disable */
import * as cjs from 'constraintjs';
import { EventEmitter } from 'events';
import {last, has, isFunction, tail, map} from 'lodash';

export class PathList extends EventEmitter {
	private paths:Path[] = [];
	public constructor() {
		super();
	};
	public addPath(p:Path) {
		this.paths.push(p);
		this.emit('pathCreated', p);
	};
	public destroy(p:Path):void {
		for (let i=0; i<this.paths.length; i++) {
			if(this.paths[i] === p) {
				this.paths.splice(i, 1);
				this.emit('pathDestroyed', p);
				break;
			}
		}
	};
};
type numberOrConstraint = number | cjs.Constraint;
type booleanOrConstraint = boolean | cjs.Constraint;

enum STMT { IF, WHILE };
export const pathList = new PathList();
export class Path {
	private tree:cjs.ArrayConstraint = cjs.array();
	private curr_tree_node:(cjs.ArrayConstraint|Array<any>) = this.tree;
	private stack:(cjs.ArrayConstraint|Array<any>)[] = [this.tree];
	// private tree:cjs.array();
	public constructor() {
		pathList.addPath(this);
	};

	public m = this.relativeMoveTo;
	public moveTo = this.relativeMoveTo;
	public relativeMoveTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["m", x, y]);
		return this;
	};

	public M = this.absoluteMoveTo;
	public absoluteMoveTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["M", x, y]);
		return this;
	};

	public l = this.relativeLineTo;
	public lineTo = this.relativeLineTo;
	public relativeLineTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["l", x, y]);
		return this;
	};

	public L = this.absoluteLineTo;
	public absoluteLineTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["L", x, y]);
		return this;
	};

	public h = this.relativeHorizontalLineTo;
	public relativeHorizontalLineTo(x:numberOrConstraint):this {
		this.curr_tree_node.push(["h", x]);
		return this;
	};

	public H = this.absoluteHorizontalLineTo;
	public absoluteHorizontalLineTo(x:numberOrConstraint):this {
		this.curr_tree_node.push(["H", x]);
		return this;
	};

	public v = this.relativeVerticalLineTo;
	public relativeVerticalLineTo(y:numberOrConstraint):this {
		this.curr_tree_node.push(["v", y]);
		return this;
	};

	public V = this.absoluteVerticalLineTo;
	public absoluteVerticalLineTo(y:numberOrConstraint):this {
		this.curr_tree_node.push(["V", y]);
		return this;
	};

	public c = this.relativeCurveTo;
	public relativeCurveTo(x1:numberOrConstraint, y1:numberOrConstraint, x2:numberOrConstraint, y2:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["c", x1, y1, x2, y2, x, y]);
		return this;
	};

	public C = this.absoluteCurveTo;
	public absoluteCurveTo(x1:numberOrConstraint, y1:numberOrConstraint, x2:numberOrConstraint, y2:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["C", x1, y1, x2, y2, x, y]);
		return this;
	};

	public s = this.relativeSmoothCurveTo;
	public relativeSmoothCurveTo(x2:numberOrConstraint, y2:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["s", x2, y2, x, y]);
		return this;
	};

	public S = this.absoluteSmoothCurveTo;
	public absoluteSmoothCurveTo(x2:numberOrConstraint, y2:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["S", x2, y2, x, y]);
		return this;
	};

	public q = this.relativeQuadraticCurveTo;
	public relativeQuadraticCurveTo(x1:numberOrConstraint, y1:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["q", x1, y1, x, y]);
		return this;
	};

	public Q = this.absoluteQuadraticCurveTo;
	public absoluteQuadraticCurveTo(x1:numberOrConstraint, y1:numberOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["Q", x1, y1, x, y]);
		return this;
	};

	public t = this.relativeSmoothQuadraticCurveTo;
	public relativeSmoothQuadraticCurveTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["t", x, y]);
		return this;
	};

	public T = this.absoluteSmoothQuadraticCurveTo;
	public absoluteSmoothQuadraticCurveTo(x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["T", x, y]);
		return this;
	};

	public a = this.relativeArc;
	public relativeArc(rx:numberOrConstraint, ry:numberOrConstraint, x_axis_rotation:numberOrConstraint, large_arc_flag:booleanOrConstraint, sweep_flag:booleanOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["a", rx, ry, x_axis_rotation, large_arc_flag?1:0, sweep_flag?1:0, x, y]);
		return this;
	};

	public A = this.absoluteArc;
	public absoluteArc(rx:numberOrConstraint, ry:numberOrConstraint, x_axis_rotation:numberOrConstraint, large_arc_flag:booleanOrConstraint, sweep_flag:booleanOrConstraint, x:numberOrConstraint, y:numberOrConstraint):this {
		this.curr_tree_node.push(["A", rx, ry, x_axis_rotation, large_arc_flag?1:0, sweep_flag?1:0, x, y]);
		return this;
	};

	public ellipse(cx:numberOrConstraint, cy:numberOrConstraint, rx:numberOrConstraint, ry:numberOrConstraint):this {
		const nothing = 0.0001;
		let cx_sub_rx;

		if(cjs.isConstraint(cx)) {
			cx_sub_rx = (cx as cjs.Constraint).sub(rx);
		} else if(cjs.isConstraint(rx)){
			cx_sub_rx = cjs(function() {
				return (cx as number) - (rx as cjs.Constraint).get();
			});
		} else {
			cx_sub_rx = (cx as number) - (rx as number);
		}

		this.curr_tree_node.push(["M", cx_sub_rx, cy],
									["a", rx, ry, 0, 1, 1, 0, nothing],
									["Z"]);
		return this;
	};

	public rect(x:numberOrConstraint, y:numberOrConstraint, width:numberOrConstraint, height:numberOrConstraint):this {
		let neg_width:number|cjs.Constraint;

		if(cjs.isConstraint(width)) {
			neg_width = (width as cjs.Constraint).neg();
		} else {
			neg_width = -width;
		}

		this.curr_tree_node.push(["M", x, y],
									["h", width],
									["v", height],
									["h", neg_width],
									["Z"]);
		return this;
	};

	public circle(cx:numberOrConstraint, cy:numberOrConstraint, r:numberOrConstraint):this {
		return this.ellipse(cx, cy, r, r);
	};

	public Z = this.close;
	public close():this {
		this.curr_tree_node.push(["Z"]);
		return this;
	};

	public startIF(cond:any):this {
		const new_tree = [];
		this.curr_tree_node.push([STMT.IF, {
				condition: cond,
				tree: new_tree
			}]);

		this.curr_tree_node = new_tree;
		this.stack.push(new_tree);
		return this;
	};

	public startELIF(cond:any):this {
		this.stack.pop();

		const popped_tree_node = last(this.stack),
			if_stmt = last(popped_tree_node as Array<any>),
			elif_tree = [];

		(if_stmt as any[]).push({
			condition: cond,
			tree: elif_tree
		});

		this.curr_tree_node = elif_tree;
		this.stack.push(elif_tree);
		return this;
	};

	public startELSE():this {
		this.stack.pop();

		var popped_tree_node = last(this.stack),
			if_stmt = last(popped_tree_node as Array<any>),
			else_tree = [];

		(if_stmt as any[]).push({
			tree: else_tree
		});

		this.curr_tree_node = else_tree;
		this.stack.push(else_tree);

		return this;
	};
	public endIF():this {
		this.stack.pop();
		this.curr_tree_node = last(this.stack);
		return this;
	};

	private static nodeToString(node:any[]):string {
		const command = node[0];
		if(command === STMT.IF) {
			let tree:any[];
			let cond:any, cond_value:any;
			for(let i = 1; i<node.length; i++) {
				const node_i = node[i];
				if(has(node_i, "condition")) {
					cond = node_i.condition;
					if(isFunction(cond)) {
						cond_value = cond();
					} else {
						cond_value = cjs.get(cond);
					}
				} else {
					cond_value = true;
				}

				if(cond_value) {
					tree = node[i].tree;
					break;
				}
			}
			if(!tree) {
				tree = [];
			}

			return map(tree, Path.nodeToString).join('');
		} else {
			var args = map(tail(node), function(arg) {
							return cjs.get(arg);
						}),
				result = command + (args.length === 0 ? "" : (" " + args.join(",")));
			return result;
		}
	};

	public toString():string {
		const commands = map(this.tree.toArray(), Path.nodeToString);
		const stringified_command = commands.join(' ');
		return stringified_command;
	};

	public destroy():void {
		pathList.destroy(this);
	};
};