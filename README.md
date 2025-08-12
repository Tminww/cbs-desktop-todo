# Расположение файла конфигурации на Windows

На Windows этот путь обычно располагается по следующему адресу:
C:\Users{username}\AppData\Roaming{app-name}\states\

Где:

- `{username}` - имя пользователя Windows
- `{app-name}` - название вашего приложения

Полный путь к файлу конфигурации будет:
C:\Users{username}\AppData\Roaming{app-name}\states\state-initial.json

## Как найти конкретный путь:

### Вручную:

1. Нажмите `Win + R`
2. Введите `%APPDATA%`
3. Найдите папку с названием вашего приложения (`cbs-desktop-todo`)
4. Перейдите в подпапку `states`

### Через проводник:

1. Откройте проводник
2. В адресной строке введите: `%APPDATA%\cbs-desktop-todo\states`

## Пример:

Для приложения "cbs-desktop-todo" путь будет:
C:\Users\John\AppData\Roaming\cbs-desktop-todo\states\state-initial.json

> **Важно:** Папка `AppData\Roaming` по умолчанию скрыта. Убедитесь, что в проводнике включено отображение скрытых файлов и папок (Вид → Показать → Скрытые элементы).
