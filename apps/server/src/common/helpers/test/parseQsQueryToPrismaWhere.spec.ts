import { parseQsQueryToPrismaWhere } from '../parsers';

/**
 * NOTE: The current implementation uses !value to filter out "falsy" values:
 * - Filters out: false, 0, "", null, undefined, NaN
 * - Keeps: true, non-zero numbers, non-empty strings, arrays with content, objects with properties
 *
 * This is more intuitive behavior for filtering "empty" values in query filters.
 */
describe('parseQsQueryToPrismaWhere', () => {
  describe('when filters is empty or undefined', () => {
    it('should return undefined when filters is undefined', () => {
      const result = parseQsQueryToPrismaWhere(undefined as any);
      expect(result).toBeUndefined();
    });

    it('should return undefined when filters is null', () => {
      const result = parseQsQueryToPrismaWhere(null as any);
      expect(result).toBeUndefined();
    });

    it('should return undefined when filters is an empty object', () => {
      const result = parseQsQueryToPrismaWhere({});
      expect(result).toBeUndefined();
    });

    it('should return empty object when filters contains only empty values', () => {
      const result = parseQsQueryToPrismaWhere({
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
      });
      expect(result).toEqual({});
    });
  });

  describe('special field handling', () => {
    it('should transform q field with string value to contains with insensitive mode', () => {
      const filters = {
        q: 'search term',
        name: 'John Doe',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        q: {
          contains: 'search term',
          mode: 'insensitive',
        },
        name: 'John Doe',
      });
    });

    it('should transform q field with number value to contains with insensitive mode', () => {
      const filters = {
        q: 123,
        name: 'John',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        q: {
          contains: '123',
          mode: 'insensitive',
        },
        name: 'John',
      });
    });

    it('should not transform q field if it is not string or number', () => {
      const filters = {
        q: { complex: 'object' },
        name: 'John Doe',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        q: { complex: 'object' },
        name: 'John Doe',
      });
    });
  });

  describe('when filters contains primitive values', () => {
    it('should return the same object for string values', () => {
      const filters = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should return the same object for number values', () => {
      const filters = {
        age: 25,
        score: 100,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should return the same object for boolean values (keeping true, filtering false)', () => {
      const filters = {
        isActive: true,
        isDeleted: false,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        isActive: true,
      });
    });

    it('should keep all non-falsy values when mixed', () => {
      const filters = {
        name: 'John Doe',
        age: 25,
        isActive: true,
        isDeleted: false,
        score: 0,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        name: 'John Doe',
        age: 25,
        isActive: true,
      });
    });
  });

  describe('when filters contains nested objects', () => {
    it('should recursively map nested objects', () => {
      const filters = {
        user: {
          name: 'John Doe',
          age: 25,
        },
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle deeply nested objects', () => {
      const filters = {
        user: {
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
          settings: {
            theme: 'dark',
          },
        },
        isActive: true,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle nested objects with mixed primitive types', () => {
      const filters = {
        user: {
          name: 'John',
          age: 25,
          isActive: true,
        },
        metadata: {
          created: '2023-01-01',
          version: 1,
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });
  });

  describe('when filters contains arrays', () => {
    it('should map arrays of primitive values', () => {
      const filters = {
        tags: ['tag1', 'tag2', 'tag3'],
        scores: [100, 200, 300],
        flags: [true, false, true],
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should map arrays of objects', () => {
      const filters = {
        users: [
          { name: 'John', age: 25 },
          { name: 'Jane', age: 30 },
        ],
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle nested arrays', () => {
      const filters = {
        categories: [
          {
            name: 'Tech',
            subcategories: ['Web', 'Mobile'],
          },
          {
            name: 'Business',
            subcategories: ['Finance', 'Marketing'],
          },
        ],
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should filter out empty arrays', () => {
      const filters = {
        tags: [],
        users: [],
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        status: 'active',
      });
    });
  });

  describe('when filters contains complex nested structures', () => {
    it('should handle complex nested objects with arrays', () => {
      const filters = {
        user: {
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: [true, false, true],
          },
          roles: [
            { name: 'admin', level: 1 },
            { name: 'user', level: 2 },
          ],
        },
        metadata: {
          tags: ['important', 'urgent'],
          created: '2023-01-01',
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle arrays of complex objects (filtering out false values)', () => {
      const filters = {
        products: [
          {
            name: 'Product 1',
            details: {
              price: 100,
              inStock: true,
            },
            tags: ['electronics', 'gadgets'],
          },
          {
            name: 'Product 2',
            details: {
              price: 200,
              inStock: false,
            },
            tags: ['clothing', 'fashion'],
          },
        ],
        filter: {
          category: 'electronics',
          minPrice: 50,
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        products: [
          {
            name: 'Product 1',
            details: {
              price: 100,
              inStock: true,
            },
            tags: ['electronics', 'gadgets'],
          },
          {
            name: 'Product 2',
            details: {
              price: 200,
            },
            tags: ['clothing', 'fashion'],
          },
        ],
        filter: {
          category: 'electronics',
          minPrice: 50,
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle filters with null values', () => {
      const filters = {
        name: 'John',
        description: null,
        age: 25,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        name: 'John',
        description: null,
        age: 25,
      });
    });

    it('should handle filters with undefined values', () => {
      const filters = {
        name: 'John',
        description: undefined,
        age: 25,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        name: 'John',
        age: 25,
      });
    });

    it('should skip empty values but keep non-empty ones', () => {
      const filters = {
        name: 'John',
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
        age: 25,
        nullValue: null,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        name: 'John',
        age: 25,
        nullValue: null,
      });
    });

    it('should filter out empty strings', () => {
      const filters = {
        name: '',
        email: 'john@example.com',
        description: '',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        email: 'john@example.com',
      });
    });

    it('should filter out zero values but keep true booleans', () => {
      const filters = {
        count: 0,
        score: 0,
        isActive: true,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        isActive: true,
      });
    });

    it('should keep negative numbers and true booleans', () => {
      const filters = {
        balance: -100,
        temperature: -5,
        isActive: true,
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });
  });

  describe('nested and complex where objects', () => {
    it('should handle deeply nested where conditions', () => {
      const filters = {
        user: {
          profile: {
            name: { contains: 'John' },
            age: { gte: 18, lte: 65 },
          },
          settings: {
            theme: 'dark',
            notifications: { enabled: true },
          },
        },
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle complex AND/OR conditions', () => {
      const filters = {
        AND: [
          { name: { contains: 'John' } },
          {
            OR: [{ age: { gte: 18 } }, { isVip: true }],
          },
        ],
        NOT: { isDeleted: true },
        status: { in: ['active', 'pending'] },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle nested arrays with complex objects', () => {
      const filters = {
        products: [
          {
            name: { contains: 'laptop' },
            price: { gte: 1000, lte: 5000 },
            tags: { has: 'electronics' },
          },
          {
            name: { contains: 'phone' },
            price: { gte: 500, lte: 2000 },
            tags: { has: 'mobile' },
          },
        ],
        category: { in: ['electronics', 'gadgets'] },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle complex date range filters', () => {
      const filters = {
        createdAt: {
          gte: '2023-01-01T00:00:00Z',
          lte: '2023-12-31T23:59:59Z',
        },
        updatedAt: {
          gte: '2023-06-01T00:00:00Z',
        },
        metadata: {
          source: { in: ['web', 'mobile'] },
          version: { gte: 2 },
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle mixed primitive and complex nested structures', () => {
      const filters = {
        q: 'search term',
        user: {
          name: 'John Doe',
          profile: {
            age: 25,
            preferences: {
              theme: 'dark',
              notifications: [true, false],
            },
          },
          roles: [
            { name: 'admin', level: 1 },
            { name: 'user', level: 2 },
          ],
        },
        filters: {
          status: { in: ['active', 'pending'] },
          tags: { has: 'important' },
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        q: {
          contains: 'search term',
          mode: 'insensitive',
        },
        user: {
          name: 'John Doe',
          profile: {
            age: 25,
            preferences: {
              theme: 'dark',
              notifications: [true, false],
            },
          },
          roles: [
            { name: 'admin', level: 1 },
            { name: 'user', level: 2 },
          ],
        },
        filters: {
          status: { in: ['active', 'pending'] },
          tags: { has: 'important' },
        },
      });
    });

    it('should handle empty values in nested structures', () => {
      const filters = {
        user: {
          name: 'John',
          emptyString: '',
          emptyArray: [],
          profile: {
            age: 25,
            emptyObject: {},
            preferences: {
              theme: 'dark',
              emptyNested: '',
            },
          },
        },
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual({
        user: {
          name: 'John',
          profile: {
            age: 25,
            preferences: {
              theme: 'dark',
            },
          },
        },
        status: 'active',
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle user search filters', () => {
      const filters = {
        name: { contains: 'John' },
        email: { contains: '@example.com' },
        age: { gte: 18, lte: 65 },
        isActive: true,
        role: { in: ['admin', 'user'] },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle product filters', () => {
      const filters = {
        category: 'electronics',
        price: { gte: 100, lte: 1000 },
        inStock: true,
        tags: { has: 'wireless' },
        ratings: { gte: 4.0 },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle date range filters', () => {
      const filters = {
        createdAt: {
          gte: '2023-01-01T00:00:00Z',
          lte: '2023-12-31T23:59:59Z',
        },
        updatedAt: {
          gte: '2023-06-01T00:00:00Z',
        },
        status: 'active',
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });

    it('should handle complex query filters', () => {
      const filters = {
        AND: [
          { name: { contains: 'John' } },
          { OR: [{ age: { gte: 18 } }, { isVip: true }] },
        ],
        NOT: { isDeleted: true },
        status: { in: ['active', 'pending'] },
      };
      const result = parseQsQueryToPrismaWhere(filters);
      expect(result).toEqual(filters);
    });
  });

  describe('type safety', () => {
    it('should preserve the exact structure and types', () => {
      const filters = {
        stringField: 'value',
        numberField: 42,
        booleanField: true,
        arrayField: [1, 2, 3],
        objectField: {
          nestedString: 'nested',
          nestedNumber: 10,
        },
      };
      const result = parseQsQueryToPrismaWhere(filters);

      expect(result).toEqual(filters);
      expect(result).toBeDefined();
      expect(typeof result!.stringField).toBe('string');
      expect(typeof result!.numberField).toBe('number');
      expect(typeof result!.booleanField).toBe('boolean');
      expect(Array.isArray(result!.arrayField)).toBe(true);
      expect(typeof result!.objectField).toBe('object');
    });
  });
});
