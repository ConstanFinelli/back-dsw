import { Coupon } from './coupon.entities.js';
const coupons = [new Coupon(1, 20, new Date(), 'Active')];
export class CouponRepository {
    findAll() {
        return coupons;
    }
    findOne(id) {
        const coupon = coupons.find((coupon) => coupon.id === id);
        return coupon;
    }
    add(coupon) {
        coupon.id = coupons.length + 1;
        coupons.push(coupon);
        return coupon;
    }
    remove(id) {
        const couponIdx = coupons.findIndex((c) => c.id == id);
        let deletedCoupon = undefined;
        if (couponIdx != -1) {
            coupons.splice(couponIdx, 1);
            deletedCoupon = coupons[couponIdx];
        }
        return deletedCoupon;
    }
    update(newCoupon) {
        const couponIdx = coupons.findIndex((c) => c.id == newCoupon.id);
        if (couponIdx != -1) {
            coupons[couponIdx].discount = newCoupon.discount || coupons[couponIdx].discount;
            coupons[couponIdx].status = newCoupon.status || coupons[couponIdx].status;
            coupons[couponIdx].expiringDate = newCoupon.expiringDate || coupons[couponIdx].expiringDate;
        }
        return coupons[couponIdx];
    }
}
//# sourceMappingURL=coupon.repository.js.map