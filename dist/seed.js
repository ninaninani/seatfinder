"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const faker_1 = require("@faker-js/faker");
const User_1 = __importDefault(require("./models/User"));
const Event_1 = __importDefault(require("./models/Event"));
const Guest_1 = __importDefault(require("./models/Guest"));
const Subscription_1 = __importStar(require("./models/Subscription"));
const Guest_2 = require("./models/Guest");
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
// Clear all collections
const clearCollections = async () => {
    try {
        await User_1.default.deleteMany({});
        await Event_1.default.deleteMany({});
        await Guest_1.default.deleteMany({});
        await Subscription_1.default.deleteMany({});
        console.log('🧹 Cleared all collections');
    }
    catch (error) {
        console.error('❌ Error clearing collections:', error);
    }
};
// Generate test users
const createUsers = async (count = 5) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = new User_1.default({
            email: faker_1.faker.internet.email(),
            isEmailVerified: Math.random() > 0.2, // 80% verified
        });
        users.push(await user.save());
    }
    console.log(`👥 Created ${users.length} users`);
    return users;
};
// Generate test events
const createEvents = async (users, count = 10) => {
    const events = [];
    for (let i = 0; i < count; i++) {
        const owner = users[Math.floor(Math.random() * users.length)];
        const event = new Event_1.default({
            title: faker_1.faker.company.catchPhrase(),
            description: faker_1.faker.lorem.paragraph(),
            date: faker_1.faker.date.future(),
            location: faker_1.faker.location.streetAddress(),
            ownerId: owner._id,
            maxGuests: Math.random() > 0.5 ? faker_1.faker.number.int({ min: 50, max: 500 }) : null,
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
const createGuests = async (events, count = 100) => {
    const guests = [];
    for (let i = 0; i < count; i++) {
        const event = events[Math.floor(Math.random() * events.length)];
        const rsvpStatuses = Object.values(Guest_2.RSVPStatus);
        const rsvpStatus = rsvpStatuses[Math.floor(Math.random() * rsvpStatuses.length)];
        const isCheckedIn = rsvpStatus === Guest_2.RSVPStatus.CONFIRMED && Math.random() > 0.6;
        const guest = new Guest_1.default({
            eventId: event._id,
            fullName: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            phone: Math.random() > 0.3 ? faker_1.faker.phone.number() : undefined,
            seatNumber: Math.random() > 0.5
                ? faker_1.faker.string.alphanumeric(3).toUpperCase()
                : undefined,
            rsvpStatus,
            isCheckedIn,
            checkedInAt: isCheckedIn ? faker_1.faker.date.recent() : undefined,
            checkInToken: faker_1.faker.string.alphanumeric(32),
        });
        guests.push(await guest.save());
    }
    console.log(`👤 Created ${guests.length} guests`);
    return guests;
};
// Generate test subscriptions
const createSubscriptions = async (users, count = 8) => {
    const subscriptions = [];
    const planTypes = Object.values(Subscription_1.PlanType);
    const statuses = Object.values(Subscription_1.SubscriptionStatus);
    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const startDate = faker_1.faker.date.past();
        const subscription = new Subscription_1.default({
            userId: user._id,
            planType,
            status,
            startDate,
            endDate: status === Subscription_1.SubscriptionStatus.ACTIVE ? faker_1.faker.date.future() : undefined,
            transactionId: Math.random() > 0.3 ? faker_1.faker.string.alphanumeric(16) : undefined,
            invoiceReference: Math.random() > 0.3
                ? `INV-${faker_1.faker.string.alphanumeric(8).toUpperCase()}`
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
        const events = await Event_1.default.find({});
        for (const event of events) {
            const guestCount = await Guest_1.default.countDocuments({ eventId: event._id });
            const checkedInCount = await Guest_1.default.countDocuments({
                eventId: event._id,
                isCheckedIn: true,
            });
            await Event_1.default.findByIdAndUpdate(event._id, {
                guestCount,
                checkedInCount,
            });
        }
        console.log('📊 Updated event guest counts');
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};
// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}
exports.default = seedDatabase;
