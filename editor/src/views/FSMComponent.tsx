import * as React from 'react';
import { FSM, StateMachineDisplay, ForeignObjectDisplay, SDBBinding } from 't2sm';
import { first, tail } from 'lodash';
import { SDBDoc } from 'sdb-ts';

interface StateMachineDisplayProps {
    fsm: FSM<StateData, TransitionData>;
    path: (string|number)[];
    doc: SDBDoc<any>;
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
    private binding: SDBBinding;
    public constructor(props: StateMachineDisplayProps) {
        super(props);
        this.binding = new SDBBinding(this.props.doc, this.props.path, this.getFSM());
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