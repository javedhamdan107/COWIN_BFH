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


    console.log('Main script is ready!');
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

    command(client, 'cobot register', async (message) => {
        if(uid !== 0){
            message.reply(' ');
            message.reply({embed: {
                color: 	15158332,
                description : 'A user is already working.\nPlease wait!',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }else{
            uid = message.author.id;
            stateid=0;
            districtid=0;
            age=0;
            slot=false;
            vdone=true;
            message.reply('Enter your state :   _state <state>')
        }
    })

    command(client, 'state', async (message) => {
        if((vdone || udone) && (uid === message.author.id)){
            let res = await axios
                .get(
                    'https://cowin.rabeeh.me/api/v2/admin/location/states')
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
                    console.log('stateid : ' + stateid);
                    if(stateid){
                        message.reply('Enter your district :  _district <district>')
                    }else{
                        message.reply("Enter a valid state")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply(' ');
            message.reply({embed: {
                color: 	15158332,
                description : 'A user is already working.\nPlease wait!',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }
    })

    command(client, 'district', async (message) => {
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

                    console.log('stateid : ' + districtid);
                    if(districtid){
                        message.reply('Enter your age :   _age <age>')
                    }else{
                        message.reply("Enter a valid district")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply(' ');
            message.reply({embed: {
                color: 	15158332,
                description : 'A user is already working.\nPlease wait!',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }
    })

    command(client, 'age', async (message) => {
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
                        
                        message.reply(' ');
                        message.reply({embed: {
                            color: 	15158332,
                            description : 'User registered succesfully !',
                            footer: {
                            icon_url: 'https://i.imgur.com/wSTFkRM.png',
                            }
                        }})
                        

                        if(slot===true){
                            message.reply(' ');
                            message.reply({embed: {
                                color: 	3066993,
                                description : 'Slots available in your district !\n \nVisit https://www.cowin.gov.in/home to get more info.',
                                footer: {
                                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                                }
                            }})
                        }else{
                            message.reply(' ');
                            message.reply({embed: {
                                color: 	15158332,
                                description : 'No slots are available right now',
                                footer: {
                                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                                }
                            }})
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
                message.reply(' ');
                message.reply({embed: {
                color: 	15158332,
                description : 'Vaccines are not available for people under 18 !',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
            }
        }else{
            message.reply(' ');
            message.reply({embed: {
                color: 	15158332,
                description : 'A user is already working.\nPlease wait!',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }
    })

    command(client, 'cobot check', async (message) => {
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
                        message.reply(' ');
                        message.reply({embed: {
                            color: 	3066993,
                            description : 'Slots available in your district !\n \nVisit https://www.cowin.gov.in/home to get more info.',
                            footer: {
                            icon_url: 'https://i.imgur.com/wSTFkRM.png',
                            }
                        }})
                        
                    }else{
                        message.reply(' ');
                        message.reply({embed: {
                            color: 	15158332,
                            description : 'No slots are available right now',
                            footer: {
                            icon_url: 'https://i.imgur.com/wSTFkRM.png',
                            }
                        }})
                    }

                }).catch((error) => {
                        console.log("Hi");
                        console.log(error);
                    })
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : 'You have not yet registered !',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
            
        }
    })

    command(client, 'cobot update', async (message) => {
        uid = message.author.id;
        //registered
        var user = db.get('users').find({ discordid: uid }).value()

        if(user !== undefined){
            udone = true;
            message.reply('Enter your state as :   _state <state>')
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : 'You have not yet registered !',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }
    })

    command(client, 'cobot delete', async (message) => {
        var user_uid = message.author.id;
        var user = db.get('users').find({ discordid: user_uid }).value()

        if(user !== undefined){
            db.get('users')
            .remove({discordid : user_uid})
            .write()
            message.reply(' ');
            message.reply({embed: {
                color: 	3066993,
                description : 'Your registration has been closed !',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
            console.log("Registration Closing Successful !")
            user_uid = 0;
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : 'You have not yet registered !',
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                }
            }})
        }
    })

    command(client, 'cobot exit', async (message) => {
         uid=0;
         stateid=0;
         districtid=0;
         age=0;
         slot;
        slot=false;
         vdone = false;
         udone = false;
    })

    command(client, 'cobot help', async (message) => {
        uidhelp = message.author.id;
        var user = db.get('users').find({ discordid: uidhelp }).value()
        if(user == undefined){
            f1 = false;
        }
        if(f1 == false){
            message.reply({embed: {
                color: 	15158332,
                title: "Cobot",
                description : '\n----------------------------------------------------------------------------------------------\nThis is an interactive Discord Bot which helps you to check the Covid-19 Vaccine availability in your district and gives you hourly notification if the Vaccine is available.You can also update the details you have registered with Bot and delete Your account with the Bot once you get the Vaccine slot booking.\n----------------------------------------------------------------------------------------------\n Visit https://www.cowin.gov.in/home for more info \n----------------------------------------------------------------------------------------------\n \n-Commands-',
                fields: [
                    { name: `_cobot register `, value: "Start an instance of the bot to register for vaccine availability checking", inline: false},
                    { name: "_state", value: "To enter your state", inline: true},
                    { name: "_district", value: "To enter your district", inline: true},
                    { name: "_age", value: "To enter your age", inline: true},
                    { name: "_cobot check", value: "To check your vaccine availability", inline: false},
                    { name: "_cobot update", value: "Update your existing location and age group", inline: false},
                    { name: "_cobot exit", value: "Exit your registration", inline: false},
                    { name: "_cobot delete", value: "Close your registration for vaccine availability checking", inline: false},
                ],
                timestamp: new Date(),
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                text: "©"
                }
            }})
        }else{
            message.reply({embed: {
                color: 3066993,
                title: "Cobot",
                description : '\n----------------------------------------------------------------------------------------------\nThis is an interactive Discord Bot which helps you to check the Covid-19 Vaccine availability in your district and gives you hourly notification if the Vaccine is available.You can also update the details you have registered with Bot and delete Your account with the Bot once you get the Vaccine slot booking.\n----------------------------------------------------------------------------------------------\n Visit https://www.cowin.gov.in/home for more info \n----------------------------------------------------------------------------------------------\n \n-Commands-',
                fields: [
                    { name: `_cobot register `, value: "Start an instance of the bot to register for vaccine availability checking", inline: false},
                    { name: "_state", value: "To enter your state", inline: true},
                    { name: "_district", value: "To enter your district", inline: true},
                    { name: "_age", value: "To enter your age", inline: true},
                    { name: "_cobot check", value: "To check your vaccine availability", inline: false},
                    { name: "_cobot update", value: "Update your existing location and age group", inline: false},
                    { name: "_cobot exit", value: "Exit your registration", inline: false},
                    { name: "_cobot delete", value: "Close your registration for vaccine availability checking", inline: false},
                ],
                timestamp: new Date(),
                footer: {
                icon_url: 'https://i.imgur.com/wSTFkRM.png',
                text: "©"
                }
            }})
        }
    })
})

client.login('ODQzNDc2NzE2ODkwNzUxMDE4.YKEa6A.UCHf9TbS5LsieXNMlYRwgQMknV4')
