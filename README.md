# 🎭 Family Chore Calendar - Staging Environment

This is the **staging environment** for the Family Chore Calendar application, used for testing new features before production deployment.

## 🚀 **Features**

- **Enhanced Admin Calendar** with drag & drop functionality
- **Grid Layout** - Days across top, family members down side
- **Real-time Validation** with cursor-following error messages
- **Privacy Protection** - Regular users only see their own chores
- **Role-based Permissions** - Admin vs regular user views
- **Points System** with chore completion tracking
- **Google OAuth Authentication**
- **Mobile Responsive** design

## 🔧 **Environment Setup**

### **Environment Variables for Vercel:**
Set these in your Vercel project dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/staging_database?sslmode=require
NEXTAUTH_URL=https://your-staging-app.vercel.app
NEXTAUTH_SECRET=your-staging-secret-key-make-this-random-and-secure
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

### **Local Development:**
```bash
npm install
npm run dev
```

### **Production Build:**
```bash
npm run build:production
npm start
```

## 📋 **Deployment**

1. **Database:** Create PostgreSQL database for staging
2. **Vercel:** Deploy with environment variables
3. **OAuth:** Configure Google OAuth for staging domain
4. **Test:** Verify all features work correctly

## 🎯 **Testing Focus**

- **Drag & Drop:** Test chore assignment functionality
- **Age Validation:** Verify age restrictions work
- **Privacy:** Confirm users only see appropriate chores
- **Authentication:** Test Google OAuth flow
- **Responsive:** Check mobile and desktop layouts

## 🔗 **Links**

- **Production:** https://family-chore-calendar.vercel.app
- **Staging:** https://your-staging-app.vercel.app
- **Repository:** https://github.com/king6870/chore-calendar-stagingnewtry

---

**Staging Environment - Test new features safely! 🧪✨**
