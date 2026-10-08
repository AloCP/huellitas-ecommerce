import bcrypt from 'bcrypt';

export class BcryptAdapter {
  async hash(password) {
    return bcrypt.hash(password, 10);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default BcryptAdapter;
