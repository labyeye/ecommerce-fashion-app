# Vitals Backend API

A comprehensive Node.js/Express backend API with role-based authentication for an e-commerce platform. Supports both admin and customer roles with separate dashboards and functionalities.

## Features

- **Role-based Authentication**: Admin and Customer roles with different access levels
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Mongoose ODM for database operations
- **Input Validation**: Express-validator for request validation
- **Security**: Helmet, CORS, rate limiting
- **File Upload**: Multer for handling file uploads
- **Email Support**: Nodemailer for email notifications

## Role Structure

### Admin Role
- Access to admin dashboard
- Manage all users (customers)
- Manage products (CRUD operations)
- Manage orders (view, update status)
- View analytics and reports
- Access: `/api/admin/*`

### Customer Role
- Access to customer dashboard
- Browse and purchase products
- Manage their own orders
- Update profile information
- Access: `/api/customer/*`

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/vitals_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   DASHBOARD_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new customer | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/forgot-password` | Forgot password | Public |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Admin dashboard stats | Admin |
| GET | `/users` | Get all customers | Admin |
| GET | `/users/:id` | Get customer details | Admin |
| PUT | `/users/:id/status` | Update customer status | Admin |
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get order details | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/products` | Get all products | Admin |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### Customer Routes (`/api/customer`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Customer dashboard | Customer |
| GET | `/profile` | Get profile | Customer |
| PUT | `/profile` | Update profile | Customer |
| GET | `/orders` | Get customer orders | Customer |
| GET | `/orders/:id` | Get order details | Customer |
| PUT | `/orders/:id/cancel` | Cancel order | Customer |
| GET | `/products` | Get available products | Customer |
| GET | `/products/:id` | Get product details | Customer |
| POST | `/orders` | Place new order | Customer |
| GET | `/addresses` | Get address book | Customer |

### Public Routes

#### Products (`/api/products`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all active products | Public |
| GET | `/featured` | Get featured products | Public |
| GET | `/bestsellers` | Get best sellers | Public |
| GET | `/:id` | Get product details | Public |
| GET | `/search` | Search products | Public |
| GET | `/categories` | Get categories | Public |
| GET | `/category/:id` | Get products by category | Public |

#### Orders (`/api/orders`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/track/:orderNumber` | Track order | Public |
| GET | `/:id` | Get order (limited info) | Public |

## Database Models

### User Model
- `firstName`, `lastName`, `email`, `password`
- `role` (admin/customer), `phone`, `address`
- `isActive`, `isEmailVerified`, `lastLogin`
- Password reset and email verification tokens

### Product Model
- `name`, `description`, `price`, `sku`
- `category`, `brand`, `images`, `stock`
- `status` (active/inactive/draft), `isFeatured`, `isBestSeller`
- `variants`, `attributes`, `tags`, `seo`

### Order Model
- `orderNumber`, `customer`, `items`
- `subtotal`, `tax`, `shipping`, `total`
- `status`, `payment`, `shippingAddress`, `billingAddress`
- `timeline`, `notes`

## Authentication Flow

1. **Registration**: Customer registers with email/password
2. **Login**: User logs in and receives JWT token
3. **Authorization**: Token is validated on protected routes
4. **Role Check**: Middleware checks user role for specific endpoints

## Security Features

- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevents abuse
- **CORS**: Configured for frontend domains
- **Helmet**: Security headers

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Success Responses

All endpoints return consistent success responses:
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Success message" // Optional
}
```

## Usage Examples

### Register a Customer
```bash
curl -X POST http://localhost:3500/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3500/api/customer/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Creating an Admin User

To create an admin user, you can either:

1. **Directly in MongoDB**:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Using MongoDB Compass or similar tool**

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **Process Manager**: Use PM2 or similar
4. **Reverse Proxy**: Nginx or Apache
5. **SSL**: Configure HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 