import { Api, ApiListResponse } from './api';
import { ICard, IOrderRequest, ISuccess } from '../../types';

export interface ILarekApi {
	getProductList: () => Promise<ICard[]>;
	getProductItem: (id: string) => Promise<ICard>;
	placeOrder: (order: IOrderRequest) => Promise<ISuccess>;
}

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string) {
		super(baseUrl);
		this.cdn = cdn;
	}

	getProductList(): Promise<ICard[]> {
		return this.get('/product').then((data: ApiListResponse<ICard>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getProductItem(id: string): Promise<ICard> {
		return this.get(`/product/${id}`).then((item: ICard) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	placeOrder(order: IOrderRequest): Promise<ISuccess> {
		return this.post('/order', order).then((data: ISuccess) => data);
	}
}
