import { IEvents } from '../base/events';
import { Form } from '../common/form';

export class OrderForm extends Form<{ address: string; payment: string }> {
	protected buttonsPayment: NodeListOf<HTMLButtonElement>;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.buttonsPayment = this.container.querySelectorAll('.button_alt');

		this.buttonsPayment.forEach((btn) => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				const selectedButton = e.currentTarget as HTMLButtonElement;
				this.payment = selectedButton.name;
				this.onInputChange('payment', selectedButton.name);
			});
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: string) {
		this.buttonsPayment.forEach((btn) => {
			btn.classList.toggle('button_alt-active', btn.name === value);
		});
	}
}
