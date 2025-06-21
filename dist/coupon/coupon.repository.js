import { Coupon } from './coupon.entities.js';
import { pool } from '../shared/db/dbConnection.js';
const couponsArray = [new Coupon(1, 20, new Date(), 'Active')];
export class CouponRepository {
    async findAll() {
        const [coupons] = await pool.query("SELECT * FROM Coupon");
        return coupons;
    }
    async findOne(id) {
        const [coupon] = await pool.query("SELECT * FROM Coupon where id=?", [id]);
        if (coupon.length == 0) {
            return undefined;
        }
        return coupon[0];
    }
    async add(coupon) {
        const [newCoupon] = await pool.execute("INSERT INTO Coupon (discount, expiringDate, status) VALUES (?, ?, ?)", [coupon.discount, coupon.expiringDate, coupon.status]);
        coupon.id = newCoupon.insertId;
        return coupon;
    }
    async remove(id) {
        const [deletedCoupon] = await pool.execute("SELECT * FROM Coupon where id=?", [id]);
        await pool.execute("DELETE FROM Coupon where id=?", [id]);
        return deletedCoupon[0];
    }
    async update(newCoupon) {
        await pool.execute("UPDATE Coupon SET discount=?, expiringDate=?, status=? WHERE id=?", [newCoupon.discount, newCoupon.expiringDate, newCoupon.status, newCoupon.id]);
        const [updatedCoupon] = await pool.execute("SELECT * FROM Coupon where id=?", [newCoupon.id]);
        return updatedCoupon[0];
    }
}
//# sourceMappingURL=coupon.repository.js.map