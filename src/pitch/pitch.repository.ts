import {Pitch} from './pitch.entities.js'
import orm from '../shared/db/orm.js';
import { populate } from 'dotenv';

export class PitchRepository {
    public async findAll():Promise<Pitch[] | undefined>{
        const em = orm.em.fork(); // ← AGREGAR fork()
        const pitchs = await em.find(Pitch, {}, {populate:['business', 'reservations']})
        return pitchs as Pitch[];
    }

    public async findByBusinessId(businessId:number):Promise<Pitch[] | undefined>{
        const em = orm.em.fork(); 
        const pitchs = await em.find(Pitch, {business: businessId}, {populate:['business', 'reservations']})
        return pitchs as Pitch[];
    }
    
    public async findOne(id:number):Promise<Pitch | undefined>{
        const em = orm.em.fork(); // ← AGREGAR fork()
        const pitch = await em.findOneOrFail(Pitch, {id}, {populate:['business']})
        return pitch as Pitch
    }
    
    public async add(pitch:Pitch):Promise<Pitch | undefined>{
        const em = orm.em.fork(); // ← AGREGAR fork()
        const pitchCreated = await em.create(Pitch, pitch)
        await em.flush()
        return pitchCreated as Pitch
    }
    
    public async remove(id:number){
        const em = orm.em.fork(); // ← AGREGAR fork()
        const removedPitch= await em.getReference(Pitch, id)
        await em.removeAndFlush(removedPitch)
        return removedPitch as Pitch
    }
    
    public async update(id:number ,newPitch:Pitch){
        const em = orm.em.fork(); // ← AGREGAR fork()
        const updatedPitch = await em.findOneOrFail(Pitch, {id})
        em.assign(updatedPitch, newPitch)
        await em.flush()
        return updatedPitch as Pitch
    }
    public async findAllFromActiveBusinesses():Promise<Pitch[] | undefined>{
        const em = orm.em.fork();
        const pitchs = await em.findAll(Pitch,{populate:['business'] });
        const filtered = pitchs.filter(pitch => pitch.business.active);
        return filtered as Pitch[];
    }
}

export const repository = new PitchRepository();