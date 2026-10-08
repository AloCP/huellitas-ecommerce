import { Usuario } from '../../domain/entities/Usuario.js';

export class UsuarioUseCase {
  constructor(usuarioRepository, passwordHasher) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async crear({ nombre, email, password, rol = 'USER' }) {
    const usuario = new Usuario({ nombre, email, rol });
    Usuario.validarPassword(password);

    const existente = await this.usuarioRepository.findByEmail(usuario.email);
    if (existente) throw new Error('El correo ya está registrado');

    const password_hash = await this.passwordHasher.hash(password);

    return this.usuarioRepository.create({
      nombre: usuario.nombre,
      email: usuario.email,
      password_hash,
      rol: usuario.rol
    });
  }

  async listar() {
    return this.usuarioRepository.findAll();
  }

  async obtener(id) {
    return this.usuarioRepository.findById(id);
  }

  async actualizar(id, data) {
    const cambios = { ...data };

    if (cambios.password !== undefined) {
      Usuario.validarPassword(cambios.password);
      cambios.password_hash = await this.passwordHasher.hash(cambios.password);
      delete cambios.password;
    }

    if (cambios.email) cambios.email = cambios.email.trim().toLowerCase();

    return this.usuarioRepository.update(id, cambios);
  }

  async eliminar(id) {
    return this.usuarioRepository.delete(id);
  }

  async login({ email, password }) {
    const usuario = await this.usuarioRepository.findByEmail(
      String(email || '').trim().toLowerCase()
    );

    if (!usuario) throw new Error('Credenciales incorrectas');

    const coincide = await this.passwordHasher.compare(password || '', usuario.password_hash);
    if (!coincide) throw new Error('Credenciales incorrectas');

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
  }
}
