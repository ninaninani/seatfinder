import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Add any providers here if needed in the future
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockEvent = (overrides = {}) => ({
  id: 'test-event-id',
  name: 'Test Event',
  description: 'A test event',
  date: new Date('2024-12-25T10:00:00Z'),
  location: 'Test Location',
  maxGuests: 100,
  guestCount: 0,
  checkInCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockGuest = (overrides = {}) => ({
  id: 'test-guest-id',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  seatNumber: 'A1',
  rsvpStatus: 'confirmed',
  isCheckedIn: false,
  checkedInAt: null,
  eventId: 'test-event-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'user@example.com',
  isEmailVerified: true,
  plan: 'free',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// API test helpers
export const mockApiResponse = (
  data: Record<string, unknown>,
  status = 200
) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

export const mockApiError = (message: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message })),
  } as Response);
};
