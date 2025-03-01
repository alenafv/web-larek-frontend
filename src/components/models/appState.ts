import { Model } from '../base/model';
import {
	ICard,
	ICustomer,
	FormErrors,
	TOrderForm,
	TContactsForm,
} from '../../types';

export interface IAppState {
	basket: ICard[];
	catalog: ICard[];
	preview: string | null;
	orderState: ICustomer;
}

export class AppState extends Model<IAppState> {
	basket: ICard[] = [];
	catalog: ICard[] = [];
	preview: ICard | null;
	formErrors: FormErrors<TOrderForm> & FormErrors<TContactsForm> = {};
	orderState: ICustomer = {
		address: '',
		payment: '',
		email: '',
		phone: '',
	};

	/** Устанавливает товары в каталог */
	setCatalog(items: ICard[]) {
		this.catalog = items;
		this.emitChanges('catalog:updated', { catalog: this.catalog });
	}

	/** Открывает превью товара в модалке */
	setPreview(productId: string) {
		const product = this.catalog.find((p) => p.id === productId) || null;
		this.preview = product;
		this.emitChanges('preview:changed', product);
	}

	/** Добавляет товар в корзину */
	addToBasket(productId: string) {
		console.log('Товары в корзине перед добавлением:', this.basket);
		const product = this.catalog.find((p) => p.id === productId);
		if (product && !this.basket.some((p) => p.id === productId)) {
			this.basket.push(product);
			console.log('Товары в корзине после добавления:', this.basket);
			this.emitChanges('basket:updated');
		}
	}

	/** Удаляет товар из корзины */
	removeFromBasket(productId: string) {
		this.basket = this.basket.filter((product) => product.id !== productId);
		console.log('Товары в корзине после удаления:', this.basket);
		this.emitChanges('basket:updated');
	}

	/** Возвращает товары в корзине */
	getBasketProducts(): string[] {
		return this.basket.map((product) => product.id);
	}

	/** Возвращает полную информацию о товарах в корзине */
	getFullBasket(): ICard[] {
		console.log('Актуальное состояние корзины:', this.basket);
		return this.basket;
	}

	/** Считает итоговую сумму */
	getTotal(): number {
		return this.basket.reduce((sum, product) => sum + (product.price ?? 0), 0);
	}

	/** Возвращает товары в корзине с ценой, отличной от null */
	getValidBasketProducts(): ICard[] {
		return this.basket.filter((product) => product.price !== null);
	}

	setOrderField(field: keyof ICustomer, value: string) {
		this.orderState[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.orderState);
		}
	}

	validateOrder() {
		const errors: FormErrors<TOrderForm> & FormErrors<TContactsForm> = {};

		if (!this.orderState.payment)
			errors.payment = 'Необходимо выбрать способ оплаты';
		if (!this.orderState.address) errors.address = 'Необходимо указать адрес';
		if (!this.orderState.email) errors.email = 'Необходимо указать email';
		if (!this.orderState.phone) errors.phone = 'Необходимо указать телефон';

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	clearBasket() {
		this.basket = [];
		this.emitChanges('basket:updated', this.basket);
	}

	clearForm() {
		this.orderState = {
			address: '',
			payment: '',
			email: '',
			phone: '',
		};
	}
}
