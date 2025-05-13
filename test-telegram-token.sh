#!/bin/bash

# Check if an argument is provided
if [ $# -ne 1 ]; then
  echo "Usage: ./test-telegram-token.sh <YOUR_BOT_TOKEN>"
  echo "Example: ./test-telegram-token.sh 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  exit 1
fi

BOT_TOKEN=$1

# Get bot info
echo "Testing Telegram Bot Token: $BOT_TOKEN"
echo "Retrieving bot information..."

curl -X GET "https://api.telegram.org/bot$BOT_TOKEN/getMe"
echo -e "\n"

# If the previous command worked, try getting webhook info
if [ $? -eq 0 ]; then
  echo "Getting current webhook information..."
  curl -X GET "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
  echo -e "\n"
fi

echo "If you see JSON responses above, your token is valid!"
