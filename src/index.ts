import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { LarekApi } from './components/base/larekApi';
import { EventEmitter } from './components/base/events';
import { Page } from './components/views/page';
import {
	AppState,
	Product,
	IAppState,
	CatalogChangeEvent,
} from './components/models/appState';
import { CatalogCard, PreviewCard, BasketCard } from './components/views/card';
import { Modal } from './components/common/modal';
import { OrderForm } from './components/views/orderForm';
import { ContactsForm } from './components/views/contactsForm';
import { Success } from './components/views/success';
import { TOrderForm, TContactsForm } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

// Создаем EventEmitter и API
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const data: IAppState = {
	basket: [],
	catalog: [],
	preview: null,
	formErrors: {},
	orderState: {
		address: '',
		payment: '',
		email: '',
		phone: '',
	},
};

const appState = new AppState(data, events);

// Шаблоны интерфейса
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

const orderTemplate = document.querySelector<HTMLTemplateElement>('#order');
const orderContainer = orderTemplate.content.firstElementChild?.cloneNode(
	true
) as HTMLFormElement;
const orderForm = new OrderForm(orderContainer, events);

const contactsTemplate =
	document.querySelector<HTMLTemplateElement>('#contacts');
const contactsContainer = contactsTemplate.content.firstElementChild?.cloneNode(
	true
) as HTMLFormElement;
const contactsForm = new ContactsForm(contactsContainer, events);

const successTemplate = document.querySelector<HTMLTemplateElement>('#success');
const successForm = new Success(cloneTemplate(successTemplate), events);

// Основные компоненты
const page = new Page(document.body, events);

const modal = new Modal(modalContainer, events);

const basketButton = ensureElement<HTMLButtonElement>('.header__basket');
basketButton.addEventListener('click', () => {
	events.emit('basket:open');
});

events.on<CatalogChangeEvent>('catalog:updated', () => {
	page.catalog = appState.catalog.map((item) => {
		const card = new CatalogCard(cloneTemplate(cardTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price,
		});
	});

	page.counter = appState.getBasketProducts().length;
});

events.on('card:select', (product: Product) => {
	appState.setPreview(product.id);
});

events.on('preview:changed', (product: Product | null) => {
	if (!product) return;

	const cardTemplate =
		document.querySelector<HTMLTemplateElement>('#card-preview');
	const cardContainer = cardTemplate.content.firstElementChild?.cloneNode(
		true
	) as HTMLElement;

	const isInBasket = appState.getBasketProducts().includes(product.id);

	const previewCard = new PreviewCard(cardContainer, {
		onAddToBasket: () => {
			if (isInBasket) {
				appState.removeFromBasket(product.id);
			} else {
				appState.addToBasket(product.id);
			}

			page.counter = appState.getBasketProducts().length;
			modal.close();
		},
	});

	previewCard.update(product);
	previewCard.setButtonText(isInBasket ? 'Удалить из корзины' : 'В корзину');

	modal.render({ content: cardContainer });
});

events.on('basket:open', () => {
	const basketContainer = cloneTemplate<HTMLElement>('#basket');

	if (!basketContainer) return;

	const basketItemsContainer = ensureElement<HTMLElement>(
		'.basket__list',
		basketContainer
	);
	const totalPriceElement = ensureElement<HTMLElement>(
		'.basket__price',
		basketContainer
	);
	const checkoutButton = ensureElement<HTMLButtonElement>(
		'.basket__button',
		basketContainer
	);

	const updateBasketView = () => {
		const products = appState.getBasketProducts();
		basketItemsContainer.innerHTML = '';

		if (products.length === 0) {
			basketItemsContainer.textContent = 'Корзина пуста';
			totalPriceElement.textContent = '0 синапсов';
			checkoutButton.disabled = true;
			page.counter = 0;
			return;
		}

		products.forEach((productId, index) => {
			const product = appState.catalog.find((p) => p.id === productId);

			if (!product) return;

			const itemContainer = cloneTemplate<HTMLLIElement>('#card-basket');
			if (!itemContainer) return;

			new BasketCard(itemContainer, {
				onRemove: () => {
					appState.removeFromBasket(product.id);
					updateBasketView();
				},
			}).render({ id: product.id, title: product.title, price: product.price });

			basketItemsContainer.appendChild(itemContainer);
		});

		const totalPrice = appState.getTotal();
		totalPriceElement.textContent = `${totalPrice} синапсов`;
		checkoutButton.disabled = totalPrice === 0;
	};

	const orderButton = ensureElement<HTMLButtonElement>(
		'.basket__button',
		basketContainer
	);
	orderButton.addEventListener('click', () => events.emit('order:open'));

	updateBasketView();
	modal.render({ content: basketContainer });
});

events.on('basket:updated', () => {
	page.counter = appState.getBasketProducts().length;
});

events.on('order:open', () => {
	modal.render({ content: orderContainer });
});

events.on(
	/^order\.(address|payment):change/,
	(data: { field: keyof TOrderForm; value: string }) => {
		appState.setOrderField(data.field, data.value);
	}
);

events.on('order:submit', () => {
	contactsForm.errors = '';
	modal.render({ content: contactsContainer });
});

events.on(
	/^contacts\.(email|phone):change/,
	(data: { field: keyof TContactsForm; value: string }) => {
		appState.setOrderField(data.field, data.value);
		appState.validateOrder();
	}
);

events.on(
	'formErrors:change',
	(errors: Partial<TOrderForm & TContactsForm>) => {
		const { address, payment, email, phone } = errors;
		orderForm.valid = !address && !payment;
		orderForm.errors = Object.values({ address, payment })
			.filter(Boolean)
			.join('; ');

		contactsForm.valid = !email && !phone;
		contactsForm.errors = Object.values({ email, phone })
			.filter(Boolean)
			.join('; ');
	}
);

events.on('contacts:submit', () => {
	api
		.placeOrder({
			...appState.orderState,
			total: appState.getTotal(),
			items: appState.getBasketProducts(),
		})
		.then((result) => {
			modal.render({
				content: successForm.render({
					total: result.total,
				}),
			});

			const closeButton = document.querySelector('.order-success__close');
			if (closeButton) {
				closeButton.addEventListener('click', () => {
					modal.close();
				});
			}

			appState.clearBasket();
			page.counter = 0;
		})
		.catch((err) => {
			console.error(err);
		});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
    orderForm.clear();
    contactsForm.clear();
});

api
	.getProductList()
	.then(appState.setCatalog.bind(appState))
	.catch((err) => {
		console.error(err);
	});
