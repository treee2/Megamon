import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Моковые данные для учебного проекта
// В реальности парсинг Циан сложен и может нарушать ToS
const mockProperties = [
  {
    title: 'Уютная студия в центре',
    description: 'Современная студия с ремонтом, вся необходимая мебель и техника. Рядом метро, парки, магазины.',
    price: 2500,
    address: 'Москва, ул. Тверская, 12',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ]),
    rooms: 1,
    area: 30,
    floor: 5,
    totalFloors: 9
  },
  {
    title: 'Двухкомнатная квартира у метро',
    description: 'Просторная квартира в тихом районе. Отличное место для отдыха и работы.',
    price: 3500,
    address: 'Москва, ул. Ленина, 45',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
    ]),
    rooms: 2,
    area: 55,
    floor: 3,
    totalFloors: 12
  },
  {
    title: 'Квартира с видом на парк',
    description: 'Светлая квартира с панорамными окнами. Современный ремонт, вся техника.',
    price: 4000,
    address: 'Москва, Парковая аллея, 7',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'
    ]),
    rooms: 2,
    area: 65,
    floor: 8,
    totalFloors: 16
  },
  {
    title: 'Стильная студия для двоих',
    description: 'Компактная студия с продуманным дизайном. Все для комфортного проживания.',
    price: 2800,
    address: 'Москва, ул. Арбат, 23',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'
    ]),
    rooms: 1,
    area: 28,
    floor: 4,
    totalFloors: 7
  },
  {
    title: 'Трехкомнатная квартира для семьи',
    description: 'Большая квартира в спокойном районе. Детская площадка во дворе.',
    price: 5000,
    address: 'Москва, ул. Садовая, 56',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800'
    ]),
    rooms: 3,
    area: 85,
    floor: 6,
    totalFloors: 14
  },
  {
    title: 'Апартаменты в новостройке',
    description: 'Современные апартаменты с отличной инфраструктурой. Консьерж, парковка.',
    price: 4500,
    address: 'Москва, пр-т Мира, 101',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
      'https://images.unsplash.com/photo-1581404917879-44b5f0ddfa63?w=800',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800'
    ]),
    rooms: 2,
    area: 70,
    floor: 15,
    totalFloors: 25
  }
];

async function seedDatabase() {
  try {
    console.log('Очистка базы данных...');
    await prisma.booking.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.property.deleteMany();
    
    console.log('Добавление объявлений...');
    
    for (const property of mockProperties) {
      await prisma.property.create({
        data: property
      });
      console.log(`Добавлено: ${property.title}`);
    }
    
    console.log(`\nУспешно добавлено ${mockProperties.length} объявлений!`);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();