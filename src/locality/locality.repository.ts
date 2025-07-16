import {Locality} from './locality.entities.js';
import { pool } from '../shared/db/dbConnection.js';
import orm from '../shared/db/orm.js';

const em = orm.em

const localities= new Array<Locality>();

export class LocalityRepository {
    public async findAll(): Promise<Locality[]> {
        return await em.find(Locality, {});
    }

    public async add(locality: Locality): Promise<Locality> {
        await em.persistAndFlush(locality);
        return locality;
    }

    public async findOne(id: number): Promise<Locality | null> {
        return await em.findOne(Locality, { id });
    }

    public async remove(id: number): Promise<Locality | null> {
        const locality = await this.findOne(id);
        if (!locality) {
            return null;
        }
        await em.removeAndFlush(locality);
        return locality;
    }

    public async update(newLocality: Locality): Promise<Locality | null> {
        const locality = await this.findOne(newLocality.id);
        if (!locality) {
            return null;
        }
        locality.name = newLocality.name || locality.name;
        locality.postal_code = newLocality.postal_code || locality.postal_code;
        locality.province = newLocality.province || locality.province;

        await em.flush();
        return locality;
    }

}

