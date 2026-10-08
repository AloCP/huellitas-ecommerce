export class Producto {
  constructor({
    id = null,
    nombre,
    descripcion = '',
    precio,
    stock
  }) {
    if (!nombre || !nombre.trim()) {
      throw new Error('El nombre del producto es obligatorio');
    }

    if (Number(precio) <= 0) {
      throw new Error('El precio debe ser mayor que cero');
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a cero');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion || '';
    this.precio = Number(precio);
    this.stock = Number(stock);
  }
}
