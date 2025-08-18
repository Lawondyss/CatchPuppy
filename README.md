# Chyť Bárnyho

## Webová hra vytvořená AI
Protože manželika velmi ráda soutěží se svou sestrou, napadlo mě vytvořit jim jednoduchou hru,
ve které by se mohly předhánět. A protože Google nedávno přidal Gemini agenta do PhpStormu,
který je mým primárním editorem, rozhodl jsem se otestovat jeho schopnosti. Už dříve, coby pouhý
chat, se projevoval velmi schopně a poslední model se podle různých recenzí jevil velmi slibně.

## KAPLAY
V záložkách jsem měl už poměrně dlouho odkaz [Kaboom.js](https://kaboomjs.com/). JS knihovna pro
tvorbu webových her, ale kvůli ukončení podpory jsem nakonec použil [KAPLAY](https://kaplayjs.com/),
který je komoditním forkem.

## Vývoj
Podle dokumentace jsem si vytvořil adresář projektu a hned přidal dokumentaci z jejich GitHubu.
Na tu jsem Gemini odkázal a popsal, co spolu budeme tvořit. Pak jsem mu jako první úkol zadal
vytvořit hrací plochu s dvěma entitami. Šlo o poměrně jednoduchý kód a výsledek byl okamžitě
funkční.

Postupně jsem ho nechal přidat několik funkčností jako pohyb, detekci chycení, změnu pozadí,
než jsem usoudil, že v hlavním souboru `src/main.js` už je toho příliš. Takže přišel z mého
pohledu čas na velký úkol. Refaktoring a použití OOP oproti funkcionálnímu kódu, který doposud tvořil.

Refaktoring dopadl nad očekávání dobře. Vytvořil adresářovou strukturu a kód rozdělil podle funkcionality
do odpovídajících tříd a metod. Určitě by se to dalo udělat lépe, ale za tento kód bych se určitě nestyděl.

Další vývoj obnášel přidání překážek, vylepšení logiky Bárnyho, zvyšující obtížnost, který Gemini bez
problému zvládal vytvářet v nové kódové základně i když už šlo o pokročilé úpravy.

## Limity
Narazil jsem na velký problém v podobě záseku na posledním požadavku, který se Gemini snaží stále dokola vyřešit.
Nabídne úpravu, kterou i když schválím a on ji provede, i tak znova začne řešit stejný požadavek a opět nabídne
novou úpravu. Bohužel není jak ho zastavit, prompty v té chvíli nepřijímá a u nabídnutého řešení není možnost zrušit
provádění, pouze přijmou nebo odmítnout úpravu. Odmítnutí úpravy není řešení, protože Gemini si to vyloží,
že tahle se nelíbí, a tak zkusí lepší.

Tohle celé je ale podle mého spíše technický problém pluginu nebo API a doufám, že další verze toto opraví.

Omezené schopnosti samotného modelu se projevili až při velmi pokročilém generování keřů, které vytváří překážky
na hracím poli. Původně bylo čistě náhodné, což občas vedlo k vytváření uzavřených míst, odkud nebo kam se
hráč nedostal i když to potřeboval. Zadal jsem mu, ať takovému generování zabrání, což se mu i povedlo a mohl
bych být spokojený. Ale nebyl. Chtěl jsem, aby spawnování Bárnyho bylo v určitém rozmezí od hráče a horní
hranice měl být zbývající čas hráče a tady to šlo celé do kytek.

Gemini se snažil vytvořit pathfinding, spočítat čas cesty hráče k Bárnymu a podle toho určit, zdali je rozložení
vhodné. Jenže to končilo hrací plochou bez keřů. Měl fallback, že když se to nepodaří do určitého počtu generování
neumístí se žádné keře, což byl nakonec každý výsledek. Procesu pathfindingu jsem nerozumněl, takže jsem mu neměl
jak pomoci.

Při každém opakovaném upozornění na chybu tvrdil, že problém našel a opravil, ale v podstatě přepínal jen mezi dvěma
řešeními nebo upravoval komentáře. V kombinaci s problémem záseku se z toho stal depresivní kolotoč.

Nakonec jsem ho nechal celou logiku pathfindingu zahodit a začali jsme znova od začátku. Tentokrát jsem šel cestou
nedokonalosti a nechal ho vytvořit náhodné generování v mřížce a spawnování v rozsahu bez pathfindingu. Na hře je
to vidět. Se zvyšující se obtížností narůstá i pravděpodobnost vzniku uzavřeného prostoru a tak náhoda hraje větší
roli, než by si asi kdokoliv přál.

## Závěrem
Začal jsem testovat programovací schopnosti AI od prvních modelů a vidím, jak velký pokrok za těch pár let tento
obor urazil. Poprvé jsem si tak představil, jak by se mé živobytí mohlo změnit. Trochu mě děsí představa, že bych
nebyl zodpovědný za každý řádek, ale asi je to prostě budoucnost.

Upřímně jsem si ji spíše představoval jako zrychlující se nástup stále více funkcionalit, který prostě jednoho dne
přestanu stíhat úplně a stane se ze mě dinosaurus, který na stará kolena neví, že i CSS už je programovací jazyk.

Tahle budoucnost je mi ale více nakloněna. Dává mi do rukou nástroj, kdy se zfosilnatění musím obávat mnohem méně,
protože AI to bude všechno znát a na mě zbyde jen ji vést.

## P.S.
Mám pár nápadů, jak vyřešit alespoň problém se vznikem uzavřených míst, ale pro tuto chvíli nechám holky, ať si hrají.

## P.P.S.
Jsem zvědavý, jak se na tento text budu tvářit za pár let. Jestli si něj vzpomenu, rád si přečtu a porovnám, jak moc se
mi má představa budoucnosti naplnila.
