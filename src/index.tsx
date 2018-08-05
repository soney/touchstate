import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FSMComponent, StateData, TransitionData } from './FSMComponent';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FSM } from 't2sm';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';

const fsm: FSM<StateData, TransitionData> = new FSM();

ReactDOM.render(
    <div className="container">
        <FSMComponent fsm={fsm} />
        <TouchGroupDisplay />
        <PathSpecDisplay />
    </div>,
    document.getElementById('root') as HTMLElement
); 