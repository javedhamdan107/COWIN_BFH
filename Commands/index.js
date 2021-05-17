const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const got = require("got");
require('dotenv').config();

const command = require('./command.js')

client.on('ready', () => {
    console.log('The client is ready!');

    var stateid=0;
    var districtid=0;
    var age=0;
    var slot;
    slot=false;
    var vdone = false;

    command(client, 'v', async (message) => {
        stateid=0;
        districtid=0;
        age=0;
        slot=false;
        vdone=true;
        message.channel.send('Enter your state as :   !s <state>')
    })

    command(client, 's', async (message) => {
        if(vdone){
            let res = await axios
                .get(
                    'https://cdn-api.co-vin.in/api/v2/admin/location/states',
                    {
                        headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                    },
                })
                .then((response) => {
                    var arr = response.data;

                    var cont = message.content.substring(3);
                    for(var i = 0; i < arr.states.length; i++)
                    {
                        if(cont.toLowerCase()===arr.states[i].state_name.toLowerCase())
                        {
                            stateid=arr.states[i].state_id;
                            break;
                        }
                    }
                    console.log(stateid);
                    if(stateid){
                        message.channel.send('Enter your district as :  !d <district>')
                    }else{
                        message.channel.send("Enter a valid state")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }
    })

    command(client, 'd', async (message) => {
        if(stateid){
            let res = await axios
                .get(
                    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateid}`,
                    {
                        headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                    },
                })
                .then((response) => {
                    var arr = response.data;

                    var cont = message.content.substring(3);
                    for(var i = 0; i < arr.districts.length; i++)
                    {
                        if(cont.toLowerCase()===arr.districts[i].district_name.toLowerCase())
                        {
                            districtid=arr.districts[i].district_id;
                            break;
                        }
                    }

                    console.log(districtid);
                    if(stateid){
                        message.channel.send('Enter your age as :   !a <age>')
                    }else{
                        message.channel.send("Enter a valid district")
                    }
                    
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }
    })

    command(client, 'a', async (message) => {
        if(districtid){
            age = message.content.substring(3);
            if(age > 0){
                let res = await axios
                    .get(
                        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${districtid}&date=16-05-2021`,
                        {
                            headers: {
                            'User-Agent':
                                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                    })
                    .then((response) => {
                        var arr = response.data;

                        for(var i = 0; i < arr.sessions.length; i++)
                        {
                            if(arr.sessions[i].available_capacity>0)
                            {
                                if(arr.sessions[i].min_age_limit <= age){
                                    slot=true;
                                }
                            }
                        }
                        
                        message.channel.send("User registered succesfully");

                        if(slot===true){
                            message.channel.send("Slot available");
                        }else{
                            message.channel.send("Slot not available right now");
                        }

                        stateid=0;
                        districtid=0;
                        age=0;
                        slot=false;
                        vdone=false;
                        
                    }).catch((error) => {
                        console.log("Hi");
                        console.log(error);
                    })
            }else{
                message.channel.send('Enter a valid age')
            }
        }
    })


})

client.login(process.env.TOKEN)