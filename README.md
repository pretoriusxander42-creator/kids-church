# Kids Church Check-in System

A comprehensive, secure check-in system for managing children, parents, classes, and attendance at church programs.

## Features

### Core Functionality
- ✅ **User Authentication**: Secure registration/login with JWT tokens, bcrypt password hashing
- ✅ **Email Verification**: Email verification on registration (requires email service setup)
- ✅ **Password Reset**: Secure password reset via email tokens
- ✅ **Role-Based Access Control**: Super Admin, Admin, Teacher, and Parent roles with hierarchical permissions
- ✅ **Child Management**: Full CRUD operations for child profiles with medical info and allergies
- ✅ **Parent Management**: Parent profiles with emergency contact information
- ✅ **Parent-Child Relationships**: Link multiple children to multiple parents
- ✅ **Check-in/Check-out**: Secure check-in with 6-digit security codes
- ✅ **Class Management**: Create and manage classes with capacity tracking
- ✅ **Special Needs Support**: Special needs forms and dedicated board for staff awareness
- ✅ **First-Time Visitor Board**: Dedicated view for first-time visitor children
- ✅ **Statistics Dashboard**: Real-time attendance stats, trends, and capacity monitoring
- ✅ **Audit Logging**: Comprehensive audit trail of all critical actions
- ✅ **Email Notifications**: Automated emails for check-in/check-out (requires email service)

### Security Features
- 🔒 **Bcrypt Password Hashing**: Industry-standard password security with 10 salt rounds
- 🔒 **Password Strength Requirements**: Enforced complexity (8+ chars, uppercase, lowercase, number, special char)
- 🔒 **Rate Limiting**: Protection against brute force attacks (5 login attempts per 15 min, 3 registrations per hour)
- 🔒 **CSRF Protection**: Cross-site request forgery prevention
- 🔒 **Secure HTTP Headers**: Helmet.js for security headers
- 🔒 **Input Validation**: Zod schemas for all API endpoints
- 🔒 **Row Level Security**: Supabase RLS policies on all database tables
- 🔒 **JWT Authentication**: Secure token-based authentication with 8-hour expiry

### User Experience
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Loading States**: Clear loading indicators for all async operations
- 🎨 **Error Handling**: User-friendly error messages with retry options
- 🎨 **Toast Notifications**: Non-intrusive success/error notifications
- 🎨 **Search & Filtering**: Quick child search with debounced input
- 🎨 **Dashboard Navigation**: Intuitive tabbed interface for all features
- 🎨 **Empty States**: Helpful messages when no data is available

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)
- Email service (optional, for verification and notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kids-church
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Validate environment**
   ```bash
   npm run validate
   ```

5. **Set up database**
   - Follow instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - Apply all migrations via Supabase dashboard

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:4000
   ```

## Project Structure

```
kids-church/
├── src/
│   ├── server.ts              # Main Express application
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── rbac.ts            # Role-based access control
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── children.ts        # Child management
│   │   ├── parents.ts         # Parent management
│   │   ├── checkins.ts        # Check-in/check-out
│   │   ├── classes.ts         # Class management
│   │   ├── specialNeeds.ts    # Special needs forms
│   │   └── statistics.ts      # Dashboard statistics
│   └── services/
│       ├── auth.ts            # Authentication logic
│       ├── email.ts           # Email service (nodemailer)
│       └── audit.ts           # Audit logging
├── public/
│   ├── index.html             # Main HTML file
│   ├── styles.css             # Styling
│   ├── app.js                 # Authentication logic
│   ├── dashboard.js           # Dashboard features
│   └── utils.js               # UI utilities
├── supabase/
│   └── migrations/            # Database migrations
├── .env.example               # Environment template
├── DATABASE_SETUP.md          # Database setup guide
└── README.md                  # This file
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (after build)
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run validate` - Validate environment configuration
- `npm run setup` - Run validation and display next steps

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/verify-email/:token` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

### Children
- `GET /api/children` - List all children (paginated)
- `GET /api/children/:id` - Get child by ID
- `POST /api/children` - Create new child
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Parents
- `GET /api/parents` - List all parents (paginated)
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create new parent
- `PUT /api/parents/:id` - Update parent
- `DELETE /api/parents/:id` - Delete parent
- `POST /api/parents/:parentId/children/:childId` - Link child to parent

### Check-ins
- `GET /api/checkins` - List check-ins (filterable by date, child, parent, status)
- `POST /api/checkins` - Check in a child
- `POST /api/checkins/:id/checkout` - Check out a child

### Classes
- `GET /api/classes` - List all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/:id/attendance` - Get class attendance

### Special Needs
- `GET /api/special-needs` - List special needs forms
- `GET /api/special-needs/:childId` - Get form for specific child
- `POST /api/special-needs` - Submit special needs form
- `PUT /api/special-needs/:childId` - Update special needs form

### Statistics
- `GET /api/statistics/dashboard` - Dashboard overview stats
- `GET /api/statistics/attendance/by-class` - Attendance by class
- `GET /api/statistics/attendance/trends` - 30-day attendance trends
- `GET /api/statistics/special-needs` - Special needs statistics
- `GET /api/statistics/classes/capacity` - Class capacity tracking

### Health
- `GET /health` - Server health check

## Environment Variables

See `.env.example` for all available variables. Required variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `JWT_SECRET` - Secret for JWT signing (use strong random string)
- `SESSION_SECRET` - Secret for session encryption (use strong random string)
- `PORT` - Server port (default: 4000)

Optional but recommended:
- `BASE_URL` - Full URL of your application (for email links)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` - Email service configuration

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use strong secrets** - Generate random strings for JWT_SECRET and SESSION_SECRET
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Review audit logs** - Check the `audit_logs` table for suspicious activity
5. **Configure RLS policies** - Ensure Row Level Security is enabled on all tables
6. **Use HTTPS in production** - Never transmit credentials over HTTP
7. **Rotate secrets periodically** - Update JWT_SECRET and SESSION_SECRET regularly
8. **Backup database** - Configure automated backups in Supabase dashboard

## Email Service Setup

To enable email verification and notifications:

1. **Install nodemailer** (if not already installed)
   ```bash
   npm install nodemailer @types/nodemailer
   ```

2. **Configure email service** in `.env`:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Kids Church <noreply@yourchurch.org>
   ```

3. **For Gmail**: Use App Passwords (not your regular password)
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a new app password for "Mail"

4. **Alternative email services**:
   - SendGrid (recommended for production)
   - AWS SES
   - Mailgun
   - Postmark

## Database Migrations

All database migrations are in `supabase/migrations/`. To apply them:

1. **Via Supabase Dashboard** (recommended for first-time setup):
   - Go to SQL Editor
   - Copy and paste each migration file
   - Run in order (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))

2. **Via Supabase CLI**:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## Troubleshooting

### "npm permission error" when installing nodemailer
Fix npm cache permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

### "Invalid credentials" on login
- Check that user is registered in `users` table
- Verify JWT_SECRET matches between registration and login
- Check browser console for detailed error messages

### Database connection errors
- Verify Supabase credentials in `.env`
- Check that your IP is not blocked in Supabase dashboard
- Ensure project is active (not paused)

### Email not sending
- Check email service credentials
- Look for error logs in console
- Verify `EMAIL_*` variables are set correctly
- Test with a simple SMTP tester tool first

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run tests with:
```bash
npm test
```

For coverage:
```bash
npm test -- --coverage
```

## Deployment

### Preparing for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   - Use production Supabase project
   - Generate new strong secrets
   - Set BASE_URL to your production domain
   - Configure email service

3. **Enable RLS policies**
   - Verify all tables have appropriate RLS policies
   - Test with different user roles

4. **Deploy to your platform**
   - Vercel, Railway, Render, AWS, etc.
   - Ensure Node.js 18+ is available
   - Run `npm start` as the start command

### Platform-Specific Guides

- **Vercel**: Add environment variables in dashboard, use `npm start` as start command
- **Railway**: Connect GitHub repo, set environment variables, deploy
- **Render**: Use web service, set build command to `npm install && npm run build`, start command to `npm start`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database help
- Review [Supabase Documentation](https://supabase.com/docs) for database questions

## Roadmap

Completed:
- ✅ Core authentication and authorization
- ✅ Child and parent management
- ✅ Check-in/check-out workflow
- ✅ Class management
- ✅ Special needs support
- ✅ Dashboard with statistics
- ✅ Email verification and notifications
- ✅ Audit logging
- ✅ RBAC with role hierarchy

Planned:
- 🔲 Print check-in labels with security codes
- 🔲 SMS notifications option
- 🔲 Mobile app (React Native or Progressive Web App)
- 🔲 Volunteer scheduling
- 🔲 Parent portal for self-service
- 🔲 Advanced reporting and analytics
- 🔲 Multi-location support
- 🔲 Integration with church management systems

## Acknowledgments

- Built with [Express](https://expressjs.com/)
- Database by [Supabase](https://supabase.com/)
- Authentication with [JWT](https://jwt.io/)
- Email service with [Nodemailer](https://nodemailer.com/)

---

Made with ❤️ for Kids Church ministries
