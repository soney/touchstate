import * as React from 'react';
import * as SVG from 'svg.js';
import 'svg.pathmorphing.js';
import * as dagre from 'dagre';
import { FSM } from 't2sm';
import { first, tail } from 'lodash';

interface MorphableAnimation extends SVG.Animation {
    plot: (key: string) => this;
}

interface StateMachineDisplayProps {
}
interface StateMachineDisplayState {
}

interface StateData {

}

interface TransitionData {

}
enum CREATE_TRANSITION_STATE {
    IDLE, PRESSED_ON_FROM, LEFT_FROM, OVER_TO 
}

export class StateMachineDisplay extends React.Component<StateMachineDisplayProps, StateMachineDisplayState> {
    private svg: SVG.Doc;
    private fsm: FSM<StateData, TransitionData> = new FSM();
    private graph: dagre.graphlib.Graph = new dagre.graphlib.Graph({ multigraph: true, directed: true });
    private states: Map<string, SVG.G> = new Map();
    private transitions: Map<string, SVG.G> = new Map();
    private createTransitionState: CREATE_TRANSITION_STATE = CREATE_TRANSITION_STATE.IDLE;
    private creatingTransitionFromState: string;
    private creatingTransitionToState: string;
    private creatingTransitionLine: SVG.G = null;

    public constructor(props: StateMachineDisplayProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div>
                <button className="btn btn-default" onClick={this.addStateClicked}>Add State</button>
                <div ref={this.drawingRef} id="drawing" />
            </div>
        );
    }

    public addState(payload: StateData = {}): string {
        const stateName = this.fsm.addState(payload);
        this.graph.setNode(stateName, {width: 50, height: 20});

        const stateGroup = this.svg.group();
        stateGroup.rect(50, 20);

        stateGroup.mousedown(this.mousedownGroup.bind(this, stateName));
        stateGroup.mouseout(this.mouseoutGroup.bind(this, stateName));
        stateGroup.mouseover(this.mouseoverGroup.bind(this, stateName));
        stateGroup.mouseup(this.mouseupGroup.bind(this, stateName));

        this.states.set(stateName, stateGroup);

        this.updateLayout();
        return stateName;
    }

    public addTransition(fromLabel: string, toLabel: string, payload: TransitionData): string {
        const name = this.fsm.addTransition(fromLabel, toLabel, null, payload);
        this.graph.setEdge(fromLabel, toLabel, {},  name);

        const transitionGroup = this.svg.group();

        if (this.creatingTransitionLine) {
            this.creatingTransitionLine.select('path').each(($: number, members: SVG.Element[]) => {
                members.forEach((p: SVG.Path) => {
                    this.creatingTransitionLine.removeElement(p);
                    transitionGroup.add(p);
                    p.stroke({ color: '#000' });
                });
            });
        } else {
            transitionGroup.path('').stroke({ color: '#000', width: 2 }).fill('none').addClass('nopointer');
        }

        this.transitions.set(name, transitionGroup);

        this.updateLayout();
        return name;
    }

    private drawingRef = (drawingElement: HTMLDivElement): void => {
        if (drawingElement) {
            this.svg = SVG(drawingElement);
            this.graph.setGraph({});
            this.graph.setNode(this.fsm.getStartState(), { type: 'start', width: 30, height: 30});
            const stateGroup = this.svg.group();
            stateGroup.circle(15);

            this.states.set(this.fsm.getStartState(), stateGroup);
            this.updateLayout();
            const s2 = this.addState();
            this.addTransition(this.addState(), s2, {});
            this.addTransition(s2, this.addState(), {});
            this.addTransition(this.addState(), s2, {});
            this.svg.on('mousemove', this.mousemoveSVG);
            window.addEventListener('mouseup', this.mouseupWindow);
        }
    }

    private addStateClicked = (): void => {
       this.addState(); 
    }

    private destroyTransitionCreationIntermediateData(): void {
        this.creatingTransitionToState = this.creatingTransitionFromState = null;
        this.createTransitionState = CREATE_TRANSITION_STATE.IDLE;
        if (this.creatingTransitionLine) {
            this.creatingTransitionLine.remove();
            this.creatingTransitionLine = null;
        }
    }

    private updateCreatingTransitionLine(x: number, y: number): void {
        const node = this.graph.node(this.creatingTransitionFromState);
        this.creatingTransitionLine.select('path').each(($: number, members: SVG.Element[]) => {
            members.forEach((p: SVG.Path) => {
                p.plot(`M ${node.x} ${node.y} L ${x} ${y}`);
            });
        });
    }

    private mousemoveSVG = (event: MouseEvent): void => {
        if (this.creatingTransitionLine !== null) {
            const {clientX, clientY} = event;
            const {x, y} = this.svg.node.getBoundingClientRect() as DOMRect;

            this.updateCreatingTransitionLine(clientX - x, clientY - y);
        }
    }

    private mousedownGroup = (stateName: string, event: MouseEvent): void => {
        if (this.createTransitionState === CREATE_TRANSITION_STATE.IDLE) {
            this.createTransitionState = CREATE_TRANSITION_STATE.PRESSED_ON_FROM;
            this.creatingTransitionFromState = stateName;
            this.creatingTransitionLine = this.svg.group();
            this.creatingTransitionLine.path('').stroke({ color: '#F00', width: 2 }).fill('none').addClass('nopointer');
            this.mousemoveSVG(event);
        } else {
            this.destroyTransitionCreationIntermediateData();
        }
        event.preventDefault();
    }
    private mouseoutGroup = (stateName: string, event: MouseEvent): void => {
        if (this.createTransitionState === CREATE_TRANSITION_STATE.PRESSED_ON_FROM &&
                stateName === this.creatingTransitionFromState) {
            this.createTransitionState = CREATE_TRANSITION_STATE.LEFT_FROM;
        } else if (this.createTransitionState === CREATE_TRANSITION_STATE.OVER_TO) {
            this.createTransitionState = CREATE_TRANSITION_STATE.LEFT_FROM;
            this.creatingTransitionToState = null;
        }
        event.preventDefault();
    }
    private mouseoverGroup = (stateName: string, event: MouseEvent): void => {
        if (this.createTransitionState === CREATE_TRANSITION_STATE.LEFT_FROM) {
            this.createTransitionState = CREATE_TRANSITION_STATE.OVER_TO;
            this.creatingTransitionToState = stateName;
        }
        event.preventDefault();
    }

    private mouseupWindow = (event: MouseEvent): void => {
        event.preventDefault();
        this.destroyTransitionCreationIntermediateData();
    }

    private mouseupGroup = (stateName: string, event: MouseEvent): void => {
        if (this.createTransitionState === CREATE_TRANSITION_STATE.OVER_TO &&
                stateName === this.creatingTransitionToState) {
            this.createTransitionState = CREATE_TRANSITION_STATE.IDLE;

            this.addTransition(this.creatingTransitionFromState, this.creatingTransitionToState, {});
            this.destroyTransitionCreationIntermediateData();
        } else {
            this.destroyTransitionCreationIntermediateData();
        }
        event.preventDefault();
        event.stopPropagation();
    }

    private updateLayout(): void {
        dagre.layout(this.graph);
        const {width, height} = this.graph.graph();
        this.svg.width(width);
        this.svg.height(height);
        this.graph.nodes().forEach((v) => {
            const group = this.states.get(v);
            const node = this.graph.node(v);

            group.select('rect').each((i: number, members: SVG.Element[]) => {
                members.forEach((r: SVG.Rect) => {
                    r.width(node.width);
                    r.height(node.height);
                    r.animate(1).center(node.x, node.y);
                });
            });
        });
        this.graph.edges().forEach((e) => {
            const node = this.graph.edge(e);
            const group = this.transitions.get(e.name);

            const path = group.select('path');
            const { points } = this.graph.edge(e);
            group.select('path').each(($: number, members: SVG.Element[]) => {
                members.forEach((p: SVG.Path) => {
                    const pointStrings = points.map(pnt => `${pnt.x} ${pnt.y}`);
                    const controlPoints = tail(pointStrings);
                    let pathString = `M ${pointStrings[0]}`;
                    for (let i: number = 1; i < pointStrings.length - 1; i += 2) {
                        pathString += ` Q ${pointStrings[i]} ${pointStrings[i + 1]}`;
                    }
                    const sndLstPnt = points[points.length - 2];
                    const lastPnt = points[points.length - 1];
                    const theta = Math.atan2(sndLstPnt.y - lastPnt.y, sndLstPnt.x - lastPnt.x);
                    const offset = 20 * Math.PI / 180;
                    const s = 10;
                    pathString += ` m ${Math.cos(theta + offset) * s} ${Math.sin(theta + offset) * s}`;
                    pathString += ` L ${lastPnt.x} ${lastPnt.y}`;
                    pathString += ` l ${Math.cos(theta - offset) * s} ${Math.sin(theta - offset) * s}`;

                    (p.animate(1) as MorphableAnimation).plot(pathString);
                });
            });

            // console.log('Edge ' + e.v + ' -> ' + e.w + ': ' + JSON.stringify(this.graph.edge(e)));
        });
    }
} 