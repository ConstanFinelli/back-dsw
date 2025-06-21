import { query, Result } from 'express-validator';
import {Coupon} from './coupon.entities.js'
import mysql, { ResultSetHeader } from 'mysql2/promise'
import {pool} from '../shared/db/dbConnection.js'
import { RowDataPacket } from 'mysql2/promise';

const couponsArray = [new Coupon(1,20, new Date(), 'Active')]
export class CouponRepository{
    public async findAll():Promise<Coupon[] | undefined>{
        const [coupons] = await pool.query("SELECT * FROM Coupon") 
        return coupons as Coupon[];
    }
    public async findOne(id:number):Promise<Coupon | undefined>{
        const [coupon] = await pool.query<RowDataPacket[]>("SELECT * FROM Coupon where id=?",[id])
        if(coupon.length == 0){
            return undefined
        }
        return coupon[0] as Coupon
    }
    public async add(coupon:Coupon):Promise<Coupon | undefined>{
        const [newCoupon] = await pool.execute<ResultSetHeader>("INSERT INTO Coupon (discount, expiringDate, status) VALUES (?, ?, ?)", [coupon.discount, coupon.expiringDate, coupon.status ]) 
        coupon.id = newCoupon.insertId
        return coupon
    }
    
    public async remove(id:number){
        const [deletedCoupon] = await pool.execute<RowDataPacket[]>("SELECT * FROM Coupon where id=?", [id])
        await pool.execute("DELETE FROM Coupon where id=?", [id])
        return deletedCoupon[0] as Coupon
    }
    public async update(newCoupon:Coupon){
        await pool.execute("UPDATE Coupon SET discount=?, expiringDate=?, status=? WHERE id=?", 
            [newCoupon.discount, newCoupon.expiringDate, newCoupon.status, newCoupon.id ])
        const [updatedCoupon] = await pool.execute<RowDataPacket[]>("SELECT * FROM Coupon where id=?", [newCoupon.id])
        return updatedCoupon[0] as Coupon
    }

}
