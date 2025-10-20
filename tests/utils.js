/**
 * Test Utilities
 * Helper functions for PetID testing
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Ensure DFX replica is running
 */
export async function ensureDFXRunning() {
  try {
    execSync('dfx ping', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('🚀 Starting DFX replica...');
    execSync('dfx start --background', { stdio: 'inherit' });
    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 5000));
    return true;
  }
}

/**
 * Deploy canisters if needed
 */
export async function ensureCanistersDeployed() {
  try {
    const canisterIdsPath = '.dfx/local/canister_ids.json';
    
    if (!fs.existsSync(canisterIdsPath)) {
      console.log('📦 Deploying canisters...');
      execSync('dfx deploy', { stdio: 'inherit' });
    }
    
    const canisterIds = JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8'));
    return canisterIds;
  } catch (error) {
    console.error('❌ Failed to deploy canisters:', error);
    throw error;
  }
}

/**
 * Get canister IDs
 */
export function getCanisterIds() {
  try {
    const canisterIdsPath = '.dfx/local/canister_ids.json';
    if (fs.existsSync(canisterIdsPath)) {
      return JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error('❌ Failed to read canister IDs:', error);
    return {};
  }
}

/**
 * Mock pet data for testing
 */
export const mockPetData = {
  valid: {
    name: 'Test Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    birthDate: BigInt(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1 year ago
    color: 'Golden',
    weight: 25.5,
    microchipId: 'TC123456789',
    imageUrl: 'https://example.com/test-dog.jpg',
  },
  minimal: {
    name: 'Min Pet',
    species: 'Cat',
    birthDate: BigInt(Date.now()),
  },
  invalid: {
    name: '', // Empty name
    species: null,
    birthDate: 'invalid-date',
  }
};

/**
 * Mock medical records for testing
 */
export const mockMedicalData = {
  vaccination: {
    vaccine: 'Rabies',
    date: '2024-01-15',
    veterinarian: 'Dr. Test Smith',
    clinic: 'Test Animal Hospital',
    nextDue: '2025-01-15',
    batchNumber: 'VAC123456',
  },
  appointment: {
    date: '2024-02-20',
    time: '14:30',
    clinic: 'Test Pet Health Clinic',
    veterinarian: 'Dr. Jane Doe',
    reason: 'Annual checkup',
    notes: 'Regular health examination',
  }
};

/**
 * Mock user/principal data
 */
export const mockUserData = {
  testPrincipal: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  profile: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1-555-0123',
    address: '123 Test Street, Test City',
  }
};

/**
 * Mock AI chat data
 */
export const mockChatData = {
  userMessage: 'What should I feed my 6-month-old puppy?',
  expectedResponse: {
    sender: 'ai',
    message: 'For a 6-month-old puppy...',
    timestamp: Date.now(),
    confidence: 0.95,
  }
};

/**
 * Mock community data
 */
export const mockCommunityData = {
  post: {
    title: 'Dog Training Tips',
    content: 'Here are some effective training techniques...',
    author: 'test-user',
    timestamp: Date.now(),
    tags: ['training', 'dogs', 'tips'],
    likes: 0,
    comments: [],
  },
  event: {
    title: 'Pet Adoption Fair',
    description: 'Join us for our monthly pet adoption event',
    date: '2024-03-15',
    time: '10:00',
    location: 'City Park',
    organizer: 'Local Pet Shelter',
    attendees: [],
  }
};

/**
 * Validate file exists and is not empty
 */
export function validateFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error(`File is empty: ${filePath}`);
  }
  
  return true;
}

/**
 * Validate JSON file format
 */
export function validateJSONFile(filePath) {
  validateFileExists(filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    throw new Error(`Invalid JSON in file ${filePath}: ${error.message}`);
  }
}

/**
 * Clean up test environment
 */
export function cleanupTest() {
  // Remove any temporary test files
  const tempFiles = [
    'test-output.json',
    'temp-coverage.json',
  ];
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(condition, timeout = 10000, interval = 100) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Mock HTTP responses for testing
 */
export const mockResponses = {
  success: {
    status: 200,
    data: { success: true, message: 'Operation completed' }
  },
  error: {
    status: 500,
    error: 'Internal server error'
  },
  notFound: {
    status: 404,
    error: 'Resource not found'
  }
};

/**
 * Generate test coverage report path
 */
export function getCoverageReportPath() {
  return path.join(process.cwd(), 'coverage', 'index.html');
}

/**
 * Performance measurement utilities
 */
export const performance = {
  mark: (name) => {
    return {
      name,
      start: Date.now(),
      end: null,
      duration: null,
    };
  },
  
  measure: (mark) => {
    mark.end = Date.now();
    mark.duration = mark.end - mark.start;
    return mark;
  }
};

export default {
  ensureDFXRunning,
  ensureCanistersDeployed,
  getCanisterIds,
  mockPetData,
  mockMedicalData,
  mockUserData,
  mockChatData,
  mockCommunityData,
  validateFileExists,
  validateJSONFile,
  cleanupTest,
  waitFor,
  mockResponses,
  getCoverageReportPath,
  performance,
};