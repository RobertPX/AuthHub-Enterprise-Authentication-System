import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  generateTokenPair,
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
} from '@/lib/jwt';

describe('JWT Module', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include payload data in the token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a random refresh token', () => {
      const token = generateRefreshToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(32);
    });

    it('should generate unique tokens each time', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyAccessToken('');
      expect(decoded).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = generateAccessToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = verifyAccessToken(tamperedToken);
      expect(decoded).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should return both access and refresh tokens', () => {
      const pair = generateTokenPair(testPayload);
      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.expiresAt).toBeDefined();
    });

    it('should set expiration date in the future', () => {
      const pair = generateTokenPair(testPayload);
      expect(pair.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Token Expiry Helpers', () => {
    it('getAccessTokenExpiry should return a positive number', () => {
      const expiry = getAccessTokenExpiry();
      expect(expiry).toBeGreaterThan(0);
    });

    it('getRefreshTokenExpiry should return a positive number', () => {
      const expiry = getRefreshTokenExpiry();
      expect(expiry).toBeGreaterThan(0);
    });

    it('refresh token expiry should be longer than access token', () => {
      const accessExpiry = getAccessTokenExpiry();
      const refreshExpiry = getRefreshTokenExpiry();
      expect(refreshExpiry).toBeGreaterThan(accessExpiry);
    });
  });
});
