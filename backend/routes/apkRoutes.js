const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")

// Simple endpoint to download the APK
router.get("/download", (req, res) => {
  try {
    // Log the current directory to help debug
    console.log("Current directory:", __dirname)

    // Try multiple possible paths to find the APK
    const possiblePaths = [
      path.join(__dirname, "../backend/apk/indiazo.apk"),
      path.join(__dirname, "../../backend/apk/indiazo.apk"),
      path.join(__dirname, "../apk/indiazo.apk"),
      path.join(__dirname, "../../apk/indiazo.apk"),
      path.join(__dirname, "../public/apk/indiazo.apk"),
      path.join(process.cwd(), "backend/apk/indiazo.apk"),
      path.join(process.cwd(), "apk/indiazo.apk"),
      
    ]

    // Log all the paths we're checking
    console.log("Checking these paths for the APK file:")
    possiblePaths.forEach((p) => console.log(" - " + p))

    // Find the first path that exists
    let apkPath = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        apkPath = p
        console.log("Found APK at:", apkPath)
        break
      }
    }

    // If no path exists, return an error
    if (!apkPath) {
      console.error("APK file not found in any of the checked locations")
      return res.status(404).json({
        success: false,
        message: "APK file not found in any of the checked locations",
      })
    }

    // Check if the user agent is Android
    const userAgent = req.headers["user-agent"] || ""
    const isAndroid = userAgent.toLowerCase().includes("android")

    // Set headers for APK download with the correct filename
    res.setHeader("Content-Disposition", `${isAndroid ? "inline" : "attachment"}; filename=indiazo.apk`)
    res.setHeader("Content-Type", "application/vnd.android.package-archive")

    // Stream the file
    const fileStream = fs.createReadStream(apkPath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Error downloading APK:", error)
    res.status(500).json({
      success: false,
      message: "Error downloading APK: " + error.message,
    })
  }
})

// Add a debug endpoint to check file paths
router.get("/debug", (req, res) => {
  try {
    const currentDir = __dirname
    const projectRoot = process.cwd()

    const debug = {
      currentDirectory: currentDir,
      projectRoot: projectRoot,
      checkedPaths: [],
    }

    // Check multiple possible paths
    const possiblePaths = [
      path.join(__dirname, "../backend/apk/indiazo.apk"),
      path.join(__dirname, "../../backend/apk/indiazo.apk"),
      path.join(__dirname, "../apk/indiazo.apk"),
      path.join(__dirname, "../../apk/indiazo.apk"),
      path.join(__dirname, "../public/apk/indiazo.apk"),
      path.join(process.cwd(), "backend/apk/indiazo.apk"),
      path.join(process.cwd(), "apk/indiazo.apk"),
    ]

    // Check each path
    for (const p of possiblePaths) {
      const exists = fs.existsSync(p)
      debug.checkedPaths.push({
        path: p,
        exists: exists,
      })
    }

    // Return debug info
    res.json({
      success: true,
      debug: debug,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in debug endpoint: " + error.message,
    })
  }
})

// New endpoint that redirects to the intent URL for direct installation
router.get("/install", (req, res) => {
  const downloadUrl = `${req.protocol}://${req.get("host")}/api/apk/download`

  // Check if the user agent is Android
  const userAgent = req.headers["user-agent"] || ""
  const isAndroid = userAgent.toLowerCase().includes("android")

  if (isAndroid) {
    // Redirect to intent URL that will prompt installation
    const intentUrl = `intent://${req.get("host")}/api/apk/download#Intent;scheme=http;package=in.matkaprince.app;action=android.intent.action.VIEW;end;`
    return res.redirect(intentUrl)
  } else {
    // For non-Android devices, just redirect to the download page
    return res.redirect("/download-app")
  }
})

module.exports = router

