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

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// =====================================================
// USTAWIENIA
// =====================================================

const TOKEN = process.env.TOKEN;

const CLIENT_ID = '1533513404659011776';
const GUILD_ID = '1532465455086960750';

const SUPPORT_ROLE_ID = '1533218646086783067';

const TICKET_PANEL_CHANNEL_ID = '1533233893342445708';
const TICKET_CATEGORY_ID = '1536866515582980256';

const TICKET_COLOR = 0xcd7890;

// =====================================================
// KOMENDA /ticket
// =====================================================

const commands = [
    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Wyślij panel ticketów')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('🎀 Komenda /ticket została zarejestrowana.');
    } catch (error) {
        console.error('❌ Błąd rejestracji komendy:', error);
    }
})();

// =====================================================
// BOT GOTOWY
// =====================================================

client.once('clientReady', () => {
    console.log(`🎀 Zalogowano jako ${client.user.tag}`);
});

// =====================================================
// INTERAKCJE
// =====================================================

client.on('interactionCreate', async interaction => {

    // =================================================
    // /ticket
    // =================================================

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'ticket') {

            const panelChannel =
                interaction.guild.channels.cache.get(
                    TICKET_PANEL_CHANNEL_ID
                );

            if (!panelChannel) {
                return interaction.reply({
                    content: '❌ Nie znaleziono kanału panelu ticketów.',
                    ephemeral: true
                });
            }

            const image = new AttachmentBuilder('./ticket.png');

            const embed = new EmbedBuilder()
                .setColor(TICKET_COLOR)
                .setTitle('🎀  TICKET CENTER')
                .setDescription(
                    'Potrzebujesz pomocy? Otwórz ticket, a nasza administracja zajmie się Twoją sprawą.\n\n' +
                    '🔒 **Ticket jest prywatny.**\n' +
                    '💌 **Opisz dokładnie swój problem.**\n\n' +
                    '🌸 Kliknij przycisk poniżej, aby skontaktować się z administracją! 🎀'
                )
                .setImage('attachment://ticket.png')
                .setFooter({
                    text: '🎀 Ticket Center • Administracja'
                });

            const openButton = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Otwórz ticket')
                .setEmoji('🎀')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(openButton);

            await panelChannel.send({
                embeds: [embed],
                files: [image],
                components: [row]
            });

            await interaction.reply({
                content:
                    `🎀 Panel ticketów został wysłany na ${panelChannel}.`,
                ephemeral: true
            });
        }
    }

    // =================================================
    // PRZYCISKI
    // =================================================

    if (interaction.isButton()) {

        // =================================================
        // OTWIERANIE TICKETU
        // =================================================

        if (interaction.customId === 'create_ticket') {

            const existingTicket =
                interaction.guild.channels.cache.find(
                    channel =>
                        channel.topic ===
                            `ticket-owner:${interaction.user.id}` &&
                        channel.type === ChannelType.GuildText
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

            if (category.type !== ChannelType.GuildCategory) {
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
                    .replace(/[^a-z0-9]/g, '-')
                    .slice(0, 20);

            const ticket =
                await interaction.guild.channels.create({
                    name: `🎀・ticket-${username}`,

                    type: ChannelType.GuildText,

                    topic:
                        `ticket-owner:${interaction.user.id}`,

                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,

                            deny: [
                                PermissionsBitField.Flags.ViewChannel
                            ]
                        },

                        {
                            id: interaction.user.id,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.AttachFiles,
                                PermissionsBitField.Flags.EmbedLinks
                            ]
                        },

                        {
                            id: SUPPORT_ROLE_ID,

                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.AttachFiles,
                                PermissionsBitField.Flags.EmbedLinks
                            ]
                        },

                        {
                            id: client.user.id,

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

                console.log(
                    `📁 Ticket ${ticket.name} przeniesiony do kategorii.`
                );

            } catch (error) {

                console.error(
                    '❌ Nie udało się przenieść ticketu do kategorii:',
                    error
                );
            }

            // =================================================
            // OBRAZEK
            // =================================================

            const ticketImage =
                new AttachmentBuilder('./ticket.png');

            // =================================================
            // WIADOMOŚĆ POWITALNA
            // =================================================

            const welcomeEmbed =
                new EmbedBuilder()
                    .setColor(TICKET_COLOR)

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

                    .setImage('attachment://ticket.png')

                    .setFooter({
                        text:
                            '🎀 Ticket Center • Administracja'
                    });

            // =================================================
            // PRZYCISK ZAMKNIĘCIA
            // =================================================

            const closeButton =
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Zamknij ticket')
                    .setEmoji('🎀')
                    .setStyle(ButtonStyle.Danger);

            const closeRow =
                new ActionRowBuilder()
                    .addComponents(closeButton);

            // =================================================
            // WIADOMOŚĆ W TICKETCIE
            // =================================================

            await ticket.send({

                content:
                    `🎀 ${interaction.user} <@&${SUPPORT_ROLE_ID}>`,

                embeds: [welcomeEmbed],

                files: [ticketImage],

                components: [closeRow]
            });

            await interaction.reply({
                content:
                    `🎀 Twój ticket został utworzony: ${ticket}`,

                ephemeral: true
            });
        }

        // =================================================
        // KLIKNIĘCIE "ZAMKNIJ TICKET"
        // =================================================

        if (interaction.customId === 'close_ticket') {

            // Tylko Staff może zamknąć ticket
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

            // Tworzymy okienko
            const modal =
                new ModalBuilder()
                    .setCustomId('close_ticket_modal')
                    .setTitle('🎀 Zamknięcie ticketu');

            // Pole na powód
            const reasonInput =
                new TextInputBuilder()
                    .setCustomId('close_reason')
                    .setLabel('Powód zamknięcia ticketu')
                    .setPlaceholder(
                        'Np. Problem został rozwiązany.'
                    )
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(500);

            const reasonRow =
                new ActionRowBuilder()
                    .addComponents(reasonInput);

            modal.addComponents(reasonRow);

            await interaction.showModal(modal);
        }
    }

    // =================================================
    // OKIENKO Z POWODEM ZAMKNIĘCIA
    // =================================================

    if (interaction.isModalSubmit()) {

        if (
            interaction.customId ===
            'close_ticket_modal'
        ) {

            // Ponownie sprawdzamy Staff
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

            // =================================================
            // SZUKAMY WŁAŚCICIELA TICKETU
            // =================================================

            let ownerId = null;

            if (ticketChannel.topic) {

                const match =
                    ticketChannel.topic.match(
                        /^ticket-owner:(\d+)$/
                    );

                if (match) {
                    ownerId = match[1];
                }
            }

            // =================================================
            // POBIERAMY UŻYTKOWNIKA
            // =================================================

            let ticketOwner = null;

            if (ownerId) {

                try {

                    ticketOwner =
                        await client.users.fetch(ownerId);

                } catch (error) {

                    console.error(
                        '❌ Nie udało się znaleźć właściciela ticketu:',
                        error
                    );
                }
            }

            // =================================================
            // ODPOWIEDŹ W TICKecie
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
            // WIADOMOŚĆ NA PW
            // =================================================

            if (ticketOwner) {

                try {

                    const dmEmbed =
                        new EmbedBuilder()
                            .setColor(TICKET_COLOR)

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
                        embeds: [dmEmbed]
                    });

                    console.log(
                        `💌 Wysłano PW do ${ticketOwner.tag}.`
                    );

                } catch (error) {

                    console.error(
                        '❌ Nie udało się wysłać PW użytkownikowi:',
                        error
                    );
                }
            }

            // =================================================
            // USUWANIE KANAŁU
            // =================================================

            setTimeout(async () => {

                try {

                    await ticketChannel.delete();

                    console.log(
                        `🗑️ Usunięto ticket ${ticketChannel.name}.`
                    );

                } catch (error) {

                    console.error(
                        '❌ Nie udało się usunąć ticketu:',
                        error
                    );
                }

            }, 5000);
        }
    }
});

// =====================================================
// START BOTA
// =====================================================

client.login(TOKEN);
