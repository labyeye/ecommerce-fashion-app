# Evolv's Protein Shake Website

A modern, responsive website for Evolv's protein shake company with authentication, product browsing, and admin dashboard functionality.

## Features

- **User Authentication**: Login and registration with role-based access
- **Product Browsing**: Browse protein shake products with search and filtering
- **Shopping Cart**: Add products to cart with different pack sizes
- **Admin Dashboard**: Admin-only dashboard for managing the business
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Navigate to the frontend directory**
   ```bash
   cd frontend/website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Home/           # Home page components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── Features.tsx
│   │   ├── Review.tsx
│   │   ├── Cart.tsx
│   │   └── Footer.tsx
│   └── pages/          # Page components
│       ├── HomePage.tsx
│       ├── AboutPage.tsx
│       ├── ProductsPage.tsx
│       ├── ContactPage.tsx
│       ├── ProfilePage.tsx
│       ├── Dashboard.tsx
│       └── ...
├── context/
│   └── AuthContext.tsx # Authentication context
├── assets/
│   └── images/         # Static images
└── App.tsx            # Main app component
```

## Authentication

The website includes a complete authentication system:

### User Roles
- **Customer**: Can browse products, add to cart, and manage profile
- **Admin**: Can access admin dashboard and manage the business

### Default Credentials
- **Admin**: `admin@vitals.com` / `admin123456`
- **Customer**: Register a new account

### Features
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control

## Product Features

### Protein Shake Products
- **Strawberry**: Sweet and refreshing
- **Chocolate**: Rich and indulgent
- **Vanilla**: Smooth and versatile
- **Coffee**: Energizing with caffeine
- **Variety Pack**: All flavors in one

### Product Details
- 25g complete protein per serving
- Zero added sugar
- Preservative free
- Gut health support with prebiotics
- Multiple pack sizes (1, 6, 12, 24 bottles)

## Admin Dashboard

Accessible only to admin users at `/dashboard`:

### Features
- **Statistics Overview**: Customer count, orders, revenue
- **Recent Orders**: View and manage recent orders
- **Quick Actions**: Add products, view orders, manage customers
- **System Status**: Monitor website and API status
- **Recent Activity**: Track recent system activities

## API Integration

The frontend connects to the backend API at `http://localhost:3500/api`:

### Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /products` - Get all products
- `GET /admin/dashboard` - Admin dashboard data

## Styling

The website uses a consistent color scheme:

- **Primary Green**: `#688F4E`
- **Dark Green**: `#2B463C`
- **Light Green**: `#B1D182`
- **Background**: `#f4f1e9`
- **White**: `#ffffff`

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3500/api
```

## Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Update API URL** in production environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License 