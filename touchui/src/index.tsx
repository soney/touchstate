import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TouchBehavior } from './TouchBehavior';
// import { StateData, TransitionData } from '../../editor/src/views/FSMComponent';
// import * as Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js';
// snapsvg';
// const Snap = require( 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js' );

import './index.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';

// const fsm: FSM<StateData, TransitionData> = new FSM();
const client: SDBClient = new SDBClient(new WebSocket(`ws://${window.location.hostname}:3000`));
const doc: SDBDoc<any> = client.get('touchdoc', 'touchdoc');

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
