import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { StateMachineDisplay } from './StateMachineDisplay';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
    <div className="container">
        <StateMachineDisplay />
    </div>,
    document.getElementById('root') as HTMLElement
); 