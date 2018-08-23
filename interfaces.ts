export interface TouchGroupInterface {
    numFingers: number;
    downInside: string;
    downOutside: string;
    maxRadius: number;
    maxTouchInterval: number;
    greedy: boolean;
    $xConstraint?: number;
    $yConstraint?: number;
    $startXConstraint?: number;
    $startYConstraint?: number;
    $endXConstraint?: number;
    $endYConstraint?: number;
}

export type PathType = 'line' | 'circle' | 'rectangle';
export interface PathInterface {
    lsx?: string;
    lsy?: string;
    lex?: string;
    ley?: string;
    ccx?: string;
    ccy?: string;
    ccr?: string;
    rcx?: string;
    rcy?: string;
    rcw?: string;
    rch?: string;
    type: PathType;
}
export type TouchGroupObj = {[name: string]: TouchGroupInterface};
export type PathObj =  {[name: string]: PathInterface};
export interface BehaviorDoc {
    fsm: any;
    touchGroups: TouchGroupObj;
    paths: PathObj;
}

export interface StateData {

}

export interface TransitionData {
    type: string;
    timeoutDelay?: number;
    selectedTouchGroup?: string;
    selectedPath?: string;
    touchEventType?: string;
}