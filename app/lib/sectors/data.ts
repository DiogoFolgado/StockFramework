export interface SectorStock {
  ticker: string;
  name: string;
}

export interface Sector {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  stocks: SectorStock[];
  backup: SectorStock[];
}

export interface RisingSector {
  id: string;
  name: string;
  icon: string;
  color: string;
  candidates: string[];
}

export const SECTORS: Sector[] = [
  {
    id: "ai", name: "Artificial Intelligence", desc: "AI platforms, foundation models, enterprise software",
    icon: "🤖", color: "#9b72cf",
    stocks: [
      { ticker: "NVDA", name: "NVIDIA" }, { ticker: "MSFT", name: "Microsoft" },
      { ticker: "GOOGL", name: "Alphabet" }, { ticker: "META", name: "Meta Platforms" },
      { ticker: "AMZN", name: "Amazon" }, { ticker: "ORCL", name: "Oracle" },
      { ticker: "IBM", name: "IBM" }, { ticker: "PLTR", name: "Palantir" },
      { ticker: "CRM", name: "Salesforce" }, { ticker: "SNOW", name: "Snowflake" },
    ],
    backup: [
      { ticker: "ADBE", name: "Adobe" }, { ticker: "NOW", name: "ServiceNow" },
      { ticker: "INTU", name: "Intuit" }, { ticker: "PANW", name: "Palo Alto Networks" },
    ],
  },
  {
    id: "semis", name: "Semiconductors", desc: "Chip design, fabrication equipment, memory",
    icon: "💾", color: "#4d9de0",
    stocks: [
      { ticker: "NVDA", name: "NVIDIA" }, { ticker: "AMD", name: "AMD" },
      { ticker: "INTC", name: "Intel" }, { ticker: "QCOM", name: "Qualcomm" },
      { ticker: "AVGO", name: "Broadcom" }, { ticker: "MU", name: "Micron Technology" },
      { ticker: "AMAT", name: "Applied Materials" }, { ticker: "LRCX", name: "Lam Research" },
      { ticker: "KLAC", name: "KLA Corporation" }, { ticker: "TXN", name: "Texas Instruments" },
    ],
    backup: [
      { ticker: "MCHP", name: "Microchip Technology" }, { ticker: "ON", name: "ON Semiconductor" },
      { ticker: "SWKS", name: "Skyworks Solutions" }, { ticker: "MPWR", name: "Monolithic Power" },
    ],
  },
  {
    id: "bigtech", name: "Big Tech", desc: "Mega-cap technology platforms and ecosystems",
    icon: "💻", color: "#45aaf2",
    stocks: [
      { ticker: "AAPL", name: "Apple" }, { ticker: "MSFT", name: "Microsoft" },
      { ticker: "GOOGL", name: "Alphabet" }, { ticker: "AMZN", name: "Amazon" },
      { ticker: "META", name: "Meta" }, { ticker: "NFLX", name: "Netflix" },
      { ticker: "ADBE", name: "Adobe" }, { ticker: "CRM", name: "Salesforce" },
      { ticker: "ORCL", name: "Oracle" }, { ticker: "NOW", name: "ServiceNow" },
    ],
    backup: [
      { ticker: "INTU", name: "Intuit" }, { ticker: "TEAM", name: "Atlassian" },
      { ticker: "ZM", name: "Zoom" }, { ticker: "DOCU", name: "DocuSign" },
    ],
  },
  {
    id: "health", name: "Healthcare & Biotech", desc: "Pharma, biotech, insurance, medical devices",
    icon: "💊", color: "#4cbb8a",
    stocks: [
      { ticker: "JNJ", name: "Johnson & Johnson" }, { ticker: "LLY", name: "Eli Lilly" },
      { ticker: "UNH", name: "UnitedHealth" }, { ticker: "ABBV", name: "AbbVie" },
      { ticker: "PFE", name: "Pfizer" }, { ticker: "MRK", name: "Merck" },
      { ticker: "AMGN", name: "Amgen" }, { ticker: "GILD", name: "Gilead Sciences" },
      { ticker: "BSX", name: "Boston Scientific" }, { ticker: "ISRG", name: "Intuitive Surgical" },
    ],
    backup: [
      { ticker: "TMO", name: "Thermo Fisher" }, { ticker: "DHR", name: "Danaher" },
      { ticker: "CVS", name: "CVS Health" }, { ticker: "HCA", name: "HCA Healthcare" },
    ],
  },
  {
    id: "energy", name: "Energy & Oil", desc: "Oil majors, refiners, pipelines, LNG",
    icon: "🛢️", color: "#e87d3e",
    stocks: [
      { ticker: "XOM", name: "ExxonMobil" }, { ticker: "CVX", name: "Chevron" },
      { ticker: "COP", name: "ConocoPhillips" }, { ticker: "SLB", name: "SLB" },
      { ticker: "OXY", name: "Occidental Petroleum" }, { ticker: "MPC", name: "Marathon Petroleum" },
      { ticker: "PSX", name: "Phillips 66" }, { ticker: "VLO", name: "Valero Energy" },
      { ticker: "KMI", name: "Kinder Morgan" }, { ticker: "WMB", name: "Williams Companies" },
    ],
    backup: [
      { ticker: "HAL", name: "Halliburton" }, { ticker: "EOG", name: "EOG Resources" },
      { ticker: "DVN", name: "Devon Energy" }, { ticker: "FANG", name: "Diamondback Energy" },
    ],
  },
  {
    id: "defense", name: "Defense & Aerospace", desc: "Military systems, weapons, government contracts",
    icon: "🛡️", color: "#e05555",
    stocks: [
      { ticker: "LMT", name: "Lockheed Martin" }, { ticker: "RTX", name: "RTX Corp" },
      { ticker: "NOC", name: "Northrop Grumman" }, { ticker: "GD", name: "General Dynamics" },
      { ticker: "LHX", name: "L3Harris" }, { ticker: "HII", name: "Huntington Ingalls" },
      { ticker: "LDOS", name: "Leidos" }, { ticker: "BAH", name: "Booz Allen Hamilton" },
      { ticker: "KTOS", name: "Kratos Defense" }, { ticker: "AXON", name: "Axon Enterprise" },
    ],
    backup: [
      { ticker: "MOOG", name: "Moog Inc." }, { ticker: "HEICO", name: "HEICO Corp" },
      { ticker: "TDG", name: "TransDigm" }, { ticker: "HWM", name: "Howmet Aerospace" },
    ],
  },
  {
    id: "finance", name: "Finance & Banking", desc: "Banks, asset managers, payments, fintech",
    icon: "🏦", color: "#d4a843",
    stocks: [
      { ticker: "JPM", name: "JPMorgan Chase" }, { ticker: "BAC", name: "Bank of America" },
      { ticker: "GS", name: "Goldman Sachs" }, { ticker: "MS", name: "Morgan Stanley" },
      { ticker: "WFC", name: "Wells Fargo" }, { ticker: "C", name: "Citigroup" },
      { ticker: "V", name: "Visa" }, { ticker: "MA", name: "Mastercard" },
      { ticker: "AXP", name: "American Express" }, { ticker: "BLK", name: "BlackRock" },
    ],
    backup: [
      { ticker: "COF", name: "Capital One" }, { ticker: "SCHW", name: "Charles Schwab" },
      { ticker: "USB", name: "U.S. Bancorp" }, { ticker: "TFC", name: "Truist Financial" },
    ],
  },
  {
    id: "ev", name: "EV & Auto", desc: "Electric vehicles, legacy auto, autonomous driving",
    icon: "⚡", color: "#26de81",
    stocks: [
      { ticker: "TSLA", name: "Tesla" }, { ticker: "GM", name: "General Motors" },
      { ticker: "F", name: "Ford" }, { ticker: "RIVN", name: "Rivian" },
      { ticker: "NIO", name: "NIO" }, { ticker: "LI", name: "Li Auto" },
      { ticker: "XPEV", name: "XPeng" }, { ticker: "TM", name: "Toyota" },
      { ticker: "HMC", name: "Honda" }, { ticker: "STLA", name: "Stellantis" },
    ],
    backup: [
      { ticker: "LEA", name: "Lear Corp" }, { ticker: "BWA", name: "BorgWarner" },
      { ticker: "APTV", name: "Aptiv" }, { ticker: "LCID", name: "Lucid Motors" },
    ],
  },
  {
    id: "cleanenergy", name: "Clean Energy", desc: "Solar, wind, renewables, utilities, storage",
    icon: "🌱", color: "#4cbb8a",
    stocks: [
      { ticker: "NEE", name: "NextEra Energy" }, { ticker: "ENPH", name: "Enphase Energy" },
      { ticker: "FSLR", name: "First Solar" }, { ticker: "BEP", name: "Brookfield Renewables" },
      { ticker: "SEDG", name: "SolarEdge" }, { ticker: "PLUG", name: "Plug Power" },
      { ticker: "RUN", name: "Sunrun" }, { ticker: "BE", name: "Bloom Energy" },
      { ticker: "AES", name: "AES Corporation" }, { ticker: "CEG", name: "Constellation Energy" },
    ],
    backup: [
      { ticker: "CWEN", name: "Clearway Energy" }, { ticker: "ORA", name: "Ormat Technologies" },
      { ticker: "ARRY", name: "Array Technologies" }, { ticker: "STEM", name: "Stem Inc." },
    ],
  },
  {
    id: "crypto", name: "Crypto & Digital Assets", desc: "Exchanges, miners, blockchain infrastructure",
    icon: "₿", color: "#f7b731",
    stocks: [
      { ticker: "COIN", name: "Coinbase" }, { ticker: "MSTR", name: "MicroStrategy" },
      { ticker: "MARA", name: "MARA Holdings" }, { ticker: "RIOT", name: "Riot Platforms" },
      { ticker: "CLSK", name: "CleanSpark" }, { ticker: "HUT", name: "Hut 8 Mining" },
      { ticker: "BITF", name: "Bitfarms" }, { ticker: "IREN", name: "Iris Energy" },
      { ticker: "BTBT", name: "Bit Digital" }, { ticker: "HOOD", name: "Robinhood" },
    ],
    backup: [
      { ticker: "CIFR", name: "Cipher Mining" }, { ticker: "WULF", name: "TeraWulf" },
      { ticker: "CORZ", name: "Core Scientific" }, { ticker: "SQ", name: "Block Inc." },
    ],
  },
  {
    id: "space", name: "Space & Satellites", desc: "Launch providers, satellites, space economy",
    icon: "🚀", color: "#45aaf2",
    stocks: [
      { ticker: "RKLB", name: "Rocket Lab" }, { ticker: "ASTS", name: "AST SpaceMobile" },
      { ticker: "GSAT", name: "Globalstar" }, { ticker: "VSAT", name: "Viasat" },
      { ticker: "IRDM", name: "Iridium Comms" }, { ticker: "PL", name: "Planet Labs" },
      { ticker: "LMT", name: "Lockheed Martin" }, { ticker: "NOC", name: "Northrop Grumman" },
      { ticker: "BA", name: "Boeing" }, { ticker: "RTX", name: "RTX Corp" },
    ],
    backup: [
      { ticker: "HWM", name: "Howmet Aerospace" }, { ticker: "TDG", name: "TransDigm" },
      { ticker: "SPCE", name: "Virgin Galactic" }, { ticker: "MNTS", name: "Momentus" },
    ],
  },
  {
    id: "consumer", name: "Consumer & Retail", desc: "E-commerce, brands, restaurants, retail chains",
    icon: "🛒", color: "#fd9644",
    stocks: [
      { ticker: "AMZN", name: "Amazon" }, { ticker: "WMT", name: "Walmart" },
      { ticker: "COST", name: "Costco" }, { ticker: "TGT", name: "Target" },
      { ticker: "HD", name: "Home Depot" }, { ticker: "LOW", name: "Lowe's" },
      { ticker: "NKE", name: "Nike" }, { ticker: "SBUX", name: "Starbucks" },
      { ticker: "MCD", name: "McDonald's" }, { ticker: "CMG", name: "Chipotle" },
    ],
    backup: [
      { ticker: "YUM", name: "Yum Brands" }, { ticker: "DPZ", name: "Domino's Pizza" },
      { ticker: "DRI", name: "Darden Restaurants" }, { ticker: "DKNG", name: "DraftKings" },
    ],
  },
  {
    id: "realestate", name: "Real Estate & REITs", desc: "Property, data centers, industrial, residential",
    icon: "🏠", color: "#a55eea",
    stocks: [
      { ticker: "PLD", name: "Prologis" }, { ticker: "AMT", name: "American Tower" },
      { ticker: "EQIX", name: "Equinix" }, { ticker: "WELL", name: "Welltower" },
      { ticker: "SPG", name: "Simon Property" }, { ticker: "O", name: "Realty Income" },
      { ticker: "DLR", name: "Digital Realty" }, { ticker: "PSA", name: "Public Storage" },
      { ticker: "VICI", name: "VICI Properties" }, { ticker: "CCI", name: "Crown Castle" },
    ],
    backup: [
      { ticker: "EQR", name: "Equity Residential" }, { ticker: "AVB", name: "AvalonBay" },
      { ticker: "INVH", name: "Invitation Homes" }, { ticker: "NLY", name: "Annaly Capital" },
    ],
  },
];

export const RISING_SECTORS: RisingSector[] = [
  {
    id: "ai", name: "Artificial Intelligence", icon: "🤖", color: "#9b72cf",
    candidates: [
      "BBAI","SOUN","RXRX","PATH","AI","GTLB","DDOG","MNDY","VEEV","HIMS",
      "AMBA","IONQ","QUBT","RGTI","TMDX","RBRK","ZS","CRWD","OKTA","UIPATH",
      "ASAN","WDAY","PEGA","EXLS","EPAM","SMCI","NTAP","PSTG","DELL","HPE",
      "CEVA","LPSN","ACMR","VERI","PRCT","SEMR","BRZE","APPN","PCTY","JAMF",
      "DOCU","SDGR","ABCL","BEAM","EDIT","NTLA","MDB","ESTC","DOMO","SPSC",
      "POWI","IRBT","HUBS","ZI","DOCN","TENB","FIVN","GKOS","IDCC","NTGR",
    ],
  },
  {
    id: "semis", name: "Semiconductors", icon: "💾", color: "#4d9de0",
    candidates: [
      "NVDA","AMD","INTC","MU","TXN","AVGO","QCOM","AMAT","LRCX","KLAC",
      "WOLF","CRUS","ACLS","FORM","RMBS","SITM","DIOD","AEIS","ICHR","COHU",
      "ONTO","POWI","LFUS","AOSL","CEVA","SGH","NXPI","SWKS","QRVO","MTSI",
      "LITE","COHR","MPWR","ALGM","AMKR","VICR","PLXS","SLAB","IDCC","MACOM",
      "ANSS","CDNS","SMCI","NTAP","PSTG","CALX","CIEN","MKSI","NOVT","UCTT",
      "BRKS","AMBA","IPGP","VIAV","TTMI","MCHP","ON","SIMO","AEHR","ACMR",
    ],
  },
  {
    id: "bigtech", name: "Big Tech", icon: "💻", color: "#45aaf2",
    candidates: [
      "RBLX","SNAP","PINS","TWLO","HUBS","ZI","DOCN","ESTC","MDB","TENB",
      "APPN","PCTY","JAMF","GTLB","BRZE","CLPS","EXLS","EPAM","DDOG","FSLY",
      "NET","CFLT","CALX","CIEN","INFN","VIAV","CRWD","ZS","OKTA","S","QLYS",
      "VRNS","EVTC","PRFT","SHOP","PAYC","BILL","LSPD","SPSC","DOMO","VEEV",
      "SEMR","TWLO","BAND","IRDM","GSAT","VSAT","NCNO","PEGA","WK","ASAN",
      "WDAY","RBLX","SNAP","BMBL","MTCH","ANGI","CARG","TDC","OPEN","HOUS",
    ],
  },
  {
    id: "health", name: "Healthcare & Biotech", icon: "💊", color: "#4cbb8a",
    candidates: [
      "BEAM","EDIT","NTLA","CRBU","VERV","FATE","TWST","RXRX","ABCL","IOVA",
      "ACAD","NUVB","ARWR","RARE","IONS","KRYS","ALNY","PCVX","XNCR","IMVT",
      "VKTX","HALO","RYTM","AKRO","ALDX","HIMS","TMDX","SDGR","PRGO","NVCR",
      "AXNX","PRCT","GKOS","NTRA","ACCD","PHR","TDOC","DOCS","OMCL","NXGN",
      "VEEV","EXAS","GDRX","HOLX","MMSI","QDEL","MEDP","ICLR","IQVIA","ICON",
      "CRL","PRTA","REGN","RCUS","KYMR","DNLI","IMCR","ROIV","APLS","SAGE",
    ],
  },
  {
    id: "energy", name: "Energy & Oil", icon: "🛢️", color: "#e87d3e",
    candidates: [
      "CIVI","SM","MTDR","VTLE","NOG","CPE","REI","GPOR","CHRD","HPK",
      "TALO","SBOW","ERF","MEG","CNQ","SU","DINO","PARR","MPLX","TRGP",
      "AM","HESM","RRC","CNX","EQT","AR","CTRA","CRK","TELL","GLNG",
      "NFE","CLNE","GEVO","GPRE","REX","VNOM","PHX","FLMN","ROCC","FANG",
      "ACDC","NINE","KLXE","NR","DNOW","PTEN","HP","ATH","CVE","BTE",
      "AMTX","NRGV","ARIS","MNRL","GRNT","EOG","DVN","HAL","OXY","SLB",
    ],
  },
  {
    id: "defense", name: "Defense & Aerospace", icon: "🛡️", color: "#e05555",
    candidates: [
      "RKLB","ASTS","PL","SPIR","MNTS","BKSY","ASTR","RDW","SATX","IRDM",
      "JOBY","ACHR","BLADE","SKYW","MESA","AVAV","KTOS","DRS","BBAI","TDG",
      "CRWD","ZS","S","OKTA","VRNS","QLYS","TENB","CYBR","LDOS","BAH",
      "SAIC","CACI","MANT","TELOS","MAXR","GSAT","VSAT","LMT","RTX","NOC",
      "GD","LHX","HII","AXON","HEICO","HWM","CAE","FLIR","COGNEX","CEVA",
      "AMOT","DLB","MOBL","GNSS","TTMI","PLXS","WIRE","PRFT","EVTC","RDWR",
    ],
  },
  {
    id: "finance", name: "Finance & Banking", icon: "🏦", color: "#d4a843",
    candidates: [
      "SOFI","AFRM","UPST","LC","DAVE","NRDS","TREE","PRAA","WAL","BOKF",
      "IBOC","CVBF","HTLF","CATY","FFIN","SBCF","TRMK","SFNC","HOOD","REPAY",
      "FLYW","EVTC","PAYO","BILL","PAYC","FOUR","HGTY","ROOT","LMND","HIPPO",
      "CNNE","ENV","FDS","VRTS","AMG","WDR","IVZ","WETF","COIN","MSTR",
      "MARA","RIOT","CLSK","HUT","BITF","IREN","BTBT","CACC","WRLD","FCFS",
      "EFC","GPMT","BXMT","STWD","LADR","MKTX","VIRT","IBKR","LPLA","EVR",
    ],
  },
  {
    id: "ev", name: "EV & Auto", icon: "⚡", color: "#26de81",
    candidates: [
      "GOEV","AYRO","WKHS","NKLA","FSR","BLNK","EVGO","CHPT","VLTA","AMPX",
      "MVST","BEEM","AMPE","SHPW","LAZR","INVZ","OUST","AEVA","MVIS","LIDR",
      "QS","ENVX","SLDP","FREYR","CBAT","LEA","BWA","APTV","MODV","GNSS",
      "NIU","HYLN","LCID","NIO","LI","XPEV","RIVN","FFIE","ADN","SL",
      "ALB","SQM","LAC","PLL","LTHM","ALTM","MP","STLA","GM","F",
      "DRIV","WAVE","OPTT","AMPE","EVTC","KORE","TSLA","BLNK","EVGO","CHPT",
    ],
  },
  {
    id: "cleanenergy", name: "Clean Energy", icon: "🌱", color: "#4cbb8a",
    candidates: [
      "NOVA","SHLS","ARRY","SPWR","MAXN","CSIQ","DQ","JKS","STEM","FLUX",
      "PLUG","BE","HASI","GPRE","GEVO","AMRC","CLNE","NRGV","OPTT","CWEN",
      "MKFG","BWEN","AMSC","CEG","NRG","VST","SMR","BWX","OKLO","NNE",
      "BWXT","UEC","CCJ","FSLR","ENPH","SEDG","RUN","NEE","AES","BEP",
      "AY","TERP","CWCO","MSEX","YORW","ARTNA","SJW","GWRS","WTRG","AWK",
      "ORA","WAVE","AMPE","SHPW","STEM","FLUX","AMPS","AMPX","ENVX","QS",
    ],
  },
  {
    id: "crypto", name: "Crypto & Digital Assets", icon: "₿", color: "#f7b731",
    candidates: [
      "CIFR","WULF","IREN","BTBT","HUT","CLSK","MARA","RIOT","BITF","CORZ",
      "SDIG","GRIID","HIVE","MGTI","BTCS","BENF","ARBK","GREE","COIN","HOOD",
      "MSTR","PYPL","SQ","RBLX","MANA","SAND","AXS","ENJ","THETA","IMX",
      "HIVE","MGTI","DMGI","BTCS","BENF","ARBK","CBIT","GREE","SDIG","GRIID",
      "COIN","HOOD","MSTR","MARA","RIOT","CLSK","HUT","BITF","IREN","BTBT",
      "CIFR","WULF","CORZ","SQ","PYPL","NVEI","FLYW","REPAY","EVTC","FOUR",
    ],
  },
  {
    id: "space", name: "Space & Satellites", icon: "🚀", color: "#45aaf2",
    candidates: [
      "RKLB","ASTR","MNTS","RDW","SPCE","ASTS","GSAT","VSAT","IRDM","PL",
      "BKSY","SPIR","SATX","MAXR","VRSK","GHM","LMT","RTX","NOC","GD",
      "LHX","HII","LDOS","BAH","KTOS","AXON","HEICO","TDG","AVAV","DRS",
      "BBAI","MOOG","HWM","CAE","SAIC","MANT","TELOS","GNSS","TTMI","PLXS",
      "WIRE","MOBL","FLIR","COGNEX","CEVA","AMOT","DLB","VECT","CRWD","ZS",
      "ASTS","GSAT","VSAT","IRDM","PL","SPIR","SATX","RKLB","ASTR","MNTS",
    ],
  },
  {
    id: "consumer", name: "Consumer & Retail", icon: "🛒", color: "#fd9644",
    candidates: [
      "PRPL","BARK","XPOF","ELF","OLPX","SKIN","HIMS","FIGS","ONON","BIRK",
      "CAVA","BROS","WING","DNUT","TXRH","JACK","CAKE","PLAY","EAT","FAT",
      "FIVE","OLLI","BIG","CONN","PRTY","TLYS","BOOT","HIBB","DKNG","PENN",
      "ELF","OLPX","SKIN","HIMS","KVYO","PDCO","ULTA","SBH","CURV","PRPL",
      "LOVE","LESL","SHAK","HABT","MGM","GENI","EVERI","CNTY","AGS","RBLX",
      "TTWO","EA","ZNGA","GLUU","PENN","GENI","EVERI","AGS","ACMR","BARK",
    ],
  },
  {
    id: "realestate", name: "Real Estate & REITs", icon: "🏠", color: "#a55eea",
    candidates: [
      "OPEN","RDFN","EXPI","HOUS","DBRG","SAFE","IIPR","GMRE","GOOD","LAND",
      "PINE","SACH","RC","TWO","MFA","RITM","EARN","RWT","TPVG","STAG",
      "EGP","FR","REXR","COLD","CUBE","EXR","LSI","NSA","EQR","AVB",
      "INVH","AMH","NLY","ROIC","KITE","CBL","MAC","SKT","RPT","UE",
      "BRX","KIM","PMT","MITT","EQIX","DLR","AMT","CCI","SBAC","UNIT",
      "CORR","CLNC","GPMT","BXMT","O","NNN","EPRT","NTST","ADC","GTY",
    ],
  },
];
