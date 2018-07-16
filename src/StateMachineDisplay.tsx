import * as React from 'react';
import * as SVG from 'svg.js';
import * as dagre from 'dagre';
import { FSM } from 't2sm';

interface StateMachineDisplayProps {
}
interface StateMachineDisplayState {
}

interface StateData {

}

interface TransitionData {

}

export class StateMachineDisplay extends React.Component<StateMachineDisplayProps, StateMachineDisplayState> {
    private svg: SVG.Doc;
    private fsm: FSM<StateData, TransitionData> = new FSM();
    private graph: dagre.graphlib.Graph = new dagre.graphlib.Graph();
    private states: Map<string, SVG.G> = new Map();
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

        this.states.set(stateName, stateGroup);

        this.updateLayout();
        return stateName;
    }

    public addTransition(fromLabel: string, toLabel: string, payload: TransitionData): string {
        const transitionName = this.fsm.addTransition(fromLabel, toLabel, null, payload);
        this.graph.setEdge(fromLabel, toLabel, {});
        this.updateLayout();
        return transitionName;
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
        }
    }

    private addStateClicked = (): void => {
       this.addState(); 
    }

    private updateLayout(): void {
        dagre.layout(this.graph);
        this.graph.nodes().forEach((v) => {
            const group = this.states.get(v);
            const node = this.graph.node(v);

            // group.attr({
            //     width: node.width, height: node.height, x: node.x, y: node.y
            // });

            group.width(node.width);
            group.height(node.height);
            group.animate(200).move(node.x, node.y);

            console.log('Node ' + v + ': ' + JSON.stringify(this.graph.node(v)));
        });
        this.graph.edges().forEach((e) => {
            console.log('Edge ' + e.v + ' -> ' + e.w + ': ' + JSON.stringify(this.graph.edge(e)));
        });
    }
} 