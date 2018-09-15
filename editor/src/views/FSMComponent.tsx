import * as React from 'react';
import { FSM, SDBBinding } from 't2sm';
import { StateMachineDisplay } from 't2sm/built/views/StateMachineDisplay';
import { ForeignObjectDisplay } from 't2sm/built/views/ForeignObjectDisplay';
import { first, tail } from 'lodash';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';
import { DISPLAY_TYPE } from 't2sm/built/views/StateMachineDisplay';
import * as ReactDOM from 'react-dom';
import { StateContents } from './StateContents';
import { TransitionContents } from './TransitionContents';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../../interfaces';

interface StateMachineDisplayProps {
    fsm: FSM<StateData, TransitionData>;
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface StateMachineDisplayState {
    paths: PathObj;
    touchGroups: TouchGroupObj;
}

export enum TransitionType { START, TIMEOUT, TOUCH_GROUP }

export class FSMComponent extends React.Component<StateMachineDisplayProps, StateMachineDisplayState> {
    private stateMachineDisplay: StateMachineDisplay;
    private binding: SDBBinding;
    private touchGroups: SDBSubDoc<TouchGroupObj>;
    private paths: SDBSubDoc<PathObj>;

    public constructor(props: StateMachineDisplayProps) {
        super(props);
        // this.binding = new SDBBinding(this.props.doc, this.props.path, this.getFSM());
        this.touchGroups = this.props.doc.subDoc(['touchGroups']);
        this.paths = this.props.doc.subDoc(['paths']);
        this.state = {
            touchGroups: this.touchGroups.getData(),
            paths: this.paths.getData()
        };
    }

    public render(): React.ReactNode {
        return (
            <div className="fsm" ref={this.divRef} />
        );
    }

    private getForeignObject = (fod: ForeignObjectDisplay) => {
        const el = fod.getElement();
        const body = document.createElement('body');
        const container = document.createElement('div');
        el.appendChild(body);
        body.appendChild(container);
        if (fod.getDisplayType() === DISPLAY_TYPE.TRANSITION) {
            ReactDOM.render(
                <TransitionContents fod={fod} fsm={this.props.fsm} touchGroups={this.touchGroups} paths={this.paths} />,
                container
            );
        } else {
            ReactDOM.render(
                <StateContents fod={fod} fsm={this.props.fsm} />,
                container
            );
        }
    }

    private getFSM(): FSM<StateData, TransitionData> { return this.props.fsm; }

    private divRef = (el: HTMLElement): void => {
        if (el) {
            const display = new StateMachineDisplay(this.getFSM(), el, this.getForeignObject);
        }
    }
} 