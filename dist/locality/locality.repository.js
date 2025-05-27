import { Locality } from './locality.entities.js';
const localities = new Array(new Locality(1, "Rosario", "2000", "Santa Fe"));
export class LocalityRepository {
    findAll() {
        return localities;
    }
    add(locality) {
        locality.id = localities.length + 1;
        localities.push(locality);
        return locality;
    }
}
//# sourceMappingURL=locality.repository.js.map