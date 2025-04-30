from flask import Flask, jsonify

app = Flask(__name__)

# Пример данных о продуктах
PRODUCTS = [
    {
        "id": "1",
        "name": "Телефон",
        "description": "Смартфон последнего поколения",
        "quantityAvailable": 10,
        "imageURLs": ["/static/images/phone.jpg"],
        "category": "Электроника/Телефоны"
    },
    {
        "id": "2",
        "name": "Ноутбук",
        "description": "Мощный ноутбук для работы",
        "quantityAvailable": 5,
        "imageURLs": ["/static/images/laptop.jpg"],
        "category": "Электроника/Ноутбуки"
    },
    {
        "id": "3",
        "name": "Кресло",
        "description": "Удобное офисное кресло",
        "quantityAvailable": 3,
        "imageURLs": ["/static/images/chair.jpg"],
        "category": "Мебель/Кресла"
    }
]

def build_category_tree(products):
    """Создание дерева категорий на основе списка продуктов."""
    tree = {}
    for product in products:
        category_path = product.get("category", "").split("/")
        current_level = tree
        for category in category_path:
            if category not in current_level:
                current_level[category] = {}
            current_level = current_level[category]
    return tree

@app.route('/products', methods=['GET'])
def get_products():
    """Возвращает список продуктов и дерево категорий."""
    category_tree = build_category_tree(PRODUCTS)
    return jsonify({
        "products": PRODUCTS,
        "categoryTree": category_tree
    })

@app.route('/product/<product_id>', methods=['GET'])
def get_product(product_id):
    """Возвращает данные о конкретном продукте по его ID."""
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Продукт не найден"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)