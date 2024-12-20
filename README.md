# Chatas – Pokalbių Sistema

Šis projektas – tai moderni pokalbių programa, kurią sudaro React frontend'as ir Node/Express backend'as su MongoDB duomenų baze.

## Turinys

1. [Pokalbių Sistema](#pokalbių-sistema)  
2. [Reikalavimai](#reikalavimai)  
3. [Projekto Klonavimas](#projekto-klonavimas)  
4. [Frontend (Klientinės dalies) Nustatymai](#frontend-klientinės-dalies-nustatymai)  
5. [Backend (Serverio dalies) Nustatymai](#backend-serverio-dalies-nustatymai)  
6. [Vystymas](#vystymas)  
7. [Aplikacijos Paleidimas](#aplikacijos-paleidimas)  
8. [Komandos](#komandos)    

## Reikalavimai

- **Node.js** (rekomenduojama v20.6.0 arba naujesnė)  
- **MongoDB** instaliuota arba MongoDB Atlas paskyra  
- **npm** arba **yarn** paketų tvarkyklė  

## Projekto Klonavimas

Projektą galite klonuoti iš GitHub naudodami šią komandą:  
`git clone https://github.com/Cepvai/Galutinis-Atsiskaitymas.git`

---

## Frontend (Klientinės dalies) Nustatymai

### Tech Stack  
- **React**  
- **React Router DOM**  
- **Styled Components**  
- **Vite**  

### Frontend Paleidimo Žingsniai

1. **Pereikite į klientinės dalies aplanką:**  
   `cd client`

2. **Įdiekite priklausomybes:**  
   `npm install`

3. **Paleiskite vystymo serverį:**  
   `npm run dev`

   Aplikacija paleista adresu [http://localhost:5173](http://localhost:5173).

---

## Backend (Serverio dalies) Nustatymai

### Tech Stack  
- **Express**  
- **MongoDB**  
- **CORS**  

### Aplinkos kintamieji

#### Reikalavimai  
- **Node.js** v20.6.0 arba naujesnė versija  

### Backend Paleidimo Žingsniai

1. **Pereikite į serverio dalies aplanką:**  
   `cd server`

2. **Įdiekite priklausomybes:**  
   `npm install`

3. **Nukopijuokite pateiktą .env.example failą ir pervadinkite jį į .env:**  
   `cp .env.example .env`

4. **Redaguokite .env failą su savo konfigūracijos informacija:**  
   - `SERVER_PORT=5001`  
   - `CLIENT_PORT=5173`  
   - `DB_USER=<jūsų_DB_vartotojas>`  
   - `DB_PASSWORD=<jūsų_DB_slaptažodis>`  
   - `DB_CLUSTER=<jūsų_cluster_pavadinimas>`  
   - `DB_NAME=<jūsų_duomenų_bazės_pavadinimas>`  

**Aplinkos kintamųjų paaiškinimai:**  
- **SERVER_PORT**: Uostas, kuriame veiks Express serveris (numatytas 5500).  
- **CLIENT_PORT**: Uostas, kuriame veikia frontend serveris (numatytas 5173).  
- **DB_USER**: MongoDB vartotojo vardas.  
- **DB_PASSWORD**: MongoDB vartotojo slaptažodis.  
- **DB_CLUSTER**: MongoDB Atlas cluster pavadinimas.  
- **DB_NAME**: MongoDB duomenų bazės pavadinimas.  

5. **Paleiskite serverį:**  
   `npm run dev`

   Serveris bus pasiekiamas [http://localhost:5500](http://localhost:5500), jei nenustatyta kitaip.

---

## Vystymas

### Aplankų Struktūra

- `client/src/components`:  
  - **molecules**: Pakartotinai naudojami komponentai, tokie kaip pokalbių kortelės, filtras, puslapiavimas.  
  - **organisms**: Pagrindinės komponentės kaip „Visi vartotojai“ ir „Pokalbiai“, naudojamos su antraštėmis ir šablonais.  
- `server/`: Express maršrutas, `index.ts` API užklausoms tvarkyti.  

---

## Aplikacijos Paleidimas

Įsitikinkite, kad frontend ir backend serveriai yra paleisti:  
- **Frontend adresu**: [http://localhost:5173](http://localhost:5173)  
- **Backend adresu**: [http://localhost:5500](http://localhost:5500)  

Kliento aplikacija naudoja serverio API užklausas pokalbių ir vartotojų duomenims gauti.

---

## Komandos

### Frontend:  
- `npm run dev`: Paleidžia Vite vystymo serverį.  
- `npm run build`: Sukuria gamybai paruoštus failus.  

### Backend:  
- `npm run dev`: Paleidžia Express serverį naudojant `.env` konfigūraciją.  
