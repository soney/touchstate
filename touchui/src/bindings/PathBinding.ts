import { SDBDoc } from 'sdb-ts';
import { Path } from '../touch_primitives/Path';
import * as cjs from 'constraintjs';
import { some, debounce } from 'lodash';

export class PathBinding {
    private pathObj: Path = new Path();
    private context: any = {};
    private dUpdatePath: Function = debounce(this.updatePath.bind(this), 10);
    public constructor(private doc: SDBDoc<any>, private path: (number | string)[]) {
        this.initialize();
    }
    public getPath(): Path {
        return this.pathObj;
    }
    private async initialize(): Promise<void> {
        this.doc.subscribe(this.onDocUpdate);
        await this.doc.fetch();
    }
    private onDocUpdate = (type, ops): void => {
        if (type === 'op') {
            if (some(ops, (op) => !!SDBDoc.relative(this.path, op.p))) {
                this.dUpdatePath();
            }
        } else {
            this.dUpdatePath();
        }
    }
    private updatePath(): void {
        if (this.pathObj) {
            this.pathObj.clear();
        }
        const data = this.doc.traverse(this.path);
        const { type } = data;
        if (type === 'line') {
            const fromX = cjs.createParsedConstraint(data.lsx, this.context);
            const fromY = cjs.createParsedConstraint(data.lsy, this.context);
            const toX = cjs.createParsedConstraint(data.lex, this.context);
            const toY = cjs.createParsedConstraint(data.ley, this.context);
            this.pathObj.M(fromX, fromY).L(toX, toY);
        } else if (type === 'circle') {
            const r = cjs.createParsedConstraint(data.ccr, this.context);
            const cx = cjs.createParsedConstraint(data.ccx, this.context);
            const cy = cjs.createParsedConstraint(data.ccy, this.context);
            this.pathObj.circle(cx, cy, r);
        } else if (type === 'rectangle') {
            const x = cjs.createParsedConstraint(data.rcx, this.context);
            const y = cjs.createParsedConstraint(data.rcy, this.context);
            const w = cjs.createParsedConstraint(data.rcw, this.context);
            const h = cjs.createParsedConstraint(data.rch, this.context);
            this.pathObj.rect(x, y, w, h);
        } else {
            console.log(data);
        }
    }
}