import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { FSMEditor } from './FSMEditor';
import { BehaviorDoc, StateData, TransitionData } from '../../interfaces';
import { CodeEditor } from './CodeEditor';

const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');
window['fsm' + ''] = fsm;
const useCodeEditor = window.location.pathname.includes('code');

(async (): Promise<void> => {
    doc.subscribe();
    await doc.fetch();
    const editor = useCodeEditor ? <FSMEditor doc={doc} fsm={fsm} /> : <CodeEditor doc={doc} />;
    ReactDOM.render(
        <div className="container">
            {editor}
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();