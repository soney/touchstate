// tslint:disable:max-line-length
import * as React from 'react';
import * as cjs from 'constraintjs';
import { Cell, CellChangeEvent } from './Cell';
import { TouchGroupInterface, TouchGroupObj, PathObj } from '../../../interfaces';
import { SDBClient, SDBDoc, SDBSubDoc } from 'sdb-ts';
import { clone, extend, isEqual, map } from 'lodash';

interface TouchGroupProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
    paths: SDBSubDoc<PathObj>;
}

interface TouchGroupState extends TouchGroupInterface {
    paths: PathObj;
}

export class TouchGroupDisplay extends React.Component<TouchGroupProps, TouchGroupState> {
    private static defaults = {
        numFingers: 1,
        downInside: 'none',
        downOutside: null,
        maxRadius: null,
        maxTouchInterval: null,
        greedy: false,
        $satisfied: false
    };
    private subDoc: SDBSubDoc<TouchGroupInterface>; 
    public constructor(props: TouchGroupProps) {
        super(props);
        // this.initialize();
        this.subDoc = this.props.doc.subDoc<TouchGroupInterface>(this.props.path);
        const data = this.subDoc.getData();
        const pathsDoc = { paths: this.props.paths.getData() };
        if (data && !isEqual(data, {})) {
            this.state = extend(pathsDoc, data);
        } else {
            this.subDoc.submitObjectReplaceOp([], TouchGroupDisplay.defaults);
            this.state = extend(pathsDoc, TouchGroupDisplay.defaults);
        }
        this.subDoc.subscribe((type, ops) => {
            if (type === 'op') {
                ops.forEach((op) => {
                    const { p, oi } = op as any;
                    if (p.length === 1 && (oi || oi === false)) {
                        const propName = p[0];
                        const newState = {};
                        newState[propName] = oi;
                        this.setState(newState);
                    }
                });
            }
        });
        this.props.paths.subscribe(() => {
            this.setState({ paths: this.props.paths.getData() });
        });
    }

    public render(): React.ReactNode {
        const defaults = TouchGroupDisplay.defaults;
        const pathOptions: React.ReactNode[] = map(this.state.paths, (p, name) => {
            return <option key={name} value={name}>{name}</option>;
        });

        function pnan(arg: any) {
            if (isNaN(arg)) {
                return '';
            } else {
                return Math.round(arg);
            }
        }
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>Fingers</th>
                        <td colSpan={3}><Cell text={`${this.state.numFingers}`} onChange={this.onNFChange} /></td>
                    </tr>
                    <tr>
                        <th>Down Inside</th>
                        <td colSpan={3}>
                            <select value={this.state.downInside} onChange={this.downInsideChange}>
                                <option value="none">(none)</option>
                                {pathOptions}
                            </select>
                        </td>
                    </tr>
                    <tr className={this.state.$satisfied ? 'satisfied' : 'not_satisfied'}>
                        <th>x</th>
                        <td>{pnan(this.state.$xConstraint)}</td>
                        <th>y</th>
                        <td>{pnan(this.state.$yConstraint)}</td>
                    </tr>
                    <tr className={this.state.$satisfied ? 'satisfied' : 'not_satisfied'}>
                        <th>startX</th>
                        <td>{pnan(this.state.$startXConstraint)}</td>
                        <th>startY</th>
                        <td>{pnan(this.state.$startYConstraint)}</td>
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
    private downInsideChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        this.subDoc.submitObjectReplaceOp(['downInside'], value);
        this.setState({ downInside: value });
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

    // private async initialize(): Promise<void> {
    // }
}