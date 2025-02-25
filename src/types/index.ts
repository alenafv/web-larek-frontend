export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface ICustomer {
	email?: string;
	address?: string;
	phone?: string;
	payment?: string;
}

export type TCardInfo = Pick<
	ICard,
	'id' | 'image' | 'category' | 'title' | 'description' | 'price'
>;

export type TBasketCard = Pick<ICard, 'id' | 'title' | 'price'>;

export type TOrderForm = Pick<ICustomer, 'payment' | 'address'>;

export type TContactsForm = Pick<ICustomer, 'email' | 'phone'>;

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface IOrderRequest extends ICustomer {
	total?: number;
	items?: string[];
}

export interface ISuccess {
	id: string;
	total: number;
}
