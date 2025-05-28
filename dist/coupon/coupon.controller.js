import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";
const repository = new CouponRepository();
function findAll(req, res) {
    res.send({ data: repository.findAll() });
}
function findOne(req, res) {
    const coupon = repository.findOne(Number(req.params.id));
    if (!coupon) {
        return res.status(404).send({ message: "Coupon not found" });
    }
    return res.send({ data: coupon });
}
function add(req, res) {
    const input = req.body.sanitizedInput;
    if (!input.discount || !input.expiringDate || !input.status) {
        return res.status(400).send({ message: "Missing required fields" });
    }
    const coupon = new Coupon(0, input.discount, new Date(), input.status);
    repository.add(coupon);
    return res.status(201).send({ message: "Coupon created succesfully", data: coupon });
}
function remove(req, res) {
    const deletedCoupon = repository.remove(Number(req.params.id));
    if (!deletedCoupon) {
        return res.status(404).send({ message: "Coupon not found" });
    }
    return res.status(201).send({ message: "Coupon deleted succesfully", data: deletedCoupon });
}
function update(req, res) {
    const input = req.body.sanitizedInput;
    const id = req.params.id;
    if (!input.discount || !input.expiringDate || !input.status) {
        return res.status(400).send({ message: "Missing required fields" });
    }
    const newCoupon = new Coupon(Number(id), input.discount, input.expiringDate, input.status);
    const updated = repository.update(newCoupon);
    if (!updated) {
        return res.status(404).send({ message: "Coupon not found" });
    }
    return res.status(201).send({ message: "Coupon updated succesfully", coupon: updated });
}
function sanitizeCouponInput(req, res, next) {
    req.body.sanitizedInput = { discount: req.body.discount, expiringDate: req.body.expiringDate, status: req.body.status };
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}
export { findAll, findOne, add, remove, update, sanitizeCouponInput };
//# sourceMappingURL=coupon.controller.js.map