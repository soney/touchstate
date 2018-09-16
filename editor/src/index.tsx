import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { FSMEditor } from './FSMEditor';
import { BehaviorDoc, StateData, TransitionData } from '../../interfaces';
import { CodeEditor } from './CodeEditor';
import { write } from 'fs';

const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
const client: SDBClient = new SDBClient(ws);
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');
let useCodeEditor = window.location.pathname.includes('code');
// useCodeEditor = true;

const binding = new SDBBinding(doc, ['fsm']);
const fsm: FSM<StateData, TransitionData> = binding.getFSM() as FSM<StateData, TransitionData>;
window['fsm' + ''] = fsm;

(async (): Promise<void> => {
    doc.subscribe();
    await doc.fetch();
    if (fsm.getStates().length === 1) {
        const s2 = fsm.addState();
        const t = fsm.addTransition(fsm.getStartState(), s2);
        fsm.setTransitionPayload(t, { type: 'startTransition'});
    }
    const editor = useCodeEditor ? <CodeEditor doc={doc} /> : <FSMEditor doc={doc} fsm={fsm} />;
    ReactDOM.render(
        <div className="container">
            {editor}
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();

function writeToSave(): void {
    ws.send('save');
}
// tslint:disable:no-string-literal
window['save'] = writeToSave;