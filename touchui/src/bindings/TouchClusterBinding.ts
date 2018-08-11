import { SDBDoc } from 'sdb-ts';
import { TouchCluster } from '../touch_primitives/TouchCluster';
import { some } from 'lodash';

export class TouchClusterBinding {
    private cluster: TouchCluster = new TouchCluster();
    public constructor(private doc: SDBDoc<any>, private path: (number | string)[]) {
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
            if (some(ops, (op) => !!SDBDoc.relative(this.path, op.p))) {
                this.updateOptions();
            }
        } else {
            this.updateOptions();
        }
    }
    private updateOptions(): void {
        const data = this.doc.traverse(this.path);
        this.cluster.setOption(data);
    }
}