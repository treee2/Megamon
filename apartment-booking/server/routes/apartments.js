import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить список всех квартир
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM apartments ORDER BY created_date DESC');
    const apartments = stmt.all();
    
    const processedApartments = apartments.map(apt => ({
      ...apt,
      amenities: apt.amenities ? JSON.parse(apt.amenities) : [],
      is_available: Boolean(apt.is_available)
    }));
    
    res.json(processedApartments);
  } catch (error) {
    console.error('Ошибка при получении квартир:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить квартиру по ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM apartments WHERE id = ?');
    const apartment = stmt.get(id);
    
    if (!apartment) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }
    
    const processedApartment = {
      ...apartment,
      amenities: apartment.amenities ? JSON.parse(apartment.amenities) : [],
      is_available: Boolean(apartment.is_available)
    };
    
    res.json(processedApartment);
  } catch (error) {
    console.error('Ошибка при получении квартиры:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новую квартиру
router.post('/', (req, res) => {
  try {
    const {
      title,
      description,
      city,
      address,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      image_url,
      amenities,
      is_available,
      created_by
    } = req.body;
    
    console.log('Создание квартиры, размер данных:', JSON.stringify(req.body).length, 'байт');
    
    const id = generateId();
    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;
    
    const stmt = db.prepare(`
      INSERT INTO apartments (
        id, title, description, city, address, price_per_night,
        bedrooms, bathrooms, max_guests, image_url, amenities,
        is_available, moderation_status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, title, description, city, address, price_per_night,
      bedrooms, bathrooms, max_guests, image_url, amenitiesJson,
      is_available ? 1 : 0, 'pending', created_by
    );
    
    const newApartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    
    res.status(201).json({
      ...newApartment,
      amenities: newApartment.amenities ? JSON.parse(newApartment.amenities) : [],
      is_available: Boolean(newApartment.is_available)
    });
  } catch (error) {
    console.error('Ошибка при создании квартиры:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Обновить квартиру
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const apartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    if (!apartment) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }
    
    const updates = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key === 'amenities') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(updateData[key]));
      } else if (key === 'is_available') {
        updates.push(`${key} = ?`);
        values.push(updateData[key] ? 1 : 0);
      } else {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    updates.push('updated_date = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE apartments SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedApartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    
    res.json({
      ...updatedApartment,
      amenities: updatedApartment.amenities ? JSON.parse(updatedApartment.amenities) : [],
      is_available: Boolean(updatedApartment.is_available)
    });
  } catch (error) {
    console.error('Ошибка при обновлении квартиры:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить квартиру
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const apartment = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
    if (!apartment) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }
    
    db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
    
    res.json({ message: 'Квартира успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении квартиры:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;