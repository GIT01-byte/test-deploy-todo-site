# Todo App — пример деплоя на сервер

Простое todo-приложение для демонстрации деплоя fullstack-приложения на публичный сервер.

**Стек:** FastAPI · React + Vite · Nginx · Docker Compose

## Структура

```
├── backend/                # FastAPI приложение
├── frontend/               # React + Vite приложение
├── nginx.conf.template     # Шаблон конфига nginx с переменными
├── docker-compose.yml      # Docker compose файл для запуска всех контейнеров проекта
├── .env                    # Переменные окружения (не коммитить)
└── .env.template           # Шаблон для .env
```     

## Запуск

**1. Создай `.env` из шаблона:**
```bash
cp .env.template .env
```

**2. Укажи IP своего сервера в `.env`:**
```env
SERVER_IP=123.123.123.123
```

**3. Запусти:**
```bash
docker compose up --build -d
```

Приложение будет доступно на `http://<SERVER_IP>`.

## Как работают переменные окружения

Единственная переменная — `SERVER_IP`. Из неё автоматически собирается всё остальное:

- **nginx** — `envsubst` подставляет `SERVER_IP` в `nginx.conf.template` при старте контейнера
- **frontend** — `VITE_API_URL=http://<SERVER_IP>/api` передаётся как `build arg` и встраивается в JS-сборку на этапе `docker build`
- **backend** — получает `SERVER_IP` через `environment` для настройки CORS

## Пересборка после изменения .env

Frontend фреймворк "Vite" встраивает переменные на этапе сборки, поэтому при смене `SERVER_IP` нужно пересобрать образ:
```bash
docker compose build --no-cache frontend
docker compose up -d
```
