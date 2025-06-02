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
    findOne(id) {
        const locality = localities.find((locality) => locality.id === id);
        return locality;
    }
    remove(id) {
        const localitiesIdx = localities.findIndex((l) => l.id === id);
        let deletedLocality;
        if (localitiesIdx != -1) {
            deletedLocality = localities.splice(localitiesIdx, 1)[0];
        }
        return deletedLocality;
    }
    update(newLocality) {
        const localitiesIdx = localities.findIndex((l) => l.id === newLocality.id);
        if (localitiesIdx != -1) {
            localities[localitiesIdx].name = newLocality.name || localities[localitiesIdx].name;
            localities[localitiesIdx].postal_code = newLocality.postal_code || localities[localitiesIdx].postal_code;
            localities[localitiesIdx].province = newLocality.province || localities[localitiesIdx].province;
        }
        return localities[localitiesIdx];
    }
}
//# sourceMappingURL=locality.repository.js.map