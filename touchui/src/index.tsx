import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TouchBehavior } from './TouchBehavior';

import './index.css';
import { FSM, SDBBinding } from 't2sm';
import { SDBDoc, SDBClient } from 'sdb-ts';
import { BehaviorDoc } from '../../interfaces';
import { replayTouches } from './touchscreen/touch_replay';

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

interface ReplayOptions {
    target?: HTMLElement;
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;
}

// tslint:disable-next-line:max-line-length quotemark whitespace
const recording = [{"type":"touchstart","changedTouches":[{"identifier":2385535732,"clientX":61,"clientY":190,"pageX":61,"pageY":190,"screenX":61,"screenY":190,"force":0},{"identifier":2385535733,"clientX":168,"clientY":156,"pageX":168,"pageY":156,"screenX":168,"screenY":156,"force":0}],"timestamp":1456771413517},{"type":"touchmove","changedTouches":[{"identifier":2385535732,"clientX":61,"clientY":181,"pageX":61,"pageY":181,"screenX":61,"screenY":181,"force":0}],"timestamp":1456771413538},{"type":"touchend","changedTouches":[{"identifier":2385535732,"clientX":61,"clientY":181,"pageX":61,"pageY":181,"screenX":61,"screenY":181,"force":0},{"identifier":2385535733,"clientX":168,"clientY":156,"pageX":168,"pageY":156,"screenX":168,"screenY":156,"force":0}],"timestamp":1456771413581},{"type":"touchstart","changedTouches":[{"identifier":2385535734,"clientX":203,"clientY":272,"pageX":203,"pageY":272,"screenX":203,"screenY":272,"force":0}],"timestamp":1456771417528},{"type":"touchend","changedTouches":[{"identifier":2385535734,"clientX":203,"clientY":272,"pageX":203,"pageY":272,"screenX":203,"screenY":272,"force":0}],"timestamp":1456771417566},{"type":"touchstart","changedTouches":[{"identifier":2385535735,"clientX":242,"clientY":193,"pageX":242,"pageY":193,"screenX":242,"screenY":193,"force":0},{"identifier":2385535736,"clientX":122,"clientY":224,"pageX":122,"pageY":224,"screenX":122,"screenY":224,"force":0}],"timestamp":1456771419433},{"type":"touchend","changedTouches":[{"identifier":2385535735,"clientX":242,"clientY":193,"pageX":242,"pageY":193,"screenX":242,"screenY":193,"force":0},{"identifier":2385535736,"clientX":122,"clientY":224,"pageX":122,"pageY":224,"screenX":122,"screenY":224,"force":0}],"timestamp":1456771419567},{"type":"touchstart","changedTouches":[{"identifier":2385535737,"clientX":249,"clientY":308,"pageX":249,"pageY":308,"screenX":249,"screenY":308,"force":0}],"timestamp":1456771422417},{"type":"touchend","changedTouches":[{"identifier":2385535737,"clientX":249,"clientY":308,"pageX":249,"pageY":308,"screenX":249,"screenY":308,"force":0}],"timestamp":1456771422585},{"type":"touchstart","changedTouches":[{"identifier":2385535738,"clientX":238,"clientY":198,"pageX":238,"pageY":198,"screenX":238,"screenY":198,"force":0},{"identifier":2385535739,"clientX":120,"clientY":227,"pageX":120,"pageY":227,"screenX":120,"screenY":227,"force":0}],"timestamp":1456771424901},{"type":"touchend","changedTouches":[{"identifier":2385535738,"clientX":238,"clientY":198,"pageX":238,"pageY":198,"screenX":238,"screenY":198,"force":0},{"identifier":2385535739,"clientX":120,"clientY":227,"pageX":120,"pageY":227,"screenX":120,"screenY":227,"force":0}],"timestamp":1456771425020},{"type":"touchstart","changedTouches":[{"identifier":2385535740,"clientX":215,"clientY":263,"pageX":215,"pageY":263,"screenX":215,"screenY":263,"force":0}],"timestamp":1456771428134},{"type":"touchend","changedTouches":[{"identifier":2385535740,"clientX":215,"clientY":263,"pageX":215,"pageY":263,"screenX":215,"screenY":263,"force":0}],"timestamp":1456771428254},{"type":"touchstart","changedTouches":[{"identifier":2385535741,"clientX":227,"clientY":226,"pageX":227,"pageY":226,"screenX":227,"screenY":226,"force":0},{"identifier":2385535742,"clientX":93,"clientY":239,"pageX":93,"pageY":239,"screenX":93,"screenY":239,"force":0}],"timestamp":1456771430105},{"type":"touchmove","changedTouches":[{"identifier":2385535742,"clientX":97,"clientY":237,"pageX":97,"pageY":237,"screenX":97,"screenY":237,"force":0}],"timestamp":1456771430139},{"type":"touchmove","changedTouches":[{"identifier":2385535742,"clientX":98,"clientY":237,"pageX":98,"pageY":237,"screenX":98,"screenY":237,"force":0}],"timestamp":1456771430156},{"type":"touchmove","changedTouches":[{"identifier":2385535742,"clientX":99,"clientY":237,"pageX":99,"pageY":237,"screenX":99,"screenY":237,"force":0}],"timestamp":1456771430172},{"type":"touchmove","changedTouches":[{"identifier":2385535742,"clientX":99,"clientY":236,"pageX":99,"pageY":236,"screenX":99,"screenY":236,"force":0}],"timestamp":1456771430205},{"type":"touchmove","changedTouches":[{"identifier":2385535742,"clientX":99,"clientY":237,"pageX":99,"pageY":237,"screenX":99,"screenY":237,"force":0}],"timestamp":1456771430272},{"type":"touchend","changedTouches":[{"identifier":2385535741,"clientX":227,"clientY":226,"pageX":227,"pageY":226,"screenX":227,"screenY":226,"force":0},{"identifier":2385535742,"clientX":99,"clientY":237,"pageX":99,"pageY":237,"screenX":99,"screenY":237,"force":0}],"timestamp":1456771430290},{"type":"touchstart","changedTouches":[{"identifier":2385535743,"clientX":206,"clientY":251,"pageX":206,"pageY":251,"screenX":206,"screenY":251,"force":0}],"timestamp":1456771433171},{"type":"touchend","changedTouches":[{"identifier":2385535743,"clientX":206,"clientY":251,"pageX":206,"pageY":251,"screenX":206,"screenY":251,"force":0}],"timestamp":1456771433340}];

setTimeout(() => {
    // replayTouchFile(path.join(__dirname, '..', 'gesture_recordings', 'two finger tap count tap.recording'));
    // console.log('hi');
    // replayTouchFile('gesture_recordings/two finger tap count tap.recording');
    // replayTouches(recording, {});
    // console.log('replay');
}, 1000);

async function replayTouchFile(url: string, options?: ReplayOptions): Promise<void> {
    const touchData = await fetch(url);
    const data = touchData.json();
    replayTouches(data, options);
}
// window.addEventListener('touchstart', (event) => {
//     event.preventDefault();
//     return false;
// }, false);
// window.addEventListener('touchmove', (event) => {
//     event.preventDefault();
//     return false;
// }, false);