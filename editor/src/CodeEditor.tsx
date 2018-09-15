// tslint:disable:max-line-length
import 'codemirror/lib/codemirror.css';
import * as React from 'react';
import * as ReactCodeMirror from 'react-codemirror';
import 'codemirror/mode/javascript/javascript';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';
import { FSMComponent } from './views/FSMComponent';
import { StateData, TransitionData, TouchGroupObj, PathObj, BehaviorDoc } from '../../interfaces';
import { TouchGroupDisplay } from './views/TouchGroupDisplay';
import { PathSpecDisplay } from './views/PathSpecDisplay';
import { FSM } from 't2sm';
import { keys, map } from 'lodash';

interface CodeEditorProps {
    doc: SDBDoc<BehaviorDoc>;
}
interface CodeEditorState {
    code: string;
    codeErrors: string[];
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    private codeMirror: CodeMirror.Editor;
    public constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            code: '// Write your code here',
            codeErrors: []
        };
        const { doc } = this.props;
        doc.subscribe((type: string, ops: any[]) => {
            const data = doc.getData();
            const { code, codeErrors } = data;
            if (type === null) {
                this.state = { code, codeErrors };
                this.setState( { code, codeErrors } );
            } else if (type === 'op') {
                ops.forEach((op) => {
                    const { p } = op;
                    if (p[0] === 'codeErrors') {
                        this.setState({ codeErrors });
                    }
                });
            }
        });
    }

    public render(): React.ReactNode {
        const hasErrors = this.state.codeErrors.length > 0;
        const errorList = this.state.codeErrors.map((e, i) => {
            return <li key={i}>{e}</li>;
        });
        const errors = hasErrors ? (
                    <div className="col alert alert-danger">
                        <h5>Errors</h5>
                        <ul>
                            {errorList}
                        </ul>
                    </div>) : null;
        return (
            <div>
                <div className="row">
                    <div className="col">
                        <h5>Code <button className="btn btn-dark btn-sm float-right" onClick={this.runCode}>Run</button></h5>
                        <ReactCodeMirror onChange={this.updateCode} value={this.state.code} options={{ lineNumbers: true, tabSize: 4, mode: 'javascript' }} />
                    </div>
                </div>
                <div className="row">
                    {errors}
                </div>
            </div>
        );
    }

    private updateCode = (code: string) => {
        this.setState({ code });
    }

    private runCode = (): void => {
        const { code } = this.state;
        const { doc } = this.props;
        doc.submitObjectReplaceOp(['code'], code);
    }
}