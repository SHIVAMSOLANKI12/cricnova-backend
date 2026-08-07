/**
 * -----------------------------------------------------------------------------
 * File: base.repository.js
 * Description:
 * Enterprise Generic Base Repository
 *
 * Responsibilities:
 * - Standard CRUD Operations
 * - Pagination
 * - Transactions
 * - Soft Delete Ready
 * - Prisma Wrapper
 * - Reusable Across All Modules
 *
 * NOTE:
 * No business logic should be written here.
 * -----------------------------------------------------------------------------
 */

import prisma from './prisma.client.js';

export default class BaseRepository {
  constructor(modelName) {
    if (!modelName) {
      throw new Error('Prisma model name is required.');
    }

    if (!prisma[modelName]) {
      throw new Error(`Prisma model "${modelName}" not found.`);
    }

    this.modelName = modelName;
    this.model = prisma[modelName];
  }

  async create(data, tx = null, options = {}) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.create({
      data,
      ...options,
    });
  }

  async findById(id, tx = null, options = {}) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.findUnique({
      where: { id },
      ...options,
    });
  }

  async findOne(where, tx = null, options = {}) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.findFirst({
      where,
      ...options,
    });
  }

  async findMany(options = {}, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.findMany(options);
  }

  async update(where, data, tx = null, options = {}) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.update({
      where,
      data,
      ...options,
    });
  }

  async updateMany(where, data, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.updateMany({
      where,
      data,
    });
  }

  async delete(where, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.delete({
      where,
    });
  }

  async deleteMany(where, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;
    return client.deleteMany({
      where,
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Count Records
   * -------------------------------------------------------------------------
   */
  async count(where = {}, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;

    return client.count({
      where,
    });
  }

  /**
   * -------------------------------------------------------------------------
   * Exists
   * -------------------------------------------------------------------------
   */
  async exists(where, tx = null) {
    const client = tx ? tx[this.modelName] || tx : this.model;

    const count = await client.count({
      where,
      take: 1,
    });

    return count > 0;
  }

  /**
   * -------------------------------------------------------------------------
   * Pagination
   * -------------------------------------------------------------------------
   */
  async paginate(
    {
      where = {},
      page = 1,
      limit = 20,
      orderBy = {
        createdAt: 'desc',
      },
      include,
      select,
    } = {},
    tx = null
  ) {
    const client = tx ? tx[this.modelName] || tx : this.model;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      client.findMany({
        where,

        skip,

        take: limit,

        orderBy,

        include,

        select,
      }),

      client.count({
        where,
      }),
    ]);

    return {
      items,

      meta: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),

        hasNextPage: page * limit < total,

        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Generic Transaction Support
   */
  async transaction(callback) {
    return prisma.$transaction(callback);
  }
}
