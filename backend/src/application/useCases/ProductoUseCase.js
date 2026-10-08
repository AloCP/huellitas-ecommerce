import { Producto } from '../../domain/entities/Producto.js';

export class ProductoUseCase {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async crear(data) {
    const producto = new Producto(data);
    return this.productoRepository.create(producto);
  }

  async listar() {
    return this.productoRepository.findAll();
  }

  async obtener(id) {
    return this.productoRepository.findById(id);
  }

  async actualizar(id, data) {
    if (data.precio !== undefined && Number(data.precio) <= 0) {
      throw new Error('El precio debe ser mayor que cero');
    }
    if (
      data.stock !== undefined &&
      (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0)
    ) {
      throw new Error('El stock debe ser un entero mayor o igual a cero');
    }

    return this.productoRepository.update(id, data);
  }

  async eliminar(id) {
    return this.productoRepository.delete(id);
  }
}
