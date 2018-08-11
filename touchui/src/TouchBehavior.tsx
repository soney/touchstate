/* tslint:disable:no-string-literal*/
import * as React from 'react';
import * as cjs from 'constraintjs';
import { SDBClient, SDBDoc } from 'sdb-ts';
import { FSM, SDBBinding } from 't2sm/built';
// import { StateData, TransitionData } from '../../editor/src/views/FSMComponent';
import * as jQuery from 'jquery';
import './touchscreen/touchscreen_layer';
import * as SVG from 'svg.js';
import { Path } from './touch_primitives/Path';
import { TouchCluster } from './touch_primitives/TouchCluster';

interface TouchBehaviorProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface TouchBehaviorState {
}

export class TouchBehavior extends React.Component<TouchBehaviorProps, TouchBehaviorState> {
    private binding: SDBBinding;
    private fsm: FSM<any, any>;
    private element: HTMLDivElement;
    private renderedPromise: Promise<HTMLDivElement>;
    private resolveRP: Function;
    public constructor(props: TouchBehaviorProps) {
        super(props);
        this.state = { };
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
        return (
            <div ref={this.contentRef} />
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

    private contentRef = (element: HTMLDivElement): void => {
        if (element) {
            const paper = SVG(element);
            jQuery(element)['touchscreen_layer']({paper});
            this.element = element;
            this.resolveRP(this.element);
        }
    }

    private async initialize(): Promise<void> {
        const doc = this.getDoc();
        doc.subscribe();
        await doc.fetch();
        await this.renderedPromise;
        this.binding = new SDBBinding(doc, ['fsm']);
        this.fsm = this.binding.getFSM();
    }

    private getDoc(): SDBDoc<any> {
        return this.props.doc;
    }
}