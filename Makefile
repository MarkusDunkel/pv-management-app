.PHONY: backend frontend docker-up docker-down format

backend:
	cd backend && mvn spring-boot:run

frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up --build

docker-down:
	docker compose down -v
