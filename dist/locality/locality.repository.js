import { Locality } from './locality.entities.js';
import { pool } from '../shared/db/dbConnection.js';
const localities = new Array();
export class LocalityRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM locality');
        return rows.map((row) => new Locality(row.id, row.name, row.postal_code, row.province));
    }
    async add(locality) {
        const [result] = await pool.query('INSERT INTO locality (name, postal_code, province) VALUES (?, ?, ?)', [locality.name, locality.postal_code, locality.province]);
        // Asigna el id generado por la base de datos
        locality.id = result.insertId;
        return locality;
    }
    async findOne(id) {
        const [rows] = await pool.query('SELECT * FROM locality WHERE id = ?', [id]);
        const row = rows[0];
        if (!row) {
            return undefined;
        }
        return new Locality(row.id, row.name, row.postal_code, row.province);
    }
    async remove(id) {
        const localityDelete = await this.findOne(id);
        if (!localityDelete) {
            return undefined;
        }
        const [result] = await pool.query('DELETE FROM locality WHERE id = ?', [id]);
        return localityDelete;
    }
    async update(newLocality) {
        const locality = await this.findOne(newLocality.id);
        if (!locality) {
            return undefined;
        }
        locality.name = newLocality.name || locality.name;
        locality.postal_code = newLocality.postal_code || locality.postal_code;
        locality.province = newLocality.province || locality.province;
        await pool.query('UPDATE locality SET name = ?, postal_code = ?, province = ? WHERE id = ?', [locality.name, locality.postal_code, locality.province, locality.id]);
        return locality;
    }
}
//# sourceMappingURL=locality.repository.js.map