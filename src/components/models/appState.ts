import { Model } from '../base/model';
import { EventEmitter } from '../base/events';
import {
	ICard,
	ICustomer,
	FormErrors,
	TOrderForm,
	TContactsForm,
} from '../../types';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class Product extends Model<ICard> {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number;

	constructor(data: ICard, events: EventEmitter) {
		super(data, events);
		this.id = data.id;
		this.title = data.title;
		this.description = data.description;
		this.image = data.image;
		this.category = data.category;
		this.price = data.price;
	}

	// Геттер, возвращающий цену или "Бесценно", если price = null
	get formattedPrice(): string {
		return this.price !== null ? `${this.price} синапсов` : 'Бесценно';
	}
}

export interface IAppState {
	basket: Product[];
	catalog: Product[];
	preview: Product | null;
	formErrors: FormErrors<TOrderForm> & FormErrors<TContactsForm>;
	orderState: ICustomer;
}

export class AppState extends Model<IAppState> {
	basket: Product[] = [];
	catalog: Product[] = [];
	preview: Product | null = null;
	formErrors: FormErrors<TOrderForm> & FormErrors<TContactsForm> = {};

	orderState: ICustomer = {
		address: '',
		payment: '',
		email: '',
		phone: '',
	};

	constructor(data: IAppState, events: EventEmitter) {
		super(data, events);
		this.basket = data.basket;
		this.catalog = data.catalog;
		this.preview = data.preview;
		this.orderState = data.orderState;
	}

	/** Устанавливает товары в каталог */
	setCatalog(items: ICard[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
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
		const product = this.catalog.find((p) => p.id === productId);
		if (product && !this.basket.some((p) => p.id === productId)) {
			this.basket.push(product);
			this.emitChanges('basket:updated', this.basket);
		}
	}

	/** Удаляет товар из корзины */
	removeFromBasket(productId: string) {
		this.basket = this.basket.filter((product) => product.id !== productId);
		this.emitChanges('basket:updated', this.basket);
	}

	/** Возвращает товары в корзине */
	getBasketProducts(): string[] {
		return this.basket.map((product) => product.id);
	}

	/** Считает итоговую сумму */
	getTotal(): number {
		return this.basket.reduce((sum, product) => sum + (product.price ?? 0), 0);
	}

	setOrderField(field: keyof ICustomer, value: string) {
		this.orderState[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.orderState);
		}
	}

	validateOrder(): boolean {
		const errors: FormErrors<TOrderForm> & FormErrors<TContactsForm> = {};

		if (!this.orderState.payment)
			errors.payment = 'Необходимо выбрать способ оплаты';
		if (!this.orderState.address) errors.address = 'Необходимо указать адрес';
		if (!this.orderState.email) errors.email = 'Необходимо указать email';
		if (!this.orderState.phone) errors.phone = 'Необходимо указать телефон';

		this.formErrors = errors;
		this.emitChanges('formErrors:change', errors);

		return Object.keys(errors).length === 0;
	}

	clearBasket() {
		this.basket = [];
		this.emitChanges('basket:updated', this.basket);
	}
}
