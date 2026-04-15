import {Pitch} from './pitch.entities.js'
import orm from '../shared/db/orm.js';
import { FilterQuery } from '@mikro-orm/core';

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

    /** Devuelve true si el `userId` es el owner del negocio asociado a la pitch */
    public async isOwnedBy(pitchId: number, userId: number): Promise<boolean> {
        const em = orm.em.fork();
        // Buscar pitch cuyo business.owner tenga id = userId
        const pitch = await em.findOne(Pitch, { id: pitchId, business: { owner: userId } });
        return !!pitch;
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

    /**
     * Filtrado mediante query params simples y paginación.
     * Soporta: q, size, groundType, roof, priceMin, priceMax, ratingMin, businessId, page, limit, sort
     */
    public async findFiltered(filters: any): Promise<{ data: Pitch[]; total: number }>{
        const em = orm.em.fork();
        const where: any = {};

        if (filters.size) where.size = String(filters.size);
        if (filters.groundType) where.groundType = String(filters.groundType);
        if (filters.roof !== undefined) {
            const roofVal = filters.roof === true || filters.roof === 'true' || filters.roof === '1' || filters.roof === 1;
            where.roof = roofVal;
        }

        // Normalizar y sanear rangos de precio (acepta priceMin/priceMax y alias comunes)
        const rawMinAll = filters.priceMin ?? filters.minPrice ?? filters.price_from ?? undefined;
        const rawMaxAll = filters.priceMax ?? filters.maxPrice ?? filters.price_to ?? undefined;
        let minAll: number | undefined;
        let maxAll: number | undefined;
        if (rawMinAll !== undefined && rawMinAll !== null && String(rawMinAll).trim() !== '') {
            const parsed = parseFloat(String(rawMinAll).replace(',', '.').trim());
            if (!Number.isNaN(parsed)) minAll = parsed;
        }
        if (rawMaxAll !== undefined && rawMaxAll !== null && String(rawMaxAll).trim() !== '') {
            const parsed = parseFloat(String(rawMaxAll).replace(',', '.').trim());
            if (!Number.isNaN(parsed)) maxAll = parsed;
        }
        console.log('PitchRepository.findFiltered parsed price:', { rawMinAll, rawMaxAll, minAll, maxAll });
        if (minAll !== undefined || maxAll !== undefined) {
            if (minAll !== undefined && maxAll !== undefined && minAll > maxAll) {
                const tmp = minAll; minAll = maxAll; maxAll = tmp; // swap si vienen al revés
            }
            // Si ambos son 0 -> interpretar como "sin filtro" (ignorarlos)
            if (minAll !== undefined && maxAll !== undefined && minAll === 0 && maxAll === 0) {
                minAll = undefined;
                maxAll = undefined;
            }
            where.price = {} as any;
            if (minAll !== undefined) where.price.$gte = minAll;
            if (maxAll !== undefined) where.price.$lte = maxAll;
        }

        if (filters.ratingMin !== undefined) {
            where.rating = { $gte: Number(filters.ratingMin) };
        }

        if (filters.businessId !== undefined) {
            where.business = Number(filters.businessId) as any;
        }

        if (filters.q) {
            const q = String(filters.q);
            where.$or = [
                { size: { $like: `%${q}%` } },
                { groundType: { $like: `%${q}%` } },
                { business: { businessName: { $like: `%${q}%` } } },
            ];
        }

        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(Number(filters.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const order: any = {};
        if (filters.sort === 'price_asc') order.price = 'ASC';
        else if (filters.sort === 'price_desc') order.price = 'DESC';

        console.log('PitchRepository.findFiltered where:', JSON.stringify(where));
        const [data, total] = await em.findAndCount(Pitch, where, { populate: ['business'], limit, offset, orderBy: order });
        return { data: data as Pitch[], total };
    }
    
    /**
     * Filtrado para pitches cuyo negocio está activo.
     * Similar a `findFiltered` pero fuerza `business.active = true`.
     */
    public async findFilteredActive(filters: any): Promise<{ data: Pitch[]; total: number }>{
        const em = orm.em.fork();
        // Construir condiciones de búsqueda (excluyendo business que lo tratamos aparte)
        const searchConditions: any[] = [];

        if (filters.size) searchConditions.push({ size: String(filters.size) });
        if (filters.groundType) searchConditions.push({ groundType: String(filters.groundType) });
        if (filters.roof !== undefined) {
            const roofVal = filters.roof === true || filters.roof === 'true' || filters.roof === '1' || filters.roof === 1;
            searchConditions.push({ roof: roofVal });
        }

        // Normalizar y sanear rangos de precio (acepta priceMin/priceMax y alias comunes)
        const rawMin = filters.priceMin ?? filters.minPrice ?? filters.price_from ?? undefined;
        const rawMax = filters.priceMax ?? filters.maxPrice ?? filters.price_to ?? undefined;
        let min: number | undefined;
        let max: number | undefined;
        if (rawMin !== undefined && rawMin !== null && String(rawMin).trim() !== '') {
            const parsed = parseFloat(String(rawMin).replace(',', '.').trim());
            if (!Number.isNaN(parsed)) min = parsed;
        }
        if (rawMax !== undefined && rawMax !== null && String(rawMax).trim() !== '') {
            const parsed = parseFloat(String(rawMax).replace(',', '.').trim());
            if (!Number.isNaN(parsed)) max = parsed;
        }
        console.log('PitchRepository.findFilteredActive parsed price:', { rawMin, rawMax, min, max });
        if (min !== undefined || max !== undefined) {
            if (min !== undefined && max !== undefined && min > max) {
                const tmp = min; min = max; max = tmp; // swap si vienen al revés
            }
            // Si ambos son 0 -> interpretar como "sin filtro" (ignorarlos)
            if (!(min !== undefined && max !== undefined && min === 0 && max === 0)) {
                const priceCond: any = {};
                if (min !== undefined) priceCond.$gte = min;
                if (max !== undefined) priceCond.$lte = max;
                searchConditions.push({ price: priceCond });
            }
        }

        if (filters.ratingMin !== undefined) searchConditions.push({ rating: { $gte: Number(filters.ratingMin) } });

        // q -> OR sobre size, groundType, business.businessName
        if (filters.q) {
            const q = String(filters.q);
            searchConditions.push({
                $or: [
                    { size: { $like: `%${q}%` } },
                    { groundType: { $like: `%${q}%` } },
                    { business: { businessName: { $like: `%${q}%` } } },
                ]
            });
        }

        console.log('PitchRepository.findFilteredActive searchConditions:', JSON.stringify(searchConditions));

        // Base business activo (y si se pasa businessId, hacer match por id además)
        const businessBase: any = {};
        if (filters.businessId !== undefined) businessBase.id = Number(filters.businessId);
        businessBase.active = true;

        // Combinar condiciones
        let where: any = {};
        if (searchConditions.length === 0) {
            where = { business: businessBase };
        } else {
            where = { $and: [ { business: businessBase }, ...searchConditions ] };
        }

        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(Number(filters.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const order: any = {};
        if (filters.sort === 'price_asc') order.price = 'ASC';
        else if (filters.sort === 'price_desc') order.price = 'DESC';

        // Log para depuración: ver condiciones enviadas al ORM
        console.log('PitchRepository.findFilteredActive where:', JSON.stringify(where));
        const [data, total] = await em.findAndCount(Pitch, where, { populate: ['business'], limit, offset, orderBy: order });
        return { data: data as Pitch[], total };
    }
}

export const repository = new PitchRepository();