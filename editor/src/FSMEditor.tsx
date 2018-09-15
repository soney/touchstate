// tslint:disable:max-line-length
import * as React from 'react';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';
import { FSMComponent } from './views/FSMComponent';
import { StateData, TransitionData, TouchGroupObj, PathObj, BehaviorDoc } from '../../interfaces';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { FSM } from 't2sm';
import { keys, map } from 'lodash';

interface EditorProps {
    doc: SDBDoc<BehaviorDoc>;
    fsm: FSM<StateData, TransitionData>;
}
interface EditorState {
    touchGroups: TouchGroupObj;
    paths: PathObj;
}

export class FSMEditor extends React.Component<EditorProps, EditorState> {
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
                    <h5>
                        {name}
                        <button className="float-right btn btn-sm btn-outline-danger" onClick={this.removeTouchGroup.bind(this, name)}>Delete</button>
                    </h5>
                    <TouchGroupDisplay doc={doc} path={['touchGroups', name]} />
                </div>
            );
        });
        const pathDisplays: React.ReactNode[] = map(this.state.paths, (p, name) => {
            return (
                <div key={name}>
                    <h5>
                        {name}
                        <button className="float-right btn btn-sm btn-outline-danger" onClick={this.removePath.bind(this, name)}>Delete</button>
                    </h5>
                    <PathSpecDisplay doc={doc} path={['paths', name]} />
                </div>
            );
        });
        return (
            <div>
                <div className="row">
                    <div className="col">
                        <FSMComponent doc={doc} path={['fsm']} fsm={fsm} />
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="touchGroups col">
                        <h2>Touch Groups</h2>
                        <div>
                            {touchGroupDisplays}
                        </div>
                        <button className="btn btn-dark btn-block" onClick={this.addTouchGroup}>+ Touch Group</button>
                    </div>
                    <div className="paths col">
                        <h2>Paths</h2>
                        <div>
                            {pathDisplays}
                        </div>
                        <button className="btn btn-dark btn-block" onClick={this.addPath}>+ Path</button>
                    </div>
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

    private removePath(name: string): void {
        this.paths.submitObjectDeleteOp([name]);
    }

    private removeTouchGroup(name: string): void {
        this.touchGroups.submitObjectDeleteOp([name]);
    }
}