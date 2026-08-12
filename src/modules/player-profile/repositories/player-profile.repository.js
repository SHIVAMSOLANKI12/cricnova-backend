/**
 * -----------------------------------------------------------------------------
 * File: player-profile.repository.js
 * Description: Enterprise Cricket Player Profile Repository
 * -----------------------------------------------------------------------------
 */

import BaseRepository from '../../../core/database/base.repository.js';

class PlayerProfileRepository extends BaseRepository {
  constructor() {
    super('playerProfile');
  }

  /**
   * Find player profile by User ID.
   */
  async findByUserId(userId, tx = null, options = {}) {
    const client = tx ? tx.playerProfile || tx : this.model;

    return client.findUnique({
      where: {
        userId,
      },
      ...options,
    });
  }

  /**
   * Find player profile by Player Profile ID.
   */
  async findById(id, tx = null, options = {}) {
    return super.findById(id, tx, options);
  }

  /**
   * Create player profile.
   */
  async createProfile(data, tx = null, options = {}) {
    return super.create(data, tx, options);
  }

  /**
   * Update player profile by User ID.
   */
  async updateByUserId(userId, data, tx = null, options = {}) {
    return super.update(
      {
        userId,
      },
      data,
      tx,
      options
    );
  }
}

export default new PlayerProfileRepository();
