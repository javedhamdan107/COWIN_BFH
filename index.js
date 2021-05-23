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
  
client.on("guildCreate", (guild) => {  ;
    console.log(`Joined new guild: ${guild.name}`);
    let channelID;
    let channels = guild.channels.cache;

    channelLoop:
    for (let key in channels) {
        let c = channels[key];
        if (c[1].type === "text") {
            channelID = c[0];
            break channelLoop;
        }
    }

    let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
    channel.send({embed: {
        color: 	3066993,
        // title: "Cobot",
        author: {
            name : 'Cobot',
            icon_url: 'https://i.imgur.com/nnKLeNU.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/WdeEvgg.png',
        },
        title: "\n \nThanks for adding me to your server! :blush:",
        description : '\n \nThis is an interactive Discord Bot which helps you to check the Covid-19 Vaccine availability in your district and gives you hourly notification if the Vaccine is available.You can also update the details you have registered with Bot and delete Your account with the Bot once you get the Vaccine slot booking.\n \n👇 To get started type 👇\n ',
        fields: [
            { name: `_cobot help `, value: "Open the command lists", inline: false},
        ],
        timestamp: new Date(),
        footer: {
        icon_url: 'https://i.imgur.com/nnKLeNU.png',
        text: "©"
        }
    }})
});

client.on('ready', () => {
    console.log('Main script is ready!');
    // client.user.setUsername("Cobot  ");
    client.user.setActivity(`_cobot help`, { type: 'LISTENING'})
        .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
        .catch(console.error);
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
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, another user is already working.Please wait!`,
                
            }})
        }else{
            uid = message.author.id;
            stateid=0;
            districtid=0;
            age=0;
            slot=false;
            vdone=true;
            message.reply('Enter your state :   _s <state>')

            let filter = m => m.author.id === uid
            message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
            })
            .then(() => {
            console.log('Hi');
            })
            .catch(() => {
                message.reply('Your registration has timed out');
                uid=0;
                stateid=0;
                districtid=0;
                age=0;
                slot;
                slot=false;
                vdone = false;
                udone = false;
                
            });
        }
    })

    command(client, 's', async (message) => {
        if((vdone || udone) && (uid === message.author.id)){
            let res = await axios
                .get(
                    'https://cdn-api.co-vin.in/api/v2/admin/location/states',
                    {
                        headers: {
                            'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                    },
                )
                .then((response) => {
                    var arr = response.data;
                    console.log(arr);
                    var cont = message.content.substring(3);
                    state_name = cont.toLowerCase();
                    for(var i = 0; i < arr.states.length; i++)
                    {
                        if(state_name === arr.states[i].state_name.toLowerCase())
                        {
                            stateid=arr.states[i].state_id;
                            break;
                        }
                    }
                    console.log('stateid : ' + stateid);
                    if(stateid){
                        message.reply('Enter your district :  _d <district>')
                        let filter = m => m.author.id === uid
                        message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                        })
                        .then(() => {
                        console.log('Hi');
                        })
                        .catch(() => {
                            message.reply('Your registration has timed out');
                            uid=0;
                            stateid=0;
                            districtid=0;
                            age=0;
                            slot;
                            slot=false;
                            vdone = false;
                            udone = false;
                            
                        });
                    }else{
                        message.reply("Enter a valid state")
                        console.log('else');
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, another user is already working.Please wait!`,
                
            }})
        }
    })

    command(client, 'd', async (message) => {
        if(stateid && (uid === message.author.id)){
            let res = await axios
                .get(
                    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateid}`,
                    {
                        headers: {
                            'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                    },
                )
                .then((response) => {
                    var arr = response.data;

                    var cont = message.content.substring(3);
                    district_name = cont.toLowerCase();
                    for(var i = 0; i < arr.districts.length; i++)
                    {
                        if(district_name === arr.districts[i].district_name.toLowerCase())
                        {
                            districtid=arr.districts[i].district_id;
                            break;
                        }
                    }

                    console.log('stateid : ' + districtid);
                    if(districtid){
                        message.reply('Enter your age :   _a <age>')
                        let filter = m => m.author.id === uid
                        message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                        })
                        .then(() => {
                        console.log('Hi');
                        })
                        .catch(() => {
                            message.reply('Your registration has timed out');
                            uid=0;
                            stateid=0;
                            districtid=0;
                            age=0;
                            slot;
                            slot=false;
                            vdone = false;
                            udone = false;
                            
                        });
                    }else{
                        message.reply("Enter a valid district")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, another user is already working.Please wait!`,
            }})
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
                        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${districtid}&date=${created}`,
                        {
                            headers: {
                                'User-Agent':
                                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                            },
                        },
                    )
                    .then((response) => {
                        var arr = response.data;
                        slot = false;


                        for(var i = 0; i < arr.sessions.length; i++)
                        {
                            if(arr.sessions[i].available_capacity>0)
                            {
                                if(arr.sessions[i].min_age_limit <= age){
                                    slot=true;
                                }
                            }
                        }
                        
                        message.reply({embed: {
                            color: 	3066993,
                            description : `<@${message.author.id}>, You have been registered successfully !`,
                            timestamp: new Date(),
                            footer: {
                                icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                text: "©"
                                }
                        }})
                        

                        if(slot===true){
                            message.reply({embed: {
                                color: 	3066993,
                                description : `<@${message.author.id}>, Slots available in your district !\n \nVisit https://www.cowin.gov.in/home to get more info.`,
                                timestamp: new Date(),
                                footer: {
                                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                    text: "©"
                                    }
                            }})
                        }else{
                            message.reply({embed: {
                                color: 	15158332,
                                description : `<@${message.author.id}>, No slots are available right now.\n \nWe will notify you as soon as vaccines are available !`,
                                timestamp: new Date(),
                                footer: {
                                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                    text: "©"
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
                message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, Vaccines are not available for people under 18 !`,
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
                    }
            }})
            }
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, another user is already working.Please wait!`,
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
                    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${user.districtid}&date=${created}`,
                    {
                        headers: {
                            'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                    },
                )
                .then((response) => {
                    var arr = response.data;
                    slot = false;


                    for(var i = 0; i < arr.sessions.length; i++)
                    {
                        if(arr.sessions[i].available_capacity>0)
                        {
                            if(arr.sessions[i].min_age_limit <= user.Age){
                                slot=true;
                            }
                        }
                    }

                    if(slot===true){
                        message.reply({embed: {
                            color: 	3066993,
                            description : `<@${message.author.id}>, Slots available in your district !\n \nVisit https://www.cowin.gov.in/home to get more info.`,
                            timestamp: new Date(),
                            footer: {
                                icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                text: "©"
                                }
                        }})
                        
                    }else{
                        message.reply({embed: {
                            color: 	15158332,
                            description : `<@${message.author.id}>, No slots are available right now.\n \nWe will notify you as soon as vaccines are available !`,
                            timestamp: new Date(),
                            footer: {
                                icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                text: "©"
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
                description : `<@${message.author.id}>, You have not yet registered !`,
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
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
            message.reply('Enter your state as : _s <state>')

            let filter = m => m.author.id === uid
            message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
            })
            .then(() => {
            console.log('Hi');
            })
            .catch(() => {
                message.reply('Your registration has timed out');
                uid=0;
                stateid=0;
                districtid=0;
                age=0;
                slot;
                slot=false;
                vdone = false;
                udone = false;
                
            });
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, You have not yet registered !`,
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
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
            message.reply({embed: {
                color: 	3066993,
                description : `<@${message.author.id}>, Your registration has been closed. \n \nHope you get vaccinated soon !`,
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
                }
            }})
            console.log("Registration Closing Successful !")
            user_uid = 0;
        }else{
            message.reply({embed: {
                color: 	15158332,
                description : `<@${message.author.id}>, You have not yet registered !`,
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
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
        message.reply({embed: {
            color: 	9807270,
            description : `<@${message.author.id}>, Registration exited`,
        }})
        
    })

    command(client, 'cobot cowin', async (message) => {
        message.reply({embed: {
            color: 	3066993,
            description : `https://www.cowin.gov.in/home`,
            footer: {
                icon_url: 'https://i.imgur.com/nnKLeNU.png',
                text: "©"
                }
        }})
    })

    command(client, 'cobot help', async (message) => {
        uidhelp = message.author.id;
        var user = db.get('users').find({ discordid: uidhelp }).value()
        var f1;
        if(user == undefined){
            f1 = false;
        }
        if(f1 == false){
            message.reply({embed: {
                color: 	15158332,
                // title: "Cobot",
                author: {
                    name : 'Cobot',
                    icon_url: 'https://i.imgur.com/nnKLeNU.png'
                },
                thumbnail: {
                    url: 'https://i.imgur.com/WdeEvgg.png',
                },
                description : '\n \nThis is an interactive Discord Bot which helps you to check the Covid-19 Vaccine availability in your district and gives you hourly notification if the Vaccine is available.You can also update the details you have registered with Bot and delete Your account with the Bot once you get the Vaccine slot booking.\n \n Visit https://www.cowin.gov.in/home for more info \n \n \n-Commands-',
                fields: [
                    { name: `_cobot register `, value: "Start an instance of the bot to register for vaccine availability checking", inline: false},
                    // { name: "_s", value: "To enter your state", inline: true},
                    // { name: "_d", value: "To enter your district", inline: true},
                    // { name: "_a", value: "To enter your age", inline: true},
                    { name: "_cobot check", value: "To check your vaccine availability", inline: false},
                    { name: "_cobot update", value: "Update your existing location and age group", inline: false},
                    { name: "_cobot exit", value: "Exit your registration", inline: false},
                    { name: "_cobot cowin", value: "To visit cowin website", inline: false},
                    { name: "_cobot delete", value: "Close your registration for vaccine availability checking", inline: false},
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
                    }
            }})
        }else{
            message.reply({embed: {
                color: 	3066993,
                // title: "Cobot",
                author: {
                    name : 'Cobot',
                    icon_url: 'https://i.imgur.com/nnKLeNU.png'
                },
                thumbnail: {
                    url: 'https://i.imgur.com/WdeEvgg.png',
                },
                description : '\n \nThis is an interactive Discord Bot which helps you to check the Covid-19 Vaccine availability in your district and gives you hourly notification if the Vaccine is available.You can also update the details you have registered with Bot and delete Your account with the Bot once you get the Vaccine slot booking.\n \n Visit https://www.cowin.gov.in/home for more info \n \n \n-Commands-',
                fields: [
                    { name: `_cobot register `, value: "Start an instance of the bot to register for vaccine availability checking", inline: false},
                    // { name: "_s", value: "To enter your state", inline: true},
                    // { name: "_d", value: "To enter your district", inline: true},
                    // { name: "_a", value: "To enter your age", inline: true},
                    { name: "_cobot check", value: "To check your vaccine availability", inline: false},
                    { name: "_cobot update", value: "Update your existing location and age group", inline: false},
                    { name: "_cobot exit", value: "Exit your registration", inline: false},
                    { name: "_cobot cowin", value: "To visit cowin website", inline: false},
                    { name: "_cobot delete", value: "Close your registration for vaccine availability checking", inline: false},
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                    text: "©"
                    }
            }})
        }
    })
})

client.login(process.env.TOKEN)

