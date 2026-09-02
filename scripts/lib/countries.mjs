/**
 * Three-letter country code → ISO 3166-1 alpha-2, which is what the event schema
 * stores and what the flag and country-name lookups expect.
 *
 * Two families are covered. ISO 3166-1 alpha-3 is the obvious one. Athletics
 * bodies, DUV included, mostly publish IOC codes instead, and the two disagree
 * for a couple of dozen countries — GER/DEU, SUI/CHE, NED/NLD. Both spellings map
 * to the same alpha-2 here, because guessing wrong silently files a German race
 * under Georgia.
 */

const ISO_ALPHA3 = `
AFG AF, ALA AX, ALB AL, DZA DZ, ASM AS, AND AD, AGO AO, AIA AI, ATA AQ, ATG AG, ARG AR, ARM AM,
ABW AW, AUS AU, AUT AT, AZE AZ, BHS BS, BHR BH, BGD BD, BRB BB, BLR BY, BEL BE, BLZ BZ, BEN BJ,
BMU BM, BTN BT, BOL BO, BES BQ, BIH BA, BWA BW, BVT BV, BRA BR, IOT IO, BRN BN, BGR BG, BFA BF,
BDI BI, CPV CV, KHM KH, CMR CM, CAN CA, CYM KY, CAF CF, TCD TD, CHL CL, CHN CN, CXR CX, CCK CC,
COL CO, COM KM, COG CG, COD CD, COK CK, CRI CR, CIV CI, HRV HR, CUB CU, CUW CW, CYP CY, CZE CZ,
DNK DK, DJI DJ, DMA DM, DOM DO, ECU EC, EGY EG, SLV SV, GNQ GQ, ERI ER, EST EE, SWZ SZ, ETH ET,
FLK FK, FRO FO, FJI FJ, FIN FI, FRA FR, GUF GF, PYF PF, ATF TF, GAB GA, GMB GM, GEO GE, DEU DE,
GHA GH, GIB GI, GRC GR, GRL GL, GRD GD, GLP GP, GUM GU, GTM GT, GGY GG, GIN GN, GNB GW, GUY GY,
HTI HT, HMD HM, VAT VA, HND HN, HKG HK, HUN HU, ISL IS, IND IN, IDN ID, IRN IR, IRQ IQ, IRL IE,
IMN IM, ISR IL, ITA IT, JAM JM, JPN JP, JEY JE, JOR JO, KAZ KZ, KEN KE, KIR KI, PRK KP, KOR KR,
KWT KW, KGZ KG, LAO LA, LVA LV, LBN LB, LSO LS, LBR LR, LBY LY, LIE LI, LTU LT, LUX LU, MAC MO,
MDG MG, MWI MW, MYS MY, MDV MV, MLI ML, MLT MT, MHL MH, MTQ MQ, MRT MR, MUS MU, MYT YT, MEX MX,
FSM FM, MDA MD, MCO MC, MNG MN, MNE ME, MSR MS, MAR MA, MOZ MZ, MMR MM, NAM NA, NRU NR, NPL NP,
NLD NL, NCL NC, NZL NZ, NIC NI, NER NE, NGA NG, NIU NU, NFK NF, MKD MK, MNP MP, NOR NO, OMN OM,
PAK PK, PLW PW, PSE PS, PAN PA, PNG PG, PRY PY, PER PE, PHL PH, PCN PN, POL PL, PRT PT, PRI PR,
QAT QA, REU RE, ROU RO, RUS RU, RWA RW, BLM BL, SHN SH, KNA KN, LCA LC, MAF MF, SPM PM, VCT VC,
WSM WS, SMR SM, STP ST, SAU SA, SEN SN, SRB RS, SYC SC, SLE SL, SGP SG, SXM SX, SVK SK, SVN SI,
SLB SB, SOM SO, ZAF ZA, SGS GS, SSD SS, ESP ES, LKA LK, SDN SD, SUR SR, SJM SJ, SWE SE, CHE CH,
SYR SY, TWN TW, TJK TJ, TZA TZ, THA TH, TLS TL, TGO TG, TKL TK, TON TO, TTO TT, TUN TN, TUR TR,
TKM TM, TCA TC, TUV TV, UGA UG, UKR UA, ARE AE, GBR GB, USA US, UMI UM, URY UY, UZB UZ, VUT VU,
VEN VE, VNM VN, VGB VG, VIR VI, WLF WF, ESH EH, YEM YE, ZMB ZM, ZWE ZW
`;

/** IOC codes that differ from ISO alpha-3. */
const IOC_ALIASES = `
ALG DZ, ANG AO, ANT AG, ARU AW, BAH BS, BAN BD, BAR BB, BER BM, BHU BT, BIZ BZ, BOT BW, BRU BN,
BUL BG, BUR BF, CAM KH, CAY KY, CGO CG, CHA TD, CHI CL, CRC CR, CRO HR, DEN DK, ESA SV, FIJ FJ,
GAM GM, GBS GW, GEQ GQ, GER DE, GRE GR, GUA GT, GUI GN, HAI HT, HON HN, INA ID, IRI IR, ISV VI,
IVB VG, KSA SA, KUW KW, LAT LV, LES LS, LIB LB, MAD MG, MAS MY, MAW MW, MGL MN, MON MC, MRI MU,
MTN MR, MYA MM, NCA NI, NED NL, NEP NP, NGR NG, NIG NE, OMA OM, PAR PY, PHI PH, PLE PS, POR PT,
PUR PR, RSA ZA, SAM WS, SEY SC, SIN SG, SKN KN, SLO SI, SOL SB, SRI LK, SUD SD, SUI CH, TAN TZ,
TOG TG, TPE TW, UAE AE, URU UY, VAN VU, VIE VN, ZAM ZM, ZIM ZW
`;

function parse(table) {
  const map = new Map();
  for (const pair of table.split(',')) {
    const [three, two] = pair.trim().split(/\s+/);
    if (three && two) map.set(three.toUpperCase(), two.toUpperCase());
  }
  return map;
}

const ISO = parse(ISO_ALPHA3);
const IOC = parse(IOC_ALIASES);

/** Returns the alpha-2 code, or null when the code is unrecognised. */
export function alpha2(code) {
  const key = String(code ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(key)) return key;
  return ISO.get(key) ?? IOC.get(key) ?? null;
}

/** English country name for an alpha-2 code, for geocoder queries and display. */
export function englishName(alpha2Code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(alpha2Code) ?? alpha2Code;
  } catch {
    return alpha2Code;
  }
}
