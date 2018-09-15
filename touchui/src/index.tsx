// tslint:disable:no-eval, no-string-literal
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TouchBehavior } from './TouchBehavior';

import * as jQuery from 'jquery';
import './index.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { BehaviorDoc } from '../../interfaces';
import { Path as SPath } from './touch_primitives/Path';
import { TouchCluster } from './touch_primitives/TouchCluster';

// const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');

function markDone() {
    alert('MARKED DONE');
}

(async (): Promise<void> => {
    doc.subscribe((type: string, ops: any[]) => {
        const data = doc.getData();
        const { code } = data;
        if (type === null) {
            doc.submitObjectReplaceOp(['codeErrors'], []);
            if (code) {
                try {
                    eval(code);
                } catch (e) {
                    doc.submitListPushOp(['codeErrors'], e.toString());
                }
            }
        } else if (type === 'op') {
            ops.forEach((op) => {
                const { p } = op;
                if (p.length === 1 && p[0] === 'code') {
                    window.location.reload();
                }
            });
        }
    });
    await doc.fetch();
})();
const r: Element = ReactDOM.render(
    <div className="container">
        <TouchBehavior doc={doc} path={[]} />
    </div>,
    document.getElementById('root') as HTMLElement
) as any;
class Path extends SPath {
    constructor() {
        super();
        jQuery('.simpleScreenTouches', r)['touchscreen_layer']('addPath', this);
        console.log('create');
    }
}

window['TouchCluster' + ''] = TouchCluster;
window['Path' + ''] = Path;
window.addEventListener('touchstart', (event) => {
    const target: Element = event.target as Element;
    const tagName = target.tagName.toUpperCase();
    if (tagName === 'SELECT') {
        console.log('select');
    } else {
        event.preventDefault();
        return false;
    }
}, false);
window.addEventListener('touchmove', (event) => {
    event.preventDefault();
    return false;
}, false);
window.addEventListener('touchend', (event) => {
    const target: Element = event.target as Element;
    const tagName = target.tagName.toUpperCase();
    if (tagName === 'SELECT') {
        console.log('select');
    } else {
        event.preventDefault();
        return false;
    }
}, false);