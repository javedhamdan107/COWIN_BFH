const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const got = require("got");

const config = require('./config.json')
const command = require('./command.js')

client.on('ready', () => {
    console.log('The client is ready!');

    command(client, ['ping', 'test'], (message) => {
        message.channel.send('Pong!')
    })

    command(client, 'servers', (message) => {
        client.guilds.cache.forEach((guild) => {
            message.channel.send(`${guild.name} has a total of ${guild.memberCount} members`)
        })
    })

    command(client, ['cc', 'clearChannel'], (message) => {
        if(message.member.hasPermission('ADMINISTRATOR')){
            message.channel.messages.fetch().then((results) => {
                message.channel.bulkDelete(results)
            })
        }
    })

    command(client, 'status', (message) => {
        const content = message.content.replace('!status', '')

        client.user.setPresence({
            activity: {
                name: content,
                type: 0,
            },
        })
    })

    command(client, 'api', async (message) => {
        // let get_data = async () => {
            let res = await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=512&date=15-05-2021')
                .then((response) => {
                    console.log(response.data);
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        
        // get_data().then(data => {
        //     console.log(data)
        // })
    })
})

client.login(config.token)