import * as React from 'react';
import * as cjs from 'constraintjs';

enum ClickState { IDLE, EDITING }

export interface CellChangeEvent {
    value: string;
}

interface CellProps {
    placeholder?: string;
    text?: string;
    onChange?: (event: CellChangeEvent) => void;
}
interface CellState {
    state: ClickState;
    inputText: string;
}

export class Cell extends React.Component<CellProps, CellState> {
    public static defaultProps: CellProps  = {
        text: '',
        placeholder: '(empty)',
    };

    private text: string;
    private constraint: cjs.Constraint;

    public constructor(props: CellProps) {
        super(props);
        this.state = {
            inputText: this.props.text,
            state: ClickState.IDLE
        };
        this.text = this.props.text;
    }

    public render(): React.ReactNode {
        const { state } = this.state;
        if (state === ClickState.IDLE) {
            let text: string;
            let isPlaceholder: boolean;
            if (this.text) {
                text = this.text;
                isPlaceholder = false;
            } else if (this.props.placeholder) {
                text = this.props.placeholder;
                isPlaceholder = true;
            } else {
                text = '';
                isPlaceholder = true;
            }

            return (
                <div className="cell" onClick={this.onClick}>{text}</div>
            );
        } else {
            return (
                <input
                    onKeyDown={this.onKeyDown}
                    onChange={this.updateText}
                    onBlur={this.onBlur}
                    value={this.state.inputText}
                    ref={this.inputRef}
                    placeholder={this.props.placeholder}
                    type="text"
                />
            );
        }
    }

    private emitUpdate(): void {
        if (this.props.onChange) {
            this.props.onChange({ value: this.text });
        }
    }

    private updateText = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ inputText: event.target.value });
    }

    private inputRef = (element: HTMLInputElement): void => {
        if (element) {
            element.select();
            element.focus();
        }
    }

    private onClick = (event: React.MouseEvent<HTMLSpanElement>): void => {
        this.setState({ state: ClickState.EDITING });
    }
    private onBlur = (event: React.FocusEvent<HTMLSpanElement>): void => {
        this.text = this.state.inputText;
        this.setState({ state: ClickState.IDLE });
        this.emitUpdate();
    }

    private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        const { which } = event;
        if (which === 13) { // Enter
            this.text = this.state.inputText;
            this.setState({ state: ClickState.IDLE });
            this.emitUpdate();
        } else if (which === 27) { // ESC
            this.setState({ inputText: this.text, state: ClickState.IDLE });
        }
    }
}