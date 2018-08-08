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
import { EventEmitter } from 'events';
import { last, has, isFunction, tail, map } from 'lodash';
var PathList = /** @class */ (function (_super) {
    __extends(PathList, _super);
    function PathList() {
        var _this = _super.call(this) || this;
        _this.paths = [];
        return _this;
    }
    ;
    PathList.prototype.addPath = function (p) {
        this.paths.push(p);
        this.emit('pathCreated', p);
    };
    ;
    PathList.prototype.destroy = function (p) {
        for (var i = 0; i < this.paths.length; i++) {
            if (this.paths[i] === p) {
                this.paths.splice(i, 1);
                this.emit('pathDestroyed', p);
                break;
            }
        }
    };
    ;
    return PathList;
}(EventEmitter));
export { PathList };
;
var STMT;
(function (STMT) {
    STMT[STMT["IF"] = 0] = "IF";
    STMT[STMT["WHILE"] = 1] = "WHILE";
})(STMT || (STMT = {}));
;
export var pathList = new PathList();
var Path = /** @class */ (function () {
    // private tree:cjs.array();
    function Path() {
        this.tree = cjs.array();
        this.curr_tree_node = this.tree;
        this.stack = [this.tree];
        this.m = this.relativeMoveTo;
        this.moveTo = this.relativeMoveTo;
        this.M = this.absoluteMoveTo;
        this.l = this.relativeLineTo;
        this.lineTo = this.relativeLineTo;
        this.L = this.absoluteLineTo;
        this.h = this.relativeHorizontalLineTo;
        this.H = this.absoluteHorizontalLineTo;
        this.v = this.relativeVerticalLineTo;
        this.V = this.absoluteVerticalLineTo;
        this.c = this.relativeCurveTo;
        this.C = this.absoluteCurveTo;
        this.s = this.relativeSmoothCurveTo;
        this.S = this.absoluteSmoothCurveTo;
        this.q = this.relativeQuadraticCurveTo;
        this.Q = this.absoluteQuadraticCurveTo;
        this.t = this.relativeSmoothQuadraticCurveTo;
        this.T = this.absoluteSmoothQuadraticCurveTo;
        this.a = this.relativeArc;
        this.A = this.absoluteArc;
        this.Z = this.close;
        pathList.addPath(this);
    }
    ;
    Path.prototype.relativeMoveTo = function (x, y) {
        this.curr_tree_node.push(["m", x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteMoveTo = function (x, y) {
        this.curr_tree_node.push(["M", x, y]);
        return this;
    };
    ;
    Path.prototype.relativeLineTo = function (x, y) {
        this.curr_tree_node.push(["l", x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteLineTo = function (x, y) {
        this.curr_tree_node.push(["L", x, y]);
        return this;
    };
    ;
    Path.prototype.relativeHorizontalLineTo = function (x) {
        this.curr_tree_node.push(["h", x]);
        return this;
    };
    ;
    Path.prototype.absoluteHorizontalLineTo = function (x) {
        this.curr_tree_node.push(["H", x]);
        return this;
    };
    ;
    Path.prototype.relativeVerticalLineTo = function (y) {
        this.curr_tree_node.push(["v", y]);
        return this;
    };
    ;
    Path.prototype.absoluteVerticalLineTo = function (y) {
        this.curr_tree_node.push(["V", y]);
        return this;
    };
    ;
    Path.prototype.relativeCurveTo = function (x1, y1, x2, y2, x, y) {
        this.curr_tree_node.push(["c", x1, y1, x2, y2, x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteCurveTo = function (x1, y1, x2, y2, x, y) {
        this.curr_tree_node.push(["C", x1, y1, x2, y2, x, y]);
        return this;
    };
    ;
    Path.prototype.relativeSmoothCurveTo = function (x2, y2, x, y) {
        this.curr_tree_node.push(["s", x2, y2, x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteSmoothCurveTo = function (x2, y2, x, y) {
        this.curr_tree_node.push(["S", x2, y2, x, y]);
        return this;
    };
    ;
    Path.prototype.relativeQuadraticCurveTo = function (x1, y1, x, y) {
        this.curr_tree_node.push(["q", x1, y1, x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteQuadraticCurveTo = function (x1, y1, x, y) {
        this.curr_tree_node.push(["Q", x1, y1, x, y]);
        return this;
    };
    ;
    Path.prototype.relativeSmoothQuadraticCurveTo = function (x, y) {
        this.curr_tree_node.push(["t", x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteSmoothQuadraticCurveTo = function (x, y) {
        this.curr_tree_node.push(["T", x, y]);
        return this;
    };
    ;
    Path.prototype.relativeArc = function (rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, x, y) {
        this.curr_tree_node.push(["a", rx, ry, x_axis_rotation, large_arc_flag ? 1 : 0, sweep_flag ? 1 : 0, x, y]);
        return this;
    };
    ;
    Path.prototype.absoluteArc = function (rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, x, y) {
        this.curr_tree_node.push(["A", rx, ry, x_axis_rotation, large_arc_flag ? 1 : 0, sweep_flag ? 1 : 0, x, y]);
        return this;
    };
    ;
    Path.prototype.ellipse = function (cx, cy, rx, ry) {
        var nothing = 0.0001;
        var cx_sub_rx;
        if (cjs.isConstraint(cx)) {
            cx_sub_rx = cx.sub(rx);
        }
        else if (cjs.isConstraint(rx)) {
            cx_sub_rx = cjs(function () {
                return cx - rx.get();
            });
        }
        else {
            cx_sub_rx = cx - rx;
        }
        this.curr_tree_node.push(["M", cx_sub_rx, cy], ["a", rx, ry, 0, 1, 1, 0, nothing], ["Z"]);
        return this;
    };
    ;
    Path.prototype.rect = function (x, y, width, height) {
        var neg_width;
        if (cjs.isConstraint(width)) {
            neg_width = width.neg();
        }
        else {
            neg_width = -width;
        }
        this.curr_tree_node.push(["M", x, y], ["h", width], ["v", height], ["h", neg_width], ["Z"]);
        return this;
    };
    ;
    Path.prototype.circle = function (cx, cy, r) {
        return this.ellipse(cx, cy, r, r);
    };
    ;
    Path.prototype.close = function () {
        this.curr_tree_node.push(["Z"]);
        return this;
    };
    ;
    Path.prototype.startIF = function (cond) {
        var new_tree = [];
        this.curr_tree_node.push([STMT.IF, {
                condition: cond,
                tree: new_tree
            }]);
        this.curr_tree_node = new_tree;
        this.stack.push(new_tree);
        return this;
    };
    ;
    Path.prototype.startELIF = function (cond) {
        this.stack.pop();
        var popped_tree_node = last(this.stack), if_stmt = last(popped_tree_node), elif_tree = [];
        if_stmt.push({
            condition: cond,
            tree: elif_tree
        });
        this.curr_tree_node = elif_tree;
        this.stack.push(elif_tree);
        return this;
    };
    ;
    Path.prototype.startELSE = function () {
        this.stack.pop();
        var popped_tree_node = last(this.stack), if_stmt = last(popped_tree_node), else_tree = [];
        if_stmt.push({
            tree: else_tree
        });
        this.curr_tree_node = else_tree;
        this.stack.push(else_tree);
        return this;
    };
    ;
    Path.prototype.endIF = function () {
        this.stack.pop();
        this.curr_tree_node = last(this.stack);
        return this;
    };
    ;
    Path.nodeToString = function (node) {
        var command = node[0];
        if (command === STMT.IF) {
            var tree = void 0;
            var cond = void 0, cond_value = void 0;
            for (var i = 1; i < node.length; i++) {
                var node_i = node[i];
                if (has(node_i, "condition")) {
                    cond = node_i.condition;
                    if (isFunction(cond)) {
                        cond_value = cond();
                    }
                    else {
                        cond_value = cjs.get(cond);
                    }
                }
                else {
                    cond_value = true;
                }
                if (cond_value) {
                    tree = node[i].tree;
                    break;
                }
            }
            if (!tree) {
                tree = [];
            }
            return map(tree, Path.nodeToString).join('');
        }
        else {
            var args = map(tail(node), function (arg) {
                return cjs.get(arg);
            }), result = command + (args.length === 0 ? "" : (" " + args.join(",")));
            return result;
        }
    };
    ;
    Path.prototype.toString = function () {
        var commands = map(this.tree.toArray(), Path.nodeToString);
        var stringified_command = commands.join(' ');
        return stringified_command;
    };
    ;
    Path.prototype.destroy = function () {
        pathList.destroy(this);
    };
    ;
    return Path;
}());
export { Path };
;
//# sourceMappingURL=Path.js.map