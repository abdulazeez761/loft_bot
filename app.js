const Discord = require('discord.js')
const DisTube = require('distube')
const { SoundCloudPlugin} = require('@distube/soundcloud')
const {SpotifyPlugin} = require('@distube/spotify')
const {
    token,
    prefix
} = require('./config.json');
const { default: dist } = require('@discordjs/collection');
const {joinVoiceChannel} = require('@discordjs/voice');
const client = new Discord.Client({
	intents: [
		'GUILDS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		,'GUILD_MEMBERS'
		
	],
})
client.on('ready', () => {
    console.log('ready!')
})

const distube = new DisTube.default(client, {
	searchSongs: 1,
	searchCooldown: 30,
	leaveOnEmpty: true,
	emptyCooldown: 0,
	leaveOnFinish: true,
	leaveOnStop: true,
	plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
})

client.on('messageCreate', message =>{
    if(message.author.bot) return
    if(!message.content.startsWith(prefix)) return
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.reply( "You need to be in a voice channel to play music!")
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift()
    const serverQueue = distube.getQueue(message)
    if(command === 'play'){
        distube.play(message , args.join(' ') ,serverQueue)
    } else if (['repeat', 'loop'].includes(command)) {
		const mode = distube.setRepeatMode(message)
		message.channel.send(`Set repeat mode to \`${mode ? mode === 2 ? 'All Queue' : 'This Song' : 'Off'}\``)
	}else if (command ==='stop'){
        distube.stop(message)
		message.channel.send('Stopped the music!')
    } else if( command === 'resume') distube.resume(message)
	else if (command === 'pause') distube.pause(message)
    else if (command === 'skip') distube.skip(message)
    else if(command === 'queue'){
        let queue = distube.getQueue(message)
        if(!queue){
            message.channel.send('Nothing playing right now!')
        }else {
            message.channel.send(
				`Current queue:\n${queue.songs
					.map(
						(song, id) =>
							`**${id ? id : 'Playing'}**. ${song.name} - \`${
								song.formattedDuration
							}\``,
					)
					.slice(0, 10)
					.join('\n')}`,
			)
		}
	}
    if (
		[
			`3d`,
			`bassboost`,
			`echo`,
			`karaoke`,
			`nightcore`,
			`vaporwave`,
		].includes(command)
	) {
		const filter = distube.setFilter(message, command)
		message.channel.send(
			`Current queue filter: ${filter.join(', ') || 'Off'}`,
		)
	}
})

// Queue status template
// const status = queue =>
// 	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
// 		|| 'Off'}\` | Loop: \`${
// 		queue.repeatMode
// 			? queue.repeatMode === 2
// 				? 'All Queue'
// 				: 'This Song'
// 			: 'Off'
// 	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``

// DisTube event listeners, more in the documentation page
distube
	.on('playSong', (queue, song) =>
		queue.textChannel.send(
			`Playing \`${song.name}\` - \`${
				song.formattedDuration
			}\`\nRequested by: ${song.user}\n`,//\n${status(queue)}
            // console.log(queue , song)
		))
	.on('addSong', (queue, song) =>
		queue.textChannel.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		))
	.on('addList', (queue, playlist) =>
		queue.textChannel.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue`, //\n${status(queue)}
		))
	// DisTubeOptions.searchSongs = true
	.on('searchResult', (message, result) => {
		let i = 0
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${
							song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Enter anything else or wait 30 seconds to cancel*`,
		)
	})
	// DisTubeOptions.searchSongs = true
	.on('searchCancel', message => message.channel.send(`Searching canceled`))
	.on('searchInvalidAnswer', message =>
		message.channel.send(`searchInvalidAnswer`))
	.on('searchNoResult', message => message.channel.send(`No result found!`))
	.on('error', (textChannel, e) => {
		console.error(e)
		textChannel.send(`An error encountered: ${e.slice(0, 2000)}`)
	})
	.on('finish', queue => queue.textChannel.send('Finish queue!'))
	.on('finishSong', queue => queue.textChannel.send('Finish song!'))
	.on('disconnect', queue => queue.textChannel.send('Disconnected!'))
	.on('empty', queue => queue.textChannel.send('Empty!'))
        




//loft's bot

	client.on('voiceStateUpdate' , async (newState, oldState) => {
		if(newState.id =='920790017264193536'){
			joinVoiceChannel({
				channelId: oldState.channelId,
				guildId: oldState.guild.id,
				adapterCreator: oldState.guild.voiceAdapterCreator
			})
		} else if(newState.id == '920790017264193536' && oldState.channelId  ){
			joinVoiceChannel({
				channelId: oldState.channelId,
				guildId: oldState.guild.id,
				adapterCreator: oldState.guild.voiceAdapterCreator
			})
		}

	})

client.login(token)
