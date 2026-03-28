# SOS100 React Projekt – Lånestatistik

Detta projekt är en frontend-applikation byggd i React (Vite) som visualiserar lånedata från ett Loan API. Applikationen hämtar statistik från en Azure-hostad Web API och presenterar informationen i form av diagram och nyckeltal.

Syftet med projektet är att demonstrera hur en modern frontend kan integreras med ett backend-API enligt principer inom Service-Oriented Architecture (SOA).

## Tekniker

Projektet är byggt med följande teknologier:

* React (Vite)
* JavaScript
* CSS
* REST API
* Microsoft Azure (hosting av backend)

Frontend-applikationen kommunicerar med ett separat Loan API som är byggt i ASP.NET Core och använder Entity Framework Core med SQLite som databas.

## Vad applikationen gör

Applikationen visualiserar statistik över lån och återlämningar från ett Loan API. Genom att hämta data från API:et presenteras information i form av diagram och nyckeltal, exempelvis antal lån per pryl, totalt antal lån samt antal sena återlämningar.

Syftet är att ge en tydlig överblick över hur resurser används inom systemet och att underlätta analys av lånebeteenden.

## Hur man kör applikationen

För att köra applikationen lokalt krävs Node.js installerat.

Börja med att installera alla beroenden:

npm install

Starta sedan utvecklingsservern:

npm run dev

Applikationen startar då vanligtvis på http://localhost:5173.

Frontend-applikationen är konfigurerad att kommunicera med ett externt Loan API som är hostat på Microsoft Azure. För att detta ska fungera används en miljövariabel i en `.env`-fil i projektets rot:

VITE_API_BASE_URL=https://app-sos100-loanapi.azurewebsites.net
VITE_API_KEY=min-super-hemliga-nyckel-123

Dessa värden används i applikationen för att skicka anrop till API:et tillsammans med en API-nyckel via HTTP headers.

## Användning av AI

AI har använts som ett stöd under utvecklingen av projektet, främst för att få hjälp med felsökning, förståelse av kod samt förslag på lösningar.

AI har bland annat hjälpt till med:

* felsökning av problem vid koppling mellan frontend och backend
* förslag på hur API-anrop kan implementeras i React
* förklaringar av tekniska koncept såsom CORS och miljövariabler

All kod och alla lösningar som använts i projektet har dock granskats, testats och anpassats manuellt för att säkerställa att de fungerar korrekt i den egna applikationen.

AI-genererat material har modifierats och anpassats efter projektets struktur, krav och funktionalitet.

