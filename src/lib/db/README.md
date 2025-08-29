# Database Seeding & Fixtures

This directory contains scripts for populating the database with test data for local development and testing.

## Files

- `seed.ts` - Random test data generator using Faker.js
- `fixtures.ts` - Predefined test scenarios for specific use cases
- `models/` - Mongoose schemas and models
- `indexes.md` - Database index documentation

## Quick Start

### Prerequisites

1. Set up your MongoDB connection string in `.env`:

   ```
   MONGODB_URI=mongodb://localhost:27017/seatfinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Generate Random Test Data

For general development with random data:

```bash
npm run db:seed
```

This creates:

- 5 random users (80% verified)
- 10 random events
- 100 random guests
- 8 random subscriptions

### Create Test Fixtures

For specific test scenarios:

```bash
npm run db:fixtures
```

This creates predefined test data for:

- Plan I user at guest limit (20/20)
- Plan II user with large event (50/1000)
- Plan III user with multiple events
- Unverified user (no access)
- Expired subscription
- Various RSVP and check-in states

## Test Scenarios

### Plan Limit Testing

The fixtures include users at different plan levels:

- **Plan I User** (`plan1@test.com`): 1 event, 20 guests (at limit)
- **Plan II User** (`plan2@test.com`): 1 event, 50 guests (well under 1000 limit)
- **Plan III User** (`plan3@test.com`): 2 events, unlimited guests

### Authentication Testing

- **Verified Users**: `plan1@test.com`, `plan2@test.com`, `plan3@test.com`
- **Unverified User**: `unverified@test.com`

### Check-in Flow Testing

Each event has guests with different check-in states:

- Some guests are checked in
- Some guests are confirmed but not checked in
- Some guests are pending or declined

### RSVP Status Testing

Guests have various RSVP statuses:

- `CONFIRMED` - Guest confirmed attendance
- `PENDING` - Guest hasn't responded
- `DECLINED` - Guest declined invitation

## Sample Data

### Users

```
plan1@test.com (Plan I, verified)
plan2@test.com (Plan II, verified)
plan3@test.com (Plan III, verified)
unverified@test.com (unverified)
```

### Events

```
Plan I Conference (20 guests max)
Plan II Mega Event (1000 guests max)
Plan III Event 1 (500 guests max)
Plan III Event 2 (300 guests max)
Inactive Event (inactive)
```

### Sample Guest Data

```
Guest 1 Plan I (confirmed, checked in)
Guest 15 Plan I (confirmed, not checked in)
Guest 16 Plan I (pending)
```

## Usage in Tests

You can import and use the seeding functions in your tests:

```typescript
import createFixtures from '../lib/db/fixtures';

describe('Event API', () => {
  beforeAll(async () => {
    await createFixtures();
  });

  // Your tests here
});
```

## Database Cleanup

Both scripts automatically clear existing data before creating new test data. If you need to manually clear the database:

```typescript
import mongoose from 'mongoose';
import User from './models/User';
import Event from './models/Event';
import Guest from './models/Guest';
import Subscription from './models/Subscription';

await User.deleteMany({});
await Event.deleteMany({});
await Guest.deleteMany({});
await Subscription.deleteMany({});
```

## Environment Variables

Make sure these are set in your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/seatfinder
```

For production-like testing, you might want to use a separate test database:

```
MONGODB_URI=mongodb://localhost:27017/seatfinder-test
```

## Troubleshooting

### Connection Issues

- Ensure MongoDB is running
- Check your connection string
- Verify network connectivity

### Permission Issues

- Ensure your MongoDB user has write permissions
- Check if the database exists

### Memory Issues

- For large datasets, consider reducing the count parameters
- Use `--max-old-space-size=4096` for Node.js if needed

## Next Steps

After seeding your database, you can:

1. Test the API endpoints with the sample data
2. Verify plan limit enforcement
3. Test the check-in flow
4. Validate authentication and authorization
5. Test CSV upload functionality
6. Verify subscription management
