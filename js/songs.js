// Fogelwuid – Songdatenbank
// Tonarten: Dur / Moll  |  Energy: 1 (ruhig) – 10 (pumpend)
// Stimmungen: energiegeladen, feierlich, melancholisch, romantisch, ausgelassen, entspannt, nachdenklich, kraftvoll
// Situationen: konzert, festival, outdoor, party, hochzeit, bar, akustik, zugabe

const SONGS = [
  {
    id: 1,
    title: "Wildfeuer",
    key: "E-Moll",
    tempo: 138,
    duration: "4:12",
    mood: ["energiegeladen", "kraftvoll", "ausgelassen"],
    situation: ["konzert", "festival", "outdoor"],
    energy: 10,
    description: "Harter Opener – bringt die Menge sofort in Fahrt",
    lyrics: `STROPHE 1:
Feuer bricht aus altem Stein
Glut, die niemals wird allein
Wir sind wild und wir sind frei
Fogelwuid – da sind wir dabei

STROPHE 2:
Sturm zieht über Berg und Tal
Wir steh'n hier zum letzten Mal
Nein, zum ersten – spür die Kraft
Die uns durch die Nacht erschafft

REFRAIN:
Wildfeuer, Wildfeuer
Brennt in uns'rer Brust
Wildfeuer, Wildfeuer
Voller Lebenslust
Hey – Hey – Hey!

BRIDGE:
(Gitarren-Solo)
Die Nacht gehört uns, die Nacht gehört uns!

REFRAIN (2x)

OUTRO:
Feuer ... Feuer ... Feuer!`
  },
  {
    id: 2,
    title: "Hoamatland",
    key: "G-Dur",
    tempo: 96,
    duration: "3:58",
    mood: ["feierlich", "nachdenklich", "romantisch"],
    situation: ["konzert", "akustik", "zugabe"],
    energy: 5,
    description: "Herzstück – Heimatlied das bewegt",
    lyrics: `STROPHE 1:
Wenn i woascht, wo i herkimm
Dann waaß i, wer i bin
Die Berge steh'n wie immer do
I kimm immer wieder hin

STROPHE 2:
Der Nebel liegt im Tal
Die Sonne bricht durch's Gras
Hier hab i alles gfundn
Was mir immer gfehlt hat

REFRAIN:
Hoamatland, Hoamatland
Du bist alles was ich hab
Hoamatland, Hoamatland
Bis ich einmal geh

PRE-CHORUS:
Und wenn i weit weg bin
Dann träum ich nur von dir
Mein Hoamatland, mein Hoamatland
Du bist immer bei mir

REFRAIN

OUTRO:
Hoamatland ... (ritardando)`
  },
  {
    id: 3,
    title: "Sturmwind",
    key: "A-Moll",
    tempo: 152,
    duration: "3:34",
    mood: ["energiegeladen", "kraftvoll"],
    situation: ["konzert", "festival", "outdoor"],
    energy: 10,
    description: "Moshpit-Garantie – nicht für schwache Nerven",
    lyrics: `STROPHE 1:
Schwarze Wolken zieh'n heran
Der Donner rollt am Horizont
Wir steh'n hier – wir halten stand
Bis jeder von uns aufgeht

REFRAIN:
Sturmwind, Sturmwind
Reiß uns mit in die Nacht
Sturmwind, Sturmwind
Hat uns stark gemacht
Sturmwind – STURMWIND!

STROPHE 2:
Blitz erhellt den Abendhimmel
Regen prasselt auf uns ein
Doch wir tanzen durch den Sturm
Lass uns heute unsterblich sein

REFRAIN

BRIDGE:
Wir sind der Sturm – YEAH!
Wir sind das Feuer – YEAH!
Niemand kann uns stoppen – YEAH!

REFRAIN (2x)`
  },
  {
    id: 4,
    title: "Alpenglüh'n",
    key: "D-Dur",
    tempo: 112,
    duration: "4:28",
    mood: ["feierlich", "romantisch", "nachdenklich"],
    situation: ["konzert", "hochzeit", "akustik"],
    energy: 6,
    description: "Ballade mit Alpencharakter – emotional und stark",
    lyrics: `STROPHE 1:
Wenn die Sonne hinter'm Berg verschwindet
Und das Abendrot den Himmel zündet
Steh i do und schau hinauf
Das Alpenglüh'n nimmt seinen Lauf

STROPHE 2:
In deinen Augen seh ich's leuchten
Wie die Gipfel sich im Licht aufweichen
Keine Worte braucht's dafür
Nur dich und mich – ich bin bei dir

REFRAIN:
Alpenglüh'n, Alpenglüh'n
Brennst in meinem Herz
Alpenglüh'n, Alpenglüh'n
Treibst mir fast die Tränen her
Alpenglüh'n

BRIDGE:
(Instrumentalpassage – Geige solo)
Schönheit, die kein Mensch erschaffen kann

REFRAIN

OUTRO:
Alpenglüh'n ... (molto rit.)`
  },
  {
    id: 5,
    title: "Bier & Brüder",
    key: "E-Dur",
    tempo: 130,
    duration: "3:22",
    mood: ["ausgelassen", "feierlich", "energiegeladen"],
    situation: ["party", "festival", "bar", "konzert"],
    energy: 9,
    description: "Mitgrölsong – Publikum macht alles selbst",
    lyrics: `STROPHE 1:
Glas hoch, Freunde, glas hoch
Heute Nacht gehört uns noch
Kein Morgen, kein Gestern
Nur jetzt und nur wir

STROPHE 2:
Von weit her sind wir gekommen
Haben alles mitgenommen
Was das Herz so braucht im Leben:
Musik und Bier und gutes Geben

REFRAIN:
Bier & Brüder – das ist alles
Bier & Brüder – was man braucht
Bier & Brüder – heut' und immer
Bier & Brüder – PROST!

MITSING-TEIL:
Hey! (Hey!) Ho! (Ho!)
Hey! (Hey!) Ho! (Ho!)
Trink, Bruder, trink!
(Publikum antwortet)

REFRAIN (2x)

OUTRO:
PROST! ... PROST! ... PROST!`
  },
  {
    id: 6,
    title: "Leise Wasser",
    key: "C-Dur",
    tempo: 72,
    duration: "5:02",
    mood: ["entspannt", "romantisch", "melancholisch"],
    situation: ["akustik", "hochzeit", "bar"],
    energy: 2,
    description: "Ruhige Ballade – für stille Momente",
    lyrics: `STROPHE 1:
Leise Wasser rauschen sacht
Durch die stille Sommernacht
Und ich denk' an dich allein
Wird das immer so schön sein?

STROPHE 2:
Mondlicht tanzt auf dem Gewässer
Alles scheint ein bisschen besser
Wenn dein Name in mir klingt
Wie ein Lied, das niemand singt

REFRAIN:
Leise Wasser, leise Wasser
Tragt mein Herz zu ihr
Leise Wasser, leise Wasser
Sagt ihr, ich bin hier

BRIDGE:
Stille – nur die Natur
Stille – und du bist's nur

REFRAIN

OUTRO:
(Piano solo, fade out)`
  },
  {
    id: 7,
    title: "Auf geht's",
    key: "A-Dur",
    tempo: 145,
    duration: "3:10",
    mood: ["ausgelassen", "energiegeladen"],
    situation: ["konzert", "party", "festival", "outdoor"],
    energy: 9,
    description: "Absoluter Partykracher – niemand sitzt mehr",
    lyrics: `STROPHE 1:
Die Band kommt rein – die Menge brüllt
Das Bier ist kalt, die Nacht gefüllt
Mit Musik, Lärm und Licht
Heute Nacht hält uns nichts

REFRAIN:
Auf geht's – auf geht's
Los geht die wilde Nacht
Auf geht's – auf geht's
Bis der Morgen lacht
Auf geht's!

STROPHE 2:
Jeder tanzt, keiner schläft
Die Lautstärke uns bebt
Arme hoch, Köpfe dreh'n
Heute lassen wir los!

REFRAIN

BREAKDOWN:
(Alle)
AUF GEHT'S – AUF GEHT'S – AUF GEHT'S!

REFRAIN (3x)`
  },
  {
    id: 8,
    title: "Bergkristall",
    key: "Fis-Moll",
    tempo: 88,
    duration: "4:44",
    mood: ["nachdenklich", "melancholisch", "romantisch"],
    situation: ["akustik", "konzert", "hochzeit"],
    energy: 4,
    description: "Tiefgründiges Lied über Vergänglichkeit und Schönheit",
    lyrics: `STROPHE 1:
Klarer als das Bergewasser
Reiner als der Morgentau
Liegt die Wahrheit in deinen Augen
Bergkristall – so wunderschön genau

STROPHE 2:
Jahre gehen, Menschen kommen
Manches bleibt und manches geht
Nur die Schönheit dieser Momente
Die in unsern Herzen steht

REFRAIN:
Bergkristall, Bergkristall
Breche das Licht in tausend Farben
Bergkristall, Bergkristall
Lass mich seh'n was wirklich war'

BRIDGE:
Manchmal ist das Leben grau
Dann leuchte du – leucht' klar und rau

REFRAIN

OUTRO:
(Geige und Akustikgitarre)`
  },
  {
    id: 9,
    title: "Nacht ohne Ende",
    key: "B-Moll",
    tempo: 118,
    duration: "4:05",
    mood: ["nachdenklich", "melancholisch", "kraftvoll"],
    situation: ["konzert", "bar", "akustik"],
    energy: 6,
    description: "Rock-Ballade mit emotionalem Aufbau",
    lyrics: `STROPHE 1:
Die Straße liegt vor mir verlassen
Kein Stern, kein Licht, kein Zeichen mehr
Ich geh durch dunkle, stille Gassen
Und such' was ich nicht finden kann

STROPHE 2:
Mein Schatten folgt mir schweigend
Wie ein alter Freund im Dunkel
Ich lass' ihn gehen – er bleibt dabei
Der Schmerz macht mich nicht kleinlich

REFRAIN:
Nacht ohne Ende
Ich finde keinen Weg
Nacht ohne Ende
Wo führt mich dieser Steg?
Nacht ohne Ende – doch ich geh' weiter

BRIDGE:
Aber irgendwo ... da brennt noch ein Licht
Und irgendwann ... find ich's – versprochen!

REFRAIN

OUTRO:
Nacht ... ohne Ende ...
(crescendo zum letzten Akkord)`
  },
  {
    id: 10,
    title: "Freie Seele",
    key: "D-Dur",
    tempo: 126,
    duration: "3:48",
    mood: ["feierlich", "ausgelassen", "energiegeladen"],
    situation: ["konzert", "festival", "outdoor", "party"],
    energy: 8,
    description: "Freiheitshymne – macht Lust auf mehr",
    lyrics: `STROPHE 1:
Keine Ketten, keine Mauern
Nur der Wind und meine Seele
Über Täler, über Berge
Trägt mich fort auf langen Wegen

STROPHE 2:
Bin ich hier, bin ich dort
Lebe jeden Augenblick
Nehme alles was das Leben
Bietet ohne einen Trick

REFRAIN:
Freie Seele, freie Seele
Fliege in den Morgen
Freie Seele, freie Seele
Keine Angst, kein Sorgen
Freie Seele – ich bin frei!

MITSING-TEIL:
(Alle) Frei – frei – frei!
Heute gehört die Welt uns!

REFRAIN (2x)

OUTRO:
Frei ... immer frei ...`
  },
  {
    id: 11,
    title: "Herzschlag",
    key: "C-Moll",
    tempo: 104,
    duration: "4:20",
    mood: ["kraftvoll", "energiegeladen", "feierlich"],
    situation: ["konzert", "festival"],
    energy: 8,
    description: "Starkes Rockstück – fühlt den Herzschlag",
    lyrics: `STROPHE 1:
Pulst du noch? Spürst du's noch?
Dieses Feuer, das lodert hoch
Jede Note, jeder Schlag
Macht aus Nacht einen neuen Tag

REFRAIN:
Herzschlag – Herzschlag
Schlägt für dich und mich
Herzschlag – Herzschlag
Hält uns aufrecht, siehst du's nicht?
HERZSCHLAG!

STROPHE 2:
Kein Moment wird vergessen
Alles hat uns besessen
Diese Nacht, diese Band
Hält uns fest – Hand in Hand

REFRAIN

BRIDGE:
(Schlagzeug-Solo)
Boom-Boom – Boom-Boom – YEAH!

REFRAIN (2x)`
  },
  {
    id: 12,
    title: "Sommernacht",
    key: "G-Dur",
    tempo: 88,
    duration: "4:38",
    mood: ["romantisch", "entspannt", "feierlich"],
    situation: ["hochzeit", "bar", "outdoor", "akustik"],
    energy: 4,
    description: "Perfekt für laue Sommernächte",
    lyrics: `STROPHE 1:
Sterne über'm Dach der Welt
Die Wärme sanft auf unsrer Haut
Der Abend hält was er versprochen
Ein Traum aus dem die Liebe laut

STROPHE 2:
Dein Lachen klingt wie Glockenspiel
Die Nacht ist jung und wir sind's auch
Lass uns bleiben bis zum Morgen
Bis der Tau liegt auf dem Bauch

REFRAIN:
Sommernacht, Sommernacht
Hält die Zeit für uns an
Sommernacht, Sommernacht
Was du mit mir hast getan
Du Sommernacht

BRIDGE:
Tanzen wir ... bis die Sonne steigt
Lieben wir ... bis das Dunkel weicht

REFRAIN

OUTRO:
Sommernacht ... (ritardando zum Ende)`
  },
  {
    id: 13,
    title: "Rausch der Freiheit",
    key: "E-Dur",
    tempo: 148,
    duration: "3:28",
    mood: ["energiegeladen", "kraftvoll", "ausgelassen"],
    situation: ["konzert", "festival", "outdoor"],
    energy: 10,
    description: "Maximale Energie – der Saal explodiert",
    lyrics: `STROPHE 1:
Tausend Volt durch die Adern
Die Menge schreit im Gleichklang
Keine Grenzen, keine Wände
Nur die Musik und ihr Gesang

REFRAIN:
Rausch der Freiheit – triff mich jetzt
Rausch der Freiheit – alles setzt
Rausch der Freiheit – wir explodieren
RAUSCH DER FREIHEIT!

STROPHE 2:
Bass dröhnt durch den Betonboden
Gitarren schneiden durch die Luft
Man riecht die Leidenschaft hier drinnen
Die von jeder Bühne ruft

REFRAIN

BREAKDOWN:
(Alle stoppen)
Stille ...
(Bass kommt rein)
Stille ...
(ALLES explodiert)
RAUSCH DER FREIHEIT!

REFRAIN (3x)`
  },
  {
    id: 14,
    title: "Alter Freund",
    key: "F-Dur",
    tempo: 82,
    duration: "4:55",
    mood: ["nachdenklich", "melancholisch", "romantisch"],
    situation: ["akustik", "bar", "konzert", "zugabe"],
    energy: 3,
    description: "Nachdenklich – für Momente der Verbundenheit",
    lyrics: `STROPHE 1:
Alter Freund, erinnerst du dich noch
An damals, als wir jung und dumm
Durch die Welt getaumelt sind
Ohne Plan, dafür mit Schwung

STROPHE 2:
Jetzt sind wir älter, klüger, müder
Manches ist nicht mehr wie früher
Doch wenn wir uns nach langer Zeit
Seh'n, fällt alles ab – wie Schnee

REFRAIN:
Alter Freund, alter Freund
Du bist immer noch dabei
Alter Freund, alter Freund
Mit dir bin ich niemals allein
Alter Freund

BRIDGE:
Zeit vergeht – das ist wahr
Doch Freundschaft bleibt – das ist klar

REFRAIN

OUTRO:
(Akustisch, nur Gitarre)
Alter Freund ...`
  },
  {
    id: 15,
    title: "Donnerhall",
    key: "D-Moll",
    tempo: 156,
    duration: "3:18",
    mood: ["energiegeladen", "kraftvoll"],
    situation: ["konzert", "festival"],
    energy: 10,
    description: "Brutalste Nummer – für die harten Fans",
    lyrics: `STROPHE 1:
Wenn der Donner über'm Dach rollt
Wenn der Blitz die Nacht erhellt
Dann steh'n wir hier und brüllen
Gegen alles, was uns quält

REFRAIN:
Donnerhall – Donnerhall!
Reißt die Mauern nieder
Donnerhall – Donnerhall!
Wir steh'n immer wieder
DONNERHALL!

STROPHE 2:
Keine Macht kann uns bezwingen
Keiner kann uns Ketten bringen
Wir sind Sturm und Donner beide
Freiheit ist das einzige, was bleibt

REFRAIN

BREAKDOWN:
D – O – N – N – E – R – H – A – L – L!
(Publikum schreit)

REFRAIN (2x)

OUTRO:
DONNERHALL! ... DONNERHALL!`
  },
  {
    id: 16,
    title: "Morgenrot",
    key: "H-Dur",
    tempo: 100,
    duration: "4:15",
    mood: ["feierlich", "nachdenklich", "romantisch"],
    situation: ["konzert", "outdoor", "zugabe"],
    energy: 5,
    description: "Hoffnungsvoller Abschluss – Sonnenaufgang in Musik",
    lyrics: `STROPHE 1:
Nach der langen dunklen Nacht
Wenn die Welt noch schläft und nicht
Sieht wie sich am Horizont
Langsam das Morgenrot bricht

STROPHE 2:
Alles Schwere liegt nun hinter
Einem neuen frischen Tag
Ich atme tief und spür es wieder:
Das Leben ist ein Glücksschlag

REFRAIN:
Morgenrot, Morgenrot
Maler du des neuen Tags
Morgenrot, Morgenrot
Gibst mir alles was ich mag
Morgenrot

BRIDGE:
Und wenn die Nacht auch dunkel war
Der Morgen kommt – das ist fürwahr

REFRAIN

OUTRO:
Morgenrot ... (molto ritardando)
(Letzter Akkord – A-capella-Abgang)`
  },
  {
    id: 17,
    title: "Tanznacht",
    key: "A-Dur",
    tempo: 132,
    duration: "3:42",
    mood: ["ausgelassen", "feierlich", "energiegeladen"],
    situation: ["party", "hochzeit", "bar", "festival"],
    energy: 8,
    description: "Absoluter Tanztreiber – Tanzfläche wird voll",
    lyrics: `STROPHE 1:
Die Musik spielt – ich can not stop
Der Rhythmus hat mich obendrauf
Dein Lachen zieht mich auf die Bühne
Auf geht's – und los – da haben wir's

REFRAIN:
Tanznacht, Tanznacht
Hört das Herz nicht auf zu schlagen
Tanznacht, Tanznacht
Komm wir tanzen bis zum Morgen
Tanznacht!

STROPHE 2:
Hand in Hand, Gesicht zu Gesicht
Die Nacht vergeht doch niemand geht
Weil diese Musik einfach stimmt
Und niemand mehr nach Hause geht

REFRAIN

BREAK:
(Alle tanzen – 8 Takte Musik)

REFRAIN (2x)

OUTRO:
Tanz ... Tanz ... Tanz!`
  },
  {
    id: 18,
    title: "Ewige Berge",
    key: "E-Moll",
    tempo: 78,
    duration: "5:20",
    mood: ["nachdenklich", "feierlich", "melancholisch"],
    situation: ["konzert", "akustik", "zugabe"],
    energy: 4,
    description: "Episches Stück – Hymne an die Natur",
    lyrics: `STROPHE 1:
Sie steh'n seit tausend Jahren hier
Die Berge still und ohne Angst
Sie sehen Kriege, Frieden, Menschen
Die kommen und die gehen lang

STROPHE 2:
Ich steh' hier klein vor ihrer Größe
Und fühl' wie unwichtig ich bin
Und doch bin ich ein Teil von ihnen
Ihr Ewigkeit ist auch mein Sinn

REFRAIN:
Ewige Berge, ewige Berge
Ihr habt mich aufgezogen
Ewige Berge, ewige Berge
Ihr habt mein Herz gesogen
Ewige Berge

BRIDGE:
Was bin ich? – Ein Hauch im Wind
Was bleibt? – Was die Berge sind

REFRAIN

INSTRUMENTALTEIL:
(Epische Gitarren-Passage – 16 Takte)

REFRAIN (2x)

OUTRO:
Ewige ... Berge ... (pppp, verhallt)`
  },
  {
    id: 19,
    title: "Zündfunke",
    key: "G-Moll",
    tempo: 142,
    duration: "3:30",
    mood: ["energiegeladen", "kraftvoll", "ausgelassen"],
    situation: ["konzert", "festival", "outdoor"],
    energy: 9,
    description: "Zündende Energie – reißt jeden mit",
    lyrics: `STROPHE 1:
Ein einziger Funke reicht
Den Abend zu entzünden
Ein einziger Takt genügt
Um alle zu verbünden

REFRAIN:
Zündfunke – springt über
Zündfunke – zündet durch
Zündfunke – wir brennen
ZÜNDFUNKE!

STROPHE 2:
Die Nacht hat hundert Augen
Und alle leuchten hell
Der Funke ist gesprungen
Die Menge dreht sich schnell

REFRAIN

BREAKDOWN:
(Langsam, nur Schlagzeug)
Funke ... (Publikum: ZÜNDFUNKE!)
Funke ... (Publikum: ZÜNDFUNKE!)
ZÜNDFUNKE! (Alles explodiert)

REFRAIN (3x)`
  },
  {
    id: 20,
    title: "Bleib bei mir",
    key: "C-Dur",
    tempo: 76,
    duration: "4:50",
    mood: ["romantisch", "melancholisch", "entspannt"],
    situation: ["hochzeit", "bar", "akustik", "zugabe"],
    energy: 2,
    description: "Liebeslied – für besondere Momente",
    lyrics: `STROPHE 1:
Die Nacht wird still, die Welt dreht sich
Nur du und ich – nur du und ich
Ich such' nach Worten, find' sie nicht
Doch was ich fühl' braucht kein Gedicht

STROPHE 2:
Was immer kommen mag im Leben
Was auch die Zeit uns nimmt und gibt
Ich möchte dir ein Versprechen geben:
Solang' ich leb' hab' ich dich lieb

REFRAIN:
Bleib bei mir, bleib bei mir
Ich brauche keine and're Welt
Bleib bei mir, bleib bei mir
Du bist alles was mich hält
Bleib bei mir

BRIDGE:
Kein Abstand, keine Zeit
Macht unsre Liebe weit
Nur du und ich – für immer

REFRAIN

OUTRO:
Bleib ... bei mir ... (sehr langsam)
(Letzter Akkord hält lang an)`
  },
  {
    id: 21,
    title: "Rock'n'Roll Herz",
    key: "B-Dur",
    tempo: 160,
    duration: "3:05",
    mood: ["energiegeladen", "ausgelassen"],
    situation: ["konzert", "festival", "party", "bar"],
    energy: 10,
    description: "Klassischer Rocker – schnell und direkt",
    lyrics: `STROPHE 1:
Ich hab ein Rock'n'Roll Herz
Es schlägt im 4/4-Takt
Ich leb für die Musik
Hab alles draufgepackt

REFRAIN:
Rock'n'Roll Herz – schlägt immer weiter
Rock'n'Roll Herz – macht alles leichter
Rock'n'Roll Herz – du bist mein Leben
Rock'n'Roll Herz – ich will nichts dagegen geben!

STROPHE 2:
Von früh bis spät in der Nacht
Hab ich die Gitarre in der Hand
Und wenn ich spiele – alles stimmt
Und alles hat ein End' und Anfang

REFRAIN

SOLO:
(Gitarrensolo – 8 Takte)

REFRAIN (3x)

OUTRO:
Rock'n'Roll – immer Rock'n'Roll!`
  },
  {
    id: 22,
    title: "Heimweg",
    key: "F-Moll",
    tempo: 86,
    duration: "4:32",
    mood: ["melancholisch", "nachdenklich", "entspannt"],
    situation: ["bar", "akustik", "konzert"],
    energy: 3,
    description: "Nachdenklicher Song – nach der langen Nacht",
    lyrics: `STROPHE 1:
Die Straßen sind leer und still
Die Lampen werfen Licht
Ich geh nach Haus – weil ich muss
Doch in Gedanken bin ich's nicht

STROPHE 2:
Noch klingt die Musik in meinem Kopf
Die Nacht liegt schwer auf meinen Schultern
Ich dreh mich einmal um und seh'
Den Abend noch in allen Wundern

REFRAIN:
Heimweg, Heimweg
Führt mich durch die stille Stadt
Heimweg, Heimweg
Bis ich wieder Schlaf und Rast
Heimweg

BRIDGE:
Bald kommt ein neuer Tag
Und wieder fang ich an
Bis dahin geh ich meinen Weg
Wie ich es immer kann

REFRAIN

OUTRO:
Heimweg ... (verhallt leise)`
  },
  {
    id: 23,
    title: "Sturzflut",
    key: "C-Moll",
    tempo: 150,
    duration: "3:40",
    mood: ["energiegeladen", "kraftvoll"],
    situation: ["konzert", "festival", "outdoor"],
    energy: 10,
    description: "Intensivstes Stück – volle Power, kein Halt",
    lyrics: `STROPHE 1:
Wenn Wasser bricht was Steine hält
Wenn der Strom sich nicht aufhält
Dann sind wir der Regen
Dann sind wir die Flut

REFRAIN:
STURZFLUT – reißt alles mit
STURZFLUT – nichts dagegen
STURZFLUT – Wir sind bereit
STURZFLUT!

STROPHE 2:
Drückt ihr uns nieder? Wir steigen auf
Sperrt ihr uns ein? Wir brechen aus
Wen' ihr uns schlagen? Wir schlagen zurück
Die Sturzflut ist unser Glück

REFRAIN

BREAKDOWN:
(Alle außer Schlagzeug stoppen – 4 Takte)
STURZFLUT! (Alles kommt zurück)

REFRAIN (3x)

OUTRO:
STURZFLUT! ... (letzter Akkord)`
  },
  {
    id: 24,
    title: "Goldener Herbst",
    key: "G-Dur",
    tempo: 94,
    duration: "4:18",
    mood: ["romantisch", "nachdenklich", "feierlich"],
    situation: ["outdoor", "konzert", "hochzeit", "akustik"],
    energy: 5,
    description: "Poetisch – für die schönen Tage im Herbst",
    lyrics: `STROPHE 1:
Die Blätter fallen leise nieder
In Rot und Gold und Braun
Der Herbst malt seine Bilder
Auf alles was wir schau'n

STROPHE 2:
Die Luft ist klar und frisch und kühl
Der Nebel liegt im Tal
Und doch hat alles ein Gefühl
Von letztem Sonnenstral

REFRAIN:
Goldener Herbst, goldener Herbst
Du schönste Zeit im Jahr
Goldener Herbst, goldener Herbst
Machst alles wunderbar
Goldener Herbst

BRIDGE:
Vergänglichkeit – sie macht uns frei
Wer einmal lebt – der weiß dabei

REFRAIN

OUTRO:
Golden ... wunderbar ... (ritardando)`
  },
  {
    id: 25,
    title: "Adrenalin",
    key: "F-Dur",
    tempo: 158,
    duration: "3:12",
    mood: ["energiegeladen", "ausgelassen"],
    situation: ["konzert", "festival", "party"],
    energy: 10,
    description: "Reiner Adrenalinschub – macht süchtig",
    lyrics: `STROPHE 1:
Herzrasen, Schweißhände
Der Moment direkt vor'm Sprung
Das Publikum vor mir – bereit
Das ist mein Rausch, das ist mein Schwung

REFRAIN:
Adrenalin – pumpt durch die Adern
Adrenalin – macht alles größer
Adrenalin – wir sind unsterblich
ADRENALIN!

STROPHE 2:
Kein Zurück, nur nach vorne
Die Grenze liegt weit hinten
Ich spring' und spring' und spring' noch höher
Um mich selbst zu überwinden

REFRAIN

BREAKDOWN:
(Rhythmus stoppt – nur Atem)
3 – 2 – 1 – (ALLE ZUSAMMEN:)
ADRENALIN!

REFRAIN (3x)

OUTRO:
ADRENALIN! (fff) ... (ffff letzter Akkord)`
  },
  {
    id: 26,
    title: "Stille Nacht, Laute Welt",
    key: "A-Moll",
    tempo: 68,
    duration: "5:35",
    mood: ["nachdenklich", "melancholisch"],
    situation: ["akustik", "bar", "konzert"],
    energy: 2,
    description: "Sehr ruhiges, tiefgründiges Stück – braucht Konzentration",
    lyrics: `STROPHE 1:
Die Welt schreit laut von morgen früh
Bis tief in die Nacht
Und trotzdem find ich manchmal
Einen Ort der Stille – für mich gemacht

STROPHE 2:
In dieser Stille hör ich mehr
Als im lautesten Getümmel
Das Herz schlägt leiser, klarer hier
Fern von allem Himmel und Chimmel

REFRAIN:
Stille Nacht, laute Welt
Ich find' mich irgendwo dazwischen
Stille Nacht, laute Welt
Zwischen Schreien und dem Schweigen
Stille Nacht

BRIDGE:
(Nur Gitarre – sehr leise)
Manchmal braucht man Stille ...
Um zu hören, was wirklich zählt

REFRAIN

OUTRO:
Stille ... Stille ... (pppp, verhallt komplett)`
  },
  {
    id: 27,
    title: "Feuerwerk",
    key: "D-Dur",
    tempo: 135,
    duration: "3:55",
    mood: ["feierlich", "ausgelassen", "energiegeladen"],
    situation: ["party", "festival", "hochzeit", "konzert"],
    energy: 9,
    description: "Perfekter Finale-Song – Feuerwerk im Saal",
    lyrics: `STROPHE 1:
Letzte Runde, letzte Nacht
Haben wir die Hölle heiß gemacht
Jetzt explodiert der letzte Knall
Feuerwerk im Konzerthall

REFRAIN:
Feuerwerk – BOOM!
Alles leuchtet auf
Feuerwerk – BOOM!
Hält das Leben drauf
Feuerwerk – für euch alle!

STROPHE 2:
Funken fliegen, Farben tanzen
Alles dreht sich im Takt
Das ist mehr als eine Show
Das ist unser Herzensakt

REFRAIN

OUTRO-MITSING:
(Alle)
Boom-Boom-Boom – FEUERWERK!
Boom-Boom-Boom – FEUERWERK!
FEUERWERK!

REFRAIN (2x)

FINALES OUTRO:
(Konfetti – großer Schlussakkord)`
  },
  {
    id: 28,
    title: "Wanderer",
    key: "H-Moll",
    tempo: 98,
    duration: "4:42",
    mood: ["nachdenklich", "entspannt", "melancholisch"],
    situation: ["akustik", "bar", "outdoor"],
    energy: 4,
    description: "Melancholisch-schöner Song über das Leben unterwegs",
    lyrics: `STROPHE 1:
Ich trage mein Leben auf dem Rücken
In einem alten Lederrucksack
Hab tausend Orte schon gesehen
Und nirgends wirklich nachgepack'

STROPHE 2:
Die Straße lockt mich jeden Morgen
Die Weite ruft mich aus dem Schlaf
Und irgendwo da wartet etwas
Was ich noch nicht kenn – doch spür

REFRAIN:
Wanderer, Wanderer
Zwischen Hier und Dort
Wanderer, Wanderer
Immer weiter fort
Wanderer

BRIDGE:
Aber Wandern ist nicht Fliehen
Es ist Ankommen – irgendwann

REFRAIN

OUTRO:
Wanderer ... weiter ... weiter ...`
  },
  {
    id: 29,
    title: "Vollmond",
    key: "E-Dur",
    tempo: 112,
    duration: "4:08",
    mood: ["romantisch", "feierlich", "nachdenklich"],
    situation: ["outdoor", "hochzeit", "bar", "konzert"],
    energy: 6,
    description: "Mystischer Song – perfekt für Außengigs unter freiem Himmel",
    lyrics: `STROPHE 1:
Der Mond steht groß am Abendhimmel
Wirft Silberlicht auf Berg und Tal
Die Welt liegt still in seiner Gnade
Und alles scheint wunderschön und klar

STROPHE 2:
Du tanzt im Mondlicht auf der Wiese
Dein Haar fliegt wild im kühlen Wind
Ich schau dir zu und glaub es kaum
Dass du so schön und echt und wirklich bist

REFRAIN:
Vollmond, Vollmond
Zeig mir deinen Zauber
Vollmond, Vollmond
Mach die Nacht noch schöner
Vollmond

BRIDGE:
(Instrumentalpassage unter Mondlicht)
Still und leise ... durch die Nacht

REFRAIN

OUTRO:
Vollmond ... (sehr langsam verhallt)`
  },
  {
    id: 30,
    title: "Letzter Tanz",
    key: "G-Moll",
    tempo: 90,
    duration: "5:10",
    mood: ["romantisch", "melancholisch", "feierlich"],
    situation: ["zugabe", "hochzeit", "konzert", "bar"],
    energy: 4,
    description: "Klassischer Zugabe-Song – emotionaler Abschluss",
    lyrics: `STROPHE 1:
Noch einmal – dieses eine Mal
Bevor die Nacht uns trennt
Noch einmal dreh ich dich im Kreis
Bis sich das Licht blendt

STROPHE 2:
Die Band spielt langsamer und leiser
Die Stunden wie Minuten geh'n
Ich halte fest was mir geblieben
Bevor wir auseinander steh'n

REFRAIN:
Letzter Tanz, letzter Tanz
Hält die Zeit für uns an
Letzter Tanz, letzter Tanz
Der schönste den's je gab
Letzter Tanz

BRIDGE:
Kein Ende – nur ein Übergang
Aus dieser Nacht in eine neue
Der letzte Tanz ist nie der letzte
Wenn man sich bleibt, sich treu

REFRAIN

FINALES OUTRO:
(Sehr langsam, nur Gitarre und Stimme)
Letzter Tanz ...
(Langer letzter Akkord)
(Stille)
(Beifall)`
  }
];

// =====================================================================
// Stimmungs-Mapping für die Chat-Logik
// =====================================================================
const MOOD_KEYWORDS = {
  energiegeladen: ["energie", "power", "stark", "wild", "feuer", "laut", "hard", "rock", "pump", "boost"],
  ausgelassen:    ["party", "feiern", "spaß", "lustig", "tanzen", "ausgelassen", "geil", "cool"],
  feierlich:      ["feier", "besonder", "würdig", "groß", "wichtig", "jubiläum", "geburtst"],
  romantisch:     ["liebe", "romantisch", "herz", "partner", "hochzeit", "duo", "paar", "verliebt"],
  melancholisch:  ["traurig", "nachdenklich", "tief", "bewegt", "emotional", "ernst", "dunkel"],
  entspannt:      ["chill", "locker", "ruhig", "entspannt", "laid back", "sanft", "leise", "gemütlich"],
  nachdenklich:   ["nachdenken", "tief", "bedeutung", "philosophisch", "sinnend", "grübeln"],
  kraftvoll:      ["stark", "mächtig", "power", "kraftvoll", "massiv", "wuchtig", "intensiv"]
};

const SITUATION_KEYWORDS = {
  konzert:  ["konzert", "gig", "auftritt", "bühne", "venue", "club", "halle", "indoor"],
  festival: ["festival", "open air", "draußen", "sommer", "zelt", "openair"],
  outdoor:  ["outdoor", "draußen", "natur", "wald", "wiese", "berg", "see", "freiluft"],
  party:    ["party", "feier", "geburtstag", "silvester", "feiern", "sause"],
  hochzeit: ["hochzeit", "heirat", "trauung", "brautpaar", "ehe", "ja-wort"],
  bar:      ["bar", "kneipe", "pub", "lokal", "klein", "intim", "gemütlich"],
  akustik:  ["akustik", "unplugged", "leise", "solo", "intim", "ruhig"],
  zugabe:   ["zugabe", "encore", "abschluss", "Ende", "last", "letzte"]
};

// Exportiere für die App
window.SONGS = SONGS;
window.MOOD_KEYWORDS = MOOD_KEYWORDS;
window.SITUATION_KEYWORDS = SITUATION_KEYWORDS;
