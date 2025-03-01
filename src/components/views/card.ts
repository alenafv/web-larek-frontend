import { ensureElement, cloneTemplate } from '../../utils/utils';
import { Component } from '../base/component';
import { TCardInfo, TBasketCard } from '../../types';

interface ICardActions {
	onClick?: (event: MouseEvent) => void;
	onAddToBasket?: (event: MouseEvent) => void;
	onRemove?: (event: MouseEvent) => void;
}

export class BaseCard<T> extends Component<T> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;

	constructor(protected container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', this.container);
		this._price = ensureElement<HTMLElement>('.card__price', this.container);

		if (actions?.onClick) {
			container.addEventListener('click', actions.onClick);
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		this.setText(
			this._price,
			value !== null ? `${value} синапсов` : 'Бесценно'
		);
	}

	update(data: T) {
		Object.assign(this, data);
	}
}

// Карточка в каталоге
export class CatalogCard extends BaseCard<TCardInfo> {
	protected _image?: HTMLImageElement;
	protected _category?: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);

		this._image =
			this.container.querySelector<HTMLImageElement>('.card__image');
		this._category =
			this.container.querySelector<HTMLElement>('.card__category');
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		if (!this._category) return;

		const categoryMap: Record<string, string> = {
			'софт-скил': 'soft',
			'хард-скил': 'hard',
			другое: 'other',
			дополнительное: 'additional',
			кнопка: 'button',
		};

		const normalizedCategory = categoryMap[value.toLowerCase()] || 'other';

		this._category.className = 'card__category';
		this._category.classList.add(`card__category_${normalizedCategory}`);

		this.setText(this._category, value);
	}
}

// Полная карточка в модалке
export class PreviewCard extends BaseCard<TCardInfo> {
	protected _description?: HTMLElement;
	protected _addButton?: HTMLButtonElement;
	protected _image?: HTMLImageElement;
	protected _category?: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._description = ensureElement<HTMLElement>('.card__text');
		this._addButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);
		this._image =
			this.container.querySelector<HTMLImageElement>('.card__image');
		this._category =
			this.container.querySelector<HTMLElement>('.card__category');

		if (actions?.onAddToBasket) {
			this._addButton.addEventListener('click', (event) => {
				event.stopPropagation();
				actions.onAddToBasket?.(event);
			});
		}
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		if (!this._category) return;

		const categoryMap: Record<string, string> = {
			'софт-скил': 'soft',
			'хард-скил': 'hard',
			другое: 'other',
			дополнительное: 'additional',
			кнопка: 'button',
		};

		const normalizedCategory = categoryMap[value.toLowerCase()] || 'other';

		this._category.className = 'card__category';
		this._category.classList.add(`card__category_${normalizedCategory}`);

		this.setText(this._category, value);
	}

	setButtonText(text: string) {
		if (this._addButton) {
			this._addButton.textContent = text;
		}
	}
}

// Карточка в корзине
export class BasketCard extends BaseCard<TBasketCard> {
	protected _index: HTMLElement;
	protected _removeButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._index = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);
		this._removeButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);

		if (actions?.onRemove) {
			this._removeButton.addEventListener('click', (event) => {
				event.stopPropagation();
				actions.onRemove?.(event);
			});
		}
	}

	set index(value: number) {
		this.setText(this._index, String(value));
	}
}
