import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NodemailerAdapter } from './src/adapters/nodemailerAdapter.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const emailAdapter = new NodemailerAdapter();

// Ruta GET de prueba
app.get('/api', (req, res) => {
  res.json({ message: 'API de Huellitas E-commerce lista y funcionando' });
});

// Ruta POST para compras y envío de notificaciones
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, userEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos' });
    }

    const orderId = Math.floor(100000 + Math.random() * 900000);
    const destEmail = userEmail || process.env.ADMIN_EMAIL || 'brice.pfeffer@ethereal.email';

    // Generar formato HTML de los productos
    const itemsHtml = items
      .map(item => `<li><strong>${item.nombre}</strong> (x${item.cantidad || 1}) - $${(item.precio * (item.cantidad || 1)).toFixed(2)}</li>`)
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #4f46e5; text-align: center;">🐾 ¡Gracias por tu compra en Huellitas!</h2>
        <p>Tu pedido <strong>#${orderId}</strong> ha sido procesado exitosamente.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <h3>Resumen del Pedido:</h3>
        <ul>${itemsHtml}</ul>
        <h3 style="color: #16a34a;">Total Pagado: $${total.toFixed(2)}</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p style="font-size: 0.85rem; color: #666; text-align: center;">Mensaje automático de confirmación - Huellitas E-commerce.</p>
      </div>
    `;

    // Enviar correo
    await emailAdapter.sendEmail({
      to: destEmail,
      subject: `Confirmación de Compra #${orderId} - Huellitas`,
      html: htmlContent
    });

    res.status(201).json({
      success: true,
      message: 'Compra procesada y correo enviado exitosamente',
      order: { id: orderId, total }
    });
  } catch (error) {
    console.error('Error al procesar la orden:', error);
    res.status(500).json({ error: 'Error al enviar la notificación por correo' });
  }
});

const PORT = process.env.PORT || 3001;
// Escuchar en 0.0.0.0 para que la conexión funcione correctamente entre WSL2 y Windows
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend de Huellitas corriendo en http://localhost:${PORT}`);
});