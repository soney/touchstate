/* tslint:disable:no-string-literal*/
import * as React from 'react';
import * as cjs from 'constraintjs';
import { FSM, SDBBinding } from 't2sm';
import { SDBClient, SDBDoc, SDBSubDoc } from 'sdb-ts';
// import { StateData, TransitionData } from '../../editor/src/views/FSMComponent';
import * as jQuery from 'jquery';
import './touchscreen/touchscreen_layer';
import * as SVG from 'svg.js';
import { Path } from './touch_primitives/Path';
import { replayTouches } from './touchscreen/touch_replay';
import { TouchCluster } from './touch_primitives/TouchCluster';
import { TouchClusterBinding } from './bindings/TouchClusterBinding';
import { PathBinding } from './bindings/PathBinding';
import { StateData, TransitionData, BehaviorDoc, TouchGroupObj, PathObj } from '../../interfaces';
import { each, difference, debounce } from 'lodash';
import { MapConstraint } from 'constraintjs';

const files = [
    'two finger tap count tap',
    'left then right'
];

export interface ReplayOptions {
    target?: Element;
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;
}
interface TouchBehaviorProps {
    path: (string|number)[];
    doc: SDBDoc<BehaviorDoc>;
}
interface TouchBehaviorState {
    selectState: string;
}

export class TouchBehavior extends React.Component<TouchBehaviorProps, TouchBehaviorState> {
    private binding: SDBBinding;
    private transitionListeners: Map<string, Function> = new Map();
    private fsm: FSM<StateData, TransitionData>;
    private element: HTMLDivElement;
    private renderedPromise: Promise<HTMLDivElement>;
    private resolveRP: Function;
    private touchGroups: SDBSubDoc<TouchGroupObj>;
    private paths: SDBSubDoc<PathObj>;
    private pathMap: Map<string, Path> = new Map();
    private touchGroupMap: Map<string, TouchCluster> = new Map();
    private liveUpdaterMap: Map<string, {pause: Function, resume: Function,
        run: Function, destroy: Function}> = new Map();
    private cellContext: cjs.MapConstraint = new cjs.MapConstraint();
    private debouncedPropertyUpdate = debounce((name: string, values: { [key: string]: any }) => {
        each(values, (value: any, prop: string) => {
            const p = [name, prop];
            if (value !== this.touchGroups.traverse(p)) {
                this.touchGroups.submitObjectReplaceOp(p, value);
            }
        });
    }, 20);
    public constructor(props: TouchBehaviorProps) {
        super(props);
        this.state = {
            selectState: 'replay'
        };
        this.renderedPromise = new Promise((resolve, reject) => { this.resolveRP = resolve; });
        this.initialize();
        // const x = cjs(500);
        // setInterval(() => x.set(x.get() + 10), 300);
        // const p = new Path().M(x, 0).circle(x, x, 150);
        // this.addPath(p);
        // // setTimeout(() => this.removePath(p), 6000);
        // const tc = new TouchCluster();
        // this.addTouchCluster(tc);
        // // setTimeout(() => this.removeTouchCluster(tc), 6000);
        // tc.addListener('satisfied', () => {
        //     console.log('done');
        // });
        // tc.addCrossListener(p, () => {
        //     console.log('cross');
        // });
    }

    public render(): React.ReactNode {
        const options = files.map((f, i) => {
            return <option key={i} value={f}>{f}</option>;
        });
        return (
            <div ref={this.contentRef}>
                <div style={{position: 'absolute'}}>
                    <select value={this.state.selectState} onChange={this.onSelectChange}>
                        <option value="replay">Replay</option>
                        {options}
                    </select>
                </div>
            </div>
        );
    }

    public async addPath(p: Path): Promise<void> {
        await this.renderedPromise;
        jQuery(this.element)['touchscreen_layer']('addPath', p);
    }
    public async removePath(p: Path): Promise<void> {
        await this.renderedPromise;
        jQuery(this.element)['touchscreen_layer']('removePath', p);
    }
    public async addTouchCluster(tc: TouchCluster): Promise<void> {
        await this.renderedPromise;
        jQuery(this.element)['touchscreen_layer']('addTouchCluster', tc);
    }
    public async removeTouchCluster(tc: TouchCluster): Promise<void> {
        await this.renderedPromise;
        jQuery(this.element)['touchscreen_layer']('removeTouchCluster', tc);
    }

    private onSelectChange = (event): void => {
        const { value } = event.target;
        this.replayFromURL(value);
    }

    private contentRef = (element: HTMLDivElement): void => {
        if (element) {
            const paper = SVG(element);
            jQuery(element)['touchscreen_layer']({paper});
            this.element = element;
            this.resolveRP(this.element);
        }
    }

    private addTouchGroupConstraint(touchCluster: TouchCluster, name: string) {
        const mapConstraint = new MapConstraint();
        mapConstraint.put('x', touchCluster.getXConstraint());
        mapConstraint.put('y', touchCluster.getYConstraint());
        mapConstraint.put('startX', touchCluster.getStartXConstraint());
        mapConstraint.put('startY', touchCluster.getStartYConstraint());
        mapConstraint.put('endX', touchCluster.getEndXConstraint());
        mapConstraint.put('endY', touchCluster.getEndYConstraint());
        this.cellContext.put(name, mapConstraint);
    }

    private removeTouchGroupConstraint(name: string) {
        this.cellContext.remove(name);
    }

    private async initialize(): Promise<void> {
        const doc = this.getDoc();
        doc.subscribe();
        await doc.fetch();
        await this.renderedPromise;
        const fsmBinding = new SDBBinding(this.getDoc(), ['fsm']);
        this.fsm = fsmBinding.getFSM();

        this.touchGroups = this.props.doc.subDoc(this.props.path.concat(['touchGroups']));
        this.paths = this.props.doc.subDoc(this.props.path.concat(['paths']));
        this.touchGroups.subscribe((eventType, ops) => {
            const updatedTouchGroupNames: string[] = [];
            if (eventType === 'op') {
                ops.forEach((op) => {
                    const {p} = op;
                    if (p.length === 1 && op.oi) {
                        const name = p[0];
                        const tcb = new TouchClusterBinding(doc, this.props.path.concat(['touchGroups', name]));
                        const c = tcb.getCluster();
                        this.touchGroupMap.set(name, c);
                        updatedTouchGroupNames.push(name);
                        this.addTouchGroupConstraint(c, name);
                    } else if (p.length === 1 && op.od) {
                        const name = p[0];
                        const touchGroup = this.touchGroupMap.get(name);
                        if (touchGroup) {
                            touchGroup.destroy(true);
                            this.removeTouchCluster(touchGroup);
                            updatedTouchGroupNames.push(name);
                        }
                        this.cellContext.remove(name);
                        this.removeTouchGroupConstraint(name);
                    }
                });
            } else {
                const touchGroups = this.touchGroups.getData();
                each(touchGroups, (tg, name) => {
                    const tcb = new TouchClusterBinding(doc, this.props.path.concat(['touchGroups', name]));
                    const c = tcb.getCluster();
                    this.touchGroupMap.set(name, c);
                    updatedTouchGroupNames.push(name);
                    this.addTouchGroupConstraint(c, name);
                });
            }
            this.updateRelevantTransitionEvents(updatedTouchGroupNames);
            this.updateTouchDisplayListeners();
        });

        this.paths.subscribe((eventType, ops) => {
            const updatedPathNames: string[] = [];
            if (eventType === 'op') {
                ops.forEach((op) => {
                    const {p} = op;
                    if (p.length === 1 && op.oi) {
                        const name = p[0];
                        const pb = new PathBinding(doc, this.props.path.concat(['paths', name]), this.cellContext);
                        const pathObj = pb.getPath();
                        this.addPath(pathObj);
                        this.pathMap.set(name, pathObj);
                        updatedPathNames.push(name);
                    } else if (p.length === 1 && op.od) {
                        const name = p[0];
                        const pathObj = this.pathMap.get(name);
                        if (pathObj) {
                            this.removePath(pathObj);
                            pathObj.destroy();
                            this.pathMap.delete(name);
                            updatedPathNames.push(name);
                        }
                    }
                });
            } else {
                const paths = this.paths.getData();
                each(paths, (path, name) => {
                    const pb = new PathBinding(doc, this.props.path.concat(['paths', name]), this.cellContext);
                    const pathObj = pb.getPath();
                    this.addPath(pathObj);
                    this.pathMap.set(name, pathObj);
                    updatedPathNames.push(name);
                });
            }
            this.updateRelevantTransitionEvents(updatedPathNames);
        });
        window['fsm' + ''] = this.fsm;
        each(this.fsm.getTransitions(), (transition) => {
            this.updateEventListener(transition);
        });
        this.fsm.addListener('transitionPayloadChanged', (event) => {
            const { transition } = event;
            this.updateEventListener(transition);
        });
        this.fsm.addListener('transitionAdded', (event) => {
            const { transition } = event;
            this.updateEventListener(transition);
        });
        this.fsm.addListener('transitionRemoved', (event) => {
            const { transition } = event;
            this.updateEventListener(transition);
        });
    }

    private updateRelevantTransitionEvents(relatedNames: string[]): void {
        const transitions = this.fsm.getTransitions();
        transitions.forEach((transition) => {
            const payload = this.fsm.getTransitionPayload(transition);
            const { type, selectedTouchGroup, touchEventType, selectedPath } = payload;
            let shouldUpdate: boolean = false;
            if (type === 'touchgroup') {
                if (relatedNames.indexOf(selectedTouchGroup) >= 0) {
                    shouldUpdate = true;
                }
                if (touchEventType === 'cross' && relatedNames.indexOf(selectedPath) >= 0) {
                    shouldUpdate = true;
                }
            }
            this.updateEventListener(transition);
        });
    }

    private updateEventListener(transition: string): void {
        if (this.transitionListeners.has(transition)) {
            const removeTransitionListener = this.transitionListeners.get(transition);
            removeTransitionListener();
        }

        if (this.fsm.hasTransition(transition)) {
            const removeTransition = this.getEventListener(transition);
            this.transitionListeners.set(transition, removeTransition);
        }
    }

    private getDoc(): SDBDoc<any> {
        return this.props.doc;
    }

    private getEventListener(transitionName: string): Function {
        const payload = this.fsm.getTransitionPayload(transitionName);
        const { type } = payload;
        if (type === 'timeout') {
            const { timeoutDelay } = payload;
            const fromState = this.fsm.getTransitionFrom(transitionName);
            let timeoutID;
            let removeListener: Function;
            const activeStateChangedListener = (event) => {
                const { state } = event;
                if (timeoutID) { clearTimeout(timeoutID); }
                if (state === fromState) {
                    timeoutID = setTimeout(() => {
                                    this.fsm.fireTransition(transitionName);
                                }, timeoutDelay);
                }
            };
            const transitionFromChangedListener = (event) => {
                const { transition } = event;
                if (transition === transitionName) {
                    removeListener();
                }
            };
            removeListener = () => {
                if (timeoutID) { clearTimeout(timeoutID); }
                this.fsm.removeListener('activeStateChanged', activeStateChangedListener);
                this.fsm.removeListener('transitionFromChanged', transitionFromChangedListener);
            };
            if (this.fsm.getActiveState() === fromState) {
                timeoutID = setTimeout(() => {
                            this.fsm.fireTransition(transitionName);
                        }, timeoutDelay);
            }
            this.fsm.addListener('activeStateChanged', activeStateChangedListener);
            this.fsm.addListener('transitionFromChanged', transitionFromChangedListener);

            return removeListener;
        } else if (type === 'touchgroup') {
            const { touchEventType, selectedTouchGroup } = payload;
            const touchGroup = this.touchGroupMap.get(selectedTouchGroup);

            if (touchGroup) {
                if (touchEventType === 'start') {
                    const onSatisfied = () => {
                        this.fsm.fireTransition(transitionName);
                    };
                    touchGroup.addListener('satisfied', onSatisfied);
                    const removeListener = () => {
                        touchGroup.removeListener('satisfied', onSatisfied);
                    };
                    return removeListener;
                } else if (touchEventType === 'end') {
                    const onUnsatisfied = () => {
                        this.fsm.fireTransition(transitionName);
                    };
                    touchGroup.addListener('unsatisfied', onUnsatisfied);
                    const removeListener = () => {
                        touchGroup.removeListener('unsatisfied', onUnsatisfied);
                    };
                    return removeListener;
                } else if (touchEventType === 'cross') {
                    const { selectedPath } = payload;
                    const path = this.pathMap.get(selectedPath);
                    if (path) {
                        const onCross = () => {
                            this.fsm.fireTransition(transitionName);
                        };
                        touchGroup.addCrossListener(path, onCross);
                        const removeListener = () => {
                            touchGroup.removeCrossListener(path, onCross);
                        };
                        return removeListener;
                    }
                }
            }
            return () => null;
        } else if (type === 'none' || type === undefined) {
            return () => null;
        } else {
            console.log(payload);
            return () => null;
        }
    }
    private updateTouchDisplayListeners(): void {
        const touchGroups = Array.from(this.touchGroupMap.keys());
        const liveUpdaters = Array.from(this.liveUpdaterMap.keys());
        const touchClusters = touchGroups.map((tg) => this.touchGroupMap.get(tg));
        const toAdd = difference(touchGroups, liveUpdaters);
        const toRemove = difference(liveUpdaters, touchGroups);

        toAdd.forEach((name) => {
            const touchGroup = this.touchGroupMap.get(name);
            this.liveUpdaterMap.set(name, { pause: () => null, resume: () => null,
                run: () => null, destroy: () => null });
            const liveFn = cjs.liven(() => {
                const props = ['$xConstraint', '$yConstraint', '$startXConstraint',
                                '$startYConstraint', '$endXConstraint', '$endYConstraint',
                                '$rotation', '$scale', '$startRadius', '$radius'];
                const values = {};
                props.forEach((prop) => {
                    values[prop] = cjs.get(touchGroup[prop]);
                });
                this.debouncedPropertyUpdate(name, values);
            });
            this.liveUpdaterMap.set(name, liveFn);
        });
        toRemove.forEach((name) => {
            const liveFn = this.liveUpdaterMap.get(name);
            liveFn.destroy();
            // liveFn.pause();
            this.liveUpdaterMap.delete(name);
        });
    }

    private replayFromURL(name: string): Promise<void> {
        return this.replayTouchFile(`gesture_recordings/${name}.recording.json`,
            { target: this.element });
    }

    private async replayTouchFile(url: string, options?: ReplayOptions): Promise<void> {
        const touchData = await fetch(url);
        const data = await touchData.json();
        replayTouches(data, options);
    }
}