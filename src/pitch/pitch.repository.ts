import {Pitch} from './pitch.entities.js'
import orm from '../shared/db/orm.js';
import { Reservation } from '../reservation/reservation.entities.js';
import type { SqlEntityManager } from '@mikro-orm/postgresql';

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
        // SqlEntityManager: el driver real es PostgreSqlDriver (runtime), pero Options
        // del core tipa em como EntityManager genérico que no expone createQueryBuilder.
        const em = orm.em.fork() as SqlEntityManager;

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
        }

        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(Number(filters.limit) || 20, 100);
        const offset = (page - 1) * limit;

        // ── QueryBuilder (reemplaza em.findAndCount) ─────────────────────────
        // leftJoinAndSelect hidrata business en cada Pitch (equivalente a populate).
        const qb = em.createQueryBuilder(Pitch, 'p')
            .leftJoinAndSelect('p.business', 'b')
            .select('*');

        if (filters.size) qb.andWhere({ 'p.size': String(filters.size) });
        if (filters.groundType) qb.andWhere({ 'p.groundType': String(filters.groundType) });
        if (filters.roof !== undefined) {
            const roofVal = filters.roof === true || filters.roof === 'true' || filters.roof === '1' || filters.roof === 1;
            qb.andWhere({ 'p.roof': roofVal });
        }
        if (minAll !== undefined) qb.andWhere({ 'p.price': { $gte: minAll } });
        if (maxAll !== undefined) qb.andWhere({ 'p.price': { $lte: maxAll } });
        if (filters.ratingMin !== undefined) qb.andWhere({ 'p.rating': { $gte: Number(filters.ratingMin) } });
        if (filters.businessId !== undefined) qb.andWhere({ 'b.id': Number(filters.businessId) });
        if (filters.q) {
            // Plan 1b: búsqueda insensible a acentos vía extensión unaccent de PostgreSQL.
            // Se compara unaccent(col) ILIKE unaccent(patrón) en ambos lados, por lo que
            // el input del usuario NO necesita normalización y los datos en DB se
            // conservan con acentos (UX preservada). Requiere CREATE EXTENSION unaccent
            // (lo instala el seed inicial). El SQL crudo va acotado al OR de búsqueda;
            // el resto de filtros y el mapeo a entidades siguen vía ORM.
            const q = `%${String(filters.q)}%`;
            qb.andWhere(
                'unaccent(p.size) ILIKE unaccent(?) OR unaccent(p.ground_type) ILIKE unaccent(?) OR unaccent(b.business_name) ILIKE unaccent(?)',
                [q, q, q]
            );
        }

        if (filters.sort === 'price_asc') qb.orderBy({ 'p.price': 'ASC' });
        else if (filters.sort === 'price_desc') qb.orderBy({ 'p.price': 'DESC' });
        qb.limit(limit).offset(offset);

        console.log('PitchRepository.findFiltered q:', filters.q ?? '(sin búsqueda)');
        const [data, total] = await qb.getResultAndCount();
        return { data: data as Pitch[], total };
    }
    
    /**
     * Recalcula el rating de una cancha a partir del promedio de pitchRating
     * de sus reservas completadas con rating.
     */
    public async updateRating(pitchId: number): Promise<void> {
        const em = orm.em.fork();

        // Calcular promedio de pitchRating de reservas completadas
        const reservations = await em.find(Reservation, {
            pitch: pitchId,
            status: 'completada',
            pitchRating: { $ne: null } as any,
        });

        const ratedReservations = reservations.filter(r => r.pitchRating != null);
        const avgRating = ratedReservations.length > 0
            ? ratedReservations.reduce((sum, r) => sum + (r.pitchRating ?? 0), 0) / ratedReservations.length
            : 0;

        // Actualizar Pitch.rating
        const pitch = await em.findOneOrFail(Pitch, { id: pitchId });
        pitch.rating = Math.round(avgRating * 10) / 10;
        await em.flush();
    }

    /**
     * Filtrado para pitches cuyo negocio está activo.
     * Similar a `findFiltered` pero fuerza `business.active = true`.
     */
    public async findFilteredActive(filters: any): Promise<{ data: Pitch[]; total: number }>{
        // SqlEntityManager: ver comentario en findFiltered.
        const em = orm.em.fork() as SqlEntityManager;

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
            if (min !== undefined && max !== undefined && min === 0 && max === 0) {
                min = undefined;
                max = undefined;
            }
        }

        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(Number(filters.limit) || 20, 100);
        const offset = (page - 1) * limit;

        // ── QueryBuilder (reemplaza em.findAndCount) ─────────────────────────
        // leftJoinAndSelect hidrata business en cada Pitch (equivalente a populate).
        const qb = em.createQueryBuilder(Pitch, 'p')
            .leftJoinAndSelect('p.business', 'b')
            .select('*');

        // Base business activo (y si se pasa businessId, hacer match por id además)
        qb.andWhere({ 'b.active': true });
        if (filters.businessId !== undefined) qb.andWhere({ 'b.id': Number(filters.businessId) });

        if (filters.size) qb.andWhere({ 'p.size': String(filters.size) });
        if (filters.groundType) qb.andWhere({ 'p.groundType': String(filters.groundType) });
        if (filters.roof !== undefined) {
            const roofVal = filters.roof === true || filters.roof === 'true' || filters.roof === '1' || filters.roof === 1;
            qb.andWhere({ 'p.roof': roofVal });
        }
        if (min !== undefined) qb.andWhere({ 'p.price': { $gte: min } });
        if (max !== undefined) qb.andWhere({ 'p.price': { $lte: max } });
        if (filters.ratingMin !== undefined) qb.andWhere({ 'p.rating': { $gte: Number(filters.ratingMin) } });

        // q -> OR sobre size, groundType, business.businessName con unaccent.
        // Plan 1b: búsqueda insensible a acentos vía extensión unaccent de PostgreSQL.
        // Se compara unaccent(col) ILIKE unaccent(patrón) en ambos lados, por lo que
        // el input del usuario NO necesita normalización y los datos en DB se
        // conservan con acentos (UX preservada). Requiere CREATE EXTENSION unaccent
        // (lo instala el seed inicial). El SQL crudo va acotado al OR de búsqueda;
        // el resto de filtros y el mapeo a entidades siguen vía ORM.
        if (filters.q) {
            const q = `%${String(filters.q)}%`;
            qb.andWhere(
                'unaccent(p.size) ILIKE unaccent(?) OR unaccent(p.ground_type) ILIKE unaccent(?) OR unaccent(b.business_name) ILIKE unaccent(?)',
                [q, q, q]
            );
        }

        if (filters.sort === 'price_asc') qb.orderBy({ 'p.price': 'ASC' });
        else if (filters.sort === 'price_desc') qb.orderBy({ 'p.price': 'DESC' });
        qb.limit(limit).offset(offset);

        console.log('PitchRepository.findFilteredActive q:', filters.q ?? '(sin búsqueda)');
        const [data, total] = await qb.getResultAndCount();
        return { data: data as Pitch[], total };
    }
}

export const repository = new PitchRepository();