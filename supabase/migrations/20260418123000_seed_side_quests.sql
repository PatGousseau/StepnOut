WITH payload AS (
  SELECT $sidequests${
  "quests": [
    {
      "title": "Scorribanda in pasticceria",
      "summary": "Trova una pasticceria in cui non sei mai entrato e compra qualcosa di piccolo.",
      "why_it_hits": "Una piccola commissione che si trasforma in una scoperta di quartiere.",
      "instructions": "Raggiungi a piedi o con i mezzi una pasticceria fuori dal tuo percorso abituale, scegli ciò che ti colpisce, consumalo lì vicino e annota un dettaglio sul locale che altrimenti non avresti scoperto.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "instructions": "Pick a block near home, walk it slowly, notice signs, textures, sounds, plants, and windows, then choose the most interesting thing you found as the block's unofficial landmark.",
      "title": "Safari di un isolato",
      "summary": "Studia un isolato qualsiasi come se fosse una meta di viaggio.",
      "why_it_hits": "Trasforma le strade familiari in un territorio tutto da scoprire.",
      "instructions": "Scegli un isolato vicino a casa, cammina lentamente e osserva insegne, superfici, suoni, piante e finestre; poi scegli come punto di riferimento non ufficiale dell'isolato l'elemento più interessante che hai trovato.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Museo in una stanza",
      "summary": "Visita una sola sala espositiva e ignora il resto.",
      "why_it_hits": "Limitare l'ambito rende la cultura più accessibile.",
      "instructions": "Vai in un museo gratuito o economico, scegli una sola sala, resta almeno venti minuti, scegli il tuo oggetto preferito e vai via prima di sentirti obbligato a vedere tutto.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bevanda all'alba",
      "summary": "Bevi caffè, tè o succo all'aperto all'alba.",
      "why_it_hits": "La giornata inizia con un reset cinematografico.",
      "instructions": "Controlla l'orario dell'alba, porta o compra una bevanda semplice, siediti in un punto con una vista libera verso est e resta finché la luce non cambia visibilmente.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola traversata in traghetto",
      "summary": "Prendi il traghetto pubblico o il water taxi più breve disponibile.",
      "why_it_hits": "L'acqua fa sì che anche un piccolo spostamento abbia l'aria di un viaggio.",
      "instructions": "Trova una tratta in barca locale ed economica, percorri una sola fermata o fai andata e ritorno, tieni il telefono per lo più lontano e osserva la costa come se stessi arrivando in un posto nuovo.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pescata al buio in biblioteca",
      "summary": "Prendi in prestito un libro da una sezione che raramente visiti.",
      "why_it_hits": "Le scelte casuali possono suscitare curiosità inaspettata.",
      "instructions": "Vai in biblioteca, scegli una sezione che normalmente salti, prendi tre libri basandoti sul titolo o sulla copertina, prendine in prestito uno e leggi le prime dieci pagine in un posto tranquillo.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Panchina con vista",
      "summary": "Trova la panchina pubblica migliore raggiungibile a piedi.",
      "why_it_hits": "Crea un piccolo luogo a cui tornare.",
      "instructions": "Cammina finché trovi tre panchine candidate, siediti su ciascuna per cinque minuti, poi scegli la vincitrice valutando vista, comodità e la possibilità di osservare la gente.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "going_far",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia al Colore al Mercato",
      "summary": "Visita un mercato e compra cibo di un colore scelto.",
      "why_it_hits": "Un vincolo semplice rende la spesa più giocosa.",
      "instructions": "Scegli un colore prima di uscire, visita un negozio di alimentari, un mercato contadino o la bottega sotto casa, scegli un alimento economico di quel colore e crea uno snack o un pasto partendo da quello.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Rifare una Foto Vecchia",
      "summary": "Ricrea una vecchia foto nello stesso luogo originale.",
      "why_it_hits": "Collega passato e presente in modo visibile.",
      "instructions": "Trova una vecchia foto personale o di famiglia scattata nei paraggi, vai sul posto se possibile, ricrea l’angolazione e confronta i cambiamenti senza pubblicare a meno che tu non lo voglia.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Picnic in Tasca",
      "summary": "Mangia uno snack portatile in un posto non pensato per i pasti.",
      "why_it_hits": "Rompere la routine del pranzo automatico.",
      "instructions": "Prepara o compra uno snack semplice, scegli un luogo pubblico sicuro come delle scale, una piazza o il bordo di un parco, mangialo lentamente e dai al posto il nome di un ristorante inventato.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Camminata tra fermate",
      "summary": "Cammina tra due fermate dei mezzi che di solito oltrepassi.",
      "why_it_hits": "Riempie un pezzo mancante della mappa della tua città.",
      "instructions": "Scegli due fermate di autobus, tram o treno che conosci bene, scendi a una, cammina fino all’altra e osserva cosa c’è nello spazio che di solito salti.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cartolina per una Persona Vera",
      "summary": "Spedisci una cartolina dalla tua città.",
      "why_it_hits": "Fa sentire i luoghi comuni degni di essere condivisi.",
      "instructions": "Compra o crea una cartolina economica, scrivi un breve messaggio a qualcuno a cui piacerebbe ricevere posta a sorpresa, annullala con un francobollo e imbucala lo stesso giorno.",
      "goal_tags": [
        "connection",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Mission dal Ferramenta",
      "summary": "Gira per un negozio di ferramenta alla ricerca di un oggetto stranamente utile.",
      "why_it_hits": "I luoghi pratici possono sembrare veri e propri laboratori di invenzioni.",
      "instructions": "Vai in un negozio di ferramenta o discount, esplora i corridoi che di solito eviti, non comprare nulla oppure acquista un solo oggetto economico sotto un limite stabilito, e immagina tre usi diversi per quell'oggetto.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La strada più lunga per tornare a casa",
      "summary": "Torna da una commissione scegliendo apposta un percorso diverso.",
      "why_it_hits": "Aggiunge novità senza richiedere pianificazione extra.",
      "instructions": "Fai una commissione normale, poi torna a casa con un percorso che allunghi il viaggio di almeno dieci minuti, evitando le tue strade abituali e fermandoti una volta quando qualcosa attira la tua attenzione.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "planning",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appello all'arte pubblica",
      "summary": "Trova tre opere d'arte pubblica in un'unica uscita.",
      "why_it_hits": "La città si trasforma in una galleria gratuita.",
      "instructions": "Cerca su una mappa o piuttosto vagabonda in un'area promettente, visita tre murales, sculture, targhe o installazioni e scegli quella che mostreresti a un amico in visita.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mappa sonora del quartiere",
      "summary": "Raccogli i suoni di un luogo usando solo le orecchie.",
      "why_it_hits": "Ascoltare cambia la percezione di un luogo familiare.",
      "instructions": "Siediti o cammina fuori per venti minuti, identifica dieci suoni distinti, ordinali dal più piacevole al più fastidioso e nota quale normalmente tendi a ignorare.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena dal negozietto",
      "summary": "Prepara una cena usando solo quello che trovi in un piccolo negozio locale.",
      "why_it_hits": "La restrizione trasforma un pasto abituale in un gioco.",
      "instructions": "Scegli un corner shop, una bodega o un mini market, stabilisci un piccolo budget, compra gli ingredienti per un pasto semplice o un vassoio di snack e consumalo senza aggiungere nulla da casa.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Sguardo in Prestito",
      "summary": "Visita l’ultimo piano di un edificio pubblico.",
      "why_it_hits": "Un’altezza nuova apre una prospettiva mentale diversa.",
      "instructions": "Trova una biblioteca, un edificio universitario, un centro commerciale o un edificio comunale con accesso al pubblico, sali a un piano superiore, osserva per cinque minuti e individua un punto di riferimento.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata per riconoscere piante",
      "summary": "Impara i nomi di cinque piante vicino a te.",
      "why_it_hits": "Dare un nome alle cose rende il mondo più ricco.",
      "instructions": "Cammina per una via o un parco, usa cartelli, una guida o un’app per piante, identifica cinque piante e scegli quella che vorresti avere più volentieri davanti alla tua porta.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Solo Contanti per un Dolce",
      "summary": "Spendi soltanto spiccioli o una banconota piccola per un piccolo piacere.",
      "why_it_hits": "Un limite ristretto rende la scelta più soddisfacente.",
      "instructions": "Prendi una somma fissa e piccola in contanti, vai in una bottega, pasticceria, chiosco o mercato, compra la cosa migliore entro il limite e goditi la decisione senza usare la carta.",
      "goal_tags": [
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Fuga cinematografica di metà giornata",
      "summary": "Vai a vedere un film pomeridiano da solo o con un amico.",
      "why_it_hits": "Il cinema diurno ha un che di piacevolmente lussuoso.",
      "instructions": "Scegli un matineé economico o una proiezione comunitaria, arrivaci senza fretta, siediti da qualche parte dove normalmente non ti posizioneresti e fai una breve passeggiata dopo prima di tornare alla routine.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Architettura dei vicoli",
      "summary": "Esplora vicoli o stradine laterali sicure alla ricerca di dettagli trascurati.",
      "why_it_hits": "I percorsi secondari rivelano il volto nascosto di un luogo.",
      "instructions": "Scegli un'area ben illuminata durante il giorno, cammina solo su percorsi pubblici sicuri, cerca porte, piante rampicanti, garage, piastrelle o vecchi cartelli e torna indietro se qualcosa sembra privato o sospetto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola indagine sulla storia locale",
      "summary": "Informati su una targa, un edificio antico o il nome di una strada.",
      "why_it_hits": "Un fatto può trasformare una via in un luogo pieno di storie.",
      "instructions": "Trova una targa o un nome curioso nei paraggi, leggilo di persona, cerca una fonte affidabile sul telefono e racconta a qualcuno il dettaglio più sorprendente.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ora del quotidiano",
      "summary": "Leggi un giornale cartaceo in un luogo pubblico.",
      "why_it_hits": "Rallenta il flusso di informazioni e cambia la tua postura.",
      "instructions": "Compra, prendi in prestito o trova un giornale, siediti in un bar, in biblioteca o in un parco, leggi per trenta minuti e cerchia o ricordati un articolo da poter citare più tardi.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Giro nei corridoi sbagliati del supermercato",
      "summary": "Esplora tre corsie della spesa che non usi mai.",
      "why_it_hits": "Ti mostra i mondi quotidiani di altre persone.",
      "instructions": "Vai in un supermercato, scegli tre corsie che non conosci, leggi etichette e ingredienti, scegli un prodotto da scoprire o comprare e lascia da parte il giudizio, coltiva la curiosità.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Scambio di commissioni tra amici",
      "summary": "Fai una piccola commissione con un amico e rendila sociale.",
      "why_it_hits": "Le faccende pesano meno se condivise.",
      "instructions": "Chiedi a un amico se deve comprare generi, spedire qualcosa o portare a spasso il cane; unisciti a lui per la commissione e aggiungete una deviazione di cinque minuti per un piccolo premio o una bella vista.",
      "goal_tags": [
        "connection",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "playful"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Schizzo sul pianerottolo",
      "summary": "Disegna la vista dalla tua porta d'ingresso o dall'uscita del palazzo.",
      "why_it_hits": "Tracciare segni costringe a osservare con attenzione nuova.",
      "instructions": "Porta carta e una penna qualsiasi, fermati o siediti appena fuori casa, schizza per dieci minuti senza cercare la bellezza e annota tre dettagli che non avevi mai notato.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dolce Prima della Cena",
      "summary": "Mangia un dolce prima del pasto in un luogo fuori casa.",
      "why_it_hits": "Mischia delicatamente una regola senza conseguenze.",
      "instructions": "Scegli un dolce modesto in una pasticceria, in una tavola calda o in un negozio, mangialo prima del tuo pasto abituale e nota se questo piccolo ribaltamento cambia il tuo umore.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Il mazzo da cinque dollari",
      "summary": "Crea o compra il mazzo di fiori più economico per il tuo spazio.",
      "why_it_hits": "Una piccola bellezza può cambiare completamente una stanza.",
      "instructions": "Raccogli fiori caduti dove è permesso, compra un mazzo a basso costo o combina verde dal mercato, mettili in un qualsiasi contenitore e posizionali in un punto che attraverserai spesso oggi.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dadi del trasporto",
      "summary": "Lascia che sia il caso a decidere una breve uscita sui mezzi.",
      "why_it_hits": "La casualità taglia attraverso il pensiero eccessivo.",
      "instructions": "Scegli una linea di trasporto sicura, lancia un dado o usa un numero casuale per il numero di fermate, percorri quella distanza di giorno, scendi per quindici minuti, poi ritorna o continua se ti ispira.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Salita sulle Scale Pubbliche",
      "summary": "Sali con calma una scala all'aperto che vale la pena vedere.",
      "why_it_hits": "Un piccolo sforzo crea una sensazione di arrivo.",
      "instructions": "Trova una scala pubblica in strada, le gradinate di un parco o le scale di un monumento; sali lentamente facendo pause, guarda indietro dalla cima e rinuncia se le condizioni sono pericolose o non accessibili.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "Studio di Personaggio al Mercatino",
      "summary": "Trova un capo per un personaggio immaginario.",
      "why_it_hits": "Gli oggetti di seconda mano invitano a raccontare storie.",
      "instructions": "Vai in un mercatino dell'usato, scegli un oggetto che suggerisca una vita o una personalità, non comprarlo a meno che non lo desideri, e inventa dove andrà il suo proprietario fittizio questa sera.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pausa sul ponte",
      "summary": "Attraversa un ponte pedonale sicuro e fermati a metà.",
      "why_it_hits": "I ponti rendono fisica la transizione.",
      "instructions": "Vai su un ponte sicuro per i pedoni, fermati dove è consentito, guarda in entrambe le direzioni, nomina ciò che stai lasciando e ciò verso cui stai camminando, poi prosegui oltre.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Al bar senza il solito ordine",
      "summary": "Ordina qualcosa che non hai mai provato in un bar che conosci.",
      "why_it_hits": "Una piccola deviazione impedisce alla routine di irrigidirsi.",
      "instructions": "Vai in un bar che frequenti, scegli una bevanda o uno snack fuori dal tuo solito, siediti abbastanza a lungo da assaporarlo bene e decidi se merita una seconda possibilità.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Passeggiata con la playlist di un amico",
      "summary": "Lascia che qualcun altro faccia da colonna sonora alla tua passeggiata.",
      "why_it_hits": "La musica prestata trasforma paesaggi familiari.",
      "instructions": "Chiedi a un amico tre canzoni o una breve playlist, cammina all'aperto ascoltando senza saltare tracce e mandagli una frase su quale momento si è abbinato meglio.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Turista per un'ora",
      "summary": "Comportati come un visitatore nella tua città per un'ora.",
      "why_it_hits": "Il permesso di guardarsi intorno cambia tutto.",
      "instructions": "Scegli una zona centrale, indossa scarpe comode, visita un monumento o un belvedere, leggi un cartello, prenditi una pausa senza fretta e chiedi cosa consiglieresti a un ospite.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Visita silenziosa in chiesa",
      "summary": "Siediti all’interno di una chiesa, tempio o sala di meditazione aperta ai visitatori.",
      "why_it_hits": "I luoghi sacri offrono un raro silenzio pubblico.",
      "instructions": "Trova un luogo che accetti visitatori rispettosi, entra durante gli orari di apertura, siediti in silenzio per dieci minuti, osserva l’architettura e lascia un’offerta solo se lo desideri.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Posto al banco per pranzo",
      "summary": "Mangia al banco invece che al tavolo.",
      "why_it_hits": "Cambia la geometria sociale del pasto.",
      "instructions": "Scegli una tavola calda, un caffè, una bancarella o un bancone di bar economico diurno, ordina qualcosa di semplice, siediti rivolto verso l’azione e nota il ritmo dei lavoranti.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Mappa degli odori",
      "summary": "Fai una passeggiata guidata dagli odori.",
      "why_it_hits": "L'olfatto crea ricordi forti e inaspettati.",
      "instructions": "Percorri un percorso sicuro per venti minuti, fermati ogni volta che avverti un odore distinto, individua mentalmente il punto in cui è più intenso e scegli l’odore che meglio definisce l’area.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mezz'ora di sport locale",
      "summary": "Guarda una parte di una partita informale del quartiere.",
      "why_it_hits": "L'energia della comunità è più facile da sentire come spettatore.",
      "instructions": "Trova un parco pubblico, un campo scolastico o un campo comunitario dove si sta giocando, osserva rispettosamente per venti-trenta minuti, applaudi piano se è appropriato e vai via prima che si prolunghi.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La cosa più antica nei paraggi",
      "summary": "Trova l'oggetto o l'edificio visibile più antico a breve distanza a piedi.",
      "why_it_hits": "L'età dà profondità agli ambienti di tutti i giorni.",
      "instructions": "Gira per il tuo quartiere cercando date, materiali, targhe, alberi o indizi architettonici, individua il candidato migliore e verifica sommariamente le informazioni se disponibili.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pendolarismo al Contrario",
      "summary": "Spostati nella direzione opposta alla tua solita durante l'orario del tragitto.",
      "why_it_hits": "Ti mostra un altro flusso della città.",
      "instructions": "In un'ora diurna sicura, prendi un autobus, un treno, vai in bici o cammina nella direzione opposta alla tua routine per quindici-trenta minuti, poi torna con un percorso diverso.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola missione di riparazione",
      "summary": "Ripara una piccola cosa che stai ignorando.",
      "why_it_hits": "Completare qualcosa di visibile crea subito slancio.",
      "instructions": "Scegli un bottone allentato, una cerniera che cigola, un cavo in disordine, una gomma della bici sgonfia o un oggetto traballante, prendi solo ciò che ti serve, riparalo oggi e fermati dopo una sola riparazione.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia al Fantasma del Telefoni Pubblico",
      "summary": "Cerca un vecchio telefono a gettoni o una cabina telefonica.",
      "why_it_hits": "Oggetti obsoleti rendono il presente più straniante.",
      "instructions": "Guarda in alto o passeggia verso luoghi pubblici probabili, trova un telefono a gettoni, una cabina telefonica o un punto di fissaggio vuoto, osservalo come un reperto e immagina una chiamata fatta lì.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena con una nuova spezia",
      "summary": "Cucina usando una spezia o una salsa che non hai mai usato.",
      "why_it_hits": "Un piccolo ingrediente può trasformare tutta la serata.",
      "instructions": "Compra o prendi in prestito una spezia, un condimento o una salsa economica, aggiungila a un piatto semplice, assaggia con attenzione e scrivi il nome su un biglietto così entrerà nel tuo vocabolario culinario.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata nei Nomi del Cimitero",
      "summary": "Cammina con rispetto in un cimitero e leggi i nomi.",
      "why_it_hits": "È silenzioso, radicante e pieno di tracce umane.",
      "instructions": "Visita durante l'orario di apertura diurno, cammina con rispetto sui sentieri, leggi alcune iscrizioni, nota date e simboli e vai via senza fotografare il dolore privato o disturbare nulla.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ufficio al tavolo del parco",
      "summary": "Svolgi una piccola attività amministrativa su un tavolo all'aperto.",
      "why_it_hits": "Cambiare ambiente rende il lavoro noioso meno monotono.",
      "instructions": "Scegli un compito gestibile come pagare una bolletta, rispondere a un'email o smistare un modulo, vai a un tavolo del parco o a una panchina in una piazza, portalo a termine e poi chiudi il dispositivo.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mappa dei dolci del quartiere",
      "summary": "Confronta due dolci locali con un amico.",
      "why_it_hits": "Una semplice degustazione che si trasforma in una mini-avventura condivisa.",
      "instructions": "Scegli due pasticcerie, gelaterie o dolci del supermercato economici e vicini, dividete porzioni piccole con qualcuno e dichiarate un vincitore valutando consistenza, atmosfera e rapporto qualità-prezzo.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Galleria sotto il cavalcavia",
      "summary": "Esplora murales o poster sotto un cavalcavia pubblico.",
      "why_it_hits": "I margini della città spesso conservano un'energia visiva cruda.",
      "instructions": "Scegli un percorso sicuro, legale e diurno vicino a un cavalcavia o viadotto, cerca opere autorizzate, strati di poster e dettagli dell'infrastruttura; allontanati se l'area ti sembra pericolosa.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Prova di una ricetta scritta a mano",
      "summary": "Cucina seguendo una ricetta scritta a mano o di famiglia.",
      "why_it_hits": "Il cibo diventa un ponte verso le abitudini e i gesti di un'altra persona.",
      "instructions": "Chiedi a qualcuno una ricetta semplice o usa una vecchia scheda, seguila il più possibile così com'è e, se è appropriato, condividi una foto o assaggia insieme alla persona.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Prime frasi in libreria",
      "summary": "Leggi la prima riga di dieci libri in una libreria o biblioteca.",
      "why_it_hits": "È come lo speed dating letterario senza impegno.",
      "instructions": "Vai in una libreria o in una biblioteca, scegli dieci libri da sezioni diverse, leggi soltanto la prima riga di ciascuno e scegli quello che ti fa desiderare più di tutte una seconda frase.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Uno sguardo al municipio",
      "summary": "Entra in un edificio pubblico solo per conoscerlo.",
      "why_it_hits": "Gli spazi civici si percepiscono diversamente quando non sono legati a commissioni.",
      "instructions": "Durante l'orario di apertura, entra al municipio, nella hall di un tribunale o in un edificio pubblico accessibile ai visitatori, osserva l'architettura e la segnaletica, poi esci senza dover avere un motivo.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini golf per l'umore",
      "summary": "Gioca a mini golf, freccette, bowling o un altro gioco a bassa posta in gioco.",
      "why_it_hits": "Una follia strutturata rende la connessione più semplice.",
      "instructions": "Invita una persona o vai da solo, scegli un locale economico e informale, gioca un turno senza preoccuparti dei punteggi e celebra in modo drammatico il tuo colpo migliore.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Passeggiata sotto la pioggia Deluxe",
      "summary": "Fai una breve passeggiata sotto la pioggia con l'attrezzatura giusta.",
      "why_it_hits": "Il meteo diventa atmosfera invece che un fastidio.",
      "instructions": "Quando la pioggia è leggera e sicura, indossa una giacca o porta un ombrello, cammina per quindici minuti, nota i riflessi e gli odori, poi torna a casa e cambiai vestiti con abiti asciutti.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Test della pasticceria con un solo ingrediente",
      "summary": "Confronta lo stesso dolce in due posti diversi.",
      "why_it_hits": "Assaggiare con attenzione rende più vividi i piaceri di tutti i giorni.",
      "instructions": "Scegli un prodotto (es. croissant, biscotto o empanada), compralo in due pasticcerie vicine, assaggia entrambi uno accanto all’altro e scegli il vincitore senza trasformarlo in un grande progetto.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Pausa alla fontana pubblica",
      "summary": "Siediti vicino a una fontana, un fiume o un elemento d'acqua.",
      "why_it_hits": "L'acqua in movimento attenua i rumori della città.",
      "instructions": "Trova un elemento d'acqua pubblico, siediti o fermati vicino per dieci minuti, guarda la superficie invece del telefono e nota come il suono cambia lo spazio.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il bar della tazza dimenticata",
      "summary": "Porta una tazza trascurata a casa di un amico per un tè.",
      "why_it_hits": "Oggetti piccoli possono creare rituali accoglienti.",
      "instructions": "Scegli una tazza che usi raramente, portala a casa di un amico o invitalo da te, prepara una bevanda calda e lascia che la tazza avvii una conversazione sui vecchi oggetti.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ascoltare opere in pubblico dominio",
      "summary": "Ascolta un vecchio radiodramma o un album in pubblico dominio all'aperto.",
      "why_it_hits": "L'audio d'epoca regala ai luoghi moderni una sensazione di scorrimento nel tempo.",
      "instructions": "Scarica una registrazione d'epoca gratuita, porta le cuffie in un parco o su una panchina, ascolta per venti minuti e immagina come lo stesso posto poteva apparire quando è stata realizzata.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Colazione in una traversa",
      "summary": "Fai colazione in un posto che hai sempre oltrepassato senza entrare.",
      "why_it_hits": "Una scoperta mattutina cambia il tono dell’intera giornata.",
      "instructions": "Scegli un bar, una tavola calda, una pasticceria o un chiosco modesto in una strada che usi poco, ordina una colazione o una bevanda e resta seduto abbastanza a lungo da vedere il quartiere svegliarsi.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Evento gratuito: prova veloce",
      "summary": "Partecipa ai primi trenta minuti di un evento locale gratuito.",
      "why_it_hits": "Un impegno ridotto rende più facile esplorare la comunità.",
      "instructions": "Controlla il calendario di una biblioteca, parco, università, galleria o centro comunitario, scegline uno gratuito per oggi, resta per trenta minuti e concediti il permesso di andartene cortesemente dopo.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "La deviazione del complimento",
      "summary": "Fai un complimento sincero a qualcuno che conosci già.",
      "why_it_hits": "La connessione cresce grazie al notare dettagli specifici.",
      "instructions": "Pensa a un amico, collega, vicino o familiare che vedrai o a cui scriverai oggi, offri un complimento concreto su qualcosa di reale ed evita di trasformarlo in una prestazione.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Gita con il taccuino",
      "summary": "Prendi appunti in un luogo pubblico per venti minuti.",
      "why_it_hits": "Osservare trasforma scene ordinarie in qualcosa di vivo.",
      "instructions": "Porta carta e penna, siediti in un bar, parco, atrio o stazione, annota frammenti sentiti senza identificare le persone, i colori, i movimenti e una domanda che il luogo suscita.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il museo più piccolo",
      "summary": "Visita un piccolo museo, un’archivio o una casa storica.",
      "why_it_hits": "Le piccole istituzioni spesso risultano intime e curiose.",
      "instructions": "Trova un piccolo museo locale aperto oggi, paga solo se rientra nel tuo budget, resta meno di un’ora e chiediti quale oggetto il luogo custodisca con più orgoglio, anche se non lo mostra apertamente.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Spuntino dall'altra parte della città",
      "summary": "Spostati in un quartiere diverso per uno spuntino.",
      "why_it_hits": "Un cibo può giustificare un piccolo viaggio.",
      "instructions": "Scegli uno spuntino economico noto in un altro quartiere, raggiungilo a piedi, in bici o con i mezzi, consumalo lì vicino e poi torna seguendo un percorso leggermente diverso.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "going_far"
      ]
    },
    {
      "title": "Resoconto meteorologico dal balcone o dalla finestra",
      "summary": "Osserva il cielo per quindici minuti di seguito.",
      "why_it_hits": "È tranquillo senza trasformarsi in un compito.",
      "instructions": "Siediti a una finestra, su un balcone, nello stipite o in una porta, osserva nuvole, luce, vento o ombre che passano e descrivi il tempo in una frase che suoni come una scena di film.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Frutta o verdura sconosciuta",
      "summary": "Compra e assaggia un frutto o una verdura che non conosci.",
      "why_it_hits": "La curiosità diventa commestibile.",
      "instructions": "Vai in un negozio o al mercato, scegli un prodotto che non conosci entro il tuo budget, chiedi o cerca come consumarlo in sicurezza, preparalo in modo semplice e decidi a chi potrebbe piacere.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Passeggiata fotografica con un amico",
      "summary": "Fai una passeggiata con un amico e fotografa solo texture.",
      "why_it_hits": "Una regola condivisa trasforma il vagare in gioco.",
      "instructions": "Incontratevi per trenta-sessanta minuti, camminate senza meta, ciascuno fotografi cinque texture come mattone, corteccia, tessuto, metallo o vernice scrostata, poi confrontate i preferiti davanti a una bevanda veloce o prima di salutarvi.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cinema dal finestrino dell'autobus",
      "summary": "Prendi un autobus per il panorama, non per arrivare da qualche parte.",
      "why_it_hits": "Il finestrino trasforma la città in un film in movimento.",
      "instructions": "Scegli una linea con servizio diurno sicuro, viaggia per venti-quaranta minuti, siediti accanto al finestrino, nota tre scene e scendi in un posto da cui sia facile tornare indietro.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Indagine su un solo ripiano",
      "summary": "Esplora un ripiano dei tuoi libri, giochi o dischi.",
      "why_it_hits": "Oggetti dimenticati possono sembrare appena prestati.",
      "instructions": "Scegli un singolo ripiano in casa, tocca ogni oggetto, scegli uno da riscoprire per quindici minuti e rimuovi o sposta qualcosa che non ha più posto lì.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Testimone al Microfono Aperto",
      "summary": "Assisti a un open mic come spettatore.",
      "why_it_hits": "La vulnerabilità è contagiosa anche dalla platea.",
      "instructions": "Trova un caffè, un bar, una libreria o un open mic della comunità, vai con un amico o da solo, resta per almeno tre performance, applaudi con entusiasmo e evita di giudicare come un critico.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "L'articolo più economico del menu",
      "summary": "Ordina l'opzione più economica in un posto di cucina nuovo per te.",
      "why_it_hits": "I limiti di budget rendono l'esplorazione accessibile.",
      "instructions": "Scegli un ristorante, food truck o caffè che non hai mai provato, ordina il cibo o la bevanda al prezzo più basso che desideri davvero e valuta il locale più per l'atmosfera che per il gusto.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Giro Lento nel Giardino Pubblico",
      "summary": "Fai un giro lento attraverso un giardino o uno spazio paesaggistico.",
      "why_it_hits": "La natura progettata ricompensa l’attenzione non frettolosa.",
      "instructions": "Visita un giardino pubblico, un campus, un cortile o aiuole in un parco, cammina lentamente per venti minuti, annusa le foglie o i fiori dove è consentito e scegli la pianta con la personalità migliore.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Roulette del negozio di dischi",
      "summary": "Ascolta un album scelto solo dalla copertina.",
      "why_it_hits": "Il gusto visivo ti guida verso nuovi suoni.",
      "instructions": "Vai in un negozio di dischi o nella sezione musica di una biblioteca, scegli un album basandoti solo sulla copertina, riproducilo o ascolta un'anteprima entro oggi e ascolta almeno tre brani senza saltarli.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bagliore del mercato notturno",
      "summary": "Visita un mercato serale o una via del cibo dopo il tramonto.",
      "why_it_hits": "La notte trasforma il commercio quotidiano in qualcosa di festoso.",
      "instructions": "Scegli un mercato notturno sicuro e vivace, una fila di food truck o una via commerciale illuminata; vai con qualcuno se preferisci, compra uno spuntino piccolo o limita‑ti a curiosare, e torna a casa prima di sentirti stanco.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Conversa sullo scalino",
      "summary": "Siediti fuori con qualcuno che abiti vicino a te o con cui vivi.",
      "why_it_hits": "Momenti dall’aria improvvisata possono rendere più profonde le connessioni naturali.",
      "instructions": "Invita un coinquilino, il partner, un vicino che conosci già o un amico a sedersi su uno scalino, un balcone, una panchina o un marciapiede per venti minuti con una bevanda e lasciare che la conversazione si sviluppi.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ingresso alternativo al negozio",
      "summary": "Entra in un negozio familiare da un lato o percorrendo un percorso diverso.",
      "why_it_hits": "Piccoli cambiamenti spaziali risvegliano l'attenzione.",
      "instructions": "Vai in un negozio che frequenti spesso, avvicinati da una strada o da un ingresso che usi raramente, acquista un solo articolo di cui hai bisogno e nota come ti sembra la disposizione vista da questo nuovo angolo.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Caccia al tesoro nei bollettini locali",
      "summary": "Segui un suggerimento preso da un bollettino di quartiere o da una bacheca.",
      "why_it_hits": "Ti mette in contatto con il calendario vivo della tua zona.",
      "instructions": "Controlla un bollettino locale, una parete di volantini, la bacheca della biblioteca o un sito della comunità, scegli un piccolo evento o annuncio in programma oggi e vai a vedere o visita brevemente il luogo menzionato.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Zuppa Più o Meno Fatta da Zero",
      "summary": "Prepara una zuppa semplice usando quello che hai già.",
      "why_it_hits": "Trasforma gli avanzi in calore e senso di abilità.",
      "instructions": "Cerca in cucina verdure, legumi, pasta, brodo o spezie; prepara una zuppa di base senza fare la spesa se possibile e mangiala nella tua ciotola migliore.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Monumento da un angolo insolito",
      "summary": "Visita un monumento noto e osservalo dal lato meno famoso.",
      "why_it_hits": "Sfida l’immagine da cartolina del luogo.",
      "instructions": "Vai a un monumento, statua o punto di riferimento pubblico, giralo completamente se è permesso, fermati dove i turisti raramente si pongono e nota riparazioni, retro, ombre e la vita quotidiana circostante.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Playlist per commissioni in coppia",
      "summary": "Create una colonna sonora in due per un'uscita noiosa.",
      "why_it_hits": "La musica trasforma una necessità in un piccolo rito.",
      "instructions": "Prima di andare a fare una commissione con un amico o il partner, scegliete ciascuno tre canzoni, fatele partire durante il tragitto e lasciate che ogni brano conquisti un tratto diverso del viaggio.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Chiedi dell’ingrediente locale",
      "summary": "Chiedi a un commerciante da cui stai già comprando come usare un ingrediente.",
      "why_it_hits": "La curiosità pratica apre a una connessione leggera.",
      "instructions": "In un mercato, salumeria, drogheria di spezie o banco alimentare, scegli un prodotto che non conosci, fai al personale una domanda semplice sul suo utilizzo mentre acquisti e prova il loro suggerimento oggi o a breve.",
      "goal_tags": [
        "novelty",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "talking_to_strangers"
      ]
    },
    {
      "title": "Eroe dei Rifiuti in Tasca",
      "summary": "Pulisci un piccolo spazio pubblico per dieci minuti.",
      "why_it_hits": "Produce un miglioramento visibile senza mettersi in mostra.",
      "instructions": "Porta guanti o un sacchetto, scegli un’area piccola e sicura come un marciapiede, il bordo di un parco o la facciata di un edificio; raccogli solo rifiuti sicuri per dieci minuti, smaltiscili correttamente e lavati le mani.",
      "goal_tags": [
        "momentum",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Spettacolo a Poco Prezzo",
      "summary": "Vai a uno spettacolo economico di studenti, della comunità o a una prova aperta.",
      "why_it_hits": "L’arte dal vivo rende una serata normale piena di energia.",
      "instructions": "Cerca un biglietto economico per lo stesso giorno, uno spettacolo a offerta libera, una performance in campus o una prova aperta; vai da solo o in compagnia, resta fino alla fine e commentate insieme un momento che vi ha colpito.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Vetrine con un tema",
      "summary": "Gironzola per i negozi senza comprare, seguendo un tema preciso.",
      "why_it_hits": "Trasforma il consumo in osservazione anziché automatismo.",
      "instructions": "Scegli una via con negozi, decidi un tema (es. lampade, giacche, quaderni o oggetti blu), osserva per trenta minuti e scegli il vincitore immaginario senza acquistare.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Capolinea in mezzi pubblici",
      "summary": "Vai fino al termine di una linea corta e torna indietro.",
      "why_it_hits": "I luoghi di termine rivelano cose in modo silenzioso.",
      "instructions": "Scegli una linea di bus o treno sicura e gestibile, percorri fino alla sua fermata finale di giorno, scendi per dieci minuti se l’area ti sembra tranquilla, poi torna indietro.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Osservare il profilo dei tetti al tramonto",
      "summary": "Guardare l’ultima luce toccare gli edifici.",
      "why_it_hits": "Trasforma la sera in un piccolo evento.",
      "instructions": "Trova un punto pubblico sicuro, una finestra, una collina, un ponte o un parcheggio con vista sui tetti, arrivaci prima del tramonto, osserva i colori cambiare per quindici minuti e vai via prima che faccia troppo freddo o sia troppo tardi.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Etichetta alimentare in lingua straniera",
      "summary": "Compra un alimento confezionato con l'etichetta parzialmente in un'altra lingua.",
      "why_it_hits": "Un prodotto nella dispensa si trasforma in una porta verso un'altra cultura.",
      "instructions": "Vai in un negozio internazionale o nel relativo reparto, scegli un prodotto modesto che riesci a capire abbastanza da usare in sicurezza, cerca sul dizionario una parola presente sull'etichetta e assaggialo o cucinalo oggi.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Riorganizza Un Angolo",
      "summary": "Cambia un angolo della casa per un giorno.",
      "why_it_hits": "Un piccolo cambiamento spaziale può rinfrescare l'attenzione.",
      "instructions": "Scegli una sedia, una pianta, una lampada, una pila d'oggetti o l'angolo di un tavolo, spostalo o sistemalo in meno di trenta minuti, usalo con la nuova disposizione almeno una volta oggi e lascia i restyling più grandi per un altro momento.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tour del quartiere di un amico",
      "summary": "Chiedi a un amico di mostrarti tre luoghi comuni vicino a lui.",
      "why_it_hits": "Conosci qualcuno attraverso la sua mappa quotidiana.",
      "instructions": "Vai nel quartiere di un amico, chiedigli di mostrarti una panchina preferita, un negozio, una scorciatoia, un albero o un belvedere; mantienilo sotto un'ora e un giorno mostrargli un luogo del tuo mondo.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia agli orologi pubblici",
      "summary": "Trova tre orologi pubblici e confronta il loro ",
      "why_it_hits": "La misurazione del tempo diventa architettura.",
      "instructions": "Passeggia per il centro, una stazione, un campus o un’area commerciale, cerca orologi su torri, pareti, insegne o display e decidi quale sembra più affidabile.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Esperimento in Unica Padella",
      "summary": "Prepara la cena usando soltanto una padella e senza seguire una ricetta.",
      "why_it_hits": "I vincoli creativi riducono l'affaticamento decisionale.",
      "instructions": "Scegli ingredienti che hai già o comprane due economici, prepara un pasto semplice in un'unica padella, condisci con coraggio ma in sicurezza e dai un nome al piatto anche se non è perfetto.",
      "goal_tags": [
        "creativity",
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Colpo di Scaffale Poetico",
      "summary": "Leggi tre poesie in una biblioteca o libreria.",
      "why_it_hits": "I testi brevi possono colpire forte in pochissimo tempo.",
      "instructions": "Trova la sezione di poesia, scegli un libro qualsiasi, leggi tre poesie in piedi o seduto, trascrivi a mano una riga se è permesso e te ne vai con quella riga nella testa.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Telefonata camminando all’aperto",
      "summary": "Chiama qualcuno mentre cammini fuori.",
      "why_it_hits": "Muoversi rende la conversazione più naturale.",
      "instructions": "Scegli una persona che già conosci, chiedi se ha quindici minuti, percorri un percorso tranquillo mentre parlate e chiudi la chiamata prima che uno dei due inizi a fare più cose contemporaneamente.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il cancello del parco mai usato",
      "summary": "Entra in un parco che conosci attraverso un cancello che non usi mai.",
      "why_it_hits": "Nuovi punti d'ingresso creano nuove storie.",
      "instructions": "Vai in un parco che conosci, avvicinati da un lato insolito, entra da lì, fai un giro che non hai mai fatto prima e, se possibile, esci da un punto diverso.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Degustazione sul Tavolo di Cucina",
      "summary": "Organizza una piccola degustazione di tre varianti dello stesso alimento.",
      "why_it_hits": "La comparazione focalizzata rende il cibo semplice un momento sociale.",
      "instructions": "Invita una o due persone oppure falla in solitaria, procurati tre tè, mele, patatine, formaggi, cioccolati o cracker, assaggiali fianco a fianco e inventa categorie oltre a migliore e peggiore.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Gita in cartoleria",
      "summary": "Visita il reparto cartoleria o articoli d’arte e prendi un unico strumento utile.",
      "why_it_hits": "I materiali invitano a creare in futuro senza imporlo.",
      "instructions": "Esplora una cartoleria, un discount o il reparto hobby/arte, scegli una sola penna, carta, nastro o cartellina con un piccolo budget e usala almeno una volta entro la fine della giornata.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Lettura sui gradini cittadini",
      "summary": "Leggi dieci pagine su gradini pubblici o in una piazza.",
      "why_it_hits": "Un atto privato diventa leggermente pubblico.",
      "instructions": "Porta un libro o una rivista in prestito, trova gradini pubblici sicuri, una panchina in piazza o un gradino di anfiteatro, leggi dieci pagine e alza lo sguardo tra una pagina e l’altra per assorbire l’ambiente.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Una nota di ringraziamento sincera",
      "summary": "Scrivi e consegna o invia un ringraziamento specifico.",
      "why_it_hits": "La gratitudine è più intensa quando ha un destinatario preciso.",
      "instructions": "Scegli qualcuno che ti ha aiutato in modo concreto, scrivi a mano o manda un messaggio di tre-cinque frasi, invialo oggi e non chiedere nulla in cambio.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Biografia di una Statua Strana",
      "summary": "Inventare la storia di vita di una statua pubblica o di una mascotte.",
      "why_it_hits": "Aggiunge una narrazione a un oggetto fisso.",
      "instructions": "Trova una statua, una figura da vetrina, un personaggio murale o una mascotte pubblica, osservane i dettagli per cinque minuti, poi crea una breve backstory su da dove viene e cosa desidera.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Prova del Taglio in Zona",
      "summary": "Verifica se un presunto percorso più breve lo è davvero.",
      "why_it_hits": "Trasforma l’efficienza in esplorazione.",
      "instructions": "Scegli due punti vicini tra cui ti muovi spesso, fai il solito percorso in andata e un possibile taglio al ritorno, cronometra entrambi in modo informale e decidi quale tratta offre il panorama migliore.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata tra le luci delle finestre serali",
      "summary": "Cammina dopo il crepuscolo osservando finestre e vetrine illuminate.",
      "why_it_hits": "La città diventa più intima di notte.",
      "instructions": "Scegli un percorso sicuro e ben illuminato e, se preferisci, vai con qualcuno; cammina per venti minuti, osserva i giochi di luce senza invadere la privacy e torna indietro prima che l'area si svuoti.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Prendi in prestito una dritta",
      "summary": "Fai in modo che un amico ti insegni una piccola abilità.",
      "why_it_hits": "Imparare è più bello quando è personale.",
      "instructions": "Chiedi a qualcuno di mostrarti una cosa semplice che sa fare, come preparare i ravioli, fare un nodo, un'apertura a scacchi, potare una pianta o impostare la fotocamera; esercitati per venti minuti e ringrazialo/a adeguatamente.",
      "goal_tags": [
        "connection",
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "with_other_people",
        "at_home",
        "near_home"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pulire un solo oggetto",
      "summary": "Pulisci un oggetto finché non sembra visibilmente migliore.",
      "why_it_hits": "Un piccolo brillio dà una soddisfazione immediata.",
      "instructions": "Scegli scarpe, una teiera, uno specchio, la catena della bici, la tastiera, il lavello o una lampada; pulisci solo quell'oggetto con prodotti sicuri, fermati quando il miglioramento è evidente e goditi il prima e dopo in privato.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Postura nella hall d'hotel",
      "summary": "Siediti per qualche minuto in una grande hall o atrio pubblico.",
      "why_it_hits": "Un'eleganza presa in prestito cambia il tuo passo.",
      "instructions": "Trova un hotel, un atrio d'ufficio, un centro commerciale o un edificio culturale dove sia permesso sedersi in pubblico, resta seduto per dieci minuti, osserva la coreografia degli arrivi e vai via rispettosamente senza fingere di essere un ospite.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Domanda al mercato contadino",
      "summary": "Chiedi a un venditore qual è il modo migliore per gustare qualcosa di stagione.",
      "why_it_hits": "La stagionalità diventa una conversazione, non un concetto.",
      "instructions": "Vai al mercato, compra o prendi in considerazione un prodotto economico, chiedi al venditore come gli piace prepararlo e prova l’idea o conservala per il prossimo pasto.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Giro delle due passerelle",
      "summary": "Fai un percorso a piedi che utilizzi due ponti o attraversamenti.",
      "why_it_hits": "I percorsi ad anello danno un senso di completezza e una lieve avventura.",
      "instructions": "Trova due attraversamenti sicuri sopra acqua, binari o una strada principale; percorri l’uno in uscita e ritorna sull’altro, fermandoti una volta per osservare il movimento sottostante.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Primo miglio senza telefono",
      "summary": "Inizia una passeggiata con il telefono nascosto per il primo miglio o i primi quindici minuti.",
      "why_it_hits": "Rompe il riflesso di mediare ogni cosa.",
      "instructions": "Scegli un percorso sicuro e familiare, silenzia e metti il telefono in tasca o nascosto, cammina fino al traguardo che hai scelto, poi controllalo solo se necessario e nota cosa la noia ha rivelato.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sfogliare il tabellone pubblicitario",
      "summary": "Leggi i volantini su una bacheca comunitaria.",
      "why_it_hits": "I volantini rivelano l'insolito ecosistema della vita locale.",
      "instructions": "Trova una bacheca in una biblioteca, caffè, campus, supermercato o centro comunitario, leggi almeno dieci volantini e scegli l'evento, l'oggetto smarrito o il servizio che ti sembra più intrigante.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola cerimonia del tè",
      "summary": "Prepara il tè con attenzione deliberata per te o per qualcun altro.",
      "why_it_hits": "Una bevanda comune si trasforma in un rituale silenzioso.",
      "instructions": "Scegli qualsiasi tè o erba, scalda l’acqua con cura, usa una tazza che ti piace, siediti mentre infonde e bevi senza fare nient’altro per i primi cinque minuti.",
      "goal_tags": [
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena da un'altra Finestra",
      "summary": "Prendi la cena da una finestra, un bancone o una bancarella di mercato.",
      "why_it_hits": "Cambiare il modo di comprare cambia la serata.",
      "instructions": "Scegli una finestra d'asporto economica, un carretto, un banco gastronomia o una bancarella di mercato che non hai ancora provato, ordina un solo piatto semplice e consumalo da qualche parte nei dintorni invece di correre a casa.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "talking_to_strangers",
        "nighttime"
      ]
    },
    {
      "title": "Piccola donazione",
      "summary": "Dona un oggetto utile a un punto di raccolta locale.",
      "why_it_hits": "Lasciare andare diventa un gesto che si rivolge agli altri.",
      "instructions": "Scegli un libro, un cappotto, un alimento per la dispensa o un oggetto domestico pulito e ancora utile, verifica che una cassettina o un negozio di beneficenza vicino lo accettino oggi, consegnalo e resisti alla tentazione di trasformarlo in una svendita totale.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Abbigliamento a Tema per il Tragitto",
      "summary": "Vesti seguendo un unico tema sottile per la giornata.",
      "why_it_hits": "Giocare privatamente con lo stile può cambiare la tua energia.",
      "instructions": "Scegli un tema discreto come il blu navy, il cinema d’epoca, il giardiniere, scarpe eleganti o texture morbide; crea un outfit con quello che già possiedi, indossalo per un’uscita normale e osserva come ti muovi.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena a Sorpresa con Ingrediente Segreto per Due",
      "summary": "Prepara o compra un piatto che contenga un ingrediente misterioso per un amico.",
      "why_it_hits": "Una piccola rivelazione aggiunge divertimento al mangiare insieme.",
      "instructions": "Invita una persona, prepara o compra uno spuntino semplice con un unico ingrediente segreto non allergenico, falla indovinare dopo l'assaggio, poi scambiatevi i ruoli un'altra volta se vi è piaciuto.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dieci gettoni da sala giochi",
      "summary": "Gioca a qualche vecchio cabinato o a una partita di flipper.",
      "why_it_hits": "I giochi fisici regalano divertimento immediato e vivace.",
      "instructions": "Trova una sala giochi, un barcade, una pista da bowling o una pizzeria con macchine, stabilisci un piccolo budget rigido, gioca finché non si esaurisce e festeggia una sciocca sconfitta.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Domanda al guardiaparco",
      "summary": "Chiedi a un operatore o volontario del parco una domanda pratica.",
      "why_it_hits": "La conoscenza locale fa vivere davvero un luogo.",
      "instructions": "In un parco, giardino, museo o centro natura, avvicinati solo se il personale è disponibile, chiedi di un sentiero, un albero, un uccello o una caratteristica del posto, ringrazia e metti in pratica un suggerimento se è facile.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Cena in Solitaria Migliorata",
      "summary": "Portati fuori a una cena modesta da solo.",
      "why_it_hits": "Essere a proprio agio da soli in pubblico è una piccola dimostrazione di fiducia silenziosa.",
      "instructions": "Scegli un posto informale che rientri nel tuo budget, chiedi un tavolo o uno sgabello al bancone, ordina qualcosa che ti va, stai lontano dal telefono per i primi dieci minuti e vai via quando sei soddisfatto.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Scatola dei Ricordi Ritrovati",
      "summary": "Raccogli cinque piccoli oggetti da casa che raccontino una storia.",
      "why_it_hits": "Le cose di tutti i giorni diventano reperti personali.",
      "instructions": "Scegli cinque oggetti più piccoli della tua mano, mettili insieme, scrivi o pronuncia una frase su ciascuno, poi rimettili a posto o conserva l'esposizione temporanea per un giorno.",
      "goal_tags": [
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lezione serale di prova",
      "summary": "Partecipa a una lezione per principianti, un workshop o una sessione di prova.",
      "why_it_hits": "Provare una stanza prima di impegnarsi riduce la pressione.",
      "instructions": "Cerca una lezione per principianti disponibile lo stesso giorno — danza, ceramica, lingua, yoga, scacchi o cucina — verifica costo e livello, partecipa con curiosità e lascia che essere alle prime armi faccia parte dell’esperienza.",
      "goal_tags": [
        "novelty",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "Censimento dei portabici",
      "summary": "Osserva cosa le bici in un’area rivelano sulla vita locale.",
      "why_it_hits": "L’infrastruttura ordinaria si trasforma in dato sociale.",
      "instructions": "Vai a una stazione, un campus o una via commerciale; osserva bici o monopattini per dieci minuti senza toccarli, nota lucchetti, cestini, adesivi e segni di usura e deduci di cosa hanno bisogno i loro proprietari.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un percorso nuovo per un vecchio amico",
      "summary": "Vai a trovare qualcuno seguendo un percorso che non hai mai preso.",
      "why_it_hits": "Connessione ed esplorazione si potenziano a vicenda.",
      "instructions": "Quando incontri un amico o un familiare, pianifica un percorso diverso in tram, a piedi o in bici, prevedi un po’ di tempo extra e racconta loro una cosa che hai visto durante il tragitto.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini missione linguistica",
      "summary": "Impara cinque parole utili legate a un luogo che visiti.",
      "why_it_hits": "La lingua dà profondità all'esplorazione.",
      "instructions": "Prima o durante la visita a un mercato internazionale, un ristorante, un centro culturale o un quartiere, impara cinque parole rilevanti, evita di usarne alcuna se non è appropriato e cercale su cartelli o etichette.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'ascensore più lento",
      "summary": "Prendi un vecchio ascensore pubblico solo per l'atmosfera.",
      "why_it_hits": "Gli spazi meccanici possono sembrare vere e proprie capsule del tempo.",
      "instructions": "Trova un ascensore pubblico sicuro in una biblioteca, grande magazzino, stazione o edificio storico, sali e scendi una volta con un reale motivo o accesso pubblico, e osserva suoni, pulsanti e ritmo.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Memo vocale all'amico",
      "summary": "Invia un breve messaggio vocale invece di un messaggio scritto.",
      "why_it_hits": "Ascoltare una voce aggiunge calore senza dover fissare un appuntamento.",
      "instructions": "Scegli qualcuno che ti piace davvero, registra un memo vocale di meno di un minuto con un piccolo aggiornamento o un ricordo, invialo e non preoccuparti di essere troppo perfetto.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Posa davanti a una scultura pubblica",
      "summary": "Specchia silenziosamente la posa di una statua o scultura.",
      "why_it_hits": "Porta umorismo nel corpo senza grandi rischi.",
      "instructions": "Trova una scultura pubblica, assicurati di non intralciare nessuno, mantieni una versione discreta della sua posa per dieci secondi e poi vai avanti con dignità o ridendo.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Poesia da scontrino",
      "summary": "Trasforma uno scontrino in una piccola poesia a casa o in un bar.",
      "why_it_hits": "Il linguaggio quotidiano diventa materia prima.",
      "instructions": "Conserva uno scontrino, cerchia le parole interessanti, riorganizzale o copiale in una breve poesia e tienila per te a meno che non ti vada di condividerla con una persona.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Osservare il porto o il deposito ferroviario",
      "summary": "Osserva una zona operativa della città da un punto pubblico sicuro.",
      "why_it_hits": "Vedere i sistemi in funzione può risultare sorprendentemente stimolante.",
      "instructions": "Trova un punto di osservazione accessibile e legale su un porto, un deposito ferroviario, un capolinea di autobus, l’avvicinamento di un aeroporto o un'area di carico; guarda per venti minuti e segui mentalmente come merci o persone si muovono nella scena.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Aggiornamento da un Dollaro",
      "summary": "Migliora una routine quotidiana con l'acquisto più piccolo possibile.",
      "why_it_hits": "I piccoli investimenti possono dare una soddisfazione sorprendentemente grande.",
      "instructions": "Stabilisci un budget molto basso, compra qualcosa come un limone, una candela, un gancio, un panno, un francobollo o una graffetta, e usalo oggi per migliorare un pasto, una stanza, una commissione o la scrivania.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Caccia alle bandiere del quartiere",
      "summary": "Osserva le bandiere, gli stendardi e i simboli intorno a te.",
      "why_it_hits": "L’identità pubblica diventa visibile non appena la osservi.",
      "instructions": "Cammina per qualche isolato, conta le bandiere, gli stendardi di squadre, i simboli religiosi, i cartelli civici o i festoni decorativi, e scegli quello la cui storia vuoi capire di più.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Invito per una sola tappa",
      "summary": "Invita qualcuno a unirsi a te per una sola fermata, bevanda o giro.",
      "why_it_hits": "Inviti piccoli sono più facili da accettare.",
      "instructions": "Manda un messaggio a qualcuno vicino con un'offerta specifica e senza pressioni, tipo un caffè, un giro al parco o una commissione; sii breve se dice di sì e goditi la compattezza.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "followed_impulses"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cabina Fotografica Vintage",
      "summary": "Fai una striscia di foto da solo o con qualcuno.",
      "why_it_hits": "La striscia fisica diventa un piccolo souvenir.",
      "instructions": "Trova una cabina fotografica in un centro commerciale, sala giochi, bar, stazione o cinema, paga solo se è ragionevole, scatta una striscia e tienila in un posto visibile o incornicia una copia per il tuo compagno.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Passeggiata con podcast locale",
      "summary": "Ascolta un episodio sulla tua città mentre ci cammini dentro.",
      "why_it_hits": "Il contesto sovrappone al luogo un significato nuovo.",
      "instructions": "Scegli un episodio su storia locale, cronaca, cibo o cultura, cammina in un luogo correlato o semplicemente nelle vicinanze, ascolta per venti-quaranta minuti e metti in pausa quando un luogo citato incrocia il tuo percorso.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Prova il pranzo del giorno",
      "summary": "Ordina uno speciale feriale che di solito salteresti.",
      "why_it_hits": "Lascia che sia il piano di qualcun altro a scegliere per te.",
      "instructions": "Vai in un ristorante informale, caffè, mensa o food truck, scegli lo speciale esposto se è compatibile con la tua dieta e il tuo budget e lascia che la sorpresa faccia parte del pasto.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Passeggiata delle Ombre Trovate",
      "summary": "Cerca ombre interessanti in un momento preciso della giornata.",
      "why_it_hits": "La luce trasforma la strada in arte temporanea.",
      "instructions": "Esci al mattino o nel tardo pomeriggio, cammina per venti minuti, osserva le ombre di recinzioni, alberi, cartelli e persone, e scegli quella più drammatica prima che scompaia.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tour della recinzione dell'orto comunitario",
      "summary": "Fai il giro di un orto comunitario e leggi i cartelli.",
      "why_it_hits": "Gli spazi di coltivazione condivisi mostrano la cura della comunità locale.",
      "instructions": "Trova un orto comunitario con sentieri pubblici o recinzioni visibili, visita con rispetto senza entrare nei lotti privati a meno che non sei invitato, leggi le regole esposte o i nomi sui cartelli e osserva cosa prospera.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il pasto del frigorifero quasi vuoto",
      "summary": "Prepara un pasto con gli ultimi avanzi prima di fare la spesa.",
      "why_it_hits": "La risorsa creativa dà soddisfazione e costa poco.",
      "instructions": "Controlla frigorifero e dispensa, scegli tre avanzi sparsi, trasformali in un toast, una ciotola, un'omelette, una pasta, un'insalata o una zuppa e evita di fare la spesa finché non hai mangiato.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Monumento locale all'ora blu",
      "summary": "Visita un monumento subito dopo il tramonto.",
      "why_it_hits": "L'ora blu rende i luoghi familiari cinematografici.",
      "instructions": "Scegli un monumento sicuro e ben illuminato, arriva intorno al crepuscolo con un amico se preferisci, resta per il progressivo approfondirsi del blu, assapora l'atmosfera e poi torna a casa prima che sia tardi.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Solo il negozio del museo",
      "summary": "Vai al negozio di un museo senza visitare le sale espositive.",
      "why_it_hits": "I negozi dei musei condensano l'essenza della cultura.",
      "instructions": "Scegli il negozio di un museo o di una galleria aperto al pubblico, sfoglia libri, cartoline, repliche e souvenir bizzarri, non comprare nulla o prendi un solo piccolo oggetto e deduci la personalità del museo.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La cena della domanda unica",
      "summary": "Condividi un pasto in cui ognuno risponde a una sola domanda vera.",
      "why_it_hits": "La struttura crea profondità senza appesantire.",
      "instructions": "Mangia con una o più persone, poni una domanda come quale luogo ti ha formato, quale oggetto salveresti o quale abilità invidi, e lascia che ognuno risponda senza discutere.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Reset del pavimento in quindici minuti",
      "summary": "Libera il pavimento visibile in una stanza.",
      "why_it_hits": "Un cambiamento fisico rapido può migliorare l'intero ambiente.",
      "instructions": "Imposta un timer di quindici minuti, raccogli solo gli oggetti sul pavimento di una stanza o di un corridoio, riponili o mettili in contenitori, e fermati quando il timer termina anche se la stanza non è perfetta.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Disegna un punto di riferimento del quartiere",
      "summary": "Disegna un monumento locale su una busta o su un foglio avanzato.",
      "why_it_hits": "Disegnare rende il luogo personale, non solo qualcosa da guardare.",
      "instructions": "Siediti in un punto da cui vedi un’insegna, una torre, un albero, un ponte o una cassetta postale; schizza per dieci minuti, aggiungi data e luogo e conserva o invia il disegno.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Fetta al Diner di Mezzanotte",
      "summary": "Prendi uno spuntino sicuro a tarda notte sotto le luci brillanti del diner.",
      "why_it_hits": "Il cibo notturno ha una storia tutta diversa.",
      "instructions": "Scegli un diner aperto fino a tardi, una pizzeria che vende singole fette o una gelateria in una zona trafficata e sicura, vai con qualcuno se possibile, ordina una sola porzione piccola e torna direttamente a casa dopo.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Prendi la scala mobile panoramica",
      "summary": "Trova una scala mobile, una rampa o una scalinata scenografica e salila o percorri a piedi.",
      "why_it_hits": "Il movimento urbano può essere sorprendentemente teatrale.",
      "instructions": "Vai in un centro commerciale, una stazione, un museo, una biblioteca o un edificio pubblico con un percorso verticale interessante, usalo con calma senza intralciare gli altri e osserva come cambia la vista mentre ti muovi.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Avventura con il manuale dimenticato",
      "summary": "Leggi il manuale di un dispositivo che possiedi già.",
      "why_it_hits": "Potresti scoprire una funzione nascosta sotto il tuo naso.",
      "instructions": "Scegli una fotocamera, un elettrodomestico, una luce per bici, un'impostazione di un'app o uno strumento, leggi la guida rapida o il manuale per quindici minuti e prova una funzione che non hai mai usato.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tagliere di formaggi e pane locale",
      "summary": "Prepara un piccolo tagliere comprando ingredienti da due negozi vicini.",
      "why_it_hits": "Rende la spesa quotidiana più curata e speciale.",
      "instructions": "Compra pane, formaggio, frutta, olive o cracker in uno o due negozi locali con un piccolo budget, sistema il tutto con cura a casa o in un parco e condividi se puoi.",
      "goal_tags": [
        "novelty",
        "creativity",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "L'ora degli uccelli",
      "summary": "Passa venti minuti a osservare gli uccelli da un unico punto.",
      "why_it_hits": "La fauna emerge quando smetti di correre.",
      "instructions": "Vai in un parco, sul lungomare, in un cortile o vicino a una finestra, resta fermo per venti minuti, identifica gli uccelli se riesci e concentrati sul loro comportamento più che sui nomi.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La cartolina mai spedita",
      "summary": "Scrivi una cartolina per il tuo io futuro e conservala.",
      "why_it_hits": "Cattura la giornata senza trasformarsi in un compito di diario.",
      "instructions": "Usa una cartolina o un cartoncino, scrivi dove sei, com'è il tempo e una cosa che vuoi ricordare, poi infilala in un libro o in un cassetto da ritrovare più avanti.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tetto Pubblico Senza Dramma",
      "summary": "Visita un tetto pubblico o una terrazza alta accessibile legalmente.",
      "why_it_hits": "L'elevazione dà alla vita di tutti i giorni una cornice più ampia.",
      "instructions": "Trova un giardino pensile pubblico, una terrazza di biblioteca, il piano di un centro commerciale o un belvedere, verifica che l'accesso sia consentito, passa dieci minuti guardando verso l'orizzonte ed evita tetti vietati o pericolosi.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola attrazione sulla strada",
      "summary": "Visita un singolare monumento locale o un oggetto sovradimensionato.",
      "why_it_hits": "I posti strani creano storie facili da raccontare.",
      "instructions": "Cerca un punto di interesse curioso ma legale nelle vicinanze — una statua, un cartello gigante, una targa storica o un edificio bizzarro — raggiungilo nei limiti delle tue possibilità, osservalo e impara un fatto su di esso.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pranzo con ricetta prestata",
      "summary": "Chiedi a un amico cosa cucina quando è stanco, poi falla tu.",
      "why_it_hits": "Le ricette di tutti i giorni rivelano vite vere.",
      "instructions": "Scrivi a qualcuno chiedendo il suo piatto più semplice e consolante, scegli quello che si adatta al tuo budget e alla tua dieta, cucinalo oggi e torna a raccontare con un grazie e una valutazione del grado di conforto.",
      "goal_tags": [
        "connection",
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Strada familiare al contrario",
      "summary": "Percorri un percorso abituale nella direzione opposta.",
      "why_it_hits": "Invertire il senso fa emergere i dettagli.",
      "instructions": "Scegli un percorso che percorri spesso, parti dal solito punto di arrivo, procedi lentamente verso l’inizio e osserva cartelli, alberi, finestre e pendenze che di solito ti sfuggono.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Conferma dal Cartellone",
      "summary": "Impegnati per un evento futuro trovato oggi su un volantino.",
      "why_it_hits": "Un piccolo impegno semina una novità futura.",
      "instructions": "Sfoglia un cartellone locale o un calendario online, scegli un evento nelle prossime due settimane che ti interessi davvero, segnalo sul tuo calendario e invita una sola persona solo se ti è d'aiuto.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La scelta senza menu",
      "summary": "Lascia che un amico di fiducia scelga il tuo ordine al bar.",
      "why_it_hits": "Affidare una piccola decisione dà una sensazione di leggerezza.",
      "instructions": "Vai con qualcuno che conosca i tuoi limiti alimentari, lascia che scelga una bevanda o uno snack per te entro un budget, accettalo con garbo e scambiatevi i ruoli se lui/lei vuole.",
      "goal_tags": [
        "novelty",
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Camminata fino alla cassetta postale",
      "summary": "Vai a una cassetta postale più lontana per inviare qualcosa di piccolo.",
      "why_it_hits": "Una commissione si trasforma in una passeggiata intenzionale.",
      "instructions": "Scrivi un biglietto, restituisci un modulo o imbuca una cartolina: scegli una cassetta postale più lontana di quella più vicina, camminaci fino, imbuca la cosa e torna con un percorso diverso.",
      "goal_tags": [
        "novelty",
        "momentum",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Lavoretto in Un'Ora con Materiali Presi in Prestito",
      "summary": "Prova un lavoretto usando materiali presi in prestito o di casa.",
      "why_it_hits": "Creare con limiti riduce il perfezionismo.",
      "instructions": "Usa carta, filo, cartone, nastro, ritagli di stoffa o materiali presi in prestito per realizzare un piccolo oggetto in meno di un'ora, poi esponilo o usalo oggi.",
      "goal_tags": [
        "creativity",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Scacchi all'aperto",
      "summary": "Guarda o gioca una partita informale di scacchi in pubblico.",
      "why_it_hits": "La strategia in pubblico ha un'intensità discreta.",
      "instructions": "Trova un parco, una biblioteca, un bar o uno spazio comunitario con tavoli o scacchiere, osserva con rispetto o gioca una partita a basso rischio, e vattene prima che la competitività prenda il sopravvento.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tuffo negli annunci dei giornali",
      "summary": "Leggi annunci economici, bacheche comunitarie o \"missed connections\".",
      "why_it_hits": "I piccoli annunci rivelano trame umane nascoste.",
      "instructions": "Trova un giornale locale o un sito web, sfoglia gli annunci per quindici minuti, scegli l'annuncio o l'avviso più intrigante e immagina la scena che lo circonda.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La playlist dimenticata",
      "summary": "Ascolta una vecchia playlist mentre rivisiti un luogo che le si abbina.",
      "why_it_hits": "La musica può comprimere il tempo in modo potente.",
      "instructions": "Scegli una playlist di una stagione passata della tua vita, fai una passeggiata o un tragitto con i mezzi mentre la ascolti, e visita un luogo che corrisponde a quell’epoca se è facile e sicuro farlo.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena con una sfida innocua",
      "summary": "Permetti a ciascuno di aggiungere una piccola regola a un pasto condiviso.",
      "why_it_hits": "Le regole provocano risate senza creare caos.",
      "instructions": "Mangia con amici o famiglia, lascia che ognuno proponga una regola leggera come niente telefoni, usare posate diverse a turno, o descrivere il cibo come critici, e mantienila gentile.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social",
        "creative"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Evento alla biblioteca locale",
      "summary": "Partecipa a una conferenza, a un club, a una dimostrazione o a una proiezione in biblioteca.",
      "why_it_hits": "Le biblioteche rendono il provare cose nuove sorprendentemente senza pressione.",
      "instructions": "Controlla il calendario della biblioteca di oggi, scegli un evento gratuito e aperto a tutti, resta per almeno metà della durata e poi sfoglia uno scaffale correlato.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "La camminata più breve",
      "summary": "Trova un sentiero naturale sotto il miglio e completalo.",
      "why_it_hits": "Regala la soddisfazione dell’aria aperta senza dover affrontare un’escursione lunga.",
      "instructions": "Cerca un sentiero breve e sicuro o un anello in un parco vicino, porta acqua e scarpe adatte, percorri il tragitto a passo tranquillo e fermati per osservare un panorama o una pianta lungo il percorso.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccolo archivio di stile",
      "summary": "Chiedi a qualcuno che conosci di raccontarti un capo d'abbigliamento che ha conservato.",
      "why_it_hits": "I vestiti racchiudono identità e ricordi.",
      "instructions": "Invita un amico o un familiare a mostrarti un capo, un accessorio o un paio di scarpe vecchio, chiedi da dove proviene e, se ti va, condividi anche un tuo oggetto.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appunti sul Campione Gratuito",
      "summary": "Assaggia un campione o un demo gratuito e prenditi un momento per considerarlo davvero.",
      "why_it_hits": "Una piccola offerta pubblica diventa un atto consapevole e sociale.",
      "instructions": "Vai in un mercato o in un negozio che offre assaggi senza pressione, prova uno se è disponibile e sicuro per te, ringrazia la persona e decidi se il sapore ti ha sorpreso.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Etichetta del Museo per un Oggetto",
      "summary": "Scrivi un'etichetta museale per qualcosa che hai in casa.",
      "why_it_hits": "Trasforma i tuoi oggetti in reperti.",
      "instructions": "Scegli un oggetto comune, scrivi una breve etichetta con titolo, data o stima, materiale, provenienza e significato; posizionala accanto all'oggetto per un giorno.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia alla Collina del Quartiere",
      "summary": "Trova il punto più alto nei dintorni che puoi raggiungere in sicurezza.",
      "why_it_hits": "Una vista regala una piccola sensazione di conquista.",
      "instructions": "Usa una mappa o la vista per individuare una collina, un cavalcavia, un rialzo nel parco o una via in quota, cammina lì a passo comodo, osserva il panorama e torna prima di stancarti.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "Osservare il foyer del cinema",
      "summary": "Vai nel foyer di un cinema e scegli un film che vorresti vedere in futuro.",
      "why_it_hits": "L’attesa ha il suo piacere.",
      "instructions": "Entra in un cinema, guarda i manifesti e gli orari senza comprare un biglietto, scegli un film che ti piacerebbe davvero vedere e annota chi potrebbe venirci con te.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Scambio di libri tra amici",
      "summary": "Scambia per una settimana un libro, un fumetto o una rivista con qualcuno.",
      "why_it_hits": "Il gusto diventa qualcosa di condiviso.",
      "instructions": "Chiedi a un amico di scambiare qualcosa da leggere, consegnatevelo di persona se possibile, spiega perché hai scelto il tuo e leggi almeno cinque pagine del loro oggi.",
      "goal_tags": [
        "connection",
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "with_other_people",
        "solo",
        "at_home"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ballo in Meno di Dieci Minuti",
      "summary": "Metti tre canzoni e balla a casa o all'aperto in un posto privato.",
      "why_it_hits": "Ravviva l’energia in fretta senza richiedere abilità.",
      "instructions": "Scegli tre brani, libera un piccolo spazio, muoviti come ti va per tutta la durata e, se sei all’aperto, trova un luogo privato o poco frequentato dove ti senti a tuo agio.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caffè in stazione",
      "summary": "Bevi un caffè o un tè in stazione senza allontanarti troppo.",
      "why_it_hits": "Le stazioni evocano possibilità anche quando resti vicino a casa.",
      "instructions": "Vai in una stazione di treni, autobus o traghetti con posti a sedere pubblici, compra o porta una bevanda, siediti per quindici minuti a guardare le partenze e immagina un viaggio che potresti fare un giorno.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pranzo dei cinque sensi",
      "summary": "Pranza all'aperto e nota una volta per ogni senso.",
      "why_it_hits": "Rende un pasto normale più vivido.",
      "instructions": "Porta il pranzo su una panchina, in un cortile, su uno scalino o al parco; nota un elemento visivo, uno sonoro, un odore, una sensazione al tatto e un sapore, poi termina il pasto normalmente senza trasformarlo in un esercizio.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un Tabù Nuovo, con Tatto",
      "summary": "Parla con una persona cara di una domanda poco comune ma sicura.",
      "why_it_hits": "L’intimità cresce quando la conversazione esce dall’autopilota.",
      "instructions": "Con una persona di fiducia, poni una domanda insolita e delicata, per esempio in quale epoca ti piacerebbe vivere, quale lavoro sembra segretamente difficile o quale abitudine familiare ti ha formato, e ascolta senza interrogare.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Test della finestra sui materiali artistici",
      "summary": "Scegli un colore che ti attira e usalo oggi.",
      "why_it_hits": "Il colore può indirizzare la creatività in modo immediato.",
      "instructions": "Vai in un reparto di articoli per arte, bricolage o cancelleria o usa i materiali che hai a casa, scegli un colore, fai un piccolo segno, una nota, uno scarabocchio, un dettaglio nell’outfit o un elemento del pasto costruito attorno a quel colore.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia all’ospite del podcast locale",
      "summary": "Trova una persona locale citata online e visita il suo lavoro pubblico.",
      "why_it_hits": "Collega i nomi a luoghi concreti.",
      "instructions": "Ascolta o leggi un’intervista locale, scegli un ospite che abbia un negozio, un murale, un libro, un menu o un progetto accessibile al pubblico, visita o prova qualcosa oggi se è raggiungibile e mantieni aspettative modeste.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mercato mattutino prima del caos",
      "summary": "Arriva in un mercato proprio all'apertura.",
      "why_it_hits": "Le prime ore svelano l'energia dei preparativi.",
      "instructions": "Controlla l'orario di apertura di un mercato contadino, un mercato delle pulci o una food hall, presentati vicino all'orario d'apertura, fai un giro completo a piedi prima di comprare e osserva cosa fanno i venditori prima che arrivino le folle.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La piccola scusa",
      "summary": "Fai una sincera scusa per una cosa piccola e reale.",
      "why_it_hits": "Elimina la tensione accumulata in una relazione.",
      "instructions": "Scegli un episodio minuto di cui ti dispiace davvero, invia o pronuncia una breve scusa senza scuse né richieste di rassicurazione, poi lascia che l’altra persona risponda o no.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ingresso di Vecchi Edifici",
      "summary": "Cerca ingressi belli o insoliti in una zona più antica.",
      "why_it_hits": "Le porte suggeriscono vite che si svolgono dietro di esse.",
      "instructions": "Cammina lungo una via con edifici più vecchi alla luce del giorno, fotografa o semplicemente osserva porte, maniglie, piastrelle, citofoni e soglie da spazio pubblico e scegli il tuo ingresso preferito.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Imitatore di cooking show",
      "summary": "Prepara la versione più semplice di una ricetta vista in un video di cucina senza comprare attrezzi particolari.",
      "why_it_hits": "Guardare si trasforma in fare prima che l’ispirazione svanisca.",
      "instructions": "Scegli un video di cucina breve con ingredienti basilari, semplificalo se serve, cucinalo oggi e accetta una versione approssimativa invece di cercare la perfezione.",
      "goal_tags": [
        "creativity",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'esibizione di cinque minuti",
      "summary": "Esegui una canzone, una poesia o una lettura per una persona di fiducia.",
      "why_it_hits": "Un pubblico minuscolo rende l'espressione autentica.",
      "instructions": "Scegli qualcosa che duri meno di cinque minuti, invita qualcuno gentile ad ascoltare, esibisciti senza scusarti in anticipo e lascia che il momento si chiuda con un ringraziamento invece che con una critica.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mappa della città senza GPS",
      "summary": "Percorri un breve tragitto usando le mappe esposte o la memoria.",
      "why_it_hits": "Ricostruisce la fiducia nel tuo senso dell'orientamento.",
      "instructions": "Scegli una destinazione semplice e a portata di mano, metti via il GPS dopo aver controllato le indicazioni di base, orientati con i cartelli stradali, i punti di riferimento e le mappe dei mezzi pubblici, e usa il telefono solo se sei davvero perso.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Rinfresca la mensola stagionale",
      "summary": "Metti un oggetto stagionale da poter vedere.",
      "why_it_hits": "Segna il passare del tempo in modo tangibile.",
      "instructions": "Trova o compra a poco prezzo un oggetto stagionale — per esempio agrumi, pigna, fiore, conchiglia, candela, foglia o tessuto — posizionalo su una mensola o un tavolo e lascia che cambi l'atmosfera della stanza.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lettura ad alta voce in pubblico",
      "summary": "Leggi ad alta voce un breve brano in un luogo tranquillo all'aperto.",
      "why_it_hits": "La tua voce all'aria aperta suona diversa.",
      "instructions": "Scegli una poesia, una lettera, una pagina o un discorso, trova un angolo del parco poco frequentato o una riva tranquilla, leggilo ad alta voce una volta con voce bassa e nota quale verso ti sembra più bello da pronunciare.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il regalo di un solo negozio",
      "summary": "Compra o crea un piccolo regalo in un unico negozio vicino.",
      "why_it_hits": "La generosità specifica è sentita, vivace e concreta.",
      "instructions": "Pensa a qualcuno, vai in un solo negozio (o usa un’unica fonte di materiale), scegli un oggetto piccolo sotto un budget stabilito che gli si addica, e consegnalo o spedisci senza aspettare un’occasione.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia al Cortile Nascosto",
      "summary": "Trova un cortile pubblico, un atrio o una piccola piazza interna.",
      "why_it_hits": "Gli spazi semi-nascosti danno la sensazione di segreti urbani.",
      "instructions": "Cammina per il centro, il campus, un ospedale, un quartiere museale o una zona commerciale, cerca spazi interni accessibili al pubblico, siediti per cinque minuti in uno e rispetta tutte le regole esposte.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata dei ricordi in due",
      "summary": "Passate davanti a un luogo legato a un ricordo condiviso.",
      "why_it_hits": "Il luogo aiuta i ricordi a riaffiorare in modo naturale.",
      "instructions": "Invita qualcuno legato a una scuola, un lavoro, un ristorante, un parco o un vecchio quartiere di appartamenti, passateci insieme se possibile e scambiatevi i dettagli che ciascuno ricorda in modo diverso.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Giro al Centro Commerciale senza Compere",
      "summary": "Attraversa il centro commerciale come se fosse una promenade a clima controllato.",
      "why_it_hits": "Gli spazi commerciali si trasformano in paesaggi sociali.",
      "instructions": "Vai in un centro commerciale o in una galleria, stabilisci una regola di nulla comprare o di solo piccoli acquisti, percorri entrambi i piani o le ali, osserva le persone rispettosamente e scegli la vetrina con l’atmosfera più intensa.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "low_energy"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Reset della Colonna Sonora di Casa",
      "summary": "Ascolta un album intero mentre non fai nulla di produttivo.",
      "why_it_hits": "Ridà alla musica tutta la tua attenzione.",
      "instructions": "Scegli un album che non conosci bene o che amavi una volta, siediti o sdraiati, ascolta dall'inizio alla fine o almeno un lato, e evita di scorrere durante le prime tre tracce.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Giro di Zuppe nel Quartiere",
      "summary": "Prova la zuppa di un locale vicino e gustala con calma.",
      "why_it_hits": "La zuppa è conforto che porta con sé il sapore di un luogo.",
      "instructions": "Trova una zuppa economica in un bar, gastronomia, mercato o ristorante, consumala lì o nei dintorni, presta attenzione al brodo, alla consistenza e al calore, e segnati il posto per i giorni freddi.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Lezione di Disegno da Dominio Pubblico",
      "summary": "Segui una lezione gratuita online in un parco o in biblioteca.",
      "why_it_hits": "Esercitare una abilità fuori casa fa sentire meno rinchiusi.",
      "instructions": "Trova un breve tutorial di disegno gratuito, porta carta e matita a un tavolo in biblioteca, su una panchina al parco o in un bar, seguilo per venti minuti e conserva il risultato indipendentemente dalla qualità.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata serale con regole",
      "summary": "Cammina al crepuscolo seguendo una regola sensoriale.",
      "why_it_hits": "Una regola rende vivido il giorno che svanisce.",
      "instructions": "Scegli un percorso sicuro, decidi una regola come seguire le luci calde, dirigerti verso la musica o notare i riflessi, cammina per venti minuti e fermati se l’area ti sembra poco sicura.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Tuffo con le dita in piscina pubblica",
      "summary": "Visita brevemente una piscina pubblica, una spiaggia o un'area con spruzzi.",
      "why_it_hits": "L'acqua cambia la percezione del corpo rispetto alla giornata.",
      "instructions": "Controlla orari e costi, porta l'essenziale, nuota o semplicemente siediti con i piedi vicino all'acqua per trenta-sessanta minuti e vai via prima che l'uscita diventi una messinscena.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Alla ricerca della specialità locale",
      "summary": "Scopri un cibo tipico della tua zona e assaggiane una versione semplice.",
      "why_it_hits": "Collega il gusto all'identità del luogo.",
      "instructions": "Cerca online o chiedi quale piatto, pasticcino, bevanda o ingrediente è tipico della tua zona, acquista una versione economica e impara una frase sulla sua origine.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Appuntamento silenzioso in libreria",
      "summary": "Sfogliare libri accanto a qualcuno senza parlare per quindici minuti.",
      "why_it_hits": "Il silenzio condiviso può risultare intimo.",
      "instructions": "Vai in libreria o in biblioteca con un amico o un partner, separatevi o sfogliate fianco a fianco in silenzio, scegliete ciascuno un libro da mostrare all’altro, poi parlate dopo.",
      "goal_tags": [
        "connection",
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Da rifiuto a risorsa",
      "summary": "Trasforma un contenitore riciclabile in qualcosa di utile.",
      "why_it_hits": "Ricavare utilità con l’improvvisazione è silenziosamente appagante.",
      "instructions": "Scegli un barattolo, una scatola, una latta o una busta puliti, elimina le etichette se vuoi, trasformali in contenitore, vaso, vaso per piante o kit da viaggio e usali oggi stesso.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Carta jolly: conferenza pubblica",
      "summary": "Partecipa a una conferenza su un argomento di cui sai quasi nulla.",
      "why_it_hits": "Una competenza sconosciuta può rivelarsi sorprendentemente stimolante.",
      "instructions": "Cerca oggi una conferenza in un’università, biblioteca, museo o libreria, scegli un tema lontano dalle tue conoscenze, resta per la parte principale e annota un termine da approfondire dopo.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Attraversare un confine vicino",
      "summary": "Attraversa intenzionalmente il confine di un quartiere, distretto o paese.",
      "why_it_hits": "Linee invisibili diventano parte della tua mappa mentale.",
      "instructions": "Individua un confine vicino su una mappa, attraversalo a piedi, in bici o con i mezzi, nota se qualcosa cambia e fermati un attimo appena oltre la linea.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cocktail o Mocktail in Tre Ingredienti",
      "summary": "Prepara una bevanda semplice con tre ingredienti.",
      "why_it_hits": "Dona un tocco di cerimonia a una serata qualunque.",
      "instructions": "Usa quello che hai o compra un ingrediente economico, combina tre ingredienti sicuri in un cocktail, mocktail, spritz o tè, servi con cura e dagli il nome del giorno.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata tra i manifesti teatrali",
      "summary": "Cerca manifesti di spettacoli dal vivo e scegli un biglietto immaginario.",
      "why_it_hits": "I manifesti svelano il battito creativo della città.",
      "instructions": "Cammina vicino a teatri, campus, caffè o quartieri artistici, leggi manifesti e volantini degli spettacoli, scegli quello a cui parteciperesti se avessi tempo e soldi, e annotane la data.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pagina Casuale di Ricettario",
      "summary": "Apri un ricettario a caso e prepara qualcosa ispirato a quella pagina.",
      "why_it_hits": "La casualità evita l'indecisione su cosa cucinare.",
      "instructions": "Usa un ricettario tuo o della biblioteca, aprilo a caso, scegli la ricetta o l'elemento più vicino e fattibile, prepara oggi una versione semplificata e non compra ingredienti difficili da trovare.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sotto il cielo: individua una cosa",
      "summary": "Esci di notte e identifica un oggetto celeste.",
      "why_it_hits": "Il cielo allarga la giornata senza bisogno di viaggiare.",
      "instructions": "Scegli un luogo sicuro per osservare, usa un’app di astronomia o una guida semplice, riconosci la fase della Luna, un pianeta, una costellazione o una stella luminosa, poi guarda senza l’app per un minuto intero.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Fai attenzione alle porte che si chiudono",
      "summary": "Trascorri quindici minuti in una stazione osservando le partenze.",
      "why_it_hits": "Le partenze creano piccole scene emotive.",
      "instructions": "Vai in una stazione di trasporto, siediti dove è consentito, guarda partire treni, autobus o traghetti, nota gesti e tempi, e allontanati prima che l'osservazione diventi invadente.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un piccolo ringraziamento pubblico",
      "summary": "Ringrazia qualcuno il cui lavoro di solito ignori silenziosamente.",
      "why_it_hits": "Aggiunge calore alle interazioni di tutti i giorni.",
      "instructions": "Durante un’interazione normale con un cassiere, autista, addetto alle pulizie, bibliotecario, receptionist o barista, esprimi un ringraziamento breve e specifico, poi vai avanti senza cercare di prolungare la conversazione.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Gita per la pianta d’appartamento",
      "summary": "Porta all’esterno una pianta per farle prendere luce fresca o per pulirla.",
      "why_it_hits": "La cura diventa visibile e leggermente comica.",
      "instructions": "Se è sicuro per la pianta, portala su un balcone, gradino, cortile o vicino a una finestra, pulisci le foglie o annaffiala, lasciala un momento nella luce adatta e riportala dentro.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola scansione d'archivio",
      "summary": "Digitalizza o fotografa cinque vecchi fogli o foto.",
      "why_it_hits": "Conservare frammenti offre al passato un rifugio più sicuro.",
      "instructions": "Scegli cinque foto, lettere, ricette, biglietti o documenti significativi, fotografali o scansiona in buona luce, etichettali in modo semplice e riponi gli originali con cura.",
      "goal_tags": [
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ingrediente Colazione Insolito",
      "summary": "Aggiungi una nota salata, dolce o piccante alla colazione.",
      "why_it_hits": "Una novità mattutina è a basso costo e ha effetto immediato.",
      "instructions": "Prendi o compra un piccolo ingrediente che non usi quasi mai a colazione—per esempio chili crisp, erbe, tahini, sottaceti, frutti di bosco o miso—aggiungilo a un pasto semplice e assaggia senza fare altro.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Albero preferito in strada",
      "summary": "Scegli un albero preferito lungo un percorso vicino a te.",
      "why_it_hits": "I luoghi che frequenti diventano più personali quando scegli dei preferiti.",
      "instructions": "Cammina per una strada che conosci bene, osserva attentamente tronco, corteccia, foglie, radici e forma, scegli un albero come preferito del giorno e nota la sua presenza la prossima volta che passi.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Uscita con le scarpe lucidate",
      "summary": "Pulisci le scarpe, poi portale in un posto qualunque.",
      "why_it_hits": "Un piccolo miglioramento cambia la sensazione di essere pronti.",
      "instructions": "Pulisci, lucida o allaccia un paio di scarpe, poi indossale per una breve commissione, un caffè o una passeggiata e nota se il dettaglio curato cambia il tuo portamento.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Fiori Economici per un Tavolo Condiviso",
      "summary": "Porta un piccolo fiore o un rametto a un pasto o a una postazione condivisa.",
      "why_it_hits": "Una bellezza discreta può cambiare l’atmosfera di un luogo sociale.",
      "instructions": "Compra un gambo economico o raccogli legalmente del verde caduto, mettilo in un barattolo su un tavolo condiviso, in cucina o a un picnic, e lascia che resti semplice invece che cercare una perfezione decorativa.",
      "goal_tags": [
        "connection",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Biografia di un oggetto al mercatino",
      "summary": "Vai a un mercatino dell’usato e inventa la storia di tre oggetti.",
      "why_it_hits": "Gli oggetti usati sembrano implorare di avere una storia.",
      "instructions": "Vai a un mercatino delle pulci, a un negozio di antiquariato o al reparto dell’usato, scegli tre oggetti senza doverli comprare e immagina chi li ha posseduti e perché li ha lasciati andare.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un nuovo tratto di lungomare",
      "summary": "Cammina lungo un tratto di banchina o riva che non hai mai percorso.",
      "why_it_hits": "I confini tra terra e acqua hanno un effetto rigenerante.",
      "instructions": "Trova un percorso lungo un fiume, lago, canale, porto o stagno, scegli un tratto sicuro e poco familiare, cammina per trenta minuti e fermati una volta ad osservare l’acqua da vicino.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il piatto economico preferito di un amico",
      "summary": "Prova il pasto economico che un amico raccomanda a voce.",
      "why_it_hits": "I consigli sembrano conoscenza locale condivisa.",
      "instructions": "Chiedi a qualcuno qual è il suo piatto economico preferito nei dintorni o facile da ordinare ovunque, provalo oggi se possibile e manda loro la tua reazione onesta ma gentile.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Ombra della Ferrovia Sopraelevata",
      "summary": "Cammina sotto o accanto a binari sopraelevati alla luce del giorno.",
      "why_it_hits": "Le infrastrutture conferiscono alle strade un'atmosfera intensa.",
      "instructions": "Scegli un percorso pubblico sicuro sotto ferrovie sopraelevate, autostrade o linee tranviarie, cammina per quindici-trenta minuti alla luce del giorno e osserva il ritmo, l'ombra, le colonne e le attività che vivono sotto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'ora della radio d'altri tempi",
      "summary": "Ascolta la radio locale in diretta mentre guidi, cammini o cucini.",
      "why_it_hits": "Le trasmissioni creano un presente condiviso.",
      "instructions": "Sintonizzati su una stazione locale che ascolti raramente, ascolta per trenta minuti senza saltare e annota un annuncio, una canzone, un chiamante o una frase del conduttore che la leghi al tuo territorio.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Staffetta di scrittura in due caffè",
      "summary": "Componi un appunto in un caffè e concludilo in un altro.",
      "why_it_hits": "Cambiare ambiente cambia il pensiero.",
      "instructions": "Inizia una lettera, una lista, una scena o un piano sorseggiando una bevanda economica o dell’acqua dove è consentito; spostati in un secondo luogo pubblico, concludi lì il testo e mantieni il tempo totale sotto un’ora.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Micro allenamento all'aperto",
      "summary": "Usa con leggerezza un attrezzo fitness esterno.",
      "why_it_hits": "Rende il movimento giocoso e alla portata di tutti.",
      "instructions": "Trova una stazione fitness nel parco, una sbarra per trazioni, una trave di equilibrio o un segnapercorso, esegui un unico movimento sicuro a bassa intensità per cinque minuti e fermati prima che compaiano sforzo o imbarazzo.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La missione degli applausi",
      "summary": "Vai in un luogo dove applaudire impegno dal vivo.",
      "why_it_hits": "L'incoraggiamento connesso all'applauso ti avvicina al coraggio degli altri.",
      "instructions": "Partecipa a un recital, open mic, partita scolastica, spettacolo di strada o evento comunitario; resta abbastanza a lungo da applaudire qualcuno e rendi il tuo applauso generoso ma appropriato.",
      "goal_tags": [
        "connection",
        "better_stories",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Sezione del giornale che non conosci",
      "summary": "Leggi una sezione del giornale che di solito ignori.",
      "why_it_hits": "Cambia la tua dieta informativa senza un grande impegno.",
      "instructions": "Trova un giornale o un sito di notizie, scegli una sezione come necrologi, agricoltura, cultura, economia o tribunali locali, leggi per quindici minuti e riassumi un fatto curioso a qualcuno.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena a lume di candela locale",
      "summary": "Mangia una cena semplice a lume di candela o con una lampada soffusa a casa.",
      "why_it_hits": "L'atmosfera fa sembrare intenzionale anche un pasto ordinario.",
      "instructions": "Usa una candela in modo sicuro o una lampada calda, prepara o ordina un pasto modesto, metti via il telefono per i primi dieci minuti e lascia che la stanza sembri un posto diverso.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Mappa dei complimenti per i mezzi pubblici",
      "summary": "Osserva tre elementi di buon design sui mezzi pubblici.",
      "why_it_hits": "Apprezzare i sistemi riduce le irritazioni quotidiane.",
      "instructions": "Su un autobus, treno, tram o in una stazione, cerca segnali utili, maniglie, sedili, colori, mappe o soluzioni di accessibilità, scegli tre che funzionano bene e nota una cosa che non funziona.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un vecchio blog locale",
      "summary": "Segui una raccomandazione presa da un vecchio post su un blog locale.",
      "why_it_hits": "Internet datato può condurre a posti inaspettati.",
      "instructions": "Cerca un blog o un articolo locale di qualche anno fa, scegli un bar, una passeggiata, un negozio o un punto di riferimento ancora esistente, vai a visitarlo e confronta la descrizione di allora con com'è oggi.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Raccolta di frasi di famiglia",
      "summary": "Chiedi a un parente o a una persona cara quale frase usavano quando era giovane.",
      "why_it_hits": "Piccole frasi racchiudono intere storie.",
      "instructions": "Chiama o manda un messaggio a qualcuno che conosci bene, chiedi quale frase, proverbio, battuta o avvertimento sentiva spesso durante l’infanzia, annotala e chiedi in quali occasioni la usavano.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il giro delle mini biblioteche libere",
      "summary": "Visita tre mini biblioteche libere o punti di scambio libri.",
      "why_it_hits": "Questi piccoli scambi pubblici hanno un’atmosfera di vicinato.",
      "instructions": "Segui la mappa o vagabonda fino a tre cassette di libri, sfoglia senza prendere più di quanto userai, lascia un libro se ne hai uno e annota la personalità di ogni cassettina.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Schizzo lampo al museo",
      "summary": "Schizza un oggetto del museo per dieci minuti.",
      "why_it_hits": "Disegnare rende la visita più profonda rispetto al semplice guardare.",
      "instructions": "Visita un museo o una galleria gratuito o economico, scegli un oggetto, schizzalo per dieci minuti da una panchina o in piedi e leggi la didascalia solo dopo aver disegnato.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il colloquio all'uscita del supermercato",
      "summary": "Dopo la spesa, siediti fuori e osserva cosa portano le persone.",
      "why_it_hits": "Svela la logistica quotidiana di un luogo.",
      "instructions": "Compra un solo articolo necessario, siediti in sicurezza fuori dal negozio per dieci minuti, nota borse, carrelli, fiori, cibo per animali e volti affrettati senza fissare nessuno, poi torna a casa.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Sentiero locale con i mezzi",
      "summary": "Raggiungi un piccolo angolo di natura senza usare l’auto.",
      "why_it_hits": "Dimostra che una fuga è davvero alla portata di tutti.",
      "instructions": "Scegli un parco, un sentiero, una spiaggia o un fiume raggiungibile con i mezzi: prepara acqua e il biglietto, resta lì da trenta a novanta minuti e organizza il rientro prima di rimanere senza copertura o energie.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Merenda d'infanzia condivisa",
      "summary": "Scambiatevi snack dell'infanzia con un amico.",
      "why_it_hits": "La nostalgia del cibo apre facilmente a conversazioni personali.",
      "instructions": "Ognuno porta o compra uno snack che adorava da bambino, assaggiate entrambi, raccontate la storia che gli è legata e accettate che lo snack possa essere oggettivamente pessimo.",
      "goal_tags": [
        "fun",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il museo in un cassetto",
      "summary": "Trasforma un cassetto in una mostra temporanea.",
      "why_it_hits": "Ordinare diventa narrazione invece di pulizia.",
      "instructions": "Apri un cassetto, scegli cinque oggetti interessanti al suo interno, sistemali su un tavolo con un tema libero, rimuovi un oggetto che non c’entra, poi richiudi il cassetto.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Succursale di biblioteca diversa",
      "summary": "Visita una succursale della biblioteca che non hai mai frequentato.",
      "why_it_hits": "Stessa istituzione, personalità di quartiere diversa.",
      "instructions": "Trova una succursale raggiungibile, stai lì per venti-dieciquaranta minuti, esplora le esposizioni, le aree di lettura e la bacheca della comunità, e prendi in prestito o fotografa il numero di classificazione di un elemento che ti attira.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pasto in piedi da street food",
      "summary": "Mangia un piccolo pasto in piedi dove stanno i locali.",
      "why_it_hits": "È immediato e radicato nel luogo.",
      "instructions": "Scegli un chiosco, bancarella, finestra di panetteria o negozio di pizza a taglio rinomato, ordina un solo alimento, consumalo nel punto vicino accettato senza intralciare nessuno e osserva il ritmo dei clienti abituali.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Siediti al sole",
      "summary": "Trova una macchia di sole e siediti lì per un po'.",
      "why_it_hits": "Un po' di calore semplice può trasformare la giornata in fretta.",
      "instructions": "A casa, in un parco o vicino a una finestra, trova una macchia di sole comoda, siediti per dieci minuti proteggendo la pelle se necessario e non fare altro che notare la luce.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Riconsegna l’oggetto",
      "summary": "Rendi indietro qualcosa che hai preso in prestito o che dovevi restituire.",
      "why_it_hits": "Portare a termine l’azione ristabilisce fiducia e libera la mente dal disordine mentale.",
      "instructions": "Scegli un oggetto preso in prestito — contenitore, libro, utensile o capo d’abbigliamento — organizza oggi una semplice consegna o un drop-off e aggiungi un breve ringraziamento se è in ritardo.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sbircata in uno studio aperto",
      "summary": "Vai a uno studio d'artista aperto, a un vernissage o a un tour di uno spazio per maker.",
      "why_it_hits": "Vedere opere in corso toglie il mistero dalla creatività.",
      "instructions": "Trova un evento gratuito o a basso costo (studio aperto o apertura di galleria), resta per trenta minuti, osserva materiali e processi e fai una domanda solo se ti viene naturale.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mappa delle scale del quartiere",
      "summary": "Trova tre scale o rampe all'aperto.",
      "why_it_hits": "Passaggi verticali svelano la struttura nascosta della città.",
      "instructions": "Cammina in una zona collinare o fitta alla luce del giorno, trova tre scale pubbliche, rampe o sentieri con gradini, usa almeno una di esse e segnala quella più utile per le passeggiate future.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "Il test del posto migliore",
      "summary": "Prova tre posti nello stesso luogo pubblico.",
      "why_it_hits": "Scegliere il posto con intenzione cambia il livello di comfort.",
      "instructions": "In una biblioteca, piazza, caffetteria, parco o stazione, siediti brevemente in tre posti consentiti, confronta vista, rumore, luce e privacy, poi fermati nel migliore per dieci minuti.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appuntamento con budget minimo",
      "summary": "Organizza un’uscita in due con un budget davvero ridotto.",
      "why_it_hits": "I vincoli possono rendere la connessione più creativa.",
      "instructions": "Stabilisci un budget totale basso insieme a un amico o partner; combina una passeggiata, uno snack da condividere, una vista gratuita o un evento pubblico e dedica più attenzione che denaro.",
      "goal_tags": [
        "connection",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cucina fuori dalla ricetta",
      "summary": "Cambia un ingrediente in un piatto che conosci bene.",
      "why_it_hits": "Aggiunge creatività senza mettere del tutto a rischio la cena.",
      "instructions": "Prepara qualcosa che già sai fare, sostituisci o aggiungi un ingrediente che hai già, lascia il resto invariato e decidi se la variazione merita un posto nella versione permanente.",
      "goal_tags": [
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia ai simboli nel cimitero locale",
      "summary": "Cerca simboli ricorrenti in un cimitero antico.",
      "why_it_hits": "I motivi visivi rivelano la storia culturale.",
      "instructions": "Visita con rispetto durante l’orario di apertura, osserva fiori scolpiti, mani, uccelli, libri, ancore o segni militari; scegli un simbolo da approfondire dopo la visita e non disturbare i lutti.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Karaoke di una canzone",
      "summary": "Canta una canzone al karaoke, da solo o in un locale.",
      "why_it_hits": "Una breve esibizione può farti sentire incredibilmente vivo.",
      "instructions": "Scegli una canzone che conosci abbastanza, canta a casa, in una stanza privata o a una serata karaoke amichevole, impegnati a cantare l'intero brano e evita di autocriticarti dopo.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Confronto caffè da angolo",
      "summary": "Prova il caffè di un piccolo locale vicino.",
      "why_it_hits": "I posti di tutti i giorni possono sorprenderti.",
      "instructions": "Compra un caffè o un tè piccolo in un negozio all’angolo, distributore di benzina, chiosco o salumeria che hai sempre ignorato; bevilo fuori o durante una passeggiata e valutalo in base all’utilità, non al lusso.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Caccia al menu scritto a mano",
      "summary": "Trova un menu, un cartello o una lavagna con scritte a mano.",
      "why_it_hits": "I cartelli scritti a mano trasmettono immediatezza e umanità.",
      "instructions": "Passeggia per una via di mercato o una zona di ristorazione, cerca specialità o cartelli scritti a mano, scegli quello più invitante o curioso e compralo solo se rientra nel tuo budget.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Corsia dell'infanzia",
      "summary": "Vai nella corsia dei giocattoli, dei cereali o delle forniture scolastiche e osserva i ricordi che emergono.",
      "why_it_hits": "Gli oggetti possono riaprire la porta alle versioni di te di una volta.",
      "instructions": "Entra in un negozio, passa dieci minuti a curiosare in una corsia che evoca l'infanzia, individua un oggetto che scatena un ricordo e vai via senza comprare, a meno che non ti piaccia davvero.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Provare il pianoforte pubblico",
      "summary": "Suona qualche nota su un pianoforte pubblico, se disponibile.",
      "why_it_hits": "È un leggero contatto con l'espressione in pubblico.",
      "instructions": "Trova un pianoforte pubblico in una stazione, biblioteca, centro commerciale o per strada; suona una melodia semplice o poche note quando è permesso e non disturbi, poi lascia spazio a qualcun altro.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Le origini del nome del quartiere",
      "summary": "Scopri perché un quartiere o una strada si chiama così.",
      "why_it_hits": "I nomi smettono di essere rumore di fondo.",
      "instructions": "Scegli il nome di una via, di un parco o di un rione nelle vicinanze, cerca l’origine da una fonte attendibile, poi vai lì o passa davanti al cartello e ripeti la storia a te stesso o a qualcun altro.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Generosità di Quartiere",
      "summary": "Fai un piccolo gesto utile nel tuo isolato.",
      "why_it_hits": "La cura sembra più reale quando ha un luogo concreto.",
      "instructions": "Scegli un gesto semplice come spazzare i gradini in comune, rientrare un bidone, annaffiare una fioriera pubblica se consentito o lasciare un biglietto gentile a un vicino che conosci, e mantienilo modesto.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bagliore della biblioteca notturna",
      "summary": "Vai in biblioteca durante le ore serali.",
      "why_it_hits": "Gli spazi pubblici silenziosi hanno un'atmosfera diversa dopo il tramonto.",
      "instructions": "Scegli una biblioteca aperta dopo il tramonto in una zona sicura, sfoglia libri o leggi per trenta minuti, osserva il pubblico serale e vai via con il tempo necessario per tornare a casa con calma.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Tour dei Piattini",
      "summary": "Condividi due piccoli piatti in due locali diversi e vicini.",
      "why_it_hits": "Fa sembrare la cena una passeggiata urbana.",
      "instructions": "Vai con una o due persone, scegli due posti economici e vicini, ordina un piccolo piatto o uno snack in ciascuno, cammina fra di loro e tieni il tour breve.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Lettera dalla Cassetta",
      "summary": "Scrivi a qualcuno riguardo a un ricordo che avete in comune.",
      "why_it_hits": "I ricordi specifici rafforzano le relazioni.",
      "instructions": "Scegli una persona e un ricordo che potreste apprezzare entrambi, scrivi una breve lettera o un biglietto descrivendo una scena, spedisci il tutto o fotografalo e invialo oggi.",
      "goal_tags": [
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ora gratuita per un nuovo hobby",
      "summary": "Approfitta di un incontro introduttivo, di una prova gratuita o di un’ora aperta in uno spazio per hobby.",
      "why_it_hits": "Provare riduce la pressione di dover diventare subito “una persona da hobby”.",
      "instructions": "Cerca una palestra di arrampicata, una scuola di danza, un makerspace, una sala di meditazione, un gruppo di conversazione linguistica o un negozio di artigianato con un’opzione introduttiva; controlla sicurezza e costi, partecipa una volta e oggi non prendere impegni.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Prova di Camminata in Negozio di Scarpe",
      "summary": "Prova un modello di scarpa che normalmente non indosseresti.",
      "why_it_hits": "La curiosità incarnata batte il gusto astratto.",
      "instructions": "Entra in un negozio di scarpe, prova un paio fuori dal tuo solito stile rispettando le regole del negozio, cammina qualche passo, osserva come cambiano la tua postura e non comprare nulla a meno che non fosse previsto.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata nei luoghi di un vecchio film",
      "summary": "Visita un luogo pubblico usato in un film o in una serie.",
      "why_it_hits": "La finzione si sovrappone alla realtà in modo divertente.",
      "instructions": "Cerca un luogo di ripresa vicino a te che sia pubblico e sicuro, vai a visitarlo, confronta la versione vista in camera con la realtà e non disturbare residenti o attività commerciali.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La panchina del diario in una frase",
      "summary": "Scrivi una frase su oggi, seduto su una panchina.",
      "why_it_hits": "Cattura la vita senza trasformarsi in una pratica impegnativa.",
      "instructions": "Trova una panchina pubblica o un posto all'aperto, siediti per cinque minuti, scrivi una frase che potrebbe appartenere solo a oggi, poi riponi il biglietto.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Via Centrale del Paese vicino",
      "summary": "Fai un breve viaggio al centro di un paese vicino.",
      "why_it_hits": "Spostarsi un po' più lontano può dare la sensazione di viaggiare davvero.",
      "instructions": "Scegli un paese o quartiere vicino raggiungibile oggi, trascorri uno-due ore a piedi sulla sua via principale, compra uno snack economico o guarda vetrine gratuitamente, e torna prima che la logistica diventi faticosa.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Alla ricerca della mascotte locale",
      "summary": "Trova una mascotte di scuola, squadra, negozio o città nel suo ambiente naturale.",
      "why_it_hits": "Le mascotte rivelano l’umorismo e l’orgoglio locali.",
      "instructions": "Cammina o esplora intorno a scuole, campi sportivi, negozi o edifici pubblici, individua una mascotte su un'insegna, statua, murale o adesivo e decidi se è adorabile o inquietante.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lava-vetri di cinque minuti",
      "summary": "Pulisci una finestra o uno specchio e guardaci attraverso.",
      "why_it_hits": "Un vetro pulito dà una gratificazione visiva immediata.",
      "instructions": "Scegli una finestra o uno specchio, puliscilo in sicurezza con i prodotti che hai, poi dedica un minuto a guardare attraverso o dentro come se fosse appena stato montato.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caffè dello scambio di competenze",
      "summary": "Scambiatevi piccoli consigli con un amico davanti a un drink.",
      "why_it_hits": "Tutti hanno la possibilità di rendersi utili, anche solo per un attimo.",
      "instructions": "Incontratevi o fate una chiamata: ognuno porti una piccola domanda su cui l’altro può aiutare. Limitate i consigli a dieci minuti a testa e usate il resto del tempo per aggiornamenti e chiacchiere.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "followed_impulses"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Luci del traghetto serali",
      "summary": "Fai un giro in barca o lungo il lungomare dopo il tramonto.",
      "why_it_hits": "I riflessi rendono la notte più ampia e suggestiva.",
      "instructions": "Scegli un traghetto pubblico, un battello sul fiume o una passeggiata sul lungomare sicuri e frequentati la sera; vai con qualcuno se preferisci; godevi le luci per un percorso breve e torna direttamente.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Caccia allo zine locale",
      "summary": "Trova uno zine, un dépliant o una pubblicazione indipendente.",
      "why_it_hits": "L’editoria fai-da-te rivela la corrente sotterranea della città.",
      "instructions": "Vai in una libreria, un caffè, un negozio di dischi, una biblioteca o uno spazio d’arte dove è probabile trovare zine, sfoglia brevemente, compra un oggetto economico o prendi un dépliant gratuito e leggilo oggi.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Rinfrescare il profumo di una stanza",
      "summary": "Cambia naturalmente il profumo di una stanza.",
      "why_it_hits": "L'olfatto modifica l'umore in modo rapido e sottile.",
      "instructions": "Apri una finestra, fai sobbollire agrumi o erbe, prepara del caffè, accendi una candela sicura o porta dei fiori: concentrati su una stanza e nota il primo istante in cui l'aria ha un odore diverso.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiri Liberi al Campo Pubblico",
      "summary": "Fai dieci tiri liberi in un campo pubblico.",
      "why_it_hits": "Una piccola sfida nitida aggiunge gioco fisico.",
      "instructions": "Porta o prendi in prestito un pallone, vai in un campo pubblico quando non è affollato, tira dieci tiri liberi o tiri facili, conta i canestri senza giudicarti e lascia il campo ai giocatori attivi.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mappa dei primi personali",
      "summary": "Vai o segna tre luoghi dove hai fatto qualcosa per la prima volta.",
      "why_it_hits": "La tua storia personale diventa una mappa.",
      "instructions": "Pensa al primo lavoro, al primo appartamento, al primo appuntamento, alla prima lezione, al primo grande acquisto o al primo amico in città: visita un luogo o segnane tre sulla mappa e richiama brevemente la scena.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cucina per il freezer",
      "summary": "Prepara una porzione in più per il tuo futuro io.",
      "why_it_hits": "È un regalo fatto senza cerimonie.",
      "instructions": "Prepara un pasto semplice, fai volontariamente una porzione in più, etichettala e mettila in frigorifero o nel congelatore, e immagina la versione stanca di te che la troverà.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tipografia dei cartelli del quartiere",
      "summary": "Osserva gli stili di lettering sui cartelli vecchi e nuovi.",
      "why_it_hits": "I caratteri rivelano epoche e personalità.",
      "instructions": "Cammina su una via commerciale, guarda dieci cartelli, confronta lettering dipinto a mano, al neon, in plastica, serif e digitale, e scegli il cartello che meglio si adatta alla sua attività.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Audioguida Inaspettata in Museo",
      "summary": "Usa un’audioguida o un’app per un’opera o una sezione.",
      "why_it_hits": "Una voce può svelare dettagli che altrimenti ti sfuggirebbero.",
      "instructions": "In un museo, sito storico o percorso di arte pubblica, usa un’audioguida gratuita o economica per una sola sezione, ascolta fino alla fine, poi osserva in silenzio per qualche minuto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "La buona penna",
      "summary": "Usa la tua penna migliore per scrivere un appunto ordinario.",
      "why_it_hits": "Strumenti piacevoli fanno sentire la comunicazione più intenzionale.",
      "instructions": "Scegli la tua penna preferita o comprane una economica ma scorrevole, scrivi a mano un appunto, una lista, una cartolina o una ricetta, e consegnalo, imbucalo o lascialo in un posto utile oggi.",
      "goal_tags": [
        "connection",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Picnic sul Ponte",
      "summary": "Mangia uno spuntino vicino a un ponte, lontano dalle carreggiate.",
      "why_it_hits": "I ponti danno un tocco di drammaticità anche a cibi semplici.",
      "instructions": "Scegli un ponte pedonale sicuro, una riva o un parco con vista sul ponte, porta uno spuntino, siediti dove è permesso, osserva il passaggio per dieci minuti e porta via i rifiuti.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cena con un ingrediente locale",
      "summary": "Prepara un piatto usando un ingrediente coltivato o prodotto nelle vicinanze.",
      "why_it_hits": "La cena si collega al luogo.",
      "instructions": "Compra una verdura, un pane, un formaggio, una salsa, una birra, del miele o del tofu locale nel tuo budget, cucinalo o servilo in modo semplice e racconta a chi mangia da dove proviene.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "group_social_situations"
      ]
    },
    {
      "title": "Primo autobus/treno della giornata",
      "summary": "Prendi un autobus o un treno mattutino e fermati dopo poche corse.",
      "why_it_hits": "I mezzi nelle prime ore hanno un'atmosfera precisa e concentrata.",
      "instructions": "Controlla gli orari, scegli una tratta sicura e breve, osserva chi è già in movimento, prendi una bevanda calda se vuoi, poi torna o prosegui con la giornata.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "L'insalata senza ricetta",
      "summary": "Prepara un'insalata basandoti sulle texture, non sulle istruzioni.",
      "why_it_hits": "Fa sentire il mangiare creativo e nuovo.",
      "instructions": "Scegli tra quello che hai o da un negozio economico qualcosa di croccante, morbido, deciso, ricco e brillante, combinali, condisci semplicemente e dai un nome alla texture che preferisci.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sedersi su un molo pubblico",
      "summary": "Siediti su un molo, un pontile o un bordo d’acqua pubblico e sicuro.",
      "why_it_hits": "I fronti d’acqua invitano alla riflessione senza pretenderla.",
      "instructions": "Trova un molo, un pontile, una panchina in marina o un muro di contenimento pubblico e consentito, siediti per quindici minuti, osserva barche, uccelli o increspature e mantieniti a distanza di sicurezza dal bordo.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Micro-riunione con un vecchio amico",
      "summary": "Incontra qualcuno che non vedi da tempo per esattamente un'ora.",
      "why_it_hits": "Un tempo limitato rende la riconnessione più semplice.",
      "instructions": "Invita un vecchio amico o conoscente per un caffè, una passeggiata o un pranzo con una chiara finestra di un'ora, chiedi cosa è cambiato dall'ultima volta e concludi prima che diventi vago.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Aggiorna le etichette in cucina",
      "summary": "Etichetta chiaramente tre contenitori, ripiani o cavi.",
      "why_it_hits": "Un piccolo ordine riduce attriti futuri.",
      "instructions": "Usa nastro, carta o etichette che hai a disposizione, segnala tre cose che spesso creano confusione—per esempio spezie, avanzi, caricabatterie o barattoli della dispensa—e fermati dopo tre.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Giro lento a un vernissage gratuito",
      "summary": "Partecipa all'inaugurazione di una galleria e fai un giro lento.",
      "why_it_hits": "I vernissage uniscono l'osservare le persone e la cultura.",
      "instructions": "Trova un inaugurazione o un ricevimento pubblico, arriva presto se le folle ti danno fastidio, cammina lentamente per la sala, guarda ogni opera una volta e vai via senza sentirti obbligato a fare networking.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "La migliore toilette pubblica",
      "summary": "Trova il bagno pubblico più pulito o interessante in una zona.",
      "why_it_hits": "È pratico, divertente e stranamente rivelatore.",
      "instructions": "Quando sei in un centro commerciale, museo, biblioteca, stazione o grande negozio, confronta due o tre bagni a cui puoi accedere: valuta pulizia, design e praticità, e segnati il vincitore.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Rotta delle Spezie da Cinque Dollari",
      "summary": "Spendi un piccolo budget in una drogheria internazionale o in un negozio di spezie.",
      "why_it_hits": "L'esplorazione dei sapori resta economica e vivida.",
      "instructions": "Stabilisci un importo molto limitato, guarda tra spezie, salse, tè o snack, compra un solo articolo che puoi usare oggi e annusalo o assaggialo prima di aggiungerlo al cibo.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "L'intervista all'oggetto di tutti i giorni",
      "summary": "Chiedi a qualcuno di cui ti fidi di un oggetto che usa quotidianamente.",
      "why_it_hits": "Gli oggetti di tutti i giorni rivelano abitudini e valori.",
      "instructions": "Chiedi a un coinquilino, partner, collega o familiare del loro borsa, tazza, portachiavi, quaderno o strumento, ascolta la storia e condividi la tua se ti viene chiesto.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cammina fino al codice postale successivo",
      "summary": "Attraversa un’area postale vicina e torna indietro.",
      "why_it_hits": "Rende tangibile un confine invisibile.",
      "instructions": "Controlla una mappa per il limite del codice postale più vicino, cammina o usa un mezzo fino lì in sicurezza, attraversalo, nota eventuali cambiamenti nei cartelli o negli edifici e torna indietro percorrendo una strada diversa.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccolo teatro a casa",
      "summary": "Guarda un cortometraggio con la stanza allestita come un cinema.",
      "why_it_hits": "L’atmosfera trasforma uno schermo familiare.",
      "instructions": "Scegli un cortometraggio sotto i trenta minuti, abbassa le luci, prepara uno snack, silenzia il telefono, guarda senza mettere in pausa e poi parla o scrivi una reazione.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ascolta lo strumento all’angolo",
      "summary": "Ascolta un musicista di strada per un brano intero.",
      "why_it_hits": "Rende giustizia alla musica dal vivo, mostrandola come qualcosa di più che semplice sottofondo.",
      "instructions": "Se incontri un musicista di strada in un luogo pubblico sicuro, fermati per un brano completo, lascia una mancia se puoi e vuoi, e nota cosa cambia quando smetti di camminare.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caccia a uno stile architettonico locale",
      "summary": "Trova tre esempi della stessa caratteristica architettonica.",
      "why_it_hits": "I pattern rendono le strade più leggibili.",
      "instructions": "Scegli una caratteristica come archi, bow window, mattoni, balconi, colonne, piastrelle o scale di emergenza, cammina finché non trovi tre esempi e decidi quale edificio la porta meglio.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Invito per la colazione",
      "summary": "Invita qualcuno a incontrarsi prima che la giornata si faccia intensa.",
      "why_it_hits": "Una connessione mattutina sa di speciale in modo discreto.",
      "instructions": "Chiedi a un amico, collega o vicino che conosci se vuole vederti per una colazione veloce, un cornetto o una passeggiata; tienila sotto i quarantacinque minuti e goditi il momento insolito.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata per svuotare una tasca",
      "summary": "Svuota una tasca, una taschetta della borsa o una sezione del portafoglio all'aperto.",
      "why_it_hits": "L'aria fresca rende il piccolo riordino meno noioso.",
      "instructions": "Porta la borsa o la giacca su una panchina o a un tavolo all'aperto, svuota un scomparto, butta via i rifiuti, tieni ciò che conta e fermati prima che diventi un rinnovamento completo della borsa.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Enigma di Scacchi in Pubblico",
      "summary": "Risolvi un enigma preso da un libro o da un'app in un luogo pubblico.",
      "why_it_hits": "Una piccola sfida mentale ha un sapore diverso quando la fai all'aperto.",
      "instructions": "Porta un libro di enigmi o un'app in un bar, biblioteca, parco o durante un viaggio in tram/metro, risolvi un singolo enigma di scacchi, cruciverba, logica o parole e fermati dopo uno se vuoi.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Upgrade del piatto da asporto",
      "summary": "Servi il cibo d'asporto su veri piatti aggiungendo un piccolo dettaglio.",
      "why_it_hits": "Trasforma la praticità in un pasto curato.",
      "instructions": "Compra un modesto asporto o riscalda gli avanzi, impiatta con cura a casa o su un tavolo da picnic, aggiungi erbe, limone, salsa o un tovagliolo di stoffa e mangia seduto.",
      "goal_tags": [
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata nell'hotel storico",
      "summary": "Attraversa le aree pubbliche di un hotel storico.",
      "why_it_hits": "Gli spazi antichi dell'accoglienza sembrano teatrali e stratificati.",
      "instructions": "Trova un hotel noto per la sua storia con aree pubbliche accessibili, entra con rispetto, osserva i dettagli della hall, le foto o le esposizioni, prendi un caffè solo se vuoi ed evita le aree riservate agli ospiti.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Volontariato Rapido",
      "summary": "Fai un turno volontario breve e già organizzato o un compito a ingresso libero.",
      "why_it_hits": "Aiutare dà energia quando l'impegno è chiaro e limitato.",
      "instructions": "Scegli un'organizzazione seria che offra turni nello stesso giorno o di breve durata come smistamento cibo, pulizia di un parco o allestimento di eventi, verifica i requisiti, presentati puntuale e mantieni l'impegno sostenibile.",
      "goal_tags": [
        "connection",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers",
        "group_social_situations"
      ]
    },
    {
      "title": "Prova il Cappello Più Buffo",
      "summary": "Prova un cappello o un accessorio fuori dal tuo stile abituale.",
      "why_it_hits": "Un piccolo esercizio di imbarazzo controllato può essere divertente.",
      "instructions": "Vai in un negozio dell’usato, nel reparto costumi o in un negozio di cappelli con un amico o da solo, prova un accessorio insolito con rispetto, osserva la tua reazione e non comprare nulla a meno che non ti entusiasmi.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ricordo d'odore cittadino",
      "summary": "Trova un odore che ti ricordi un altro luogo.",
      "why_it_hits": "L'olfatto collega subito geografia e memoria.",
      "instructions": "Cammina lungo una strada di cibo, un parco, un'area di lavanderie, un isolato di panetterie o un lungomare, individua un odore che ti trasporta e nomina il luogo o il periodo che ti richiama.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il Caffè della Prima Pagina",
      "summary": "Inizia un libro nuovo in un bar e fermati dopo il primo capitolo.",
      "why_it_hits": "Ogni inizio ha una scintilla tutta sua.",
      "instructions": "Porta o prendi in prestito un libro che non hai ancora iniziato, siediti con una bevanda o dell’acqua dove è consentito, leggi solo il primo capitolo e decidi se merita un altro incontro.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Ritratti in pubblico con parole",
      "summary": "Descrivi tre persone evitando giudizi sull'aspetto.",
      "why_it_hits": "Affina l'osservazione con rispetto.",
      "instructions": "Su un mezzo o in stazione, annota privatamente tre descrizioni in una frase basate su azioni, oggetti, postura o umore; evita dettagli identificativi e poi cancellale o conservale per te.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Chiamata per una vecchia ricetta",
      "summary": "Chiamare qualcuno per chiedere come prepara un piatto.",
      "why_it_hits": "Le ricette diventano un motivo per connettersi.",
      "instructions": "Scegli un piatto legato a qualcuno che conosci, chiamalo o mandagli un messaggio per chiedere il suo metodo, fai una domanda di approfondimento e cucina o programma il piatto senza pretendere misure esatte.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "creative"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Seduta su Amaca Piccola o Coperta",
      "summary": "Porta una coperta al parco e resta lì seduto.",
      "why_it_hits": "Stare comodi all’aperto sembra una mini vacanza.",
      "instructions": "Metti in borsa una coperta o un tappetino piccolo, scegli un posto al parco o in spiaggia, siediti o sdraiati per trenta minuti, porta un libro o uno snack se vuoi, e non lasciare tracce.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La proiezione dell'ultimo minuto",
      "summary": "Scegli un film che inizi entro l'ora successiva.",
      "why_it_hits": "La spontaneità trasforma una giornata qualunque.",
      "instructions": "Controlla i cinema o le proiezioni locali, scegli la sala più vicina e conveniente che inizi prima possibile e che si adatti ai tuoi impegni, vai senza studiare troppo l'opzione e lascia che la sorpresa faccia parte dell'esperienza.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Albero genealogico in una pagina",
      "summary": "Disegna a memoria un piccolo albero di famiglia o delle amicizie.",
      "why_it_hits": "Le relazioni diventano visibili in una forma nuova.",
      "instructions": "Su una sola pagina, mappa un piccolo ramo di famiglia, famiglia scelta, colleghi o amici; includi per ciascuno una luogo o una caratteristica e, se vuoi, chiedi a qualcuno di correggere un dettaglio.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Storia del ponte locale",
      "summary": "Scopri quando è stato costruito un ponte e perché.",
      "why_it_hits": "L'infrastruttura acquisisce una storia alle spalle.",
      "instructions": "Visita o osserva un ponte vicino, cerca la sua data di costruzione, il progettista o lo scopo, poi attraversalo o guardalo tenendo a mente quel dettaglio.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il pasto nella ciotola migliore",
      "summary": "Mangia un pasto usando la tua ciotola più bella.",
      "why_it_hits": "Usare cose tenute per un’occasione futura fa contare il presente.",
      "instructions": "Prendi la tua ciotola, piatto o tazza migliore, servi dentro un pasto normale, siediti in un posto piacevole e resisti alla tentazione di conservare l’oggetto per un’occasione immaginaria.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tavolo di gioco di gruppo",
      "summary": "Gioca a un gioco da tavolo con almeno altre due persone.",
      "why_it_hits": "Le regole creano un ritmo condiviso e semplice da seguire.",
      "instructions": "Invita persone a casa, in un bar o in un negozio di giochi, scegli un gioco breve sotto l'ora, spiega le regole in modo sintetico, giocate una partita e lascia che il vincitore si goda una piccola vittoria.",
      "goal_tags": [
        "fun",
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 3,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Assaggio di riunione civica",
      "summary": "Partecipa per venti minuti a una riunione pubblica locale.",
      "why_it_hits": "Mostra come suonano le decisioni nella vita reale.",
      "instructions": "Trova una riunione di consiglio comunale, consiglio scolastico, del quartiere o di una commissione aperta al pubblico, partecipa di persona o online per un breve periodo, ascolta con rispetto e, se necessario, allontanati silenziosamente.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il bouquet dell’angolo",
      "summary": "Compra i fiori meno eleganti in un negozio di alimentari o in una tabaccheria.",
      "why_it_hits": "La bellezza senza pretese ha il suo fascino.",
      "instructions": "Trova un piccolo mazzo economico in un negozio di quartiere, supermercato o mercato, portalo a casa o regalalo a qualcuno, taglia gli steli se serve e mettilo dove risulti inaspettatamente elegante.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Cerca il menu più antico",
      "summary": "Trova un ristorante o una caffetteria che mostri la propria storia.",
      "why_it_hits": "I luoghi di ristoro custodiscono la memoria locale.",
      "instructions": "Vai o passa davanti a un locale storico, cerca menu vecchi, foto, date o insegne, compra qualcosa di piccolo se ha senso e scopri da quanto tempo è aperto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata dal Nuovo Vicino",
      "summary": "Percorri a passo tranquillo un quartiere che visiti raramente, con rispetto.",
      "why_it_hits": "Case diverse rivelano ritmi di vita differenti.",
      "instructions": "Scegli una strada pubblica sicura durante il giorno, cammina senza fotografare da vicino spazi privati, osserva giardini, portici, auto e suoni, e torna indietro prima di avere l'impressione di stazionare.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appuntamento Senza Spese di Un’Ora",
      "summary": "Passa del tempo con qualcuno usando solo spazi pubblici gratuiti.",
      "why_it_hits": "Dimostra che la connessione non richiede acquisti.",
      "instructions": "Invita qualcuno per un giro al parco, una visita alla biblioteca, sedersi sul lungofiume, una mostra in galleria o una passeggiata nel quartiere, fissa una finestra di un’ora e porta acqua o snack da casa.",
      "goal_tags": [
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Leggi l'etichetta di una ricetta",
      "summary": "Leggi l'etichetta di un alimento confezionato che mangi spesso.",
      "why_it_hits": "I prodotti familiari smettono di essere invisibili.",
      "instructions": "Scegli un cibo o una bevanda che usi regolarmente, leggi ingredienti, provenienza e dichiarazioni sul packaging, cerca il significato di un termine che non conosci e valuta se qualcosa ti sorprende.",
      "goal_tags": [
        "novelty"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Spettatore in piscina pubblica",
      "summary": "Vai a una gara di nuoto, a una sessione di pattinaggio o a una pista come spettatore.",
      "why_it_hits": "Osservare abilità negli spazi pubblici dà energia.",
      "instructions": "Trova una piscina comunale, una pista di pattinaggio, uno skate park o una struttura sportiva con area riservata agli spettatori, guarda rispettosamente per venti minuti e incita solo quando è appropriato.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccolo uniforme personale",
      "summary": "Indossa un outfit semplificato che dia la sensazione di un’uniforme.",
      "why_it_hits": "Ridurre le scelte può far sentire tutto più nitido e cinematografico.",
      "instructions": "Scegli dal tuo guardaroba un colore, una silhouette o una combinazione di capi ripetuta e semplice, indossala per la giornata o l’uscita e osserva se cambia la tua fatica decisionale.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Riflessi nella vetrina",
      "summary": "Usa i riflessi per guardare la tua strada in modo diverso.",
      "why_it_hits": "I riflessi trasformano passeggiate ordinarie in scene stratificate.",
      "instructions": "Cammina per una via commerciale, osserva i riflessi su vetrine, auto, pozzanghere e porte in vetro, nota le immagini sovrapposte e scegli il riflesso che sembra più una scena da film.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Intervista sull'Errand del Amico",
      "summary": "Chiedi a un amico di raccontare perché fa acquisti dove li fa.",
      "why_it_hits": "Le routine diventano storie quando vengono spiegate.",
      "instructions": "Accompagna qualcuno in una commissione di tutti i giorni, chiedi perché sceglie quel negozio, quel percorso, quel marchio o quel momento, ascolta la logica pratica e condividi una delle tue ragioni di routine.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il brindisi minuscolo",
      "summary": "Fai un brindisi a qualcosa di preciso durante un pasto.",
      "why_it_hits": "Un piccolo rito segna la giornata.",
      "instructions": "Con una bevanda di qualsiasi tipo, da solo o in compagnia, alza il bicchiere per brindare a una persona, a un compito portato a termine, al cambiamento del tempo o all'assurda sopravvivenza della settimana, poi continua a mangiare.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dediche Nascoste",
      "summary": "Leggi le dediche in dieci libri.",
      "why_it_hits": "Le dediche sono piccole finestre sulla vita privata.",
      "instructions": "A casa, in biblioteca o in libreria, apri dieci libri alla pagina delle dediche, leggile e scegli quella che più ti incuriosisce riguardo al rapporto che sta dietro.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pranzo sulla panchina più lunga",
      "summary": "Mangia sulla panchina o sul tavolo più lungo che trovi.",
      "why_it_hits": "La distanza trasforma il pranzo in una piccola scena.",
      "instructions": "Trova una panchina pubblica lunga, un tavolo da picnic, un tavolo della mensa o un sedile in una piazza, mangia un pasto semplice lì e nota chi altro condivide la lunga fila di spazio.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Desiderio alla Fontana senza Monete",
      "summary": "Esprimi un desiderio a una fontana senza lanciare nulla.",
      "why_it_hits": "Mantiene il rito senza sporcare né spendere.",
      "instructions": "Trova una fontana o una struttura d’acqua, fermati vicino, esprimi in privato un desiderio o un’intenzione, osserva l’acqua per un minuto e lascia la fontana esattamente com’era.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un piccolo dettaglio da costume",
      "summary": "Aggiungi un singolo elemento in stile costume ai vestiti normali.",
      "why_it_hits": "Un accenno di carattere rende la giornata più giocosa.",
      "instructions": "Scegli una sciarpa, una spilla, dei calzini, un anello, un colore o un’acconciatura che richiami un personaggio o un’epoca, indossalo durante un’uscita normale e mantienilo abbastanza discreto da poterlo godere.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tour del chiosco gastronomico locale",
      "summary": "Mangia in un chiosco del food court che non hai mai provato.",
      "why_it_hits": "I food court racchiudono molti mondi in un'unica stanza.",
      "instructions": "Vai in un centro commerciale, mercato, campus o food court di una stazione, fai un giro completo prima di scegliere, ordina un piatto economico da un chiosco nuovo per te e siediti dove puoi osservare la folla.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Il discorso di un minuto",
      "summary": "Tieni un brevissimo discorso preparato davanti a un amico o allo specchio.",
      "why_it_hits": "Parlare in modo chiaro è un piccolo margine di crescita.",
      "instructions": "Scegli un argomento che ti sta a cuore, prepara un minuto di idee, dillo ad alta voce a una persona di fiducia, in una nota vocale o allo specchio, e fermati dopo un minuto.",
      "goal_tags": [
        "connection",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Faccenda al Tramonto",
      "summary": "Organizza una commissione qualunque in modo che finisca vicino al tramonto.",
      "why_it_hits": "Unisce la bellezza alla necessità.",
      "instructions": "Scegli una spesa, un ritiro, una consegna o una passeggiata; pianificala in modo da poter fare una pausa verso ovest vicino al tramonto, osserva per cinque minuti, poi porta a termine la commissione.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Chiamata all'antica",
      "summary": "Chiama invece di mandare messaggi per organizzare un piano pratico.",
      "why_it_hits": "La voce in tempo reale supera gli intoppi.",
      "instructions": "Scegli con una persona che conosci un piano senza grosse conseguenze, chiamala per decidere ora, luogo o dettagli in meno di cinque minuti e godi del fatto di non dover mandare dieci messaggi.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il sentiero degli sticker",
      "summary": "Fai caso agli sticker su pali, laptop, cartelli o vetrine.",
      "why_it_hits": "Gli sticker rivelano la cultura informale e non ufficiale.",
      "instructions": "Cammina per una strada vivace, un campus o un quartiere artistico, cerca sticker senza staccarne o aggiungerne, osserva temi e sovrapposizioni e scegli quello più divertente o più misterioso.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un brano per tornare a casa",
      "summary": "Lascia che una canzone decida il tuo percorso di ritorno.",
      "why_it_hits": "Seguire un impulso crea una piccola avventura.",
      "instructions": "Avvia una canzone appena lasci un negozio o una fermata, cammina nella direzione che ti sembra corrispondere al brano finché non finisce, poi torna a casa normalmente.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il thermos da fuori",
      "summary": "Porta una bevanda calda in un luogo all'aperto.",
      "why_it_hits": "Prepararsi rende una piccola uscita più intenzionale.",
      "instructions": "Riempi un thermos o una tazza da viaggio, cammina fino a un parco, un belvedere, un molo o una piazza, bevila lentamente e nota come avere la tua bevanda cambia l'uscita.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata della poesia ritrovata",
      "summary": "Crea una poesia con le parole sui cartelli che incontri.",
      "why_it_hits": "La città fornisce il linguaggio.",
      "instructions": "Cammina per venti minuti, raccogli parole da cartelli, menù, manifesti e etichette nell’ordine in cui le trovi, poi sistema dieci di esse in una breve poesia a casa o su una panchina.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il tour della nostalgia in tre tappe",
      "summary": "Visita tre luoghi di un capitolo precedente della tua vita.",
      "why_it_hits": "La memoria diventa concreta e ricca di storie.",
      "instructions": "Scegli tre posti vicini legati a scuola, lavoro, incontri, traslochi o infanzia; raggiungili o attraversali in un unico percorso e nota quale ti sembra più piccolo, più grande o rimasto uguale.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Conversazione con i volontari del giardino pubblico",
      "summary": "Scopri come viene curato un giardino o un parco.",
      "why_it_hits": "I sistemi di cura diventano visibili.",
      "instructions": "Se trovi informazioni affisse o persone del personale o volontari disponibili, leggi o fai una domanda breve sulla manutenzione, le piantagioni o il volontariato, poi apprezza un dettaglio curato.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "La camminata per un solo acquisto",
      "summary": "Vai a comprare esattamente un solo upgrade pratico.",
      "why_it_hits": "Fare acquisti con uno scopo evita di vagare e spendere troppo.",
      "instructions": "Scegli un unico oggetto economico e necessario come batterie, ganci, calze, sapone, nastro o un taccuino; vai a piedi o con i mezzi per prenderlo, compralo soltanto quello e usalo oggi.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Un tè da un altro paese",
      "summary": "Prova uno stile di tè di una cultura a te poco familiare.",
      "why_it_hits": "Una tazza semplice può racchiudere geografie.",
      "instructions": "Compra o prepara un tè economico come genmaicha, menta, masala chai, rooibos, yerba mate o oolong, impara una curiosità su di esso e bevilo senza fare altro contemporaneamente.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Esercizio del Rifiuto Gentile",
      "summary": "Di' no a una cosa opzionale in modo chiaro e gentile.",
      "why_it_hits": "Un confine può essere una piccola avventura silenziosa.",
      "instructions": "Scegli una richiesta, invito, upsell o abitudine reale e a basso rischio che oggi non vuoi accettare; rifiuta con semplicità senza spiegazioni e usa il tempo liberato per qualcosa di piacevole.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Schizzo della banchina",
      "summary": "Disegna la geometria di una banchina del trasporto pubblico.",
      "why_it_hits": "Il design del trasporto si trasforma in arte visiva.",
      "instructions": "Porta carta, stai in piedi o siediti a distanza di sicurezza dal bordo, disegna linee, cartelli, panchine, binari e persone come forme semplici per dieci minuti e fermati quando arriva il tuo mezzo.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dessert Locale di Sera",
      "summary": "Esci la sera per un singolo dessert.",
      "why_it_hits": "Una piccola uscita notturna ha un gusto di festa.",
      "instructions": "Scegli una pasticceria, gelateria o caffetteria aperta dopo cena, vai da solo o con qualcuno, ordina un dolce moderato e rendi il dessert il motivo principale dell'uscita.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Serata Trailer dei Film di Casa",
      "summary": "Guarda solo i trailer di film che forse non vedrai mai.",
      "why_it_hits": "Ti fa assaggiare molti mondi in poco tempo.",
      "instructions": "Scegli un tema — noir d’antan, animazione straniera, thriller anni ’90 o documentari — guarda cinque trailer, scegli il più intrigante e aggiungi solo quello a una lista futura.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": []
    },
    {
      "title": "Il Percorso del Saluto Amichevole",
      "summary": "Saluta con la mano le persone che già riconosci lungo il tuo percorso.",
      "why_it_hits": "Un riconoscimento a bassa pressione crea calore nel vicinato.",
      "instructions": "Fai una passeggiata lungo un percorso dove potresti incontrare vicini conosciuti, personale, chi porta a spasso il cane o persone del condominio; offri un piccolo saluto con la mano o un cenno a chi riconosci e non forzare l’interazione.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Uno scontrino interessante",
      "summary": "Conserva uno scontrino e annota l'uscita attorno ad esso.",
      "why_it_hits": "Un pezzo di carta quotidiano diventa il fulcro di una storia.",
      "instructions": "Dopo un acquisto, scrivi sullo scontrino dove eri, che tempo faceva e una cosa che hai notato, poi infilalo in un libro o buttalo via più tardi.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Bozzetto di un piccolo giardino pubblico",
      "summary": "Disegna una foglia, un fiore o un vaso dal vivo.",
      "why_it_hits": "Osservare con attenzione calma e affila.",
      "instructions": "Trova un vaso pubblico, una aiuola o un albero, disegna un piccolo dettaglio della pianta per dieci minuti, indica il colore anche se usi una penna nera e non toccare la pianta.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il pin condiviso",
      "summary": "Scambia con un amico un pin di un posto locale che ami.",
      "why_it_hits": "Le raccomandazioni personali risultano intime e utili.",
      "instructions": "Manda a qualcuno il pin di una panchina, di un caffè, di una vista, di un negozio o di una passeggiata che ti piace, chiedi uno in cambio e visita il suo oggi o fissate la visita finché l’idea è fresca.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Visita al foyer di un centro culturale",
      "summary": "Entra in un istituto culturale o in un centro di quartiere.",
      "why_it_hits": "Spesso questi luoghi nascondono eventi, opere d’arte e risorse utili.",
      "instructions": "Trova un centro culturale, un istituto d’ambasciata, una sala comunitaria o un’associazione del patrimonio aperta ai visitatori, sfoglia le esposizioni pubbliche o i volantini e segnala un evento futuro.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "not_knowing",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'album fotografico delle cose comuni",
      "summary": "Scatta cinque foto di oggetti utili e ordinari in casa.",
      "why_it_hits": "Rende omaggio all’infrastruttura invisibile della tua vita.",
      "instructions": "Fotografa cinque oggetti umili come un bollitore, scarpe, chiavi, lavello, lampada o sedia, evita di allestire la scena e guardali insieme come se documentassero una casa scomparsa.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Osserva il dog park del quartiere",
      "summary": "Osserva un dog park da fuori o da una panchina.",
      "why_it_hits": "Il caos gioioso degli animali può migliorare l’umore.",
      "instructions": "Vai in un dog park o in un’area pet‑friendly, osserva con rispetto senza entrare se non hai un cane, nota gli stili di gioco e non accarezzare i cani senza il permesso del proprietario.",
      "goal_tags": [
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'Abito della Piccola Audacia",
      "summary": "Indossa un capo che ti piace ma che raramente osi portare.",
      "why_it_hits": "Una piccola spinta di visibilità può far sentire liberi.",
      "instructions": "Scegli un indumento, un accessorio, un colore o un dettaglio di make-up che sia leggermente audace ma adatto, indossalo per una breve uscita e lascia che il disagio passi senza cambiarlo subito.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata audio sulla storia locale",
      "summary": "Crea una breve passeggiata autoguidata partendo da una fonte storica.",
      "why_it_hits": "I fatti prendono vita quando li attraversi nello spazio.",
      "instructions": "Leggi o ascolta un breve brano di storia locale, scegli due luoghi correlati, visitali in ordine e immagina la scena di un tempo sovrapposta a quella attuale.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Gessetti Gentili sul Marciapiede",
      "summary": "Lascia un piccolo disegno o messaggio con i gessetti dove è permesso.",
      "why_it_hits": "Regala allegria temporanea senza lasciare tracce permanenti.",
      "instructions": "Usa gessetti lavabili su un marciapiede o vialetto autorizzato, disegna un piccolo fiore, una freccia, il campana o una frase amichevole, mantienilo non politico e non commerciale, ed evita proprietà private.",
      "goal_tags": [
        "creativity",
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il potluck con un solo piatto",
      "summary": "Porta un piccolo piatto da condividere con persone che conosci già.",
      "why_it_hits": "Il cibo abbassa la soglia per incontrarsi.",
      "instructions": "Prepara o compra un semplice piatto condivisibile, portalo al lavoro, a casa di un amico, a un club o a tavola in famiglia con il permesso, e mantieni il gesto informale.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "with_other_people"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "group_social_situations"
      ]
    },
    {
      "title": "Passeggiata Cromatica nel Reparto Vernici",
      "summary": "Sfoglia le campionature di colore e scegli una tinta che rispecchi il tuo umore attuale.",
      "why_it_hits": "Nomi dei colori e campionature stimolano una riflessione gentile.",
      "instructions": "Vai al reparto vernici di un negozio di bricolage, sfoglia le campionature senza fare disordine, scegli un colore che corrisponda a oggi e prendi una scheda gratuita solo se è consentito.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il luogo più silenzioso qui vicino",
      "summary": "Cerca il punto pubblico più silenzioso entro quindici minuti.",
      "why_it_hits": "Il silenzio diventa qualcosa che puoi trovare.",
      "instructions": "Cammina o usa un mezzo entro un breve raggio, prova un angolo di biblioteca, un vialetto del parco, un sagrato, un cortile o una viuzza, resta nel punto più silenzioso per cinque minuti.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "going_far",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata di Amicizia e Ritorno",
      "summary": "Cammina con qualcuno fino a un punto di riferimento scelto, poi tornate indietro.",
      "why_it_hits": "Un punto di arrivo condiviso mantiene i piani semplici.",
      "instructions": "Scegli un punto di riferimento come un ponte, un murale, un negozio, un albero o un angolo; cammina fino lì con un amico chiacchierando, voltatevi e tornate indietro quando lo raggiungete, ed evitate di prolungare la passeggiata a meno che entrambi non lo vogliate.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "planning",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Scaffale dei produttori locali",
      "summary": "Trova prodotti fatti nella tua città o nella tua regione.",
      "why_it_hits": "Le etichette rivelano l’economia locale che ti circonda.",
      "instructions": "Vai in un supermercato, negozio di articoli da regalo, mercato o cooperativa, cerca tre prodotti realizzati localmente, compra uno solo se ti è utile o è conveniente e scopri dove viene prodotto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata nel campus vicino",
      "summary": "Cammina attraverso l'area pubblica di un college o di una scuola.",
      "why_it_hits": "I campus hanno ritmi distinti e percorsi nascosti.",
      "instructions": "Scegli un campus ad accesso pubblico, visita di giorno, percorri i viali principali e i cortili aperti, leggi un volantino di un evento ed evita edifici riservati o di rispettare la privacy degli studenti.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Picnic con gli avanzi",
      "summary": "Mangia gli avanzi all'aperto invece che davanti al frigorifero.",
      "why_it_hits": "Aggiunge paesaggio alla praticità.",
      "instructions": "Imballa gli avanzi in modo sicuro, portali su una panchina, uno scalino, in un parco o in un cortile, mangia con posate vere se possibile e riporta i contenitori a casa.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ricerca dell’albero più antico",
      "summary": "Trova un albero dall’aspetto molto vecchio e passa del tempo con lui.",
      "why_it_hits": "L’età viva dà un senso di radicamento.",
      "instructions": "Vai in un parco, in un cimitero, in un campus o in una strada antica, cerca l’albero più grande o più segnato dal tempo, osserva corteccia e rami per dieci minuti e evita di arrampicarti o danneggiarlo.",
      "goal_tags": [
        "novelty",
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Caffè nella ferramenta di paese",
      "summary": "Visita un negozio ibrido, una tavola calda o una vecchia drogheria.",
      "why_it_hits": "I luoghi multiuso racchiudono il carattere locale.",
      "instructions": "Trova una ferramenta con caffè, una drogheria, una vecchia tavola calda o un negozio multiuso nelle vicinanze, sfoglia o compra qualcosa di piccolo e osserva quali ruoli svolge il posto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il mini-zine di due pagine",
      "summary": "Crea un piccolo zine pieghevole sulla tua giornata.",
      "why_it_hits": "Trasforma i frammenti quotidiani in un oggetto concreto.",
      "instructions": "Piega un foglio di carta in un mini libretto, riempilo con appunti, disegni, scontrini o osservazioni di oggi, e regalala a qualcuno oppure conservala.",
      "goal_tags": [
        "creativity",
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Itinerario dei musicanti di strada",
      "summary": "Percorri un percorso dove spesso si esibiscono artisti di strada.",
      "why_it_hits": "L'arte dal vivo rende lo spazio pubblico più generoso.",
      "instructions": "Scegli un'area sicura e frequentata nota per gli artisti, cammina durante le ore di maggiore attività, fermati per una performance se c'è, lascia una mancia se puoi e vai avanti se non ne trovi.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Archeologia digitale di un'ora",
      "summary": "Sfoglia le foto di esattamente un mese del passato.",
      "why_it_hits": "Fa emergere scene dimenticate senza dover scorrere all'infinito.",
      "instructions": "Scegli un mese di un anno passato, guarda solo quella cartella per massimo un'ora, seleziona cinque foto da salvare o condividere e fermati prima di riorganizzare tutto.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appuntamento all'Orologio Pubblico",
      "summary": "Incontra qualcuno sotto un orologio pubblico o un'insegna caratteristica.",
      "why_it_hits": "I punti d'incontro tradizionali sono romantici e chiari.",
      "instructions": "Scegli un orologio, un'insegna, una statua o una fontana, datevi appuntamento lì a un orario preciso, evita messaggi continui sulla posizione e goditi la piccola cerimonia dell'arrivo.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Arte nella hall di un ospedale",
      "summary": "Visita opere d’arte pubblica in un ospedale, una clinica o su un campus medico.",
      "why_it_hits": "Gli spazi di cura spesso ospitano opere d’arte sorprendentemente attente.",
      "instructions": "Solo se l’accesso pubblico è consentito e senza disturbare le cure, attraversa una hall o un corridoio con opere d’arte, osserva tre pezzi e allontanati in silenzio.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il look dalla vetrina in un'ora",
      "summary": "Crea un outfit immaginario usando solo quello che vedi nelle vetrine.",
      "why_it_hits": "Giocare con lo stile resta gratuito e osservazionale.",
      "instructions": "Percorri una via commerciale o un centro commerciale, scegli capi e accessori da vetrine diverse senza entrare se preferisci, componi un outfit immaginario per un'occasione specifica e dai un nome all'occasione.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Regalo: scorciatoia del quartiere",
      "summary": "Mostra a qualcuno un percorso utile che conosci.",
      "why_it_hits": "La conoscenza locale diventa generosità.",
      "instructions": "Invita un amico, collega o visitatore a fare con te una scorciatoia, un percorso panoramico o una connessione di trasporto più comoda, spiega perché è utile e lascia che decida se fa al caso suo.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lo spuntino delle tre consistenze",
      "summary": "Prepara uno spuntino con elementi croccanti, cremosi e vivaci.",
      "why_it_hits": "La consistenza trasforma cibi semplici in qualcosa di curato.",
      "instructions": "Usa alimenti dalla dispensa o fai una piccola spesa per combinare tre consistenze, per esempio cracker, formaggio, sottaceti, frutta, yogurt, frutta secca o pane tostato, e consumalo impiattato invece che in piedi.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Osserva l'arte murale autorizzata",
      "summary": "Visita un muro di graffiti o una zona di murales autorizzata.",
      "why_it_hits": "La creatività pubblica sembra viva e in continuo mutamento.",
      "instructions": "Trova un vicolo di murales legali, un muro d'arte o un quartiere di street art, vai di giorno, osserva da vicino gli strati e le firme e non aggiungere mai segni a meno che non sia espressamente permesso.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La chiamata per la mappa di famiglia",
      "summary": "Chiedi a qualcuno dove è avvenuta una storia importante di famiglia.",
      "why_it_hits": "Le storie diventano più reali quando hanno un luogo.",
      "instructions": "Chiama o manda un messaggio a un parente o a un anziano di fiducia, chiedi dove è avvenuto un trasferimento, un incontro, un lavoro o un evento significativo, cercalo su una mappa e fai una domanda di approfondimento.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ritocco al piccolo tavolo",
      "summary": "Svuota e sistema un tavolo come se arrivassero degli ospiti.",
      "why_it_hits": "Uno spazio ordinato cambia il modo in cui vivi la casa.",
      "instructions": "Scegli una scrivania, il tavolo da pranzo, il tavolino del salotto o il comodino, svuotalo, puliscilo, metti un solo oggetto utile o bello e usalo una volta oggi.",
      "goal_tags": [
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Belvedere per il treno locale",
      "summary": "Osserva i treni da un punto di vista sicuro e legale.",
      "why_it_hits": "I treni rendono il movimento visibile e drammatico.",
      "instructions": "Trova una banchina della stazione, un ponte con accesso pedonale, un parco o un’area di osservazione dove guardare i treni sia sicuro; resta dietro le barriere, osserva per venti minuti e non oltrepassare recinzioni o proprietà private.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il carrello diverso",
      "summary": "Fai la spesa con un cestino a mano invece del carrello, o viceversa.",
      "why_it_hits": "Cambiare il contenitore cambia le scelte.",
      "instructions": "In una normale spesa, usa il metodo di trasporto opposto al tuo solito, compra solo ciò che sta comodamente o intenzionalmente nel contenitore e osserva come influisce sul ritmo e sulle decisioni.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Playlist locale di un'ora",
      "summary": "Ascolta solo musicisti della tua zona per un'ora.",
      "why_it_hits": "Il suono locale aggiunge un altro strato al senso del luogo.",
      "instructions": "Cerca artisti della tua città o regione, crea o usa una playlist breve, ascolta mentre cammini, cucini o prendi i mezzi, e salva una traccia che riascolteresti.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'ultima pagina per prima",
      "summary": "Leggi l'ultima pagina di un libro che non hai intenzione di leggere.",
      "why_it_hits": "Infrange un tabù letterario in modo innocuo.",
      "instructions": "In una biblioteca, in una libreria o sul tuo scaffale, scegli un libro che probabilmente non leggerai a breve, leggi solo l'ultima pagina e immagina il percorso che ci ha portato.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sosta in lavanderia di quartiere",
      "summary": "Trascorri del tempo in una lavanderia: fai il bucato o limita‑ti a osservare con rispetto.",
      "why_it_hits": "Le lavanderie sono infrastrutture pubbliche intime.",
      "instructions": "Se devi lavare, fai un carico in una lavanderia; altrimenti entra solo se ti sembra appropriato, compra qualcosa da bere nelle vicinanze e nota i ritmi senza fissare nessuno.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "La Prenotazione Audace",
      "summary": "Prenota un tavolo, una lezione o un biglietto che continui a rimandare.",
      "why_it_hits": "Un piccolo impegno trasforma il «prima o poi» in qualcosa di programmato.",
      "instructions": "Scegli una cosa realistica che continui a valutare, verifica costo e orario, fai la prenotazione o compra il biglietto oggi e aggiungilo al calendario.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Pranzo nel giardino delle sculture",
      "summary": "Mangia vicino a una scultura all'aperto o a un’opera d’arte pubblica.",
      "why_it_hits": "L'arte trasforma lo sfondo del pasto.",
      "instructions": "Trova un giardino di sculture, un’opera in una piazza, un’installazione su un campus o una panchina vicino a un murale, porta o compra il pranzo, mangia lì vicino e scegli quale opera sarebbe il miglior compagno di tavola.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ascoltare l’accento del quartiere",
      "summary": "Osserva la mescolanza di lingue e accenti negli spazi pubblici.",
      "why_it_hits": "Fa emergere la varietà umana che ti circonda.",
      "instructions": "Siediti in una stazione, mercato, parco o area ristoro, ascolta con rispetto senza origliare sui contenuti, nota i ritmi e i toni delle lingue e rifletti su quanti mondi condividono quel luogo.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Un nuovo posto per la colazione",
      "summary": "Prova un locale per la colazione prima che inizi la tua giornata abituale.",
      "why_it_hits": "Crea una storia prima che la routine prenda il sopravvento.",
      "instructions": "Scegli una tavola calda, una pasticceria, un caffè, un chiosco o una bancarella vicina che apra presto, ordina qualcosa di semplice, siediti o stai in piedi per qualche minuto e poi continua la tua giornata.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "L'oggetto che eviti",
      "summary": "Affronta un oggetto di casa che continui a ignorare.",
      "why_it_hits": "Avvicinarsi a ciò che eviti può avere un effetto sorprendentemente liberatorio.",
      "instructions": "Scegli una pila, un indumento, un oggetto rotto, un utensile o un pacco non aperto; dedica esattamente quindici minuti a occupartene, fai una mossa concreta e fermati prima che diventi una saga.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata Notturna tra Arte Pubblica",
      "summary": "Ammira opere d'arte pubblica illuminate dopo il tramonto.",
      "why_it_hits": "La luce trasforma la carica emotiva delle opere.",
      "instructions": "Scegli un'area sicura e frequentata con murales, sculture, proiezioni o monumenti illuminati, vai con qualcuno se vuoi, cammina per trenta minuti e torna a casa mentre l'energia è ancora positiva.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Rituale dell'ospite minuscolo",
      "summary": "Invita qualcuno per una cosa specifica e piccola.",
      "why_it_hits": "Ospitare sembra più facile quando l'ambito è minuscolo.",
      "instructions": "Chiedi a una persona di venire per un tè, uno snack, una canzone, una talea di pianta o un giro di dieci minuti di qualcosa; prepara solo quello e mantieni tutto semplice.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Libro con dedica locale",
      "summary": "Compra o prendi in prestito un libro per via della sua dedica.",
      "why_it_hits": "Una pagina nascosta guida la scelta.",
      "instructions": "Gira per una biblioteca o una libreria dell'usato, leggi le dediche finché una non ti colpisce, prendi in prestito o compra il libro se possibile e leggine qualche pagina oggi.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Test del clima d'angolo",
      "summary": "Trova l'angolo più ventoso, più caldo o più fresco nelle vicinanze.",
      "why_it_hits": "I microclimi rendono le strade vive.",
      "instructions": "Cammina per qualche isolato, confronta temperatura e vento agli angoli, nei vicoli, sulle pareti soleggiate e all'ombra, e individua il punto con la personalità meteorologica più marcata.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Appuntamento in Galleria in 30 minuti",
      "summary": "Porta qualcuno in una galleria con un limite di tempo.",
      "why_it_hits": "Una cultura rapida evita l’affaticamento da museo.",
      "instructions": "Invita un amico o partner in una galleria con ingresso gratuito, mettete un limite di trenta minuti, ognuno scelga un’opera preferita e una che non capisce, poi andate via per discuterne altrove.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cucina di un Colore",
      "summary": "Prepara un pasto dominato da un unico colore.",
      "why_it_hits": "Il vincolo visivo rende il cibo giocoso e creativo.",
      "instructions": "Scegli un colore, usa ingredienti che hai o acquista a poco, cucina o assembla un pasto semplice per lo più di quel colore e permetti un solo guarnizione contrastante se necessario.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La via dei vecchi cartelli",
      "summary": "Cerca insegne dipinte sbiadite o pubblicità fantasma.",
      "why_it_hits": "Il commercio antico resta come archeologia urbana.",
      "instructions": "Cammina per le strade commerciali più vecchie alla luce del giorno, guarda sopra il livello degli occhi per scritte sbiadite, pubblicità murali o insegne di negozi antiche, e scegli quella che sembra la più resistente a sparire.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola domanda di coraggio",
      "summary": "Fai a qualcuno che conosci una domanda che di solito eviti.",
      "why_it_hits": "Un pizzico di audacia può rendere il legame più profondo.",
      "instructions": "Scegli una persona di fiducia e una domanda rispettosa, personale ma non invadente; falla quando c’è spazio, accetta una risposta breve e rispondi anche tu se ti viene chiesto.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Controllo dei posti a sedere pubblici",
      "summary": "Osserva dove il quartiere permette alle persone di sedersi.",
      "why_it_hits": "I posti a sedere rivelano chi gli spazi pubblici accolgono.",
      "instructions": "Cammina per venti minuti, conta panchine, davanzali, sedie, pensiline degli autobus e elementi ostili, siediti in un posto consentito e decidi dove servirebbero più sedute.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Apprezzare i cartelli fatti a mano",
      "summary": "Trova e apprezza i cartelli fatti a mano.",
      "why_it_hits": "La scrittura imperfetta trasmette urgenza umana.",
      "instructions": "Cerca cartelli disegnati a mano in negozi, avvisi di svendite in giardino, arte di protesta, volantini di animali smarriti o lavagne dei menu; scegli quello più espressivo ed evita di fotografare informazioni personali sensibili.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Breve Treno verso il Nulla",
      "summary": "Fai un breve viaggio in treno senza una meta importante.",
      "why_it_hits": "Il semplice muoversi può bastare.",
      "instructions": "Prendi il biglietto più economico adatto o usa un abbonamento, fai qualche fermata fino a una stazione che non conosci, passeggia per quindici minuti se è sicuro, e poi torna indietro.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Il banco tranquillo del bar",
      "summary": "Siediti al banco di un bar all'inizio della serata e prendi una bevanda o uno snack senza fretta.",
      "why_it_hits": "I bar prima dell'arrivo della folla possono avere un'atmosfera contemplativa.",
      "instructions": "Scegli un locale affidabile nelle ore tranquille all'inizio della serata, ordina una bevanda o un'opzione analcolica e del cibo se ne hai bisogno, resta seduto per trenta minuti e vai via prima che la serata diventi rumorosa.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "La storia dietro un murale del quartiere",
      "summary": "Scopri chi ha realizzato un murale e perché.",
      "why_it_hits": "L'arte pubblica acquista profondità quando conosci l'autore.",
      "instructions": "Trova un murale, cerca una firma, una targa o una scheda online, scopri un fatto sull'artista o sul tema, poi riguarda l'opera con quel contesto.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il passaporto della dispensa",
      "summary": "Prepara uno snack ispirato a un luogo che vorresti visitare.",
      "why_it_hits": "Il desiderio di viaggiare diventa commestibile per un giorno.",
      "instructions": "Scegli un paese, una regione o una città, usa ingredienti che hai già o fai un unico acquisto economico, prepara uno snack semplice ispirato al luogo e leggiti un paragrafo su quel posto mentre lo mangi.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Chiedi in Prestito un Cane per Passeggiare",
      "summary": "Unisciti a un amico che già conosci mentre porta a spasso il suo cane.",
      "why_it_hits": "Gli animali rendono le passeggiate più sociali e rilassanti.",
      "instructions": "Chiedi a un amico che ha un cane se puoi unirti alla sua passeggiata abituale, rispetta la routine e i confini del cane, non prevaricare e goditi il ritmo più lento fatto di annusate.",
      "goal_tags": [
        "connection",
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La recensione dal tono deciso",
      "summary": "Leggi recensioni locali divertenti su un posto, poi visitalo con occhio neutro.",
      "why_it_hits": "Aspettative e realtà che si scontrano.",
      "instructions": "Scegli un bar, un parco, un monumento o un negozio con recensioni online esagerate, leggine alcune, visita il luogo per poco e decidi cosa i recensori hanno frainteso o esagerato.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Passeggiata con una borsa per donazioni",
      "summary": "Riempì una piccola borsa per la donazione e portala a destinazione a piedi.",
      "why_it_hits": "Una purga contenuta diventa azione, non caos.",
      "instructions": "Prendi una piccola borsa, scegli solo oggetti puliti e utili, riempila in venti minuti, individua un punto di raccolta e consegnala oggi anziché lasciarla vicino alla porta.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'ora di pranzo alternativa",
      "summary": "Pranza in un momento insolito e osserva la differenza.",
      "why_it_hits": "L'orario cambia l'atmosfera dei luoghi di tutti i giorni.",
      "instructions": "Se il tuo programma lo permette, mangia prima o dopo del solito, scegli un luogo pubblico, nota chi c'è a quell'ora e poi torna alla tua giornata senza complicarla.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Ricamo Locale del Quartiere",
      "summary": "Cuci o disegna un simbolo semplice del tuo quartiere.",
      "why_it_hits": "Creare un simbolo del luogo favorisce il senso di appartenenza.",
      "instructions": "Usa filo, penna, pennarello o ritagli di stoffa per realizzare un'icona piccola come un ponte, un albero, un cartello, uno skyline o un animale; finiscila in meno di un'ora e mantienila imperfetta.",
      "goal_tags": [
        "creativity",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "L'invito al tavolo lungo",
      "summary": "Siediti a un tavolo comune dove è la cosa più normale del mondo.",
      "why_it_hits": "Uno spazio condiviso crea leggere possibilità di socialità senza pressione.",
      "instructions": "Vai in un bar, una biblioteca, una food hall o un beer garden con posti comuni, siediti al tavolo lungo se ti va, fai le tue cose e parla solo se succede naturalmente.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Osservatorio sul Cantiere del Quartiere",
      "summary": "Osserva un cantiere da una distanza pubblica sicura.",
      "why_it_hits": "Guardare qualcosa che prende forma dà una spinta di energia.",
      "instructions": "Trova un punto di osservazione consentito vicino a un cantiere, rimani fuori dalle recinzioni, osserva per dieci minuti, nota macchinari, segnali e fasi dei lavori, e non interferire né fotografare i lavoratori in modo invadente.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La regola del primo giorno caldo",
      "summary": "Fai qualcosa all'aperto che avevi rimandato alla bella giornata.",
      "why_it_hits": "Agire in base al tempo rende la giornata più viva.",
      "instructions": "Se il tempo è piacevole, scegli un'azione semplice all'aperto—pranzare, leggere, chiamare qualcuno, andare a piedi in un negozio o sederti in un parco—e falla oggi invece di rimandare.",
      "goal_tags": [
        "novelty",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Piccola consegna dolce",
      "summary": "Porta un dolcetto a qualcuno vicino a te.",
      "why_it_hits": "La generosità a sorpresa crea un momento condiviso.",
      "instructions": "Compra o prepara un dolcetto, consegnalo a un amico, un vicino che conosci, un collega o un familiare con un breve biglietto, e non trattenerti a lungo a meno che non ti venga chiesto.",
      "goal_tags": [
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La traccia sulla mappa pubblica",
      "summary": "Usa una mappa cartacea affissa in una stazione o in un parco.",
      "why_it_hits": "Le mappe cartacee rendono l'orientamento tangibile.",
      "instructions": "Trova una mappa affissa (dei trasporti, di un sentiero, di un campus o del quartiere), individua il punto in cui ti trovi e segui con lo sguardo una possibile strada, poi percorri a piedi una piccola parte di quel percorso.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Prova outfit per inaugurazione d’arte",
      "summary": "Vestiti un po’ più curato e vai a un evento d’arte gratuito.",
      "why_it_hits": "Avere l’aspetto giusto può aiutarti a entrare in nuovi ambienti.",
      "instructions": "Scegli una galleria, una lettura, un lancio o un concerto gratuito, indossa qualcosa di leggermente più ricercato, resta per trenta–sessanta minuti e concediti di appartenere senza dover fare networking intenso.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "La passeggiata comune, un solo obiettivo",
      "summary": "Fai il tuo solito percorso cercando soltanto cerchi.",
      "why_it_hits": "Un vincolo visivo rinnova la ripetizione.",
      "instructions": "Scegli un percorso che conosci, osserva cerchi in ruote, segnali, tombini, tazze, finestre e motivi, conta venti e lascia che il resto della passeggiata sia normale.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini concerto in casa",
      "summary": "Suona dal vivo una canzone per chi vive con te o per un amico.",
      "why_it_hits": "La musica dal vivo è speciale anche se un po' sgangherata.",
      "instructions": "Usa uno strumento, la voce o percussioni semplici; esegui una canzone o un ritmo per qualcuno di caro o per te stesso, registra solo se vuoi e concludi con un applauso.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "going_far",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Assaggio di Storia Locale",
      "summary": "Mangia qualcosa mentre leggi della sua storia locale.",
      "why_it_hits": "Gusto e racconto si rafforzano a vicenda.",
      "instructions": "Scegli un piatto locale, una tradizione culinaria di immigrati, una vecchia pasticceria o un prodotto di mercato, leggi un breve articolo a riguardo, poi mangia una porzione modesta mentre il contesto è ancora fresco.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "La maniglia perfetta",
      "summary": "Cerca la maniglia da porta pubblica più soddisfacente.",
      "why_it_hits": "I dettagli tattili rendono l’architettura più intima.",
      "instructions": "Visita negozi, biblioteche, edifici storici o sale pubbliche, prova le maniglie consentite, confrontane peso, forma e materiale e proclama la tua preferita.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mezz'ora di Abilità Approssimativa",
      "summary": "Prova intenzionalmente una nuova abilità da principiante per trenta minuti.",
      "why_it_hits": "Il permesso di essere imprecisi rende l’inizio più semplice.",
      "instructions": "Scegli giocoleria, origami, fischiare, schizzi, danza base, fare nodi o usare le bacchette, esercitati per trenta minuti seguendo una guida breve e punta a un primo tentativo divertente.",
      "goal_tags": [
        "fun",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "La città a mezzogiorno",
      "summary": "Trascorri venti minuti all’aperto esattamente intorno a mezzogiorno.",
      "why_it_hits": "Il mezzogiorno ha una personalità netta e spesso trascurata.",
      "instructions": "Esci vicino a mezzogiorno, scegli una piazza, un parco, una strada principale o un cortile, osserva le ombre, la folla del pranzo, i ritmi delle consegne e il calore o la luce intensa, poi torna alla tua giornata.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Fare il tragitto con un amico",
      "summary": "Accompagna qualcuno in una parte del suo tragitto abituale.",
      "why_it_hits": "Osservare una routine diversa amplia i tuoi orizzonti.",
      "instructions": "Chiedi a qualcuno che conosci se puoi accompagnarlo in un breve tratto del suo tragitto quotidiano, del percorso verso scuola o della sua passeggiata abituale, rispetta i suoi tempi e presta attenzione a ciò che nota.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lettura alla Candela Singola",
      "summary": "Leggi alla luce di una lampada o di una luce simile a una candela per venti minuti.",
      "why_it_hits": "La luce cambia la consistenza dell’attenzione.",
      "instructions": "Scegli un’illuminazione calda e sicura, leggi un libro, una rivista, una lettera o una poesia per venti minuti, tieni lontani altri schermi e fermati prima che gli occhi si affatichino.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Posto Gentile sui Mezzi Pubblici",
      "summary": "Viaggia sui mezzi prestando attenzione all’etichetta dei posti.",
      "why_it_hits": "Piccole cortesia migliorano lo spazio condiviso.",
      "instructions": "Su autobus o treno, stai in piedi o siediti con attenzione, lascia il posto se qualcuno ne ha più bisogno, tieni la borsa raccolta e osserva come le piccole scelte influenzano il viaggio.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Il ristorante più antico nei paraggi",
      "summary": "Visita o informati sul ristorante più antico che riesci a raggiungere.",
      "why_it_hits": "I luoghi di lunga data custodiscono la memoria collettiva.",
      "instructions": "Trova un ristorante, una tavola calda, un caffè o un bar probabilmente antico; vai a prendere un drink o qualcosa di piccolo se te lo puoi permettere, informati sulla sua storia e immagina quanti pasti ordinari si sono consumati lì.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    }
  ]
}$sidequests$::jsonb AS data
)
INSERT INTO public.side_quests (
  title,
  summary,
  why_it_hits,
  instructions,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  is_active
)
SELECT
  title,
  summary,
  why_it_hits,
  instructions,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  true
FROM payload,
jsonb_to_recordset(payload.data -> 'quests') AS q(
  title text,
  summary text,
  why_it_hits text,
  instructions text,
  goal_tags text[],
  barrier_tags text[],
  context_tags text[],
  type_tags text[],
  outcome_tags text[],
  stretch_level text,
  cost_level integer,
  planning_level integer,
  social_level integer,
  physical_level integer,
  distance_level integer,
  night_level integer,
  avoid_flags text[]
);
