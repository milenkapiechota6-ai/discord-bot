const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    AttachmentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');

// =====================================================
// BOT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// =====================================================
// USTAWIENIA
// =====================================================

const TOKEN = process.env.TOKEN;;

const CLIENT_ID = '1533513404659011776';
const GUILD_ID = '1532465455086960750';

// =====================================================
// ROLA ADMINISTRACJI
// =====================================================

const SUPPORT_ROLE_ID = '1533218646086783067';

// =====================================================
// TICKETY
// =====================================================

const TICKET_PANEL_CHANNEL_ID = '1533233893342445708';
const TICKET_CATEGORY_ID = '1536866515582980256';

// =====================================================
// LOGI MODERACJI
// =====================================================

const LOG_CHANNEL_ID = '1533235199972999248';

// =====================================================
// KOLORY
// =====================================================

const TICKET_COLOR = 0xcd7890;
const PINK_COLOR = 0xff9fc5;
const DARK_PINK = 0xd96b99;

// =====================================================
// SYSTEM WARNÓW
// =====================================================

const WARNS_FILE = './warns.json';

if (!fs.existsSync(WARNS_FILE)) {
    fs.writeFileSync(WARNS_FILE, '{}');
}

function loadWarns() {
    try {
        return JSON.parse(
            fs.readFileSync(WARNS_FILE, 'utf8')
        );
    } catch (error) {
        console.error(
            '❌ Nie udało się odczytać warns.json:',
            error
        );

        return {};
    }
}

function saveWarns(warns) {
    try {
        fs.writeFileSync(
            WARNS_FILE,
            JSON.stringify(warns, null, 4)
        );

        return true;

    } catch (error) {

        console.error(
            '❌ Nie udało się zapisać warns.json:',
            error
        );

        return false;
    }
}

// =====================================================
// REJESTRACJA KOMEND
// =====================================================

const commands = [

    // =================================================
    // TICKET
    // =================================================

    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Wyślij panel ticketów'),

    // =================================================
    // WARN
    // =================================================

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Nadaj użytkownikowi ostrzeżenie')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba, którą chcesz ostrzec')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('powod')
                .setDescription('Powód ostrzeżenia')
                .setRequired(true)
                .setMaxLength(500)
        ),

    // =================================================
    // WARNS
    // =================================================

    new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Sprawdź historię ostrzeżeń użytkownika')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba, której chcesz sprawdzić warny')
                .setRequired(true)
        ),

    // =================================================
    // CLEAR WARNS
    // =================================================

    new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Usuń wszystkie ostrzeżenia użytkownika')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba, której chcesz usunąć warny')
                .setRequired(true)
        ),

    // =================================================
    // MUTE
    // =================================================

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Wycisz użytkownika')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba do wyciszenia')
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName('czas')
                .setDescription('Czas wyciszenia w minutach')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )

        .addStringOption(option =>
            option
                .setName('powod')
                .setDescription('Powód wyciszenia')
                .setRequired(true)
                .setMaxLength(500)
        ),

    // =================================================
    // UNMUTE
    // =================================================

    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Zdejmij wyciszenie użytkownika')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba, której chcesz zdjąć mute')
                .setRequired(true)
        ),

    // =================================================
    // KICK
    // =================================================

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba do wyrzucenia')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('powod')
                .setDescription('Powód wyrzucenia')
                .setRequired(true)
                .setMaxLength(500)
        ),

    // =================================================
    // BAN
    // =================================================

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika')

        .addUserOption(option =>
            option
                .setName('osoba')
                .setDescription('Osoba do zbanowania')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('powod')
                .setDescription('Powód bana')
                .setRequired(true)
                .setMaxLength(500)
        ),

    // =================================================
    // UNBAN
    // =================================================

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Odbanuj użytkownika')

        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('ID użytkownika do odbanowania')
                .setRequired(true)
        )

].map(command => command.toJSON());

// =====================================================
// REJESTRACJA KOMEND
// =====================================================

const rest = new REST({
    version: '10'
}).setToken(TOKEN);

(async () => {

    try {

        console.log(
            '🧹 Usuwanie starych globalnych komend...'
        );

        // Usuwamy stare globalne komendy.
        // Dzięki temu nie będą pojawiać się podwójne
        // wersje polskie/angielskie.
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            {
                body: []
            }
        );

        console.log(
            '✅ Stare globalne komendy usunięte.'
        );

        console.log(
            '🎀 Rejestrowanie aktualnych komend...'
        );

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            '🎀 Komendy zostały zarejestrowane!'
        );

    } catch (error) {

        console.error(
            '❌ Błąd rejestracji komend:',
            error
        );

    }

})();

// =====================================================
// BOT GOTOWY
// =====================================================

client.once('clientReady', () => {

    console.log(
        `🎀 Zalogowano jako ${client.user.tag}`
    );

});

// =====================================================
// FUNKCJA LOGÓW
// =====================================================

async function sendModLog({
    guild,
    action,
    target,
    moderator,
    reason,
    extra = ''
}) {

    try {

        if (!guild) {

            console.error(
                '❌ Brak serwera w sendModLog.'
            );

            return;
        }

        const channel =
            guild.channels.cache.get(
                LOG_CHANNEL_ID
            );

        if (!channel) {

            console.error(
                `❌ Nie znaleziono kanału logów ${LOG_CHANNEL_ID}.`
            );

            return;
        }

        if (!channel.isTextBased()) {

            console.error(
                '❌ Kanał logów nie jest kanałem tekstowym.'
            );

            return;
        }

        const targetId =
            target?.id || 'brak ID';

        const targetMention =
            target?.id
                ? `<@${target.id}>`
                : 'Nieznany użytkownik';

        const moderatorMention =
            moderator?.id
                ? `<@${moderator.id}>`
                : 'Nieznany moderator';

        const targetName =
            target?.tag ||
            target?.username ||
            target?.user?.tag ||
            'Nieznany użytkownik';

        const embed =
            new EmbedBuilder()

                .setColor(
                    PINK_COLOR
                )

                .setTitle(
                    `🎀 ${action}`
                )

                .setDescription(

                    `╭───────────────╮\n` +
                    `💗 **INFORMACJE O KARZE**\n` +
                    `╰───────────────╯\n\n` +

                    `👤 **Użytkownik:** ${targetMention}\n` +
                    `📛 **Nazwa:** ${targetName}\n` +
                    `🛡️ **Moderator:** ${moderatorMention}\n` +
                    `🎀 **Powód:** ${reason || 'Nie podano'}\n` +

                    (
                        extra
                            ? `\n${extra}\n`
                            : ''
                    ) +

                    `\n🌸 **ID użytkownika:** \`${targetId}\``
                )

                .setTimestamp()

                .setFooter({
                    text:
                        '🎀 System moderacji • Administracja'
                });

        await channel.send({
            embeds: [
                embed
            ]
        });

        console.log(
            `📋 Wysłano log: ${action}`
        );

    } catch (error) {

        console.error(
            '❌ Nie udało się wysłać logu:',
            error
        );

    }

}

// =====================================================
// FUNKCJA PW
// =====================================================

async function sendPunishmentDM({
    user,
    guild,
    action,
    reason,
    moderator,
    extra = ''
}) {

    try {

        const embed =
            new EmbedBuilder()

                .setColor(
                    PINK_COLOR
                )

                .setTitle(
                    `🎀 ${action}`
                )

                .setDescription(

                    `💗 **Hej! Otrzymałaś/otrzymałeś karę na serwerze.**\n\n` +

                    `╭───────────────╮\n` +
                    `🌸 **INFORMACJE**\n` +
                    `╰───────────────╯\n\n` +

                    `🎀 **Serwer:**\n${guild.name}\n\n` +

                    `⚠️ **Powód:**\n${reason}\n\n` +

                    `🛡️ **Administrator:**\n${moderator}\n` +

                    (
                        extra
                            ? `\n${extra}\n`
                            : ''
                    ) +

                    `\n💌 Jeśli uważasz, że kara została nałożona niesłusznie, skontaktuj się z administracją serwera.`
                )

                .setFooter({
                    text:
                        '🎀 Administracja • System moderacji'
                });

        await user.send({
            embeds: [
                embed
            ]
        });

        return true;

    } catch (error) {

        console.log(
            `⚠️ Nie udało się wysłać PW do użytkownika ${user?.id || 'unknown'}.`
        );

        return false;
    }

}

// =====================================================
// INTERAKCJE
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        try {

            // =================================================
            // KOMENDY
            // =================================================

            if (interaction.isChatInputCommand()) {

                // =================================================
                // /TICKET
                // =================================================

                if (
                    interaction.commandName === 'ticket'
                ) {

                    const panelChannel =
                        interaction.guild.channels.cache.get(
                            TICKET_PANEL_CHANNEL_ID
                        );

                    if (!panelChannel) {

                        return interaction.reply({

                            content:
                                '❌ Nie znaleziono kanału panelu ticketów.',

                            ephemeral: true

                        });

                    }

                    const image =
                        new AttachmentBuilder(
                            './ticket.png'
                        );

                    const embed =
                        new EmbedBuilder()

                            .setColor(
                                TICKET_COLOR
                            )

                            .setTitle(
                                '🎀  TICKET CENTER'
                            )

                            .setDescription(

                                'Potrzebujesz pomocy? Otwórz ticket, a nasza administracja zajmie się Twoją sprawą.\n\n' +

                                '🔒 **Ticket jest prywatny.**\n' +
                                '💌 **Opisz dokładnie swój problem.**\n\n' +

                                '🌸 Kliknij przycisk poniżej, aby skontaktować się z administracją! 🎀'

                            )

                            .setImage(
                                'attachment://ticket.png'
                            )

                            .setFooter({
                                text:
                                    '🎀 Ticket Center • Administracja'
                            });

                    const openButton =
                        new ButtonBuilder()

                            .setCustomId(
                                'create_ticket'
                            )

                            .setLabel(
                                'Otwórz ticket'
                            )

                            .setEmoji(
                                '🎀'
                            )

                            .setStyle(
                                ButtonStyle.Primary
                            );

                    const row =
                        new ActionRowBuilder()
                            .addComponents(
                                openButton
                            );

                    await panelChannel.send({

                        embeds: [
                            embed
                        ],

                        files: [
                            image
                        ],

                        components: [
                            row
                        ]

                    });

                    return interaction.reply({

                        content:
                            `🎀 Panel ticketów został wysłany na ${panelChannel}.`,

                        ephemeral: true

                    });

                }

                // =================================================
                // KOMENDY MODERACYJNE
                // =================================================

                if (

                    [
                        'warn',
                        'warns',
                        'clearwarns',
                        'mute',
                        'unmute',
                        'kick',
                        'ban',
                        'unban'

                    ].includes(
                        interaction.commandName
                    )

                ) {

                    // =================================================
                    // SPRAWDZENIE ADMINISTRACJI
                    // =================================================

                    if (

                        !interaction.member.roles.cache.has(
                            SUPPORT_ROLE_ID
                        )

                    ) {

                        return interaction.reply({

                            content:
                                '🎀 Nie masz uprawnień do używania komend moderacyjnych.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // /UNBAN
                    // =================================================

                    if (
                        interaction.commandName === 'unban'
                    ) {

                        const userId =
                            interaction.options.getString(
                                'id'
                            );

                        try {

                            const bannedUsers =
                                await interaction.guild.bans.fetch();

                            const bannedUser =
                                bannedUsers.get(
                                    userId
                                );

                            if (!bannedUser) {

                                return interaction.reply({

                                    content:
                                        '❌ Ten użytkownik nie znajduje się na liście banów.',

                                    ephemeral: true

                                });

                            }

                            await interaction.guild.members.unban(
                                userId
                            );

                            const embed =
                                new EmbedBuilder()

                                    .setColor(
                                        PINK_COLOR
                                    )

                                    .setTitle(
                                        '🎀 Użytkownik odbanowany!'
                                    )

                                    .setDescription(

                                        `💗 **Gotowe!**\n\n` +

                                        `👤 **Użytkownik:** ${bannedUser.user.tag}\n\n` +

                                        `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                        `🌸 Użytkownik może ponownie dołączyć na serwer!`

                                    )

                                    .setFooter({
                                        text:
                                            '🎀 Administracja • System moderacji'
                                    });

                            await interaction.reply({
                                embeds: [
                                    embed
                                ]
                            });

                            await sendModLog({

                                guild:
                                    interaction.guild,

                                action:
                                    'Użytkownik odbanowany',

                                target:
                                    bannedUser.user,

                                moderator:
                                    interaction.user,

                                reason:
                                    'Odbanowanie użytkownika'

                            });

                            return;

                        } catch (error) {

                            console.error(
                                '❌ UNBAN ERROR:',
                                error
                            );

                            if (!interaction.replied) {

                                return interaction.reply({

                                    content:
                                        '❌ Nie udało się odbanować użytkownika. Sprawdź ID.',

                                    ephemeral: true

                                });

                            }

                            return;

                        }

                    }

                    // =================================================
                    // POBRANIE OSOBY
                    // =================================================

                    const target =
                        interaction.options.getUser(
                            'osoba'
                        );

                    if (!target) {

                        console.error(
                            `❌ Nie znaleziono użytkownika w komendzie /${interaction.commandName}.`
                        );

                        return interaction.reply({

                            content:
                                '❌ Nie wybrano użytkownika. Wybierz osobę z listy przy komendzie.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // /WARNS
                    // =================================================

                    if (
                        interaction.commandName === 'warns'
                    ) {

                        const warns =
                            loadWarns();

                        const userWarns =
                            warns[target.id] || [];

                        if (
                            userWarns.length === 0
                        ) {

                            const embed =
                                new EmbedBuilder()

                                    .setColor(
                                        PINK_COLOR
                                    )

                                    .setTitle(
                                        '🌸 Historia ostrzeżeń'
                                    )

                                    .setDescription(

                                        `💗 **${target.tag}** nie posiada żadnych warnów!\n\n` +

                                        `✨ Czysta kartoteka! 🎀`

                                    )

                                    .setFooter({
                                        text:
                                            '🎀 System ostrzeżeń'
                                    });

                            return interaction.reply({

                                embeds: [
                                    embed
                                ],

                                ephemeral: true

                            });

                        }

                        let description =
                            `💗 **Użytkownik:** ${target}\n` +
                            `⚠️ **Liczba warnów:** ${userWarns.length}\n\n`;

                        userWarns.forEach(
                            (warn, index) => {

                                const date =
                                    new Date(
                                        warn.date
                                    ).toLocaleString(
                                        'pl-PL'
                                    );

                                description +=

                                    `╭───────────────╮\n` +
                                    `🎀 **Warn #${index + 1}**\n` +
                                    `💌 **Powód:** ${warn.reason}\n` +
                                    `🛡️ **Moderator:** <@${warn.moderator}>\n` +
                                    `🕐 **Data:** ${date}\n\n`;

                            }
                        );

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    PINK_COLOR
                                )

                                .setTitle(
                                    '🌸 Historia ostrzeżeń'
                                )

                                .setDescription(
                                    description
                                )

                                .setFooter({
                                    text:
                                        '🎀 System ostrzeżeń'
                                });

                        return interaction.reply({

                            embeds: [
                                embed
                            ],

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // /CLEARWARNS
                    // =================================================

                    if (
                        interaction.commandName === 'clearwarns'
                    ) {

                        const warns =
                            loadWarns();

                        const amount =
                            warns[target.id]
                                ? warns[target.id].length
                                : 0;

                        delete warns[target.id];

                        saveWarns(
                            warns
                        );

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    PINK_COLOR
                                )

                                .setTitle(
                                    '🧹 Warny wyczyszczone!'
                                )

                                .setDescription(

                                    `💗 **Użytkownik:** ${target}\n\n` +

                                    `🌸 Usunięto warnów: **${amount}**\n\n` +

                                    `🛡️ **Wykonał:** ${interaction.user}\n\n` +

                                    `✨ Kartoteka użytkownika została wyczyszczona!`

                                )

                                .setFooter({
                                    text:
                                        '🎀 System ostrzeżeń'
                                });

                        await interaction.reply({

                            embeds: [
                                embed
                            ]

                        });

                        await sendModLog({

                            guild:
                                interaction.guild,

                            action:
                                'Wyzerowano warny',

                            target:
                                target,

                            moderator:
                                interaction.user,

                            reason:
                                `Usunięto ${amount} warnów`

                        });

                        return;

                    }

                    // =================================================
                    // POZOSTAŁE KOMENDY
                    // =================================================

                    const reason =
                        interaction.options.getString(
                            'powod'
                        );

                    const member =
                        await interaction.guild.members
                            .fetch(
                                target.id
                            )
                            .catch(
                                () => null
                            );

                    if (!member) {

                        return interaction.reply({

                            content:
                                '❌ Nie znaleziono tej osoby na serwerze.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // BOT
                    // =================================================

                    if (
                        target.bot
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Nie możesz ukarać bota.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // SIEBIE
                    // =================================================

                    if (
                        target.id === interaction.user.id
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Nie możesz ukarać samej siebie.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // HIERARCHIA ADMINA
                    // =================================================

                    if (

                        member.roles.highest.position >=
                        interaction.member.roles.highest.position

                    ) {

                        return interaction.reply({

                            content:
                                '❌ Nie możesz ukarać osoby posiadającej taką samą lub wyższą rolę.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // HIERARCHIA BOTA
                    // =================================================

                    const botMember =
                        interaction.guild.members.me;

                    if (!botMember) {

                        return interaction.reply({

                            content:
                                '❌ Nie udało się znaleźć mojej roli na serwerze.',

                            ephemeral: true

                        });

                    }

                    if (

                        member.roles.highest.position >=
                        botMember.roles.highest.position

                    ) {

                        return interaction.reply({

                            content:
                                '❌ Moja najwyższa rola jest niżej niż najwyższa rola tej osoby. Przenieś moją rolę wyżej.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // WARN
                    // =================================================

                    if (
                        interaction.commandName === 'warn'
                    ) {

                        try {

                            // Odpowiadamy Discordowi od razu.
                            await interaction.deferReply();

                            const warns =
                                loadWarns();

                            if (
                                !warns[target.id]
                            ) {

                                warns[target.id] = [];

                            }

                            warns[target.id].push({

                                reason:
                                    reason,

                                moderator:
                                    interaction.user.id,

                                date:
                                    new Date().toISOString()

                            });

                            const saved =
                                saveWarns(
                                    warns
                                );

                            if (!saved) {

                                throw new Error(
                                    'Nie udało się zapisać warnów do pliku.'
                                );

                            }

                            const warnCount =
                                warns[target.id].length;

                            // =================================================
                            // PW
                            // =================================================

                            const dmSent =
                                await sendPunishmentDM({

                                    user:
                                        target,

                                    guild:
                                        interaction.guild,

                                    action:
                                        'Otrzymałaś/otrzymałeś ostrzeżenie ⚠️',

                                    reason:
                                        reason,

                                    moderator:
                                        interaction.user,

                                    extra:
                                        `⚠️ **Liczba Twoich warnów:** ${warnCount}`

                                });

                            // =================================================
                            // EMBED
                            // =================================================

                            const embed =
                                new EmbedBuilder()

                                    .setColor(
                                        PINK_COLOR
                                    )

                                    .setTitle(
                                        '⚠️ Warn nadany!'
                                    )

                                    .setDescription(

                                        `╭───────────────╮\n` +
                                        `🎀 **OSTRZEŻENIE**\n` +
                                        `╰───────────────╯\n\n` +

                                        `👤 **Użytkownik:** ${target}\n\n` +

                                        `💌 **Powód:**\n${reason}\n\n` +

                                        `⚠️ **Warnów:** ${warnCount}\n\n` +

                                        `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                        (
                                            dmSent
                                                ? '💗 Wiadomość została wysłana na PW.'
                                                : '💔 Nie udało się wysłać wiadomości na PW.'
                                        )

                                    )

                                    .setFooter({
                                        text:
                                            '🎀 Administracja • System ostrzeżeń'
                                    });

                            await interaction.editReply({

                                embeds: [
                                    embed
                                ]

                            });

                            // =================================================
                            // LOG
                            // =================================================

                            await sendModLog({

                                guild:
                                    interaction.guild,

                                action:
                                    'Nadano ostrzeżenie ⚠️',

                                target:
                                    target,

                                moderator:
                                    interaction.user,

                                reason:
                                    reason,

                                extra:
                                    `⚠️ Liczba warnów: ${warnCount}`

                            });

                            return;

                        } catch (error) {

                            console.error(
                                '❌ WARN ERROR:',
                                error
                            );

                            try {

                                if (
                                    interaction.deferred
                                ) {

                                    await interaction.editReply({

                                        content:
                                            '❌ Nie udało się nadać warna. Sprawdź konsolę bota.',

                                        embeds: []

                                    });

                                } else if (
                                    !interaction.replied
                                ) {

                                    await interaction.reply({

                                        content:
                                            '❌ Nie udało się nadać warna. Sprawdź konsolę bota.',

                                        ephemeral: true

                                    });

                                }

                            } catch (replyError) {

                                console.error(
                                    '❌ Błąd odpowiedzi po błędzie WARNA:',
                                    replyError
                                );

                            }

                            return;

                        }

                    }

                    // =================================================
                    // MUTE
                    // =================================================

                    if (
                        interaction.commandName === 'mute'
                    ) {

                        const duration =
                            interaction.options.getInteger(
                                'czas'
                            );

                        const milliseconds =
                            duration * 60 * 1000;

                        try {

                            await member.timeout(
                                milliseconds,
                                reason
                            );

                        } catch (error) {

                            console.error(
                                '❌ MUTE ERROR:',
                                error
                            );

                            return interaction.reply({

                                content:
                                    '❌ Nie udało się wyciszyć użytkownika. Bot potrzebuje uprawnienia **Moderate Members**.',

                                ephemeral: true

                            });

                        }

                        const dmSent =
                            await sendPunishmentDM({

                                user:
                                    target,

                                guild:
                                    interaction.guild,

                                action:
                                    'Otrzymałaś/otrzymałeś wyciszenie 🔇',

                                reason:
                                    reason,

                                moderator:
                                    interaction.user,

                                extra:
                                    `⏱️ **Czas:** ${duration} minut`

                            });

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    PINK_COLOR
                                )

                                .setTitle(
                                    '🔇 Mute nadany!'
                                )

                                .setDescription(

                                    `💗 **Użytkownik został wyciszony!**\n\n` +

                                    `👤 **Użytkownik:** ${target}\n\n` +

                                    `⏱️ **Czas:** ${duration} minut\n\n` +

                                    `🎀 **Powód:**\n${reason}\n\n` +

                                    `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                    (
                                        dmSent
                                            ? '💌 Wiadomość została wysłana na PW.'
                                            : '💔 Nie udało się wysłać wiadomości na PW.'
                                    )

                                )

                                .setFooter({
                                    text:
                                        '🎀 Administracja • System kar'
                                });

                        await interaction.reply({

                            embeds: [
                                embed
                            ]

                        });

                        await sendModLog({

                            guild:
                                interaction.guild,

                            action:
                                'Nadano wyciszenie 🔇',

                            target:
                                target,

                            moderator:
                                interaction.user,

                            reason:
                                reason,

                            extra:
                                `⏱️ Czas: ${duration} minut`

                        });

                        return;

                    }

                    // =================================================
                    // UNMUTE
                    // =================================================

                    if (
                        interaction.commandName === 'unmute'
                    ) {

                        try {

                            await member.timeout(
                                null,
                                'Wyciszenie zdjęte przez administrację'
                            );

                        } catch (error) {

                            console.error(
                                '❌ UNMUTE ERROR:',
                                error
                            );

                            return interaction.reply({

                                content:
                                    '❌ Nie udało się zdjąć wyciszenia.',

                                ephemeral: true

                            });

                        }

                        const dmSent =
                            await sendPunishmentDM({

                                user:
                                    target,

                                guild:
                                    interaction.guild,

                                action:
                                    'Wyciszenie zostało zdjęte 🎀',

                                reason:
                                    'Administracja zdjęła wyciszenie.',

                                moderator:
                                    interaction.user

                            });

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    PINK_COLOR
                                )

                                .setTitle(
                                    '🎀 Unmute!'
                                )

                                .setDescription(

                                    `💗 **Wyciszenie zostało zdjęte!**\n\n` +

                                    `👤 **Użytkownik:** ${target}\n\n` +

                                    `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                    (
                                        dmSent
                                            ? '💌 Użytkownik otrzymał wiadomość na PW.'
                                            : '💔 Nie udało się wysłać wiadomości na PW.'
                                    )

                                )

                                .setFooter({
                                    text:
                                        '🎀 Administracja • System kar'
                                });

                        await interaction.reply({

                            embeds: [
                                embed
                            ]

                        });

                        await sendModLog({

                            guild:
                                interaction.guild,

                            action:
                                'Zdjęto wyciszenie 🎀',

                            target:
                                target,

                            moderator:
                                interaction.user,

                            reason:
                                'Wyciszenie zostało zdjęte.'

                        });

                        return;

                    }

                    // =================================================
                    // KICK
                    // =================================================

                    if (
                        interaction.commandName === 'kick'
                    ) {

                        const dmSent =
                            await sendPunishmentDM({

                                user:
                                    target,

                                guild:
                                    interaction.guild,

                                action:
                                    'Zostałaś/zostałeś wyrzucona/y z serwera 👢',

                                reason:
                                    reason,

                                moderator:
                                    interaction.user

                            });

                        try {

                            await member.kick(
                                reason
                            );

                        } catch (error) {

                            console.error(
                                '❌ KICK ERROR:',
                                error
                            );

                            return interaction.reply({

                                content:
                                    '❌ Nie udało się wyrzucić użytkownika. Bot potrzebuje uprawnienia **Kick Members**.',

                                ephemeral: true

                            });

                        }

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    PINK_COLOR
                                )

                                .setTitle(
                                    '👢 Użytkownik wyrzucony!'
                                )

                                .setDescription(

                                    `╭───────────────╮\n` +
                                    `🎀 **KICK**\n` +
                                    `╰───────────────╯\n\n` +

                                    `👤 **Użytkownik:** ${target}\n\n` +

                                    `💌 **Powód:**\n${reason}\n\n` +

                                    `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                    (
                                        dmSent
                                            ? '💗 Wiadomość została wysłana na PW.'
                                            : '💔 Nie udało się wysłać wiadomości na PW.'
                                    )

                                )

                                .setFooter({
                                    text:
                                        '🎀 Administracja • System kar'
                                });

                        await interaction.reply({

                            embeds: [
                                embed
                            ]

                        });

                        await sendModLog({

                            guild:
                                interaction.guild,

                            action:
                                'Wyrzucono użytkownika 👢',

                            target:
                                target,

                            moderator:
                                interaction.user,

                            reason:
                                reason

                        });

                        return;

                    }

                    // =================================================
                    // BAN
                    // =================================================

                    if (
                        interaction.commandName === 'ban'
                    ) {

                        const dmSent =
                            await sendPunishmentDM({

                                user:
                                    target,

                                guild:
                                    interaction.guild,

                                action:
                                    'Zostałaś/zostałeś zbanowana/y 🔨',

                                reason:
                                    reason,

                                moderator:
                                    interaction.user

                            });

                        try {

                            await member.ban({

                                reason:
                                    reason

                            });

                        } catch (error) {

                            console.error(
                                '❌ BAN ERROR:',
                                error
                            );

                            return interaction.reply({

                                content:
                                    '❌ Nie udało się zbanować użytkownika. Bot potrzebuje uprawnienia **Ban Members**.',

                                ephemeral: true

                            });

                        }

                        const embed =
                            new EmbedBuilder()

                                .setColor(
                                    DARK_PINK
                                )

                                .setTitle(
                                    '🔨 Użytkownik zbanowany!'
                                )

                                .setDescription(

                                    `╭───────────────╮\n` +
                                    `🎀 **BAN**\n` +
                                    `╰───────────────╯\n\n` +

                                    `👤 **Użytkownik:** ${target}\n\n` +

                                    `💌 **Powód:**\n${reason}\n\n` +

                                    `🛡️ **Administrator:** ${interaction.user}\n\n` +

                                    (
                                        dmSent
                                            ? '💗 Wiadomość została wysłana na PW.'
                                            : '💔 Nie udało się wysłać wiadomości na PW.'
                                    )

                                )

                                .setFooter({
                                    text:
                                        '🎀 Administracja • System kar'
                                });

                        await interaction.reply({

                            embeds: [
                                embed
                            ]

                        });

                        await sendModLog({

                            guild:
                                interaction.guild,

                            action:
                                'Zbanowano użytkownika 🔨',

                            target:
                                target,

                            moderator:
                                interaction.user,

                            reason:
                                reason

                        });

                        return;

                    }

                }

            }

            // =================================================
            // PRZYCISKI
            // =================================================

            if (
                interaction.isButton()
            ) {

                // =================================================
                // OTWIERANIE TICKETU
                // =================================================

                if (
                    interaction.customId === 'create_ticket'
                ) {

                    const existingTicket =
                        interaction.guild.channels.cache.find(

                            channel =>

                                channel.topic ===
                                    `ticket-owner:${interaction.user.id}` &&

                                channel.type ===
                                    ChannelType.GuildText

                        );

                    if (existingTicket) {

                        return interaction.reply({

                            content:
                                `🎀 Masz już otwarty ticket: ${existingTicket}`,

                            ephemeral: true

                        });

                    }

                    const category =
                        interaction.guild.channels.cache.get(
                            TICKET_CATEGORY_ID
                        );

                    if (!category) {

                        return interaction.reply({

                            content:
                                '❌ Nie znaleziono kategorii ticketów. Sprawdź ID kategorii.',

                            ephemeral: true

                        });

                    }

                    if (
                        category.type !==
                        ChannelType.GuildCategory
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Podane ID nie jest kategorią Discord.',

                            ephemeral: true

                        });

                    }

                    // =================================================
                    // TWORZENIE TICKETU
                    // =================================================

                    const username =
                        interaction.user.username
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]/g,
                                '-'
                            )
                            .slice(
                                0,
                                20
                            );

                    const ticket =
                        await interaction.guild.channels.create({

                            name:
                                `🎀・ticket-${username}`,

                            type:
                                ChannelType.GuildText,

                            topic:
                                `ticket-owner:${interaction.user.id}`,

                            permissionOverwrites: [

                                {
                                    id:
                                        interaction.guild.id,

                                    deny: [
                                        PermissionsBitField.Flags.ViewChannel
                                    ]
                                },

                                {
                                    id:
                                        interaction.user.id,

                                    allow: [

                                        PermissionsBitField.Flags.ViewChannel,

                                        PermissionsBitField.Flags.SendMessages,

                                        PermissionsBitField.Flags.ReadMessageHistory,

                                        PermissionsBitField.Flags.AttachFiles,

                                        PermissionsBitField.Flags.EmbedLinks

                                    ]
                                },

                                {
                                    id:
                                        SUPPORT_ROLE_ID,

                                    allow: [

                                        PermissionsBitField.Flags.ViewChannel,

                                        PermissionsBitField.Flags.SendMessages,

                                        PermissionsBitField.Flags.ReadMessageHistory,

                                        PermissionsBitField.Flags.AttachFiles,

                                        PermissionsBitField.Flags.EmbedLinks

                                    ]
                                },

                                {
                                    id:
                                        client.user.id,

                                    allow: [

                                        PermissionsBitField.Flags.ViewChannel,

                                        PermissionsBitField.Flags.SendMessages,

                                        PermissionsBitField.Flags.ReadMessageHistory,

                                        PermissionsBitField.Flags.ManageChannels

                                    ]
                                }

                            ]

                        });

                    // =================================================
                    // KATEGORIA
                    // =================================================

                    try {

                        await ticket.setParent(

                            TICKET_CATEGORY_ID,

                            {
                                lockPermissions: false
                            }

                        );

                    } catch (error) {

                        console.error(
                            '❌ Nie udało się przenieść ticketu:',
                            error
                        );

                    }

                    // =================================================
                    // OBRAZEK
                    // =================================================

                    const ticketImage =
                        new AttachmentBuilder(
                            './ticket.png'
                        );

                    // =================================================
                    // WIADOMOŚĆ POWITALNA
                    // =================================================

                    const welcomeEmbed =
                        new EmbedBuilder()

                            .setColor(
                                TICKET_COLOR
                            )

                            .setTitle(
                                '🎀  WITAJ W SWOIM TICKecie!'
                            )

                            .setDescription(

                                `💌 **Hej, ${interaction.user}!**\n\n` +

                                '🌸 Dziękujemy za kontakt z naszą administracją!\n\n' +

                                '╭───────────────╮\n' +
                                '💗 **W CZYM MOŻEMY CI POMÓC?**\n' +
                                '╰───────────────╯\n\n' +

                                'Opisz poniżej dokładnie swój problem lub pytanie, ' +
                                'a nasza administracja zajmie się Twoją sprawą. ✨\n\n' +

                                '🎀 **WAŻNE INFORMACJE**\n' +

                                '> 🌷 Opisz problem możliwie dokładnie\n' +
                                '> 🕐 Poczekaj cierpliwie na odpowiedź\n' +
                                '> 💌 Nie oznaczaj administracji bez potrzeby\n\n' +

                                '🔒 **PRYWATNY TICKET**\n' +

                                'Tę rozmowę widzisz tylko Ty oraz administracja.\n\n' +

                                '╭───────────────╮\n' +
                                '🩷 Miłej rozmowy!\n' +
                                '✨ Administracja jest tutaj, aby Ci pomóc!\n' +
                                '╰───────────────╯'

                            )

                            .setImage(
                                'attachment://ticket.png'
                            )

                            .setFooter({

                                text:
                                    '🎀 Ticket Center • Administracja'

                            });

                    // =================================================
                    // PRZYCISK ZAMKNIĘCIA
                    // =================================================

                    const closeButton =
                        new ButtonBuilder()

                            .setCustomId(
                                'close_ticket'
                            )

                            .setLabel(
                                'Zamknij ticket'
                            )

                            .setEmoji(
                                '🎀'
                            )

                            .setStyle(
                                ButtonStyle.Danger
                            );

                    const closeRow =
                        new ActionRowBuilder()
                            .addComponents(
                                closeButton
                            );

                    // =================================================
                    // WIADOMOŚĆ W TICKecie
                    // =================================================

                    await ticket.send({

                        content:
                            `🎀 ${interaction.user} <@&${SUPPORT_ROLE_ID}>`,

                        embeds: [
                            welcomeEmbed
                        ],

                        files: [
                            ticketImage
                        ],

                        components: [
                            closeRow
                        ]

                    });

                    return interaction.reply({

                        content:
                            `🎀 Twój ticket został utworzony: ${ticket}`,

                        ephemeral: true

                    });

                }

                // =================================================
                // ZAMKNIĘCIE TICKETU
                // =================================================

                if (
                    interaction.customId === 'close_ticket'
                ) {

                    if (

                        !interaction.member.roles.cache.has(
                            SUPPORT_ROLE_ID
                        )

                    ) {

                        return interaction.reply({

                            content:
                                '❌ Tylko administracja może zamknąć ticket.',

                            ephemeral: true

                        });

                    }

                    const modal =
                        new ModalBuilder()

                            .setCustomId(
                                'close_ticket_modal'
                            )

                            .setTitle(
                                '🎀 Zamknięcie ticketu'
                            );

                    const reasonInput =
                        new TextInputBuilder()

                            .setCustomId(
                                'close_reason'
                            )

                            .setLabel(
                                'Powód zamknięcia ticketu'
                            )

                            .setPlaceholder(
                                'Np. Problem został rozwiązany.'
                            )

                            .setStyle(
                                TextInputStyle.Paragraph
                            )

                            .setRequired(
                                true
                            )

                            .setMinLength(
                                3
                            )

                            .setMaxLength(
                                500
                            );

                    const reasonRow =
                        new ActionRowBuilder()
                            .addComponents(
                                reasonInput
                            );

                    modal.addComponents(
                        reasonRow
                    );

                    return interaction.showModal(
                        modal
                    );

                }

            }

            // =================================================
            // MODAL
            // =================================================

            if (
                interaction.isModalSubmit()
            ) {

                if (
                    interaction.customId !==
                    'close_ticket_modal'
                ) {

                    return;
                }

                if (

                    !interaction.member.roles.cache.has(
                        SUPPORT_ROLE_ID
                    )

                ) {

                    return interaction.reply({

                        content:
                            '❌ Tylko administracja może zamknąć ticket.',

                        ephemeral: true

                    });

                }

                const reason =
                    interaction.fields.getTextInputValue(
                        'close_reason'
                    );

                const ticketChannel =
                    interaction.channel;

                let ownerId =
                    null;

                if (
                    ticketChannel.topic
                ) {

                    const match =
                        ticketChannel.topic.match(
                            /^ticket-owner:(\d+)$/
                        );

                    if (match) {

                        ownerId =
                            match[1];

                    }

                }

                let ticketOwner =
                    null;

                if (
                    ownerId
                ) {

                    try {

                        ticketOwner =
                            await client.users.fetch(
                                ownerId
                            );

                    } catch (error) {

                        console.error(
                            '❌ Nie udało się znaleźć właściciela ticketu:',
                            error
                        );

                    }

                }

                // =================================================
                // WIADOMOŚĆ W TICKecie
                // =================================================

                await interaction.reply({

                    content:

                        '🎀 **Ticket został zamknięty.**\n\n' +

                        `💌 **Powód:** ${reason}\n` +

                        `🛡️ **Zamknął:** ${interaction.user}\n\n` +

                        '🩷 Wiadomość została wysłana użytkownikowi na PW.\n' +

                        '✨ Kanał zostanie usunięty za 5 sekund.'

                });

                // =================================================
                // PW
                // =================================================

                if (
                    ticketOwner
                ) {

                    try {

                        const dmEmbed =
                            new EmbedBuilder()

                                .setColor(
                                    TICKET_COLOR
                                )

                                .setTitle(
                                    '🎀  TWÓJ TICKET ZOSTAŁ ZAMKNIĘTY'
                                )

                                .setDescription(

                                    '💌 Twój ticket na serwerze został zamknięty przez administrację.\n\n' +

                                    '╭───────────────╮\n' +
                                    '🎀 **INFORMACJE**\n' +
                                    '╰───────────────╯\n\n' +

                                    `💗 **Powód:**\n${reason}\n\n` +

                                    `🛡️ **Zamknięty przez:**\n${interaction.user}\n\n` +

                                    '🌸 Dziękujemy za kontakt z administracją!\n\n' +

                                    '✨ Jeśli nadal potrzebujesz pomocy, ' +
                                    'możesz otworzyć nowy ticket. 🎀'

                                )

                                .setFooter({

                                    text:
                                        '🎀 Ticket Center • Administracja'

                                });

                        await ticketOwner.send({

                            embeds: [
                                dmEmbed
                            ]

                        });

                    } catch (error) {

                        console.error(
                            '❌ Nie udało się wysłać PW:',
                            error
                        );

                    }

                }

                // =================================================
                // USUWANIE TICKETU
                // =================================================

                setTimeout(
                    async () => {

                        try {

                            await ticketChannel.delete();

                        } catch (error) {

                            console.error(
                                '❌ Nie udało się usunąć ticketu:',
                                error
                            );

                        }

                    },
                    5000
                );

            }

        } catch (error) {

            console.error(
                '❌ BŁĄD INTERAKCJI:',
                error
            );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({

                        content:
                            '❌ Wystąpił błąd podczas wykonywania tej komendy.',

                        ephemeral: true

                    });

                } else {

                    await interaction.reply({

                        content:
                            '❌ Wystąpił błąd podczas wykonywania tej komendy.',

                        ephemeral: true

                    });

                }

            } catch {

                // Discord nie pozwolił już odpowiedzieć na interakcję.
            }

        }

    }
);

// =====================================================
// START
// =====================================================

client.login(TOKEN);
