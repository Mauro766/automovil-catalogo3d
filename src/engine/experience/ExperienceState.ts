
export type ShowroomState = 'overview' | 'transitioning' | 'vehicle';

export interface StateChangeEvent {
    from: ShowroomState;
    to: ShowroomState;
}

type StateChangeCallback = (event: StateChangeEvent) => void;

export class ExperienceStateManager {
    private currentState: ShowroomState = 'overview';
    private listeners: StateChangeCallback[] = [];

    public getState(): ShowroomState {
        return this.currentState;
    }

    public setState(newState: ShowroomState): void {
        if (this.currentState === newState) return;

        const event: StateChangeEvent = {
            from: this.currentState,
            to: newState,
        };

        this.currentState = newState;

        this.listeners.forEach((callback) => callback(event));
    }

    public onChange(callback: StateChangeCallback): void {
        this.listeners.push(callback);
    }

    public dispose(): void {
        this.listeners = [];
    }
}
