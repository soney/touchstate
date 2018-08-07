import * as React from 'react';
import * as cjs from 'constraintjs';
import { Cell, CellChangeEvent } from './Cell';
import { TouchCluster } from '../touch_primitives/TouchCluster';
import { SDBClient, SDBDoc } from 'sdb-ts';

interface TouchGroupProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface TouchGroupState {
}

export class TouchGroupDisplay extends React.Component<TouchGroupProps, TouchGroupState> {
    private static defaults = {
        numFingers: 1,
        downInside: null,
        downOutside: null,
        maxRadius: null,
        maxTouchInterval: null,
        greedy: false
    };
    public constructor(props: TouchGroupProps) {
        super(props);
        this.state = { };
        this.props.doc.submitObjectReplaceOp(this.props.path, {});
    }

    public render(): React.ReactNode {
        const defaults = TouchGroupDisplay.defaults;
        return (
            <div>
                <div>numFingers: <Cell text={`${defaults.numFingers}`} onChange={this.onNFChange} /></div>
                <div>downInside: <Cell text={`${defaults.downInside}`} onChange={this.onDIChange} /></div>
                <div>downOutside: <Cell text={`${defaults.downOutside}`} onChange={this.onDOChange} /></div>
                <div>maxRadius: <Cell text={`${defaults.maxRadius}`} onChange={this.onMRChange} /></div>
                <div>maxTouchInterval: <Cell text={`${defaults.maxTouchInterval}`} onChange={this.onMTIChange} /></div>
                <div>greedy: <Cell text={`${defaults.greedy}`} onChange={this.onGChange} /></div>
            </div>
        );
    }

    private onNFChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('numFingers'), event.value);
    }
    private onDIChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('downInside'), event.value);
    }
    private onDOChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('downOutside'), event.value);
    }
    private onMRChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('maxRadius'), event.value);
    }
    private onMTIChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('maxTouchInterval'), event.value);
    }
    private onGChange = (event: CellChangeEvent) => {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('greedy'), event.value);
    }
}