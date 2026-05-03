export async function translate(req, res) {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ message: "text, sourceLang, and targetLang are required" });
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    const translatedText = data?.responseData?.translatedText;
    if (!translatedText) {
      return res.status(502).json({ message: "Translation service unavailable" });
    }

    res.json({ translatedText });
  } catch (err) {
    console.error("translate error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
