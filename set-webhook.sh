#!/bin/bash

# Check if both arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: ./set-webhook.sh <YOUR_BOT_TOKEN> <YOUR_WEBHOOK_URL>"
  echo "Example: ./set-webhook.sh 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ https://example.ngrok.io"
  exit 1
fi

BOT_TOKEN=$1
WEBHOOK_URL=$2

# Ensure the webhook URL ends with /api/telegram/webhook
if [[ "$WEBHOOK_URL" != *"/api/telegram/webhook" ]]; then
  WEBHOOK_URL="${WEBHOOK_URL}/api/telegram/webhook"
  echo "Webhook URL adjusted to: $WEBHOOK_URL"
fi

# Set the webhook
echo "Setting webhook for bot with token: $BOT_TOKEN"
echo "Webhook URL: $WEBHOOK_URL"

curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$WEBHOOK_URL"
echo -e "\n"

# Get current webhook info
echo "Getting current webhook info:"
curl -X GET "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
echo -e "\n"
