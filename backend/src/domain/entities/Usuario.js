export class Usuario {
  constructor({ id = null, nombre, email, rol = 'USER' }) {
    if (!nombre || !nombre.trim()) throw new Error('El nombre es obligatorio');
    if (!email || !email.includes('@')) throw new Error('El correo no es válido');
    if (!['USER', 'ADMIN'].includes(rol)) throw new Error('Rol no válido');

    this.id = id;
    this.nombre = nombre.trim();
    this.email = email.trim().toLowerCase();
    this.rol = rol;
  }

  static validarPassword(password) {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  }
}
