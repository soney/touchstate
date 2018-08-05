import * as React from 'react';
import { FSM, StateMachineDisplay, ForeignObjectDisplay } from 't2sm';
import { first, tail } from 'lodash';

interface StateMachineDisplayProps {
    fsm: FSM<StateData, TransitionData>;
}
interface StateMachineDisplayState {
}

export enum TransitionType { START, TIMEOUT, TOUCH_GROUP }

export interface StateData {

}

export interface TransitionData {

}

export class FSMComponent extends React.Component<StateMachineDisplayProps, StateMachineDisplayState> {
    private stateMachineDisplay: StateMachineDisplay;
    public constructor(props: StateMachineDisplayProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className="fsm" ref={this.divRef} />
        );
    }

    private getForeignObject  = (fod: ForeignObjectDisplay) => {
        const el = fod.getElement();
        console.log(el);
    }

    private getFSM(): FSM<StateData, TransitionData> { return this.props.fsm; }

    private divRef = (el: HTMLElement): void => {
        if (el) {
            const display = new StateMachineDisplay(this.getFSM(), el, this.getForeignObject);
        }
    }
} 