# Testing Guide - Flavor Entertainers Platform

## Overview

This document outlines the testing strategy and setup for the Flavor Entertainers booking platform. The platform uses Jest and React Testing Library for comprehensive testing coverage.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **Jest DOM**: Custom Jest matchers for DOM testing
- **User Event**: Utilities for simulating user interactions
- **Babel**: Code transformation for testing

## Configuration

### Jest Configuration
- **Config File**: `jest.config.simple.js`
- **Setup File**: `jest.setup.js`
- **Babel Config**: `babel.config.js`

### Test Scripts
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage reports
```

## Test Structure

### 1. Unit Tests
Testing individual functions and utilities.

**Location**: `src/lib/__tests__/`, `src/hooks/__tests__/`

**Examples**:
- Utility functions (formatCurrency, validateEmail, etc.)
- Custom hooks (useWhatsAppNotify, etc.)
- Business logic functions

### 2. Component Tests
Testing React components in isolation.

**Location**: `src/components/__tests__/`

**Examples**:
- UI components (Button, Card, Badge)
- Feature components (PerformerGrid, BookingForm)
- Layout components

### 3. Integration Tests
Testing complete user flows and feature interactions.

**Location**: `__tests__/`

**Examples**:
- Complete booking flow
- Admin dashboard workflows
- Authentication flows

### 4. API Tests
Testing API routes and database interactions.

**Location**: `__tests__/api.test.ts`

**Examples**:
- CRUD operations
- Authentication endpoints
- Payment processing

## Test Categories

### Core Functionality Tests
✅ **Basic Setup Tests** - Verify Jest configuration works
- Math operations
- String manipulation
- Array operations
- Object handling
- Async operations

✅ **Utility Functions** - Platform-specific utilities
- Currency formatting
- Email validation
- Booking reference generation
- Phone number validation
- Date formatting

### Component Tests
📝 **UI Components** (Ready for implementation)
- Button variants and states
- Card layouts and content
- Badge styling and variants
- Form inputs and validation

📝 **Business Components** (Ready for implementation)
- Performer grid with filtering
- Booking form validation
- Payment step components
- Admin queue management

### Integration Tests
📝 **User Flows** (Ready for implementation)
- Complete booking process
- Performer search and selection
- Payment flow
- Admin approval workflow

📝 **API Integration** (Ready for implementation)
- Database operations
- Authentication flows
- Notification sending
- Payment processing

## Mock Strategy

### External Dependencies
- **Supabase**: Mocked database operations
- **Next.js Navigation**: Mocked routing
- **Framer Motion**: Simplified animations
- **Twilio**: Mocked SMS/WhatsApp sending
- **Payment APIs**: Mocked payment processing

### Component Mocking
- Form components use simplified mock implementations
- Navigation components return mock functions
- External service calls are intercepted and mocked

## Running Tests

### Development
```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test file
npm test -- simple.test.ts

# Run tests with verbose output
npm test -- --verbose
```

### Continuous Integration
```bash
# Run all tests (used in CI/CD)
npm test

# Generate coverage report
npm run test:coverage
```

## Coverage Goals

### Target Coverage
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Priority Areas
1. **Critical Business Logic**: 95%+ coverage
   - Booking calculations
   - Payment processing
   - User authentication
   - Data validation

2. **Core Components**: 85%+ coverage
   - Performer grid
   - Booking forms
   - Admin interfaces
   - Payment components

3. **Utility Functions**: 90%+ coverage
   - All helper functions
   - Validation functions
   - Formatting functions

## Test Data

### Mock Data Structure
```typescript
// Example performer data
const mockPerformer = {
  id: 'performer-1',
  stage_name: 'Test Performer',
  bio: 'Professional entertainer',
  location: 'Sydney',
  rating: 4.5,
  total_reviews: 10,
  is_available: true,
  performer_services: [...]
}

// Example booking data
const mockBooking = {
  id: 'booking-123',
  performer_id: 'performer-1',
  client_name: 'John Doe',
  event_date: '2024-01-15T18:00:00Z',
  status: 'pending',
  total_amount: 200
}
```

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow "should [expected behavior] when [condition]" pattern
- Group related tests in describe blocks

### 2. Test Organization
- One test file per component/function
- Keep tests close to source code
- Use consistent directory structure

### 3. Assertions
- Test behavior, not implementation
- Use appropriate Jest matchers
- Test both happy path and error cases

### 4. Mocking
- Mock external dependencies
- Keep mocks close to test files
- Reset mocks between tests

## Troubleshooting

### Common Issues

1. **Module Resolution**:
   - Ensure `moduleNameMapper` is correctly configured
   - Check path aliases match project structure

2. **JSX Compilation**:
   - Verify Babel presets are installed
   - Check React configuration in babel.config.js

3. **Async Operations**:
   - Use `waitFor` for async state changes
   - Properly mock Promise-based APIs

4. **Component Rendering**:
   - Mock external dependencies before importing
   - Use appropriate testing utilities

### Performance
- Use `--maxWorkers=1` for debugging
- Run specific test files during development
- Use watch mode for faster feedback

## Next Steps

1. **Expand Component Tests**: Add comprehensive tests for all major components
2. **API Integration Tests**: Test all API endpoints with real database operations
3. **E2E Testing**: Consider adding Playwright or Cypress for end-to-end testing
4. **Performance Testing**: Add performance benchmarks for critical operations
5. **Visual Regression**: Consider screenshot testing for UI components

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status**: ✅ Testing infrastructure complete and functional
**Last Updated**: December 2024
**Contributors**: Claude AI Assistant