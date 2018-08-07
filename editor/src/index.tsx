import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FSMComponent, StateData, TransitionData } from './FSMComponent';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM } from 't2sm';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';
import { SDBDoc, SDBClient } from 'sdb-ts';

const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<any> = client.get('touchdoc', 'touchdoc');

(async (): Promise<void> => {
    doc.subscribe(() => {
        console.log(doc.getData());
    });
    await doc.fetch();
    ReactDOM.render(
        <div className="container">
            <FSMComponent doc={doc} path={['fsm']} fsm={fsm} />
            <TouchGroupDisplay doc={doc} path={['tg']} />
            <PathSpecDisplay doc={doc} path={['ps']} />
        </div>,
        document.getElementById('root') as HTMLElement
    );
})();
