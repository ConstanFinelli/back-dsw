import express from 'express';

const app = express();

app.use(express.json())

app.listen('3000', () =>{console.log("Server running on port 3000")})

let coupons = [
    {id: 1, discount: 0.20, expiringDate: new Date(), status: 'Active' },
]

app.get('/api/getCoupons', (req, res)=>{
    res.json(coupons)
})

app.post('/api/addCoupon', (req, res)=>{
    const coupon = {
        id: coupons.length + 1,
        ...req.body
    }
    coupons.push(coupon)
    res.status(201).send({message:"Coupon added succesfully", data:coupon})
})

app.patch('/api/updateCoupon/:id', (req, res) =>{
    let couponIdx = coupons.findIndex((coupon) => coupon.id == req.params.id)
    if (couponIdx == -1){
        res.status(404).send({message:"Coupon not found"})
    }else{
    coupons[couponIdx] = {
        id: coupons[couponIdx].id,
        discount: req.body.discount || coupons[couponIdx].discount,
        expiringDate: req.body.expiringDate || coupons[couponIdx].expiringDate,
        status: req.body.status || coupons[couponIdx].status
    }
    res.status(201).send({message:"Coupon updated succesfully", data:coupons[couponIdx]})
    }
})

