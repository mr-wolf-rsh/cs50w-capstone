FROM python:3.11.4-alpine

WORKDIR /app/backend

RUN apk --no-cache --update add p7zip

RUN pip install --upgrade pip

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN chmod +x /app/backend/docker-entrypoint.sh

ENTRYPOINT /app/backend/docker-entrypoint.sh

CMD ["run"]