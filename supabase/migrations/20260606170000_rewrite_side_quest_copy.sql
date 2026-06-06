-- Generated from /Users/zach/repos/StepnOut/scripts/side-quests/output/active-side-quest-copy.json
-- Updates quest copy for 128 active side quests.

BEGIN;

DO $migration$
DECLARE
  quest_ids bigint[] := ARRAY[1, 4, 5, 8, 9, 10, 12, 13, 14, 16, 18, 19, 20, 21, 22, 24, 25, 26, 28, 29, 30, 31, 32, 35, 38, 39, 40, 44, 45, 46, 47, 50, 52, 57, 61, 66, 74, 75, 76, 77, 78, 80, 81, 82, 90, 91, 92, 93, 94, 95, 97, 98, 101, 103, 106, 109, 114, 128, 131, 133, 134, 135, 136, 138, 142, 147, 152, 155, 156, 166, 168, 169, 172, 175, 176, 177, 184, 185, 186, 189, 192, 193, 202, 203, 204, 205, 206, 209, 211, 212, 213, 215, 217, 223, 225, 227, 235, 251, 252, 254, 255, 257, 261, 268, 274, 275, 276, 278, 284, 286, 288, 291, 300, 303, 304, 306, 307, 308, 312, 313, 314, 315, 316, 317, 318, 319, 321, 323]::bigint[];
  expected_count integer := 128;
  matched_count integer;
  updated_count integer;
BEGIN
  SELECT count(*)
  INTO matched_count
  FROM public.side_quests
  WHERE id = ANY (quest_ids);

  IF matched_count <> expected_count THEN
    RAISE EXCEPTION 'Expected % side quests to exist, found %', expected_count, matched_count;
  END IF;

  WITH updates (id, old_title, new_title, old_summary, new_summary) AS (
    VALUES
      (
        1::bigint,
        'Cucina un dolce e portalo a un vicino',
        'Cucina un dolce e portalo a un vicino',
        'Prepara una piccola cosa da mangiare e consegnala a un vicino o a un amico nello stesso giorno. Cucina qualcosa di semplice, mettilo in un contenitore pulito, suona o passa da loro e dì chiaramente che l’hai fatto apposta per condividerlo.',
        'Prepara una piccola cosa da mangiare e consegnala a un vicino o a un amico nello stesso giorno. Cucina qualcosa di semplice e portaglielo davvero, lasciando che il senso stia tutto nello scambio che succede tra voi.'
      ),
      (
        4::bigint,
        'Prendi un treno regionale verso una fermata sconosciuta',
        'Prendi un treno regionale verso una fermata sconosciuta',
        'Fai una piccola spedizione in treno regionale verso un posto vicino ma non familiare. Compra un biglietto per una fermata raggiungibile in giornata, scendi, entra in un bar e chiedi quale luogo o episodio del paese dovresti conoscere prima di ripartire.',
        'Fai una piccola spedizione in treno regionale verso un posto vicino ma non familiare. Scegli una fermata raggiungibile in giornata, scendi e fatti dire da qualcuno del posto cosa vale la pena vedere o capire prima di ripartire.'
      ),
      (
        5::bigint,
        'Chiama un parente per ricostruire una storia di famiglia',
        'Chiama un parente per ricostruire una storia di famiglia',
        'Chiama un parente per ricostruire dove è successo un episodio preciso della vostra famiglia. Prepara una domanda su un trasloco, un lavoro, un amore o una litigata, chiama senza messaggi preliminari e segnati indirizzi, nomi e dettagli che emergono.',
        'Chiama un parente per ricostruire dove è successo un episodio preciso della vostra famiglia. Parti da una storia vera e lascia che la conversazione vi riporti a luoghi, nomi e dettagli che di solito restano sfocati.'
      ),
      (
        8::bigint,
        'Assisti a un''udienza in tribunale',
        'Assisti a un''udienza in tribunale',
        'Assisti a una parte reale della vita pubblica entrando in un’aula di tribunale aperta al pubblico. Chiedi all’ingresso o alla cancelleria quale udienza sia accessibile, siediti per l’intera trattazione consentita e ringrazia il personale quando esci.',
        'Assisti a una parte reale della vita pubblica entrando in un’aula di tribunale aperta al pubblico. Trova un’udienza accessibile vicino a te, siediti per un po’ e guarda da vicino una scena civica che di solito resta astratta.'
      ),
      (
        9::bigint,
        'Registra una cartolina audio e mandala',
        'Registra una cartolina audio e mandala',
        'Crea una cartolina audio di un luogo della tua giornata per qualcuno che non è lì. Vai in una piazza, su un lungofiume o davanti a una stazione, registra un minuto di suoni e poi un minuto di racconto, quindi invia il file a una persona precisa.',
        'Crea una cartolina audio di un luogo della tua giornata per qualcuno che non è lì. Registra i suoni e qualche parola da un posto preciso, poi mandala a una persona che possa entrarci per un momento anche da lontano.'
      ),
      (
        10::bigint,
        'Disegna una mini-mappa del tuo quartiere',
        'Disegna una mini-mappa del tuo quartiere',
        'Disegna una mini mappa del tuo quartiere o della tua zona come se dovessi orientare qualcuno che arriva da fuori. Segna su un foglio tre luoghi che contano per te, aggiungi indicazioni semplici o piccoli riferimenti e tienila per te o appendila dove la rivedrai.',
        'Disegna una mini mappa del tuo quartiere o della tua zona come se dovessi orientare qualcuno che arriva da fuori. Segna i posti che per te contano davvero e trasformala in una piccola guida personale invece che in un disegno qualsiasi.'
      ),
      (
        12::bigint,
        'Lascia un caffè sospeso e fatti raccontare come funziona',
        'Lascia un caffè sospeso e fatti raccontare come funziona',
        'Lascia un caffè sospeso e fatti raccontare come funziona davvero in quel bar. Entra in un bar di quartiere, paga il tuo caffè e uno per chi verrà dopo, poi chiedi al barista quando capita e che tipo di persone lo usano.',
        'Lascia un caffè sospeso e fatti raccontare come funziona davvero in quel bar. Offrine uno in un bar di quartiere e chiedi che storia ha lì questo gesto, e quando capita davvero che qualcuno lo riceva.'
      ),
      (
        13::bigint,
        'Scambia un ritratto fotografico con uno sconosciuto',
        'Scambia un ritratto fotografico con uno sconosciuto',
        'Scambia un piccolo ritratto fotografico con una persona invece di fare solo selfie. Chiedi a qualcuno in un luogo pubblico di scattarti una foto con un’inquadratura precisa, poi offriti di fotografarlo a sua volta e mostragli subito il risultato.',
        'Scambia un piccolo ritratto fotografico con una persona invece di fare solo selfie. Chiedi a qualcuno di fotografarti come ti vede lui, poi ricambia il favore e lasciate che il ritratto sia un piccolo scambio invece di una posa qualunque.'
      ),
      (
        14::bigint,
        'Scopri la storia della via in cui vivi',
        'Scopri la storia della via in cui vivi',
        'Scopri un dettaglio documentato sulla via in cui vivi o lavori. Vai in biblioteca comunale, archivio locale o emeroteca, chiedi aiuto per cercare una vecchia mappa o notizia della strada e fatti indicare come citare la fonte.',
        'Scopri un dettaglio documentato sulla via in cui vivi o lavori. Cerca una mappa, una notizia o una traccia d’archivio che faccia sembrare la tua strada meno anonima di ieri.'
      ),
      (
        16::bigint,
        'Fai una segnalazione civica con protocollo',
        'Fai una segnalazione civica con protocollo',
        'Fai una segnalazione civica completa su un problema reale dello spazio pubblico. Fotografa una buca, un lampione spento, una barriera rotta o un rifiuto ingombrante, inviala tramite app comunale, URP o mail ufficiale e conserva il numero di protocollo.',
        'Fai una segnalazione civica completa su un problema reale dello spazio pubblico. Prendi un guasto o un ostacolo che vedi davvero e trasformalo in una richiesta ufficiale che lasci una traccia, non solo una lamentela.'
      ),
      (
        18::bigint,
        'Fatti spiegare un gesto rituale in un luogo di culto',
        'Fatti spiegare un gesto rituale in un luogo di culto',
        'Entra in un luogo di culto o in una sala parrocchiale per capire un gesto rituale che hai sempre visto da fuori. Presentati a un volontario, a un sacrestano o a una persona dell’accoglienza, chiedi il significato di un oggetto o di un momento della celebrazione e ascolta la spiegazione fino in fondo.',
        'Entra in un luogo di culto o in una sala parrocchiale per capire un gesto rituale che hai sempre visto da fuori. Chiedi a qualcuno che ci sta dentro di spiegarti un oggetto, un gesto o un momento che per te è sempre rimasto misterioso.'
      ),
      (
        19::bigint,
        'Chiedi a un musicista di strada di dedicare un brano',
        'Chiedi a un musicista di strada di dedicare un brano',
        'Trasforma un musicista di strada in un piccolo ponte tra te e qualcun altro. Avvicinati durante una pausa, chiedi se può dedicare un brano a una persona presente o da chiamare in vivavoce, concorda l’offerta e lascia che la dedica accada lì.',
        'Trasforma un musicista di strada in un piccolo ponte tra te e qualcun altro. Chiedigli se può dedicare un brano a una persona precisa e lascia che per qualche minuto quella musica diventi un messaggio.'
      ),
      (
        20::bigint,
        'Fai una performance di novanta secondi a un open mic',
        'Fai una performance di novanta secondi a un open mic',
        'Porta una micro-performance dal vivo davanti a un piccolo pubblico, in un open mic, un circolo o un bar con serata libera. Cerca un evento per stasera, prepara novanta secondi di storia, poesia o canzone, chiedi un posto in lista e sali al microfono senza superare il tempo.',
        'Porta una micro-performance dal vivo davanti a un piccolo pubblico, in un open mic, un circolo o un bar con serata libera. Trova una serata dove puoi salire sul palco con qualcosa di breve e lascia che conti più il gesto di farlo che la perfezione.'
      ),
      (
        21::bigint,
        'Entra a un quiz da bar senza una squadra',
        'Entra a un quiz da bar senza una squadra',
        'Entra in un quiz serale da bar o da circolo anche se non hai una squadra. Arriva dieci minuti prima, chiedi all’organizzatore se c’è un tavolo incompleto, presentati con nome e una materia in cui sei decente, poi gioca fino alla classifica finale.',
        'Entra in un quiz serale da bar o da circolo anche se non hai una squadra. Unisciti a un tavolo incompleto e lascia che siano le domande a fare da scorciatoia per conoscere persone nuove.'
      ),
      (
        22::bigint,
        'Crea una mini-zine di una pagina',
        'Crea una mini-zine di una pagina',
        'Crea una mini-zine di una pagina su una tua ossessione innocua o su una cosa che ti diverte davvero. Piega un A4 in otto riquadri, riempilo con titolo, disegni e tre brevi testi, poi tienilo per te o fanne qualche copia se ti va.',
        'Crea una mini-zine di una pagina su una tua ossessione innocua o su una cosa che ti diverte davvero. Metti in una pagina piegata la tua piccola fissazione come se stessi preparando un oggetto da passare di mano in mano.'
      ),
      (
        24::bigint,
        'Cucina con qualcuno usando due ingredienti segreti',
        'Cucina con qualcuno usando due ingredienti segreti',
        'Cucini con una persona usando due ingredienti segreti portati da voi, senza ricetta iniziale. Ognuno porta una cosa salata o dolce in un sacchetto, li aprite insieme, decidete un piatto unico in cinque minuti, cucinate a quattro mani e date un nome al risultato prima di mangiare.',
        'Cucina con una persona usando due ingredienti segreti portati da voi, senza ricetta iniziale. Ognuno porta il suo senza dirlo prima, poi apriteli insieme e inventate qualcosa partendo proprio dalla sorpresa.'
      ),
      (
        25::bigint,
        'Chiama in diretta una radio locale',
        'Chiama in diretta una radio locale',
        'Intervieni in diretta in una radio locale o di quartiere invece di restare solo ascoltatore. Trova una trasmissione con messaggi o telefonate, prepara una frase su un tema del giorno o un saluto non musicale, chiama o manda vocale quando aprono la linea e dì il tuo nome senza scusarti troppo.',
        'Intervieni in diretta in una radio locale o di quartiere invece di restare solo ascoltatore. Trova una trasmissione che lascia spazio agli ascoltatori e fatti sentire con una frase che ti rappresenti davvero.'
      ),
      (
        26::bigint,
        'Fai da modello per qualcuno che disegna',
        'Fai da modello per qualcuno che disegna',
        'Ti offri come modello o modella per qualcuno che disegna, fotografa o fa esercizi di ritratto dal vero. Scrivi a un corso, a un circolo artistico o a un amico che disegna, concorda venti minuti vestito normalmente, resta fermo nella posa scelta e chiedi di vedere il risultato alla fine.',
        'Ti offri come modello o modella per qualcuno che disegna, fotografa o fa esercizi di ritratto dal vero. Lascia che qualcun altro ti guardi abbastanza da trasformarti in un soggetto, non solo in una presenza che passa.'
      ),
      (
        28::bigint,
        'Aiuta dietro le quinte di una sagra',
        'Aiuta dietro le quinte di una sagra',
        'Ti inserisci per un compito reale dietro le quinte di una sagra, una festa parrocchiale o una cena di circolo. Vai prima dell’orario di punta, chiedi al responsabile un incarico breve come apparecchiare, portare cassette o sparecchiare, eseguilo fino in fondo e poi fatti dire da chi lavora lì qual è il momento più caotico della serata.',
        'Ti inserisci per un compito reale dietro le quinte di una sagra, una festa parrocchiale o una cena di circolo. Vai dove una festa si regge sul lavoro di chi sta dietro e fatti dare un incarico vero, anche piccolo, da portare fino in fondo.'
      ),
      (
        29::bigint,
        'Presentati a un vicino che incroci da mesi',
        'Presentati a un vicino che incroci da mesi',
        'Ti presenti a un vicino o una vicina che incroci da mesi senza conoscere davvero. Suona o ferma la persona in un momento tranquillo, di’ nome, piano e motivo semplice della presentazione, poi scambiate un’informazione utile come numero per emergenze, orari rumorosi da evitare o referente del condominio.',
        'Ti presenti a un vicino o una vicina che incroci da mesi senza conoscere davvero. Rompi la conoscenza da pianerottolo e trasformala in un contatto reale, semplice ma utile.'
      ),
      (
        30::bigint,
        'Fatti raccontare la storia di un oggetto da un rigattiere',
        'Fatti raccontare la storia di un oggetto da un rigattiere',
        'Entri da un rigattiere o in un mercatino dell’usato per farti raccontare la storia di un oggetto preciso. Indica un pezzo che ti incuriosisce, chiedi da dove arriva o che tipo di persona lo compra, ascolta il racconto e fai una domanda di dettaglio prima di ringraziare senza fingere competenza.',
        'Entri da un rigattiere o in un mercatino dell’usato per farti raccontare la storia di un oggetto preciso. Scegli un pezzo che ti incuriosisce e fatti raccontare che vite potrebbe aver già attraversato.'
      ),
      (
        31::bigint,
        'Scrivi una lettera al giornale locale',
        'Scrivi una lettera al giornale locale',
        'Scrivi una breve lettera a un giornale locale su una cosa concreta del tuo quartiere e provi a farla leggere da una redazione vera. Tieni il testo sotto le centocinquanta parole, metti un fatto e una proposta, telefona o manda mail alla redazione e chiedi quale rubrica potrebbe accoglierla.',
        'Scrivi una breve lettera a un giornale locale su una cosa concreta del tuo quartiere e provi a farla leggere da una redazione vera. Metti per iscritto un fatto reale e una posizione chiara, poi prova a farlo entrare nel discorso pubblico locale.'
      ),
      (
        32::bigint,
        'Presenta due amici che non si conoscono',
        'Presenta due amici che non si conoscono',
        'Fai incontrare due persone che conosci ma che non si sono mai parlate, con un motivo chiaro per cui potrebbero piacersi. Invita entrambe per una mezz’ora nello stesso posto, apri l’incontro dicendo a ciascuna una qualità concreta dell’altra, poi lancia una domanda comune e resta abbastanza da far partire la conversazione.',
        'Fai incontrare due persone che conosci ma che non si sono mai parlate, con un motivo chiaro per cui potrebbero piacersi. Invitale nello stesso posto con un aggancio vero e poi lascia che la conversazione faccia il resto.'
      ),
      (
        35::bigint,
        'Offriti di portare a spasso il cane di qualcuno',
        'Offriti di portare a spasso il cane di qualcuno',
        'Offriti di portare a spasso il cane di qualcuno che conosci o di una persona del quartiere che ha bisogno di una mano. Chiedi se puoi occupartene per un giro semplice, segui le indicazioni su guinzaglio e percorso e fai la passeggiata senza trasformarla in un favore enorme.',
        'Offriti di portare a spasso il cane di qualcuno che conosci o di una persona del quartiere che ha bisogno di una mano. Prenditi quel giro al posto di qualcun altro e lascia che il favore resti piccolo, concreto e davvero utile.'
      ),
      (
        38::bigint,
        'Fai una domanda a una conferenza pubblica',
        'Fai una domanda a una conferenza pubblica',
        'Entri in una lezione pubblica, conferenza o incontro divulgativo e fai una domanda davanti agli altri. Trova un evento gratuito oggi in università, biblioteca o libreria, ascolta fino al momento delle domande, alza la mano e formula un quesito breve che inizi con “mi può spiegare meglio…”.',
        'Entri in una lezione pubblica, conferenza o incontro divulgativo e fai una domanda davanti agli altri. Ascolta abbastanza da avere una domanda vera e poi dilla ad alta voce senza trasformarla in una scusa per sparire.'
      ),
      (
        39::bigint,
        'Disegna un manifesto e consegnalo all''organizzatore',
        'Disegna un manifesto e consegnalo all''organizzatore',
        'Disegni un piccolo manifesto utile per un evento locale e lo consegni a chi lo organizza. Scegli una presentazione, raccolta, torneo o serata di quartiere, crea un A4 chiaro con titolo, luogo e orario, stampalo e portalo all’organizzatore chiedendo se può appenderlo o condividerlo.',
        'Disegni un piccolo manifesto utile per un evento locale e lo consegni a chi lo organizza. Scegli qualcosa che ti sembra valga la pena far girare e dagli una forma visiva da mettere davvero in mano a qualcuno.'
      ),
      (
        40::bigint,
        'Fatti criticare dal vivo una tua foto',
        'Fatti criticare dal vivo una tua foto',
        'Porti una tua foto a qualcuno che ne capisce più di te e chiedi una critica onesta dal vivo. Stampa o apri sul telefono uno scatto fatto da te, vai a un circolo fotografico, a un negozio di stampa o da un amico fotografo, chiedi tre cose da migliorare e segnati le risposte.',
        'Porti una tua foto a qualcuno che ne capisce più di te e chiedi una critica onesta dal vivo. Fatti dire cosa funziona e cosa no da un occhio più allenato del tuo, senza difendere subito lo scatto.'
      ),
      (
        44::bigint,
        'Sfida uno sconosciuto a scacchi o dama',
        'Sfida uno sconosciuto a scacchi o dama',
        'Sfidi una persona a una partita completa di scacchi o dama in un circolo, in biblioteca o a un tavolo pubblico. Ti presenti, chiedi se accetta una partita secca, giochi fino alla fine e chiudi con una stretta di mano e una domanda sul suo colpo migliore.',
        'Sfidi una persona a una partita completa di scacchi o dama in un circolo, in biblioteca o a un tavolo pubblico. Trova un posto dove si gioca già e lascia che sia la partita a fare da incontro.'
      ),
      (
        45::bigint,
        'Vai all''AVIS per un colloquio o una donazione',
        'Vai all''AVIS per un colloquio o una donazione',
        'Trasformi una curiosità rimandata in un passaggio concreto con AVIS o un centro trasfusionale. Controlli gli orari, vai con documento e tessera sanitaria, fai il colloquio di idoneità e, se puoi donare oggi, resti fino alla merenda finale.',
        'Trasformi una curiosità rimandata in un passaggio concreto con AVIS o un centro trasfusionale. Vai davvero da loro e scopri cosa significa farne parte, con o senza donazione quel giorno.'
      ),
      (
        46::bigint,
        'Impara le compressioni toraciche in una dimostrazione',
        'Impara le compressioni toraciche in una dimostrazione',
        'Impari dal vivo le compressioni toraciche in una dimostrazione aperta di Croce Rossa, Misericordia o Protezione Civile. Trovi un incontro in giornata, ti metti in fila per provare sul manichino e chiedi al volontario di correggerti finché il ritmo è giusto.',
        'Impari dal vivo le compressioni toraciche in una dimostrazione aperta di Croce Rossa, Misericordia o Protezione Civile. Partecipa a un incontro aperto e prova il gesto sul manichino finché non ti entra nel corpo.'
      ),
      (
        47::bigint,
        'Costruisci qualcosa in un fablab',
        'Costruisci qualcosa in un fablab',
        'Vai in un fablab, makerspace o laboratorio aperto e realizza un oggetto semplice con gli strumenti del posto. Chiedi quale progetto base puoi fare oggi, fatti spiegare il passaggio tecnico principale e porta a casa quello che riesci a costruire.',
        'Vai in un fablab, makerspace o laboratorio aperto e realizza un oggetto semplice con gli strumenti del posto. Chiedi un progetto base da fare lì e costruisci qualcosa che ti faccia toccare con mano il posto e chi lo anima.'
      ),
      (
        50::bigint,
        'Lavora un turno in un orto urbano condiviso',
        'Lavora un turno in un orto urbano condiviso',
        'Metti le mani nella terra in un orto urbano o giardino condiviso durante un turno aperto. Ti presenti al referente, chiedi quale fila o vaso ha bisogno di lavoro oggi, semini o trapianti con loro e scrivi il tuo nome sull’etichetta della pianta.',
        'Metti le mani nella terra in un orto urbano o giardino condiviso durante un turno aperto. Unisciti a un pezzo di lavoro comune e fai qualcosa che resti visibile anche dopo che te ne vai.'
      ),
      (
        52::bigint,
        'Pulisci un parco, una spiaggia o un argine',
        'Pulisci un parco, una spiaggia o un argine',
        'Dedica un''uscita a ripulire un pezzo di parco, spiaggia, argine o sentiero che ti sembra trascurato. Porta con te un sacco e dei guanti robusti, raccogli quello che riesci in modo sicuro e smetti quando hai riempito almeno un sacchetto o migliorato chiaramente l''area.',
        'Dedica un’uscita a ripulire un pezzo di parco, spiaggia, argine o sentiero che ti sembra trascurato. Scegli un tratto reale e miglioralo con quello che riesci a raccogliere davvero, in modo sicuro e concreto.'
      ),
      (
        57::bigint,
        'Partecipa come volontario a una ricerca universitaria',
        'Partecipa come volontario a una ricerca universitaria',
        'Ti offri come partecipante a una ricerca universitaria, sondaggio di strada o test pubblico condotto da ricercatori identificabili. Leggi il consenso, compili o provi il compito richiesto, poi chiedi al ricercatore quale ipotesi stanno verificando e cosa succederà ai dati.',
        'Ti offri come partecipante a una ricerca universitaria, sondaggio di strada o test pubblico condotto da ricercatori identificabili. Presta tempo e attenzione a una ricerca vera, poi fatti spiegare quale domanda stanno cercando di verificare.'
      ),
      (
        61::bigint,
        'Unisciti a una pedalata collettiva o Critical Mass',
        'Unisciti a una pedalata collettiva o Critical Mass',
        'Ti unisci a una pedalata collettiva urbana, Critical Mass o uscita serale di ciclisti locali. Controlli punto e orario, arrivi con luci funzionanti, pedali accanto a qualcuno che non conosci e gli chiedi quale strada della città gli sembra più ingiusta per chi va in bici.',
        'Ti unisci a una pedalata collettiva urbana, Critical Mass o uscita serale di ciclisti locali. Vai al ritrovo, pedala con il gruppo e guarda la città dal punto di vista di chi la attraversa in bici.'
      ),
      (
        66::bigint,
        'Porta uno striscione a un corteo autorizzato',
        'Porta uno striscione a un corteo autorizzato',
        'Partecipi a un corteo autorizzato, presidio o manifestazione portando materialmente uno striscione per un tratto. Chiedi a chi organizza dove puoi stare, prendi un angolo dello striscione, cammini fino alla tappa successiva e chiedi alla persona accanto perché è lì oggi.',
        'Partecipi a un corteo autorizzato, presidio o manifestazione portando materialmente uno striscione per un tratto. Prendine un lato e senti cosa cambia quando la presenza smette di essere solo spettatrice.'
      ),
      (
        74::bigint,
        'Gira un cortometraggio muto in strada con un amico',
        'Gira un cortometraggio muto in strada con un amico',
        'Gira un cortometraggio muto di trenta secondi con una persona complice, usando solo ciò che trovate in strada. Scegliete un titolo prima di uscire, registrate tre inquadrature in ordine cronologico con il telefono e montatele subito insieme con un taglio secco e una musica scelta sul posto.',
        'Gira un cortometraggio muto di trenta secondi con una persona complice, usando solo ciò che trovate in strada. Inventate un titolo, cercate tre inquadrature che stiano in piedi da sole e lasciate che la strada vi dia il resto.'
      ),
      (
        75::bigint,
        'Organizza un mini-torneo lampo in un bar',
        'Organizza un mini-torneo lampo in un bar',
        'Organizza un mini torneo lampo in un bar, in casa o in un circolo con quattro partecipanti e una regola ridicola ma chiara. Porta carte, dadi o un gioco semplice, scrivi il tabellone su un foglio, fai iscrivere i nomi e conduci semifinali e finale in meno di quaranta minuti.',
        'Organizza un mini torneo lampo in un bar, in casa o in un circolo con quattro partecipanti e una regola ridicola ma chiara. Bastano un gioco semplice, quattro persone e una regola assurda ma leggibile per trasformare una serata in un evento.'
      ),
      (
        76::bigint,
        'Leggi un libro che mette in crisi una tua idea',
        'Leggi un libro che mette in crisi una tua idea',
        'Leggi l’inizio di un libro che mette in crisi una tua idea invece di confermarla. Vai in biblioteca comunale o libreria, chiedi a chi lavora lì un titolo serio su un punto di vista opposto al tuo, leggi venti pagine sul posto e torna al banco con una frase che ti ha infastidito o sorpreso.',
        'Leggi l’inizio di un libro che mette in crisi una tua idea invece di confermarla. Fatti consigliare un punto di vista che ti contraddice e resta abbastanza da capire dove ti punge davvero.'
      ),
      (
        77::bigint,
        'Disegna la linea del tempo della vita di un anziano',
        'Disegna la linea del tempo della vita di un anziano',
        'Costruisci con una persona più grande di te la linea del tempo dei suoi lavori, traslochi o cambi di vita. Porta un foglio grande, disegna una riga con gli anni, chiedile di riempire le svolte una alla volta e fotografate insieme il risultato prima di correggere date e nomi.',
        'Costruisci con una persona più grande di te la linea del tempo dei suoi lavori, traslochi o cambi di vita. Disegnatela insieme così che i passaggi della sua storia diventino visibili tutti in una volta.'
      ),
      (
        78::bigint,
        'Ricrea oggi una vecchia foto di famiglia',
        'Ricrea oggi una vecchia foto di famiglia',
        'Ricrei oggi una vecchia foto di famiglia o di amicizia con i corpi e le facce di adesso. Scegli un’immagine, contatta almeno una persona presente o collegata a quella scena, cercate vestiti e postura simili e scattate la nuova versione nello stesso luogo o nel suo equivalente più vicino.',
        'Ricrei oggi una vecchia foto di famiglia o di amicizia con i corpi e le facce di adesso. Rimettete in scena quell’immagine e guardate cosa resiste, e cosa no, nello stesso gesto rifatto anni dopo.'
      ),
      (
        80::bigint,
        'Costruisci una playlist con tre persone diverse',
        'Costruisci una playlist con tre persone diverse',
        'Fai nascere una playlist da tre persone che non avrebbero scelto la stessa musica. A un aperitivo, in casa o in macchina da fermo, chiedi a ciascuno una canzone legata a un episodio preciso, aggiungile in ordine e fai raccontare la scena prima di premere play.',
        'Fai nascere una playlist da tre persone che non avrebbero scelto la stessa musica. Chiedi a ciascuno una canzone legata a un episodio preciso e lascia che le storie dietro ai brani valgano quanto i brani stessi.'
      ),
      (
        81::bigint,
        'Componi un mini-jingle per un negozio di quartiere',
        'Componi un mini-jingle per un negozio di quartiere',
        'Componi un micro jingle per un negozio di quartiere e lo fai ascoltare al titolare. Scegli una bottega che conosci, scrivi quattro versi con il suo nome, registra una versione di dieci secondi sul telefono e chiedi al banco il permesso di fargliela sentire una volta.',
        'Componi un micro jingle per un negozio di quartiere e lo fai ascoltare al titolare. Scrivilo per una bottega vera e fallo ascoltare a chi la tiene in piedi ogni giorno.'
      ),
      (
        82::bigint,
        'Iscriviti a un circolo o associazione locale',
        'Iscriviti a un circolo o associazione locale',
        'Entri in un’associazione locale non come spettatore ma come nuovo nome sul registro. Scegli un circolo, centro sociale, bocciofila, ARCI o associazione culturale aperta oggi, presentati al responsabile, chiedi cosa comporta tesserarsi e fai subito una piccola mansione o una presentazione al tavolo.',
        'Entri in un’associazione locale non come spettatore ma come nuovo nome sul registro. Tesserati o presentati come uno che vuole esserci davvero, non solo passare a vedere.'
      ),
      (
        90::bigint,
        'Scrivi una domanda pubblica col gessetto in piazza',
        'Scrivi una domanda pubblica col gessetto in piazza',
        'Crea una piccola domanda pubblica a cui i passanti possano rispondere sul posto. Scrivi con un gessetto lavabile una frase come “Qual è una cosa che ti ha salvato la giornata?”, resta lì mezz’ora e parla con almeno due persone che aggiungono una risposta.',
        'Scrivi una piccola domanda pubblica a cui i passanti possano rispondere sul posto. Lasciala in piazza con il gesso e resta lì abbastanza da vedere che cosa fa nascere nelle persone che passano.'
      ),
      (
        91::bigint,
        'Accompagna qualcuno in una commissione che rimanda',
        'Accompagna qualcuno in una commissione che rimanda',
        'Accompagna qualcuno in una commissione che rimanda perché lo mette a disagio. Scrivigli, offriti per oggi, incontralo davanti al luogo, entra con lui e pronuncia tu la prima frase allo sportello o al banco se te lo chiede.',
        'Accompagna qualcuno in una commissione che rimanda perché lo mette a disagio. Prestati come presenza concreta per quella cosa e aiuta l’altra persona a entrarci senza rimandare ancora.'
      ),
      (
        92::bigint,
        'Fatti mostrare il dietro le quinte di un''attività di quartiere',
        'Fatti mostrare il dietro le quinte di un''attività di quartiere',
        'Chiedi a un’attività di quartiere di mostrarti per due minuti una parte del lavoro che di solito resta invisibile. Entra in una panetteria, una copisteria o un laboratorio, chiedi con garbo se possono farti vedere un passaggio non riservato, poi fai una domanda precisa sul gesto che ti mostrano.',
        'Chiedi a un’attività di quartiere di mostrarti per due minuti una parte del lavoro che di solito resta invisibile. Fatti mostrare un gesto o un passaggio che di solito resta dietro il banco e guardalo con attenzione.'
      ),
      (
        93::bigint,
        'Fai una micro-inchiesta a cinque persone in luoghi diversi',
        'Fai una micro-inchiesta a cinque persone in luoghi diversi',
        'Realizza una micro-inchiesta dal vivo su una domanda che ti riguarda davvero. Scrivi una domanda unica, chiedi il consenso a cinque persone in luoghi diversi, annota le risposte sul telefono e manda il risultato sintetico a una di loro.',
        'Realizza una micro-inchiesta dal vivo su una domanda che ti riguarda davvero. Porta la stessa domanda a cinque persone diverse e scopri come cambia il mondo quando cambia chi risponde.'
      ),
      (
        94::bigint,
        'Porta una bevanda calda a chi lavora di notte',
        'Porta una bevanda calda a chi lavora di notte',
        'Porta una bevanda calda a qualcuno che lavora quando gli altri stanno uscendo o tornando a casa. Scegli un portiere, un benzinaio, un addetto di un bar serale o un guardiano, chiedi prima se accetta, consegna il tè o il caffè e domandagli qual è l’ora più strana del suo turno.',
        'Porta una bevanda calda a qualcuno che lavora quando gli altri stanno uscendo o tornando a casa. Scegli una persona di turno di sera o di notte e trasformale un momento qualunque in una pausa inattesa.'
      ),
      (
        95::bigint,
        'Cucina per qualcuno un piatto legato a un tuo ricordo',
        'Cucina per qualcuno un piatto legato a un tuo ricordo',
        'Cucina per qualcuno un piatto legato a un ricordo preciso della tua vita. Scegli una ricetta semplice che sai fare, invita una persona a mangiarla oggi, servila raccontando dove e con chi l’hai assaggiata la prima volta.',
        'Cucina per qualcuno un piatto legato a un ricordo preciso della tua vita. Prepara una ricetta che porta con sé una storia vera e servila insieme al ricordo da cui viene.'
      ),
      (
        97::bigint,
        'Crea una capsula del tempo',
        'Crea una capsula del tempo',
        'Crea una capsula del tempo per una versione futura di te o per una giornata che vuoi ricordare meglio. Metti in una scatola o in una busta un piccolo oggetto, una frase scritta e una data di riapertura, poi nascondila in un posto sicuro e non toccarla prima del momento scelto.',
        'Crea una capsula del tempo per una versione futura di te o per una giornata che vuoi ricordare meglio. Raccogli pochi segni di chi sei oggi e chiudili per regalarli a una versione futura di te.'
      ),
      (
        98::bigint,
        'Scrivi un racconto a più mani con quattro persone',
        'Scrivi un racconto a più mani con quattro persone',
        'Scrivi un racconto brevissimo con persone che non hanno preparato nulla insieme. Dai a quattro persone un foglio in sequenza, chiedi a ciascuna una sola riga senza leggere tutto il resto, poi riuniscile e leggi ad alta voce il testo completo.',
        'Scrivi un racconto brevissimo con persone che non hanno preparato nulla insieme. Fallo passare di mano in mano senza preparazione e scopri che storia nasce da quattro immaginazioni diverse.'
      ),
      (
        101::bigint,
        'Cucina con qualcuno senza usare parole',
        'Cucina con qualcuno senza usare parole',
        'Prepara qualcosa con un’altra persona senza usare parole, affidandovi solo a gesti e sguardi. Scegliete una ricetta semplice, mettete un timer di trenta minuti, comunicate indicando ingredienti e strumenti, poi mangiate parlando di quando vi siete capiti e quando no.',
        'Prepara qualcosa con un’altra persona senza usare parole, affidandovi solo a gesti e sguardi. Fatevi guidare dai movimenti invece che dalla voce e lasciate che la cucina diventi un piccolo esperimento di intesa.'
      ),
      (
        103::bigint,
        'Affida una decisione al tavolo accanto in un bar',
        'Affida una decisione al tavolo accanto in un bar',
        'Affida per una volta una piccola decisione reale a persone fuori dalla tua cerchia. In un bar o in una trattoria spiega a un tavolo vicino due opzioni innocue ma vere, chiedi un verdetto secco, seguilo subito e torna a dire com’è andata.',
        'Affida per una volta una piccola decisione reale a persone fuori dalla tua cerchia. Spiega a un tavolo vicino due opzioni vere e innocue, poi accetta il verdetto e seguilo davvero.'
      ),
      (
        106::bigint,
        'Fatti mostrare una procedura da una persona più grande',
        'Fatti mostrare una procedura da una persona più grande',
        'Chiedi a una persona più grande di mostrarti una procedura o un oggetto che teme venga dimenticato. Vai da lei oggi, fatti spiegare a cosa serve e come si usa, registra solo con il suo permesso e ripeti tu i passaggi davanti a lei.',
        'Chiedi a una persona più grande di mostrarti una procedura o un oggetto che teme venga dimenticato. Fatti mostrare qualcosa che rischia di sparire e prova a rifarlo davanti a lei finché prende forma nelle tue mani.'
      ),
      (
        109::bigint,
        'Entra a un tavolo di carte in un circolo o centro anziani',
        'Entra a un tavolo di carte in un circolo o centro anziani',
        'Entra in un circolo, bar o centro anziani e chiedi di giocare una mano a carte con chi è già al tavolo. Presentati al banco, chiedi quale tavolo accetta un principiante, resta per una partita completa e paga tu il giro d’acqua o caffè.',
        'Entra in un circolo, bar o centro anziani e chiedi di giocare una mano a carte con chi è già al tavolo. Trova un tavolo disposto ad accoglierti e lascia che la partita faccia il resto della presentazione.'
      ),
      (
        114::bigint,
        'Lascia che la biglietteria scelga il tuo spettacolo',
        'Lascia che la biglietteria scelga il tuo spettacolo',
        'Vai in biglietteria di un cinema, teatro o auditorium e lascia che sia l’addetto a scegliere cosa vedrai oggi. Dai solo orario e budget, compra il biglietto proposto senza controllare la trama, poi torna al banco all’uscita e racconta in una frase cosa ti ha colpito.',
        'Vai in biglietteria di un cinema, teatro o auditorium e lascia che sia l’addetto a scegliere cosa vedrai oggi. Dai solo qualche limite pratico e lascia che un’altra persona scelga per te cosa andare a vedere.'
      ),
      (
        128::bigint,
        'Impara da una sartoria a fare un rammendo visibile',
        'Impara da una sartoria a fare un rammendo visibile',
        'Oggi chiedi a una merceria o sartoria di mostrarti come fare un rammendo visibile su un capo che porterai ancora. Porta una maglia o calza con un buco, compra il filo consigliato, fai i primi punti davanti a chi ti guida e indossa il capo riparato per il resto della giornata.',
        'Chiedi a una merceria o sartoria di mostrarti come fare un rammendo visibile su un capo che porterai ancora. Porta qualcosa che useresti volentieri ancora e impara una riparazione che non si nasconde, si vede.'
      ),
      (
        131::bigint,
        'Canta una canzone con amici da un balcone',
        'Canta una canzone con amici da un balcone',
        'Canta una canzone breve con amici da un balcone, in cortile o in un altro punto di casa che vi faccia un po’ ridere. Scegliete un brano o una filastrocca di massimo trenta secondi, fate una sola take senza ricominciare e lasciate che venga come viene.',
        'Canta una canzone breve con amici da un balcone, in cortile o in un altro punto di casa che vi faccia un po’ ridere. Scegliete un posto che vi faccia sentire esposti il giusto e trattatelo come un minuscolo palco improvvisato.'
      ),
      (
        133::bigint,
        'Chiedi a un fotografo di farti un ritratto',
        'Chiedi a un fotografo di farti un ritratto',
        'Chiedi a un fotografo che incontri in giro se può scattarti una foto usando il suo occhio invece del tuo. Avvicinati senza interrompere il lavoro, chiedi un solo ritratto veloce, fatti guidare per posa o luce e ringrazia davvero guardando il risultato.',
        'Chiedi a un fotografo che incontri in giro se può scattarti una foto usando il suo occhio invece del tuo. Lascia che sia lui a trovare luce, distanza e taglio, così per una volta il ritratto non lo controlli tu.'
      ),
      (
        134::bigint,
        'Assisti a una discussione di laurea aperta al pubblico',
        'Assisti a una discussione di laurea aperta al pubblico',
        'Assisti a una discussione di laurea aperta e fai parte per un’ora del pubblico di una storia che non conosci. Controlla il calendario di un’università vicina, siediti in fondo, ascolta una tesi dall’inizio alla fine e alla fine fai al laureato una domanda semplice sul lavoro appena presentato.',
        'Assisti a una discussione di laurea aperta e fai parte per un’ora del pubblico di una storia che non conosci. Siediti tra persone che quel momento lo vivono sul serio e segui da vicino il passaggio in cui un lavoro diventa pubblico.'
      ),
      (
        135::bigint,
        'Prepara tu un espresso dietro il bancone di un bar',
        'Prepara tu un espresso dietro il bancone di un bar',
        'Chiedi di preparare tu un espresso dietro un bancone, sotto gli occhi di chi lo fa ogni giorno. Vai in un bar tranquillo fuori dall’ora di punta, chiedi al barista se puoi provare una sola estrazione pagando il caffè, segui le sue istruzioni e offrigli il primo sorso per il verdetto.',
        'Chiedi di preparare tu un espresso dietro un bancone, sotto gli occhi di chi lo fa ogni giorno. Vai in un momento tranquillo e prova il gesto vero sotto lo sguardo di chi lo ripete ogni giorno.'
      ),
      (
        136::bigint,
        'Aiuta in biblioteca a sistemare i libri restituiti',
        'Aiuta in biblioteca a sistemare i libri restituiti',
        'Ti fai assegnare un micro-compito reale in una biblioteca comunale e lasci un pezzo di ordine visibile. Chiedi al banco se puoi aiutare per venti minuti, sistema i libri restituiti o prepara un piccolo ripiano tematico secondo le indicazioni del bibliotecario, poi fatti dire quale titolo hai appena rimesso in circolo.',
        'Ti fai assegnare un micro-compito reale in una biblioteca comunale e lasci un pezzo di ordine visibile. Dai una mano a rimettere qualcosa a posto e fatti raccontare un dettaglio del mondo che stai rimettendo a scaffale.'
      ),
      (
        138::bigint,
        'Regala un ritratto fatto bene a un gruppo di sconosciuti',
        'Regala un ritratto fatto bene a un gruppo di sconosciuti',
        'Regali a un gruppo di sconosciuti una foto fatta bene invece del solito autoscatto storto. In una piazza, davanti a un teatro o a un evento, offriti di fotografare una famiglia o una comitiva, fai due scatti curati, consegna il telefono e chiedi loro quale occasione stavano segnando.',
        'Regali a un gruppo di sconosciuti una foto fatta bene invece del solito autoscatto storto. Offriti di fare l’immagine che loro non riuscirebbero a farsi da soli e trattala come un piccolo dono ben fatto.'
      ),
      (
        142::bigint,
        'Vai all''infopoint della tua città come un turista',
        'Vai all''infopoint della tua città come un turista',
        'Usi l’ufficio informazioni della tua città come se fossi appena arrivato e metti alla prova il consiglio ricevuto. Entra all’infopoint, chiedi un percorso di quarantacinque minuti per vedere qualcosa che i residenti ignorano, fai la prima tappa subito e rientra a riferire allo sportello cosa hai trovato.',
        'Usi l’ufficio informazioni della tua città come se fossi appena arrivato e metti alla prova il consiglio ricevuto. Chiedi un itinerario da turista e poi vai a verificare se la tua città sa ancora sorprenderti.'
      ),
      (
        147::bigint,
        'Proponiti come comparsa per un progetto creativo oggi',
        'Proponiti come comparsa per un progetto creativo oggi',
        'Ti proponi per una prova immediata in un progetto creativo locale che ha bisogno di corpi presenti. Cerca un gruppo teatrale, set studentesco o laboratorio video con chiamata aperta per oggi, presentati senza fingere esperienza, accetta una comparsa muta o un passaggio semplice e resta fino alla fine della scena.',
        'Ti proponi per una prova immediata in un progetto creativo locale che ha bisogno di corpi presenti. Cerca un progetto che abbia bisogno di presenze vere e mettiti a disposizione anche per un ruolo minuscolo.'
      ),
      (
        152::bigint,
        'Scrivi una storia da tre parole date da uno sconosciuto',
        'Scrivi una storia da tre parole date da uno sconosciuto',
        'Scrivi una storia breve partendo da tre parole date da uno sconosciuto e tienila per te. Vai in un bar, in biblioteca o in un parco, chiedi tre parole a caso a una persona, poi usa quelle parole per comporre una pagina o qualche riga sul telefono.',
        'Scrivi una storia breve partendo da tre parole date da uno sconosciuto e tienila per te. Fatti dare tre parole da qualcuno che non conosci e usale come scintilla per qualcosa che senza quell’incontro non avresti scritto.'
      ),
      (
        155::bigint,
        'Organizza una cena dove ognuno porta una cosa mai assaggiata',
        'Organizza una cena dove ognuno porta una cosa mai assaggiata',
        'Organizza una cena o merenda in cui ognuno porta una cosa che non ha mai assaggiato prima. Invita due o tre persone, stabilisci una spesa massima ragionevole, mettete tutto al centro e fate un giro in cui ciascuno racconta cosa temeva prima del primo morso.',
        'Organizza una cena o merenda in cui ognuno porta una cosa che non ha mai assaggiato prima. Chiedi a tutti di arrivare con qualcosa di nuovo per sé e fate del primo assaggio il centro della serata.'
      ),
      (
        156::bigint,
        'Trasforma un messaggio digitale in una consegna a voce',
        'Trasforma un messaggio digitale in una consegna a voce',
        'Trasforma un messaggio digitale importante in una consegna umana nello stesso giorno. Scrivi a una persona che puoi raggiungere, chiedi se puoi dirle una cosa di persona, vai da lei e pronuncia il messaggio senza leggerlo dallo schermo.',
        'Trasforma un messaggio digitale importante in una consegna umana nello stesso giorno. Portalo di persona a qualcuno che puoi raggiungere, così il contenuto conta ma conta anche il fatto di esserci.'
      ),
      (
        166::bigint,
        'Vai stasera a uno spettacolo amatoriale che non conosci',
        'Vai stasera a uno spettacolo amatoriale che non conosci',
        'Scegli uno spettacolo amatoriale o indipendente che va in scena stasera e compri un biglietto senza conoscere nessuno del cast. Arriva dieci minuti prima, siediti vicino al fondo, resta fino agli applausi e alla fine fai una domanda precisa a una persona della compagnia sul lavoro dietro le quinte.',
        'Scegli uno spettacolo amatoriale o indipendente che va in scena stasera e compri un biglietto senza conoscere nessuno del cast. Vai senza appigli, resta fino alla fine e lascia che una scena locale ti prenda sul serio da sconosciuto.'
      ),
      (
        168::bigint,
        'Cucina un piatto straniero comprandolo in un negozio etnico',
        'Cucina un piatto straniero comprandolo in un negozio etnico',
        'Cucina oggi un piatto semplice di un Paese che non conosci partendo da un negozio alimentare gestito da persone di quella cultura. Entra in orario tranquillo, chiedi un ingrediente base e come usarlo senza fingerti esperto, compra ciò che serve e torna a dire com’è andata se il negozio è ancora aperto.',
        'Cucina oggi un piatto semplice di un Paese che non conosci partendo da un negozio alimentare gestito da persone di quella cultura. Comincia da chi quel cibo lo conosce davvero e lasciati guidare verso un ingrediente o un uso che per te è ancora nuovo.'
      ),
      (
        169::bigint,
        'Fai comporre da un fioraio un mazzo per una situazione specifica',
        'Fai comporre da un fioraio un mazzo per una situazione specifica',
        'Vai da un fioraio e chiedi di costruire un mazzo per una situazione precisa che non sia romantica: scuse, incoraggiamento, fine di un lavoro, visita difficile o buon rientro. Spiega la persona e il contesto in tre frasi, lascia che il fioraio scelga almeno un fiore che non avresti preso e consegna il mazzo oggi dicendo perché è stato composto così.',
        'Vai da un fioraio e chiedi di costruire un mazzo per una situazione precisa che non sia romantica. Fatti comporre un mazzo per un momento reale e lascia che i fiori dicano qualcosa di più di un gesto generico.'
      ),
      (
        172::bigint,
        'Chiedi al portiere di un palazzo storico di vedere un cortile',
        'Chiedi al portiere di un palazzo storico di vedere un cortile',
        'Chiedi al portiere, a un amministratore o a un residente anziano di un palazzo storico se c’è un ingresso, una scala o un cortile che si può vedere legalmente per pochi minuti. Presentati con nome e motivo, accetta un no senza insistere oppure entra solo dove ti autorizzano, poi fai una domanda sul cambiamento più grande che quel luogo ha visto.',
        'Chiedi al portiere, a un amministratore o a un residente anziano di un palazzo storico se c’è un ingresso, una scala o un cortile che si può vedere legalmente per pochi minuti. Se ti danno accesso, entra solo dove sei invitato e guarda per poco un pezzo di città che di solito resta chiuso.'
      ),
      (
        175::bigint,
        'Compra qualcosa per la persona dietro di te in fila',
        'Compra qualcosa per la persona dietro di te in fila',
        'Quando sei in fila in un bar, in pasticceria, al supermercato o in un altro posto, offri una piccola cosa alla persona dietro di te. Scegli qualcosa di semplice e sostenibile per te, dillo alla cassa prima che paghi lei e consegnalo senza trasformarlo in una scena.',
        'Quando sei in fila in un bar, in pasticceria, al supermercato o in un altro posto, offri una piccola cosa alla persona dietro di te. Falla passare come un gesto semplice e pulito, non come una scena da sottolineare troppo.'
      ),
      (
        176::bigint,
        'Fai per un''ora il lavoro di qualcuno che conosci',
        'Fai per un''ora il lavoro di qualcuno che conosci',
        'Chiedi a qualcuno che conosci di lasciarti fare per un’ora una parte innocua e reale del suo lavoro o ruolo quotidiano. Fate una lista di tre compiti consentiti, eseguili sotto supervisione, accetta correzioni immediate e alla fine chiedi qual è stata la cosa che hai sottovalutato di più.',
        'Chiedi a qualcuno che conosci di lasciarti fare per un’ora una parte innocua e reale del suo lavoro o ruolo quotidiano. Mettiti nei margini veri della sua giornata e scopri cosa cambia quando smetti di immaginarla solo da fuori.'
      ),
      (
        177::bigint,
        'Accompagna un anziano in una commissione portando la borsa',
        'Accompagna un anziano in una commissione portando la borsa',
        'Accompagna una persona anziana o temporaneamente stanca a fare una commissione breve portando tu la borsa o reggendo il passo. Proponilo a qualcuno che conosci nel palazzo, nel quartiere o in famiglia, concordate una sola destinazione, camminate al suo ritmo e lascia che sia l’altra persona a decidere la sosta finale.',
        'Accompagna una persona anziana o temporaneamente stanca a fare una commissione breve portando tu la borsa o reggendo il passo. Fai tu la parte più faticosa del tragitto e lascia che il ritmo della commissione lo decida l’altra persona.'
      ),
      (
        184::bigint,
        'Fotografa il gesto di un mestiere col consenso esplicito',
        'Fotografa il gesto di un mestiere col consenso esplicito',
        'Chiedi a una persona che lavora in un mestiere visibile di posare per una foto che racconti il suo gesto, non la sua faccia. Spiega dove resterà la foto, chiedi consenso esplicito, scatta mani, strumenti o postura mentre lavora e mostrale subito l’immagine per farla approvare o cancellare.',
        'Chiedi a una persona che lavora in un mestiere visibile di posare per una foto che racconti il suo gesto, non la sua faccia. Fotografa mani, strumenti o postura con il suo consenso, così il mestiere entra nell’immagine senza diventare posa.'
      ),
      (
        185::bigint,
        'Sfida una coppia al biliardino di un oratorio',
        'Sfida una coppia al biliardino di un oratorio',
        'Entra in un oratorio, circolo o bar con biliardino e sfida una coppia a una partita secca entrando come quarto giocatore. Chiedi se puoi unirti, accetta la squadra che ti assegnano, gioca fino alla fine e stringi la mano agli avversari dopo l’ultimo gol.',
        'Entra in un oratorio, circolo o bar con biliardino e sfida una coppia a una partita secca entrando come quarto giocatore. Chiedi di fare il quarto e lascia che la partita vi faccia conoscere più in fretta delle presentazioni.'
      ),
      (
        186::bigint,
        'Chiedi a un bibliotecario un libro da leggere',
        'Chiedi a un bibliotecario un libro da leggere',
        'Vai in biblioteca e fatti consigliare un libro da qualcuno che ci lavora invece di scegliere da solo. Dai qualche indizio su di te o sui tuoi gusti, accetta la raccomandazione senza contrattare e leggi almeno l''inizio di quello che ti suggerisce.',
        'Vai in biblioteca e fatti consigliare un libro da qualcuno che ci lavora invece di scegliere da solo. Dai a chi lavora lì qualche indizio su di te e accetta il consiglio come un piccolo atto di fiducia.'
      ),
      (
        189::bigint,
        'Fatti dare un ritmo base da un percussionista e suonalo',
        'Fatti dare un ritmo base da un percussionista e suonalo',
        'Fatti dare un ritmo base da un percussionista, da una banda di paese o da una scuola di musica e suonalo davanti a lui. Chiedi un pattern di quattro battute, ripetilo con mani, tamburello o bacchette, sbaglia pure e fatti correggere fino a chiuderlo una volta senza fermarti.',
        'Fatti dare un ritmo base da un percussionista, da una banda di paese o da una scuola di musica e suonalo davanti a lui. Imparalo da qualcuno che lo conosce davvero e chiudilo davanti a lui, anche se inciampi prima di entrarci.'
      ),
      (
        192::bigint,
        'Chiedi a qualcuno in palestra come si fa il suo esercizio',
        'Chiedi a qualcuno in palestra come si fa il suo esercizio',
        'In palestra o in un parco fitness chiedi a una persona come si esegue l''esercizio che sta facendo, se il momento e'' adatto. Aspetta che finisca la serie, chiedi una spiegazione rapida o una dimostrazione e prova il movimento solo se ti senti al sicuro.',
        'In palestra o in un parco fitness chiedi a una persona come si esegue l’esercizio che sta facendo, se il momento è adatto. Se c’è spazio per chiederlo, fatti spiegare quel movimento dal vivo invece che da uno schermo.'
      ),
      (
        193::bigint,
        'Vai a una lezione di ballo',
        'Vai a una lezione di ballo',
        'Vai a una lezione di ballo e lascia che il corpo impari qualcosa prima che la testa lo giudichi. Scegli una classe aperta ai principianti, presentati anche se non conosci nessuno e resta fino alla fine senza scusarti per gli errori.',
        'Vai a una lezione di ballo e lascia che il corpo impari qualcosa prima che la testa lo giudichi. Presentati da principiante e lascia che per una sera a guidarti siano musica, spazio e corpi degli altri.'
      ),
      (
        202::bigint,
        'Vai con un amico in un negozio e sceglietevi un outfit',
        'Vai con un amico in un negozio e sceglietevi un outfit',
        'Vai con un amico in un negozio o in un thrift store e lasciate che sia l''altro a scegliere un outfit per te. Datevi un perimetro semplice, provate almeno un completo a testa e uscite dal camerino mostrando il risultato senza smontarlo subito.',
        'Vai con un amico in un negozio o in un thrift store e lasciate che sia l’altro a scegliere un outfit per te. Datevi un perimetro semplice e lasciate che sia l’altro a vederti in un modo che da solo non avresti scelto.'
      ),
      (
        203::bigint,
        'Vai a una degustazione di vini',
        'Vai a una degustazione di vini',
        'Vai a una degustazione di vini o chiedi un piccolo assaggio guidato in enoteca senza fingere di saperne più di quello che sai. Ascolta la spiegazione, prova almeno due assaggi se disponibili e descrivi ad alta voce cosa noti davvero.',
        'Vai a una degustazione di vini o chiedi un piccolo assaggio guidato in enoteca senza fingere di saperne più di quello che sai. Assaggia con curiosità onesta e prova a dire ad alta voce cosa senti davvero, senza recitare competenza.'
      ),
      (
        204::bigint,
        'Organizza un dibattito civile su un tema leggero',
        'Organizza un dibattito civile su un tema leggero',
        'Organizzi un piccolo dibattito civile con una persona che conosci su un tema leggero ma reale. Scegliete una domanda precisa, sedetevi al bar con un timer, fate tre minuti a testa senza interrompervi e chiudete riassumendo la frase più convincente dell’altro.',
        'Organizzi un piccolo dibattito civile con una persona che conosci su un tema leggero ma reale. Scegliete una domanda precisa e trattatela come se meritasse attenzione, tempo e ascolto reciproco.'
      ),
      (
        205::bigint,
        'Gira un micro-documentario su una bottega di quartiere',
        'Gira un micro-documentario su una bottega di quartiere',
        'Giri un micro-documentario di novanta secondi su una bottega di quartiere con il consenso di chi ci lavora. Entra, spiega il progetto, riprendi tre dettagli autorizzati e una frase del titolare, poi monta tutto sul telefono e faglielo vedere prima di andare via.',
        'Giri un micro-documentario di novanta secondi su una bottega di quartiere con il consenso di chi ci lavora. Prova a raccontare in poco tempo il carattere di un posto vero e della persona che lo tiene in piedi.'
      ),
      (
        206::bigint,
        'Recluta due sconosciuti per una partita a un gioco da tavolo',
        'Recluta due sconosciuti per una partita a un gioco da tavolo',
        'Porti un gioco semplice in un luogo sociale e recluti due persone per una partita completa. Vai in una ludoteca, un circolo o un bar con tavoli liberi, proponi una partita da quindici minuti, spiega le regole in due frasi e giocate fino alla fine.',
        'Porti un gioco semplice in un luogo sociale e recluti due persone per una partita completa. Trova due persone disposte a sedersi e lascia che la partita basti da sola a creare il tavolo.'
      ),
      (
        209::bigint,
        'Vai a far volare un aquilone',
        'Vai a far volare un aquilone',
        'Prendi un aquilone e vai in un posto aperto per farlo alzare anche se non ti viene subito bene. Cerca un parco o una spiaggia con abbastanza spazio, fai qualche tentativo senza scoraggiarti e fermati solo quando l’hai visto davvero prendere il vento.',
        'Prendi un aquilone e vai in un posto aperto per farlo alzare anche se non ti viene subito bene. Resta lì finché non riesci davvero a sentirlo prendere il vento.'
      ),
      (
        211::bigint,
        'Parla con una persona più anziana della sua infanzia',
        'Parla con una persona più anziana della sua infanzia',
        'Fai una conversazione vera con una persona più anziana, che la conosca o no, chiedendole com’era la sua infanzia o la sua vita da giovane. Parti da una domanda semplice, ascolta senza portarti subito al centro e tieniti in mente almeno un dettaglio da raccontare dopo.',
        'Fai una conversazione vera con una persona più anziana, che la conosca o no, chiedendole com’era la sua infanzia o la sua vita da giovane. Parti da lì e ascolta abbastanza da uscire con un pezzo di mondo che prima non avevi.'
      ),
      (
        212::bigint,
        'Compra una usa-e-getta e cerca cinque cose suggerite da sconosciuti',
        'Compra una usa-e-getta e cerca cinque cose suggerite da sconosciuti',
        'Compra una usa-e-getta o porta con te un rullino e chiedi a degli sconosciuti cinque cose da trovare e fotografare in città. Passa la giornata a cercarle una per una, scatta solo quando le trovi davvero e tieni insieme la serie come mappa del tuo giro.',
        'Compra una usa-e-getta o porta con te un rullino e chiedi a degli sconosciuti cinque cose da trovare e fotografare in città. Lascia che la giornata si costruisca inseguendo quei cinque indizi uno dopo l’altro.'
      ),
      (
        213::bigint,
        'Vai a uno scambio linguistico',
        'Vai a uno scambio linguistico',
        'Vai a uno scambio linguistico e resta lì abbastanza da parlare davvero con qualcuno. Presentati anche se sei impacciato, fai almeno una domanda nella lingua che studi e continua la conversazione senza passare subito all’italiano.',
        'Vai a uno scambio linguistico e resta lì abbastanza da parlare davvero con qualcuno. Supera l’imbarazzo iniziale e prova a tenere viva una conversazione nella lingua che stai cercando di imparare.'
      ),
      (
        215::bigint,
        'Vai a una lezione o a un workshop di ceramica',
        'Vai a una lezione o a un workshop di ceramica',
        'Vai a una lezione o a un workshop di ceramica e lascia che le mani sbaglino davanti a qualcuno. Prova il tornio o una tecnica base, segui le indicazioni dell''insegnante e porta a termine un pezzo anche se viene storto.',
        'Vai a una lezione o a un workshop di ceramica e lascia che le mani sbaglino davanti a qualcuno. Mettiti al tavolo o al tornio e lascia che il pezzo venga storto se necessario, purché venga davvero dalle tue mani.'
      ),
      (
        217::bigint,
        'Compra due biglietti e invita un estraneo a entrare',
        'Compra due biglietti e invita un estraneo a entrare',
        'Compri due ingressi economici per un evento locale e ne offri uno a una persona che accetta di entrare con te. Scegli teatro amatoriale, conferenza, concerto di scuola o presentazione in biblioteca, spiega l’invito senza insistere e sedetevi vicini almeno per la prima parte.',
        'Compri due ingressi economici per un evento locale e ne offri uno a una persona che accetta di entrare con te. Offrine uno a uno sconosciuto disposto a fidarsi e condividete almeno l’inizio di quell’esperienza.'
      ),
      (
        223::bigint,
        'Componi un piatto freddo con ingredienti consigliati da tre persone',
        'Componi un piatto freddo con ingredienti consigliati da tre persone',
        'Componi un piatto freddo da condividere usando solo ingredienti consigliati da tre persone diverse. Chiedi a un fruttivendolo, a un panettiere e a una persona di casa un ingrediente ciascuno, assemblali in un piatto unico e fallo assaggiare a uno dei tre spiegando la catena.',
        'Componi un piatto freddo da condividere usando solo ingredienti consigliati da tre persone diverse. Fatti suggerire un ingrediente da tre persone diverse e vedi che cosa succede quando li fai stare nello stesso piatto.'
      ),
      (
        225::bigint,
        'Chiedi in biblioteca un libro per una curiosità precisa',
        'Chiedi in biblioteca un libro per una curiosità precisa',
        'Chiedi in biblioteca un libro non per titolo, ma per una ferita o una curiosità precisa di oggi. Formula una richiesta concreta al bibliotecario, accetta la prima proposta argomentata, poi leggi dieci righe lì davanti e dici se ha centrato il punto.',
        'Chiedi in biblioteca un libro non per titolo, ma per una ferita o una curiosità precisa di oggi. Presenta una curiosità o un punto scoperto reale e vedi se qualcuno sa trovarti il libro giusto per questo momento.'
      ),
      (
        227::bigint,
        'Organizza un aperitivo con tre persone che non si conoscono',
        'Organizza un aperitivo con tre persone che non si conoscono',
        'Organizza per stasera un aperitivo minuscolo con tre persone che di solito non si siedono insieme. Manda l’invito entro mezzogiorno, compra una cosa salata e una bottiglia, prepara quattro sedie e apri il tavolo con una domanda concreta: “da dove è iniziata la tua giornata?”',
        'Organizza per stasera un aperitivo minuscolo con tre persone che di solito non si siedono insieme. Metti intorno allo stesso tavolo tre persone che non si incontrano mai così e dai alla serata un’apertura abbastanza semplice da farla partire.'
      ),
      (
        235::bigint,
        'Fai la spesa chiedendo agli altri cosa comprare',
        'Fai la spesa chiedendo agli altri cosa comprare',
        'Al supermercato o al mercato, ogni volta che devi scegliere qualcosa chiedi a una persona vicina quale prendere e accetta la risposta. Fallo per alcuni acquisti reali, come una verdura, uno snack o un formato di pasta, e porta a casa almeno tre scelte che non avresti fatto da solo.',
        'Al supermercato o al mercato, ogni volta che devi scegliere qualcosa chiedi a una persona vicina quale prendere e accetta la risposta. Per qualche acquisto reale lascia scegliere agli altri e porta a casa un piccolo paniere che non avresti composto da solo.'
      ),
      (
        251::bigint,
        'Prova un''arrampicata indoor con un istruttore',
        'Prova un''arrampicata indoor con un istruttore',
        'Prova un’arrampicata indoor in cui la parte strana non è salire, ma affidarti a qualcuno che tiene la corda. Cerca una palestra con ingresso giornaliero, prenota una prova assistita, dì all’istruttore che è la tua prima volta e fai almeno una salita completa con imbrago e discesa controllata.',
        'Prova un’arrampicata indoor in cui la parte strana non è salire, ma affidarti a qualcuno che tiene la corda. Affidati a un istruttore e a una corda tenuta da qualcun altro, così la sfida non è solo salire ma lasciarti sostenere.'
      ),
      (
        252::bigint,
        'Impara a presentarti in Lingua dei Segni Italiana',
        'Impara a presentarti in Lingua dei Segni Italiana',
        'Impari a presentarti in Lingua dei Segni Italiana da una persona che la conosce davvero. Contatta un’associazione sordi, un corso locale o un conoscente competente, chiedi dieci minuti per imparare nome e saluto, poi ripeti davanti a loro finché ti correggono almeno una volta.',
        'Impari a presentarti in Lingua dei Segni Italiana da una persona che la conosce davvero. Fatti insegnare da chi la usa o la conosce bene e ripeti il tuo nome e il saluto finché iniziano ad appartenerti.'
      ),
      (
        254::bigint,
        'Scrivi un messaggio e lascialo in un posto pubblico',
        'Scrivi un messaggio e lascialo in un posto pubblico',
        'Scrivi un messaggio, una nota o una piccola lettera su qualcosa che ti va di dire e lascialo in un posto pubblico dove qualcuno possa trovarlo. Scegli un punto adatto e rispettoso, scrivi in modo leggibile e vai via senza controllare chi lo prenderà.',
        'Scrivi un messaggio, una nota o una piccola lettera su qualcosa che ti va di dire e lascialo in un posto pubblico dove qualcuno possa trovarlo. Lascialo in un punto adatto e rispettoso, poi accetta che la storia continui senza di te.'
      ),
      (
        255::bigint,
        'Cucina un piatto con un ingrediente che di solito eviti',
        'Cucina un piatto con un ingrediente che di solito eviti',
        'Prepari un piatto usando un ingrediente che di solito eviti per pigrizia, paura o pregiudizio. Compra quell’ingrediente in un mercato o alimentari, chiedi al venditore una cottura semplice, cucinalo entro sera e manda una foto del risultato proprio alla persona che ti ha dato il consiglio.',
        'Prepari un piatto usando un ingrediente che di solito eviti per pigrizia, paura o pregiudizio. Parti da qualcosa che scarti sempre e dagli una possibilità vera, facendoti guidare da chi lo conosce meglio di te.'
      ),
      (
        257::bigint,
        'Fatti tracciare un percorso a mano e segui solo quello',
        'Fatti tracciare un percorso a mano e segui solo quello',
        'Ti fai disegnare a mano un percorso da qualcuno e lo segui davvero. Chiedi a un passante disponibile, a un barista o a un edicolante come raggiungere un posto preciso del quartiere, fatti tracciare la strada su carta, poi percorri solo quelle indicazioni e torna a dire se hanno funzionato.',
        'Ti fai disegnare a mano un percorso da qualcuno e lo segui davvero. Segui solo quella traccia, come se per un tratto la tua città dovesse passare attraverso la mano di qualcun altro.'
      ),
      (
        261::bigint,
        'Fatti spiegare le preparazioni di una farmacia galenica',
        'Fatti spiegare le preparazioni di una farmacia galenica',
        'Scopri se nella tua zona esiste ancora una farmacia che prepara qualcosa su misura e parli con chi lo fa. Cerca una farmacia con laboratorio galenico, vai al banco in un momento tranquillo, chiedi quali preparazioni fanno davvero lì e fatti spiegare un passaggio non riservato del lavoro.',
        'Scopri se nella tua zona esiste ancora una farmacia che prepara qualcosa su misura e parli con chi lo fa. Entra in una farmacia galenica e fatti spiegare che cosa viene ancora preparato davvero su misura.'
      ),
      (
        268::bigint,
        'Ricostruisci la linea familiare del tuo cognome materno',
        'Ricostruisci la linea familiare del tuo cognome materno',
        'Ricostruisci una linea familiare spesso lasciata in ombra partendo da un cognome materno. Chiedi a un parente o a un ufficio anagrafe quali nomi ci sono dietro quel ramo, scrivi almeno tre passaggi su carta e manda la foto della mini-genealogia alla persona che ti ha aiutato.',
        'Ricostruisci una linea familiare spesso lasciata in ombra partendo da un cognome materno. Parti da quel ramo e metti su carta qualche passaggio che di solito resta ai margini dei racconti di famiglia.'
      ),
      (
        274::bigint,
        'Prova una lezione introduttiva di scherma',
        'Prova una lezione introduttiva di scherma',
        'Prova una lezione introduttiva di scherma o di un’altra disciplina con regole formali e un gesto di ingresso preciso. Cerca oggi una sala con prova serale, prenota al telefono, presentati dichiarando che è la tua prima volta e fai almeno un assalto guidato fino al saluto finale.',
        'Prova una lezione introduttiva di scherma o di un’altra disciplina con regole formali e un gesto di ingresso preciso. Entra in una pratica con saluti, regole e postura propri e lascia che anche la forma faccia parte dell’esperienza.'
      ),
      (
        275::bigint,
        'Organizza un ritratto fotografico serio con chi vive con te',
        'Organizza un ritratto fotografico serio con chi vive con te',
        'Organizza oggi un ritratto fotografico serio con le persone con cui vivi o con due parenti disponibili. Scegli un punto della casa, assegna a ciascuno un oggetto da tenere in mano, scatta dieci foto con autoscatto e manda entro sera quella scelta al gruppo.',
        'Organizza oggi un ritratto fotografico serio con le persone con cui vivi o con due parenti disponibili. Mettetevi in posa come se l’immagine dovesse restare, non solo riempire il telefono per un minuto.'
      ),
      (
        276::bigint,
        'Commissiona oggi un piccolo lavoro a un creativo locale',
        'Commissiona oggi un piccolo lavoro a un creativo locale',
        'Dai oggi a un creativo locale una micro-commissione pagata e molto specifica. Entra da un illustratore, ceramista, fiorista creativo o artigiano, chiedi una cosa realizzabile in giornata sotto i suoi occhi e fatti spiegare una scelta mentre la prepara.',
        'Dai oggi a un creativo locale una micro-commissione pagata e molto specifica. Commissionagli una cosa piccola ma vera e guarda da vicino come prende forma davanti a te.'
      ),
      (
        278::bigint,
        'Crea una salsa originale e fattela criticare da un amico',
        'Crea una salsa originale e fattela criticare da un amico',
        'Crea oggi una salsa, crema o condimento originale e falla assaggiare a qualcuno che non vive con te. Compra tre ingredienti precisi, prepara una piccola dose, portala in un barattolo pulito a un amico o collega e chiedi una modifica secca: più acido, più dolce, più forte o più semplice.',
        'Crea oggi una salsa, crema o condimento originale e falla assaggiare a qualcuno che non vive con te. Portala fuori casa e chiedi un giudizio netto che ti costringa a decidere in che direzione spingerla.'
      ),
      (
        284::bigint,
        'Leggi venti pagine di un libro dimenticato sullo scaffale',
        'Leggi venti pagine di un libro dimenticato sullo scaffale',
        'Leggi venti pagine di un libro che possiedi da tempo ma non hai mai aperto. Prendi il volume dimenticato dallo scaffale, siediti in un punto comodo della casa e leggi senza saltare finché non chiudi venti pagine intere.',
        'Leggi venti pagine di un libro che possiedi da tempo ma non hai mai aperto. Apri finalmente quel libro dimenticato e concedigli una possibilità vera, non solo uno sguardo di colpa.'
      ),
      (
        286::bigint,
        'Ascolta un album dall''inizio alla fine senza fare altro',
        'Ascolta un album dall''inizio alla fine senza fare altro',
        'Ascolta un album dall''inizio alla fine senza fare nient''altro. Scegli un disco di un artista che ti incuriosisce o che amavi anni fa, sdraiati o siediti senza schermo aperto e segnati quale traccia ti è arrivata di più.',
        'Ascolta un album dall’inizio alla fine senza fare nient’altro. Scegli un disco e trattalo come un’esperienza intera, non come un sottofondo da consumare a pezzi.'
      ),
      (
        288::bigint,
        'Scrivi tre pagine a mano su un ricordo che ti torna',
        'Scrivi tre pagine a mano su un ricordo che ti torna',
        'Scrivi tre pagine a mano su una persona, un giorno o un rimpianto che ti torna spesso. Prendi carta e penna, mettiti dove non vieni interrotto e continua a scrivere anche quando non sai cosa dire finché tre pagine sono piene.',
        'Scrivi tre pagine a mano su una persona, un giorno o un rimpianto che ti torna spesso. Segui quel ricordo finché smette di girarti in testa e prende una forma sulla carta.'
      ),
      (
        291::bigint,
        'Apparecchia una cena seria anche se ceni da solo',
        'Apparecchia una cena seria anche se ceni da solo',
        'Prepara una cena semplice in modo intenzionale invece di rimediare. Cucina con la radio accesa o nel silenzio, apparecchia anche solo per te con tovaglia e piatto vero, e mangia seduto fino alla fine senza il telefono accanto.',
        'Prepara una cena semplice in modo intenzionale invece di rimediare. Apparecchiala come se meritasse davvero la tua attenzione, anche se al tavolo ci sei solo tu.'
      ),
      (
        300::bigint,
        'Scrivi una lettera al tuo io futuro e sigillala',
        'Scrivi una lettera al tuo io futuro e sigillala',
        'Scrivi una lettera a una versione futura di te e chiudila finché non sarà il momento di riaprirla. Prendi un foglio, scrivi qualche riga onesta su come stai e scegli una data abbastanza lontana, come tra un anno o più.',
        'Scrivi una lettera a una versione futura di te e chiudila finché non sarà il momento di riaprirla. Sigillala con una data abbastanza lontana da farne un incontro con una versione diversa di te.'
      ),
      (
        303::bigint,
        'Disegna la vista dalla tua finestra',
        'Disegna la vista dalla tua finestra',
        'Disegna la vista dalla tua finestra senza darti un tempo minimo da rispettare. Prendi carta e una matita qualsiasi, schizza ciò che vedi con calma e fermati quando senti di aver davvero guardato il posto in cui sei.',
        'Disegna la vista dalla tua finestra senza darti un tempo minimo da rispettare. Resta abbastanza con quel pezzo di paesaggio da accorgerti di dettagli che di solito lasci passare.'
      ),
      (
        304::bigint,
        'Crea una playlist breve pensata per una persona',
        'Crea una playlist breve pensata per una persona',
        'Costruisci una playlist breve pensata per una persona specifica e mandagliela. Scegli un amico o familiare, metti insieme otto canzoni con un motivo in mente, dai alla playlist un titolo riconoscibile e mandagliela con una frase di spiegazione.',
        'Costruisci una playlist breve pensata per una persona specifica e mandagliela. Metti insieme poche canzoni con un’intenzione precisa e mandale come si manderebbe un piccolo messaggio lungo.'
      ),
      (
        306::bigint,
        'Cucina un piatto di una regione italiana che non conosci',
        'Cucina un piatto di una regione italiana che non conosci',
        'Cucina oggi un piatto di una regione italiana che non conosci bene. Scegli Sardegna, Friuli, Calabria, Basilicata o un''altra regione lontana dalla tua, segui una ricetta semplice trovata online e mangia leggendo qualche riga sul piatto e su dove nasce.',
        'Cucina oggi un piatto di una regione italiana che non conosci bene. Scegli una regione che conosci poco e usala come scusa per entrare in un altro pezzo del paese.'
      ),
      (
        307::bigint,
        'Guarda un documentario su un argomento di cui non sai nulla',
        'Guarda un documentario su un argomento di cui non sai nulla',
        'Guarda un documentario di trenta minuti su un argomento di cui non sai nulla. Scegli un tema che ti spaventa o ti sembra noioso di solito, guardalo dall''inizio alla fine senza fare altro e scrivi tre cose imparate prima di andare a dormire.',
        'Guarda un documentario di trenta minuti su un argomento di cui non sai nulla. Scegli un tema che di solito lasci da parte e resta lì abbastanza da uscirne con domande nuove.'
      ),
      (
        308::bigint,
        'Cerca online un fatto storico sulla via in cui vivi',
        'Cerca online un fatto storico sulla via in cui vivi',
        'Scopri un fatto storico sulla via in cui vivi cercandolo online. Apri un motore di ricerca, scrivi nome della via e città, leggi due o tre fonti diverse e trova un fatto verificabile che potresti raccontare al primo vicino che incontrerai.',
        'Scopri un fatto storico sulla via in cui vivi cercandolo online. Trova qualcosa di verificabile che trasformi quella strada in un posto con una memoria, non solo con un nome.'
      ),
      (
        312::bigint,
        'Impara un trucco di magia e mostralo a qualcuno',
        'Impara un trucco di magia e mostralo a qualcuno',
        'Impari un piccolo trucco di magia abbastanza bene da eseguirlo davanti a una persona entro sera. Cerca un tutorial di tre minuti su una carta forzata, una moneta che sparisce o un nodo che si scioglie, esercitati almeno venti volte da solo e poi presentalo a chi vive con te o a un amico raggiungibile oggi.',
        'Impari un piccolo trucco di magia abbastanza bene da eseguirlo davanti a una persona entro sera. Allenalo abbastanza da poterlo fare davvero davanti a qualcuno, con tutta la piccola tensione che serve.'
      ),
      (
        313::bigint,
        'Raccogli ricette di famiglia e mettile insieme',
        'Raccogli ricette di famiglia e mettile insieme',
        'Raccogli alcune ricette di famiglia e inizia a metterle insieme in un piccolo quaderno o file tutto tuo. Chiedi ingredienti e procedimento a parenti o persone vicine, trascrivi quello che ricevi e organizza le ricette in modo che restino.',
        'Raccogli alcune ricette di famiglia e inizia a metterle insieme in un piccolo quaderno o file tutto tuo. Comincia a ordinarle come se stessi mettendo insieme un patrimonio domestico che vale la pena tenere.'
      ),
      (
        314::bigint,
        'Impara a piegare un origami',
        'Impara a piegare un origami',
        'Impara a piegare un origami semplice senza pretendere di saperlo fare a memoria. Scegli una figura, segui un tutorial passo dopo passo e ripeti finché ti esce almeno una versione di cui sei soddisfatto.',
        'Impara a piegare un origami semplice senza pretendere di saperlo fare a memoria. Segui i passaggi fino a ottenere una figura che ti convinca almeno una volta, senza pretendere di dominarla subito.'
      ),
      (
        315::bigint,
        'Vai a una lettura dei tarocchi',
        'Vai a una lettura dei tarocchi',
        'Vai a una lettura dei tarocchi senza dover arrivare con una domanda perfetta o una tesi da difendere. Cerca una persona o un posto che ti ispiri abbastanza, presentati con curiosità e ascolta quello che emerge senza decidere subito cosa farne.',
        'Vai a una lettura dei tarocchi senza dover arrivare con una domanda perfetta o una tesi da difendere. Presentati con curiosità e lascia che il senso stia nell’incontro e in quello che ti smuove, non nell’obbligo di crederci.'
      ),
      (
        316::bigint,
        'Trova il miglior punto della tua zona per il tramonto',
        'Trova il miglior punto della tua zona per il tramonto',
        'Trovi il miglior punto della tua zona per guardare il tramonto e ti fermi lì fino al cambio di luce. Controlla l''orario esatto, scegli tre punti candidati con vista verso ovest come un tetto pubblico, una collinetta o un ponte, valutali in successione e resta nell''ultimo finché la luce è completamente andata.',
        'Trovi il miglior punto della tua zona per guardare il tramonto e ti fermi lì fino al cambio di luce. Scegli qualche punto rivolto a ovest e vai a capire quale regala davvero la luce che stavi cercando.'
      ),
      (
        317::bigint,
        'Ascolta trenta minuti di un genere musicale che hai sempre evitato',
        'Ascolta trenta minuti di un genere musicale che hai sempre evitato',
        'Ascolti trenta minuti di un genere musicale che hai sempre evitato. Scegli jazz d''avanguardia, K-pop, opera lirica, drone metal, musica classica indiana o qualunque genere ti respinga, cerca una playlist o un album rappresentativo e ascolta senza saltare finché qualcosa ti incuriosisce sul serio.',
        'Ascolti trenta minuti di un genere musicale che hai sempre evitato. Dai a quel genere il tempo necessario per smettere di essere solo un rifiuto automatico.'
      ),
      (
        318::bigint,
        'Impara a giocolare con tre oggetti per qualche secondo',
        'Impara a giocolare con tre oggetti per qualche secondo',
        'Impari oggi a giocolare con tre oggetti almeno per qualche secondo. Usa tre palline da tennis, calzini arrotolati o arance, segui un tutorial breve, esercitati in piedi davanti a un letto o un divano per non rincorrere nulla e ti fermi quando riesci a fare tre lanci consecutivi senza farne cadere uno.',
        'Impari oggi a giocolare con tre oggetti almeno per qualche secondo. Prendi tre oggetti qualunque e resta abbastanza da strappare ai tuoi lanci qualche secondo di equilibrio.'
      ),
      (
        319::bigint,
        'Impara a riconoscere cinque costellazioni stasera',
        'Impara a riconoscere cinque costellazioni stasera',
        'Esci stasera e impari a riconoscere cinque costellazioni o stelle precise. Apri un''app di astronomia o una mappa stellare, raggiungi un punto lontano dalle luci forti, identifica cinque oggetti celesti con il loro nome e prova a ritrovarne uno senza guardare lo schermo prima di rientrare.',
        'Esci stasera e impari a riconoscere cinque costellazioni o stelle precise. Usa una mappa stellare per orientarti, poi prova a ritrovarne almeno una senza tornare subito allo schermo.'
      ),
      (
        321::bigint,
        'Vai a vedere l''alba di domani da un punto preciso',
        'Vai a vedere l''alba di domani da un punto preciso',
        'Vai a vedere l''alba di domani da un punto preciso che scegli oggi. Controlla l''ora del sorgere del sole, individua un belvedere, una panchina o una finestra rivolti a est, imposta la sveglia in modo da essere lì cinque minuti prima e resta almeno fino al primo quarto d''ora di luce.',
        'Vai a vedere l’alba di domani da un punto preciso che scegli oggi. Scegli un posto rivolto a est e presentati davvero all’appuntamento con la prima luce.'
      ),
      (
        323::bigint,
        'Scrivi la tua lista personale dei dieci posti del cuore',
        'Scrivi la tua lista personale dei dieci posti del cuore',
        'Stila oggi una tua lista personale dei dieci luoghi della tua città che consiglieresti se qualcuno te lo chiedesse. Scrivi i posti a mano con una riga di motivazione per ciascuno, tienila in un quaderno o nelle note del telefono e usala la prossima volta che ti capiterà una richiesta del genere.',
        'Stila oggi una tua lista personale dei dieci luoghi della tua città che consiglieresti se qualcuno te lo chiedesse. Mettili per iscritto con un motivo per ciascuno, così la tua città prende la forma di una geografia personale.'
      )
  )
  UPDATE public.side_quests AS sq
  SET
    title = updates.new_title,
    summary = updates.new_summary,
    updated_at = now()
  FROM updates
  WHERE sq.id = updates.id
    AND sq.title = updates.old_title
    AND sq.summary = updates.old_summary;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count <> expected_count THEN
    RAISE EXCEPTION 'Expected % side quests to update, updated %', expected_count, updated_count;
  END IF;
END $migration$;

COMMIT;
