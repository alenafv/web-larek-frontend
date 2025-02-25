import { EventEmitter } from './events';

export class Model<T> {
	protected events: EventEmitter;
	protected data: T;

	constructor(data: T, events: EventEmitter) {
		this.events = events;
		this.data = data;
	}

	protected emitChanges(event: string, data: any): void {
		this.events.emit(event, data);
	}
}
