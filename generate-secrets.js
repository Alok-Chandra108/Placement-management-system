#!/usr/bin/env node
/**
 * JWT Secret Generator - Run this to generate cryptographically secure secrets
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('='.repeat(60));
console.log('CRYPTOGRAPHICALLY SECURE SECRET GENERATOR');
console.log('='.repeat(60));
console.log('');
console.log('JWT_ACCESS_SECRET (64 hex chars = 256 bits):');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('');
console.log('JWT_REFRESH_SECRET (64 hex chars = 256 bits):');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('');
console.log('='.repeat(60));
console.log('COPY THESE VALUES TO YOUR .env FILE');
console.log('='.repeat(60));
console.log('');
console.log('Example .env entries:');
console.log('JWT_ACCESS_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('');
console.log('⚠️  IMPORTANT: Run this script TWICE to get two DIFFERENT secrets!');
console.log('   Do NOT use the same secret for both access and refresh tokens.');
