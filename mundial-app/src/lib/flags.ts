/** Mapeo de código FIFA 3 letras → ISO 3166-1 alpha-2 para flagcdn.com */
const ISO2: Record<string, string> = {
  ARG: 'ar', BRA: 'br', FRA: 'fr', GER: 'de', ESP: 'es',
  ENG: 'gb-eng', POR: 'pt', NED: 'nl', ITA: 'it', BEL: 'be',
  CRO: 'hr', MEX: 'mx', USA: 'us', CAN: 'ca', CHI: 'cl',
  COL: 'co', ECU: 'ec', PER: 'pe', URU: 'uy', PAR: 'py',
  VEN: 've', BOL: 'bo', MAR: 'ma', SEN: 'sn', NGA: 'ng',
  CMR: 'cm', GHA: 'gh', TUN: 'tn', EGY: 'eg', JPN: 'jp',
  KOR: 'kr', AUS: 'au', IRN: 'ir', SAU: 'sa', QAT: 'qa',
  SUI: 'ch', DEN: 'dk', SWE: 'se', POL: 'pl', SRB: 'rs',
  UKR: 'ua', CZE: 'cz', HUN: 'hu', TUR: 'tr', GRE: 'gr',
  RUS: 'ru', AUT: 'at', NOR: 'no', SCO: 'gb-sct', ALB: 'al',
  SVK: 'sk', SVN: 'si', ISL: 'is', FIN: 'fi', ROM: 'ro',
  WAL: 'gb-wls', IRL: 'ie', NZL: 'nz', MLI: 'ml', CIV: 'ci',
  KSA: 'sa', PAK: 'pk', CHN: 'cn', IND: 'in', IRQ: 'iq',
  LIB: 'lb', SYR: 'sy', JOR: 'jo', KWT: 'kw', UAE: 'ae',
  RSA: 'za', ZIM: 'zw', ANG: 'ao', MOZ: 'mz', TAN: 'tz',
  HON: 'hn', GTM: 'gt', CRC: 'cr', PAN: 'pa', SLV: 'sv',
  JAM: 'jm', TTO: 'tt', CUB: 'cu', DOM: 'do', HAI: 'ht',
}

/**
 * Devuelve la URL de la bandera en flagcdn.com.
 * @param code  Código FIFA de 3 letras (ej. "ARG")
 * @param width Ancho de imagen: 40, 80 o 160 px (default 80)
 */
export function flagUrl(code: string, width: 40 | 80 | 160 = 80): string {
  const iso = ISO2[code?.toUpperCase()]
  if (!iso) return ''
  return `https://flagcdn.com/w${width}/${iso}.png`
}

/** Fallback emoji (por si no hay mapeo en ISO2) */
export function flagEmoji(code: string): string {
  const flags: Record<string, string> = {
    ARG: '🇦🇷', BRA: '🇧🇷', FRA: '🇫🇷', GER: '🇩🇪', ESP: '🇪🇸',
    ENG: '🇬🇧', POR: '🇵🇹', NED: '🇳🇱', ITA: '🇮🇹', BEL: '🇧🇪',
    CRO: '🇭🇷', MEX: '🇲🇽', USA: '🇺🇸', CAN: '🇨🇦', CHI: '🇨🇱',
    COL: '🇨🇴', ECU: '🇪🇨', PER: '🇵🇪', URU: '🇺🇾', PAR: '🇵🇾',
    VEN: '🇻🇪', BOL: '🇧🇴', MAR: '🇲🇦', SEN: '🇸🇳', NGA: '🇳🇬',
    CMR: '🇨🇲', GHA: '🇬🇭', TUN: '🇹🇳', EGY: '🇪🇬', JPN: '🇯🇵',
    KOR: '🇰🇷', AUS: '🇦🇺', IRN: '🇮🇷', SAU: '🇸🇦', QAT: '🇶🇦',
    SUI: '🇨🇭', DEN: '🇩🇰', SWE: '🇸🇪', POL: '🇵🇱', SRB: '🇷🇸',
    UKR: '🇺🇦', CZE: '🇨🇿', HUN: '🇭🇺', TUR: '🇹🇷', GRE: '🇬🇷',
    RUS: '🇷🇺', AUT: '🇦🇹', NOR: '🇳🇴', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  }
  return flags[code] ?? '🏳️'
}
