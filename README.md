# CalcioDomains

A blockchain domain marketplace for `.calcio` domains built on serverless architecture.

## Overview

CalcioDomains is a full-stack web application that allows users to search, evaluate, and purchase `.calcio` blockchain domains on the Freename platform. The system uses AI-powered domain evaluation to determine pricing based on domain relevance and commercial potential.

### Key Features

- **AI Domain Evaluation** - GPT-4o analyzes domains and assigns pricing tiers
- **Stripe Payments** - Secure checkout with coupon support
- **Credit System** - Internal wallet for quick purchases
- **Coupon Management** - Create, use, and transfer coupons between users
- **Admin Panel** - Complete management of users, domains, and configurations
- ciao

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                         │
│                     Hosted on Catalyst                          │
├─────────────────────────────────────────────────────────────────┤
│  Views: Home | Domains | Dashboard | Profile | Admin | Cart     │
│  Composables: useUser | useCart | useToast                      │
│  Services: catalyst.js | freename.js                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS API Calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ZOHO CATALYST (Backend)                       │
├─────────────────────────────────────────────────────────────────┤
│  39 Serverless Functions (Node.js)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │    User      │ │   Domain     │ │   Payment    │             │
│  │  Management  │ │  Operations  │ │   System     │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │ 
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Catalyst   │  │    Stripe    │  │   OpenAI     │
│   Database   │  │   Payments   │  │   GPT-4o     │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Tech Stack

### Frontend

| Technology | Version | Purpose                    |
|------------|---------|----------------------------|
| Vue.js     | 3.4.29  | Reactive JavaScript framework |
| Vite       | 5.3.1   | Build tool and dev server  |
| Vue Router | 4.3.3   | Client-side routing        |
| Auth0 Vue  | 2.4.0   | User authentication        |
| Axios      | 1.12.2  | HTTP client                |

### Backend

| Technology         | Purpose                          |
|--------------------|----------------------------------|
| Zoho Catalyst      | Serverless platform              |
| Node.js            | Function runtime                 |
| zcatalyst-sdk-node | Catalyst SDK                     |
| Stripe SDK         | Payment processing               |
| OpenAI API         | AI domain evaluation             |

### External Services

| Service  | Purpose                           |
|----------|-----------------------------------|
| Auth0    | Identity Provider (OAuth 2.0)     |
| Stripe   | Payment gateway                   |
| OpenAI   | Artificial intelligence (GPT-4o)  |
| Freename | Blockchain domain availability    |

## Project Structure

```
ZohoCalcioDomains/
├── CalcioDomains/                 # Vue 3 Frontend
│   ├── src/
│   │   ├── assets/               # Static resources
│   │   ├── components/           # Reusable Vue components
│   │   ├── composables/          # Vue 3 composables (global state)
│   │   ├── router/               # Routing configuration
│   │   ├── services/             # API services
│   │   ├── views/                # Application pages
│   │   ├── App.vue               # Root component
│   │   └── main.js               # Entry point
│   ├── public/                   # Public static files
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
│
├── functions/                     # Backend Serverless Functions
│   ├── add-to-cart/
│   ├── create-checkout/
│   ├── create-order/
│   ├── evaluate-domain/
│   ├── get-user-data/
│   ├── pay-with-credits/
│   └── ... (39 functions total)
│
└── catalyst.json                  # Catalyst configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Zoho Catalyst CLI
- Auth0 account
- Stripe account
- OpenAI API key

### Frontend Setup

```bash
# Navigate to frontend directory
cd CalcioDomains

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Configure environment variables in .env.local
# VITE_MOCK_AUTH=false

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Login to Catalyst
catalyst login

# Deploy all functions
catalyst deploy

# Deploy only functions
catalyst deploy --only functions

# Deploy only client
catalyst deploy --only client
```

### Environment Variables

#### Frontend (.env.local)

```env
VITE_MOCK_AUTH=false
```

#### Backend (Catalyst Environment)

Configure these in Zoho Catalyst console:

```env
STRIPE_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx
FREENAME_API_KEY=xxx
SUCCESS_URL=https://your-domain.com/success
CANCEL_URL=https://your-domain.com/cancel
```

## API Endpoints

### Authentication & Users

| Function               | Method | Description                    |
|------------------------|--------|--------------------------------|
| `exchange-auth0-token` | POST   | Exchange Auth0 token           |
| `on-user-creation`     | POST   | Create user on Auth0 signup    |
| `get-user-data`        | GET    | Get user profile               |
| `update-user`          | PUT    | Update user information        |

### Domain Operations

| Function                    | Method | Description                    |
|-----------------------------|--------|--------------------------------|
| `get-prompt`                | GET    | Get AI prompt and coefficients |
| `evaluate-domain`           | POST   | Evaluate domain with GPT-4o    |
| `search-freename-domains`   | GET    | Search domains on Freename     |
| `check-domain-availability` | GET    | Check domain availability      |

### Cart & Payments

| Function                   | Method | Description                    |
|----------------------------|--------|--------------------------------|
| `add-to-cart`              | POST   | Add domain to cart             |
| `get-cart`                 | GET    | Get user cart                  |
| `delete-from-cart`         | DELETE | Remove item from cart          |
| `create-checkout`          | POST   | Create Stripe checkout session |
| `create-order`             | POST   | Finalize order after payment   |
| `pay-with-credits`         | POST   | Process payment with credits   |
| `create-recharge-checkout` | POST   | Create credit recharge checkout|

### Coupons

| Function                      | Method | Description                    |
|-------------------------------|--------|--------------------------------|
| `get-user-coupons`            | GET    | Get user coupons               |
| `transfer-coupon`             | POST   | Transfer coupon to another user|
| `get-coupon-transfer-history` | GET    | Get transfer history           |

## Database Schema

### Users Table

| Field                        | Type     | Description              |
|------------------------------|----------|--------------------------|
| ROWID                        | String   | Unique ID (auto-generated) |
| auth0_id                     | String   | Auth0 user ID            |
| email                        | String   | User email               |
| name                         | String   | Full name                |
| nickname                     | String   | Display username         |
| credits                      | Number   | Credit balance (cents)   |
| stripe_customer_id           | String   | Stripe customer ID       |
| is_admin                     | Boolean  | Admin flag               |

### Orders Table

| Field             | Type     | Description                    |
|-------------------|----------|--------------------------------|
| ROWID             | String   | Order ID                       |
| user_id           | String   | User reference                 |
| domains           | JSON     | Purchased domains array        |
| status            | String   | `pending` / `paid` / `expired` |
| stripe_session_id | String   | Stripe session ID              |
| total_amount      | Number   | Order total (cents)            |

### Coupons Table

| Field            | Type     | Description              |
|------------------|----------|--------------------------|
| ROWID            | String   | Coupon ID                |
| user_id          | String   | Current owner            |
| coupon_code      | String   | Coupon code              |
| stripe_coupon_id | String   | Stripe coupon ID         |
| amount           | Number   | Value (cents)            |
| status           | String   | `available` / `used`     |

## Domain Pricing

Domains are evaluated by GPT-4o and assigned to pricing tiers:

| Level    | Coefficient | Example Price (base 10€) |
|----------|-------------|--------------------------|
| VIP      | 5.0         | 50€                      |
| Premium  | 2.5         | 25€                      |
| Standard | 1.5         | 15€                      |

Categories are determined by:
- **Reserved**: Existing football team names, famous players, registered trademarks
- **VIP**: High-value football terms, iconic stadium names
- **Premium**: Football-related terms, city names with teams
- **Standard**: Common or generic terms

## Development

### Adding a New Function

1. Create folder in `functions/`:
```bash
mkdir functions/my-new-function
```

2. Create `index.js`:
```javascript
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (context, basicIO) => {
  const catalystApp = catalyst.initialize(context);

  try {
    const result = { success: true };
    basicIO.write(JSON.stringify(result));
  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      error: error.message
    }));
  }

  context.close();
};
```

3. Create `package.json`:
```json
{
  "name": "my-new-function",
  "version": "1.0.0",
  "dependencies": {
    "zcatalyst-sdk-node": "latest"
  }
}
```

4. Add to `catalyst.json`:
```json
{
  "name": "my-new-function",
  "type": "basicIO"
}
```

### Mock Authentication

For development and Builder.io preview:

```env
# .env.local
VITE_MOCK_AUTH=true
```

## Security Best Practices

- Always validate inputs server-side
- Never expose API keys in frontend code
- Verify admin permissions for sensitive operations
- Use HTTPS for all communications
- Sanitize user data before database insertion

## License

This project is proprietary software. All rights reserved.

## Links

- [Vue 3 Documentation](https://vuejs.org/guide/)
- [Zoho Catalyst Documentation](https://catalyst.zoho.com/help/)
- [Stripe Documentation](https://stripe.com/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [OpenAI Documentation](https://platform.openai.com/docs)