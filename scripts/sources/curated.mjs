/**
 * Hand-curated set of globally interesting races, plus the Polish calendar that no
 * API covers: every Polish running platform probed in September 2026 serves HTML
 * only, so the domestic 5k, 10k and half marathon field has to be entered by hand.
 * Those entries carry estimated dates and town-level pins, both labelled in the UI,
 * and no entry fees at all — an invented price would be worse than a missing one.
 * Kept as a collector source so the
 * same normalisation, validation and merge rules apply to it as to the API sources.
 * Fees marked `indicative: true` are ballpark figures — always verify with the organiser.
 */

export const id = 'curated';

const EVENTS = [
  {
    slug: 'berlin-marathon',
    name: 'BMW BERLIN-MARATHON',
    date: '2026-09-27',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'fast-course', 'europe'],
    featured: true,
    location: { city: 'Berlin', country: 'Germany', countryCode: 'DE' },
    start: { lat: 52.514444, lon: 13.350278, name: 'Straße des 17. Juni, Tiergarten' },
    fees: [{ amount: 205, currency: 'EUR', indicative: false, label: { en: 'Standard entry (incl. 4-day transport ticket)', pl: 'Pakiet standardowy (z 4-dniowym biletem komunikacji)' } }],
    website: 'https://www.bmw-berlin-marathon.com/en/',
    registrationUrl: 'https://www.bmw-berlin-marathon.com/en/registration/registration-information',
    links: [{ url: 'https://en.wikipedia.org/wiki/Berlin_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'The flattest and fastest of the Marathon Majors — where most marathon world records fall.',
        description: 'Berlin is the world record course: the pancake-flat loop through Tiergarten, Potsdamer Platz and the Brandenburg Gate has produced more marathon world records than any other race. Entry is by lottery (drawn the previous autumn), with charity and tour-operator places as the alternative routes in. Around 55,000 runners start on Straße des 17. Juni and finish under the Brandenburg Gate.',
      },
      pl: {
        summary: 'Najbardziej płaski i najszybszy z Majorsów — tu padają rekordy świata w maratonie.',
        description: 'Berlin to trasa rekordów świata: płaska pętla przez Tiergarten, Potsdamer Platz i Bramę Brandenburską dała więcej rekordów świata w maratonie niż jakikolwiek inny bieg. Wejście odbywa się przez losowanie (rozstrzygane jesienią roku poprzedniego), a alternatywą są pakiety charytatywne i biura podróży. Około 55 000 biegaczy startuje na Straße des 17. Juni, a meta znajduje się pod Bramą Brandenburską.',
      },
    },
  },
  {
    slug: 'chicago-marathon',
    name: 'Bank of America Chicago Marathon',
    date: '2026-10-11',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'fast-course', 'north-america'],
    featured: true,
    location: { city: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'US' },
    start: { lat: 41.874722, lon: -87.620833, name: 'Grant Park' },
    fees: [{ amount: 260, currency: 'USD', indicative: true, label: { en: 'US resident entry', pl: 'Opłata dla mieszkańców USA' } },
           { amount: 295, currency: 'USD', indicative: true, label: { en: 'International entry', pl: 'Opłata międzynarodowa' } }],
    website: 'https://www.chicagomarathon.com/',
    registrationUrl: 'https://www.chicagomarathon.com/runners/frequently-asked-application-questions/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Chicago_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'A flat loop through 29 neighbourhoods with famously loud crowds — over 200,000 people applied for 2026.',
        description: 'Chicago runs a single flat loop out of Grant Park and back, threading 29 city neighbourhoods with near-continuous spectator support. It is the classic first Major for a personal best: the course is fast, the October weather is usually cool, and the finish returns to the lakefront park where the day began. Entry is by lottery, time qualification, charity or tour package.',
      },
      pl: {
        summary: 'Płaska pętla przez 29 dzielnic i legendarny doping — na 2026 rok wpłynęło ponad 200 000 zgłoszeń.',
        description: 'Chicago to jedna płaska pętla z Grant Park i z powrotem, przecinająca 29 dzielnic miasta z niemal nieprzerwanym dopingiem. To klasyczny pierwszy Major na życiówkę: trasa jest szybka, październikowa pogoda zwykle chłodna, a meta wraca do parku nad jeziorem, gdzie zaczyna się bieg. Wejście przez losowanie, minimum czasowe, cele charytatywne lub pakiet turystyczny.',
      },
    },
  },
  {
    slug: 'new-york-city-marathon',
    name: 'TCS New York City Marathon',
    date: '2026-11-01',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'iconic', 'north-america'],
    featured: true,
    location: { city: 'New York City', region: 'New York', country: 'United States', countryCode: 'US' },
    start: { lat: 40.605833, lon: -74.056944, name: 'Fort Wadsworth, Staten Island' },
    fees: [{ amount: 333.11, currency: 'USD', indicative: false, label: { en: 'Non-member entry', pl: 'Opłata bez członkostwa NYRR' } },
           { amount: 269.66, currency: 'USD', indicative: false, label: { en: 'NYRR member entry', pl: 'Opłata dla członków NYRR' } }],
    website: 'https://www.nyrr.org/tcsnycmarathon',
    links: [{ url: 'https://en.wikipedia.org/wiki/New_York_City_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'The biggest marathon on earth: five boroughs, five bridges, two million spectators.',
        description: 'New York starts on the Verrazzano-Narrows Bridge above the harbour and crosses all five boroughs before finishing in Central Park. It is the largest marathon in the world by finishers and the loudest — First Avenue after the Queensboro Bridge is a wall of sound. The course is honest rather than fast: the bridges roll, and the final miles climb through Central Park.',
      },
      pl: {
        summary: 'Największy maraton świata: pięć dzielnic, pięć mostów, dwa miliony kibiców.',
        description: 'Nowy Jork startuje na moście Verrazzano-Narrows nad zatoką i przecina wszystkie pięć dzielnic, by zakończyć bieg w Central Parku. To największy maraton świata pod względem liczby biegaczy na mecie i jednocześnie najgłośniejszy — First Avenue za mostem Queensboro to ściana dźwięku. Trasa jest wymagająca, nie szybka: mosty falują, a ostatnie kilometry pną się przez Central Park.',
      },
    },
  },
  {
    slug: 'valencia-marathon',
    name: 'Maratón Valencia Trinidad Alfonso',
    date: '2026-12-06',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['road', 'fast-course', 'europe', 'pb-hunting'],
    featured: true,
    location: { city: 'Valencia', country: 'Spain', countryCode: 'ES' },
    start: { lat: 39.4545, lon: -0.351, name: 'Ciudad de las Artes y las Ciencias' },
    fees: [{ amount: 115, currency: 'EUR', indicative: true, label: { en: 'Standard entry', pl: 'Opłata standardowa' } }],
    website: 'https://www.valenciaciudaddelrunning.com/en/marathon/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Valencia_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'Europe’s fastest non-Major: flat, cool December weather and a finish on a bridge over water.',
        description: 'Valencia has become the personal-best factory of European marathoning — flat, sheltered, run in ideal December temperatures, with pacing groups for every target time. The finish is unique: a blue carpet laid across a footbridge over the lake at the City of Arts and Sciences. Places sell out months ahead, so plan the entry well before autumn.',
      },
      pl: {
        summary: 'Najszybszy europejski maraton spoza Majorsów: płasko, chłodny grudzień i meta na moście nad wodą.',
        description: 'Walencja stała się fabryką życiówek europejskiego maratonu — płasko, osłonięcie od wiatru, idealne grudniowe temperatury i pacemakerzy na każdy czas docelowy. Meta jest wyjątkowa: niebieski dywan rozłożony na kładce nad taflą wody w Mieście Sztuki i Nauki. Pakiety wyprzedają się na miesiące przed biegiem, więc zapisy warto zaplanować jeszcze przed jesienią.',
      },
    },
  },
  {
    slug: 'antarctic-ice-marathon',
    name: 'Antarctic Ice Marathon',
    date: '2026-12-13',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km', '21.1 km'],
    tags: ['extreme', 'bucket-list', 'antarctica', 'cold'],
    featured: true,
    location: { city: 'Union Glacier', country: 'Antarctica', countryCode: 'AQ' },
    start: { lat: -79.766667, lon: -83.266667, name: 'Union Glacier Camp' },
    fees: [{ amount: 24500, currency: 'EUR', indicative: true, label: { en: 'Entry incl. flights from Punta Arenas and camp logistics', pl: 'Pakiet z lotami z Punta Arenas i logistyką obozu' } }],
    website: 'https://www.icemarathon.com/',
    links: [{ url: 'https://icemarathon.com/schedule-and-prices', label: { en: 'Schedule and prices', pl: 'Terminarz i ceny' } }],
    content: {
      en: {
        summary: 'The southernmost marathon on the planet, run at 80° South on snow and ice.',
        description: 'Held at Union Glacier, a few hundred kilometres from the South Pole, this is the only marathon run on the Antarctic mainland interior. Runners fly in from Punta Arenas on a chartered aircraft, sleep in a polar camp and race in temperatures around −20 °C with katabatic wind. The field is capped at around 60 people and the price reflects the flights and camp logistics, not the race itself.',
      },
      pl: {
        summary: 'Najbardziej wysunięty na południe maraton świata, biegany na 80° szerokości południowej po śniegu i lodzie.',
        description: 'Bieg odbywa się na lodowcu Union, kilkaset kilometrów od bieguna południowego, i jest jedynym maratonem rozgrywanym w głębi kontynentu antarktycznego. Zawodnicy lecą czarterem z Punta Arenas, śpią w obozie polarnym i ścigają się w temperaturze około −20 °C przy wietrze katabatycznym. Limit to około 60 osób, a cena wynika z lotów i logistyki obozu, nie z samych zawodów.',
      },
    },
  },
  {
    slug: 'tokyo-marathon',
    name: 'Tokyo Marathon',
    date: '2027-03-07',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'asia', 'iconic'],
    featured: true,
    location: { city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    start: { lat: 35.689444, lon: 139.691667, name: 'Tokyo Metropolitan Government Building, Shinjuku' },
    fees: [{ amount: 16500, currency: 'JPY', indicative: true, label: { en: 'Domestic entry', pl: 'Opłata krajowa' } },
           { amount: 25000, currency: 'JPY', indicative: true, label: { en: 'Overseas entry', pl: 'Opłata zagraniczna' } }],
    website: 'https://www.marathon.tokyo/en/',
    registrationUrl: 'https://www.marathon.tokyo/en/participants/',
    links: [{ url: 'https://www.marathon.tokyo/en/participants/guideline/', label: { en: 'Entry information', pl: 'Informacje o zapisach' } }],
    content: {
      en: {
        summary: 'The most orderly Major: immaculate organisation, deep crowds and a flat, fast city course.',
        description: 'Tokyo runs from the Metropolitan Government Building in Shinjuku past Asakusa’s Kaminarimon gate and the Imperial Palace to a finish near Tokyo Station. Runners consistently rate it the best-organised marathon in the world — aid stations, toilets and crowd control are all handled with a precision no other Major matches. Entry is dominated by a heavily oversubscribed lottery held the previous summer.',
      },
      pl: {
        summary: 'Najbardziej poukładany Major: wzorowa organizacja, gęsty doping i płaska, szybka trasa przez miasto.',
        description: 'Tokio startuje przy Budynku Rządu Metropolitalnego w Shinjuku i prowadzi obok bramy Kaminarimon w Asakusie oraz Pałacu Cesarskiego do mety w okolicy Dworca Tokijskiego. Biegacze regularnie oceniają go jako najlepiej zorganizowany maraton świata — punkty odżywcze, toalety i obsługa tłumu działają z precyzją, której nie dorównuje żaden inny Major. Wejście odbywa się głównie przez wielokrotnie przewyższone losowanie latem roku poprzedniego.',
      },
    },
  },
  {
    slug: 'boston-marathon',
    name: 'Boston Marathon',
    date: '2027-04-19',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'qualifier-only', 'north-america', 'historic'],
    featured: true,
    location: { city: 'Hopkinton to Boston', region: 'Massachusetts', country: 'United States', countryCode: 'US' },
    start: { lat: 42.228611, lon: -71.522778, name: 'Main Street, Hopkinton' },
    fees: [{ amount: 250, currency: 'USD', indicative: true, label: { en: 'US entry', pl: 'Opłata dla biegaczy z USA' } },
           { amount: 285, currency: 'USD', indicative: true, label: { en: 'International entry', pl: 'Opłata międzynarodowa' } }],
    website: 'https://www.baa.org/races/boston-marathon/',
    registrationUrl: 'https://www.baa.org/races/boston-marathon/qualify/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Boston_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'The oldest annual marathon in the world — and the one you have to earn with a qualifying time.',
        description: 'Run every Patriots’ Day since 1897, Boston is a point-to-point course from rural Hopkinton to Boylston Street in the city. The profile is deceptive: a fast downhill opening that wrecks quads, then the Newton hills and Heartbreak Hill after 30 km. Almost all entries require a qualifying time, and in recent years the standard alone has not been enough — a cushion under the qualifier is needed. The date shown is the expected Patriots’ Day; confirm with the B.A.A.',
      },
      pl: {
        summary: 'Najstarszy cyklicznie rozgrywany maraton świata — i jedyny Major, na który trzeba wybiegać minimum.',
        description: 'Rozgrywany w każdy Dzień Patriotów od 1897 roku Boston to trasa z punktu do punktu: z wiejskiego Hopkinton na Boylston Street w centrum miasta. Profil jest zdradliwy: szybki zbieg na starcie niszczy uda, a po 30. kilometrze czekają wzniesienia Newton i Heartbreak Hill. Niemal wszystkie miejsca wymagają minimum czasowego, a w ostatnich latach samo minimum nie wystarczało — potrzebny jest zapas. Podana data to spodziewany Dzień Patriotów; potwierdź ją u organizatora B.A.A.',
      },
    },
  },
  {
    slug: 'london-marathon',
    name: 'TCS London Marathon',
    date: '2027-04-24',
    endDate: '2027-04-25',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['world-marathon-major', 'road', 'europe', 'charity'],
    featured: true,
    location: { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    start: { lat: 51.4695, lon: 0.0088, name: 'Blackheath, Greenwich' },
    fees: [{ amount: 79.99, currency: 'GBP', indicative: true, label: { en: 'UK ballot entry', pl: 'Opłata z losowania (UK)' } },
           { amount: 185, currency: 'GBP', indicative: true, label: { en: 'International ballot entry', pl: 'Opłata z losowania (międzynarodowa)' } }],
    website: 'https://www.londonmarathonevents.co.uk/london-marathon',
    links: [{ url: 'https://en.wikipedia.org/wiki/London_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'The world’s greatest fundraising race — and in 2027 it runs across two days for the first time.',
        description: 'London goes from Blackheath through Greenwich, over Tower Bridge and along the Embankment to a finish on The Mall. It raises more money for charity than any other single-day sporting event on earth, and the costume-and-crowd atmosphere is unmatched. The 2027 edition is a one-off two-day format across Saturday 24 and Sunday 25 April, taking the field to roughly 100,000 runners.',
      },
      pl: {
        summary: 'Największy charytatywny bieg świata — a w 2027 roku po raz pierwszy rozegrany przez dwa dni.',
        description: 'Londyn prowadzi z Blackheath przez Greenwich, przez Tower Bridge i wzdłuż Embankment do mety na The Mall. Zbiera na cele charytatywne więcej niż jakiekolwiek inne jednodniowe wydarzenie sportowe na świecie, a atmosfera przebrań i dopingu nie ma sobie równych. Edycja 2027 to jednorazowy format dwudniowy w sobotę 24 i niedzielę 25 kwietnia, co podnosi limit do około 100 000 biegaczy.',
      },
    },
  },
  {
    slug: 'comrades-marathon',
    name: 'Comrades Marathon',
    date: '2027-06-13',
    dateStatus: 'confirmed',
    type: 'ultra',
    distances: ['~89 km'],
    tags: ['ultra', 'road', 'africa', 'historic', 'bucket-list'],
    featured: true,
    location: { city: 'Pietermaritzburg / Durban', country: 'South Africa', countryCode: 'ZA' },
    start: { lat: -29.600556, lon: 30.379444, name: 'Pietermaritzburg City Hall (direction alternates yearly)' },
    fees: [{ amount: 250, currency: 'USD', indicative: true, label: { en: 'International entry', pl: 'Opłata międzynarodowa' } }],
    website: 'https://comrades.com/',
    registrationUrl: 'https://enter.comrades.com/comrades-2027',
    links: [{ url: 'https://comrades.com/blogs/the-greatest-story-ever-run-comrades-marathon-launches-2027-centenary-edition', label: { en: '2027 centenary edition', pl: 'Edycja stulecia 2027' } }],
    content: {
      en: {
        summary: '“The Ultimate Human Race”: ~89 km between Durban and Pietermaritzburg, with a 12-hour cut-off. 2027 is the centenary edition.',
        description: 'Comrades is the world’s largest and oldest ultramarathon, run since 1921 between Durban and Pietermaritzburg. The direction alternates each year — the “up run” climbs about 800 m net, the “down run” punishes the quads instead. A hard 12-hour cut-off is enforced by a gunshot at the finish line, and roughly 20,000 runners take the start. The 2027 race is the centenary edition.',
      },
      pl: {
        summary: '„Najtrudniejszy bieg świata”: ~89 km między Durbanem a Pietermaritzburgiem, limit 12 godzin. 2027 to edycja stulecia.',
        description: 'Comrades to największy i najstarszy ultramaraton świata, rozgrywany od 1921 roku między Durbanem a Pietermaritzburgiem. Kierunek zmienia się co roku — „up run” oznacza około 800 m przewyższenia netto, „down run” niszczy za to mięśnie czworogłowe. Twardy limit 12 godzin egzekwowany jest wystrzałem na mecie, a na starcie staje około 20 000 biegaczy. Bieg w 2027 roku to edycja stulecia.',
      },
    },
  },
  {
    slug: 'utmb-mont-blanc',
    name: 'UTMB Mont-Blanc',
    date: '2027-08-27',
    endDate: '2027-08-29',
    dateStatus: 'estimated',
    type: 'trail',
    distances: ['171 km / 10 000 m D+'],
    tags: ['trail', 'ultra', 'europe', 'mountains', 'bucket-list'],
    featured: true,
    location: { city: 'Chamonix-Mont-Blanc', country: 'France', countryCode: 'FR' },
    start: { lat: 45.923611, lon: 6.869444, name: 'Place du Triangle de l’Amitié, Chamonix' },
    fees: [{ amount: 400, currency: 'EUR', indicative: true, label: { en: 'UTMB 171 km entry', pl: 'Opłata za UTMB 171 km' } }],
    website: 'https://montblanc.utmb.world/',
    registrationUrl: 'https://utmb.world/open-registrations',
    links: [{ url: 'https://montblanc.utmb.world/races', label: { en: 'All races of the week', pl: 'Wszystkie biegi tygodnia' } }],
    content: {
      en: {
        summary: 'The world championship of trail running: 171 km and 10,000 m of climbing around Mont Blanc, through France, Italy and Switzerland.',
        description: 'UTMB circles the Mont Blanc massif through three countries, and the fastest runners take just over 19 hours while most spend two nights on the trail. Entry requires Running Stones earned at qualifying UTMB World Series races, then a lottery on top. Race week in Chamonix also hosts CCC, OCC, TDS and PTL, so a start line is realistically reachable at several distances. The 2027 date follows the usual late-August pattern — confirm when the calendar is published.',
      },
      pl: {
        summary: 'Nieoficjalne mistrzostwa świata w biegach górskich: 171 km i 10 000 m przewyższenia wokół Mont Blanc, przez Francję, Włochy i Szwajcarię.',
        description: 'UTMB okrąża masyw Mont Blanc przez trzy kraje — najszybsi pokonują trasę w nieco ponad 19 godzin, większość spędza na szlaku dwie noce. Wejście wymaga zdobycia Running Stones w kwalifikacyjnych biegach UTMB World Series, a następnie wylosowania miejsca. W tygodniu startowym w Chamonix rozgrywane są też CCC, OCC, TDS i PTL, więc realnie można wybrać jeden z kilku dystansów. Data 2027 wynika ze stałego wzorca końca sierpnia — potwierdź po publikacji kalendarza.',
      },
    },
  },
  {
    slug: 'marathon-des-sables',
    name: 'Marathon des Sables',
    date: '2027-04-10',
    endDate: '2027-04-20',
    dateStatus: 'estimated',
    type: 'stage',
    distances: ['~250 km / 6 stages'],
    tags: ['stage', 'ultra', 'desert', 'africa', 'extreme', 'self-supported'],
    featured: true,
    location: { city: 'Ouarzazate, Sahara', country: 'Morocco', countryCode: 'MA' },
    start: { lat: 30.919722, lon: -6.893333, name: 'Sahara bivouac near Ouarzazate (varies yearly)' },
    fees: [{ amount: 5400, currency: 'EUR', indicative: true, label: { en: 'Entry incl. logistics and flights from Europe', pl: 'Pakiet z logistyką i lotami z Europy' } }],
    website: 'https://marathondessables.com/en/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Marathon_des_Sables', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'Six stages, ~250 km across the Sahara, carrying your own food and sleeping bag in 45 °C heat.',
        description: 'The Marathon des Sables is the archetypal self-supported stage race: runners carry all their food and equipment for the week, with only water rations and a communal bivouac tent provided. One stage is a non-stop long leg of 80–90 km. Sand dunes, dry riverbeds and rocky jebels are covered in daytime temperatures that regularly pass 45 °C. Dates move between spring and winter editions, so verify the exact window with the organiser.',
      },
      pl: {
        summary: 'Sześć etapów, ~250 km przez Saharę, z własnym jedzeniem i śpiworem na plecach, w 45 °C.',
        description: 'Marathon des Sables to wzorcowy bieg etapowy w formule samowystarczalnej: zawodnicy niosą całe jedzenie i wyposażenie na cały tydzień, a organizator zapewnia jedynie racje wody i wspólny namiot w biwaku. Jeden z etapów to długi, nieprzerwany odcinek 80–90 km. Wydmy, wyschnięte koryta rzek i skaliste dżebele pokonuje się w temperaturach regularnie przekraczających 45 °C. Terminy przesuwają się między edycją wiosenną a zimową, więc potwierdź dokładne okno u organizatora.',
      },
    },
  },
  {
    slug: 'great-wall-marathon',
    name: 'Great Wall Marathon',
    date: '2027-05-15',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km', '21.1 km', '8.5 km'],
    tags: ['bucket-list', 'asia', 'hilly', 'stairs'],
    featured: false,
    location: { city: 'Huangyaguan, Tianjin', country: 'China', countryCode: 'CN' },
    start: { lat: 40.1075, lon: 117.502778, name: 'Yin and Yang Square, Huangyaguan Great Wall' },
    fees: [{ amount: 1300, currency: 'EUR', indicative: true, label: { en: 'Entry incl. travel package', pl: 'Pakiet startowy z podróżą' } }],
    website: 'https://great-wall-marathon.com/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Great_Wall_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: '5,164 steps on the Great Wall of China, twice, in May humidity.',
        description: 'The course leaves Yin and Yang Square, climbs onto the Huangyaguan section of the Great Wall, drops into surrounding villages and farmland, then returns to the Wall for a second pass. There are 5,164 steps in total and finishing times run one to two hours slower than a runner’s road marathon. Entries are typically sold as travel packages through official partners rather than as a standalone bib.',
      },
      pl: {
        summary: '5164 stopnie na Wielkim Murze Chińskim, dwa razy, w majowej wilgotności.',
        description: 'Trasa wychodzi z Placu Yin i Yang, wspina się na odcinek Huangyaguan Wielkiego Muru, schodzi do okolicznych wiosek i pól, a następnie wraca na Mur na drugie przejście. Do pokonania jest łącznie 5164 stopni, a czasy na mecie bywają o jedną–dwie godziny gorsze od maratonu ulicznego. Zapisy sprzedawane są zwykle w formie pakietów turystycznych u oficjalnych partnerów, a nie jako sam numer startowy.',
      },
    },
  },
  {
    slug: 'midnight-sun-marathon-tromso',
    name: 'Midnight Sun Marathon',
    date: '2027-06-19',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km', '21.1 km', '10 km'],
    tags: ['europe', 'arctic', 'night-race', 'scenic'],
    featured: false,
    location: { city: 'Tromsø', country: 'Norway', countryCode: 'NO' },
    start: { lat: 69.649167, lon: 18.955833, name: 'Tromsø city centre' },
    fees: [{ amount: 950, currency: 'NOK', indicative: true, label: { en: 'Marathon entry', pl: 'Opłata za maraton' } }],
    website: 'https://msm.no/en/',
    links: [{ url: 'https://en.wikipedia.org/wiki/Midnight_Sun_Marathon', label: { en: 'Wikipedia', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'A marathon started at 20:30 inside the Arctic Circle, run in full daylight at midnight.',
        description: 'Tromsø sits 350 km north of the Arctic Circle, and in late June the sun simply does not set. The marathon starts in the evening so that runners cross the Tromsø Bridge and the island coastline in bright night light, with the Lyngen Alps across the water. Cool temperatures near 10 °C make it a surprisingly comfortable race despite the unusual hour.',
      },
      pl: {
        summary: 'Maraton ze startem o 20:30 za kołem podbiegunowym, biegany w pełnym świetle o północy.',
        description: 'Tromsø leży 350 km na północ od koła podbiegunowego, a pod koniec czerwca słońce po prostu nie zachodzi. Maraton startuje wieczorem, dzięki czemu most Tromsø i wybrzeże wyspy pokonuje się w jasnym nocnym świetle, z widokiem na Alpy Lyngen po drugiej stronie fiordu. Chłodne, około 10-stopniowe warunki sprawiają, że mimo nietypowej pory biegnie się zaskakująco komfortowo.',
      },
    },
  },
  {
    slug: 'maraton-warszawski',
    name: 'Maraton Warszawski',
    date: '2026-09-27',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['road', 'europe', 'poland'],
    featured: false,
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    start: { lat: 52.231944, lon: 21.005833, name: 'Plac Defilad' },
    fees: [{ amount: 220, currency: 'PLN', indicative: true, label: { en: 'Standard entry', pl: 'Opłata standardowa' } }],
    website: 'https://maratonwarszawski.com/',
    links: [{ url: 'https://pl.wikipedia.org/wiki/Maraton_Warszawski', label: { en: 'Wikipedia (PL)', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'Poland’s biggest marathon: a September loop through central Warsaw and across the Vistula.',
        description: 'The Warsaw Marathon is the largest race of its kind in Poland, drawing well over 10,000 runners through the city centre, Praga on the right bank of the Vistula, and back past the Palace of Culture. The course is flat with a handful of bridge ramps, and late September usually delivers good running temperatures. Verify the exact date and start location with the organiser, as both have shifted between editions.',
      },
      pl: {
        summary: 'Największy maraton w Polsce: wrześniowa pętla przez centrum Warszawy i przez Wisłę.',
        description: 'Maraton Warszawski to największy bieg tej rangi w Polsce — na trasę przez centrum, prawobrzeżną Pragę i z powrotem obok Pałacu Kultury wyrusza grubo ponad 10 000 biegaczy. Trasa jest płaska, z kilkoma podjazdami na mosty, a koniec września zwykle daje dobre warunki do biegania. Dokładną datę i miejsce startu potwierdź u organizatora — obie rzeczy zmieniały się między edycjami.',
      },
    },
  },
  {
    slug: 'cracovia-maraton',
    name: 'Cracovia Maraton',
    date: '2027-04-11',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['road', 'europe', 'poland', 'scenic'],
    featured: false,
    location: { city: 'Kraków', country: 'Poland', countryCode: 'PL' },
    start: { lat: 50.06465, lon: 19.944979, name: 'Rynek Główny / Aleje Trzech Wieszczów' },
    fees: [{ amount: 200, currency: 'PLN', indicative: true, label: { en: 'Standard entry', pl: 'Opłata standardowa' } }],
    website: 'https://www.cracoviamaraton.pl/',
    links: [{ url: 'https://pl.wikipedia.org/wiki/Cracovia_Maraton', label: { en: 'Wikipedia (PL)', pl: 'Wikipedia' } }],
    content: {
      en: {
        summary: 'A spring marathon through one of Europe’s best-preserved medieval city centres.',
        description: 'Cracovia Maraton runs past Wawel Castle, through the Kazimierz quarter and around the Old Town, with a finish traditionally on the Main Market Square. April weather is variable but usually cool enough for a fast time, and the historic backdrop makes it one of the most photogenic marathons in Central Europe. Confirm the date, which moves within the first half of April.',
      },
      pl: {
        summary: 'Wiosenny maraton przez jedno z najlepiej zachowanych średniowiecznych centrów Europy.',
        description: 'Cracovia Maraton prowadzi obok Wawelu, przez Kazimierz i wokół Starego Miasta, a meta tradycyjnie znajduje się na Rynku Głównym. Kwietniowa pogoda bywa zmienna, ale zwykle jest wystarczająco chłodno na dobry czas, a historyczna sceneria czyni z niego jeden z najbardziej fotogenicznych maratonów Europy Środkowej. Potwierdź termin — bieg przesuwa się w obrębie pierwszej połowy kwietnia.',
      },
    },
  },
  {
    slug: 'polmaraton-warszawski',
    name: 'Półmaraton Warszawski',
    date: '2027-03-28',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'city', 'poland'],
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.2297, lon: 21.0122, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'Poland\'s largest half marathon, run through the centre of Warsaw in late March.',
        description: 'A flat, fast loop through the city centre and across the Vistula, held on a Sunday in late March. It is the biggest half marathon in the country and a common season opener before the spring marathons.',
      },
      pl: {
        summary: 'Największy półmaraton w Polsce, biegnący przez centrum Warszawy pod koniec marca.',
        description: 'Płaska, szybka pętla przez centrum i przez Wisłę, rozgrywana w niedzielę pod koniec marca. To największy półmaraton w kraju i typowe otwarcie sezonu przed wiosennymi maratonami.',
      },
    },
  },
  {
    slug: 'bieg-konstytucji-3-maja',
    name: 'Bieg Konstytucji 3 Maja',
    date: '2027-05-03',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['5 km'],
    tags: ['5k', 'city', 'poland'],
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.2297, lon: 21.0122, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A fast 5 km through central Warsaw, always on Constitution Day.',
        description: 'Run every year on 3 May, the national holiday, on a flat course in the city centre. The fixed date makes it one of the few Polish races you can plan a season around years ahead.',
      },
      pl: {
        summary: 'Szybkie 5 km przez centrum Warszawy, zawsze w Święto Konstytucji.',
        description: 'Rozgrywany co roku 3 maja, w święto narodowe, na płaskiej trasie w centrum miasta. Stała data sprawia, że to jeden z niewielu polskich biegów, wokół których można planować sezon z wieloletnim wyprzedzeniem.',
      },
    },
  },
  {
    slug: 'bieg-niepodleglosci-warszawa',
    name: 'Bieg Niepodległości',
    date: '2026-11-11',
    dateStatus: 'confirmed',
    type: 'road',
    distances: ['10 km'],
    tags: ['10k', 'city', 'poland'],
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.2297, lon: 21.0122, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'Ten kilometres through Warsaw every Independence Day, 11 November.',
        description: 'One of the largest 10 km races in Poland, run on the national holiday in what is often near-freezing weather. The date never moves.',
      },
      pl: {
        summary: 'Dziesięć kilometrów przez Warszawę co roku w Święto Niepodległości, 11 listopada.',
        description: 'Jeden z największych biegów na 10 km w Polsce, rozgrywany w święto narodowe, często przy pogodzie blisko zera. Termin nigdy się nie zmienia.',
      },
    },
  },
  {
    slug: 'biegnij-warszawo',
    name: 'Biegnij Warszawo',
    date: '2026-10-04',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['10 km'],
    tags: ['10k', 'city', 'poland'],
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.2297, lon: 21.0122, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A mass-participation 10 km through Warsaw in early autumn.',
        description: 'A flat ten kilometres aimed squarely at recreational runners, with tens of thousands of entries in recent years. Usually held on a Sunday in late September or early October.',
      },
      pl: {
        summary: 'Masowa dziesiątka przez Warszawę wczesną jesienią.',
        description: 'Płaskie dziesięć kilometrów adresowane wprost do biegaczy amatorów, w ostatnich latach z dziesiątkami tysięcy zgłoszeń. Zwykle rozgrywany w niedzielę pod koniec września lub na początku października.',
      },
    },
  },
  {
    slug: 'maraton-wroclaw',
    name: 'Wrocław Maraton',
    date: '2026-09-13',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'poland'],
    location: { city: 'Wrocław', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 51.1079, lon: 17.0385, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A September marathon through Wrocław\'s islands and old town.',
        description: 'The course threads the Oder islands, the market square and the university quarter on a flat profile. September in Wrocław is usually cool enough for a personal best.',
      },
      pl: {
        summary: 'Wrześniowy maraton przez wrocławskie wyspy i starówkę.',
        description: 'Trasa przeplata wyspy odrzańskie, rynek i dzielnicę uniwersytecką, a profil jest płaski. Wrzesień we Wrocławiu bywa wystarczająco chłodny na życiówkę.',
      },
    },
  },
  {
    slug: 'nocny-polmaraton-wroclaw',
    name: 'Nocny Wrocław Półmaraton',
    date: '2027-06-19',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'night', 'city', 'poland'],
    location: { city: 'Wrocław', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 51.1079, lon: 17.0385, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'Half marathon run after dark through a lit-up Wrocław, in June.',
        description: 'A summer evening start turns the city centre into a night course, which sidesteps the June heat and gives the race its character. Expect a party atmosphere rather than a time trial.',
      },
      pl: {
        summary: 'Półmaraton biegnięty po zmroku przez rozświetlony Wrocław, w czerwcu.',
        description: 'Letni wieczorny start zamienia centrum w nocną trasę, co pozwala uciec od czerwcowego upału i nadaje biegowi charakter. Nastawiaj się raczej na atmosferę święta niż na walkę z czasem.',
      },
    },
  },
  {
    slug: 'poznan-maraton',
    name: 'Poznań Maraton',
    date: '2026-10-11',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'poland'],
    location: { city: 'Poznań', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.4064, lon: 16.9252, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'One of Poland\'s oldest big-city marathons, run in mid-October.',
        description: 'A flat two-loop course through Poznań with reliable autumn weather and a long tradition — it is among the longest-running marathons in the country.',
      },
      pl: {
        summary: 'Jeden z najstarszych dużych maratonów miejskich w Polsce, rozgrywany w połowie października.',
        description: 'Płaska, dwupętlowa trasa przez Poznań, przewidywalna jesienna pogoda i długa tradycja — to jeden z najdłużej rozgrywanych maratonów w kraju.',
      },
    },
  },
  {
    slug: 'poznan-polmaraton',
    name: 'Poznań Półmaraton',
    date: '2027-04-11',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'city', 'poland'],
    location: { city: 'Poznań', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.4064, lon: 16.9252, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A large, flat spring half marathon through Poznań.',
        description: 'Held in April as a lead-in to the spring marathon season, on a fast course through the city. One of the biggest half marathons in western Poland.',
      },
      pl: {
        summary: 'Duży, płaski wiosenny półmaraton przez Poznań.',
        description: 'Rozgrywany w kwietniu jako wstęp do wiosennego sezonu maratońskiego, na szybkiej trasie przez miasto. Jeden z największych półmaratonów w zachodniej Polsce.',
      },
    },
  },
  {
    slug: 'gdynia-polmaraton',
    name: 'Gdynia Półmaraton',
    date: '2027-03-14',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'city', 'seaside', 'poland'],
    location: { city: 'Gdynia', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 54.5189, lon: 18.5305, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A seaside half marathon in March, and a regular Polish championship venue.',
        description: 'The course runs along the Gdynia waterfront, which means sea air and, often, a headwind on the way back. It has repeatedly hosted the Polish half marathon championships.',
      },
      pl: {
        summary: 'Nadmorski półmaraton w marcu, regularnie goszczący mistrzostwa Polski.',
        description: 'Trasa prowadzi wzdłuż gdyńskiego nabrzeża, co oznacza morskie powietrze i często wiatr w twarz na powrocie. Bieg wielokrotnie gościł mistrzostwa Polski w półmaratonie.',
      },
    },
  },
  {
    slug: 'maraton-gdansk',
    name: 'Maraton Gdańsk',
    date: '2027-04-18',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'seaside', 'poland'],
    location: { city: 'Gdańsk', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 54.352, lon: 18.6466, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A spring marathon along the Tricity coast and through historic Gdańsk.',
        description: 'Flat throughout, with long stretches near the water and a passage through the old town. April on the Baltic is cool, which suits the distance.',
      },
      pl: {
        summary: 'Wiosenny maraton wzdłuż trójmiejskiego wybrzeża i przez historyczny Gdańsk.',
        description: 'Trasa jest płaska na całej długości, z długimi odcinkami blisko wody i przejściem przez starówkę. Kwiecień nad Bałtykiem jest chłodny, co sprzyja tej odległości.',
      },
    },
  },
  {
    slug: 'silesia-marathon',
    name: 'Silesia Marathon',
    date: '2026-10-04',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'poland'],
    location: { city: 'Katowice', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 50.2649, lon: 19.0238, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'An October marathon across the Upper Silesian conurbation.',
        description: 'The route crosses several neighbouring Silesian cities rather than looping one centre, which gives it an industrial-landscape character unlike any other Polish marathon.',
      },
      pl: {
        summary: 'Październikowy maraton przez aglomerację górnośląską.',
        description: 'Trasa przecina kilka sąsiadujących śląskich miast, zamiast krążyć wokół jednego centrum, co nadaje jej poprzemysłowy charakter niespotykany w innych polskich maratonach.',
      },
    },
  },
  {
    slug: 'doz-maraton-lodz',
    name: 'DOZ Maraton Łódź',
    date: '2027-04-18',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'poland'],
    location: { city: 'Łódź', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 51.7592, lon: 19.456, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A flat April marathon through Łódź, including Piotrkowska Street.',
        description: 'One of the flattest marathon courses in Poland, run in April and passing along Piotrkowska, the long pedestrian axis of the city.',
      },
      pl: {
        summary: 'Płaski kwietniowy maraton przez Łódź, z odcinkiem ulicą Piotrkowską.',
        description: 'Jedna z najbardziej płaskich tras maratońskich w Polsce, rozgrywana w kwietniu, z przebiegiem przez Piotrkowską — długą oś pieszą miasta.',
      },
    },
  },
  {
    slug: 'bieg-ulica-piotrkowska',
    name: 'Bieg Ulicą Piotrkowską Rossmann Run',
    date: '2027-09-05',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['10 km'],
    tags: ['10k', 'city', 'poland'],
    location: { city: 'Łódź', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 51.7592, lon: 19.456, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A ten kilometre race straight down Poland\'s longest commercial street.',
        description: 'The course uses Piotrkowska Street, which is dead flat and lined with spectators for most of its length. A popular target for a 10 km personal best.',
      },
      pl: {
        summary: 'Bieg na dziesięć kilometrów prosto najdłuższą handlową ulicą w Polsce.',
        description: 'Trasa prowadzi ulicą Piotrkowską — zupełnie płaską i na większości długości obstawioną kibicami. Popularny cel na życiówkę na dziesiątce.',
      },
    },
  },
  {
    slug: 'cracovia-polmaraton',
    name: 'Cracovia Półmaraton',
    date: '2026-10-18',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'city', 'poland'],
    location: { city: 'Kraków', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 50.0647, lon: 19.945, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'The autumn half marathon counterpart to Kraków\'s spring marathon.',
        description: 'Run in October through the same historic centre as Cracovia Maraton, at half the distance and with cooler weather.',
      },
      pl: {
        summary: 'Jesienny półmaratoński odpowiednik wiosennego maratonu w Krakowie.',
        description: 'Rozgrywany w październiku przez to samo historyczne centrum co Cracovia Maraton, na połowie dystansu i przy chłodniejszej pogodzie.',
      },
    },
  },
  {
    slug: 'maraton-lubelski',
    name: 'Maraton Lubelski',
    date: '2027-09-19',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['42.2 km'],
    tags: ['marathon', 'city', 'poland'],
    location: { city: 'Lublin', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 51.2465, lon: 22.5684, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'An early-autumn marathon through Lublin, in eastern Poland.',
        description: 'A city marathon on gently rolling terrain, held in September. Smaller and less crowded than the Warsaw or Kraków fields.',
      },
      pl: {
        summary: 'Wczesnojesienny maraton przez Lublin, we wschodniej Polsce.',
        description: 'Miejski maraton na lekko falującym terenie, rozgrywany we wrześniu. Mniejszy i mniej zatłoczony niż stawki w Warszawie czy Krakowie.',
      },
    },
  },
  {
    slug: 'bieg-rzeznika',
    name: 'Bieg Rzeźnika',
    date: '2027-07-03',
    dateStatus: 'estimated',
    type: 'ultra',
    distances: ['80 km'],
    tags: ['ultra', 'trail', 'mountain', 'teams', 'poland'],
    location: { city: 'Cisna', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 49.2069, lon: 22.3231, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'The classic Bieszczady mountain ultra, run in pairs.',
        description: 'Roughly eighty kilometres across the Bieszczady ridges, run as a two-person team that must stay together the whole way. Entry is famously oversubscribed and the July heat on the open połoniny is part of the test.',
      },
      pl: {
        summary: 'Klasyczny bieszczadzki ultramaraton górski, biegany w parach.',
        description: 'Około osiemdziesiąt kilometrów przez bieszczadzkie grzbiety, pokonywane w dwuosobowym zespole, który musi trzymać się razem przez całą trasę. Zapisy słyną z ogromnej nadsubskrypcji, a lipcowy upał na otwartych połoninach jest częścią próby.',
      },
    },
  },
  {
    slug: 'lemkowyna-ultra-trail',
    name: 'Łemkowyna Ultra Trail',
    date: '2027-09-11',
    dateStatus: 'estimated',
    type: 'ultra',
    distances: ['150 km', '70 km', '45 km'],
    tags: ['ultra', 'trail', 'mountain', 'poland'],
    location: { city: 'Krynica-Zdrój', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 49.4194, lon: 20.9569, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A Beskid Niski ultra through the old Lemko lands, with several distances.',
        description: 'Autumn trails through quiet, depopulated valleys in the Low Beskids, with the longest option running well past a hundred kilometres. Known for its atmosphere rather than its crowds.',
      },
      pl: {
        summary: 'Ultramaraton po Beskidzie Niskim, przez dawne ziemie łemkowskie, z kilkoma dystansami.',
        description: 'Jesienne szlaki przez ciche, wyludnione doliny Beskidu Niskiego, przy czym najdłuższa opcja przekracza sto kilometrów. Bieg znany raczej z atmosfery niż z tłumów.',
      },
    },
  },
  {
    slug: 'chudy-wawrzyniec',
    name: 'Chudy Wawrzyniec',
    date: '2027-08-14',
    dateStatus: 'estimated',
    type: 'trail',
    distances: ['35 km'],
    tags: ['trail', 'mountain', 'poland'],
    location: { city: 'Szczyrk', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 49.7186, lon: 19.0361, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A long-standing Beskid mountain race in the middle of August.',
        description: 'A summer trail race over the Beskid ridges above Szczyrk, with serious climbing packed into a moderate distance.',
      },
      pl: {
        summary: 'Wieloletni bieg górski w Beskidach, w połowie sierpnia.',
        description: 'Letni bieg po grzbietach Beskidów nad Szczyrkiem, z poważnymi podbiegami upchniętymi w umiarkowany dystans.',
      },
    },
  },
  {
    slug: 'zimowy-ultramaraton-karkonoski',
    name: 'Zimowy Ultramaraton Karkonoski',
    date: '2027-01-23',
    dateStatus: 'estimated',
    type: 'ultra',
    distances: ['48 km'],
    tags: ['ultra', 'trail', 'mountain', 'winter', 'poland'],
    location: { city: 'Karpacz', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 50.7681, lon: 15.7089, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A winter ultra across the Karkonosze ridge, in full snow.',
        description: 'Run in January over the main Karkonosze ridge, where wind and snow decide the day as much as fitness. Mandatory winter kit; the weather can shorten the course.',
      },
      pl: {
        summary: 'Zimowy ultramaraton przez grzbiet Karkonoszy, w pełnym śniegu.',
        description: 'Rozgrywany w styczniu głównym grzbietem Karkonoszy, gdzie o wyniku decydują wiatr i śnieg nie mniej niż forma. Obowiązkowy sprzęt zimowy, a pogoda potrafi skrócić trasę.',
      },
    },
  },
  {
    slug: 'wings-for-life-poznan',
    name: 'Wings for Life World Run — Poznań',
    date: '2027-05-09',
    dateStatus: 'estimated',
    type: 'road',
    distances: [],
    tags: ['charity', 'open-ended', 'city', 'poland'],
    location: { city: 'Poznań', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.4064, lon: 16.9252, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'The Polish flagship location of the global run with no finish line.',
        description: 'Everyone starts at the same moment worldwide and runs until a catcher car overtakes them, so there is no fixed distance. Poznań is the Polish flagship venue; entry fees go to spinal cord research.',
      },
      pl: {
        summary: 'Polska lokalizacja flagowa światowego biegu bez mety.',
        description: 'Wszyscy startują w tej samej chwili na całym świecie i biegną, dopóki nie wyprzedzi ich samochód pościgowy — dystans nie jest z góry ustalony. Poznań jest polską lokalizacją flagową, a wpisowe zasila badania nad urazami rdzenia kręgowego.',
      },
    },
  },
  {
    slug: 'bieg-7-dolin',
    name: 'Bieg 7 Dolin',
    date: '2027-09-19',
    dateStatus: 'estimated',
    type: 'trail',
    distances: ['46 km', '23 km'],
    tags: ['trail', 'poland'],
    location: { city: 'Wieliczka', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 49.9871, lon: 20.0649, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'Trail race through the valleys south of Kraków, in September.',
        description: 'A route over the wooded hills and valleys between Wieliczka and the Kraków foothills — approachable trail running within reach of the city.',
      },
      pl: {
        summary: 'Bieg terenowy przez doliny na południe od Krakowa, we wrześniu.',
        description: 'Trasa po zalesionych wzgórzach i dolinach między Wieliczką a podkrakowskimi wzniesieniami — przystępny bieg terenowy w zasięgu miasta.',
      },
    },
  },
  {
    slug: 'polmaraton-praski',
    name: 'Półmaraton Praski',
    date: '2027-05-23',
    dateStatus: 'estimated',
    type: 'road',
    distances: ['21.1 km'],
    tags: ['half-marathon', 'city', 'poland'],
    location: { city: 'Warszawa', country: 'Poland', countryCode: 'PL' },
    // City-level: these were entered by hand and the exact start is the
    // organiser's to publish, so the pin marks the town.
    start: { lat: 52.2297, lon: 21.0122, name: null, precision: 'city' },
    // Deliberately no fees: an invented entry fee is worse than none at all.
    fees: [],
    content: {
      en: {
        summary: 'A half marathon on the right bank of the Vistula, in Warsaw\'s Praga district.',
        description: 'Run on the Praga side of the river in late spring, away from the city-centre routes used by the bigger Warsaw races.',
      },
      pl: {
        summary: 'Półmaraton po prawej stronie Wisły, w warszawskiej Pradze.',
        description: 'Rozgrywany po praskiej stronie rzeki późną wiosną, z dala od śródmiejskich tras, którymi biegną większe warszawskie imprezy.',
      },
    },
  },
];

export async function fetchEvents() {
  const now = new Date().toISOString();
  return EVENTS.map((event) => ({
    ...event,
    source: { id, url: event.website ?? null, ref: event.slug, fetchedAt: now },
  }));
}
