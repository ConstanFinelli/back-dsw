import { EntityManager } from '@mikro-orm/core';
import { User } from '../../user/user.entities.js';
import { Category } from '../../category/category.entities.js';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder {
  
  /**
   * Ejecuta el seeding inicial de la base de datos
   * Este método solo debe ejecutarse cuando se crea la base de datos por primera vez
   */
  static async seedInitialData(em: EntityManager): Promise<void> {
    console.log('🌱 Iniciando seeding de la base de datos...');

    try {
      // Verificar si ya existe algún usuario admin para evitar duplicados
      const existingAdmin = await em.findOne(User, { email: 'admin@sistema.com' });
      
      if (existingAdmin) {
        console.log('✅ Usuario admin ya existe, saltando seeding inicial');
        return;
      }

      // Crear categoria cliente si no existe
      let clientCategory = await em.findOne(Category, { usertype: 'client' });
      if (!clientCategory) {
        clientCategory = new Category('Categoría de cliente del sistema', 'client');
        em.persist(clientCategory);
        console.log('📁 Categoría cliente creada');
      }

      // Crear categoría dueño si no existe
      let ownerCategory = await em.findOne(Category, { usertype: 'business_owner' });
      if (!ownerCategory) {
        ownerCategory = new Category('Categoría de dueño de negocio', 'business_owner');
        em.persist(ownerCategory);
        console.log('📁 Categoría dueño creada');
      }

      // Crear categoría admin si no existe
      let adminCategory = await em.findOne(Category, { usertype: 'admin' });
      
      if (!adminCategory) {
        adminCategory = new Category('Categoría de administrador del sistema', 'admin');
        em.persist(adminCategory);
        console.log('📁 Categoría admin creada');
      }

      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = em.create(User, {
        name: 'Administrador',
        surname: 'Sistema',
        email: 'admin@sistema.com',
        password: hashedPassword,
        category: adminCategory,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      em.persist(adminUser);
      await em.flush();

      console.log('👤 Usuario admin creado exitosamente');
      console.log('📧 Email: admin@sistema.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
      
    } catch (error) {
      console.error('❌ Error durante el seeding inicial:', error);
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
