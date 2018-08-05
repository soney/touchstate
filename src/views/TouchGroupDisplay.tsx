import * as React from 'react';
import * as cjs from 'constraintjs';
import { Cell, CellChangeEvent } from './Cell';

interface TouchGroupProps {
}
interface TouchGroupState {
}

export class TouchGroupDisplay extends React.Component<TouchGroupProps, TouchGroupState> {
    public static defaultProps: TouchGroupProps  = {
    };

    private downInside: cjs.Constraint;
    private downOutside: cjs.Constraint;
    private numFingers: cjs.Constraint;
    private maxRadius: cjs.Constraint;
    private maxTouchInterval: cjs.Constraint;
    private greedy: cjs.Constraint;

    public constructor(props: TouchGroupProps) {
        super(props);
        this.state = {
        };
    }

    public render(): React.ReactNode {
        return (
            <div>
                <div>numFingers: <Cell text="1" onChange={this.onNFChange} /></div>
                <div>downInside: <Cell text="null" onChange={this.onDIChange} /></div>
                <div>downOutside: <Cell text="null" onChange={this.onDOChange} /></div>
                <div>maxRadius: <Cell text="null" onChange={this.onMRChange} /></div>
                <div>maxTouchInterval: <Cell text="null" onChange={this.onMTIChange} /></div>
                <div>greedy: <Cell text="null" onChange={this.onGChange} /></div>
            </div>
        );
    }

    private onNFChange = (event: CellChangeEvent) => {
        this.numFingers = event.constraint;
    }
    private onDIChange = (event: CellChangeEvent) => {
        this.downInside = event.constraint;
    }
    private onDOChange = (event: CellChangeEvent) => {
        this.downOutside = event.constraint;
    }
    private onMRChange = (event: CellChangeEvent) => {
        this.maxRadius = event.constraint;
    }
    private onMTIChange = (event: CellChangeEvent) => {
        this.maxTouchInterval = event.constraint;
    }
    private onGChange = (event: CellChangeEvent) => {
        this.greedy = event.constraint;
    }
}