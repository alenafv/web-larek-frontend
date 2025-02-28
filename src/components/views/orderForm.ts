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
                    this.handlePaymentClick(btn.name)
				});
			});
	}

    protected handlePaymentClick(payment: string): void {
        this.onInputChange('payment', payment);
		this.updatePaymentButtons(payment);
      }

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: string) {
        this.updatePaymentButtons(value);
    }

    private updatePaymentButtons(value: string): void {
        this.container
            .querySelectorAll<HTMLButtonElement>('.button_alt')
            .forEach((btn) => {
                btn.classList.toggle('button_alt-active', btn.name === value);
            });
    }

	resetPaymentButtons() {
        this.container
            .querySelectorAll<HTMLButtonElement>('.button_alt')
            .forEach((btn) => {
                btn.classList.remove('button_alt-active');
            });
    }
}
