/**
 * Safely parses a fetch response, handling non-JSON responses gracefully.
 * Returns a structured result instead of throwing on HTML error pages
 * (e.g., Vercel 413, 504 responses).
 */
export interface SafeResponseResult {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
  errorMessage: string | null;
}

export async function safeParseResponse(response: Response): Promise<SafeResponseResult> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const data = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data,
        errorMessage: response.ok ? null : (data?.message || null),
      };
    } catch {
      // JSON parsing failed despite content-type header
      return {
        ok: false,
        status: response.status,
        data: null,
        errorMessage: getErrorMessageForStatus(response.status),
      };
    }
  }

  // Non-JSON response (HTML error pages from Vercel infrastructure)
  return {
    ok: false,
    status: response.status,
    data: null,
    errorMessage: getErrorMessageForStatus(response.status),
  };
}

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 413:
      return 'Los archivos adjuntos son demasiado grandes. Por favor, reduce el tamaño o la cantidad de archivos.';
    case 429:
      return 'Demasiados intentos. Por favor, espera un momento antes de intentar de nuevo.';
    case 502:
    case 503:
      return 'El servidor no está disponible temporalmente. Por favor, intenta de nuevo en unos minutos.';
    case 504:
      return 'La solicitud tardó demasiado. Por favor, intenta de nuevo con archivos más pequeños.';
    default:
      if (status >= 500) {
        return 'Error del servidor. Por favor, intenta de nuevo más tarde.';
      }
      return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
  }
}
