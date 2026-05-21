# Docker Setup

Run the full ERP stack with MySQL, backend API, and Vite frontend:

```bash
docker compose up --build
```

Open the app at:

```text
http://localhost:5173
```

Useful commands:

```bash
docker compose down
docker compose down -v
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

The MySQL container is exposed on host port `3307` to avoid colliding with a local MySQL server on `3306`.

Default container database settings:

```text
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=erp
```

The backend initializes the database and runs migrations on startup.
