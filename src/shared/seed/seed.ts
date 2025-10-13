import { EntityManager } from '@mikro-orm/core';
import { User } from '../../user/user.entities.js';
import { Category } from '../../category/category.entities.js';
import { Locality } from '../../locality/locality.entities.js';
import { Business } from '../../business/business.entities.js';
import { Pitch } from '../../pitch/pitch.entities.js';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder {
  
  /**
   * Ejecuta el seeding inicial de la base de datos
   * Este método solo debe ejecutarse cuando se crea la base de datos por primera vez
   */
  static async seedInitialData(em: EntityManager): Promise<void> {
    console.log('Iniciando seeding de la base de datos...');

    try {
      // Verificar si ya existe algún usuario admin para evitar duplicados
      const existingAdmin = await em.findOne(User, { email: 'admin@sistema.com' });
      
      if (existingAdmin) {
        console.log('Usuario admin ya existe, saltando seeding inicial');
        return;
      }

      // Crear las tres categorías necesarias si no existen
      const categoriesToCreate = [
        {
          usertype: 'user',
          description: 'Categoría de usuario cliente del sistema'
        },
        {
          usertype: 'business_owner',
          description: 'Categoría de dueño de negocio'
        },
        {
          usertype: 'admin',
          description: 'Categoría de administrador del sistema'
        }
      ];

      const createdCategories: { [key: string]: Category } = {};

      for (const categoryData of categoriesToCreate) {
        let category = await em.findOne(Category, { usertype: categoryData.usertype });
        
        if (!category) {
          category = new Category(categoryData.description, categoryData.usertype);
          em.persist(category);
          console.log(`Categoría ${categoryData.usertype} creada`);
        } else {
          console.log(`Categoría ${categoryData.usertype} ya existe`);
        }
        
        createdCategories[categoryData.usertype] = category;
      }

      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = em.create(User, {
        name: 'Administrador',
        surname: 'Sistema',
        email: 'admin@sistema.com',
        password: hashedPassword,
        category: createdCategories.admin,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      em.persist(adminUser);
      await em.flush();

      console.log('Usuario admin creado exitosamente');
      console.log('Email: admin@sistema.com');
      console.log('Password: admin123');
      console.log('IMPORTANTE: Cambia la contraseña después del primer login');
      console.log('Seeding completado exitosamente');
      
    } catch (error) {
      console.error('Error durante el seeding inicial:', error);
      throw error;
    }
  }

  /**
   * Verifica si la base de datos necesita seeding inicial
   * comprobando si existen usuarios en el sistema
   */
  static async needsInitialSeeding(em: EntityManager): Promise<boolean> {
    try {
      const userCount = await em.count(User);
      return userCount === 0;
    } catch (error) {
      // Si hay error al contar usuarios, probablemente las tablas no existen aún
      return true;
    }
  }
}