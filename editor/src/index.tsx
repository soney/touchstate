import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { Editor } from './Editor';
import { BehaviorDoc, StateData, TransitionData } from '../../interfaces';

const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');

(async (): Promise<void> => {
    doc.subscribe();
    await doc.fetch();
    ReactDOM.render(
        <div className="container">
            <Editor doc={doc} fsm={fsm} />
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();