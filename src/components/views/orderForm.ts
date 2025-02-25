import { IEvents } from '../base/events';
import { Form } from '../common/form';

export class OrderForm extends Form<{ address: string; payment: string }> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.container
			.querySelectorAll<HTMLButtonElement>('.button_alt')
			.forEach((btn) => {
				btn.addEventListener('click', (e) => {
					e.preventDefault();
					const method = btn.name;
					this.payment = method;
					this.events.emit(`${this.container.name}.payment:change`, {
						field: 'payment',
						value: method,
					});
				});
			});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: string) {
		this.container
			.querySelectorAll<HTMLButtonElement>('.button_alt')
			.forEach((btn) => {
				btn.classList.toggle('button_alt-active', btn.name === value);
			});
	}
}
