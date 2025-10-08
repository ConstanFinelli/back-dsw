import {Pitch} from './pitch.entities.js'
import orm from '../shared/db/orm.js';

export class PitchRepository {
    public async findAll():Promise<Pitch[] | undefined>{
        const em = orm.em.fork(); // ← AGREGAR fork()
        const pitchs = await em.find(Pitch, {}, {populate:['business', 'reservations']})
        return pitchs as Pitch[];
    }
    
    public async findOne(id:number):Promise<Pitch | undefined>{
        const em = orm.em.fork(); // ← AGREGAR fork()
        const pitch = await em.findOneOrFail(Pitch, {id})
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
}

export const repository = new PitchRepository();