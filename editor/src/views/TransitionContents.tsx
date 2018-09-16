import * as React from 'react';
import { FSM } from 't2sm';
import { ForeignObjectDisplay } from 't2sm/built/views/ForeignObjectDisplay';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../../interfaces';
import { SDBSubDoc } from 'sdb-ts';
import { extend, map, omitBy } from 'lodash';
import { Cell } from './Cell';

interface TransitionContentsProps {
    fod: ForeignObjectDisplay;
    fsm: FSM<StateData, TransitionData>;
    touchGroups: SDBSubDoc<TouchGroupObj>;
    paths: SDBSubDoc<PathObj>;
}
interface TransitionContentsState {
    type: string;
    timeoutDelay?: string;
    selectedTouchGroup?: string;
    selectedPath?: string;
    touchEventType?: string;
    paths: PathObj;
    touchGroups: TouchGroupObj;
}

export class TransitionContents extends React.Component<TransitionContentsProps, TransitionContentsState> {
    private containerElement: HTMLDivElement;
    public constructor(props: TransitionContentsProps) {
        super(props);
        const payload = this.props.fsm.getTransitionPayload(this.props.fod.getName());

        if (payload) {
            this.state = extend({
                                    type: 'timeout',
                                    timeoutDelay: '1000',
                                    touchEventType: 'start',
                                    paths: this.props.paths.getData(),
                                    touchGroups: this.props.touchGroups.getData() },
                                payload);
        } else {
            this.state = {
                touchEventType: 'start',
                type: 'none',
                timeoutDelay: '1000',
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
        if (this.state.type === 'startTransition') {
            fod.hide();
        } else {
            fod.setDimensions(100, 110);
        }
    }

    public render(): React.ReactNode {
        const { type } = this.state;
        let typeDetails: React.ReactNode;
        if (type === 'none') {
            typeDetails = <span />;
        } else if (type === 'timeout') {
            typeDetails = (
                <Cell
                    text={`${this.state.timeoutDelay}`}
                    onChange={this.onTimeoutChange}
                    placeholder={'Delay'}
                />
            );
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
                        {/* <label>Path:</label> */}
                        <select value={this.state.selectedPath} onChange={this.handlePathChange}>
                            <option value="none">(none)</option>
                            {pathOptions}
                        </select>
                    </span>
                );
            }

            typeDetails = (
                <span>
                    {/* <label>Touch:</label> */}
                    <select value={this.state.selectedTouchGroup} onChange={this.handleTouchGroupChange}>
                        <option value="none">(none)</option>
                        {touchOptions}
                    </select>
                    <br />
                    {/* <label>Type:</label> */}
                    <select value={this.state.touchEventType} onChange={this.handleTouchEventChange}>
                        {/* <option value="none">(none)</option> */}
                        <option value="start">Start</option>
                        <option value="end">End</option>
                        <option value="cross">Cross</option>
                    </select>
                    <br />
                    {pathSelection}
                </span>
            );
        }

        return (
            <div className="transitionContents" ref={this.containerRef}>
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
        this.updateFODDimensions();
    }

    private containerRef = (el: HTMLDivElement): void => {
        this.containerElement = el;
        this.updateFODDimensions();
    }

    private updateFODDimensions(): void {
        const { clientWidth, clientHeight } = this.containerElement;
        // this.props.fod.setDimensions(clientWidth + 20, clientHeight + 20);
    }

    private onTimeoutChange = (event): void => {
        const { value } = event;
        this.setState({ timeoutDelay: value });
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