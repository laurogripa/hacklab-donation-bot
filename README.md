# Telegram Bot Photo Receiver

This is a Next.js project that includes an API endpoint to receive photos from a Telegram bot.

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Create a Telegram Bot

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with the `/newbot` command
3. Save your bot token for the next step

### 3. Set Environment Variables

Create a `.env.local` file in the root directory with the following content:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

Replace `your_telegram_bot_token_here` with the token you received from BotFather.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 5. Set up a Webhook URL

For testing locally, you'll need to expose your local server to the internet. You can use [ngrok](https://ngrok.com/) for this:

```bash
ngrok http 3000
```

Then, set the webhook URL for your Telegram bot:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook"
```

Replace `<YOUR_BOT_TOKEN>` with your bot token and `<YOUR_NGROK_URL>` with the HTTPS URL provided by ngrok.

## Usage

1. Start a chat with your bot on Telegram
2. Send a photo to the bot
3. The bot will reply with a confirmation message
4. The photo information will be logged in your server console

## API Endpoints

- `POST /api/telegram/webhook` - Receives Telegram webhook updates and processes photos
