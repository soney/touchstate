import * as React from 'react';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';
import { FSMComponent } from './views/FSMComponent';
import { StateData, TransitionData, TouchGroupObj, PathObj } from '../../interfaces';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { FSM } from 't2sm';
import { keys, map } from 'lodash';

interface EditorProps {
    doc: SDBDoc<any>;
    fsm: FSM<StateData, TransitionData>;
}
interface EditorState {
    touchGroups: TouchGroupObj;
    paths: PathObj;
}

export class Editor extends React.Component<EditorProps, EditorState> {
    private touchGroups: SDBSubDoc<TouchGroupObj>;
    private paths: SDBSubDoc<PathObj>;
    public constructor(props: EditorProps) {
        super(props);

        this.touchGroups = this.props.doc.subDoc(['touchGroups']);
        this.paths = this.props.doc.subDoc(['paths']);

        this.touchGroups.subscribe(() => {
            this.setState({ touchGroups: this.touchGroups.getData() });
        });
        this.paths.subscribe(() => {
            this.setState({ paths: this.paths.getData() });
        });
        this.state = {
            touchGroups: this.touchGroups.getData(),
            paths: this.paths.getData()
        };
    }

    public render(): React.ReactNode {
        const { doc, fsm } = this.props;
        const touchGroupDisplays: React.ReactNode[] = map(this.state.touchGroups, (tg, name) => {
            return (
                <div key={name}>
                    {name}:
                    <TouchGroupDisplay doc={doc} path={['touchGroups', name]} />
                </div>
            );
        });
        const pathDisplays: React.ReactNode[] = map(this.state.paths, (p, name) => {
            return (
                <div key={name}>
                    {name}:
                    <PathSpecDisplay doc={doc} path={['paths', name]} />
                </div>
            );
        });
        return (
            <div>
                <FSMComponent doc={doc} path={['fsm']} fsm={fsm} />
                <div className="touchGroups">
                    <div>
                        {touchGroupDisplays}
                    </div>
                    <button onClick={this.addTouchGroup}>Add Touch Group</button>
                </div>
                <div className="paths">
                    <div>
                        {pathDisplays}
                    </div>
                    <button onClick={this.addPath}>Add Path</button>
                </div>
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