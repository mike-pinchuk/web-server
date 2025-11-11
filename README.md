# Test web service

## Description
Write-off of the user's balance

## Installation
```bash
  $ npm i
```

###
Before run you need to create a file .env with env variables. Example:
```bash
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=test_task
  POSTGRES_PORT=5432
  POSTGRES_HOST=db
```

## Running the app
```bash
  # development
  $ npm run start

  # watch mode
  $ npm run start:dev

  # production mode
  $ npm run start:prod
```

## Tests
```bash
  # unit tests
  $ npm run test
```