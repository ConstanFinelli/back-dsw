export class Coupon{
    constructor(
        public id:number,
        public discount:number,
        public expiringDate:Date,
        public status:string
    ){
    }
} 