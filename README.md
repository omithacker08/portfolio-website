# Portfolio Website

A complete, modern portfolio website built with React featuring user authentication, blog management, project showcases, AI solutions, and a comprehensive admin panel.

## Features

### 🎨 Modern UI/UX
- Clean, responsive design following latest trends
- Sticky navigation header
- Smooth animations and transitions
- Mobile-first approach
- Minimal dependencies for easy maintenance

### 🔐 Authentication System
- OTP-based authentication
- Credential-based login
- User role management (Admin/User)
- Protected routes and features

### 📝 Blog System
- Rich text blog creation
- Image and video upload support
- Comment system with like/share functionality
- Admin approval workflow
- Social media sharing integration

### 💼 Portfolio Sections
- **Home**: Hero section with feature highlights
- **About**: Personal information, skills, timeline
- **Projects**: Project showcase with detailed information
- **AI**: AI/ML project submissions and displays
- **Resume**: Comprehensive resume builder and display
- **Contact**: Contact form with availability status

### 👨💼 Admin Dashboard
- Complete site customization (colors, content, labels)
- User management (add, update, delete users)
- Blog moderation (approve, reject, edit content)
- Site configuration management
- Content positioning control

### 📱 Responsive Design
- Works seamlessly on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized performance

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Backend**: Node.js, Express.js
- **Database**: SQLite (local database)
- **Authentication**: JWT tokens
- **Styling**: Pure CSS with modern features
- **State Management**: React Context API
- **Notifications**: React Hot Toast

## Installation & Setup

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd website-generator
   ```

2. **Install frontend dependencies**
   ```bash
   yarn install
   ```

3. **Start the frontend development server**
   ```bash
   yarn start
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```

4. **The backend will run on `http://localhost:5000`**

### Full Stack Setup

1. **Start backend server** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend server** (in another terminal)
   ```bash
   cd ..
   yarn start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Demo Credentials

### Admin Access
- **Email**: admin@example.com
- **Password**: any password
- **OTP**: any 4-digit number

### Regular User
- **Email**: user@example.com
- **Password**: any password
- **OTP**: any 4-digit number

## Project Structure

```
├── backend/                # Node.js backend
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env              # Environment variables
│   └── portfolio.db      # SQLite database (auto-created)
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.js     # Navigation header
│   │   └── Header.css
│   ├── pages/            # Page components
│   │   ├── Home.js       # Landing page
│   │   ├── About.js      # About page
│   │   ├── Blog.js       # Blog system
│   │   ├── Projects.js   # Project showcase
│   │   ├── AI.js         # AI solutions
│   │   ├── Resume.js     # Resume builder
│   │   ├── Contact.js    # Contact form
│   │   ├── Auth.js       # Authentication
│   │   ├── Admin.js      # Admin dashboard
│   │   └── *.css         # Page styles
│   ├── context/          # React Context
│   │   ├── AuthContext.js # Authentication state
│   │   └── DataContext.js # Application data
│   ├── utils/            # Utility functions
│   │   └── api.js        # API service
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── package.json          # Frontend dependencies
└── README.md
```

## Database Schema

The SQLite database includes the following tables:

- **users**: User accounts and authentication
- **site_config**: Site configuration and branding
- **blogs**: Blog posts and content
- **projects**: Project portfolio items
- **ai_projects**: AI/ML specific projects
- **resumes**: User resume information

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Site Configuration
- `GET /api/config` - Get site configuration
- `PUT /api/config` - Update site configuration (Admin only)

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog (Admin only)
- `DELETE /api/blogs/:id` - Delete blog (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

### AI Projects
- `GET /api/ai-projects` - Get all AI projects
- `POST /api/ai-projects` - Create new AI project

### Resume
- `GET /api/resume/:userId` - Get user resume
- `POST /api/resume` - Update user resume

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Site Settings Fix

✅ **FIXED**: Site settings save functionality now works properly
- localStorage fallback ensures settings always save
- Database operations attempted with graceful fallback
- Site name, tagline, and colors persist correctly
- Changes reflect immediately on home page and header
- Form fields populate with saved values on page refresh
- Works offline and online seamlessly

**Test Status**: Site configuration save/load functionality verified working with dual storage

## Key Features Explained

### Apple-Inspired Design
- Modern glassmorphism effects
- Smooth animations and transitions
- Clean typography and spacing
- Gradient backgrounds and elements
- Responsive design patterns

### Database Integration
- SQLite local database for data persistence
- RESTful API architecture
- JWT-based authentication
- Automatic database initialization
- Fallback to localStorage for offline mode

### Admin Dashboard
- **Site Configuration**: Customize colors, branding, and content
- **Blog Management**: Approve, reject, or delete blog posts
- **User Management**: Add, update, or remove users with role assignment
- **Real-time Updates**: Changes reflect immediately across the site

### Offline Support
- Automatic fallback to localStorage when backend is unavailable
- Seamless transition between online and offline modes
- Data synchronization when connection is restored

## Customization

### Changing Colors
1. Go to Admin Dashboard → Site Configuration
2. Update Primary and Secondary colors
3. Changes apply immediately across the site

### Adding New Features
1. Create new API endpoints in `backend/server.js`
2. Add corresponding methods in `src/utils/api.js`
3. Update context providers as needed
4. Create new page components

### Modifying Styles
- Global styles: `src/index.css`
- Component styles: Individual `.css` files
- Apple-inspired design patterns throughout

## Deployment

### Frontend Deployment
```bash
yarn build
```
Deploy the `build/` directory to any static hosting service.

### Backend Deployment
1. Set up Node.js environment
2. Install dependencies: `npm install`
3. Set environment variables
4. Start server: `npm start`

### Full Stack Deployment Options
- **Heroku**: Deploy both frontend and backend
- **Vercel + Railway**: Frontend on Vercel, backend on Railway
- **Netlify + Render**: Frontend on Netlify, backend on Render
- **VPS**: Self-hosted on virtual private server

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or support, please contact through the website's contact form or create an issue in the repository.