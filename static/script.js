document.addEventListener('DOMContentLoaded', () => {
    // Переменные для модального окна
    const productCards = document.querySelectorAll('.product-card');
    const modal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close');
    const modalName = document.getElementById('modal-product-name');
    const modalGallery = document.querySelector('.image-gallery');
    const modalDescription = document.getElementById('modal-description');
    const categoryTreeContainer = document.getElementById('category-tree');
    const searchInput = document.getElementById('search-input');
    const cartPage = document.getElementById('cart-items');
    let activeCategory = "";
    let cartData = JSON.parse(localStorage.getItem('cart')) || []; // Загружаем корзину из localStorage
    let stockData = JSON.parse(localStorage.getItem('stock')) || {}; // Загружаем остатки из localStorage

    // Инициализация остатков
    productCards.forEach(card => {
        const productId = card.dataset.id;
        const maxQuantity = parseInt(card.dataset.maxQuantity || '0');
        if (!stockData[productId]) {
            stockData[productId] = maxQuantity; // Сохраняем изначальные остатки
        }
    });
    localStorage.setItem('stock', JSON.stringify(stockData));

    
    // Добавьте функцию setupModalQuantityControls здесь
    function setupModalQuantityControls(productCard) {
        // Элементы управления в модальном окне
        const modalQuantityElement = modal.querySelector('.quantity');
        const modalIncreaseButton = modal.querySelector('.increase');
        const modalDecreaseButton = modal.querySelector('.decrease');
        const modalAddToCartButton = modal.querySelector('.add-to-cart');
        
        // Проверяем наличие всех элементов
        if (!modalQuantityElement || !modalIncreaseButton || !modalDecreaseButton || !modalAddToCartButton) {
            console.error('Элементы управления количеством в модальном окне не найдены.');
            return;
        }
        
        // Получаем максимальное количество из карточки товара
        const maxQuantity = parseInt(productCard.dataset.maxQuantity || '0');
        modalQuantityElement.textContent = '1'; // Устанавливаем начальное значение
        
        // Увеличение количества
        modalIncreaseButton.addEventListener('click', () => {
            let currentQuantity = parseInt(modalQuantityElement.textContent || '0');
            if (currentQuantity < maxQuantity) {
                modalQuantityElement.textContent = currentQuantity + 1;
            } else {
                alert('Нельзя добавить больше, чем остаток на складе.');
            }
        });
        
        // Уменьшение количества
        modalDecreaseButton.addEventListener('click', () => {
            let currentQuantity = parseInt(modalQuantityElement.textContent || '0');
            if (currentQuantity > 1) {
                modalQuantityElement.textContent = currentQuantity - 1;
            } else {
                alert('Количество не может быть меньше 1.');
            }
        });
        
        // Добавление в корзину
        modalAddToCartButton.addEventListener('click', () => {
            const quantityToAdd = parseInt(modalQuantityElement.textContent || '0');
            if (quantityToAdd > maxQuantity) {
                alert('Нельзя добавить больше, чем остаток на складе.');
                return;
            }
            
            // Получаем данные товара из карточки
            const productId = productCard.dataset.id;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.dataset.price || '0');
            
            // Обновляем корзину
            const existingProduct = cartData.find(item => item.id === productId);
            if (existingProduct) {
                existingProduct.quantity += quantityToAdd;
            } else {
                cartData.push({ id: productId, name: productName, price: productPrice, quantity: quantityToAdd });
            }
        
            
            localStorage.setItem('cart', JSON.stringify(cartData)); // Сохраняем корзину в localStorage
            localStorage.setItem('stock', JSON.stringify(stockData)); // Синхронизируем остатки
            console.log('Updated Cart:', cartData); // Лог для отладки
            alert(`Товар "${productName}" добавлен в корзину в количестве ${quantityToAdd}!`);
            productCard.dataset.maxQuantity = maxQuantity - quantityToAdd;
            
            // Закрываем модальное окно
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Возвращаем прокрутку
        });
    }

    // Проверка наличия всех элементов
    if (!modal) console.error('Модальное окно (#product-modal) не найдено.');
    if (!closeModal) console.error('Кнопка закрытия (.close) не найдена.');
    if (!modalName) console.error('Название товара (#modal-product-name) не найдено.');
    if (!modalGallery) console.error('Галерея изображений (.image-gallery) не найдена.');
    if (!modalDescription) console.error('Описание товара (#modal-description) не найдено.');

    // Открытие модального окна только при клике на изображение
    if (productCards.length > 0 && modal && closeModal && modalName && modalGallery && modalDescription) {
        productCards.forEach(card => {
            const image = card.querySelector('img'); // Выбираем только изображение внутри карточки
            if (image) {
                image.addEventListener('click', () => {
                    const id = card.dataset.id;
                    const name = card.querySelector('h3').textContent;
                    const description = card.querySelector('.product-description').textContent;
                    const imageSrc = image.src;

                    // Обновляем содержимое модального окна
                    modalName.textContent = name || 'Название отсутствует';
                    modalGallery.innerHTML = `<img src="${imageSrc}" alt="${name || 'Товар'}" class="modal-image">`;
                    modalDescription.textContent = description || 'Описание отсутствует';

                    // Показываем модальное окно
                    modal.style.display = 'block';

                    // Блокировка бэкграунда при открытии модального окна
                    document.body.style.overflow = 'hidden';

                    // Обновляем кнопки управления количеством и добавления в корзину
                    setupModalQuantityControls(card);
                });
            } else {
                console.error('Изображение в карточке товара не найдено.');
            }
        });

        // Закрытие модального окна
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Возвращаем скролл
        });

        // Закрытие модального окна при клике вне его содержимого
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Возвращаем скролл
            }
        });
    } else {
        console.error('Один или несколько элементов модального окна не найдены.');
    }

    // Управление количеством на главном экране
    const increaseButtons = document.querySelectorAll('.increase');
    const decreaseButtons = document.querySelectorAll('.decrease');
    
    if (increaseButtons.length > 0 && decreaseButtons.length > 0) {
        increaseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const productCard = btn.closest('.product-card'); // Карточка товара
                
                if (!productCard) {
                    console.error('Кнопка увеличения не принадлежит карточке товара.');
                    return;
                }
                
                const quantityElement = productCard.querySelector('.quantity'); // Поиск элемента количества
                const maxQuantity = parseInt(productCard.dataset.maxQuantity || '0'); // Получаем максимальное количество с атрибута data-max-quantity
                
                if (quantityElement) {
                    let currentQuantity = parseInt(quantityElement.textContent || '0');
                    if (isNaN(currentQuantity)) {
                        currentQuantity = 0;
                    }
                    
                    if (currentQuantity < maxQuantity) {
                        quantityElement.textContent = currentQuantity + 1; // Увеличиваем количество
                    } else {
                        alert('Нельзя добавить больше, чем остаток на складе.');
                    }
                } else {
                    console.error('Элемент отображения количества не найден.');
                }
            });
        });
        
        decreaseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const productCard = btn.closest('.product-card'); // Карточка товара
                
                if (!productCard) {
                    console.error('Кнопка уменьшения не принадлежит карточке товара.');
                    return;
                }
                
                const quantityElement = productCard.querySelector('.quantity'); // Поиск элемента количества
                
                if (quantityElement) {
                    let currentQuantity = parseInt(quantityElement.textContent || '0');
                    if (isNaN(currentQuantity)) {
                        currentQuantity = 0;
                    }
                    
                    if (currentQuantity > 0) {
                        quantityElement.textContent = currentQuantity - 1; // Уменьшаем количество на единицу
                    } else {
                        alert('Количество не может быть меньше нуля.');
                    }
                } else {
                    console.error('Элемент отображения количества не найден.');
                }
            });
        });
    } else {
        console.error('Кнопки управления количеством не найдены.');
    }
    // Обработка кнопок "Добавить в корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const productCard = btn.closest('.product-card');
                if (!productCard) {
                    console.error('Кнопка "Добавить в корзину" не принадлежит карточке товара.');
                    return;
                }

                const quantityElement = productCard.querySelector('.quantity');
                if (!quantityElement) {
                    console.error('Элемент отображения количества для добавления в корзину не найден.');
                    return;
                }

                const quantity = parseInt(quantityElement.textContent || '0');
                const maxQuantity = parseInt(productCard.dataset.maxQuantity || '0');
                const productId = productCard.dataset.id;
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = parseFloat(productCard.dataset.price || '0');

                if (quantity > maxQuantity) {
                    alert('Нельзя добавить больше, чем остаток на складе.');
                    return;
                }

                // Обновляем корзину
                const existingProduct = cartData.find(item => item.id === productId);
                if (existingProduct) {
                    existingProduct.quantity += quantity;
                } else {
                    cartData.push({ id: productId, name: productName, price: productPrice, quantity });
                }

                localStorage.setItem('cart', JSON.stringify(cartData)); // Сохраняем корзину в localStorage
                localStorage.setItem('stock', JSON.stringify(stockData));
                console.log('Updated Cart:', cartData); // Лог для отладки
                alert(`Товар "${productName}" добавлен в корзину в количестве ${quantity}!`);
                productCard.dataset.maxQuantity = maxQuantity - quantity;
                quantityElement.textContent = '0'; // Сбрасываем количество после добавления
            });
        });
    } else {
        console.error('Кнопки "Добавить в корзину" не найдены.');
    }

    // Отображение корзины
    if (cartPage) {
        if (cartData.length === 0) {
            cartPage.innerHTML = '<p>Корзина пуста</p>';
        } else {
            cartData.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-details">
                        <p>Название: ${item.name}</p>
                        <p>Количество: ${item.quantity}</p>
                        <p>Цена: ${item.price.toFixed(2)} ₽</p>
                        <p>Сумма: ${(item.price * item.quantity).toFixed(2)} ₽</p>
                    </div>
                    <button class="remove-from-cart" data-id="${item.id}">Удалить</button>
                `;
                cartPage.appendChild(cartItem);
            });

            // Удаление товаров из корзины
            document.querySelectorAll('.remove-from-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    const itemToRemove = cartData.find(item => item.id === productId);
                    if (itemToRemove) {
                        stockData[productId] += itemToRemove.quantity; // Возвращаем остаток
                    }
                    
                    cartData = cartData.filter(item => item.id !== productId);
                    localStorage.setItem('cart', JSON.stringify(cartData));
                    localStorage.setItem('stock', JSON.stringify(stockData)); // Обновляем остатки
                    alert('Товар удален из корзины!');
                    location.reload(); // Обновляем страницу
                });
            });
        }
    }

    // Построение дерева категорий
    const categories = buildCategoryTreeFromCards(productCards);
    if (categoryTreeContainer) {
        const categoryElements = renderCategories(categories);
        categoryTreeContainer.appendChild(categoryElements);
    } else {
        console.error('Контейнер для дерева категорий не найден.');
    }

    /**
     * Создание дерева категорий на основе атрибутов data-category карточек
     */
    function buildCategoryTreeFromCards(cards) {
        const tree = {};
        cards.forEach(card => {
            const categoryPath = card.dataset.category.split('/');
            let currentLevel = tree;
            categoryPath.forEach(category => {
                if (!currentLevel[category]) {
                    currentLevel[category] = {};
                }
                currentLevel = currentLevel[category];
            });
        });
        return tree;
    }

    /**
     * Рендеринг дерева категорий
     */
    function renderCategories(categories, path = "", level = 0) {
        const fragment = document.createDocumentFragment();

        Object.keys(categories).forEach(category => {
            const newPath = path ? `${path}/${category}` : category;

            const categoryItem = document.createElement('div');
            categoryItem.classList.add('category-item');
            categoryItem.style.paddingLeft = `${level * 15}px`;

            const button = document.createElement('button');
            button.className = `category-button ${level > 0 ? 'subcategory-button' : ''}`;
            button.textContent = category;

            // Контейнер для подкатегорий
            const subcategoriesContainer = document.createElement('div');
            subcategoriesContainer.classList.add('subcategory-container');
            subcategoriesContainer.style.display = 'none'; // Изначально подкатегории скрыты

            button.addEventListener('click', () => {
                const isVisible = subcategoriesContainer.style.display === 'block';
                subcategoriesContainer.style.display = isVisible ? 'none' : 'block';

                // Установка активной категории для фильтрации
                activeCategory = isVisible ? "" : newPath;
                filterProducts();
            });

            categoryItem.appendChild(button);

            if (Object.keys(categories[category]).length > 0) {
                const subcategories = renderCategories(categories[category], newPath, level + 1);
                subcategoriesContainer.appendChild(subcategories);
            }

            categoryItem.appendChild(subcategoriesContainer);
            fragment.appendChild(categoryItem);
        });

        return fragment;
    }

    /**
     * Фильтрация товаров
     */
    function filterProducts() {
        const searchQuery = searchInput.value.toLowerCase();

        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productCategory = card.dataset.category.toLowerCase();

            const matchesCategory = !activeCategory || productCategory.startsWith(activeCategory.toLowerCase());
            const matchesSearch = !searchQuery || productName.includes(searchQuery);

            card.style.display = matchesCategory && matchesSearch ? '' : 'none';
        });
    }

    // Фильтрация при изменении текста поиска
    searchInput.addEventListener('input', () => {
        filterProducts();
    });
    document.getElementById('go-to-cart').addEventListener('click', () => {
        window.location.href = '/cart'; // Убедитесь, что маршрут '/cart' настроен в вашем приложении
    });
    document.addEventListener("DOMContentLoaded", () => {
        const categoryButtons = document.querySelectorAll(".category-btn");
        const subcategoryScroll = document.getElementById("subcategory-scroll");
        
        // Пример подкатегорий для каждой категории
        const subcategories = {
            filter: ["Price", "Brand", "Rating"],
            received: ["Today", "This Week", "This Month"],
            sent: ["Pending", "Completed", "Cancelled"],
        };
        
        // Обработчик клика на категории
        categoryButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const category = button.dataset.category;
                
                // Очищаем предыдущие подкатегории
                subcategoryScroll.innerHTML = "";
                
                // Добавляем новые подкатегории
                if (subcategories[category]) {
                    subcategories[category].forEach((subcat) => {
                        const subcatBtn = document.createElement("button");
                        subcatBtn.className = "subcategory-btn";
                        subcatBtn.textContent = subcat;
                        subcategoryScroll.appendChild(subcatBtn);
                    });
                }
            });
        });
    });});