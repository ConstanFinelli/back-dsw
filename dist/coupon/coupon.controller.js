import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";
const repository = new CouponRepository();
function findAll(req, res) {
    res.send({ data: repository.findAll() });
}
function findOne(req, res) {
    const coupon = repository.findOne(Number(req.params.id));
    if (!coupon) {
        res.status(404).send({ message: "Coupon not found" });
    }
    else {
        res.send({ data: coupon });
    }
}
function add(req, res) {
    const coupon = new Coupon(0, req.body.discount, new Date(), req.body.status);
    repository.add(coupon);
    res.status(201).send({ message: "Coupon created succesfully", data: coupon });
}
function remove(req, res) {
    const deletedCoupon = repository.remove(Number(req.params.id));
    if (!deletedCoupon) {
        res.status(404).send({ message: "Coupon not found" });
    }
    else {
        res.status(201).send({ message: "Coupon deleted succesfully", data: deletedCoupon });
    }
}
function update(req, res) {
    const id = req.params.id;
    const newCoupon = new Coupon(Number(id), req.body.discount, req.body.expiringDate, req.body.status);
    const updated = repository.update(newCoupon);
    if (!updated) {
        res.status(404).send({ message: "Coupon not found" });
    }
    else {
        res.status(201).send({ message: "Coupon updated succesfully", coupon: updated });
    }
}
export { findAll, findOne, add, remove, update };
//# sourceMappingURL=coupon.controller.js.map