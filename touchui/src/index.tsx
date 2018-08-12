import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TouchBehavior } from './TouchBehavior';

import './index.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { BehaviorDoc } from '../../interfaces';

// const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<BehaviorDoc> = client.get('touchdoc', 'touchdoc');

(async (): Promise<void> => {
    doc.subscribe();
    await doc.fetch();

})();
ReactDOM.render(
    <div className="container">
        <TouchBehavior doc={doc} path={[]} />
    </div>,
    document.getElementById('root') as HTMLElement
);
