const db = require('../db/db');

exports.getAllCandidates = async (req, res) => {
    try {

        const allCandidatesResult = await db.query(`
            SELECT COUNT(*) as total FROM z6.KandidatOsnovno
        `);
        console.log('Total candidates in database:', allCandidatesResult.rows[0][0]);

        const membersResult = await db.query(`
            SELECT COUNT(*) as total FROM z6.ClanZadruge
        `);
        console.log('Total members in database:', membersResult.rows[0][0]);
        
        const result = await db.query(`
            SELECT 
                k.KandidatID, 
                k.JMBG, 
                k.Ime, 
                k.Prezime, 
                k.DatumRodjenja, 
                k.KontaktPodaci.Mejl as Email, 
                k.KontaktPodaci.MobilniTelefon as Telefon,
                k.KontaktPodaci.FiksniTelefon as FiksniTelefon,
                k.BrojLicneKarte, 
                k.LBO
            FROM z6.KandidatOsnovno k
            WHERE k.KandidatID NOT IN (
                SELECT ClanZadrugeID FROM z6.ClanZadruge
            )
            ORDER BY k.KandidatID
        `);
        
        console.log('Available candidates (not members):', result.rows.length);
        console.log('Candidate IDs returned:', result.rows.map(row => row[0]));
        res.json(result.rows);
    } catch (err) {
        console.error('Error in getAllCandidates:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.searchCandidates = async (req, res) => {
    try {

        const candidatesResult = await db.query(`
            SELECT 
                k.KandidatID, 
                k.JMBG, 
                k.Ime, 
                k.Prezime, 
                k.DatumRodjenja, 
                k.KontaktPodaci.MobilniTelefon as MobilniTelefon,
                k.KontaktPodaci.FiksniTelefon as FiksniTelefon,
                k.KontaktPodaci.Mejl as Email,
                k.BrojLicneKarte, 
                k.LBO
            FROM z6.KandidatOsnovno k
            ORDER BY k.KandidatID
        `);

        const candidates = [];

        for (const candidate of candidatesResult.rows) {
            const candidateId = candidate[0];

            const educationResult = await db.query(`
                SELECT o.*, ou.NazivObrazovneUstanove 
                FROM z6.Obrazovanje o 
                LEFT JOIN z6.ObrazovnaUstanova ou ON o.ObrazovnaUstanovaID = ou.ObrazovnaUstanovaID 
                WHERE o.KandidatID = :id
            `, [candidateId]);

            const languagesResult = await db.query(`
                SELECT zj.*, sj.NazivJezika 
                FROM z6.ZnanjeJezika zj 
                LEFT JOIN z6.StraniJezik sj ON zj.StraniJezikID = sj.StraniJezikID 
                WHERE zj.BiografijaID IN (
                    SELECT b.BiografijaID FROM z6.Biografija b 
                    LEFT JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj 
                    WHERE z.KandidatID = :id
                )
            `, [candidateId]);

            const candidateWithDetails = {
                ...candidate,
                0: candidate[0], // Array format za kompatibilnost
                1: candidate[1],
                2: candidate[2],
                3: candidate[3],
                4: candidate[4],
                5: candidate[5],
                6: candidate[6],
                7: candidate[7],
                8: candidate[8],
                9: candidate[9],
                education: educationResult.rows.length > 0 ? {
                    ObrazovnaUstanovaID: educationResult.rows[0][1],
                    NazivObrazovneUstanove: educationResult.rows[0][4],
                    NivoSS: educationResult.rows[0][2],
                    Zvanje: educationResult.rows[0][3]
                } : null,
                languages: languagesResult.rows.map(row => ({
                    StraniJezikID: row[1],
                    NazivJezika: row[3],
                    NivoZnanja: row[2]
                }))
            };

            candidates.push(candidateWithDetails);
        }

        res.json(candidates);
    } catch (err) {
        console.error('Error in searchCandidates:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getCandidateById = async (req, res) => {
    const id = req.params.id;
    console.log('getCandidateById called with ID:', id);
    
    try {

        const candidateResult = await db.query(`
            SELECT 
                ko.KandidatID, 
                ko.JMBG, 
                ko.Ime, 
                ko.Prezime, 
                ko.DatumRodjenja, 
                ko.KontaktPodaci.MobilniTelefon as MobilniTelefon,
                ko.KontaktPodaci.FiksniTelefon as FiksniTelefon,
                ko.KontaktPodaci.Mejl as Email,
                ko.BrojLicneKarte, 
                ko.LBO
            FROM z6.KandidatOsnovno ko 
            WHERE ko.KandidatID = :id
        `, [id]);
        
        if (candidateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Kandidat nije pronađen' });
        }

        const candidate = candidateResult.rows[0];
        
        console.log('Candidate data from DB:', candidate);

        const additionalResult = await db.query(`
            SELECT PrivremeniBoravak, SklonostKaPoslovima, BrojTekucegRacuna
            FROM z6.KandidatDodatno 
            WHERE KandidatID = :id
        `, [id]);
        
        const additionalData = additionalResult.rows.length > 0 ? additionalResult.rows[0] : [null, null, null];
        
        console.log('Additional data from DB:', additionalData);

        const educationResult = await db.query(`
            SELECT o.*, ou.NazivObrazovneUstanove 
            FROM z6.Obrazovanje o 
            LEFT JOIN z6.ObrazovnaUstanova ou ON o.ObrazovnaUstanovaID = ou.ObrazovnaUstanovaID 
            WHERE o.KandidatID = :id
        `, [id]);

        const languagesResult = await db.query(`
            SELECT zj.*, sj.NazivJezika 
            FROM z6.ZnanjeJezika zj 
            LEFT JOIN z6.StraniJezik sj ON zj.StraniJezikID = sj.StraniJezikID 
            WHERE zj.BiografijaID IN (
                SELECT b.BiografijaID FROM z6.Biografija b 
                LEFT JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj 
                WHERE z.KandidatID = :id
            )
        `, [id]);

        const response = {

            jmbg: candidate[1],
            ime: candidate[2], 
            prezime: candidate[3],
            datumRodjenja: candidate[4],
            telefon: candidate[5], // mobilniTelefon kao telefon
            email: candidate[7],
            brojLicneKarte: candidate[8],
            lbo: candidate[9],

            privremeniBoravak: additionalData[0],
            sklonostKaPoslovima: additionalData[1], 
            brojTekucegRacuna: additionalData[2],

            education: educationResult.rows.length > 0 ? {
                obrazovnaUstanovaID: educationResult.rows[0][1],
                nazivObrazovneUstanove: educationResult.rows[0][4],
                stepenStudija: educationResult.rows[0][2],
                zvanje: educationResult.rows[0][3]
            } : null,

            languages: languagesResult.rows.map(row => ({
                straniJezikID: row[1],
                nazivJezika: row[3],
                nivoZnanja: row[2]
            }))
        };

        console.log('Response being sent:', response);
        res.json(response);
    } catch (err) {
        console.error('Error in getCandidateById:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.createCandidate = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const candidateData = req.body;
        
        console.log('Creating candidate with data:', JSON.stringify(candidateData, null, 2));
        console.log('BrojLicneKarte:', candidateData.brojLicneKarte);
        console.log('LBO:', candidateData.lbo);

        const candidateSQL = `
            INSERT INTO KandidatOsnovno (JMBG, Ime, Prezime, DatumRodjenja, KontaktPodaci, BrojLicneKarte, LBO)
            VALUES (:jmbg, :ime, :prezime, TO_DATE(:datumRodjenja, 'YYYY-MM-DD'), 
                    z6.obj_kontakt(:email, :mobilniTelefon, :fiksniTelefon), :brojLicneKarte, :lbo)
        `;
        
        const bindParams = {
            jmbg: candidateData.jmbg,
            ime: candidateData.ime,
            prezime: candidateData.prezime,
            datumRodjenja: candidateData.datumRodjenja,
            mobilniTelefon: candidateData.telefon || null,
            fiksniTelefon: null, // CandidateForm ne koristi fiksni telefon
            email: candidateData.email || null,
            brojLicneKarte: candidateData.brojLicneKarte || null,
            lbo: candidateData.lbo || null
        };
        
        console.log('SQL bind parameters:', bindParams);
        
        await connection.execute(candidateSQL, bindParams, { autoCommit: false });

        const candidateIdResult = await connection.execute(
            'SELECT KandidatID FROM KandidatOsnovno WHERE JMBG = :jmbg',
            { jmbg: candidateData.jmbg }
        );
        const candidateID = candidateIdResult.rows[0][0];

        if (candidateData.privremeniBoravak || candidateData.sklonostKaPoslovima || candidateData.brojTekucegRacuna) {
            const additionalSQL = `
                INSERT INTO KandidatDodatno (KandidatID, PrivremeniBoravak, SklonostKaPoslovima, BrojTekucegRacuna)
                VALUES (:kandidatID, :privremeniBoravak, :sklonostKaPoslovima, :brojTekucegRacuna)
            `;
            
            await connection.execute(additionalSQL, {
                kandidatID: candidateID,
                privremeniBoravak: candidateData.privremeniBoravak || null,
                sklonostKaPoslovima: candidateData.sklonostKaPoslovima || null,
                brojTekucegRacuna: candidateData.brojTekucegRacuna || null
            }, { autoCommit: false });
        }

        if (candidateData.education && candidateData.education.obrazovnaUstanovaID) {
            const educationSQL = `
                INSERT INTO Obrazovanje (KandidatID, ObrazovnaUstanovaID, NivoSS, Zvanje)
                VALUES (:kandidatID, :ustanovaID, :stepenStudija, :zvanje)
            `;
            
            await connection.execute(educationSQL, {
                kandidatID: candidateID,
                ustanovaID: candidateData.education.obrazovnaUstanovaID,
                stepenStudija: candidateData.education.stepenStudija || 'N/A',
                zvanje: candidateData.education.zvanje || 'N/A'
            }, { autoCommit: false });
        }

        if (candidateData.languages && Array.isArray(candidateData.languages) && candidateData.languages.length > 0) {

            let biografijaID;
            try {

                const biografijaResult = await connection.execute(`
                    SELECT b.BiografijaID FROM z6.Biografija b
                    LEFT JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
                    WHERE z.KandidatID = :kandidatID
                `, { kandidatID: candidateID });

                if (biografijaResult.rows.length > 0) {
                    biografijaID = biografijaResult.rows[0][0];
                } else {

                    await connection.execute(`
                        INSERT INTO z6.Biografija (ClanskiBroj, StatusZaposlenja)
                        VALUES (biografija_seq.NEXTVAL, 'Nezaposlen')
                    `, {}, { autoCommit: false });

                    const newBiografijaResult = await connection.execute(`
                        SELECT biografija_seq.CURRVAL FROM DUAL
                    `);
                    biografijaID = newBiografijaResult.rows[0][0];

                    await connection.execute(`
                        INSERT INTO z6.ZahtevZaPristupanje (KandidatID, ClanskiBroj, DatumZahteva, Status)
                        VALUES (:kandidatID, :clanskiBroj, SYSDATE, 'na_cekanju')
                    `, { 
                        kandidatID: candidateID, 
                        clanskiBroj: biografijaID 
                    }, { autoCommit: false });
                }

                for (const lang of candidateData.languages) {
                    await connection.execute(`
                        INSERT INTO z6.ZnanjeJezika (BiografijaID, StraniJezikID, NivoZnanja)
                        VALUES (:biografijaID, :straniJezikID, :nivoZnanja)
                    `, {
                        biografijaID: biografijaID,
                        straniJezikID: lang.straniJezikID,
                        nivoZnanja: lang.nivoZnanja
                    }, { autoCommit: false });
                }
            } catch (err) {
                console.error('Error with languages:', err);

            }
        }

        await connection.commit();
        
        res.status(201).json({ 
            message: 'Kandidat je uspešno kreiran!', 
            candidateId: candidateID 
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error creating candidate:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await connection.close();
    }
};

exports.updateCandidate = async (req, res) => {
    const id = req.params.id;
    const candidateData = req.body;
    const connection = await db.getConnection();
    
    try {

        const candidateSQL = `
            UPDATE z6.KandidatOsnovno 
            SET JMBG = :jmbg, 
                Ime = :ime, 
                Prezime = :prezime, 
                DatumRodjenja = TO_DATE(:datumRodjenja, 'YYYY-MM-DD'),
                KontaktPodaci = z6.obj_kontakt(:email, :mobilniTelefon, :fiksniTelefon),
                BrojLicneKarte = :brojLicneKarte,
                LBO = :lbo
            WHERE KandidatID = :id
        `;
        
        await connection.execute(candidateSQL, {
            id: id,
            jmbg: candidateData.jmbg,
            ime: candidateData.ime,
            prezime: candidateData.prezime,
            datumRodjenja: candidateData.datumRodjenja,
            mobilniTelefon: candidateData.telefon || null,
            fiksniTelefon: null,
            email: candidateData.email || null,
            brojLicneKarte: candidateData.brojLicneKarte || null,
            lbo: candidateData.lbo || null
        }, { autoCommit: false });

        const updateAdditionalSQL = `
            UPDATE z6.KandidatDodatno 
            SET PrivremeniBoravak = :privremeniBoravak,
                SklonostKaPoslovima = :sklonostKaPoslovima,
                BrojTekucegRacuna = :brojTekucegRacuna
            WHERE KandidatID = :id
        `;
        
        const updateResult = await connection.execute(updateAdditionalSQL, {
            id: id,
            privremeniBoravak: candidateData.privremeniBoravak || null,
            sklonostKaPoslovima: candidateData.sklonostKaPoslovima || null,
            brojTekucegRacuna: candidateData.brojTekucegRacuna || null
        }, { autoCommit: false });

        if (updateResult.rowsAffected === 0) {
            const insertAdditionalSQL = `
                INSERT INTO z6.KandidatDodatno (KandidatID, PrivremeniBoravak, SklonostKaPoslovima, BrojTekucegRacuna)
                VALUES (:id, :privremeniBoravak, :sklonostKaPoslovima, :brojTekucegRacuna)
            `;
            
            await connection.execute(insertAdditionalSQL, {
                id: id,
                privremeniBoravak: candidateData.privremeniBoravak || null,
                sklonostKaPoslovima: candidateData.sklonostKaPoslovima || null,
                brojTekucegRacuna: candidateData.brojTekucegRacuna || null
            }, { autoCommit: false });
        }

        if (candidateData.education && candidateData.education.obrazovnaUstanovaID) {

            await connection.execute(
                'DELETE FROM z6.Obrazovanje WHERE KandidatID = :id',
                { id: id },
                { autoCommit: false }
            );

            const educationSQL = `
                INSERT INTO z6.Obrazovanje (KandidatID, ObrazovnaUstanovaID, NivoSS, Zvanje)
                VALUES (:kandidatID, :ustanovaID, :stepenStudija, :zvanje)
            `;
            
            await connection.execute(educationSQL, {
                kandidatID: id,
                ustanovaID: candidateData.education.obrazovnaUstanovaID,
                stepenStudija: candidateData.education.stepenStudija || null,
                zvanje: candidateData.education.zvanje || null
            }, { autoCommit: false });
        }

        if (candidateData.languages && Array.isArray(candidateData.languages)) {

            await connection.execute(`
                DELETE FROM z6.ZnanjeJezika 
                WHERE BiografijaID IN (
                    SELECT b.BiografijaID FROM z6.Biografija b
                    LEFT JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
                    WHERE z.KandidatID = :id
                )
            `, { id: id }, { autoCommit: false });

            if (candidateData.languages.length > 0) {

                const biografijaResult = await connection.execute(`
                    SELECT b.BiografijaID FROM z6.Biografija b
                    LEFT JOIN z6.ZahtevZaPristupanje z ON b.ClanskiBroj = z.ClanskiBroj
                    WHERE z.KandidatID = :id
                `, { id: id });

                if (biografijaResult.rows.length > 0) {
                    const biografijaID = biografijaResult.rows[0][0];

                    for (const lang of candidateData.languages) {
                        await connection.execute(`
                            INSERT INTO z6.ZnanjeJezika (BiografijaID, StraniJezikID, NivoZnanja)
                            VALUES (:biografijaID, :straniJezikID, :nivoZnanja)
                        `, {
                            biografijaID: biografijaID,
                            straniJezikID: lang.straniJezikID,
                            nivoZnanja: lang.nivoZnanja
                        }, { autoCommit: false });
                    }
                }
            }
        }

        await connection.commit();
        
        res.json({ 
            message: 'Kandidat je uspešno ažuriran!', 
            candidateId: id 
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error updating candidate:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await connection.close();
    }
};

exports.deleteCandidate = async (req, res) => {
    const id = req.params.id;
    const connection = await db.getConnection();
    
    try {

        await connection.execute(
            'DELETE FROM z6.Obrazovanje WHERE KandidatID = :id',
            { id: id }
        );

        await connection.execute(
            'DELETE FROM z6.KandidatDodatno WHERE KandidatID = :id', 
            { id: id }
        );

        const zahtevResult = await connection.execute(
            'SELECT ClanskiBroj FROM z6.ZahtevZaPristupanje WHERE KandidatID = :id',
            { id: id }
        );
        
        if (zahtevResult.rows.length > 0) {
            const clanskiBroj = zahtevResult.rows[0][0];

            const biografijaResult = await connection.execute(
                'SELECT BiografijaID FROM z6.Biografija WHERE ClanskiBroj = :clanskiBroj',
                { clanskiBroj: clanskiBroj }
            );
            
            if (biografijaResult.rows.length > 0) {
                const biografijaID = biografijaResult.rows[0][0];

                await connection.execute(
                    'DELETE FROM z6.ZnanjeJezika WHERE BiografijaID = :biografijaID',
                    { biografijaID: biografijaID }
                );

                await connection.execute(
                    'DELETE FROM z6.Biografija WHERE BiografijaID = :biografijaID',
                    { biografijaID: biografijaID }
                );
            }

            await connection.execute(
                'DELETE FROM z6.ZahtevZaPristupanje WHERE KandidatID = :id',
                { id: id }
            );
        }

        await connection.execute(
            'DELETE FROM z6.KandidatOsnovno WHERE KandidatID = :id',
            { id: id }
        );
        
        await connection.commit();
        res.json({ message: 'Kandidat je uspešno obrisan' });
    } catch (err) {
        await connection.rollback();
        console.error('Greška pri brisanju kandidata:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};
