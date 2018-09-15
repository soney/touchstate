// tslint:disable:max-line-length
import * as React from 'react';
import * as cjs from 'constraintjs';
import { Cell, CellChangeEvent } from './Cell';
import { TouchGroupInterface, TouchGroupObj } from '../../../interfaces';
import { SDBClient, SDBDoc, SDBSubDoc } from 'sdb-ts';
import { clone, isEqual } from 'lodash';

interface TouchGroupProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface TouchGroupState extends TouchGroupInterface {
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
    private subDoc: SDBSubDoc<TouchGroupInterface>; 
    public constructor(props: TouchGroupProps) {
        super(props);
        this.initialize();
    }

    public render(): React.ReactNode {
        const defaults = TouchGroupDisplay.defaults;
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>Fingers</th>
                        <td colSpan={3}><Cell text={`${this.state.numFingers}`} onChange={this.onNFChange} /></td>
                    </tr>
                    <tr>
                        <th>x</th>
                        <td>{Math.round(this.state.$xConstraint)}</td>
                        <th>y</th>
                        <td>{Math.round(this.state.$yConstraint)}</td>
                    </tr>
                    <tr>
                        <th>startX</th>
                        <td>{Math.round(this.state.$startXConstraint)}</td>
                        <th>startY</th>
                        <td>{Math.round(this.state.$startYConstraint)}</td>
                    </tr>
                    <tr>
                        <th>endX</th>
                        <td>{Math.round(this.state.$startXConstraint)}</td>
                        <th>endY</th>
                        <td>{Math.round(this.state.$endYConstraint)}</td>
                    </tr>
                </tbody>
            </table>
            // <div>
            //     <div>downInside: <Cell text={`${this.state.downInside}`} onChange={this.onDIChange} /></div>
            //     <div>downOutside: <Cell text={`${this.state.downOutside}`} onChange={this.onDOChange} /></div>
            //     <div>maxRadius: <Cell text={`${this.state.maxRadius}`} onChange={this.onMRChange} /></div>
            //     <div>maxTouchInterval: <Cell text={`${this.state.maxTouchInterval}`} onChange={this.onMTIChange}/></div>
            //     <div>greedy: <Cell text={`${this.state.greedy}`} onChange={this.onGChange} /></div>
            //     <div>x: {this.state.$xConstraint}</div>
            //     <div>y: {this.state.$yConstraint}</div>
            //     <div>startX: {this.state.$startXConstraint}</div>
            //     <div>startY: {this.state.$startYConstraint}</div>
            //     <div>endX: {this.state.$endXConstraint}</div>
            //     <div>endY: {this.state.$endYConstraint}</div>
            // </div>
        );
    }

    private onNFChange = async (event: CellChangeEvent) => {
        this.subDoc.submitObjectReplaceOp(['numFingers'], event.value);
        this.setState(this.subDoc.getData());
    }
    // private onDIChange = async (event: CellChangeEvent) => {
    //     this.subDoc.submitObjectReplaceOp(['downInside'], event.value);
    //     this.setState(this.subDoc.getData());
    // }
    // private onDOChange = async (event: CellChangeEvent) => {
    //     this.subDoc.submitObjectReplaceOp(['downOutside'], event.value);
    //     this.setState(this.subDoc.getData());
    // }
    // private onMRChange = async (event: CellChangeEvent) => {
    //     this.subDoc.submitObjectReplaceOp(['maxRadius'], event.value);
    //     this.setState(this.subDoc.getData());
    // }
    // private onMTIChange = async (event: CellChangeEvent) => {
    //     this.subDoc.submitObjectReplaceOp(['maxTouchInterval'], event.value);
    //     this.setState(this.subDoc.getData());
    // }
    // private onGChange = async (event: CellChangeEvent) => {
    //     this.subDoc.submitObjectReplaceOp(['greedy'], event.value);
    //     this.setState(this.subDoc.getData());
    // }

    private async initialize(): Promise<void> {
        this.subDoc = this.props.doc.subDoc<TouchGroupInterface>(this.props.path);
        const data = this.subDoc.getData();
        if (data && !isEqual(data, {})) {
            this.state = clone(data);
        } else {
            this.subDoc.submitObjectReplaceOp([], TouchGroupDisplay.defaults);
            this.state = TouchGroupDisplay.defaults;
        }
        this.subDoc.subscribe((type, ops) => {
            if (type === 'op') {
                ops.forEach((op) => {
                    const { p, oi } = op;
                    if (p.length === 1 && oi) {
                        const propName = p[0];
                        const newState = {};
                        newState[propName] = oi;
                        this.setState(newState);
                    }
                });
            }
        });
    }
}