const dotenv=require('dotenv').config({path:'../.env'})
const {connectionDb} = require('./db/connection.js');
const { app } = require('./app.js');

connectionDb()
.then(()=>{
    const PORT=process.env.PORT || 3000;
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    })
}).catch((err)=>{
    console.error('Database connection failed:', err);
});

app.get('/', (req, res) => {
    res.send('Welcome to the API');
}
);