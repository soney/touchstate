import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { FSMEditor } from './FSMEditor';
import { BehaviorDoc, StateData, TransitionData } from '../../interfaces';
import { CodeEditor } from './CodeEditor';

const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');
let useCodeEditor = window.location.pathname.includes('code');
// useCodeEditor = true;

const fsm: FSM<StateData, TransitionData> = new FSM();
const binding = new SDBBinding(doc, ['fsm'], fsm);
window['fsm' + ''] = fsm;

(async (): Promise<void> => {
    doc.subscribe();
    await doc.fetch();
    const editor = useCodeEditor ? <CodeEditor doc={doc} /> : <FSMEditor doc={doc} fsm={fsm} />;
    ReactDOM.render(
        <div className="container">
            {editor}
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();