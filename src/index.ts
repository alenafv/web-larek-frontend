import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { LarekApi } from './components/base/larekApi';
import { EventEmitter } from './components/base/events';
import { Page } from './components/views/page';
import {
	AppState,
	IAppState,
} from './components/models/appState';
import { CatalogCard, PreviewCard, BasketCard } from './components/views/card';
import { Modal } from './components/common/modal';
import { OrderForm } from './components/views/orderForm';
import { ContactsForm } from './components/views/contactsForm';
import { Success } from './components/views/success';
import { TOrderForm, TContactsForm, ICard } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Basket } from './components/views/basket';

// Создаем EventEmitter и API
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const appState = new AppState({}, events);

// Шаблоны интерфейса
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardPreviewContainer = cardPreviewTemplate.content.firstElementChild?.cloneNode( 
    true 
) as HTMLElement; 

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

events.on('catalog:updated', () => {
	page.catalog = appState.catalog.map((item) => {
		const card = new CatalogCard(cloneTemplate(cardCatalogTemplate), {
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
});

events.on('card:select', (product: ICard) => {
	appState.setPreview(product.id);
});

events.on('preview:changed', (product: ICard | null) => {
	if (!product) return;

	const isInBasket = appState.getBasketProducts().includes(product.id);

	const previewCard = new PreviewCard(cardPreviewContainer, {
		onAddToBasket: () => {
			if (isInBasket) {
				appState.removeFromBasket(product.id);
			} else {
				appState.addToBasket(product.id);
			}
			modal.close();
		},
	});

	previewCard.update(product);
	previewCard.setButtonText(isInBasket ? 'Удалить из корзины' : 'В корзину');

	modal.render({ content: cardPreviewContainer });
});



const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketContainer = basketTemplate.content.firstElementChild?.cloneNode(
true) as HTMLElement;
const basket = new Basket(basketContainer, events);
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');


events.on('basket:open', () => {
	if (!basket) return;
    modal.render({ content: basket.render() });
});

events.on('basket:updated', () => {
    console.log('Обновление корзины:');
    const items = appState.getFullBasket();
    basket.items = [];

    const basketItems = items.map((item, index) => {
        console.log('Рендерим карточку для товара:', item);
        const basketCard = new BasketCard(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                appState.removeFromBasket(item.id);
            },
        });

        basketCard.update({
            id: item.id,
            title: item.title,
            price: item.price,
        });

        basketCard.index = index + 1;

        return basketCard.render();
    });

    // Устанавливаем карточки товаров и обновляем сумму
    page.counter = appState.getBasketProducts().length;
    basket.items = basketItems;
    basket.total = appState.getTotal();
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
			items: appState.getValidBasketProducts().map(product => product.id),
		})
		.then((result) => {
            events.emit('success:open', { total: result.total });

			appState.clearBasket();
			page.counter = 0;
            events.emit('basket:updated', []);

            orderForm.clear();
            orderForm.resetPaymentButtons();

            contactsForm.clear();
		})
		.catch((err) => {
			console.error(err);
		});
});

events.on('success:open', ({ total }: { total: number }) => {
	modal.render({
		content: successForm.render({ total }),
	});

    events.on('success:close', () => {
		modal.close();
	});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.getProductList()
	.then(appState.setCatalog.bind(appState))
	.catch((err) => {
		console.error(err);
	});
