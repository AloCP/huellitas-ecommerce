const bcrypt = require('bcrypt');

class BcryptAdapter {
  static async hash(password) {
    return await bcrypt.hash(password, 10);
  }
  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = BcryptAdapter;
