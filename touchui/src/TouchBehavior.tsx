/* tslint:disable:no-string-literal*/
import * as React from 'react';
import * as cjs from 'constraintjs';
import { SDBClient, SDBDoc } from 'sdb-ts';
import { FSM, SDBBinding } from 't2sm/built';
// import { StateData, TransitionData } from '../../editor/src/views/FSMComponent';
import * as jQuery from 'jquery';
import './touchscreen/simple_touch_view';
import * as SVG from 'svg.js';

interface TouchBehaviorProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface TouchBehaviorState {
}

export class TouchBehavior extends React.Component<TouchBehaviorProps, TouchBehaviorState> {
    private binding: SDBBinding;
    private fsm: FSM<any, any>;
    public constructor(props: TouchBehaviorProps) {
        super(props);
        this.state = { };
        this.initialize();
    }

    public render(): React.ReactNode {
        return (
            <div ref={this.contentRef} />
        );
    }

    private contentRef = (element: HTMLDivElement): void => {
        if (element) {
            const paper = SVG(element);
            jQuery(element)['screen_touches']({paper});
            console.log(element);
        }
    }

    private async initialize(): Promise<void> {
        const doc = this.getDoc();
        doc.subscribe();
        await doc.fetch();
        this.binding = new SDBBinding(doc, ['fsm']);
        this.fsm = this.binding.getFSM();
    }

    private getDoc(): SDBDoc<any> {
        return this.props.doc;
    }
}