// server.ts
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "10mb" }));
var STYLE_DB_PATH = path.join(process.cwd(), "styleDatabase.json");
var USERS_DB_PATH = path.join(process.cwd(), "users.json");
var LOGS_DB_PATH = path.join(process.cwd(), "compliance_logs.json");
function loadStyles() {
  try {
    if (fs.existsSync(STYLE_DB_PATH)) {
      const raw = fs.readFileSync(STYLE_DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed reading styles database file:", err);
  }
  const initialStyles = [
    {
      id: "db-rec-1",
      clientName: "Aria Wijaya",
      clientEmail: "aria.wijaya@gmail.com",
      underTone: "Warm",
      skinTone: "Medium (Kuning Langsat)",
      hairColor: "Dark Brown",
      eyeColor: "Black",
      seasonPalette: "Warm Spring",
      styleArchetype: "Classic Elegant",
      createdAt: new Date(Date.now() - 48 * 36e5).toISOString(),
      notes: "Klien butik utama. Menyukai bahan sutra dengan pakaian formal terstruktur. Butuh rekomendasi busana untuk gala dinner.",
      aiOutput: {
        recommendationSummary: "Aria memiliki karakteristik undertone hangat dengan skin tone medium cerah khas kuningan langsat. Palet warna Warm Spring memperkuat rona alami wajahnya, membuatnya terlihat lebih bercahaya tanpa terkesan kusam.",
        bestColors: [
          { name: "Peach Gold", hex: "#FFD0A1", reason: "Memberikan kehangatan alami yang mewah pada kulit wajah." },
          { name: "Terracotta Warm", hex: "#D36F52", reason: "Aksen warna bumi berani yang menonjolkan fitur mata kehitaman." },
          { name: "Warm Olive Green", hex: "#878D32", reason: "Menyeimbangkan kontras warna rambut dark brown secara romantis." }
        ],
        avoidColors: ["Ice Blue", "Deep Indigo", "Pure Magenta"],
        suggestedFabrics: ["Sutra Organza", "Linen Halus", "Katun Jacquard"],
        outfitInspirations: [
          {
            title: "Gala Dinner Executive Look",
            clothes: ["Dress terstruktur peach gold dengan sabuk metalik tipis", "Heels pump nude bertekstur suede", "Anting gantung emas minimalis"],
            occasion: "Formal Dinner atau Pertemuan Bisnis"
          }
        ]
      }
    },
    {
      id: "db-rec-2",
      clientName: "Siti Rahma",
      clientEmail: "siti.rahma@outlook.com",
      underTone: "Cool",
      skinTone: "Olive Deep",
      hairColor: "Black Charcoal",
      eyeColor: "Dark Brown",
      seasonPalette: "Bright Winter",
      styleArchetype: "Casual Minimalist",
      createdAt: new Date(Date.now() - 120 * 36e5).toISOString(),
      notes: "Butuh pakaian kasual sehari-hari bergaya minimalis tetapi tetap menonjolkan profesionalisme.",
      aiOutput: {
        recommendationSummary: "Kombinasi rambut hitam tebal dengan rona kulit zaitun pekat menciptakan tingkat kontras tinggi yang sempurna untuk Bright Winter. Kombinasi warna solid berkontras tinggi akan meningkatkan impresi berwibawa namun bersahaja.",
        bestColors: [
          { name: "Emerald Jewel", hex: "#004B23", reason: "Sangat cocok untuk kontras dramatis kulit olive deep." },
          { name: "Pure Charcoal", hex: "#343A40", reason: "Alternatif hitam biasa yang lebih lembut namun tetap berbobot." },
          { name: "Classic Crimson", hex: "#9B2226", reason: "Memberikan aksen warna royal berani yang meningkatkan energi berpakaian." }
        ],
        avoidColors: ["Mustard Yellow", "Pastel Peach", "Tan Beige"],
        suggestedFabrics: ["Rajut Corduroy", "Wol Gabardin", "Premium Denim"],
        outfitInspirations: [
          {
            title: "Corporate Casual Chic",
            clothes: ["Blazer terstruktur warna charcoal", "Kaos katun putih premium", "Celana bahan high-waist hijau emerald"],
            occasion: "Presentasi Proyek & Kasual Kantor"
          }
        ]
      }
    },
    {
      id: "db-rec-3",
      clientName: "Clara Michelle",
      clientEmail: "claramich@gmail.com",
      underTone: "Cool",
      skinTone: "Fair White",
      hairColor: "Chestnut",
      eyeColor: "Greyish Brown",
      seasonPalette: "Cool Summer",
      styleArchetype: "Romantique",
      createdAt: new Date(Date.now() - 240 * 36e5).toISOString(),
      notes: "Kerap mengenakan aksesoris retro perak. Mencari palet lembut pastel untuk rancangan busana pernikahan taman.",
      aiOutput: {
        recommendationSummary: "Rona kulit ultra-terang berkombinasi dengan mata abu-abu kecokelatan mengindikasikan palet Cool Summer yang berkarakter anggun, tenang, dan memikat bagai rona pagi berkabut semilir angin pantai.",
        bestColors: [
          { name: "Dusty Rose", hex: "#DCAEBE", reason: "Romantisasi rona merah jambu berdebu yang menyatu manis dengan kulit fair." },
          { name: "Lavender Mist", hex: "#C5A3E8", reason: "Menonjolkan pesona warna mata abu-abu-kecokelatan yang unik." },
          { name: "Sage Soft Green", hex: "#879F84", reason: "Warna hijau tenang yang membawa aura keanggunan alami tanpa kesan mencolok." }
        ],
        avoidColors: ["Vibrant Neon Yellow", "Warm Brick Red", "Neon Orange"],
        suggestedFabrics: ["Tille Lembut", "Parisian Chiffon", "Linen Silk Blend"],
        outfitInspirations: [
          {
            title: "Garden Wedding Guest",
            clothes: ["Gaun lipit midi dusty rose berbahan sifon menyapu lembut", "Heels bertali mutiara", "Anting perak bermotif dedaunan filigri"],
            occasion: "Outdoor Wedding & Garden Party"
          }
        ]
      }
    }
  ];
  saveStyles(initialStyles);
  return initialStyles;
}
function saveStyles(styles) {
  try {
    fs.writeFileSync(STYLE_DB_PATH, JSON.stringify(styles, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing styles to database file:", err);
  }
}
function loadUsers() {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const raw = fs.readFileSync(USERS_DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed reading users database file:", err);
  }
  const initialUsers = [
    {
      username: "stylist_rst",
      password: "rstpassword2026",
      fullname: "RST Stylist Officer",
      role: "Senior Stylist"
    }
  ];
  saveUsers(initialUsers);
  return initialUsers;
}
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing users database file:", err);
  }
}
function logComplianceActivity(operator, method, path2, gdprStatus, actionDetail) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_DB_PATH)) {
      try {
        logs = JSON.parse(fs.readFileSync(LOGS_DB_PATH, "utf-8"));
      } catch (e) {
        logs = [];
      }
    }
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      operator,
      method,
      path: path2,
      gdprStatus,
      actionDetail
    };
    logs.unshift(logItem);
    if (logs.length > 150) logs = logs.slice(0, 150);
    fs.writeFileSync(LOGS_DB_PATH, JSON.stringify(logs, null, 2), "utf-8");
    console.log(`[COMPLIANCE LOG] ${logItem.timestamp} | ${operator} | ${method} ${path2} | GDPR: ${gdprStatus}`);
  } catch (err) {
    console.error("Failed writing compliance logs:", err);
  }
}
var styleDatabase = loadStyles();
var ai = null;
var API_KEY = process.env.GEMINI_API_KEY;
if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("Google GenAI initialized successfully using provided API Key.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI SDK:", err);
  }
} else {
  console.log("No realistic GEMINI_API_KEY set in environment variables. Operating in Rule-Based Simulator Mode.");
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logComplianceActivity("Guest/System", req.method, req.path, "VIOLATION_BLOCKED", "Akses diblokir: Klien tidak membawa token autentikasi.");
    return res.status(401).json({ error: "Sesi tidak sah. Silakan login terlebih dahulu sebagai fashion stylist." });
  }
  const token = authHeader.split(" ")[1];
  const users = loadUsers();
  if (token.startsWith("token_rst_session_")) {
    const username = token.replace("token_rst_session_", "");
    const activeUser = users.find((u) => u.username === username);
    if (activeUser) {
      req.user = activeUser;
      return next();
    }
  }
  logComplianceActivity("Anonymous", req.method, req.path, "VIOLATION_BLOCKED", "Akses diblokir: Token sesi tidak valid atau kedaluwarsa.");
  return res.status(401).json({ error: "Sesi Anda tidak valid. Silakan masuk kembali." });
}
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    return next();
  }
  let operator = "Guest/Pelanggan";
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token.startsWith("token_rst_session_")) {
      operator = token.replace("token_rst_session_", "");
    }
  }
  if (req.path !== "/api/togaf/logs") {
    logComplianceActivity(operator, req.method, req.path, "AUDITED", `Mengakses fungsionalitas sistem.`);
  }
  next();
});
app.post("/api/auth/register", (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password || !fullname) {
    return res.status(400).json({ error: "Username, password, dan nama lengkap wajib diisi." });
  }
  const users = loadUsers();
  const exists = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    logComplianceActivity("System", "POST", "/api/auth/register", "USER_EXISTS", `Gagal register: Username "${username}" sudah terdaftar.`);
    return res.status(400).json({ error: "Username tersebut sudah terdaftar di sistem Boutique RST." });
  }
  const newUser = {
    username: username.toLowerCase(),
    password,
    // Plain string for development simplicity as permitted by guidelines
    fullname,
    role: "Stylist Officer"
  };
  users.push(newUser);
  saveUsers(users);
  logComplianceActivity(username, "POST", "/api/auth/register", "REGISTRATION_SUCCESS", `Karyawan baru terdaftar: ${fullname} (${newUser.role})`);
  res.status(201).json({ success: true, message: "Registrasi Akun Stylist Baru Berhasil!" });
});
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan Password wajib disertakan." });
  }
  const users = loadUsers();
  const matched = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!matched) {
    logComplianceActivity("System", "POST", "/api/auth/login", "AUTH_FAILED", `Gagal masuk: Username atau sandi salah untuk "${username}".`);
    return res.status(401).json({ error: "Username atau password Stylist salah." });
  }
  const token = `token_rst_session_${matched.username}`;
  logComplianceActivity(matched.username, "POST", "/api/auth/login", "SECURITY_PASSED", "Stylist berhasil login, token sesi baru diterbitkan.");
  res.json({
    success: true,
    token,
    user: {
      username: matched.username,
      fullname: matched.fullname,
      role: matched.role
    }
  });
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    username: req.user.username,
    fullname: req.user.fullname,
    role: req.user.role
  });
});
app.get("/api/togaf/logs", (req, res) => {
  try {
    if (fs.existsSync(LOGS_DB_PATH)) {
      const raw = fs.readFileSync(LOGS_DB_PATH, "utf-8");
      return res.json(JSON.parse(raw));
    }
  } catch (err) {
  }
  res.json([]);
});
app.get("/api/togaf/structure", (req, res) => {
  res.json({
    framework: "TOGAF ADM 10th Edition",
    enterprise: "Butik & Atelier Mode RST",
    systemName: "Sistem Informasi Konsultasi Fashion & Warna Personal (SI-KFWP)",
    status: "Architecture Baseline Completed"
  });
});
app.get("/api/styles-db", requireAuth, (req, res) => {
  styleDatabase = loadStyles();
  res.json(styleDatabase);
});
app.post("/api/styles-db", requireAuth, (req, res) => {
  const { clientName, clientEmail, underTone, skinTone, hairColor, eyeColor, seasonPalette, styleArchetype, notes, aiOutput } = req.body;
  if (!clientName || !clientEmail) {
    return res.status(400).json({ error: "Nama dan Email Klien wajib diisi." });
  }
  const newRecord = {
    id: `db-rec-${Date.now()}`,
    clientName,
    clientEmail,
    underTone,
    skinTone,
    hairColor,
    eyeColor,
    seasonPalette,
    styleArchetype,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    notes: notes || "",
    aiOutput: aiOutput || null
  };
  styleDatabase = loadStyles();
  styleDatabase.unshift(newRecord);
  saveStyles(styleDatabase);
  logComplianceActivity(req.user.username, "POST", "/api/styles-db", "GDPR_CONSENT_OK", `Menyimpan data warna klien secara permanen: ${clientName} (${clientEmail})`);
  res.status(201).json(newRecord);
});
app.delete("/api/styles-db/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  styleDatabase = loadStyles();
  const record = styleDatabase.find((item) => item.id === id);
  const initialLength = styleDatabase.length;
  styleDatabase = styleDatabase.filter((item) => item.id !== id);
  if (styleDatabase.length === initialLength) {
    return res.status(404).json({ error: "Record tidak ditemukan." });
  }
  saveStyles(styleDatabase);
  logComplianceActivity(req.user.username, "DELETE", `/api/styles-db/${id}`, "GDPR_DATA_HYGIENE", `Menghapus data sensitif klien atas permintaan hak dilupakan (Right to be Forgotten): ${record ? record.clientName : id}`);
  res.json({ success: true, message: "Record konsultasi berhasil dihapus sesuai permintaan hak GDPR." });
});
app.post("/api/predict-color", async (req, res) => {
  const { clientName, underTone, skinTone, hairColor, eyeColor, styleArchetype, comments } = req.body;
  const prompt = `Anda adalah Fashion & Personal Color Specialist profesional berbasis TOGAF Enterprise Architecture Standard.
Lakukan Analisis Warna Musiman (Seasonal Color Analysis) dan rancang konsep gaya busana personal yang akurat untuk:
- Nama Klien: ${clientName || "Klien Butik"}
- Undertone Kulit: ${underTone} (Warm/Cool/Neutral)
- Skin Tone: ${skinTone}
- Warna Rambut: ${hairColor}
- Warna Mata: ${eyeColor}
- Arketipe Gaya: ${styleArchetype}
- Preferensi/Komentar Tambahan: ${comments || "Tidak ada"}

Analisislah apakah mereka masuk ke keluarga warna musiman: 'Warm Spring', 'Cool Summer', 'Deep Autumn', atau 'Bright Winter'.
Harap keluarkan hasil analisis dalam format JSON terstruktur yang ketat dengan skema berikut:
{
  "seasonPalette": "(Pilih dari: Warm Spring, Cool Summer, Deep Autumn, Bright Winter)",
  "recommendationSummary": "(Tulis ringkasan analisis fashion sekitar 3 kalimat bernada ramah, bersahaja, profesional dalam Bahasa Indonesia)",
  "bestColors": [
    { "name": "(Nama Warna Indonesia/Inggris)", "hex": "(Kode Hexadecimal)", "reason": "(Penjelasan singkat kecocokannya dengan klien)" }
  ],
  "avoidColors": ["(Warna 1)", "(Warna 2)", "(Warna 3)"],
  "suggestedFabrics": ["(Sutra/Linen/Wol dll)", "(Bahan 2)"],
  "outfitInspirations": [
    {
      "title": "(Nama Setelan Busana, misal: Office Meeting Mastery)",
      "clothes": ["(Atasan jenis X berwarna Y)", "(Bawahan jenis A)", "(Aksesoris/Pelengkap B)"],
      "occasion": "(Acara/Konteks yang sesuai)"
    }
  ]
}`;
  if (ai) {
    try {
      console.log("Calling Gemini AI API with prompt details...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah Konsultan Mode & Warna Butik Eksklusif. Anda berbicara bahasa Indonesia dengan halus, elegan, dan profesional berstruktur industri mode papan atas.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              seasonPalette: { type: Type.STRING },
              recommendationSummary: { type: Type.STRING },
              bestColors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["name", "hex", "reason"]
                }
              },
              avoidColors: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedFabrics: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              outfitInspirations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    clothes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    occasion: { type: Type.STRING }
                  },
                  required: ["title", "clothes", "occasion"]
                }
              }
            },
            required: ["seasonPalette", "recommendationSummary", "bestColors", "avoidColors", "suggestedFabrics", "outfitInspirations"]
          }
        }
      });
      const responseText = response.text || "";
      console.log("Gemini returned response:", responseText);
      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);
    } catch (err) {
      console.error("Gemini call failed, running rule-based advisor fallback. Error:", err.message);
    }
  }
  console.log("Executing local rule-based fashion logic...");
  let season = "Warm Spring";
  let summary = "";
  let bestColors = [];
  let avoidColors = [];
  let suggestedFabrics = [];
  let outfitInspirations = [];
  if (underTone === "Warm") {
    if (skinTone === "Deep" || skinTone === "Olive") {
      season = "Deep Autumn";
      summary = `Hasil analisis TOGAF Business Core merekomendasikan palet 'Deep Autumn' untuk ${clientName || "Klien"}. Warna bumi yang dalam, berbobot, dan hangat menyeimbangkan intensitas alami pada kulit ${skinTone} mereka secara elegan.`;
      bestColors = [
        { name: "Warm Terracotta", hex: "#D36F52", reason: "Memberikan rona segar merona alami pada kulit hangat." },
        { name: "Forest Moss Green", hex: "#4A5D4E", reason: "Aksen kontras bersahaja yang membangkitkan aura kemewahan alami." },
        { name: "Mustard Amber", hex: "#DAA520", reason: "Sangat cocok dipadukan sebagai outerwear berbobot tinggi." }
      ];
      avoidColors = ["Cool Silver", "Cyan Blue", "Electric Magenta"];
      suggestedFabrics = ["Premium Leather", "Linen Rami kasar tebal", "Suede Tradisional"];
      outfitInspirations = [
        {
          title: "Creative Atelier Autumn Look",
          clothes: ["Outerwear Blazer Terracotta hangat", "Kaos dalaman rajut bertekstur krem", "Celana katun chino forest green"],
          occasion: "Galeri Seni / Rapat Tim Butik Kreatif"
        }
      ];
    } else {
      season = "Warm Spring";
      summary = `Berdasarkan parameter personal warna, ${clientName || "Klien"} memiliki warna kulit cerah dengan undertone hangat yang masuk di bawah rumpun 'Warm Spring'. Palet ini memancarkan keceriaan, kelembutan, dan kilau cahaya matahari pagi yang cerah.`;
      bestColors = [
        { name: "Gold Peach", hex: "#FFBC97", reason: "Menyuntikkan warna cerah dan rona sehat ke kulit wajah secara natural." },
        { name: "Cream Warm Sand", hex: "#EAE0D5", reason: "Warna dasar yang elegan dan netral tanpa membuat kulit terlihat layu." },
        { name: "Bright Avocado Green", hex: "#A7C957", reason: "Menawarkan kesegaran floral organik yang mencolok dan ceria." }
      ];
      avoidColors = ["Deep Navy", "Steel Grey", "Dusty Lavender"];
      suggestedFabrics = ["Sutra Organza", "Katun combed lembut 100%", "Brocade Floral"];
      outfitInspirations = [
        {
          title: "Sunday High-Tea Soir\xE9e",
          clothes: ["Dress linen peach dengan pola bunga mawar kuning pastel", "Sandal mules beraksen emas hangat", "Tas rotan anyaman premium"],
          occasion: "Acara Sosial Kasual & Teh Sore"
        }
      ];
    }
  } else {
    if (skinTone === "Deep" || skinTone === "Medium") {
      season = "Bright Winter";
      summary = `Kombinasi rambut gelap berkontras tinggi dengan kulit bertipe dingin mengkategorikan ${clientName || "Klien"} ke dalam 'Bright Winter'. Warna-warna solid berpenampilan dramatis menonjolkan kekuatan kontras alami mereka secara mutakhir.`;
      bestColors = [
        { name: "Indigo Sapphire", hex: "#0F4C81", reason: "Menonjolkan warna mata yang tajam dan mencerahkan area kulit dingin." },
        { name: "Electric Magenta", hex: "#D90429", reason: "Warna berani bersaturasi tinggi membuat penampilan bersemangat seketika." },
        { name: "Pure Snow White", hex: "#FDF0ED", reason: "Menciptakan kecemerlangan kontras bersih di atas sutra premium." }
      ];
      avoidColors = ["Ochre Yellow", "Pumpkin Orange", "Warm Camel Beige"];
      suggestedFabrics = ["Wol Gabardin", "Premium Satin Silk", "Velvet Beludru Mewah"];
      outfitInspirations = [
        {
          title: "Midnight Avant-Garde",
          clothes: ["Coat panjang sutra beludru warna midnight blue", "Kemeja lipit snow white", "Kalung perak chunky minimalis"],
          occasion: "Gala Pembukaan Butik / Acara Penghargaan"
        }
      ];
    } else {
      season = "Cool Summer";
      summary = `Kulit terang halus berbayang dingin dengan kemilau abu-abu mengarahkan model arsitektur data kami ke rumpun 'Cool Summer'. Palet pastel yang berdebu dan bertingkat kontras lembut menghidupkan keanggunan melankolis yang berkelas.`;
      bestColors = [
        { name: "Dusty Rose Pastel", hex: "#CBA1A5", reason: "Melunakkan bayangan wajah merah/kelelahan dengan tone romantis." },
        { name: "Powder Sky Blue", hex: "#90E0EF", reason: "Meningkatkan impresi bersih berkabut yang menentramkan kulit wajah." },
        { name: "Soft Slate Mauve", hex: "#9B72AA", reason: "Warna elegan yang menggabungkan kesunyian abu-abu dengan romantisme lavender." }
      ];
      avoidColors = ["Neon Yellow", "Brick Orange", "Pure Pitch Black"];
      suggestedFabrics = ["Soft Parisian Chiffon", "Premium Modal Jersey", "Kasmir Halus"];
      outfitInspirations = [
        {
          title: "Mist Whispers Afternoon Walk",
          clothes: ["Blouse sifon powder blue beraksen ruffles lembut", "Rok midi plisket dusty rose", "Flatshoes berhias permata perak"],
          occasion: "Sesi Brunch bersama Stylist / Reuni Semi-formal"
        }
      ];
    }
  }
  res.json({
    seasonPalette: season,
    recommendationSummary: summary,
    bestColors,
    avoidColors,
    suggestedFabrics,
    outfitInspirations
  });
});
app.post("/api/analyze-image", async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Data gambar wajib disertakan." });
  }
  let base64Data = image;
  let mimeType = "image/jpeg";
  if (image.startsWith("data:")) {
    const parts = image.split(";base64,");
    if (parts.length === 2) {
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }
  }
  if (ai) {
    try {
      console.log("Calling Gemini AI Vision model to analyze face colors...");
      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data
        }
      };
      const textPart = {
        text: `Analyze the face characteristics of this client for a seasonal color analysis. 
Identify and return the detected physical traits strictly matching the following options. Pick the single closest matching value for each property:
1. underTone MUST be exactly: "Warm", "Cool", or "Neutral"
2. skinTone: "Fair White", "Medium (Kuning Langsat)", "Medium Brown", "Olive Deep", "Deep Chocolate", or "Olive Gold"
3. hairColor: "Dark Ash Brown", "Golden Brown", "Black Silk", "Jet Black", "Dark Brown", or "Black Charcoal"
4. eyeColor: "Grey Blue", "Light Amber", "Dark Brown", "Deep Grey", "Black", or "Greyish Brown"

Format the response strictly as a JSON object:
{
  "underTone": "Warm" | "Cool" | "Neutral",
  "skinTone": string,
  "hairColor": string,
  "eyeColor": string
}`
      };
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              underTone: { type: Type.STRING },
              skinTone: { type: Type.STRING },
              hairColor: { type: Type.STRING },
              eyeColor: { type: Type.STRING }
            },
            required: ["underTone", "skinTone", "hairColor", "eyeColor"]
          }
        }
      });
      const responseText = response.text || "";
      console.log("Gemini returned face colors analysis:", responseText);
      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);
    } catch (err) {
      console.error("Gemini image face analysis failed, running fallback simulator:", err.message);
    }
  }
  console.log("Running heuristic-based color analyzer simulation...");
  const undertones = ["Cool", "Warm", "Neutral"];
  const skinTones = ["Fair White", "Medium (Kuning Langsat)", "Olive Gold", "Deep Chocolate"];
  const hairColors = ["Dark Ash Brown", "Golden Brown", "Black Silk", "Jet Black", "Dark Brown"];
  const eyeColors = ["Grey Blue", "Light Amber", "Dark Brown", "Deep Grey", "Black"];
  const seed = base64Data.length || 100;
  const underTone = undertones[seed % undertones.length];
  const skinTone = skinTones[(seed >> 2) % skinTones.length];
  const hairColor = hairColors[(seed >> 4) % hairColors.length];
  const eyeColor = eyeColors[(seed >> 6) % eyeColors.length];
  return res.json({ underTone, skinTone, hairColor, eyeColor });
});
app.post("/api/chat-stylist", async (req, res) => {
  const { messages, clientName, seasonPalette, styleArchetype } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Riwayat percakapan tidak valid." });
  }
  const latestUserMsg = messages[messages.length - 1]?.text || "";
  const systemInstruction = `Anda adalah chatbot AI Stylist eksklusif dari Boutique RST. 
Nama klien adalah ${clientName || "Sobat Butik"}. 
Palet Warna Mereka: ${seasonPalette || "Belum dianalisis (Default: Netral/Spring)"}.
Gaya Fashion Pribadi: ${styleArchetype || "Belum ditentukan (Default: Kasual Minimalis)"}.

Bicaralah dalam Bahasa Indonesia yang sangat hangat, ramah, berbudaya fesyen tinggi, namun santun, sopan, dan inspiratif. Berikan ide mix and match baju, aksesoris, atau bahan tekstil berdasarkan palet warna klien secara presisi.
Sebut nama klien beberapa kali agar percakapan terasa personal dan inklusif. Batasi tanggapan Anda maksimal 4-5 kalimat berbobot tinggi.`;
  if (ai) {
    try {
      console.log("Sending message list to Gemini Chat...");
      const chatHistory = messages.slice(0, -1).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      const model = "gemini-3.5-flash";
      const response = await ai.models.generateContent({
        model,
        contents: [
          ...chatHistory,
          { role: "user", parts: [{ text: latestUserMsg }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.8
        }
      });
      const responseText = response.text || "";
      return res.json({ reply: responseText.trim() });
    } catch (err) {
      console.error("Gemini chat error, running rule-based simulator conversation:", err);
    }
  }
  let reply = "";
  const messageLower = latestUserMsg.toLowerCase();
  let detectedUnderTone = "Cool";
  if (seasonPalette === "Warm Spring" || seasonPalette === "Deep Autumn") {
    detectedUnderTone = "Warm";
  }
  if (messageLower.includes("halo") || messageLower.includes("hi") || messageLower.includes("pagi") || messageLower.includes("siang") || messageLower.includes("sore") || messageLower.includes("malam") || messageLower.includes("assalamualaikum")) {
    reply = `Halo, Kak ${clientName || "Sobat Butik"}! Senang sekali bisa menyapa Anda hari ini \u{1F338}. Saya AI Personal Stylist Eksklusif Anda dari Boutique RST. Dengan palet warna indah '${seasonPalette || "Cool Summer"}' dan arsitektur gaya '${styleArchetype || "Casual Minimalist"}', mari kita diskusikan padu padan busana terbaik Anda. Ada acara khusus atau item fashion tertentu yang ingin Anda tanyakan?`;
  } else if (messageLower.includes("gaun") || messageLower.includes("dress") || messageLower.includes("pesta") || messageLower.includes("kondangan") || messageLower.includes("formal") || messageLower.includes("nikah") || messageLower.includes("gala")) {
    if (detectedUnderTone === "Warm") {
      reply = `Wah, untuk acara khusus, Kak ${clientName}, gaun berpotongan elegan dengan palet hangat '${seasonPalette}' seperti Terracotta hangat atau Peach Gold sangat direkomendasikan! Coba pasangkan dress midi sutra dengan sabuk keemasan tipis untuk menonjolkan arsitektur gaya '${styleArchetype}' Kakak. Paduan ini menjamin penampilan yang mewah namun tetap bersahaja \u2728.`;
    } else {
      reply = `Rencana istimewa, Kak ${clientName}! Siluet gaun pesta bertingkat atau gaun satin berwarna Dusty Rose, Sage Mauve, atau Snow White sangat cocok untuk palet dingin '${seasonPalette}' Anda. Untuk gaya '${styleArchetype}', padukan dengan perhiasan perak halus atau mutiara agar keanggunan alami Anda tampak bersinar tanpa terlihat berlebihan \u{1F4AB}.`;
    }
  } else if (messageLower.includes("hijab") || messageLower.includes("kerudung") || messageLower.includes("jilbab") || messageLower.includes("pashmina")) {
    if (detectedUnderTone === "Warm") {
      reply = `Untuk pilihan jilbab bagi Kak ${clientName}, pilihlah bahan krep chiffon atau ceruti premium dengan rona bumi yang hangat seperti Warm Almond, Sand Beige, atau Olive lembut. Ini sangat menyeimbangkan rona wajah "${seasonPalette}" Kakak dan mendukung tampilan '${styleArchetype}' yang santun serta sangat berkelas!`;
    } else {
      reply = `Sangat anggun, Kak ${clientName}! Pashmina atau kerudung segi empat berbahan sutra atau paris dengan warna Soft Lavender, Dusty Pink, atau Slate Grey adalah pilihan terbaik bagi tipe '${seasonPalette}'. Warna-warna ini akan mencerahkan wajah Kakak secara natural tanpa rona mendung, sangat serasi untuk gaya '${styleArchetype}' yang elegan.`;
    }
  } else if (messageLower.includes("sepatu") || messageLower.includes("heels") || messageLower.includes("sneaker") || messageLower.includes("flat") || messageLower.includes("sandal") || messageLower.includes("alas kaki")) {
    if (styleArchetype.includes("Casual") || styleArchetype.includes("Minimalist")) {
      reply = `Untuk menyempurnakan gaya '${styleArchetype}' Kak ${clientName}, sandal mules bertekstur kulit matte warna nude atau sneakers putih bersih dengan aksen monokrom sangat ideal! Tampilan kasual minimalis ini tetap terasa rapi dan nyaman untuk beraktivitas seharian penuh.`;
    } else {
      reply = `Sebagai bagian dari arsitektur gaya '${styleArchetype}' Kak ${clientName}, sepatu stiletto bertekstur suede lembut warna nude atau selop berujung lancip (pointed-toe flat) berhias perak sangat sempurna. Ini memberikan sentuhan struktur formal yang anggun serta mempesona.`;
    }
  } else if (messageLower.includes("aksesoris") || messageLower.includes("perhiasan") || messageLower.includes("anting") || messageLower.includes("kalung") || messageLower.includes("emas") || messageLower.includes("perak") || messageLower.includes("gold") || messageLower.includes("silver")) {
    if (detectedUnderTone === "Warm") {
      reply = `Berdasarkan rona hangat Kak ${clientName}, perhiasan logam beraksen Yellow Gold, Rose Gold, atau Kuningan bertekstur sikat (brushed bronze) sangat menyatu dengan kulit hangat Anda. Cobalah kalung rantai minimalis berwarna emas untuk mempercantik paduan gaya '${styleArchetype}' Anda \u{1F31F}.`;
    } else {
      reply = `Rona dingin '${seasonPalette}' Kak ${clientName} paling bersinar dengan kilau Perak (Silver), Platinum, atau Emas Putih (White Gold) yang bersih. Anting giwang perak minimalis atau gelang tipis bertatahkan kristal jernih akan menegaskan pesona natural Kakak secara elegan dan berkelas!`;
    }
  } else if (messageLower.includes("makeup") || messageLower.includes("dandan") || messageLower.includes("lipstik") || messageLower.includes("blush")) {
    if (detectedUnderTone === "Warm") {
      reply = `Rekomendasi riasan wajah untuk Kak ${clientName} yang bertipe hangat adalah lipstik bernuansa coral, peach hangat, atau terracotta tipis dikombinasikan dengan blush-on rona aprikot. Riasan ini akan beresonansi indah dengan palet '${seasonPalette}' Anda dan memancarkan kesegaran alami yang memikat.`;
    } else {
      reply = `Untuk riasan natural penunjang '${seasonPalette}' Kak ${clientName}, pilihlah warna lipstik dusty rose, berry lembut, atau shade mauve dingin dengan blush-on pink muda segar. Ini akan mencerahkan kontras wajah Kakak secara elegan, sangat serasi untuk gaya '${styleArchetype}'!`;
    }
  } else if (messageLower.includes("warna") || messageLower.includes("rekomen") || messageLower.includes("pilih") || messageLower.includes("palet") || messageLower.includes("baju")) {
    reply = `Tentu saja, Kak ${clientName || "Sobat"}. Dengan palet musiman '${seasonPalette || "Cool Summer"}', rona warna yang kami rekomendasikan akan menyembunyikan bayangan lelah pada wajah secara magis. Coba pakai atasan bernada pastel lembut atau netral berkarakter tenang, lalu tambahkan aksen warna utama Anda sesuai arsitektur gaya '${styleArchetype}' Kakak.`;
  } else if (messageLower.includes("gaya") || messageLower.includes("mix") || messageLower.includes("match") || messageLower.includes("kombinasi") || messageLower.includes("style") || messageLower.includes("celana")) {
    reply = `Untuk padu padan favorit Kak ${clientName}, gaya '${styleArchetype}' Anda sangat menawan apabila memadukan kemeja berkerah rapi dengan bawahan berpotongan bersih, dibalut outer warna teduh berpalet '${seasonPalette}'. Ini akan menonjolkan karisma profesional yang rapi namun tetap terasa bersahabat dan modern! \u{1F4AB}`;
  } else if (messageLower.includes("bahan") || messageLower.includes("kain") || messageLower.includes("tekstil") || messageLower.includes("sutra") || messageLower.includes("linen") || messageLower.includes("katun")) {
    reply = `Pilihan serat kain yang berkualitas tinggi adalah fondasi kenyamanan, Kak ${clientName}. Untuk kategori gaya '${styleArchetype}', kami merekomendasikan bahan sutra tipis, katun combed premium, atau linen rami halus karena mampu memantulkan warna-warna palet '${seasonPalette}' secara optimal dan memberikan kejatuhan bahan yang anggun.`;
  } else {
    reply = `Ide yang luar biasa menarik, Kak ${clientName}! Dalam prinsip desain personal styling Boutique RST, detail-detail kecil seperti itu justru yang menyempurnakan keseluruhan estetika Anda secara substansial. Jika Kakak ingin mendiskusikan mix-and-match item ini dengan palet '${seasonPalette}' atau setelan '${styleArchetype}', silakan beri tahu saya lebih lanjut!`;
  }
  res.json({ reply });
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Running Express server with Vite middleware in DEVELOPMENT mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Running Express server in PRODUCTION container mode.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Boutique Mode TOGAF ERP listening on port ${PORT}! Access http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
