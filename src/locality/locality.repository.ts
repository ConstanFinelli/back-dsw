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

    public findOne(id:number){
        const locality = localities.find((locality) => locality.id === id);
        return locality;
    }

    public remove(id:number){
        const localitiesIdx = localities.findIndex((l)=> l.id === id);
        let response = undefined
        if(localitiesIdx != -1){
            
            localities.splice(localitiesIdx, 1);
            response = 1;
        }
        return response;

    }

    public update(newLocality: Locality) {
        const localitiesIdx = localities.findIndex((l) => l.id === newLocality.id);
        if (localitiesIdx != -1) {
            localities[localitiesIdx].name = newLocality.name || localities[localitiesIdx].name;
            localities[localitiesIdx].postal_code = newLocality.postal_code || localities[localitiesIdx].postal_code;
            localities[localitiesIdx].province = newLocality.province || localities[localitiesIdx].province; 
        }
        return localities[localitiesIdx];
    }



}

