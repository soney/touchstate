import * as React from 'react';
import * as cjs from 'constraintjs';
import { Cell, CellChangeEvent } from './Cell';
import { SDBDoc, SDBSubDoc } from 'sdb-ts';
import { PathType, PathInterface } from '../../../interfaces';
import { clone, isEqual } from 'lodash';
// import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';

// const SortableItem = SortableElement(({value}: {value: string}) =>
//   <li>{value}</li>
// );

// const SortableList = SortableContainer(({items}: {items: string[]}) => {
//   return (
//     <ul>
//       {items.map((value, index) => (
//         <SortableItem key={`item-${index}`} index={index} value={value} />
//       ))}
//     </ul>
//   );
// });

type Point = {
    x: number | cjs.Constraint;
    y: number | cjs.Constraint;
};

type Line = {
    start: Point,
    end: Point
};

type Circle = {
    center: Point,
    radius: number | cjs.Constraint
};

type Square = {
    x: number | cjs.Constraint,
    y: number | cjs.Constraint,
    width: number | cjs.Constraint,
    height: number | cjs.Constraint
};

interface PathSpecDisplayProps {
    path: (string|number)[];
    doc: SDBDoc<any>;
}
interface PathSpecDisplayState extends PathInterface { }

export class PathSpecDisplay extends React.Component<PathSpecDisplayProps, PathSpecDisplayState> {
    private static defaults = { type: 'line' as PathType, lsx: '0', lsy: '0', lex: '999', ley: '999' };
    private subDoc: SDBSubDoc<PathInterface>; 
    public constructor(props: PathSpecDisplayProps) {
        super(props);
        this.subDoc = this.props.doc.subDoc<PathInterface>(this.props.path);

        const data = this.subDoc.getData();
        if (data && !isEqual(data, {})) {
            this.state = clone(data);
        } else {
            this.subDoc.submitObjectReplaceOp([], PathSpecDisplay.defaults);
            this.state = clone(PathSpecDisplay.defaults);
        }
    }

    public onCellChange(name: string, event: CellChangeEvent): void {
        this.props.doc.submitObjectReplaceOp(this.props.path.concat(name), event.value);
        // const {type} = this.state;
        // this.pathConstraints[name] = event.constraint;
        // if (this.path) {
        //     this.path.destroy();
        // }

        // this.path = new Path();
        // if (type === 'line') {
        //     const { lsx, lsy, lex, ley } = this.pathConstraints;
        //     this.path.M(lsx, lsy).L(lex, ley);
        // } else if (type === 'circle') {
        //     const { ccx, ccy, ccr } = this.pathConstraints;
        //     this.path.circle(ccx, ccy, ccr);
        // } else if (type === 'rectangle') {
        //     const { rcx, rcy, rcw, rch } = this.pathConstraints;
        //     this.path.rect(rcx, rcy, rcw, rch);
        // }
        // console.log(this.path.toString());
    }

    public render(): React.ReactNode {
        let parameterControls: React.ReactNode;
        const { type } = this.state;
        if (type === 'line') {
            parameterControls = (
                <span>
                    Start: (
                        <Cell
                            text={`${this.state.lsx}`}
                            onChange={this.onCellChange.bind(this, 'lsx')}
                            key="lineStartX"
                            placeholder="x"
                        />,
                        <Cell
                            text={`${this.state.lsy}`}
                            onChange={this.onCellChange.bind(this, 'lsy')}
                            key="lineStartY"
                            placeholder="y"
                        />
                        ),
                    End: (
                        <Cell
                            text={`${this.state.lex}`}
                            onChange={this.onCellChange.bind(this, 'lex')}
                            key="lineEndX"
                            placeholder="x"
                        />,
                        <Cell
                            text={`${this.state.ley}`}
                            onChange={this.onCellChange.bind(this, 'ley')}
                            key="lineEndY"
                            placeholder="y"
                        />)
                </span>
            );
        } else if (type === 'circle') {
            parameterControls = (
                <span>
                    Center: (
                        <Cell
                            text={`${this.state.ccx}`}
                            onChange={this.onCellChange.bind(this, 'ccx')}
                            key="circleCenterX"
                            placeholder="x"
                        />,
                        <Cell
                            text={`${this.state.ccy}`}
                            onChange={this.onCellChange.bind(this, 'ccy')}
                            key="circleCenterY"
                            placeholder="y"
                        />),
                    Radius:
                        <Cell
                            text={`${this.state.ccr}`}
                            onChange={this.onCellChange.bind(this, 'ccr')}
                            key="circleRadius"
                            placeholder="r"
                        />
                </span>
            );
        } else if (type === 'rectangle') {
            parameterControls = (
                <span>
                    x:
                        <Cell
                            text={`${this.state.rcx}`}
                            onChange={this.onCellChange.bind(this, 'rcx')}
                            key="rectX"
                            placeholder="x"
                        />,
                    y:
                        <Cell
                            text={`${this.state.rcy}`}
                            onChange={this.onCellChange.bind(this, 'rcy')}
                            key="rectY"
                            placeholder="y"
                        />,
                    width:
                        <Cell
                            text={`${this.state.rcw}`}
                            onChange={this.onCellChange.bind(this, 'rcw')}
                            key="rectWidth"
                            placeholder="width"
                        />,
                    height:
                        <Cell
                            text={`${this.state.rch}`}
                            onChange={this.onCellChange.bind(this, 'rch')}
                            key="rectHeight"
                            placeholder="height"
                        />
                </span>
            );
        }
        return (
            <div>
                <select value={this.state.type} onChange={this.handleSelectChange}>
                    <option value="line">Line</option>
                    <option value="circle">Circle</option>
                    <option value="rectangle">Rectangle</option>
                </select>
                {parameterControls}
            </div>
        );
    }

    private handleSelectChange = (event: React.FormEvent<HTMLSelectElement>): void => {
        const type = event.currentTarget.value as PathType;
        this.props.doc.submitObjectReplaceOp(this.props.path.concat('type'), type);
        this.setState({ type });
    }
}