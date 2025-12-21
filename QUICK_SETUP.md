# 🚀 Quick Setup Guide - Gemini AI Integration

## 📦 Step 1: Install Dependencies

```bash
# Install required packages
npx expo install expo-location
npm install @google/generative-ai
```

## 🔑 Step 2: Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy your key

## ✏️ Step 3: Add API Key

Open `services/gemini.ts` and paste your key on line 9:

```typescript
const API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY_HERE';
```

## 🔄 Step 4: Activate New Index File

```bash
# On Windows PowerShell:
Move-Item "app\(tabs)\index.tsx" "app\(tabs)\index_old.tsx"
Move-Item "app\(tabs)\index_gemini.tsx" "app\(tabs)\index.tsx"

# On Mac/Linux:
mv app/\(tabs\)/index.tsx app/\(tabs\)/index_old.tsx
mv app/\(tabs\)/index_gemini.tsx app/\(tabs\)/index.tsx
```

## ▶️ Step 5: Run App

```bash
npx expo start
```

**Important:** Test on a **real device** or emulator with GPS enabled.

## ✅ Verify Setup

When you open the app, you should see:
1. "Hôm nay ăn gì? 🧐" header
2. Green location badge (after allowing GPS)
3. Tag selection categories
4. Orange "Tìm quán" button

## 🧪 Test Flow

1. Allow GPS permission
2. Select 2-3 tags (e.g., "😊 Vui vẻ", "☀️ Nắng bể đầu", "💸 Rẻ bèo")
3. Tap "🤖 Tìm quán"
4. Wait for AI loading (~3-5 seconds)
5. See 3 restaurant suggestions with distance!

## 🆘 Troubleshooting

### GPS not working?
- Enable Location Services on your device
- App must run on **physical device** or emulator with GPS

### API Key error?
- Check that you pasted the correct key
- Verify the key is active on Google AI Studio

### AI returns error?
- The app will offer "fallback suggestions" automatically
- This is normal during testing

## 📱 Features Enabled

✅ Real-time GPS location  
✅ Reverse geocoding (FREE!)  
✅ Gemini AI recommendations  
✅ Multi-tag selection  
✅ Distance calculation  
✅ Beautiful card carousel  
✅ Grab & TikTok integration  

---

**That's it! Your AI-powered food recommendation app is ready! 🎉**
