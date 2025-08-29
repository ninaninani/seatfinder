import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
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

// Generate test users
const createUsers = async (count: number = 5) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const user = new User({
      email: faker.internet.email(),
      isEmailVerified: Math.random() > 0.2, // 80% verified
    });
    users.push(await user.save());
  }

  console.log(`👥 Created ${users.length} users`);
  return users;
};

// Generate test events
const createEvents = async (users: any[], count: number = 10) => {
  const events = [];

  for (let i = 0; i < count; i++) {
    const owner = users[Math.floor(Math.random() * users.length)];
    const event = new Event({
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      date: faker.date.future(),
      location: faker.location.streetAddress(),
      ownerId: owner._id,
      maxGuests:
        Math.random() > 0.5 ? faker.number.int({ min: 50, max: 500 }) : null,
      guestCount: 0,
      checkedInCount: 0,
      isActive: Math.random() > 0.1, // 90% active
    });
    events.push(await event.save());
  }

  console.log(`🎉 Created ${events.length} events`);
  return events;
};

// Generate test guests
const createGuests = async (events: any[], count: number = 100) => {
  const guests = [];

  for (let i = 0; i < count; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const rsvpStatuses = Object.values(RSVPStatus);
    const rsvpStatus =
      rsvpStatuses[Math.floor(Math.random() * rsvpStatuses.length)];
    const isCheckedIn =
      rsvpStatus === RSVPStatus.CONFIRMED && Math.random() > 0.6;

    const guest = new Guest({
      eventId: event._id,
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: Math.random() > 0.3 ? faker.phone.number() : undefined,
      seatNumber:
        Math.random() > 0.5
          ? faker.string.alphanumeric(3).toUpperCase()
          : undefined,
      rsvpStatus,
      isCheckedIn,
      checkedInAt: isCheckedIn ? faker.date.recent() : undefined,
      checkInToken: faker.string.alphanumeric(32),
    });
    guests.push(await guest.save());
  }

  console.log(`👤 Created ${guests.length} guests`);
  return guests;
};

// Generate test subscriptions
const createSubscriptions = async (users: any[], count: number = 8) => {
  const subscriptions = [];
  const planTypes = Object.values(PlanType);
  const statuses = Object.values(SubscriptionStatus);

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = faker.date.past();

    const subscription = new Subscription({
      userId: user._id,
      planType,
      status,
      startDate,
      endDate:
        status === SubscriptionStatus.ACTIVE ? faker.date.future() : undefined,
      transactionId:
        Math.random() > 0.3 ? faker.string.alphanumeric(16) : undefined,
      invoiceReference:
        Math.random() > 0.3
          ? `INV-${faker.string.alphanumeric(8).toUpperCase()}`
          : undefined,
    });
    subscriptions.push(await subscription.save());
  }

  console.log(`💳 Created ${subscriptions.length} subscriptions`);
  return subscriptions;
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

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearCollections();

    const users = await createUsers(5);
    const events = await createEvents(users, 10);
    const guests = await createGuests(events, 100);
    const subscriptions = await createSubscriptions(users, 8);

    await updateEventCounts();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Guests: ${guests.length}`);
    console.log(`   Subscriptions: ${subscriptions.length}`);

    // Log some sample data for verification
    console.log('\n📋 Sample Data:');
    console.log('   Sample User:', users[0]?.email);
    console.log('   Sample Event:', events[0]?.title);
    console.log('   Sample Guest:', guests[0]?.fullName);
    console.log('   Sample Subscription:', subscriptions[0]?.planType);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
