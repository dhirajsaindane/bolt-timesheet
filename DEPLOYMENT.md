# Deployment Guide

## Production Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Configure environment variables in Netlify dashboard

### Option 3: Traditional Hosting

1. Build the project:
```bash
npm run build
```

2. Upload the contents of the `dist` folder to your web server

3. Configure your web server to:
   - Serve `index.html` for all routes (SPA routing)
   - Set appropriate cache headers
   - Enable HTTPS

### Environment Variables

Ensure these environment variables are set in your production environment:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

The database is already configured with:
- All necessary tables and relationships
- Row Level Security policies
- Test user accounts
- Sample data

### Creating Additional Users

Admins can create new users through the admin dashboard after logging in with:
- Email: admin@hrms.com
- Password: admin123

## Security Considerations

### Production Checklist

- [ ] Change all test account passwords
- [ ] Review and update RLS policies if needed
- [ ] Enable email verification in Supabase (if required)
- [ ] Set up custom domain with HTTPS
- [ ] Configure CORS policies in Supabase
- [ ] Set up monitoring and error tracking
- [ ] Review and update rate limiting
- [ ] Configure backup schedule for database

### Recommended Security Updates

1. **Password Policy**: Update password requirements in Supabase Auth settings
2. **Session Management**: Configure session timeout in Supabase
3. **Email Verification**: Enable email confirmation for new users
4. **Two-Factor Authentication**: Consider adding 2FA for admin accounts
5. **API Keys**: Rotate keys regularly and never commit to version control

## Performance Optimization

1. **Enable CDN**: Use a CDN for static assets
2. **Gzip Compression**: Ensure your server enables gzip compression
3. **Caching**: Set appropriate cache headers for static assets
4. **Database Indexing**: Already configured for optimal query performance
5. **Connection Pooling**: Configured by default in Supabase

## Monitoring

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar, or similar
- **Analytics**: Google Analytics, Plausible, or similar
- **Uptime Monitoring**: UptimeRobot, Pingdom, or similar
- **Database Monitoring**: Built-in Supabase dashboard

### Key Metrics to Monitor

- Page load time
- API response times
- Error rates
- User authentication success/failure rates
- Database query performance
- User engagement metrics

## Backup and Recovery

### Database Backups

Supabase provides automatic daily backups. To create manual backups:

1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Create backup or restore from existing backup

### Application Code

- Keep your Git repository up to date
- Tag releases for easy rollback
- Document any manual configuration changes

## Scaling Considerations

### Database Scaling

- Supabase automatically handles connection pooling
- Monitor query performance in Supabase dashboard
- Add indexes as needed for new query patterns
- Consider read replicas for read-heavy workloads

### Application Scaling

- Deploy to multiple regions if needed
- Use a load balancer for high traffic
- Consider implementing caching layer (Redis)
- Monitor and optimize bundle size

## Support and Maintenance

### Regular Maintenance Tasks

- Weekly: Review error logs and fix issues
- Monthly: Update dependencies (`npm update`)
- Quarterly: Security audit and dependency updates
- Yearly: Review and optimize database schema

### Update Process

1. Test updates in development environment
2. Run full test suite
3. Deploy to staging environment
4. Verify functionality
5. Deploy to production
6. Monitor for issues

## Troubleshooting

### Common Issues

**Issue: Users can't log in**
- Check Supabase Auth configuration
- Verify email addresses are correct
- Check network connectivity to Supabase

**Issue: Timesheets not appearing**
- Check RLS policies in Supabase
- Verify user roles are correctly assigned
- Check browser console for errors

**Issue: Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check for TypeScript errors: `npm run typecheck`

## Contact

For production support, contact your system administrator or development team.
