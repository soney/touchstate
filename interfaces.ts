export interface TouchGroup {
}

export interface Path {
}
export type TouchGroupObj = {[name: string]: TouchGroup};
export type PathObj =  {[name: string]: Path};
export interface BehaviorDoc {
    fsm: any;
    touchGroups: TouchGroupObj;
    paths: PathObj;
}

export interface StateData {

}

export interface TransitionData {
    type: string;
    timeoutdelay?: number;
    selectedtouchgroup?: string;
    selectedpath?: string;
    toucheventtype?: string;
}