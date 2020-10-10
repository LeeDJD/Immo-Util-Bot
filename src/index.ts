import { Client, MessageMentions }  from 'discord.js';
import { promote, demote, employ, toggleInstructor, unemploy } from './roleCommands';

const client = new Client();
const token = process.env.DISCORD_TOKEN_IMMO;

client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
    console.log(`Start Timestamp: ${new Date().toLocaleString('de-DE')}`)
});

client.on('invalidated', () => {
    console.log('Why in the world did the client session became invalid?')
});

client.on('message', async (msg) => {
    if (!msg.guild || msg.author.bot) return;
    const testPattern = new RegExp(`^(${MessageMentions.USERS_PATTERN.source})\\s*`);
    if (!testPattern.test(msg.content)) return;

    const matchedMention = testPattern.exec(msg.content)!.toString();
    const args = msg.content.slice(matchedMention.length).trim().split(/ +/);
    const command = args.shift()!.toLowerCase();
    const mention = await msg.guild.members.fetch(matchedMention!.substring(0, matchedMention.length - 1).substring(3));

    switch (command) {
        case 'befördern':
            promote(args, mention, msg.member!, msg)
            break;
        case 'degradieren':
            demote(args, mention, msg.member!, msg)
            break;
        case 'kripo':
            break;
        case 'ausbilder':
            toggleInstructor(args, mention, msg.member!, msg)
            break;
        case 'entlassen':
            unemploy(args, mention, msg.member!, msg)
            break;
        case 'einstellen':
            employ(args, mention, msg.member!, msg)
            break;
        default:
            return;
    }
    msg.delete();
});


//#region MFD Sync
const immoguildID = '607302555097235456';
const mfdguildID = '690635527098990613';
const mfdRoleID = '690643807418712114';

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id == mfdguildID) {
        let immoGuild = await client.guilds.fetch(immoguildID);
        try {
            let immoUser = await immoGuild.members.fetch(member.id);
            member.roles.add(mfdRoleID, "Bürger Rechte zugewiesen");
        } catch (err) {
            return;
        }
    } else if (member.guild.id == immoguildID) {
        let mfdGuild = await client.guilds.fetch(mfdguildID);
        try {
            let mfdUser = await mfdGuild.members.fetch(member.id);
            mfdUser.roles.add(mfdRoleID, "Bürger Rechte zugewiesen");
        } catch (err) {
            return;
        }
    }
});

client.on('guildMemberRemove', async (member) => {
    if (member.guild.id == immoguildID) {
        let mfdGuild = await client.guilds.fetch(mfdguildID);
        try {
            let mfdUser = await mfdGuild.members.fetch(member.id);
            mfdUser.roles.remove(mfdRoleID, "Bürger Rechte entzogen");
        } catch (err) {
            return;
        }
    }
});

//#endregion

client.login(token);