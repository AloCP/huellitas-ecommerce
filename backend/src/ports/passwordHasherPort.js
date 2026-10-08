export class PasswordHasherPort {
  async hash() { throw new Error('Método hash no implementado'); }
  async compare() { throw new Error('Método compare no implementado'); }
}
