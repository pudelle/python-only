from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

# Настройки Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'

# Области доступа Google API
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']  # Добавьте SCOPES здесь


# Инициализация глобальной переменной `service`
service = None
# Аутентификация с использованием service account
try:
    credentials = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
    service = build('sheets', 'v4', credentials=credentials)
    print("Успешная аутентификация с Google API.")
except Exception as e:
    print(f"Ошибка аутентификации: {e}")
    raise

def get_sheets_data(range_name):
    """
    Получает данные из Google Sheets.
    :param range_name: Диапазон в формате 'Лист1!A1:D10'
    :return: Данные из таблицы в виде списка списков
    """
    try:
        print(f"Попытка получить данные из диапазона: {range_name}")
        sheet = service.spreadsheets()
        response = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=range_name).execute()
        values = response.get('values', [])
        if not values:
            print("Данные из Google Таблицы отсутствуют или диапазон пуст.")
        else:
            print(f"Полученные данные: {values}")
        return values
    except Exception as e:
        print(f"Ошибка при получении данных из Google Таблицы: {e}")
        raise

def update_sheets_data(range_name, values):
    """
    Обновляет данные в Google Sheets.
    :param range_name: Диапазон в формате 'Лист1!A1:D10'
    :param values: Данные для записи в виде списка списков
    """
    try:
        print(f"Попытка обновить данные в диапазоне: {range_name} значениями: {values}")
        sheet = service.spreadsheets()
        body = {'values': values}
        result = sheet.values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',  # Используется USER_ENTERED для обработки пользовательского ввода
            body=body
        ).execute()
        print(f"Обновление выполнено успешно: {result}")
    except Exception as e:
        print(f"Ошибка при обновлении данных в Google Таблице: {e}")
        raise

def append_sheets_data(range_name, values):
    """
    Добавляет данные в конец указанного диапазона в Google Sheets.
    :param range_name: Диапазон в формате 'Лист1!A1:D10'
    :param values: Данные для добавления в виде списка списков
    """
    try:
        print(f"Попытка добавить данные в диапазон: {range_name} значениями: {values}")
        sheet = service.spreadsheets()
        body = {'values': values}
        result = sheet.values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',  # Используется USER_ENTERED для добавления пользовательских данных
            insertDataOption='INSERT_ROWS',  # Вставить строки
            body=body
        ).execute()
        print(f"Данные успешно добавлены: {result}")
    except Exception as e:
        print(f"Ошибка при добавлении данных в Google Таблицу: {e}")
        raise