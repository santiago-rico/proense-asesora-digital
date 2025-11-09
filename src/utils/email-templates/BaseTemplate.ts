import { getEmailLogoUrls, logEmailDebugInfo } from './EmailUtils.js';
import { LogoUtils } from './LogoUtils.js';

interface BaseTemplateProps {
  preheader?: string;
  content: string;
  isDarkMode?: boolean;
  baseUrl?: string;
}

export function BaseTemplate({ preheader, content, isDarkMode = false, baseUrl }: BaseTemplateProps): string {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';
  const cardBgColor = isDarkMode ? '#2d2d2d' : '#ffffff';
  const mutedColor = isDarkMode ? '#a0a0a0' : '#6c757d';
  const borderColor = isDarkMode ? '#404040' : '#e9ecef';

  // Debug logging
  logEmailDebugInfo('BaseTemplate', baseUrl);

  // Get logo URLs with fallbacks
  const logoUrls = getEmailLogoUrls(baseUrl);
  const logoUrl80 = logoUrls.primary.logo80;
  const fallbackLogoUrl80 = logoUrls.fallback.logo80;
  const externalLogoUrl80 = logoUrls.external.logo80;
  
  // Get icon logo URLs for high-quality rendering (not text logo)
  const iconLogoUrl = logoUrls.iconLogo.fallback;
  const iconLogoAvifUrl = logoUrls.iconLogo.avif;
  const iconLogoWebpUrl = logoUrls.iconLogo.webp;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Proense Asesora Digital</title>
  <link rel="preload" href="${logoUrl80}" as="image" type="image/png">
  <link rel="preload" href="${fallbackLogoUrl80}" as="image" type="image/png">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    /* Client-specific styles */
    body { margin: 0 !important; padding: 0 !important; min-width: 100% !important; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .darkmode-bg { background-color: #1a1a1a !important; }
      .darkmode-card { background-color: #2d2d2d !important; }
      .darkmode-text { color: #e0e0e0 !important; }
      .darkmode-muted { color: #a0a0a0 !important; }
      .darkmode-border { border-color: #404040 !important; }
      .darkmode-header-bg { background-color: #2d2d2d !important; }
      .darkmode-tagline-bg { background-color: #1a1a1a !important; }
      .darkmode-tagline-border { border-color: #404040 !important; }
      .darkmode-company-name { color: #40A5FD !important; }
      .darkmode-company-subtitle { color: #5FCB83 !important; }
      .darkmode-tagline-text { color: #40A5FD !important; }
    }
    
    /* Enhanced logo styles - no blue box background */
    .logo-container {
      display: inline-block;
      vertical-align: middle;
    }
    
    .logo-img {
      display: block !important;
      width: auto;
      height: auto;
      max-width: 120px;
      max-height: 120px;
    }
    
    .logo-fallback {
      display: none;
      padding: 10px;
      align-items: center;
      justify-content: center;
      color: #0073D1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      line-height: 1.2;
      letter-spacing: 0.5px;
    }
    
    /* Show fallback when image fails */
    .logo-img:not([src]), .logo-img[src=""], .logo-img[src*="data:image/svg+xml"] {
      display: none !important;
    }
    
    .logo-img:not([src]) + .logo-fallback,
    .logo-img[src=""] + .logo-fallback,
    .logo-img[src*="data:image/svg+xml"] + .logo-fallback {
      display: flex !important;
    }
    
    /* Dark mode logo adjustments */
    @media (prefers-color-scheme: dark) {
      .logo-img {
        filter: brightness(1.2) contrast(0.95);
      }
      .logo-fallback {
        color: #4A9EFF;
      }
    }
    
    [data-ogsc] .logo-img {
      filter: brightness(1.2) contrast(0.95);
    }
    [data-ogsc] .logo-fallback {
      color: #4A9EFF;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .mobile-header { font-size: 24px !important; line-height: 32px !important; }
      .mobile-text { font-size: 16px !important; line-height: 24px !important; }
      .mobile-button { width: 100% !important; }
      .mobile-hide { display: none !important; }
      .mobile-show { display: block !important; }
      .mobile-center { text-align: center !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      
      /* Header mobile adjustments */
      .mobile-company-name { font-size: 20px !important; }
      .mobile-company-subtitle { font-size: 10px !important; }
      .mobile-tagline { font-size: 12px !important; padding: 6px 16px !important; }
      .mobile-header-padding { padding: 20px !important; }
      .mobile-logo { width: 80px !important; height: 80px !important; max-width: 80px !important; }
      
      /* Mobile logo container adjustments */
      .logo-container { width: 80px !important; height: 80px !important; }
      .logo-fallback { width: 80px !important; height: 80px !important; }
      .logo-fallback span { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; word-spacing: normal; background-color: ${bgColor};" class="darkmode-bg">
  ${preheader ? `<div style="display: none; font-size: 1px; color: ${bgColor}; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
  
  <div role="article" aria-roledescription="email" lang="es" style="text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 0;">
          <!--[if mso]>
          <table role="presentation" align="center" style="width: 600px;">
          <tr>
          <td>
          <![endif]-->
          
          <!-- Email Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse;">
            
            <!-- Modern Asymmetric Header - Option 4 Inspired -->
            <tr>
              <td style="background-color: #ffffff; position: relative;" class="darkmode-header-bg">
                <!-- Shadow effect for the header -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                  <tr>
                    <td style="padding: 24px 40px; position: relative;" class="mobile-header-padding">
                      <!-- Gradient overlay background (right side) -->
                      <!--[if !mso]><!-->
                      <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 40%; background: linear-gradient(90deg, transparent 0%, rgba(0, 115, 209, 0.05) 100%); pointer-events: none;"></div>
                      <!--<![endif]-->
                      
                      <!-- Main content table -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <!-- Left side: Logo and company name -->
                          <td valign="middle" style="position: relative; z-index: 1;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <!-- High-quality logo without blue box background -->
                                <td valign="middle" style="padding-right: 16px;">
                                  <div class="logo-container">
                                    <!-- High-resolution text logo with multiple formats -->
                                    <!--[if !mso]><!-->
                                    <picture>
                                      <!-- AVIF for modern browsers (best quality & smallest size) -->
                                      <source srcset="${iconLogoAvifUrl}" type="image/avif">
                                      <!-- WebP for good browser support -->
                                      <source srcset="${iconLogoWebpUrl}" type="image/webp">
                                      <!-- PNG fallback with retina support -->
                                      <img src="${iconLogoUrl}" 
                                           srcset="${iconLogoUrl} 2x"
                                           width="120" 
                                           height="120" 
                                           alt="Proense Seguros" 
                                           title="Proense Seguros" 
                                           style="display: block; border: 0; max-width: 120px; height: auto; width: 120px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" 
                                           class="logo-img mobile-logo" 
                                           loading="eager">
                                    </picture>
                                    <!-- Text fallback for when images don't load -->
                                    <div class="logo-fallback" style="display: none;">
                                      PROENSE SEGUROS
                                    </div>
                                    <!--<![endif]-->
                                    
                                    <!--[if mso]>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                      <tr>
                                        <td align="center" valign="middle">
                                          <img src="${iconLogoUrl}" 
                                               width="120" 
                                               height="120" 
                                               alt="Proense Seguros" 
                                               style="display: block; border: 0; max-width: 120px; height: auto;" />
                                        </td>
                                      </tr>
                                    </table>
                                    <![endif]-->
                                  </div>
                                </td>
                                <!-- Tagline next to logo -->
                                <td valign="middle" style="padding-left: 8px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td>
                                        <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; color: #0073D1; line-height: 1;" class="darkmode-company-name mobile-company-name">PROENSE</h1>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding-top: 2px;">
                                        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; color: #3B8C59; text-transform: uppercase; letter-spacing: 1px;" class="darkmode-company-subtitle mobile-company-subtitle">SEGUROS</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                          
                          <!-- Right side: Tagline badge (hidden on mobile) -->
                          <td align="right" valign="middle" class="mobile-hide">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(0, 115, 209, 0.08); border: 1px solid rgba(0, 115, 209, 0.2); border-radius: 20px; position: relative; z-index: 1;" class="darkmode-tagline-bg darkmode-tagline-border">
                              <tr>
                                <td style="padding: 8px 24px;">
                                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #0073D1; white-space: nowrap;" class="darkmode-tagline-text">Tu aliado en seguros</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Mobile tagline (shown only on mobile) -->
                      <!--[if !mso]><!-->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="mobile-show" style="display: none; margin-top: 16px;">
                        <tr>
                          <td align="center">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(0, 115, 209, 0.08); border: 1px solid rgba(0, 115, 209, 0.2); border-radius: 16px;" class="darkmode-tagline-bg darkmode-tagline-border">
                              <tr>
                                <td style="padding: 8px 20px;" class="mobile-tagline">
                                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #0073D1;" class="darkmode-tagline-text">Tu aliado en seguros</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Visual Separator -->
            <tr>
              <td style="background: linear-gradient(90deg, #0073D1 0%, #3B8C59 100%); height: 4px; line-height: 4px; font-size: 1px;">&nbsp;</td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="background-color: ${cardBgColor}; padding: 40px;" class="darkmode-card mobile-padding">
                ${content}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: ${bgColor}; padding: 40px;" class="darkmode-bg mobile-padding">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 0 10px;">
                            <a href="https://www.facebook.com/proense" style="text-decoration: none;">
                              <img src="https://img.icons8.com/color/48/facebook-new.png" width="32" height="32" alt="Facebook" style="display: block; border: 0;">
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://www.instagram.com/proense_seguros/" style="text-decoration: none;">
                              <img src="https://img.icons8.com/fluency/48/instagram-new.png" width="32" height="32" alt="Instagram" style="display: block; border: 0;">
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://api.whatsapp.com/send?phone=573155862884&text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20recibir%20asesor%C3%ADa%20de%20Proense%20Seguros%20%F0%9F%98%83" style="text-decoration: none;">
                              <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="32" height="32" alt="WhatsApp" style="display: block; border: 0;">
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 21px; color: ${mutedColor};" class="darkmode-muted">
                        <strong>PROENSE AGENCIA DE SEGUROS LTDA</strong><br>
                        NIT: 901915787-3<br>
                        Tel: +57 315 586 2884 | comercial@proense.co
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 20px; border-top: 1px solid ${borderColor};" class="darkmode-border">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px; color: ${mutedColor};" class="darkmode-muted">
                        © ${new Date().getFullYear()} PROENSE AGENCIA DE SEGUROS LTDA. Todos los derechos reservados.<br>
                        Este correo electrónico y cualquier archivo adjunto son confidenciales.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
          </table>
          
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}