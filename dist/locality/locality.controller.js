import { Locality } from "./locality.entities.js";
import { LocalityRepository } from "./locality.repository.js";
const repository = new LocalityRepository();
function findAll(req, res) {
    res.send(repository.findAll());
}
function add(req, res) {
    const locality = new Locality(0, req.body.name, req.body.postal_code, req.body.province);
    if (!req.body.name || !req.body.postal_code || !req.body.province) {
        res.status(400).send({ message: "Missing required fields" });
    }
    repository.add(locality);
    res.status(201).send({ message: "Locality created successfully", data: locality });
}
export { findAll, add };
//# sourceMappingURL=locality.controller.js.map