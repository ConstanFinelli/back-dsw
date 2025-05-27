import {Locality} from './locality.entities.js';

const localities= new Array<Locality>(
    new Locality(1, "Rosario", "2000","Santa Fe")
);

export class LocalityRepository {
    public findAll(): Array<Locality> {
        return localities;
    }

    public add(locality: Locality): Locality {
        locality.id = localities.length + 1;
        localities.push(locality);
        return locality;
    }

}

