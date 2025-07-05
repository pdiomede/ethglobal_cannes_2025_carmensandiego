# Privy Integration Setup

This guide will help you set up Privy authentication for your Carmen Sandiego Web3 game.

## 1. Environment Configuration

Create a `.env.local` file in the `frontend` directory with your Privy App ID:

```bash
# In frontend/.env.local
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

Replace `your_privy_app_id_here` with your actual App ID from the Privy Dashboard.

## 2. Getting Your Privy App ID

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Sign in with your account
3. Select your app or create a new one
4. Copy the App ID from the dashboard
5. Paste it in your `.env.local` file

## 3. Privy Configuration

The app is configured with the following login methods:
- Email
- Wallet connection
- Google OAuth
- Discord OAuth

And includes embedded wallet creation for users without wallets.

## 4. Features Integrated

- ✅ Authentication UI component
- ✅ Wallet connection via Privy
- ✅ User profile display
- ✅ Automatic contract initialization after login
- ✅ Secure environment variable handling

## 5. Testing

1. Set your `VITE_PRIVY_APP_ID` in `.env.local`
2. Run `npm run dev`
3. Try signing in with different methods
4. Verify wallet connection and game functionality

## 6. Important Notes

- The `.env.local` file should not be committed to version control
- Make sure your Privy app is configured for the correct domain
- Test with different browsers and incognito mode 