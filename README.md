# Wallet System API Documentation

Welcome to the Wallet System API documentation. This API facilitates the management of user wallets and transactions using Paystack integration. Below, you will find information on setting up, running, and testing the API.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

# Prerequisites

- Nestjs
- Express
- TypeScript
- Paystack API
- Prisma
- PostgreSQL database

# Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/IgnatiusFrancis/Thrindle.git
   cd WalletSystem

   # Install dependencies:
   npm install
   ```

# Configuration

Create a .env file in the root directory and configure the following environment variables:

```env
TEST_SECRET=your_paystack_api_key
JWT_SECRET=your secret key
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.3lx6pbq.mongodb.net/dbname
```

# Usage

## Starting the Server

To start the API server, run the following command:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The API will be accessible at  [API](https://wallet-jmm3.onrender.com) 

## API Endpoints

### Sign Up

- **URL**: /auth/signup
- **Method**: POST
- **Request Body**: `{ "email": "user@example.com", "password": "your_password" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Sign In

- **URL**: /auth/signin
- **Method**: POST
- **Request Body**: `{ "email": "user@example.com", "password": "your_password" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Create Wallet

- **URL**: /wallet/create
- **Method**: POST
- **Request Body**: `{ "currency": "NGN", "name": "James" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Fund Wallet

- **URL**: /wallet/:walletId
- **Method**: PATCH
- **Request Body**: `{ "walletId": "your_wallet_id", "amount": "500" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### VERIFY Wallet PAYMENT

- **URL**: /wallet/verify/:reference
- **Method**: GET
- **Request Body**: `{ "reference": "your_transfer_reference" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### GET Wallet

- **URL**: /wallet/:walletId
- **Method**: GET
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Wallet To Wallet Transfer

- **URL**: /transfer/:walletId
- **Method**: POST
- **Request Body**: `{ "senderWalletId": "sender_wallet_id", "receiverWalletId": "receiver_wallet_id", "amount": "300" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Wallet To Banks Transfer

- **URL**: /transfer/bank/:walletId
- **Method**: POST
- **Request Body**: `{CreateTransferRecipientDto }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Get All Transactions

- **URL**: /transfer/transactions
- **Method**: GET
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

### Get Transaction By Transaction ID

- **URL**: /transfer/:txnId
- **Method**: GET
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox)

...

## Testing

```bash
# unit tests
$ npm run test auth.service.spec.ts

# e2e tests
$ npm run test:e2e
```

...

```bash

```

## Contributing

...

## License

...

## Contact

...

Feel free to explore the API and refer to the [API Documentation](https://documenter.getpostman.com/view/19595090/2s9YeD9Dox) for detailed information on each endpoint and their functionalities.
