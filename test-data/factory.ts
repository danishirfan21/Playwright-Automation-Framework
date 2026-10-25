import { faker } from '@faker-js/faker';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

// Centralizing generation here means a test never hardcodes "John/Doe/12345" —
// each test run gets unique, realistic data, and if the shape of checkout info
// ever changes, only this file needs updating instead of every test that fills it.
export function buildCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}
