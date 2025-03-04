# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных 

Карточка

```
interface ICard {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}
```

Покупатель

```
interface ICustomer {
    email: string;
    address: string;
    phone: string;
    paymentMethod: string;
}
```

Полные данные продукта

```
type TCardInfo = Pick<ICard, 'id' | 'image' | 'category' | 'title' | 'description' | 'price'>;
```

Данные продукта в корзине

```
type TBasketCard = Pick<ICard, 'id' | 'title' | 'price'>;
```

Данные в форме выбора способа оплаты и адреса

```
type TOrderForm = Pick<ICustomer, 'paymentMethod' | 'address'>;
```

Данные в форме ввода email и телефона

```
type TContactsForm = Pick<ICustomer, 'email' | 'phone'>;
```

Данные для заказа

```
interface IOrderRequest extends ICustomer {
    total?: number;
    items?: string[];
}
```

Обработка ошибок

```
type FormErrors<T> = Partial<Record<keyof T, string>>;
```

Данные для сообщения об успешном заказе

```
interface ISuccess {
    id: string;
    total: number;
}
```



## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранений и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Арі
Содержит в себе базовую логику отправки запросов.
В конструктор передается базовый адрес
сервера и опциональный объект с заголовками запросов. \
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с
объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса,
отправляет эти данные на ендпоинт переданный как параметр при вызове метода.
- `handleResponse` - обрабатывает ответ от сервера. Если ответ успешен, возвращает промис с данными ответа. В противном случае, возвращает промис с ошибкой, содержащей информацию об ошибке или статус текст

#### Класс EventEmitter
Обеспечивает работу событий. Его функции: возможность установить и снять слушателей событий, вызвать слушателей при возникновении события. Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on`, `off`, `emit` - для установки обработчика на событие, снятия его и инициирования события с данными
- `onAll` и `offAll` - для подписки на все события и сброса всех подписчиков.
- `trigger` - генерирует заданное событие при вызове

#### Класс Model
Aбстрактный класс, который представляет собой базовую модель данных с возможностью отправки событий через EventEmitter. Используется как основа для других моделей, предоставляя механизм управления данными и отправки событий.

- constructor(data: T, events: EventEmitter) Создает экземпляр модели.

#### Класс Component
Абстрактный класс, который представляет базовый UI-компонент с инструментами для работы с DOM.
- protected constructor(protected readonly container: HTMLElement) 

Методы:
- `toggleClass(element, className, force?)` — переключает класс у элемента
- `setText(element, value)` — устанавливает текстовое содержимое элемента
- `setDisabled(element, state)` — включает/отключает элемент (disabled)
- `setHidden(element)` — скрывает элемент (display: none)
- `setVisible(element)` — делает элемент видимым
- `setImage(element, src, alt?)` — устанавливает изображение и альтернативный текст
- `render(data?)` — обновляет данные компонента и возвращает его корневой элемент

### Слой данных

#### Класс AppState 
Отвечает за управление состоянием приложения, включая каталог товаров, корзину, предпросмотр и форму заказа.  

- constructor(data: IAppState, events: EventEmitter)  
  Конструктор принимает объект состояния приложения и экземпляр `EventEmitter` для управления событиями.  

Поля класса  
- `basket: Product[]` — список товаров в корзине  
- `catalog: Product[]` — список товаров в каталоге  
- `preview: Product | null` — текущий товар в режиме предпросмотра  
- `formErrors: FormErrors<TOrderForm> & FormErrors<TContactsForm>` — ошибки формы заказа  
- `orderState: ICustomer` — состояние формы заказа  

Методы  
- `setCatalog(items: ICard[])` — загружает список товаров в каталог  
- `setPreview(productId: string)` — устанавливает товар для предпросмотра  
- `addToBasket(productId: string)` — добавляет товар в корзину, если его там нет  
- `removeFromBasket(productId: string)` — удаляет товар из корзины  
- `getBasketProducts(): string[]` — возвращает массив идентификаторов товаров в корзине  
- `getTotal(): number` — возвращает общую сумму товаров в корзине  
- `getValidBasketProducts(): ICard[]` - возвращает валидную корзину
- `setOrderField(field: keyof ICustomer, value: string)` — обновляет данные заказа и проверяет его валидность  
- `validateOrder(): boolean` — проверяет корректность данных в форме заказа  
- `clearBasket()` — очищает корзину
- `clearForm()` - очищает данные о заказе

### Компоненты представления
#### Класс Page  
Страница с каталогом товаров и корзиной, включает отображение счётчика товаров в корзине и управление состоянием блокировки страницы.  

- constructor(container: HTMLElement, events: IEvents) — создаёт экземпляр страницы, передаёт контейнер и события в родительский класс, добавляет обработчик клика по кнопке корзины для открытия корзины  

Методы:  
- `counter: number` — сеттер для установки значения счётчика товаров в корзине  
- `catalog: HTMLElement[]` — сеттер для обновления каталога товаров (заменяет дочерние элементы)  
- `locked: boolean` — сеттер для блокировки страницы (добавляет/удаляет класс блокировки в зависимости от значения)  

#### Класс BaseCard (карточка товара)
Базовый класс для всех карточек товаров. Содержит основные свойства и методы для работы с карточками.  

- constructor(container: HTMLElement, actions?: ICardActions) — создаёт экземпляр карточки, инициализируя её элементы и добавляя обработчики событий  

Поля:  
- _title: HTMLElement — заголовок карточки
- _price: HTMLElement — цена товара  
  

Методы:  
- `id: string` — геттер и сеттер для идентификатора карточки  
- `title: string` — сеттер для заголовка  
- `price: number | null` — сеттер для отображения цены в формате `X синапсов` или `Бесценно`
- `update(data: T)` — обновляет данные карточки

#### Класс CatalogCard  
Карточка товара в каталоге. Наследует `BaseCard` и добавляет поле цены к базовому функционалу.  

- constructor(container: HTMLElement, actions?: ICardActions) — создаёт экземпляр карточки каталога, добавляя поле цены  

Поля:  
- _image?: HTMLImageElement — изображение товара  
- _category?: HTMLElement — категория товара  

Методы:  
- `image: string` — сеттер для изображения  
- `category: string` — сеттер для категории  

#### Класс PreviewCard  
Карточка товара в модальном окне с полной информацией и кнопкой добавления в корзину. Наследует `BaseCard` и добавляет описание товара и кнопку

- constructor(container: HTMLElement, actions?: ICardActions) — создаёт экземпляр карточки предпросмотра, добавляя описание, цену и кнопку добавления в корзину  

Поля:  
- _description?: HTMLElement — описание товара  
- _addButton?: HTMLButtonElement — кнопка "В корзину"  
- _image?: HTMLImageElement — изображение товара  
- _category?: HTMLElement — категория товара 

Методы:  
- `description: string` — сеттер для описания товара  
- `image: string` — сеттер для изображения  
- `category: string` — сеттер для категории 
- `setButtonText(text: string)` — изменяет текст кнопки добавления в корзину

#### Класс BasketCard  
Карточка товара в корзине с порядковым номером, ценой и кнопкой удаления. Наследует `BaseCard`

- constructor(container: HTMLElement, actions?: ICardActions) — создаёт экземпляр карточки корзины, добавляя индекс, цену и кнопку удаления  

Поля:  
- _index: HTMLElement — порядковый номер товара в корзине  
- _removeButton: HTMLButtonElement — кнопка удаления товара  

Методы:  
- `index: number` — сеттер для порядкового номера товара в корзине  

#### Класс Modal
Реализует модальное окно. Так же предоставляет методы `ореn` и `close` для управления отображением модального окна. Устанавливает слушатели на клик в оверлей и на кнопку-крестик для закрытия попапа.
- constructor(container: HTMLElement, eventEmitter: EventEmitter) Конструктор принимает селектор, по которому в разметке страницы будет идентифицировано модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий. 

Поля:  
- _closeButton: HTMLButtonElement — кнопка закрытия модального окна  
- _content: HTMLElement — элемент для контента модального окна  

Методы:  
- `content: HTMLElement` — сеттер для установки нового контента в модальное окно  
- `open()` — открывает модальное окно  
- `close()` — закрывает модальное окно  
- `render(data: IModalData): HTMLElement` — рендерит модальное окно с указанным контентом и открывает его

#### Класс Basket  
Отображает корзину с товарными позициями и общей стоимостью. Управляет списком товаров в корзине и кнопкой для оформления заказа.  

- constructor(container: HTMLElement, events: EventEmitter) — создаёт экземпляр корзины, инициализируя элементы списка, общей стоимости и кнопки, а также добавляет обработчик на кнопку оформления заказа  

Поля:  
- _list: HTMLElement — элемент для отображения списка товаров в корзине  
- _total: HTMLElement — элемент для отображения общей стоимости товаров  
- _button: HTMLButtonElement — кнопка для оформления заказа  

Методы:  
- `items: HTMLElement[]` — сеттер для установки списка товаров в корзину, обновляет отображение и состояние кнопки оформления заказа  

#### Класс Form  
Обрабатывает форму с полями ввода, проверкой на валидность и отображением ошибок. Отправка формы вызывает событие на внешнем уровне.  

- constructor(container: HTMLFormElement, events: IEvents) — создаёт экземпляр формы, инициализируя элементы для отправки и ошибок, а также добавляет обработчики на изменения полей и отправку формы  

Поля:  
- _submit: HTMLButtonElement — кнопка отправки формы  
- _errors: HTMLElement — элемент для отображения ошибок формы  

Методы:  
- `valid: boolean` — сеттер для управления состоянием кнопки отправки формы, активирует её при валидной форме  
- `errors: string` — сеттер для отображения ошибок в форме  
- `onInputChange(field: keyof T, value: string)` — обрабатывает изменения в полях формы и генерирует события с новыми значениями  
- `render(state: Partial<T> & IFormState)` — отображает состояние формы, включая её поля, ошибки и состояние валидности

#### Класс OrderForm  
Форма для ввода данных заказа (адрес и способ оплаты), наследует от формы общего типа.  

- constructor(container: HTMLFormElement, events: IEvents) — создаёт экземпляр формы, передаёт контейнер и события в родительский класс, добавляет обработчики для кнопок выбора метода оплаты  

Методы:  
- `address: string` — сеттер для установки значения в поле "address" формы  
- `payment: string` — сеттер для изменения состояния кнопок выбора метода оплаты (меняет классы кнопок в зависимости от выбранного метода)  

#### Класс ContactsForm  
Форма для ввода контактной информации (email и телефон), наследует от формы общего типа.  

- constructor(container: HTMLFormElement, events: IEvents) — создаёт экземпляр формы и передаёт контейнер и события в родительский класс  

Методы:  
- `email: string` — сеттер для установки значения в поле "email" формы  
- `phone: string` — сеттер для установки значения в поле "phone" формы  

#### Класс Success  
Отображение успешного оформления заказа с сообщением и кнопкой закрытия.  

- constructor(container: HTMLElement, events: IEvents) — создаёт экземпляр компонента успеха, передаёт контейнер и события в родительский класс  

Методы:  
- `total: number` — сеттер для отображения суммы, списанной с учёта (в синапсах)  


### Слой коммуникации
#### Класс LarekApi  
Класс для работы с API, реализующий методы для получения списка товаров, подробной информации о товаре и размещения заказа.  

- constructor(cdn: string, baseUrl: string) — инициализирует API с указанием URL для CDN и базового URL для API  
- `getProductList(): Promise<ICard[]>` — получает список товаров и добавляет URL изображения  
- `getProductItem(id: string): Promise<ICard>` — получает подробную информацию о товаре по ID, добавляет URL изображения  
- `placeOrder(order: IOrderRequest): Promise<ISuccess>` — отправляет запрос на размещение заказа  

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index. ts`, выполняющем роль презентера.
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`
B `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий. \
Список всех событий, которые могут генерироваться в системе: \
События изменения данных
- `customer: changed` - изменение данных пользователя

События, возникающие при взаимодействии пользователя с интерфейсом:
- `card:select` - выбор карточки товара для модального окна  
- `preview:changed` - изменение предпросмотра товара  
- `basket:open` - открытие корзины  
- `basket:updated` - обновление корзины  
- `order:open` - открытие формы заказа  
- `order.address:change` - изменение адреса в форме заказа  
- `order.payment:change` - изменение способа оплаты в форме заказа  
- `order:submit` - отправка формы заказа  
- `contacts.email:change` - изменение email в контактной форме  
- `contacts.phone:change` - изменение телефона в контактной форме  
- `formErrors:change` - изменение ошибок в формах  
- `contacts:submit` - отправка контактной формы
- `success:open` - открытие сообщения об успешном заказе
- `success:close` - закрытие сообщения об успешном заказе
- `modal:open` - открытие модального окна  
- `modal:close` - закрытие модального окна
