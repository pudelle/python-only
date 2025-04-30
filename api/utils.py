def parse_product_row(row, default_id=0):
    """Парсит строку из Google Sheets в объект продукта."""
    id = int(row[0]) if len(row) > 0 and row[0].isdigit() else default_id
    name = row[1] if len(row) > 1 else ''
    description = row[2] if len(row) > 2 else ''
    quantity = int(row[3]) if len(row) > 3 and row[3].isdigit() else 0
    image_urls = row[4].split(',') if len(row) > 4 and row[4] else []
    category = row[5] if len(row) > 5 else ''
    quantity_available = int(row[7]) if len(row) > 7 and row[7].isdigit() else quantity
    return {
        'id': id,
        'name': name,
        'description': description,
        'quantity': quantity,
        'imageURLs': image_urls,
        'category': category,
        'quantityAvailable': quantity_available
    }