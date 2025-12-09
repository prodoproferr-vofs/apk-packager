const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/build", upload.single("icon"), async (req, res) => {

  const siteUrl = req.body.url;
  const appName = req.body.appName;
  const iconPath = req.file.path;

  if (!siteUrl || !appName || !iconPath) {
    return res.json({ success: false, error: "Dados incompletos" });
  }

  const buildFolder = "./builds/" + Date.now();
  fs.mkdirSync(buildFolder, { recursive: true });

  // Copia template Android
  exec(`cp -r template ${buildFolder}`, (err) => {
    if (err) return res.json({ success: false, error: err.toString() });

    // Insere ícone
    fs.copyFileSync(iconPath, `${buildFolder}/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`);

    // Insere URL e Nome
    fs.writeFileSync(
      `${buildFolder}/app/src/main/assets/config.json`,
      JSON.stringify({ url: siteUrl, name: appName })
    );

    // Executa Gradle
    exec(`cd ${buildFolder} && ./gradlew assembleDebug`, (err) => {
      if (err) return res.json({ success: false, error: err.toString() });

      const apkPath = `${buildFolder}/app/build/outputs/apk/debug/app-debug.apk`;

      res.json({
        success: true,
        downloadUrl: apkPath.replace("./", "https://SEU-ENDEREÇO-RENDER.onrender.com/")
      });
    });
  });
});

app.listen(3000, () => console.log("SERVER ON"));
