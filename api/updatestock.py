from flask import Blueprint, jsonify, request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import pickle

# Настройка Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'
RANGE = 'Sheet1!A2:H'

# Путь к файлу учетных данных OAuth2
CREDENTIALS_FILE = 'credentials.json'
TOKEN_PICKLE_FILE = 'token.pickle'

# Создаём Blueprint
update_stock_bp = Blueprint('update_stock', __name__)

def get_sheets_service():
    """Создаёт сервис для работы с Google Sheets с использованием OAuth2."""
    creds = None
    # Проверяем, существует ли сохранённый токен
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            creds = pickle.load(token)

    # Если токен недействителен или отсутствует, выполняем аутентификацию
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
            creds = flow.run_local_server(port=0)

        # Сохраняем токен для последующего использования
        with open(TOKEN_PICKLE_FILE, 'wb') as token:
            pickle.dump(creds, token)

    # Создаём сервис Google Sheets API
    service = build('sheets', 'v4', credentials=creds)
    return service

def get_sheets_data(spreadsheet_id, range_name):
    """Получает данные из Google Sheets."""
    try:
        service = get_sheets_service()
        sheet = service.spreadsheets()
        response = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
        values = response.get('values', [])
        return values
    except Exception as e:
        print(f"Ошибка при получении данных из Google Таблицы: {e}")
        return None

def update_sheets_data(spreadsheet_id, range_name, values):
    """Обновляет данные в Google Sheets."""
    try:
        service = get_sheets_service()
        body = {'values': values}
        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        return result
    except Exception as e:
        print(f"Ошибка при обновлении данных в Google Таблице: {e}")
        return None

@update_stock_bp.route('/api/update_stock', methods=['POST'])
def update_stock():
    """Обрабатывает заказанные товары и обновляет остатки в Google Sheets."""
    try:
        data = request.json
        if not data or 'updates' not in data:
            return jsonify({'error': 'Некорректные данные'}), 400

        updates = data['updates']
        print(f"Данные для обновления остатков: {updates}")

        # Получаем текущие данные из таблицы
        rows = get_sheets_data(SPREADSHEET_ID, RANGE)
        if not rows:
            return jsonify({'error': 'Не удалось получить данные из Google Таблицы'}), 500

        print(f"Текущие данные из Google Таблицы: {rows}")

        # Обновляем остатки
        updated_values = []
        for row in rows:
            if len(row) >= 8 and row[0].isdigit():  # Проверяем корректность строки
                product_id = int(row[0])
                for update in updates:
                    if update['id'] == product_id:
                        current_stock = int(row[7]) if row[7].isdigit() else 0
                        new_stock = max(current_stock - update['ordered'], 0)
                        row[7] = str(new_stock)
            updated_values.append(row)

        print(f"Обновленные данные для записи: {updated_values}")

        # Записываем обновлённые данные обратно в таблицу
        result = update_sheets_data(SPREADSHEET_ID, RANGE, updated_values)
        if not result:
            return jsonify({'error': 'Не удалось обновить данные в Google Таблице'}), 500

        print("Данные успешно обновлены в Google Таблице.")
        return jsonify({'message': 'Данные успешно обновлены'}), 200

    except Exception as e:
        print(f"Ошибка на сервере: {e}")
        return jsonify({'error': 'Произошла ошибка на сервере', 'details': str(e)}), 500