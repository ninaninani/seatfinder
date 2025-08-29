# Database Indexes Documentation

This document outlines all database indexes implemented for the SeatFinder application to optimize common queries.

## User Collection Indexes

### Primary Indexes

- `email: 1` (unique) - Ensures email uniqueness and enables fast email lookups
- `isEmailVerified: 1` - Optimizes queries filtering by verification status

### Common Queries Supported

- User authentication by email
- Email verification status checks
- User lookup by email for OTP verification

## Event Collection Indexes

### Primary Indexes

- `date: 1` - Optimizes date-based queries and sorting
- `ownerId: 1` - Enables fast user-specific event queries
- `isActive: 1` - Optimizes active/inactive event filtering

### Compound Indexes

- `ownerId: 1, createdAt: -1` - Lists user's events by creation time (newest first)
- `ownerId: 1, isActive: 1` - User's active events
- `date: 1, isActive: 1` - Active events by date
- `ownerId: 1, date: -1` - User's events sorted by date (newest first)
- `ownerId: 1, guestCount: -1` - Plan limit enforcement (largest events first)
- `isActive: 1, date: 1` - Active events chronologically
- `ownerId: 1, isActive: 1, date: -1` - User's active events by date

### Common Queries Supported

- Dashboard: List user's events
- Plan enforcement: Count user's events
- Event management: Active events by user
- Analytics: Events by date range

## Guest Collection Indexes

### Primary Indexes

- `eventId: 1` - Enables fast event-specific guest queries
- `rsvpStatus: 1` - Optimizes RSVP status filtering
- `isCheckedIn: 1` - Optimizes check-in status queries
- `checkInToken: 1` (unique) - QR code scan lookups
- `checkedInAt: 1` - Check-in time analytics

### Compound Indexes

- `eventId: 1, email: 1` (unique) - Prevents duplicate emails per event
- `eventId: 1, isCheckedIn: 1` - Event check-in statistics
- `eventId: 1, createdAt: -1` - Event guests by registration time
- `eventId: 1, rsvpStatus: 1` - RSVP status filtering per event
- `eventId: 1, isCheckedIn: 1, rsvpStatus: 1` - Comprehensive check-in stats
- `eventId: 1, fullName: 1` - Name-based search within events
- `eventId: 1, seatNumber: 1` - Seat-based queries

### Common Queries Supported

- Guest management: List/search guests by event
- Check-in: QR code validation and status updates
- RSVP tracking: Status-based filtering
- Analytics: Check-in rates and timing
- Seat management: Seat number lookups

## Subscription Collection Indexes

### Primary Indexes

- `userId: 1` - User-specific subscription queries
- `planType: 1` - Plan-based filtering
- `status: 1` - Subscription status queries
- `startDate: 1` - Subscription start time analytics
- `endDate: 1` - Expiry date queries

### Compound Indexes

- `userId: 1, status: 1` - User's active subscriptions
- `userId: 1, createdAt: -1` - User's subscription history
- `endDate: 1, status: 1` - Expiring subscriptions
- `userId: 1, status: 1, planType: 1` - User's current plan
- `status: 1, planType: 1` - Plan distribution analytics
- `userId: 1, status: 1, endDate: 1` - Subscription expiry management
- `startDate: 1, status: 1` - Subscription start analytics

### Sparse Indexes

- `transactionId: 1` (sparse) - Payment transaction lookups
- `invoiceReference: 1` (sparse) - Invoice reference lookups

### Common Queries Supported

- Billing: Current user subscription
- Plan enforcement: Active plan validation
- Analytics: Plan distribution and trends
- Payment processing: Transaction reconciliation
- Subscription management: Expiry notifications

## Index Usage Guidelines

### Query Optimization

- Always include indexed fields in WHERE clauses
- Use compound indexes from left to right
- Avoid querying on non-indexed fields for large collections

### Maintenance

- Monitor index usage with MongoDB's `$indexStats`
- Consider dropping unused indexes to improve write performance
- Use `explain()` to verify index usage in queries

### Performance Considerations

- Indexes improve read performance but slow down writes
- Compound indexes support queries on prefix fields
- Sparse indexes only include documents with the indexed field
- Unique indexes prevent duplicate values but add overhead
