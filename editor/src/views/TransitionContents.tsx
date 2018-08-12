import * as React from 'react';
import { ForeignObjectDisplay, FSM } from 't2sm';
import { StateData, TransitionData } from '../../../interfaces';

interface TransitionContentsProps {
    fod: ForeignObjectDisplay;
    fsm: FSM<StateData, TransitionData>;
}
interface TransitionContentsState {
    type: string;
    timeoutDelay?: number;
    selectedTouchGroup?: string;
    selectedPath?: string;
    touchEventType?: string;
}

export class TransitionContents extends React.Component<TransitionContentsProps, TransitionContentsState> {
    public constructor(props: TransitionContentsProps) {
        super(props);
        const payload = this.props.fsm.getTransitionPayload(this.props.fod.getName());

        if (payload) {
            this.state = payload;
        } else {
            this.state = {
                type: 'none',
                timeoutDelay: 1000
            };
        }
    }

    public render(): React.ReactNode {
        const { type } = this.state;
        let typeDetails: React.ReactNode;
        if (type === 'none') {
            typeDetails = <span />;
        } else if (type === 'timeout') {
            typeDetails = <input type="number" value={this.state.timeoutDelay} onChange={this.onTimeoutChange} />;
        } else if (type === 'touchgroup') {
            let pathSelection: React.ReactNode;

            if (this.state.touchEventType === 'cross') {
                pathSelection = (
                    <span>
                        <label>Path:</label>
                        <select value={this.state.touchEventType} onChange={this.handlePathChange}>
                            <option value="none">(none)</option>
                        </select>
                    </span>
                );
            }

            typeDetails = (
                <span>
                    <label>Touch:</label>
                    <select value={this.state.selectedTouchGroup} onChange={this.handleTouchGroupChange}>
                        <option value="none">(none)</option>
                    </select>
                    <label>Type:</label>
                    <select value={this.state.touchEventType} onChange={this.handleTouchEventChange}>
                        <option value="none">(none)</option>
                        <option value="start">Start</option>
                        <option value="end">End</option>
                        <option value="cross">Cross</option>
                    </select>
                    {pathSelection}
                </span>
            );
        }

        return (
            <div>
                <select value={this.state.type} onChange={this.handleSelectChange}>
                    <option value="none">(none)</option>
                    <option value="timeout">timeout</option>
                    <option value="touchgroup">touch group</option>
                </select>
                {typeDetails}
            </div>
        );
    }

    public componentDidUpdate(prevProps: any, nextProps: any, snapshot: any): void {
        // super.componentDidUpdate(prevProps, nextProps, snapshot);
        this.props.fsm.setTransitionPayload(this.props.fod.getName(), this.state);
    }

    private onTimeoutChange = (event: React.FormEvent<HTMLInputElement>): void => {
        const { value } = event.currentTarget;
        this.setState({ timeoutDelay: parseInt(value, null) });
    }

    private handleSelectChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        this.setState({ type: value });
    }

    private handleTouchGroupChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        this.setState({ selectedTouchGroup: value });
    }

    private handleTouchEventChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        this.setState({ touchEventType: value });
    }

    private handlePathChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const { value } = event.currentTarget;
        this.setState({ selectedPath: value });
    }
}