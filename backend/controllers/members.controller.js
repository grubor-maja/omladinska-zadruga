const db = require('../db/db');

exports.createMemberWithData = async (req, res) => {
    let connection;
    
    try {
        const { kandidatID, parentConsent, parent, authorizedPerson, accessDeclaration, biography, languageSkills } = req.body;
        
        console.log('=== CREATING MEMBER WITH DATA ===');
        console.log('kandidatID:', kandidatID);
        console.log('parentConsent:', parentConsent);
        console.log('parent:', parent);
        console.log('authorizedPerson:', authorizedPerson);
        console.log('biography:', biography);
        console.log('languageSkills received:', JSON.stringify(languageSkills, null, 2));
        console.log('languageSkills type:', typeof languageSkills);
        console.log('languageSkills is array:', Array.isArray(languageSkills));
        console.log('languageSkills length:', languageSkills ? languageSkills.length : 'undefined');
        
        connection = await db.getConnection();

        const candidateCheck = await connection.execute(
            'SELECT KandidatID FROM z6.KandidatOsnovno WHERE KandidatID = :id',
            { id: kandidatID }
        );
        
        if (candidateCheck.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM z6.ClanZadruge WHERE ClanZadrugeID = :id',
            { id: kandidatID }
        );

        if (memberCheck.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ error: 'Kandidat je već član zadruge' });
        }

        let roditeljID = null;
        if (parentConsent?.potrebnaSaglasnost && parent?.ime) {
            console.log('Creating parent with data:', parent);
            const parentResult = await connection.execute(
                `INSERT INTO z6.Roditelj (JMBG, Ime, Prezime, Kontakt) 
                 VALUES (:jmbg, :ime, :prezime, :kontakt)
                 RETURNING RoditeljID INTO :id`,
                {
                    jmbg: parent.jmbg || null,
                    ime: parent.ime,
                    prezime: parent.prezime || null,
                    kontakt: parent.kontakt || null,
                    id: { type: db.NUMBER, dir: db.BIND_OUT }
                },
                { autoCommit: false }
            );
            roditeljID = parentResult.outBinds.id[0];
            console.log('Created parent with ID:', roditeljID);
        }

        let ovlascenoLiceID = null;
        if (authorizedPerson?.ime && authorizedPerson?.jmbg) {
            console.log('Creating authorized person with data:', authorizedPerson);
            const authorizedResult = await connection.execute(
                `INSERT INTO z6.OvlascenoLice (JMBG, Ime, Prezime) 
                 VALUES (:jmbg, :ime, :prezime)
                 RETURNING OvlascenoLiceID INTO :id`,
                {
                    jmbg: authorizedPerson.jmbg,
                    ime: authorizedPerson.ime,
                    prezime: authorizedPerson.prezime || null,
                    id: { type: db.NUMBER, dir: db.BIND_OUT }
                },
                { autoCommit: false }
            );
            ovlascenoLiceID = authorizedResult.outBinds.id[0];
            console.log('Created authorized person with ID:', ovlascenoLiceID);
        }

        console.log('Creating ClanZadruge...');
        await connection.execute(
            'INSERT INTO z6.ClanZadruge (ClanZadrugeID) VALUES (:id)',
            { id: kandidatID },
            { autoCommit: false }
        );
        console.log('Created ClanZadruge for kandidatID:', kandidatID);

        console.log('Creating ZahtevZaPristupanje...');
        const zahtevResult = await connection.execute(
            `INSERT INTO z6.ZahtevZaPristupanje (DatumUpisa, OsnovZaClanstvo, KandidatID, RoditeljID)
             VALUES (SYSDATE, :osnovZaClanstvo, :kandidatID, :roditeljID)
             RETURNING ClanskiBroj INTO :clanskiBroj`,
            { 
                osnovZaClanstvo: biography?.radniStatus || 'nezaposleni',
                kandidatID: kandidatID,
                roditeljID: roditeljID,
                clanskiBroj: { type: db.NUMBER, dir: db.BIND_OUT }
            },
            { autoCommit: false }
        );
        const clanskiBroj = zahtevResult.outBinds.clanskiBroj[0];
        console.log('Created zahtev with ClanskiBroj:', clanskiBroj);

        console.log('Creating Biografija...');
        const biografijaResult = await connection.execute(
            `INSERT INTO z6.Biografija (VozackaDozvola, ITVestine, ProfilIZanimanje, 
                                       NeformalnoObrazovanje, DatumUpisa, RadniStatus, ClanskiBroj)
             VALUES (:vozackaDozvola, :itVestine, :profilIZanimanje, 
                     :neformalnoObrazovanje, SYSDATE, :radniStatus, :clanskiBroj)
             RETURNING BiografijaID INTO :biografijaID`,
            {
                vozackaDozvola: biography?.vozackaDozvola ? 1 : 0,
                itVestine: biography?.itVestine || null,
                profilIZanimanje: biography?.profilIZanimanje || null,
                neformalnoObrazovanje: biography?.neformalnoObrazovanje || null,
                radniStatus: biography?.radniStatus || 'nezaposleni',
                clanskiBroj: clanskiBroj,
                biografijaID: { type: db.NUMBER, dir: db.BIND_OUT }
            },
            { autoCommit: false }
        );
        const biografijaID = biografijaResult.outBinds.biografijaID[0];
        console.log('Created biografija with ID:', biografijaID, 'for ClanskiBroj:', clanskiBroj);

        console.log('=== PROCESSING LANGUAGE SKILLS ===');
        console.log('languageSkills:', languageSkills);
        console.log('biografijaID:', biografijaID);
        
        if (languageSkills && Array.isArray(languageSkills) && languageSkills.length > 0) {
            console.log('Processing', languageSkills.length, 'language skills');
            for (const skill of languageSkills) {
                console.log('Processing skill:', skill);
                if (skill.straniJezikID && skill.nivoZnanja) {
                    console.log('Inserting language skill:', {
                        biografijaID: biografijaID,
                        straniJezikID: skill.straniJezikID,
                        nivoZnanja: skill.nivoZnanja
                    });
                    
                    await connection.execute(
                        `INSERT INTO z6.ZnanjeJezika (BiografijaID, StraniJezikID, NivoZnanja) 
                         VALUES (:biografijaID, :straniJezikID, :nivoZnanja)`,
                        {
                            biografijaID: biografijaID,
                            straniJezikID: skill.straniJezikID,
                            nivoZnanja: skill.nivoZnanja
                        },
                        { autoCommit: false }
                    );
                    console.log('Successfully added language skill:', skill.straniJezikID, skill.nivoZnanja);
                } else {
                    console.log('Skipping skill due to missing data:', skill);
                }
            }
        } else {
            console.log('No language skills to process. languageSkills:', languageSkills);
        }

        if (parentConsent?.potrebnaSaglasnost && roditeljID) {
            console.log('Creating SaglasnostRoditelja...');
            await connection.execute(
                `INSERT INTO z6.SaglasnostRoditelja (DatumPotpisivanja, ClanskiBroj, RoditeljID)
                 VALUES (SYSDATE, :clanskiBroj, :roditeljID)`,
                {
                    clanskiBroj: clanskiBroj,
                    roditeljID: roditeljID
                },
                { autoCommit: false }
            );
            console.log('Created SaglasnostRoditelja for ClanskiBroj:', clanskiBroj);
        }

        if (ovlascenoLiceID) {
            console.log('Creating PristupnaIzjava...');
            await connection.execute(
                `INSERT INTO z6.PristupnaIzjava (ClanskiBroj, OvlascenoLiceID, DatumPotpisa)
                 VALUES (:clanskiBroj, :ovlascenoLiceID, TO_DATE(:datumPotpisa, 'YYYY-MM-DD'))`,
                {
                    clanskiBroj: clanskiBroj,
                    ovlascenoLiceID: ovlascenoLiceID,
                    datumPotpisa: accessDeclaration?.datumPotpisa || new Date().toISOString().split('T')[0]
                },
                { autoCommit: false }
            );
            console.log('Created PristupnaIzjava for ClanskiBroj:', clanskiBroj);
        }

        console.log('Creating initial Clanarina...');
        await connection.execute(
            `INSERT INTO z6.Clanarina (ClanZadrugeID, DatumUplate, IznosClanarine)
             VALUES (:clanZadrugeID, SYSDATE, :iznos)`,
            {
                clanZadrugeID: kandidatID,
                iznos: 500.00  // Početna članarina
            },
            { autoCommit: false }
        );
        console.log('Created initial Clanarina for member:', kandidatID);

        await connection.commit();
        console.log('Successfully created member and all related data');
        
        res.status(201).json({ 
            message: 'Član zadruge je uspešno kreiran sa svim podacima!',
            memberID: kandidatID,
            clanskiBroj: clanskiBroj,
            biografijaID: biografijaID
        });

    } catch (err) {
        console.error('Error creating member:', err);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr);
            }
        }
        res.status(500).json({ error: err.message || 'Greška pri kreiranju člana zadruge' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const connection = await db.getConnection();
        const result = await connection.execute(
            `SELECT 
                cz.ClanZadrugeID, 
                ko.Ime, 
                ko.Prezime, 
                ko.JMBG,
                ko.DatumRodjenja,
                ko.BrojLicneKarte,
                ko.LBO,
                ko.KontaktPodaci.Mejl,
                ko.KontaktPodaci.MobilniTelefon,
                ko.KontaktPodaci.FiksniTelefon,
                cz.DatumVazenja,
                b.RadniStatus,
                b.ITVestine,
                b.ProfilIZanimanje,
                b.VozackaDozvola,
                b.NeformalnoObrazovanje
             FROM z6.ClanZadruge cz
             JOIN z6.KandidatOsnovno ko ON cz.ClanZadrugeID = ko.KandidatID
             LEFT JOIN z6.ZahtevZaPristupanje zp ON ko.KandidatID = zp.KandidatID
             LEFT JOIN z6.Biografija b ON zp.ClanskiBroj = b.ClanskiBroj
             ORDER BY ko.Ime, ko.Prezime`
        );
        
        await connection.close();
        res.json(result.rows.map(row => [
            row[0],  // ClanZadrugeID
            row[10], // DatumVazenja  
            row[3],  // JMBG
            row[1],  // Ime
            row[2],  // Prezime
            row[4],  // DatumRodjenja
            row[7],  // Email (KontaktPodaci.Mejl)
            row[8],  // MobilniTelefon
            row[9],  // FiksniTelefon
            row[11], // RadniStatus
            row[12], // ITVestine
            row[13], // ProfilIZanimanje
            row[14], // VozackaDozvola
            row[15]  // NeformalnoObrazovanje
        ]));
    } catch (err) {
        console.error('Error fetching members:', err);
        res.status(500).json({ error: 'Greška pri dohvatanju članova' });
    }
};

exports.searchMembers = async (req, res) => {
    try {
        const { faculty, language, searchTerm } = req.query;
        console.log('Search params:', { faculty, language, searchTerm });
        
        const connection = await db.getConnection();
        
        let baseQuery = `
            SELECT DISTINCT
                cz.ClanZadrugeID, 
                ko.Ime, 
                ko.Prezime, 
                ko.JMBG,
                ko.DatumRodjenja,
                ko.BrojLicneKarte,
                ko.LBO,
                ko.KontaktPodaci.Mejl,
                ko.KontaktPodaci.MobilniTelefon,
                ko.KontaktPodaci.FiksniTelefon,
                cz.DatumVazenja,
                b.RadniStatus,
                b.ITVestine,
                b.ProfilIZanimanje,
                b.VozackaDozvola,
                b.NeformalnoObrazovanje
             FROM z6.ClanZadruge cz
             JOIN z6.KandidatOsnovno ko ON cz.ClanZadrugeID = ko.KandidatID
             LEFT JOIN z6.ZahtevZaPristupanje zp ON ko.KandidatID = zp.KandidatID
             LEFT JOIN z6.Biografija b ON zp.ClanskiBroj = b.ClanskiBroj`;
        
        const conditions = [];
        const params = {};
        
        if (faculty && faculty.trim()) {
            baseQuery += ` LEFT JOIN z6.Obrazovanje o ON ko.KandidatID = o.KandidatID
                          LEFT JOIN z6.ObrazovnaUstanova ou ON o.ObrazovnaUstanovaID = ou.ObrazovnaUstanovaID`;
            conditions.push('UPPER(ou.NazivObrazovneUstanove) LIKE UPPER(:faculty)');
            params.faculty = `%${faculty.trim()}%`;
        }
        
        if (language && language.trim()) {
            baseQuery += ` LEFT JOIN z6.ZnanjeJezika zj ON b.BiografijaID = zj.BiografijaID
                          LEFT JOIN z6.StraniJezik sj ON zj.StraniJezikID = sj.StraniJezikID`;
            conditions.push('UPPER(sj.NazivJezika) LIKE UPPER(:language)');
            params.language = `%${language.trim()}%`;
        }
        
        if (searchTerm && searchTerm.trim()) {
            conditions.push(`(UPPER(ko.Ime) LIKE UPPER(:searchTerm) OR 
                            UPPER(ko.Prezime) LIKE UPPER(:searchTerm) OR 
                            UPPER(ko.JMBG) LIKE UPPER(:searchTerm) OR
                            UPPER(b.ITVestine) LIKE UPPER(:searchTerm) OR
                            UPPER(b.ProfilIZanimanje) LIKE UPPER(:searchTerm))`);
            params.searchTerm = `%${searchTerm.trim()}%`;
        }
        
        if (conditions.length > 0) {
            baseQuery += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        baseQuery += ` ORDER BY ko.Ime, ko.Prezime`;
        
        console.log('Executing query:', baseQuery);
        console.log('With params:', params);
        
        const result = await connection.execute(baseQuery, params);
        
        await connection.close();
        
        const searchResults = result.rows.map(row => [
            row[0],  // ClanZadrugeID
            row[10], // DatumVazenja  
            row[3],  // JMBG
            row[1],  // Ime
            row[2],  // Prezime
            row[4],  // DatumRodjenja
            row[7],  // Email (KontaktPodaci.Mejl)
            row[8],  // MobilniTelefon
            row[9],  // FiksniTelefon
            row[11], // RadniStatus
            row[12], // ITVestine
            row[13], // ProfilIZanimanje
            row[14], // VozackaDozvola
            row[15]  // NeformalnoObrazovanje
        ]);
        
        console.log(`Found ${searchResults.length} members matching search criteria`);
        res.json(searchResults);
        
    } catch (err) {
        console.error('Error searching members:', err);
        res.status(500).json({ error: 'Greška pri pretrazi članova' });
    }
};

exports.createMember = async (req, res) => {
    try {
        const { kandidatID } = req.body;
        
        const connection = await db.getConnection();

        const candidateCheck = await connection.execute(
            'SELECT KandidatID FROM z6.KandidatOsnovno WHERE KandidatID = :id',
            { id: kandidatID }
        );
        
        if (candidateCheck.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM z6.ClanZadruge WHERE ClanZadrugeID = :id',
            { id: kandidatID }
        );
        
        if (memberCheck.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ error: 'Kandidat je već član zadruge' });
        }

        await connection.execute(
            'INSERT INTO z6.ClanZadruge (ClanZadrugeID) VALUES (:id)',
            { id: kandidatID },
            { autoCommit: true }
        );
        
        await connection.close();
        res.status(201).json({ message: 'Član zadruge je uspešno kreiran!', memberID: kandidatID });
        
    } catch (err) {
        console.error('Error creating member:', err);
        res.status(500).json({ error: 'Greška pri kreiranju člana zadruge' });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Getting detailed member info for ID:', id);
        
        const connection = await db.getConnection();

        const basicResult = await connection.execute(
            `SELECT k.KandidatID, k.JMBG, k.Ime, k.Prezime, k.DatumRodjenja,
                    k.KontaktPodaci.Mejl as Email, 
                    k.KontaktPodaci.MobilniTelefon as MobilniTelefon,
                    k.KontaktPodaci.FiksniTelefon as FiksniTelefon,
                    k.BrojLicneKarte, k.LBO,
                    cz.DatumVazenja
             FROM z6.KandidatOsnovno k 
             JOIN z6.ClanZadruge cz ON cz.ClanZadrugeID = k.KandidatID
             WHERE k.KandidatID = :id`,
            { id: id }
        );
        
        if (basicResult.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Član nije pronađen' });
        }
        
        const basicData = basicResult.rows[0];
        console.log('Basic member data:', basicData);

        let education = [];
        try {
            const educationResult = await connection.execute(
                `SELECT o.ObrazovanjeID, o.NivoSS, o.Zvanje, ou.NazivObrazovneUstanove
                 FROM z6.Obrazovanje o 
                 LEFT JOIN z6.ObrazovnaUstanova ou ON o.ObrazovnaUstanovaID = ou.ObrazovnaUstanovaID 
                 WHERE o.KandidatID = :id`,
                { id: id }
            );
            education = educationResult.rows;
            console.log('Education data:', education);
        } catch (err) {
            console.log('No education data found or error:', err.message);
        }

        let biography = [];
        try {
            const biographyResult = await connection.execute(
                `SELECT b.BiografijaID, b.VozackaDozvola, b.ITVestine, b.ProfilIZanimanje, 
                        b.NeformalnoObrazovanje, b.RadniStatus, b.Mejl
                 FROM z6.Biografija b 
                 JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj 
                 WHERE z.KandidatID = :id`,
                { id: id }
            );
            biography = biographyResult.rows;
            console.log('Biography data:', biography);
        } catch (err) {
            console.log('No biography data found or error:', err.message);
        }

        let languages = [];
        try {
            if (biography.length > 0) {
                const biografijaID = biography[0][0]; // BiografijaID
                const languagesResult = await connection.execute(
                    `SELECT zj.ZnanjeJezikaID, zj.NivoZnanja, sj.NazivJezika
                     FROM z6.ZnanjeJezika zj 
                     LEFT JOIN z6.StraniJezik sj ON zj.StraniJezikID = sj.StraniJezikID 
                     WHERE zj.BiografijaID = :biografijaID`,
                    { biografijaID: biografijaID }
                );
                languages = languagesResult.rows;
                console.log('Languages data:', languages);
            }
        } catch (err) {
            console.log('No languages data found or error:', err.message);
        }

        let workExperience = [];
        try {
            if (biography.length > 0) {
                const biografijaID = biography[0][0]; // BiografijaID
                const workExpResult = await connection.execute(
                    `SELECT ri.RadnoIskustvoID, ri.Kompanija, ri.Pozicija, ri.DatumOd, ri.DatumDo
                     FROM z6.RadnoIskustvo ri 
                     WHERE ri.BiografijaID = :biografijaID`,
                    { biografijaID: biografijaID }
                );
                workExperience = workExpResult.rows;
                console.log('Work experience data:', workExperience);
            }
        } catch (err) {
            console.log('No work experience data found or error:', err.message);
        }

        let parents = [];
        try {
            const parentsResult = await connection.execute(
                `SELECT r.RoditeljID, r.JMBG as JMBGRoditelja, r.Ime as ImeRoditelja, 
                        r.Prezime as PrezimeRoditelja, r.Kontakt as AdresaRoditelja
                 FROM z6.Roditelj r 
                 LEFT JOIN z6.SaglasnostRoditelja sr ON r.RoditeljID = sr.RoditeljID
                 LEFT JOIN z6.ZahtevZaPristupanje z ON sr.ClanskiBroj = z.ClanskiBroj
                 WHERE z.KandidatID = :id`,
                { id: id }
            );
            parents = parentsResult.rows;
            console.log('Parents data:', parents);
        } catch (err) {
            console.log('No parents data found or error:', err.message);
        }

        let fees = [];
        try {
            const feesResult = await connection.execute(
                `SELECT c.ClanarinaID, c.ClanZadrugeID, c.DatumUplate, c.IznosClanarine
                 FROM z6.Clanarina c 
                 WHERE c.ClanZadrugeID = :id
                 ORDER BY c.DatumUplate DESC`,
                { id: id }
            );
            fees = feesResult.rows;
            console.log('Fees data:', fees);
        } catch (err) {
            console.log('No fees data found or error:', err.message);
        }
        
        await connection.close();

        const memberData = {
            basic: {
                KandidatID: basicData[0],
                JMBG: basicData[1],
                Ime: basicData[2],
                Prezime: basicData[3],
                DatumRodjenja: basicData[4],
                Email: basicData[5],
                MobilniTelefon: basicData[6],
                FiksniTelefon: basicData[7],
                BrojLicneKarte: basicData[8],
                LBO: basicData[9],
                DatumVazenja: basicData[10]
            },
            education: education.map(row => ({
                ObrazovanjeID: row[0],
                NivoSS: row[1],
                Zvanje: row[2],
                NazivObrazovneUstanove: row[3]
            })),
            biography: biography.length > 0 ? {
                BiografijaID: biography[0][0],
                VozackaDozvola: biography[0][1],
                ITVestine: biography[0][2],
                ProfilIZanimanje: biography[0][3],
                NeformalnoObrazovanje: biography[0][4],
                RadniStatus: biography[0][5],
                Mejl: biography[0][6]
            } : null,
            languages: languages.map(row => ({
                ZnanjeJezikaID: row[0],
                NivoZnanja: row[1],
                NazivJezika: row[2]
            })),
            workExperience: workExperience.map(row => ({
                RadnoIskustvoID: row[0],
                Kompanija: row[1],
                Pozicija: row[2],
                DatumOd: row[3],
                DatumDo: row[4]
            })),
            parents: parents.map(row => ({
                RoditeljID: row[0],
                JMBGRoditelja: row[1],
                ImeRoditelja: row[2],
                PrezimeRoditelja: row[3],
                AdresaRoditelja: row[4]
            })),
            fees: fees.map(row => ({
                ClanarinaID: row[0],
                ClanZadrugeID: row[1],
                DatumUplate: row[2],
                IznosClanarine: row[3]
            }))
        };
        
        console.log('Final member data structure:', JSON.stringify(memberData, null, 2));
        res.json(memberData);
        
    } catch (err) {
        console.error('Error fetching member details:', err);
        res.status(500).json({ error: 'Greška pri dohvatanju detalja člana' });
    }
};

exports.createMemberFromCandidate = async (req, res) => {
    try {
        const { kandidatID } = req.body;
        
        const connection = await db.getConnection();

        const candidateCheck = await connection.execute(
            'SELECT KandidatID FROM z6.KandidatOsnovno WHERE KandidatID = :id',
            { id: kandidatID }
        );
        
        if (candidateCheck.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM z6.ClanZadruge WHERE ClanZadrugeID = :id',
            { id: kandidatID }
        );
        
        if (memberCheck.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ error: 'Kandidat je već član zadruge' });
        }

        await connection.execute(
            'INSERT INTO z6.ClanZadruge (ClanZadrugeID) VALUES (:id)',
            { id: kandidatID },
            { autoCommit: true }
        );
        
        await connection.close();
        res.status(201).json({ message: 'Član zadruge je uspešno kreiran!', memberID: kandidatID });
        
    } catch (err) {
        console.error('Error creating member from candidate:', err);
        res.status(500).json({ error: 'Greška pri kreiranju člana zadruge' });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('deleteMember called with ID:', id);
        
        const connection = await db.getConnection();

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM z6.ClanZadruge WHERE ClanZadrugeID = :id',
            { id: id }
        );
        
        console.log('Member check result:', memberCheck.rows);
        
        if (memberCheck.rows.length === 0) {
            await connection.close();
            console.log('Member not found:', id);
            return res.status(404).json({ error: 'Član nije pronađen' });
        }

        console.log('Deleting member:', id);

        await connection.execute(
            'DELETE FROM z6.ClanZadruge WHERE ClanZadrugeID = :id',
            { id: id },
            { autoCommit: true }
        );
        
        console.log('Member deleted successfully:', id);
        
        await connection.close();
        res.json({ message: 'Član zadruge je uspešno obrisan!' });
        
    } catch (err) {
        console.error('Error deleting member:', err);
        res.status(500).json({ error: 'Greška pri brisanju člana zadruge' });
    }
};

exports.updateMember = async (req, res) => {
    let connection;
    
    try {
        const { id } = req.params;
        const { basicData, biography, languageSkills } = req.body;
        
        console.log('Updating member:', id);
        console.log('Update data:', JSON.stringify(req.body, null, 2));
        
        connection = await db.getConnection();

        if (basicData) {
            await connection.execute(
                `UPDATE z6.KandidatOsnovno 
                 SET Ime = :ime, Prezime = :prezime, 
                     KontaktPodaci = z6.obj_kontakt(:email, :mobilniTelefon, :fiksniTelefon),
                     BrojLicneKarte = :brojLicneKarte, LBO = :lbo
                 WHERE KandidatID = :id`,
                {
                    ime: basicData.ime,
                    prezime: basicData.prezime,
                    email: basicData.email || null,
                    mobilniTelefon: basicData.mobilniTelefon || null,
                    fiksniTelefon: basicData.fiksniTelefon || null,
                    brojLicneKarte: basicData.brojLicneKarte || null,
                    lbo: basicData.lbo || null,
                    id: id
                },
                { autoCommit: false }
            );
            console.log('Updated basic data for member:', id);
        }

        if (biography) {

            const biografijaResult = await connection.execute(
                `SELECT b.BiografijaID FROM z6.Biografija b
                 JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
                 WHERE z.KandidatID = :id`,
                { id: id }
            );
            
            if (biografijaResult.rows.length > 0) {
                const biografijaID = biografijaResult.rows[0][0];
                
                await connection.execute(
                    `UPDATE z6.Biografija 
                     SET VozackaDozvola = :vozackaDozvola, ITVestine = :itVestine,
                         ProfilIZanimanje = :profilIZanimanje, NeformalnoObrazovanje = :neformalnoObrazovanje,
                         RadniStatus = :radniStatus
                     WHERE BiografijaID = :biografijaID`,
                    {
                        vozackaDozvola: biography.vozackaDozvola ? 1 : 0,
                        itVestine: biography.itVestine || null,
                        profilIZanimanje: biography.profilIZanimanje || null,
                        neformalnoObrazovanje: biography.neformalnoObrazovanje || null,
                        radniStatus: biography.radniStatus || 'nezaposleni',
                        biografijaID: biografijaID
                    },
                    { autoCommit: false }
                );
                console.log('Updated biography for member:', id);

                if (languageSkills && Array.isArray(languageSkills)) {

                    await connection.execute(
                        'DELETE FROM z6.ZnanjeJezika WHERE BiografijaID = :biografijaID',
                        { biografijaID: biografijaID },
                        { autoCommit: false }
                    );

                    for (const skill of languageSkills) {
                        if (skill.straniJezikID && skill.nivoZnanja) {
                            await connection.execute(
                                `INSERT INTO z6.ZnanjeJezika (BiografijaID, StraniJezikID, NivoZnanja) 
                                 VALUES (:biografijaID, :straniJezikID, :nivoZnanja)`,
                                {
                                    biografijaID: biografijaID,
                                    straniJezikID: skill.straniJezikID,
                                    nivoZnanja: skill.nivoZnanja
                                },
                                { autoCommit: false }
                            );
                        }
                    }
                    console.log('Updated language skills for member:', id);
                }
            } else {
                console.log('No biography found for member:', id);
            }
        }
        
        await connection.commit();
        console.log('Successfully updated member:', id);
        
        res.json({ message: 'Podaci člana su uspešno ažurirani!', memberID: id });
        
    } catch (err) {
        console.error('Error updating member:', err);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr);
            }
        }
        res.status(500).json({ error: 'Greška pri ažuriranju podataka člana: ' + err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
};
