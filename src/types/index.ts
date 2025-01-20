export interface ICard {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export interface ICustomer {
    email: string;
    address: string;
    phone: string;
    paymentMethod: string;
}

export interface ICardData {
    card: ICard[];
    preview: string | null;
}

export type TCardInfo = Pick<ICard, 'image' | 'category' | 'title' | 'description' | 'price'>;

export type TBasket = Pick<ICard, 'title' | 'price'>;

export type TPaymentMethodAndAddress = Pick<ICustomer, 'paymentMethod' | 'address'>;

export type TEmailAndPhone = Pick<ICustomer, 'email' | 'phone'>;