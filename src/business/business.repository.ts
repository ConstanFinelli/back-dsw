import { Business } from "./business.entities.js";
import { Pitch } from "../pitch/pitch.entities.js";
import orm from "../shared/db/orm.js";
import { populate } from "dotenv";

const em = orm.em;

export class BusinessRepository {
    public async findAll(): Promise<Business[]> {
        return await em.find(Business, {}, {populate: ['owner', 'locality']});
    }

    public async add(business: Business): Promise<Business> {
        await em.create(Business, business); // con persistAndFlush tira ValidationError
        await em.flush()
        return business;
    }

    public async findBusinessByOwnerId(ownerId: number): Promise<Business[] | null> {
        const businesses = await em.find(Business, { owner: ownerId });
        return businesses.length ? businesses : null;
    }

    public async findOne(id: number): Promise<Business | null> {
        return await em.findOne(Business, { id }, {populate: ['owner', 'locality']});
    }

    public async remove(id: number): Promise<Business | null> {
        const business = await this.findOne(id);
        if (!business) {
            return null;
        }
        await em.removeAndFlush(business);
        return business;
    }

    public async update(newBusiness: Business): Promise<Business | null> {
        if (!newBusiness.id) {
            throw new Error('Business ID is required for update');
        }
        const business = await this.findOne(newBusiness.id);
        if (!business) {
            return null;
        }
        
        business.businessName = newBusiness.businessName || business.businessName;
        business.address = newBusiness.address || business.address;
        business.averageRating = newBusiness.averageRating || business.averageRating;
        business.reservationDepositPercentage = newBusiness.reservationDepositPercentage || business.reservationDepositPercentage;
        business.schedule = newBusiness.schedule || business.schedule;
        
        await em.flush();
        return business;
    }

    /**
     * Recalcula el averageRating de un negocio a partir del promedio
     * del rating de todas sus canchas.
     */
    public async updateAverageRating(businessId: number): Promise<void> {
        const em = orm.em.fork();

        // Calcular promedio de ratings de canchas del negocio
        const pitches = await em.find(Pitch, { business: businessId });

        const avgRating = pitches.length > 0
            ? pitches.reduce((sum, p) => sum + (p.rating ?? 0), 0) / pitches.length
            : 0;

        // Actualizar Business.averageRating
        const business = await em.findOneOrFail(Business, { id: businessId });
        business.averageRating = Math.round(avgRating * 100) / 100;
        await em.flush();
    }
}