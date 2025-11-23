/**
 * Logo utilities for email templates
 * Provides base64 encoding, responsive sizing, and dark mode support
 */

interface LogoOptions {
  width?: number;
  height?: number;
  alt?: string;
  darkModeUrl?: string;
  fallbackText?: string;
  removeBackground?: boolean;
}

export class LogoUtils {
  /**
   * Generate responsive logo HTML for email templates
   */
  static getResponsiveLogo(options: LogoOptions = {}): string {
    const {
      width = 200,
      height,
      alt = 'Proense Seguros',
    } = options;

    // Calculate height maintaining aspect ratio (logo is approximately 1.22:1)
    const calculatedHeight = height || Math.round(width * 0.82);

    // Create the logo HTML without the blue box background
    const logoHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="false" stroke="false" style="width:${width}px;height:${calculatedHeight}px;">
              <v:fill type="tile" src="https://proense.com.co/images/text-logo.png" />
              <v:textbox inset="0,0,0,0">
            <![endif]-->
            
            <div style="display: inline-block; max-width: ${width}px;">
              <!-- High-quality logo image -->
              <img 
                src="https://proense.com.co/images/text-logo.png"
                alt="${alt}"
                width="${width}"
                height="${calculatedHeight}"
                style="
                  display: block;
                  width: 100%;
                  max-width: ${width}px;
                  height: auto;
                  border: 0;
                  outline: none;
                  text-decoration: none;
                  -ms-interpolation-mode: bicubic;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  font-size: 16px;
                  line-height: 1.4;
                  color: #0066CC;
                "
                border="0"
              />
            </div>
            
            <!--[if mso]>
              </v:textbox>
            </v:rect>
            <![endif]-->
          </td>
        </tr>
      </table>
    `;

    return logoHtml;
  }

  /**
   * Generate logo with dark mode support
   */
  static getLogoWithDarkModeSupport(options: LogoOptions = {}): string {
    const {
      width = 200,
      height,
      alt = 'Proense Seguros',
      darkModeUrl = 'https://proense.com.co/images/text-logo-dark.png',
    } = options;

    const calculatedHeight = height || Math.round(width * 0.82);

    return `
      <style>
        @media (prefers-color-scheme: dark) {
          .logo-light { display: none !important; }
          .logo-dark { display: block !important; }
        }
        [data-ogsc] .logo-light { display: none !important; }
        [data-ogsc] .logo-dark { display: block !important; }
      </style>
      
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <!-- Light mode logo -->
            <div class="logo-light" style="display: block;">
              <img 
                src="https://proense.com.co/images/text-logo.png"
                alt="${alt}"
                width="${width}"
                height="${calculatedHeight}"
                style="
                  display: block;
                  width: 100%;
                  max-width: ${width}px;
                  height: auto;
                  border: 0;
                  outline: none;
                  text-decoration: none;
                  -ms-interpolation-mode: bicubic;
                "
                border="0"
              />
            </div>
            
            <!-- Dark mode logo (hidden by default) -->
            <div class="logo-dark" style="display: none;">
              <img 
                src="${darkModeUrl}"
                alt="${alt}"
                width="${width}"
                height="${calculatedHeight}"
                style="
                  display: block;
                  width: 100%;
                  max-width: ${width}px;
                  height: auto;
                  border: 0;
                  outline: none;
                  text-decoration: none;
                  -ms-interpolation-mode: bicubic;
                "
                border="0"
              />
            </div>
            
            <!-- Fallback for email clients that don't support images -->
            <!--[if !mso]><!-->
            <div style="mso-hide: all; display: none; max-height: 0; overflow: hidden;">
              <div style="
                display: inline-block;
                padding: 10px 20px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 24px;
                font-weight: bold;
                color: #0066CC;
                letter-spacing: 1px;
              ">
                ${fallbackText}
              </div>
            </div>
            <!--<![endif]-->
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Get inline SVG logo for maximum compatibility
   */
  static getInlineSvgLogo(options: LogoOptions = {}): string {
    const {
      width = 200,
      height,
    } = options;

    const calculatedHeight = height || Math.round(width * 0.82);

    // This is a simplified SVG representation - should be replaced with actual logo SVG
    const svgLogo = `
      <svg width="${width}" height="${calculatedHeight}" viewBox="0 0 200 164" xmlns="http://www.w3.org/2000/svg">
        <style>
          .logo-text { fill: #0066CC; font-family: 'Segoe UI', sans-serif; font-weight: bold; }
          .logo-accent { fill: #00A859; }
          @media (prefers-color-scheme: dark) {
            .logo-text { fill: #4A9EFF; }
            .logo-accent { fill: #00D870; }
          }
        </style>
        <text x="10" y="100" class="logo-text" font-size="32">PROENSE</text>
        <text x="10" y="130" class="logo-text" font-size="20">SEGUROS</text>
        <circle cx="180" cy="80" r="5" class="logo-accent"/>
      </svg>
    `;

    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            ${svgLogo}
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Get optimized logo for different email contexts
   */
  static getOptimizedLogo(context: 'header' | 'footer' | 'inline' = 'header'): string {
    const sizes = {
      header: { width: 200 },
      footer: { width: 150 },
      inline: { width: 120 }
    };

    return this.getResponsiveLogo(sizes[context]);
  }
}