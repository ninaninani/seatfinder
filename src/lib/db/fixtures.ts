import mongoose from 'mongoose';
import User from './models/User';
import Event from './models/Event';
import Guest from './models/Guest';
import Subscription, {
  PlanType,
  SubscriptionStatus,
} from './models/Subscription';
import { RSVPStatus } from './models/Guest';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearCollections = async () => {
  try {
    await User.deleteMany({});
    await Event.deleteMany({});
    await Guest.deleteMany({});
    await Subscription.deleteMany({});
    console.log('🧹 Cleared all collections');
  } catch (error) {
    console.error('❌ Error clearing collections:', error);
  }
};

// Create test users for different scenarios
const createTestUsers = async () => {
  const users = [];

  // Plan I user (limited to 1 event, 20 guests)
  const planIUser = new User({
    email: 'plan1@test.com',
    isEmailVerified: true,
  });
  users.push(await planIUser.save());

  // Plan II user (limited to 1 event, 1000 guests)
  const planIIUser = new User({
    email: 'plan2@test.com',
    isEmailVerified: true,
  });
  users.push(await planIIUser.save());

  // Plan III user (unlimited)
  const planIIIUser = new User({
    email: 'plan3@test.com',
    isEmailVerified: true,
  });
  users.push(await planIIIUser.save());

  // Unverified user
  const unverifiedUser = new User({
    email: 'unverified@test.com',
    isEmailVerified: false,
  });
  users.push(await unverifiedUser.save());

  console.log('👥 Created test users');
  return users;
};

// Create test subscriptions
const createTestSubscriptions = async (users: any[]) => {
  const subscriptions = [];

  // Plan I subscription
  const planISub = new Subscription({
    userId: users[0]._id,
    planType: PlanType.PLAN_I,
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    transactionId: 'TXN_PLAN_I_001',
    invoiceReference: 'INV-PLANI001',
  });
  subscriptions.push(await planISub.save());

  // Plan II subscription
  const planIISub = new Subscription({
    userId: users[1]._id,
    planType: PlanType.PLAN_II,
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    transactionId: 'TXN_PLAN_II_001',
    invoiceReference: 'INV-PLANII001',
  });
  subscriptions.push(await planIISub.save());

  // Plan III subscription
  const planIIISub = new Subscription({
    userId: users[2]._id,
    planType: PlanType.PLAN_III,
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    transactionId: 'TXN_PLAN_III_001',
    invoiceReference: 'INV-PLANIII001',
  });
  subscriptions.push(await planIIISub.save());

  // Expired subscription
  const expiredSub = new Subscription({
    userId: users[3]._id,
    planType: PlanType.PLAN_I,
    status: SubscriptionStatus.EXPIRED,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    transactionId: 'TXN_EXPIRED_001',
    invoiceReference: 'INV-EXPIRED001',
  });
  subscriptions.push(await expiredSub.save());

  console.log('💳 Created test subscriptions');
  return subscriptions;
};

// Create test events for different scenarios
const createTestEvents = async (users: any[]) => {
  const events = [];

  // Plan I user event (at limit)
  const planIEvent = new Event({
    title: 'Plan I Conference',
    description: 'A conference for Plan I users',
    date: new Date('2024-06-15'),
    location: 'Conference Center A',
    ownerId: users[0]._id,
    maxGuests: 20,
    guestCount: 0,
    checkedInCount: 0,
    isActive: true,
  });
  events.push(await planIEvent.save());

  // Plan II user event (large event)
  const planIIEvent = new Event({
    title: 'Plan II Mega Event',
    description: 'A large event for Plan II users',
    date: new Date('2024-07-20'),
    location: 'Stadium B',
    ownerId: users[1]._id,
    maxGuests: 1000,
    guestCount: 0,
    checkedInCount: 0,
    isActive: true,
  });
  events.push(await planIIEvent.save());

  // Plan III user events (multiple events)
  const planIIIEvent1 = new Event({
    title: 'Plan III Event 1',
    description: 'First event for Plan III user',
    date: new Date('2024-08-10'),
    location: 'Venue C',
    ownerId: users[2]._id,
    maxGuests: 500,
    guestCount: 0,
    checkedInCount: 0,
    isActive: true,
  });
  events.push(await planIIIEvent1.save());

  const planIIIEvent2 = new Event({
    title: 'Plan III Event 2',
    description: 'Second event for Plan III user',
    date: new Date('2024-09-15'),
    location: 'Venue D',
    ownerId: users[2]._id,
    maxGuests: 300,
    guestCount: 0,
    checkedInCount: 0,
    isActive: true,
  });
  events.push(await planIIIEvent2.save());

  // Inactive event
  const inactiveEvent = new Event({
    title: 'Inactive Event',
    description: 'An inactive event',
    date: new Date('2024-05-01'),
    location: 'Venue E',
    ownerId: users[0]._id,
    maxGuests: 50,
    guestCount: 0,
    checkedInCount: 0,
    isActive: false,
  });
  events.push(await inactiveEvent.save());

  console.log('🎉 Created test events');
  return events;
};

// Create test guests for different scenarios
const createTestGuests = async (events: any[]) => {
  const guests = [];

  // Plan I event guests (at limit)
  for (let i = 1; i <= 20; i++) {
    const guest = new Guest({
      eventId: events[0]._id,
      fullName: `Guest ${i} Plan I`,
      email: `guest${i}@plan1.com`,
      phone: `+1234567890${i.toString().padStart(2, '0')}`,
      seatNumber: `A${i.toString().padStart(2, '0')}`,
      rsvpStatus: i <= 15 ? RSVPStatus.CONFIRMED : RSVPStatus.PENDING,
      isCheckedIn: i <= 10,
      checkedInAt: i <= 10 ? new Date(Date.now() - i * 60000) : undefined,
      checkInToken: `token_plan1_${i}`,
    });
    guests.push(await guest.save());
  }

  // Plan II event guests (large sample)
  for (let i = 1; i <= 50; i++) {
    const guest = new Guest({
      eventId: events[1]._id,
      fullName: `Guest ${i} Plan II`,
      email: `guest${i}@plan2.com`,
      phone: `+1234567891${i.toString().padStart(2, '0')}`,
      seatNumber: `B${i.toString().padStart(2, '0')}`,
      rsvpStatus: i <= 40 ? RSVPStatus.CONFIRMED : RSVPStatus.DECLINED,
      isCheckedIn: i <= 30,
      checkedInAt: i <= 30 ? new Date(Date.now() - i * 60000) : undefined,
      checkInToken: `token_plan2_${i}`,
    });
    guests.push(await guest.save());
  }

  // Plan III event 1 guests
  for (let i = 1; i <= 30; i++) {
    const guest = new Guest({
      eventId: events[2]._id,
      fullName: `Guest ${i} Plan III-1`,
      email: `guest${i}@plan3-1.com`,
      phone: `+1234567892${i.toString().padStart(2, '0')}`,
      seatNumber: `C${i.toString().padStart(2, '0')}`,
      rsvpStatus: RSVPStatus.CONFIRMED,
      isCheckedIn: i <= 20,
      checkedInAt: i <= 20 ? new Date(Date.now() - i * 60000) : undefined,
      checkInToken: `token_plan3_1_${i}`,
    });
    guests.push(await guest.save());
  }

  // Plan III event 2 guests
  for (let i = 1; i <= 25; i++) {
    const guest = new Guest({
      eventId: events[3]._id,
      fullName: `Guest ${i} Plan III-2`,
      email: `guest${i}@plan3-2.com`,
      phone: `+1234567893${i.toString().padStart(2, '0')}`,
      seatNumber: `D${i.toString().padStart(2, '0')}`,
      rsvpStatus: i <= 20 ? RSVPStatus.CONFIRMED : RSVPStatus.PENDING,
      isCheckedIn: i <= 15,
      checkedInAt: i <= 15 ? new Date(Date.now() - i * 60000) : undefined,
      checkInToken: `token_plan3_2_${i}`,
    });
    guests.push(await guest.save());
  }

  console.log('👤 Created test guests');
  return guests;
};

// Update event guest counts
const updateEventCounts = async () => {
  try {
    const events = await Event.find({});

    for (const event of events) {
      const guestCount = await Guest.countDocuments({ eventId: event._id });
      const checkedInCount = await Guest.countDocuments({
        eventId: event._id,
        isCheckedIn: true,
      });

      await Event.findByIdAndUpdate(event._id, {
        guestCount,
        checkedInCount,
      });
    }

    console.log('📊 Updated event guest counts');
  } catch (error) {
    console.error('❌ Error updating event counts:', error);
  }
};

// Main fixture creation function
const createFixtures = async () => {
  try {
    await connectDB();
    await clearCollections();

    const users = await createTestUsers();
    const subscriptions = await createTestSubscriptions(users);
    const events = await createTestEvents(users);
    const guests = await createTestGuests(events);

    await updateEventCounts();

    console.log('\n🎉 Test fixtures created successfully!');
    console.log('\n📊 Fixture Summary:');
    console.log(`   Users: ${users.length} (including unverified)`);
    console.log(
      `   Subscriptions: ${subscriptions.length} (including expired)`
    );
    console.log(`   Events: ${events.length} (including inactive)`);
    console.log(`   Guests: ${guests.length} (distributed across events)`);

    console.log('\n🧪 Test Scenarios Available:');
    console.log('   • Plan I user at guest limit (20/20)');
    console.log('   • Plan II user with large event (50/1000)');
    console.log('   • Plan III user with multiple events');
    console.log('   • Unverified user (no access)');
    console.log('   • Expired subscription');
    console.log('   • Check-in flow testing');
    console.log('   • RSVP status variations');

    console.log('\n📋 Sample Test Data:');
    console.log('   Plan I User:', users[0]?.email);
    console.log('   Plan II User:', users[1]?.email);
    console.log('   Plan III User:', users[2]?.email);
    console.log('   Unverified User:', users[3]?.email);
  } catch (error) {
    console.error('❌ Fixture creation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run fixture creation if this file is executed directly
if (require.main === module) {
  createFixtures();
}

export default createFixtures;
