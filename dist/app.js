import express from 'express';
import { couponRouter } from './coupon/coupon.route.js';
const app = express();
app.use(express.json());
app.use('/api/coupons', couponRouter);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
//# sourceMappingURL=app.js.map