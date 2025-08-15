const db = require('../db/db');

exports.createMemberWithData = async (req, res) => {
    let connection;
    
    try {
        const { kandidatID, parentConsent, parent, authorizedPerson, accessDeclaration, biography } = req.body;
        
        console.log('Adding data to candidate and creating member for kandidatID:', kandidatID);
        
        connection = await db.getConnection();

        const candidateCheck = await connection.execute(
            'SELECT KandidatID FROM KandidatOsnovno WHERE KandidatID = :id',
            { id: kandidatID }
        );
        
        if (candidateCheck.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM ClanZadruge WHERE ClanZadrugeID = :id',
            { id: kandidatID }
        );

        if (memberCheck.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ error: 'Kandidat je već član zadruge' });
        }

        let roditeljID = null;
        if (parentConsent?.potrebnaSaglasnost && parent?.ime) {
            const parentResult = await connection.execute(
                `INSERT INTO Roditelj (JMBG, Ime, Prezime, Kontakt) 
                 VALUES (:jmbg, :ime, :prezime, :kontakt)
                 RETURNING RoditeljID INTO :id`,
                {
                    jmbg: parent.jmbg || null,
                    ime: parent.ime,
                    prezime: parent.prezime || null,
                    kontakt: parent.kontakt || null,
                    id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT }
                },
                { autoCommit: false }
            );
            roditeljID = parentResult.outBinds.id[0];
            console.log('Created parent with ID:', roditeljID);
        }

        let ovlascenoLiceID = null;
        if (authorizedPerson?.ime) {
            const authorizedResult = await connection.execute(
                `INSERT INTO OvlascenoLice (JMBG, Ime, Prezime) 
                 VALUES (:jmbg, :ime, :prezime)
                 RETURNING OvlascenoLiceID INTO :id`,
                {
                    jmbg: authorizedPerson.jmbg,
                    ime: authorizedPerson.ime,
                    prezime: authorizedPerson.prezime,
                    id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT }
                },
                { autoCommit: false }
            );
            ovlascenoLiceID = authorizedResult.outBinds.id[0];
            console.log('Created authorized person with ID:', ovlascenoLiceID);
        }

        const zahtevResult = await connection.execute(
            `INSERT INTO ZahtevZaPristupanje (DatumUpisa, OsnovZaClanstvo, KandidatID, RoditeljID)
             VALUES (SYSDATE, :osnovZaClanstvo, :kandidatID, :roditeljID)
             RETURNING ClanskiBroj INTO :clanskiBroj`,
            { 
                osnovZaClanstvo: biography?.radniStatus || 'nezaposleni',
                kandidatID: kandidatID,
                roditeljID: roditeljID,
                clanskiBroj: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT }
            },
            { autoCommit: false }
        );
        const clanskiBroj = zahtevResult.outBinds.clanskiBroj[0];
        console.log('Created zahtev with ClanskiBroj:', clanskiBroj);

        await connection.execute(
            `INSERT INTO Biografija (VozackaDozvola, ITVestine, ProfilIZanimanje, 
                                   NeformalnoObrazovanje, DatumUpisa, RadniStatus, ClanskiBroj)
             VALUES (:vozackaDozvola, :itVestine, :profilIZanimanje, 
                     :neformalnoObrazovanje, SYSDATE, :radniStatus, :clanskiBroj)`,
            {
                vozackaDozvola: biography?.vozackaDozvola ? 1 : 0,
                itVestine: biography?.itVestine || null,
                profilIZanimanje: biography?.profilIZanimanje || null,
                neformalnoObrazovanje: biography?.neformalnoObrazovanje || null,
                radniStatus: biography?.radniStatus || 'nezaposleni',
                clanskiBroj: clanskiBroj
            },
            { autoCommit: false }
        );

        if (parentConsent?.potrebnaSaglasnost && roditeljID) {
            await connection.execute(
                `INSERT INTO SaglasnostRoditelja (DatumPotpisivanja, ClanskiBroj, RoditeljID)
                 VALUES (SYSDATE, :clanskiBroj, :roditeljID)`,
                {
                    clanskiBroj: clanskiBroj,
                    roditeljID: roditeljID
                },
                { autoCommit: false }
            );
        }

        if (ovlascenoLiceID) {
            await connection.execute(
                `INSERT INTO PristupnaIzjava (ClanskiBroj, OvlascenoLiceID, DatumPotpisa)
                 VALUES (:clanskiBroj, :ovlascenoLiceID, TO_DATE(:datumPotpisa, 'YYYY-MM-DD'))`,
                {
                    clanskiBroj: clanskiBroj,
                    ovlascenoLiceID: ovlascenoLiceID,
                    datumPotpisa: accessDeclaration?.datumPotpisa || new Date().toISOString().split('T')[0]
                },
                { autoCommit: false }
            );
        }

        await connection.commit();
        console.log('Successfully created member and all related data');
        
        res.status(201).json({ 
            message: 'Član zadruge je uspešno kreiran sa svim podacima!',
            memberID: kandidatID,
            clanskiBroj: clanskiBroj
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
            `SELECT cz.ClanZadrugeID, ko.Ime, ko.Prezime, ko.JMBG, ko.KontaktPodaci
             FROM ClanZadruge cz
             JOIN KandidatOsnovno ko ON cz.ClanZadrugeID = ko.KandidatID
             ORDER BY ko.Ime, ko.Prezime`
        );
        
        await connection.close();
        res.json(result.rows.map(row => ({
            ClanZadrugeID: row[0],
            Ime: row[1],
            Prezime: row[2],
            JMBG: row[3],
            KontaktPodaci: row[4]
        })));
    } catch (err) {
        console.error('Error fetching members:', err);
        res.status(500).json({ error: 'Greška pri dohvatanju članova' });
    }
};

exports.createMember = async (req, res) => {
    try {
        const { kandidatID } = req.body;
        
        const connection = await db.getConnection();

        const candidateCheck = await connection.execute(
            'SELECT KandidatID FROM KandidatOsnovno WHERE KandidatID = :id',
            { id: kandidatID }
        );
        
        if (candidateCheck.rows.length === 0) {
            await connection.close();
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const memberCheck = await connection.execute(
            'SELECT ClanZadrugeID FROM ClanZadruge WHERE ClanZadrugeID = :id',
            { id: kandidatID }
        );
        
        if (memberCheck.rows.length > 0) {
            await connection.close();
            return res.status(400).json({ error: 'Kandidat je već član zadruge' });
        }

        await connection.execute(
            'INSERT INTO ClanZadruge (ClanZadrugeID) VALUES (:id)',
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
