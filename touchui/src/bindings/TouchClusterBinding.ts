// tslint:disable:max-line-length
import { SDBDoc } from 'sdb-ts';
import { TouchCluster } from '../touch_primitives/TouchCluster';
import { each, extend, some } from 'lodash';
import { BehaviorDoc } from '../../../interfaces';
import { Path } from '../touch_primitives/Path';
import { MapConstraint } from 'constraintjs';

export class TouchClusterBinding {
    private cluster: TouchCluster = new TouchCluster();
    public constructor(private doc: SDBDoc<BehaviorDoc>, private path: (number | string)[], private pathMap: Map<string, Path>) {
        this.initialize();
    }
    public getCluster(): TouchCluster {
        return this.cluster;
    }
    private async initialize(): Promise<void> {
        this.doc.subscribe(this.onDocUpdate);
        await this.doc.fetch();
    }
    private onDocUpdate = (type, ops): void => {
        if (type === 'op') {
            each(ops, (op) => {
                const relPath = SDBDoc.relative(this.path, op.p);
                if (relPath) {
                    const optionName = relPath[0] as string;
                    if (['numFingers'].indexOf(optionName) >= 0) {
                        this.cluster.setOption('numFingers', this.doc.traverse(this.path.concat(optionName)));
                    } else if (optionName === 'downInside') {
                        const di = this.doc.traverse(this.path.concat(optionName));
                        if (this.pathMap.has(di)) {
                            this.cluster.setOption('downInside', this.pathMap.get(di));
                        } else {
                            this.cluster.setOption('downInside', null);
                        }
                    }
                }
            });
            // if (some(ops, (op) => !!SDBDoc.relative(this.path, op.p))) {
                // console.log(ops);
                // this.updateOptions();
            // }
        } else {
            this.updateOptions();
        }
    }
    private updateOptions(): void {
        const data = this.doc.traverse(this.path);
        const { numFingers, downInside } = data;
        let di: Path;
        
        if (this.pathMap.has(downInside)) {
            this.cluster.setOption('downInside', this.pathMap.get(downInside));
        } else {
            this.cluster.setOption('downInside', null);
        }
        this.cluster.setOption('numFingers', numFingers);
    }
}