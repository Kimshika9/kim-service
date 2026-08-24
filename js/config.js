/**
 * PayWell Internationalization & Translations (English & Burmese)
 */

const PayWellI18n = {
  currentLang: localStorage.getItem('paywell_lang') || 'en',

  translations: {
    en: {
      appName: "PayWell",
      tagline: "Premium Community Token System",
      navHome: "Home",
      navActivity: "Activity",
      navStore: "Store",
      navProfile: "Profile",
      navCrown: "Crown",

      // Balance Display
      totalBalance: "TOTAL BALANCE",
      send: "Send",
      receive: "Receive",
      qrScan: "Scan QR",
      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      viewAll: "View All",
      noTransactions: "No transactions recorded yet.",

      // Transfer Flow
      sendMoneyTitle: "Send PW Tokens",
      recipientUsername: "Recipient Username",
      enterUsernamePlaceholder: "e.g. Yuji_luke",
      amountPW: "Amount (PW)",
      amountPlaceholder: "0.00",
      noteOptional: "Note (Optional)",
      notePlaceholder: "What is this payment for?",
      confirmSend: "Confirm & Send",

      // Receive & QR
      receiveMoneyTitle: "Receive PW Tokens",
      yourWalletQR: "Your PayWell QR Code",
      scanToPayMsg: "Scan this QR code using PayWell to receive tokens instantly.",
      copyUsername: "Copy Username",
      usernameCopied: "Username copied to clipboard!",

      // Receipt
      transactionReceipt: "Transaction Receipt",
      date: "Date",
      txID: "Transaction ID",
      from: "From",
      to: "To",
      amount: "Amount",
      fee: "Fee",
      total: "Total",
      status: "Status",
      type: "Type",
      success: "Success",
      download: "Download",
      shareTelegram: "Share to Telegram",

      // Store
      communityStore: "Community Store",
      storeSubtitle: "Purchase exclusive virtual badges, frames & perks",
      buyNow: "Buy Now",
      outOfStock: "Out of Stock",
      purchaseSuccess: "Purchase Successful!",

      // Profile & Settings
      profile: "User Profile",
      language: "Language / နေ့စဉ်သုံးဘာသာစကား",
      themeMode: "Appearance Theme",
      darkMode: "Dark Glass Mode",
      lightMode: "Light Soft Mode",
      logout: "Log Out",
      contactSupport: "Contact Owner Support",

      // Owner Panel
      ownerTitle: "Owner Crown Panel",
      ownerSubtitle: "System Control Center for @Yuji_luke",
      enterPin: "Enter 6-Digit Owner PIN",
      addCurrency: "Add Currency",
      deductCurrency: "Deduct Currency",
      userManagement: "User Management",
      systemStats: "System Statistics"
    },

    my: { // Burmese (Myanmar) Translation
      appName: "PayWell",
      tagline: "သီးသန့် မီနီအက်ပ် ငွေကြေးစနစ်",
      navHome: "ပင်မစာမျက်နှာ",
      navActivity: "မှတ်တမ်း",
      navStore: "စတိုးဆိုင်",
      navProfile: "ပရိုဖိုင်",
      navCrown: "Crown အမတ်",

      // Balance Display
      totalBalance: "စုစုပေါင်း လက်ကျန်ငွေ",
      send: "ငွေလွှဲမည်",
      receive: "ငွေလက်ခံမည်",
      qrScan: "QR ဖတ်မည်",
      quickActions: "လျင်မြန်သော လုပ်ဆောင်ချက်များ",
      recentActivity: "လတ်တလော လှုပ်ရှားမှုများ",
      viewAll: "အားလုံးကြည့်မည်",
      noTransactions: "ငွေလွှဲမှတ်တမ်း မရှိသေးပါ။",

      // Transfer Flow
      sendMoneyTitle: "PW တိုကင် လွှဲပြောင်းမည်",
      recipientUsername: "လက်ခံမည့်သူ Username",
      enterUsernamePlaceholder: "ဥပမာ - Yuji_luke",
      amountPW: "ပမာဏ (PW)",
      amountPlaceholder: "0.00",
      noteOptional: "မှတ်ချက် (မဖြစ်မနေ မလိုပါ)",
      notePlaceholder: "ဘာအတွက် ငွေလွှဲတာလဲ?",
      confirmSend: "ငွေလွှဲမှုကို အတည်ပြုမည်",

      // Receive & QR
      receiveMoneyTitle: "PW တိုကင် လက်ခံမည်",
      yourWalletQR: "သင့် PayWell QR ကုတ်",
      scanToPayMsg: "ငွေချက်ချင်းလက်ခံရန် ဤ QR ကုတ်အား PayWell ဖြင့် ဖတ်ပါ",
      copyUsername: "Username ကူးယူမည်",
      usernameCopied: "Username ကူးယူပြီးပါပြီ!",

      // Receipt
      transactionReceipt: "ငွေလွှဲ ပြေစာ",
      date: "ရက်စွဲ",
      txID: "ငွေလွှဲ အိုင်ဒီ",
      from: "ပေးပို့သူ",
      to: "လက်ခံသူ",
      amount: "ပမာဏ",
      fee: "ဝန်ဆောင်ခ",
      total: "စုစုပေါင်း",
      status: "အခြေအနေ",
      type: "အမျိုးအစား",
      success: "အောင်မြင်ပါသည်",
      download: "ဒေါင်းလုဒ်လုပ်မည်",
      shareTelegram: "Telegram သို့ မျှဝေမည်",

      // Store
      communityStore: "အသိုင်းအဝိုင်း စတိုးဆိုင်",
      storeSubtitle: "အထူး ဘေဂျ်များနှင့် ဝန်ဆောင်မှုများ ဝယ်ယူရန်",
      buyNow: "ဝယ်ယူမည်",
      outOfStock: "ပစ္စည်းကုန်သွားပါပြီ",
      purchaseSuccess: "ဝယ်ယူမှု အောင်မြင်ပါသည်!",

      // Profile & Settings
      profile: "သုံးစွဲသူ ပရိုဖိုင်",
      language: "ဘာသာစကားပြောင်းရန်",
      themeMode: "အပြင်အဆင် ဒီဇိုင်း",
      darkMode: "Dark Glass ဒီဇိုင်း",
      lightMode: "Light Soft ဒီဇိုင်း",
      logout: "ထွက်မည်",
      contactSupport: "Owner နှင့် ဆက်သွယ်ရန်",

      // Owner Panel
      ownerTitle: "Owner Crown စီမံခန့်ခွဲမှု",
      ownerSubtitle: "@Yuji_luke အတွက် သီးသန့် ထိန်းချုပ်ရေးစနစ်",
      enterPin: "၆ လုံးဂဏန်း PIN ရိုက်ထည့်ပါ",
      addCurrency: "ငွေကြေး ထည့်သွင်းမည်",
      deductCurrency: "ငွေကြေး နှုတ်ယူမည်",
      userManagement: "သုံးစွဲသူများ စီမံမည်",
      systemStats: "စနစ် အချက်အလက်များ"
    }
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('paywell_lang', lang);
      window.dispatchEvent(new CustomEvent('paywell_lang_changed', { detail: lang }));
    }
  },

  t(key) {
    return this.translations[this.currentLang]?.[key] || this.translations['en']?.[key] || key;
  }
};

window.PayWellI18n = PayWellI18n;
