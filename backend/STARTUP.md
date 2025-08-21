# Quick Startup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your MongoDB connection string and other settings.

3. **Create admin user**
   ```bash
   npm run create-admin
   ```
   
   This creates an admin user with:
   - Email: `admin@vitals.com`
   - Password: `admin123456`

4. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```
   
   This creates sample categories and products for testing.

5. **Start the server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:3500`

## API Testing

### Test the health endpoint
```bash
curl http://localhost:3500/api/health
```

### Register a customer
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

### Login as admin
```bash
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vitals.com",
    "password": "admin123456"
  }'
```

### Get products (public)
```bash
curl http://localhost:3500/api/products
```

## Role Access

### Admin Routes (`/api/admin/*`)
- Dashboard: `GET /api/admin/dashboard`
- Users: `GET /api/admin/users`
- Products: `GET /api/admin/products`
- Orders: `GET /api/admin/orders`

### Customer Routes (`/api/customer/*`)
- Dashboard: `GET /api/customer/dashboard`
- Profile: `GET /api/customer/profile`
- Orders: `GET /api/customer/orders`
- Products: `GET /api/customer/products`

### Public Routes
- Products: `GET /api/products`
- Product details: `GET /api/products/:id`
- Order tracking: `GET /api/orders/track/:orderNumber`

## Default Credentials

### Admin User
- Email: `admin@vitals.com`
- Password: `admin123456`

### Sample Customer (after registration)
- Email: `john@example.com`
- Password: `password123`

## Next Steps

1. Connect your frontend applications to these API endpoints
2. Update the CORS settings in `server.js` for your frontend URLs
3. Set up proper email configuration for password reset functionality
4. Configure file upload for product images
5. Set up proper logging and monitoring for production

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env`
- Verify network connectivity

### Port Already in Use
- Change the PORT in `.env`
- Or kill the process using the port

### JWT Issues
- Ensure JWT_SECRET is set in `.env`
- Check token expiration settings 