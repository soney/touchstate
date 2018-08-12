import * as React from 'react';
import { SDBDoc, SDBSubDoc } from 't2sm/node_modules/sdb-ts';
import { FSMComponent } from './views/FSMComponent';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../interfaces';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { FSM } from 't2sm';
import { keys } from 'lodash';

interface EditorProps {
    doc: SDBDoc<any>;
    fsm: FSM<StateData, TransitionData>;
}
interface EditorState {
}

export class Editor extends React.Component<EditorProps, EditorState> {
    private touchGroups: SDBSubDoc<TouchGroupObj>;
    private paths: SDBSubDoc<PathObj>;
    public constructor(props: EditorProps) {
        super(props);
        this.state = {
        };
        this.touchGroups = this.props.doc.subDoc(['touchGroups']);
        this.paths = this.props.doc.subDoc(['paths']);
        this.touchGroups.subscribe(() => {
            console.log(this.touchGroups.getData());
        });
        this.paths.subscribe(() => {
            console.log(this.paths.getData());
        });
    }

    public render(): React.ReactNode {
        const { doc, fsm } = this.props;
        return (
            <div>
                <FSMComponent doc={doc} path={['fsm']} fsm={fsm} />
                <button onClick={this.addTouchGroup}>Add Touch Group</button>
                <button onClick={this.addPath}>Add Path</button>
                {/* <TouchGroupDisplay doc={doc} path={['tg']} /> */}
                {/* <PathSpecDisplay doc={doc} path={['ps']} /> */}
            </div>
        );
    }

    private addTouchGroup = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const existingTouchGroupNames = keys(this.touchGroups.getData());
        let i: number = existingTouchGroupNames.length ;
        let tgName: string;
        do {
            i++;
            tgName = `touch_${i}`;
        } while (existingTouchGroupNames.indexOf(tgName) >= 0);
        this.touchGroups.submitObjectInsertOp([tgName], {});
    }

    private addPath = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const existingPathNames = keys(this.paths.getData());
        let i: number = existingPathNames.length ;
        let pName: string;
        do {
            i++;
            pName = `path_${i}`;
        } while (existingPathNames.indexOf(pName) >= 0);
        this.paths.submitObjectInsertOp([pName], {});
    }

}