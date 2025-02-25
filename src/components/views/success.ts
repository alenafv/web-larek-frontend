import { Component } from '../base/component';
import { ISuccess } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class Success extends Component<ISuccess> {
	protected successTitle: HTMLElement;
	protected successDescription: HTMLElement;
	protected closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.successTitle = document.querySelector<HTMLElement>(
			'.order-success__title'
		);
		this.successDescription = ensureElement(
			'.order-success__description',
			this.container
		);
		this.closeButton = ensureElement(
			'.order-success__close',
			this.container
		) as HTMLButtonElement;
	}

	set total(value: number) {
		this.setText(this.successDescription, `Списано ${value} синапсов`);
	}
}
