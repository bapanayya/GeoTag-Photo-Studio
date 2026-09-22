Add-Type -AssemblyName System.Drawing

$baseDir = "E:\Google-AntiGravity-Projects\GeoTag-Photo-Studio"
$playstoreDir = Join-Path $baseDir "assets\playstore"
$screenshotsDir = Join-Path $playstoreDir "screenshots"

if (-not (Test-Path $screenshotsDir)) {
    New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
}

$logoPath = Join-Path $baseDir "web\assets\Geo-Tag-Camera-Logo.png"
if (-not (Test-Path $logoPath)) {
    $logoPath = Join-Path $baseDir "web\assets\icons\icon-512.png"
}
$logoImg = [System.Drawing.Image]::FromFile($logoPath)

$tcLogoPath = Join-Path $baseDir "web\assets\The-Competitive-Edge-Logo.jpg"
$tcLogoImg = $null
if (Test-Path $tcLogoPath) {
    $tcLogoImg = [System.Drawing.Image]::FromFile($tcLogoPath)
}

# -------------------------------------------------------------
# 1. PLAY STORE APP ICON (512x512 PNG)
# -------------------------------------------------------------
$iconPath = Join-Path $playstoreDir "app-icon-512x512.png"
$iconBmp = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($iconBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$g.DrawImage($logoImg, 0, 0, 512, 512)
$g.Dispose()

$iconBmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Output "✅ Generated App Icon: $iconPath (512x512)"

# -------------------------------------------------------------
# 2. FEATURE GRAPHIC (1024x500 PNG)
# -------------------------------------------------------------
$featPath = Join-Path $playstoreDir "feature-graphic-1024x500.png"
$featBmp = [System.Drawing.Bitmap]::new(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($featBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Gradient Background (Deep Navy to Slate)
$rect = [System.Drawing.Rectangle]::new(0, 0, 1024, 500)
$gradBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, 
    [System.Drawing.Color]::FromArgb(255, 11, 22, 40), 
    [System.Drawing.Color]::FromArgb(255, 15, 35, 75), 
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillRectangle($gradBrush, $rect)
$gradBrush.Dispose()

# App Logo on Left
$logoSize = 340
$logoX = 60
$logoY = [int]((500 - $logoSize) / 2)
$g.DrawImage($logoImg, $logoX, $logoY, $logoSize, $logoSize)

# Cyan/Sky Accent Border around Logo
$skyPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(220, 56, 189, 248), 3)
$g.DrawRectangle($skyPen, $logoX, $logoY, $logoSize, $logoSize)
$skyPen.Dispose()

# Typography
$titleFont = [System.Drawing.Font]::new('Arial', 46, [System.Drawing.FontStyle]::Bold)
$whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$g.DrawString('GeoTag Studio', $titleFont, $whiteBrush, 430, 85)
$titleFont.Dispose()

$subFont = [System.Drawing.Font]::new('Arial', 21, [System.Drawing.FontStyle]::Bold)
$cyanBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString('GPS Map Camera and EXIF Geotagging', $subFont, $cyanBrush, 432, 160)
$subFont.Dispose()
$cyanBrush.Dispose()

$badgeFont = [System.Drawing.Font]::new('Arial', 14, [System.Drawing.FontStyle]::Bold)
$greenBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 52, 211, 153))
$g.DrawString('[OK] 100% On-Device and Private (Zero Server Uploads)', $badgeFont, $greenBrush, 432, 210)
$badgeFont.Dispose()
$greenBrush.Dispose()

$featFont = [System.Drawing.Font]::new('Arial', 15, [System.Drawing.FontStyle]::Regular)
$grayBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 226, 232, 240))
$g.DrawString('* Compact Bottom-Left Stamp - Subject Friendly & Unblocked', $featFont, $grayBrush, 432, 255)
$g.DrawString('* Dual-Layer Tagging: High-Res Typography + Real EXIF GPS', $featFont, $grayBrush, 432, 290)
$g.DrawString('* Mini-Map Preview (Satellite & Street) + Draggable Pin', $featFont, $grayBrush, 432, 325)
$featFont.Dispose()
$grayBrush.Dispose()

$brandFont = [System.Drawing.Font]::new('Arial', 14, [System.Drawing.FontStyle]::Bold)
$goldBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 250, 204, 21))
$g.DrawString('Official App of The Competitive Edge | youtube.com/@TheCompetitiveEdge-b4z', $brandFont, $goldBrush, 432, 385)
$brandFont.Dispose()
$goldBrush.Dispose()
$whiteBrush.Dispose()

$g.Dispose()
$featBmp.Save($featPath, [System.Drawing.Imaging.ImageFormat]::Png)
$featBmp.Dispose()
Write-Output "✅ Generated Feature Graphic: $featPath (1024x500)"

# -------------------------------------------------------------
# 3. HIGH-RESOLUTION PHONE SCREENSHOT MOCKUPS (1080x1920 PNG)
# -------------------------------------------------------------
$mockups = @(
    @{
        File = 'screenshot1-compact-card.png'
        Header = 'PHOTO-FRIENDLY COMPACT STAMP'
        Sub = 'Unobtrusive Bottom-Left Card Keeps Subjects Clear'
        Feature1 = 'Leaves >56% of photo width open and visible'
        Feature2 = 'Perfect for NAAC, inspections, events & ceremonies'
        Feature3 = 'Multiple aspect ratios (4:3, 16:9, 1:1, 9:16)'
        AccentColor = [System.Drawing.Color]::FromArgb(255, 56, 189, 248)
    },
    @{
        File = 'screenshot2-dual-layer-exif.png'
        Header = 'DUAL-LAYER GPS GEOTAGGING'
        Sub = 'Visual Typography AND Authentic Binary EXIF GPS'
        Feature1 = 'Embeds coordinates, address, timestamp & Plus Code'
        Feature2 = 'Injects real EXIF metadata for official portals'
        Feature3 = 'Retains or customizes original capture date/time'
        AccentColor = [System.Drawing.Color]::FromArgb(255, 52, 211, 153)
    },
    @{
        File = 'screenshot3-interactive-map-search.png'
        Header = 'INTERACTIVE MAP & SMART GPS'
        Sub = 'Live Satellite & Street Tiles with Typo-Tolerant Search'
        Feature1 = 'Multi-provider GPS with instant reverse geocoding'
        Feature2 = 'Interactive map picker modal with draggable marker'
        Feature3 = 'Typo-tolerant search for colleges, landmarks & places'
        AccentColor = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)
    },
    @{
        File = 'screenshot4-private-offline-presets.png'
        Header = '100% PRIVATE & OFFLINE'
        Sub = 'Instant Presets & Zero Data Transmission'
        Feature1 = 'Preloaded favorites: SVA Govt College & custom spots'
        Feature2 = 'Offline vector fallback map when no network is present'
        Feature3 = 'Zero cloud uploads - all photos stay on your device'
        AccentColor = [System.Drawing.Color]::FromArgb(255, 168, 85, 247)
    }
)

foreach ($sc in $mockups) {
    $scPath = Join-Path $screenshotsDir $sc.File
    $scBmp = [System.Drawing.Bitmap]::new(1080, 1920, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($scBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background gradient
    $bgRect = [System.Drawing.Rectangle]::new(0, 0, 1080, 1920)
    $grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new($bgRect,
        [System.Drawing.Color]::FromArgb(255, 11, 22, 40),
        [System.Drawing.Color]::FromArgb(255, 23, 37, 84),
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($grad, $bgRect)
    $grad.Dispose()

    # Top Brand Header Banner
    $bannerLogo = if ($tcLogoImg) { $tcLogoImg } else { $logoImg }
    $g.DrawImage($bannerLogo, 80, 70, 130, 130)
    $brandF = [System.Drawing.Font]::new('Arial', 28, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $g.DrawString('The Competitive Edge', $brandF, $whiteBrush, 235, 95)
    $brandF.Dispose()

    $appF = [System.Drawing.Font]::new('Arial', 20, [System.Drawing.FontStyle]::Bold)
    $cyanB = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $g.DrawString('GeoTag Studio - GPS Map Camera', $appF, $cyanB, 238, 145)
    $appF.Dispose()
    $cyanB.Dispose()

    # Screenshot Hero Title
    $heroF = [System.Drawing.Font]::new('Arial', 38, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($sc.Header, $heroF, $whiteBrush, 80, 260)
    $heroF.Dispose()

    # Subtitle
    $subF = [System.Drawing.Font]::new('Arial', 24, [System.Drawing.FontStyle]::Regular)
    $goldB = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 250, 204, 21))
    $g.DrawString($sc.Sub, $subF, $goldB, 80, 325)
    $subF.Dispose()
    $goldB.Dispose()

    # Phone Mockup Frame
    $cardX = 80
    $cardY = 410
    $cardW = 920
    $cardH = 1350
    $cardRect = [System.Drawing.Rectangle]::new($cardX, $cardY, $cardW, $cardH)
    $cardBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $g.FillRectangle($cardBg, $cardRect)
    $cardBg.Dispose()

    $framePen = [System.Drawing.Pen]::new($sc.AccentColor, 4)
    $g.DrawRectangle($framePen, $cardRect)
    $framePen.Dispose()

    # Feature List inside Phone Card
    $itemF = [System.Drawing.Font]::new('Arial', 26, [System.Drawing.FontStyle]::Bold)
    $itemBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 241, 245, 249))

    $features = @($sc.Feature1, $sc.Feature2, $sc.Feature3)
    $fy = 550
    foreach ($feat in $features) {
        $circleBrush = [System.Drawing.SolidBrush]::new($sc.AccentColor)
        $g.FillEllipse($circleBrush, 140, $fy, 45, 45)
        $circleBrush.Dispose()

        $chkF = [System.Drawing.Font]::new('Arial', 20, [System.Drawing.FontStyle]::Bold)
        $g.DrawString('OK', $chkF, $whiteBrush, 146, $fy + 8)
        $chkF.Dispose()

        $g.DrawString($feat, $itemF, $itemBrush, 210, $fy + 8)
        $fy += 160
    }

    $itemF.Dispose()
    $itemBrush.Dispose()

    # Privacy Guarantee Badge at Bottom of Card
    $badgeRect = [System.Drawing.Rectangle]::new(140, 1180, 800, 120)
    $bbBg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
    $g.FillRectangle($bbBg, $badgeRect)
    $bbBg.Dispose()

    $privF = [System.Drawing.Font]::new('Arial', 26, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('100% PRIVATE AND ON-DEVICE', $privF, $whiteBrush, 190, 1205)
    $privSubF = [System.Drawing.Font]::new('Arial', 18, [System.Drawing.FontStyle]::Regular)
    $g.DrawString('Zero Server Uploads - Works Completely Offline', $privSubF, $whiteBrush, 250, 1250)
    $privF.Dispose()
    $privSubF.Dispose()
    $whiteBrush.Dispose()

    # Card Bottom Watermark
    $wmF = [System.Drawing.Font]::new('Arial', 20, [System.Drawing.FontStyle]::Bold)
    $wmBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(180, 148, 163, 184))
    $g.DrawString('GeoTag Studio - By The Competitive Edge', $wmF, $wmBrush, 260, 1410)
    $wmF.Dispose()
    $wmBrush.Dispose()

    $g.Dispose()
    $scBmp.Save($scPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $scBmp.Dispose()
    Write-Output "✅ Generated Phone Screenshot: $scPath (1080x1920)"
}

$logoImg.Dispose()
if ($tcLogoImg) { $tcLogoImg.Dispose() }
Write-Output "🎉 All Google Play Store graphics generated successfully!"
