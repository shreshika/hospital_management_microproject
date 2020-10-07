const express= require('express');
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//for mongodb
const MongoClient=require('mongodb').MongoClient;
let server =require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db
MongoClient.connect(url,{ useUnifiedTopology: true },(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});
//FETCHING HOSPITAL DETAILS
app.get('/hospital', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("hospitalDetails").find().toArray()
    .then(result => res.json(result));
});
//FETCHING VENTILATOR DETAILS
app.get('/ventilator', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("ventilatorDetails").find().toArray()
    .then(result=>(res.json(result)));
});
//SEARCH BY USING VENTILATOR STATUS
app.post('/searchventbystatus', middleware.checkToken, (req,res) => {
    const status = req.query.status;
    console.log(status);
    const ventillatordetails=db.collection('ventilatorDetails')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//SEARCH BY USING VENTILATOR NAME
app.post('/searchventbyname', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilatordeatils=db.collection('ventilatorDetails')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//SEARCH BY USING HOSPITAL NAME
app.post('/searchhospital', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilatordeatils=db.collection('hospitalDetails')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//ADDING NEW VENTILATOR
app.post('/addvent',(req,res)=>{
    const hId=req.body.hId;
    const ventilatorId=req.body.ventilatorId;
    const status=req.body.status;
    const name=req.body.name;
    console.log("adding ventilator, please wait a moment");
    const item={hId:hId, ventilatorId:ventilatorId, status:status, name:name};
    db.collection("ventilatorDetails").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

//UPDATE VENTILATOR USING STATUS
app.put('/updateventilator', middleware.checkToken, (req,res) => {
    const ventilatorId= {ventilatorId: req.body.ventilatorId};
    console.log(ventilatorId);
    const newvalues={$set: {status:req.body.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilatorDetails").updateOne(ventilatorId, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

//DELETE VENTILATOR
app.delete('/deletevent', middleware.checkToken, (req,res) => {
    const ventilatorId=req.query.ventilatorId;
    console.log(ventilatorId);
    const temp={"ventilatorId":ventilatorId};
    db.collection("ventilatorDetails").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});

//SEARCH VENTILATOR
app.get('/searchventilators',(req,res)=>{
    const status=req.query.status;
    const name=req.query.name;
    console.log("searching ventilators, please wait a moment");
    const data=db.collection("ventilatorDetails").find({"name":name},{"status":status}).toArray().then(result=>res.send(result));
    res.send("no hospital found :(");
});
app.listen(5000,(req,res)=>{
    console.log("working well");
});