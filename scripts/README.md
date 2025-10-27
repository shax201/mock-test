# IELTS Mock Test System - Scripts

This directory contains various scripts to set up and manage the IELTS Mock Test System.

## 🚀 Quick Start

### Complete System Setup
```bash
npm run setup:complete
```
This will:
- Clear all existing data
- Create a comprehensive mock test with all question types
- Create 5 remedial test templates linked to the mock test
- Set up admin user

## 📝 Individual Scripts

### Mock Test Scripts

#### Create Comprehensive Mock Test
```bash
npm run mock:comprehensive
```
Creates a complete IELTS Academic mock test with:
- Listening module (6 questions)
- Reading module (8 questions) 
- Writing module (manual tasks)
- All question types: Multiple Choice, Fill-in-Blank, True/False/Not Given, Notes Completion, Summary Completion

#### Reset and Seed Mock Tests
```bash
npm run mock:reset
```
Clears all data and creates sample mock tests.

### Remedial Test Scripts

#### Seed Remedial Tests
```bash
npm run remedial:seed
```
Creates 5 remedial test templates:
- **Reading - Matching Headings Practice** (Intermediate)
- **Reading - Information Matching Practice** (Intermediate)
- **Listening - Multiple Choice Practice** (Intermediate)
- **Reading - Fill in the Blank Practice** (Intermediate)
- **Reading - True/False/Not Given Practice** (Advanced)

### Database Scripts

#### Database Migration
```bash
npm run db:migrate
```
Applies database schema changes.

#### Seed Students
```bash
npm run db:seed:students
```
Creates sample student accounts.

#### Reset Database
```bash
npm run db:reset
```
⚠️ **WARNING**: This will delete ALL data and reset the database.

## 📊 Script Details

### `create-comprehensive-mock-test.ts`
- Creates a full IELTS Academic mock test
- Includes all question types and modules
- Generates realistic content for practice

### `seed-remedial-tests.ts`
- Creates remedial test templates linked to mock tests
- Covers different question types and difficulty levels
- Links to the comprehensive mock test created above

### `setup-complete-system.ts`
- **Recommended for first-time setup**
- Combines mock test creation and remedial test seeding
- Provides complete system initialization

## 🔧 Prerequisites

Before running any scripts:

1. **Database Setup**:
   ```bash
   npm run db:migrate
   ```

2. **Environment Variables**:
   Ensure your `.env` file has the correct database connection string.

3. **Dependencies**:
   ```bash
   npm install
   ```

## 📋 Script Output

### Mock Test Creation
- Mock Test ID and details
- Module information with question counts
- Admin user creation

### Remedial Test Seeding
- Template creation confirmation
- Link to parent mock test
- Admin user information

### Complete Setup
- Summary of all created content
- Access URLs for admin and student portals
- Default credentials

## 🎯 Usage Examples

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run db:migrate

# 3. Create complete system
npm run setup:complete

# 4. Start development server
npm run dev
```

### Adding More Remedial Tests
```bash
# After creating mock tests
npm run remedial:seed
```

### Reset Everything
```bash
# Clear all data and start fresh
npm run db:reset
npm run setup:complete
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check your `.env` file
   - Ensure database is running
   - Run `npm run db:migrate`

2. **Permission Errors**:
   - Ensure you have write access to the database
   - Check file permissions

3. **Script Fails**:
   - Check console output for specific errors
   - Ensure all dependencies are installed
   - Try running individual scripts to isolate issues

### Getting Help

- Check the console output for detailed error messages
- Ensure all prerequisites are met
- Verify database connectivity
- Check file permissions and dependencies

## 📁 File Structure

```
scripts/
├── README.md                           # This file
├── create-comprehensive-mock-test.ts   # Mock test creation
├── seed-remedial-tests.ts             # Remedial test seeding
├── setup-complete-system.ts           # Complete system setup
├── seed-students.ts                   # Student account creation
├── reset-and-seed-mock-tests.ts       # Reset and seed
└── verify-part-storage.ts             # Verification script
```

## 🎉 Success Indicators

After running `npm run setup:complete`, you should see:

- ✅ Mock test created with ID
- ✅ 5 remedial test templates created
- ✅ Admin user created
- ✅ All modules and questions generated
- ✅ System ready for use

You can then access:
- **Admin Panel**: `/admin` (admin@radiance.edu / admin123)
- **Student Portal**: `/student`
- **Remedial Tests**: `/admin/remedial-tests` and `/student/remedial-tests`