const dotenv = require('dotenv');
const mongoose= require('mongoose');
const fs = require('fs');
const util = require('util');

const tour = require('../../modeles/tourModel')

const readFile = util.promisify(fs.readFile);

dotenv.config({path: `${__dirname}/../../confing.env`})

const db = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);


importToDb = async ()=>{

    try{
    
    const documents =  await readFile(`${__dirname}/tours.json`,'utf-8')
    await tour.create(JSON.parse(documents));
    console.log("dddd");
    }

    catch(err)
    {
        throw(err)
    }
}



deleteToDb = async ()=>{

    try{
    
        await tour.deleteMany({});
        
    }

    catch(err)
    {
        throw(err)
    }
}

 (async ()=> { 
     



    console.log(process.argv[2] )
  
    
    
   try{ 
   await mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true 
})

    if(process.argv[2]==='--import')
        await importToDb()
     

    else if(process.argv[2] == '--delete')    
                await deleteToDb();


    process.exit(); 
    }

    catch(err)
    {
        console.log(err);
        process.exit(); 
    }

 })();