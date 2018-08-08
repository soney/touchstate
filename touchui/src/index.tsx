import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { StateData, TransitionData } from '../../editor/src/views/FSMComponent';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';

// const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<any> = client.get('touchdoc', 'touchdoc');

(async (): Promise<void> => {
    doc.subscribe(() => {
        console.log(doc.getData());
    });
    await doc.fetch();
    const binding = new SDBBinding(null, doc, ['fsm']);

    ReactDOM.render(
        <div className="container">
        HELLO
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();
