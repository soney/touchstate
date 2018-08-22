import * as React from 'react';
import { ForeignObjectDisplay, FSM } from 't2sm';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../../interfaces';
import { SDBSubDoc } from 'sdb-ts';
import { extend, map, omitBy } from 'lodash';

interface TransitionContentsProps {
    fod: ForeignObjectDisplay;
    fsm: FSM<StateData, TransitionData>;
    touchGroups: SDBSubDoc<TouchGroupObj>;
    paths: SDBSubDoc<PathObj>;
}
interface TransitionContentsState {
    type: string;
    timeoutDelay?: number;
    selectedTouchGroup?: string;
    selectedPath?: string;
    touchEventType?: string;
    paths: PathObj;
    touchGroups: TouchGroupObj;
}

export class TransitionContents extends React.Component<TransitionContentsProps, TransitionContentsState> {
    public constructor(props: TransitionContentsProps) {
        super(props);
        const payload = this.props.fsm.getTransitionPayload(this.props.fod.getName());

        if (payload) {
            this.state = extend({
                                    paths: this.props.paths.getData(),
                                    touchGroups: this.props.touchGroups.getData() },
                                payload);
        } else {
            this.state = {
                type: 'none',
                timeoutDelay: 1000,
                paths: this.props.paths.getData(),
                touchGroups: this.props.touchGroups.getData()
            };
        }
        this.props.paths.subscribe(() => {
            this.setState({ paths: this.props.paths.getData() });
        });
        this.props.touchGroups.subscribe(() => {
            this.setState({ touchGroups: this.props.touchGroups.getData() });
        });
        const { fod } = this.props;
        fod.setDimensions(100, 170);
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
            const touchOptions: React.ReactNode[] = map(this.state.touchGroups, (tg, name) => {
                return <option key={name} value={name}>{name}</option>;
            });

            if (this.state.touchEventType === 'cross') {
                const pathOptions: React.ReactNode[] = map(this.state.paths, (p, name) => {
                    return <option key={name} value={name}>{name}</option>;
                });
                pathSelection = (
                    <span>
                        <label>Path:</label>
                        <select value={this.state.touchEventType} onChange={this.handlePathChange}>
                            <option value="none">(none)</option>
                            {pathOptions}
                        </select>
                    </span>
                );
            }

            typeDetails = (
                <span>
                    <label>Touch:</label>
                    <select value={this.state.selectedTouchGroup} onChange={this.handleTouchGroupChange}>
                        <option value="none">(none)</option>
                        {touchOptions}
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
        const obj = extend({}, this.state, { 'paths': undefined, 'touchGroups': undefined });
        this.props.fsm.setTransitionPayload(this.props.fod.getName(), obj);
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