import * as React from 'react';
import { FSM } from 't2sm';
import { ForeignObjectDisplay } from 't2sm/built/views/ForeignObjectDisplay';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../../interfaces';
import { SDBSubDoc } from 'sdb-ts';
import { extend, map, omitBy } from 'lodash';

interface StateContentsProps {
    fod: ForeignObjectDisplay;
    fsm: FSM<StateData, TransitionData>;
}
interface StateContentsState {
    markDone?: boolean;
}

export class StateContents extends React.Component<StateContentsProps, StateContentsState> {
    private isStart: boolean;
    private containerElement: HTMLDivElement;
    private stateName: string;
    public constructor(props: StateContentsProps) {
        super(props);
        this.stateName = this.props.fod.getName();
        this.isStart = this.stateName === this.props.fsm.getStartState();
        const payload = this.props.fsm.getStatePayload(this.stateName);
        let markDone = payload ? !!payload.markDone : false;

        // console.log(this.props.fsm.getStatePayload(this.stateName));
        // let markDone = this.props.fsm.getStatePayload(this.stateName).markDone;

        this.state = { markDone };
        const { fod } = this.props;
        if (!this.isStart) {
            fod.setDimensions(30, 30);
        }
    }

    public render(): React.ReactNode {
        if (this.isStart) {
            return <span />;
        } else {
            return (
                <div className="stateContents">
                    <input type="checkbox" checked={this.state.markDone} onChange={this.handleCheckedChange} />
                </div>
            );
        }
    }

    private handleCheckedChange = (event): void => {
        const { checked } = event.target;
        this.setState({ markDone: checked });
        // console.log(this.props.fod.getName());
        this.props.fsm.setStatePayload(this.stateName, { markDone: checked });
    }
}