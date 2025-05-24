import express from 'express';
import userRouter from './coupon.route.js';

const app = express();
app.use(express.json())


export let coupons = [
    {id: 1, discount: 0.20, expiringDate: new Date(), status: 'Active' },
]
let Localidades =[];

app.use('/api/coupons', userRouter);

// mostrar todas las localidades
app.get('/api/getLocations', (req, res) => {
    res.json(Localidades);
});

// Alta de Localidades
app.post('/api/addLocation', express.json(), (req, res) => {
    const body = req.body;
    const newLocation = {
        id : Localidades.length + 1,
        nombre: body.nombre,
        codigoPostal: body.codigoPostal,
        provincia: body.provincia,
    }
    Localidades.push(newLocation);
    res.status(201).json(newLocation);
});

// Baja de Localidade
app.delete('/api/deleteLocation/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = Localidades.findIndex(location => location.id === id);
    const location = Localidades[index];
    if (index !== -1) {
        Localidades.splice(index, 1);
        res.status(200).json(location);
    } else {
        res.status(404).json({ message: 'Location not found' });
    }
});

// Modificacion de Localidades
app.patch('/api/updateLocation/:id', express.json(), (req, res) => {
    const id = parseInt(req.params.id);
    const index = Localidades.findIndex(location => location.id === id);
    const location = Localidades[index];
    if (index !== -1){
        const updatedLocation = {
            id: location.id,
            nombre: req.body.nombre || location.nombre,
            codigoPostal: req.body.codigoPostal || location.codigoPostal,
            provincia: req.body.provincia || location.provincia,
        };
        Localidades[index] = updatedLocation;
        res.status(200).json(updatedLocation);
    }
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

