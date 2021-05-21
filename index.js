const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const got = require("got");
require('dotenv').config();
read = require('./read');

const config = require('./config.json')
const command = require('./command.js')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)


db.defaults({ users: [],})  
.write()

client.on('ready', () => {


    console.log('The client is ready!');
    var uid=0;
    var state_name;
    var district_name;
    var stateid=0;
    var districtid=0;
    var age=0;
    var slot;
    slot=false;
    var vdone = false;
    var udone = false;

    command(client, 'v', async (message) => {
        if(uid !== 0){
            message.reply('A user is already working. Please wait!');
        }else{
            uid = message.author.id;
            stateid=0;
            districtid=0;
            age=0;
            slot=false;
            vdone=true;
            message.reply('Enter your state as :   !s <state>')
        }
    })

    command(client, 's', async (message) => {
        if((vdone || udone) && (uid === message.author.id)){
            let res = await axios
                .get(
                    'https://cowin.rabeeh.me/api/v2/admin/location/states',
                    {
                        headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                })
                .then((response) => {
                    var arr = response.data;

                    var cont = message.content.substring(3);
                    state_name = cont.toLowerCase();
                    for(var i = 0; i < arr.data.states.length; i++)
                    {
                        if(state_name === arr.data.states[i].state_name.toLowerCase())
                        {
                            stateid=arr.data.states[i].state_id;
                            break;
                        }
                    }
                    console.log(stateid);
                    if(stateid){
                        message.reply('Enter your district as :  !d <district>')
                    }else{
                        message.reply("Enter a valid state")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply('A user is already working. Please wait!');
        }
    })

    command(client, 'd', async (message) => {
        if(stateid && (uid === message.author.id)){
            let res = await axios
                .get(
                    `https://cowin.rabeeh.me/api/v2/admin/location/districts/${stateid}`,
                )
                .then((response) => {
                    var arr = response.data;

                    var cont = message.content.substring(3);
                    district_name = cont.toLowerCase();
                    for(var i = 0; i < arr.data.districts.length; i++)
                    {
                        if(district_name === arr.data.districts[i].district_name.toLowerCase())
                        {
                            districtid=arr.data.districts[i].district_id;
                            break;
                        }
                    }

                    console.log(districtid);
                    if(districtid){
                        message.reply('Enter your age as :   !a <age>')
                    }else{
                        message.reply("Enter a valid district")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply('A user is already working. Please wait!');
        }
    })

    command(client, 'a', async (message) => {
        if(districtid && (uid === message.author.id)){
            age = message.content.substring(3);
            if(age > 17){
                const moment = require('moment');
                var created = moment().format('DD/MM/YY');
                
                let res = await axios
                    .get(
                        `https://cowin.rabeeh.me/api/v2/appointment/sessions/public/findByDistrict?district_id=${districtid}&date=${created}`,
                    )
                    .then((response) => {
                        var arr = response.data;
                        slot = false;


                        for(var i = 0; i < arr.data.sessions.length; i++)
                        {
                            if(arr.data.sessions[i].available_capacity>0)
                            {
                                if(arr.data.sessions[i].min_age_limit <= age){
                                    slot=true;
                                }
                            }
                        }
                        
                        message.reply("User registered succesfully");

                        if(slot===true){
                            message.reply("Slot available");
                            message.reply(" Visit https://www.cowin.gov.in/home to get more info.");
                        }else{
                            message.reply("Slot not available right now");
                        }
                        if(udone == false){
                            db.get('users')
                                .push({ discordid: uid, state: state_name, district : district_name, Age : age, stateid : stateid, districtid : districtid, ifslot : slot})
                                .write()                    
                        }else{
                            db.get('users').find({discordid: uid})
                                .assign({ discordid: uid, state: state_name, district : district_name, Age : age, stateid : stateid, districtid : districtid, ifslot : slot})
                                .write()
                        }
                        
                        udone = false;
                        stateid=0;
                        districtid=0;
                        age=0;
                        slot=false;
                        vdone=false;
                        uid = 0;
                        
                    }).catch((error) => {
                        console.log("Hi");
                        console.log(error);
                    })
            }else{
                message.reply('Vaccines are not available for people under 18 !')
            }
        }else{
            message.reply('A user is already working. Please wait!');
        }
    })

    command(client, 'check', async (message) => {
        var user_uid = message.author.id;
        var user = db.get('users').find({ discordid: user_uid }).value()
        const moment = require('moment');
        var created = moment().format('DD/MM/YY');
        if(user){
            console.log(user.districtid);
            console.log(created);
            let res = await axios
                .get(
                    `http://cowin.rabeeh.me/api/v2/appointment/sessions/public/findByDistrict?district_id=${user.districtid}&date=${created}`
                )
                .then((response) => {
                    var arr = response.data;
                    slot = false;


                    for(var i = 0; i < arr.data.sessions.length; i++)
                    {
                        if(arr.data.sessions[i].available_capacity>0)
                        {
                            if(arr.data.sessions[i].min_age_limit <= user.Age){
                                slot=true;
                            }
                        }
                    }

                    if(slot===true){
                        message.reply("Slot available");
                        message.reply(" Visit https://www.cowin.gov.in/home to get more info.");
                    }else{
                        message.reply("Slot not available right now");
                    }

                }).catch((error) => {
                        console.log("Hi");
                        console.log(error);
                    })
        }else{
            message.reply("You have not yet registered!");
        }
    })

    command(client, 'update', async (message) => {
        uid = message.author.id;
        //registered
        var user = db.get('users').find({ discordid: uid }).value()

        if(user !== undefined){
            udone = true;
            message.reply('Enter your state as :   !s <state>')
        }else{
            message.reply('You have not registered yet!')
        }
    })

    command(client, 'delete', async (message) => {
        var user_uid = message.author.id;
        var user = db.get('users').find({ discordid: user_uid }).value()

        if(user !== undefined){
            db.get('users')
            .remove({discordid : user_uid})
            .write()
            message.reply('Your registration has been closed !');
            console.log("Registration Closing Successful !")
            user_uid = 0;
        }else{
            message.reply("You have not yet registered !")
        }
    })


})

client.login(process.env.TOKEN)
