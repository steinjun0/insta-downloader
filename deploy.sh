docker compose --file '/home/jun/Programming/insta-downloader/docker-compose-prod.yml' --project-name 'prod-insta-downloader' down
docker compose -f ./docker-compose.prod.yml -p prod-insta-downloader build --no-cache
docker compose -f ./docker-compose.prod.yml -p prod-insta-downloader up -d