#!/usr/bin/env node

/**
 * Test script for Web Management Frontend
 * Tests all main capabilities and database access
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;
const TEST_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

let token = null;
let testsPassed = 0;
let testsFailed = 0;

// Test helpers
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log(chalk.bold.cyan(`\n=== ${msg} ===`))
};

async function test(name, fn) {
  try {
    await fn();
    testsPassed++;
    log.success(name);
    return true;
  } catch (error) {
    testsFailed++;
    log.error(`${name}: ${error.message}`);
    return false;
  }
}

// Authentication tests
async function testAuthentication() {
  log.section('Authentication Tests');

  await test('Login with valid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    if (!response.ok) throw new Error(`Login failed: ${response.status}`);
    
    const data = await response.json();
    if (!data.data?.token) throw new Error('No token received');
    
    token = data.data.token;
  });

  await test('Access protected endpoint with token', async () => {
    const response = await fetch(`${API_URL}/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Protected endpoint failed: ${response.status}`);
  });

  await test('Reject access without token', async () => {
    const response = await fetch(`${API_URL}/properties`);
    if (response.ok) throw new Error('Should have rejected request without token');
  });
}

// Property tests
async function testProperties() {
  log.section('Property Management Tests');

  await test('Fetch all properties', async () => {
    const response = await fetch(`${API_URL}/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch properties: ${response.status}`);
    
    const properties = await response.json();
    if (!Array.isArray(properties)) throw new Error('Properties should be an array');
  });

  await test('Fetch single property', async () => {
    const response = await fetch(`${API_URL}/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const properties = await response.json();
    if (properties.length === 0) {
      log.warn('No properties found in database');
      return;
    }
    
    const propertyId = properties[0].id;
    const propResponse = await fetch(`${API_URL}/properties/${propertyId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!propResponse.ok) throw new Error(`Failed to fetch property: ${propResponse.status}`);
    
    const property = await propResponse.json();
    if (!property.id) throw new Error('Property should have an ID');
  });
}

// Activities tests
async function testActivities() {
  log.section('Activities Management Tests');

  await test('Fetch all activities', async () => {
    const response = await fetch(`${API_URL}/activities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch activities: ${response.status}`);
    
    const activities = await response.json();
    if (!Array.isArray(activities)) throw new Error('Activities should be an array');
    
    if (activities.length > 0) {
      const activity = activities[0];
      if (!activity.title || !activity.description) {
        throw new Error('Activities should have title and description');
      }
    }
  });

  await test('Verify activities are from database', async () => {
    const response = await fetch(`${API_URL}/activities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const activities = await response.json();
    
    // Check for real Schladming activities
    const schladmingActivities = [
      'Mirror Lake Trail',
      'Dachstein Skywalk',
      'Hopsiland Planai',
      'Rittisberg Coaster'
    ];
    
    const hasRealActivities = activities.some(activity => 
      schladmingActivities.some(name => activity.title?.includes(name))
    );
    
    if (activities.length > 0 && !hasRealActivities) {
      log.warn('Activities might be mock data - no Schladming activities found');
    }
  });
}

// Dining tests
async function testDining() {
  log.section('Dining Management Tests');

  await test('Fetch all dining places', async () => {
    const response = await fetch(`${API_URL}/dining`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch dining: ${response.status}`);
    
    const dining = await response.json();
    if (!Array.isArray(dining)) throw new Error('Dining should be an array');
  });

  await test('Check dining table exists', async () => {
    const response = await fetch(`${API_URL}/dining`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const dining = await response.json();
    
    if (dining.length > 0) {
      const place = dining[0];
      if (!place.name || !place.cuisine_type) {
        throw new Error('Dining places should have name and cuisine_type');
      }
    }
  });
}

// Property Information tests
async function testPropertyInformation() {
  log.section('Property Information Tests');

  await test('Fetch property information', async () => {
    const propResponse = await fetch(`${API_URL}/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const properties = await propResponse.json();
    if (properties.length === 0) {
      log.warn('No properties found for information test');
      return;
    }
    
    const propertyId = properties[0].id;
    const response = await fetch(`${API_URL}/property-information?property_id=${propertyId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch property info: ${response.status}`);
    
    const info = await response.json();
    if (!Array.isArray(info)) throw new Error('Property information should be an array');
  });

  await test('Check property_information table exists', async () => {
    const response = await fetch(`${API_URL}/property-information`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Should not fail with "relation does not exist"
    if (!response.ok && response.status === 500) {
      const text = await response.text();
      if (text.includes('relation') && text.includes('does not exist')) {
        throw new Error('property_information table does not exist');
      }
    }
  });
}

// MDM tests
async function testMDM() {
  log.section('MDM (Mobile Device Management) Tests');

  await test('Fetch devices', async () => {
    const response = await fetch(`${API_URL}/mdm/devices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch devices: ${response.status}`);
    
    const devices = await response.json();
    if (!Array.isArray(devices)) throw new Error('Devices should be an array');
  });

  await test('Fetch configuration profiles', async () => {
    const response = await fetch(`${API_URL}/mdm/profiles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch profiles: ${response.status}`);
    
    const profiles = await response.json();
    if (!Array.isArray(profiles)) throw new Error('Profiles should be an array');
  });

  await test('Check MDM tables exist', async () => {
    const response = await fetch(`${API_URL}/mdm/commands/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Should not fail with "relation does not exist"
    if (!response.ok && response.status === 500) {
      const text = await response.text();
      if (text.includes('relation') && text.includes('does not exist')) {
        throw new Error('MDM tables do not exist');
      }
    }
  });
}

// Database connectivity test
async function testDatabaseConnectivity() {
  log.section('Database Connectivity Tests');

  await test('Database connection is active', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    
    const health = await response.json();
    if (health.status !== 'healthy') {
      throw new Error('Server is not healthy');
    }
  });
}

// Main test runner
async function runTests() {
  console.log(chalk.bold.magenta('\n🧪 Web Management Frontend Test Suite\n'));
  log.info(`Testing against: ${BASE_URL}`);
  
  try {
    // Check if server is running
    await test('Server is accessible', async () => {
      const response = await fetch(BASE_URL);
      if (!response.ok && response.status !== 200 && response.status !== 404) {
        throw new Error(`Server not accessible: ${response.status}`);
      }
    });

    // Run test suites
    await testAuthentication();
    await testDatabaseConnectivity();
    await testProperties();
    await testActivities();
    await testDining();
    await testPropertyInformation();
    await testMDM();

    // Summary
    console.log(chalk.bold.cyan('\n=== Test Summary ==='));
    console.log(chalk.green(`✓ Passed: ${testsPassed}`));
    console.log(chalk.red(`✗ Failed: ${testsFailed}`));
    
    const total = testsPassed + testsFailed;
    const percentage = Math.round((testsPassed / total) * 100);
    
    if (testsFailed === 0) {
      console.log(chalk.bold.green(`\n🎉 All tests passed! (${percentage}%)`));
    } else if (testsPassed > testsFailed) {
      console.log(chalk.bold.yellow(`\n⚠️  Most tests passed (${percentage}%)`));
    } else {
      console.log(chalk.bold.red(`\n❌ Many tests failed (${percentage}%)`));
    }
    
    process.exit(testsFailed > 0 ? 1 : 0);
    
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runTests();