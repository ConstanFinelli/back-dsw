import { Business } from "./business.entities.js";
import orm from "../shared/db/orm.js";

const em = orm.em;

export class BusinessRepository {
    public async findAll(): Promise<Business[]> {
        return await em.find(Business, {});
    }

    public async add(business: Business): Promise<Business> {
        await em.create(Business, business); // con persistAndFlush tira ValidationError
        await em.flush()
        return business;
    }

    public async findOne(id: number): Promise<Business | null> {
        return await em.findOne(Business, { id });
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

        await em.flush();
        return business;
    }
}